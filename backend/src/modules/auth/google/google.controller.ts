import { Request, Response } from 'express';
import { GoogleAuthService } from './google.service';
import { setAuthCookies } from '../../../utils/cookies';
import { AppError } from '../../../utils/AppError';
import { env } from '../../../config/env';

/**
 * Google OAuth Controller
 * Handles HTTP requests for Google authentication
 */
export class GoogleAuthController {
  /**
   * POST /auth/google/login
   * Frontend sends Google ID token
   * Returns user data and sets auth cookies
   */
  static async login(req: Request, res: Response) {
    const { token } = req.body;

    if (!token) {
      console.warn('Google login request missing token');
      throw new AppError('Google token is required', 400);
    }

    try {
      console.log('Processing Google login with token (first 50 chars):', token.substring(0, 50) + '...');
      
      const { user, accessToken, refreshToken } =
        await GoogleAuthService.authenticateWithGoogle(token);

      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error: any) {
      console.error('Google login error:', {
        message: error?.message,
        statusCode: error?.statusCode,
      });
      throw error;
    }
  }

  /**
   * GET /auth/google/auth-url
   * Get Google authorization URL
   * Frontend redirects user to this URL
   */
  static async getAuthUrl(req: Request, res: Response) {
    const redirectUri = `${env.CLIENT_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    const authUrl = GoogleAuthService.getGoogleAuthUrl(redirectUri);

    res.json({ authUrl });
  }

  /**
   * POST /auth/google/callback
   * Handle Google OAuth callback
   * Frontend exchanges authorization code for ID token
   */
  static async callback(req: Request, res: Response) {
    const { code } = req.body;

    if (!code) {
      throw new AppError('Authorization code is required', 400);
    }

    const redirectUri = `${env.CLIENT_URL || 'http://localhost:3000'}/api/auth/google/callback`;

    try {
      console.log('Processing Google callback with code:', code.substring(0, 30) + '...');
      console.log('Redirect URI:', redirectUri);

      const tokens =
        await GoogleAuthService.exchangeCodeForTokens(code, redirectUri);

      console.log('Tokens received. Has id_token:', !!tokens.id_token);
      console.log('Token keys:', Object.keys(tokens));

      if (!tokens.id_token) {
        throw new AppError('No ID token in response', 401);
      }

      // Authenticate user with ID token
      const { user, accessToken, refreshToken } =
        await GoogleAuthService.authenticateWithGoogle(tokens.id_token);

      setAuthCookies(res, accessToken, refreshToken);

      res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error: any) {
      console.error('Google callback error:', {
        message: error?.message,
        statusCode: error?.statusCode,
        code: error?.code,
        errorDetails: error?.details,
        stack: error?.stack,
      });
      
      // Re-throw AppError if it's already an AppError
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError('Failed to process Google callback', 401);
    }
  }
}
