import { OAuth2Client } from 'google-auth-library';
import { env } from '../../../config/env';
import { db } from '../../../db';
import { users } from '../../../db/schema/auth/users';
import { refreshTokens } from '../../../db/schema/auth/refreshToken';
import { hashToken } from '../../../utils/hash';
import {
  signAccessToken,
  signRefreshToken,
} from '../../../utils/jwt';
import { eq } from 'drizzle-orm';
import { AppError } from '../../../utils/AppError';

/**
 * Google OAuth Service
 * Handles Google authentication flow and token verification
 */
export class GoogleAuthService {
  private static client = new OAuth2Client(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
  );

  /**
   * Verify Google ID token
   * @param token - Google ID token from frontend
   * @returns Verified token payload
   */
  static async verifyGoogleToken(token: string) {
    try {
      // Validate required environment variables
      if (!env.GOOGLE_CLIENT_ID) {
        console.error('GOOGLE_CLIENT_ID environment variable is not set');
        throw new AppError('Google OAuth is not configured', 500);
      }

      if (!token) {
        throw new AppError('Token is required', 400);
      }

      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload) {
        throw new AppError('Invalid Google token payload', 401);
      }

      return payload;
    } catch (error: any) {
      // Log the actual error for debugging
      console.error('Google token verification error:', {
        message: error?.message,
        code: error?.code,
        errorDetails: error?.details,
      });

      // Re-throw AppError if it's already an AppError
      if (error instanceof AppError) {
        throw error;
      }

      // Provide more specific error messages
      if (error?.message?.includes('Token used too early')) {
        throw new AppError('Google token not yet valid', 401);
      }

      if (error?.message?.includes('Token is expired')) {
        throw new AppError('Google token has expired', 401);
      }

      if (error?.message?.includes('Invalid token')) {
        throw new AppError('Invalid Google token format', 401);
      }

      throw new AppError('Google token verification failed', 401);
    }
  }

  /**
   * Authenticate user with Google
   * Creates user if doesn't exist, logs in if exists
   * @param googleToken - Google ID token from frontend
   * @returns User, access token, and refresh token
   */
  static async authenticateWithGoogle(googleToken: string) {
    // Verify the Google token
    const payload = await this.verifyGoogleToken(googleToken);

    const googleId = payload.sub;
    const email = payload.email;

    if (!googleId || !email) {
      throw new AppError('Invalid Google token data', 401);
    }

    // Check if user exists with this Google ID
    let user = await db.query.users.findFirst({
      where: eq(users.googleId, googleId),
    });

    // If no user with Google ID, check if email exists (for account linking)
    if (!user) {
      user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (user) {
        // Link Google account to existing user
        await db
          .update(users)
          .set({
            googleId,
            provider: 'google', // Could be 'local+google' if supporting multi-provider login
          })
          .where(eq(users.id, user.id));

        // Refetch user to get updated fields
        const updatedUser = await db.query.users.findFirst({
          where: eq(users.id, user.id),
        });

        if (updatedUser) {
          user = updatedUser;
        }
      } else {
        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            email,
            googleId,
            fullName: payload.name,
            provider: 'google',
            // No passwordHash for OAuth users
          })
          .returning();

        user = newUser;
      }
    }

    if (!user) {
      throw new AppError('Failed to authenticate user', 500);
    }

    // Generate tokens
    const accessToken = signAccessToken(user.id);
    const refreshToken = signRefreshToken(user.id);
    const hashedRefreshToken = hashToken(refreshToken);

    // Store hashed refresh token in DB
    await db.insert(refreshTokens).values({
      userId: user.id,
      tokenHash: hashedRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Get Google authorization URL for frontend to use
   * Frontend redirects user to this URL
   * @returns Authorization URL
   */
  static getGoogleAuthUrl(redirectUri: string) {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const url = this.client.generateAuthUrl({
      access_type: 'offline', // Get refresh token
      scope: scopes,
      redirect_uri: redirectUri,
      prompt: 'consent', // Force consent screen
    });

    return url;
  }

  /**
   * Exchange authorization code for tokens
   * Backend uses this to get tokens from Google
   * @param code - Authorization code from Google callback
   * @param redirectUri - Redirect URI used in initial request
   * @returns Access token and ID token
   */
  static async exchangeCodeForTokens(
    code: string,
    redirectUri: string,
  ) {
    try {
      console.log('Exchanging authorization code for tokens...', {
        codeLength: code.length,
        redirectUri,
        clientId: env.GOOGLE_CLIENT_ID ? 'set' : 'NOT SET',
        clientSecret: env.GOOGLE_CLIENT_SECRET ? 'set' : 'NOT SET',
      });

      const { tokens } = await this.client.getToken({
        code,
        redirect_uri: redirectUri,
      });

      console.log('Successfully exchanged code for tokens. Token keys:', Object.keys(tokens));

      if (!tokens.id_token) {
        console.warn('Warning: id_token not in response. Available tokens:', Object.keys(tokens));
      }

      return tokens;
    } catch (error: any) {
      console.error('Google token exchange error:', {
        message: error?.message,
        code: error?.code,
        errorDetails: error?.details,
        statusCode: error?.status,
      });

      // Provide specific error messages for common issues
      if (error?.message?.includes('invalid_grant')) {
        console.error('Authorization code error: Code is invalid, expired, or already used');
        throw new AppError('Authorization code is invalid or has expired. Please try logging in again.', 401);
      }

      if (error?.message?.includes('redirect_uri_mismatch')) {
        console.error('Redirect URI mismatch. Check that frontend redirect URI matches Google Cloud Console');
        throw new AppError('Redirect URI configuration mismatch', 500);
      }

      throw new AppError('Failed to exchange authorization code', 401);
    }
  }
}
