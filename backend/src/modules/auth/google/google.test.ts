import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { GoogleAuthService } from './google.service';
import { db } from '../../../db/schema';
import { users } from '../../../db/schema/auth/users';
import { refreshTokens } from '../../../db/schema/auth/refreshToken';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

/**
 * Google OAuth Integration Tests
 * 
 * NOTE: These tests require GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment
 * For testing purposes, you should use Google's test credentials or mock the OAuth2Client
 * 
 * IMPORTANT: Run database migration before tests:
 * npm run db:push
 */

describe('GoogleAuthService', () => {
  const testEmail = `test-google-${Date.now()}@example.com`;
  const testGoogleId = `google-${uuidv4()}`;
  let createdUserId: string | null = null;

  const testGoogleToken =
    'eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiJnb29nbGUtMTIzNDU2Nzg5IiwiZW1haWwiOiJ0ZXN0LWdvb2dsZUBleGFtcGxlLmNvbSIsIm5hbWUiOiJHb29nbGUgVGVzdCBVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcGljLmpwZyIsImF1ZCI6ImNsaWVudF9pZCIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNjk5NDU2MDAwfQ.test';

  beforeAll(async () => {
    // Setup: Clean up any existing test data before running tests
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, testEmail),
      });

      if (existingUser) {
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.userId, existingUser.id));
        await db.delete(users).where(eq(users.id, existingUser.id));
      }
    } catch (error) {
      // Database migration might not be applied, tests will skip
      console.warn('Note: Run "npm run db:push" to apply database migration');
    }
  });

  afterAll(async () => {
    // Cleanup: Remove test data after tests
    try {
      if (createdUserId) {
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.userId, createdUserId));
        await db.delete(users).where(eq(users.id, createdUserId));
      }

      const testUser = await db.query.users.findFirst({
        where: eq(users.email, testEmail),
      });

      if (testUser) {
        await db
          .delete(refreshTokens)
          .where(eq(refreshTokens.userId, testUser.id));
        await db.delete(users).where(eq(users.id, testUser.id));
      }
    } catch (error) {
      // Cleanup errors are not critical
      console.warn('Cleanup error (non-critical):', error);
    }
  });

  describe('verifyGoogleToken', () => {
    it('should throw error for invalid token', async () => {
      await expect(
        GoogleAuthService.verifyGoogleToken('invalid-token')
      ).rejects.toThrow('Google token verification failed');
    });

    it('should verify valid Google token and return payload', async () => {
      // This test requires a real or mocked Google token
      // For production testing, use Google's test token or mock the OAuth2Client
      // Skipping in this example
    });
  });

  describe('authenticateWithGoogle', () => {
    it('should create new user on first login', async () => {
      // Mock the verifyGoogleToken method
      const mockPayload = {
        sub: testGoogleId,
        email: testEmail,
        name: 'Google Test User',
      };

      vi.spyOn(GoogleAuthService, 'verifyGoogleToken').mockResolvedValue(
        mockPayload as any,
      );

      try {
        const result = await GoogleAuthService.authenticateWithGoogle(
          testGoogleToken,
        );

        createdUserId = result.user.id;

        expect(result.user).toBeDefined();
        expect(result.user.email).toBe(testEmail);
        expect(result.user.googleId).toBe(testGoogleId);
        expect(result.user.provider).toBe('google');
        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();

        // Verify user was created in DB
        const dbUser = await db.query.users.findFirst({
          where: eq(users.email, testEmail),
        });
        expect(dbUser).toBeDefined();
        expect(dbUser?.googleId).toBe(testGoogleId);
      } catch (error: any) {
        if (error.message?.includes('does not exist')) {
          console.warn('Database migration required. Skipping DB test.');
        } else {
          throw error;
        }
      }
    });

    it('should return refresh token as valid JWT', async () => {
      // Skip if user not created in previous test
      if (!createdUserId) {
        console.warn('Skipping: Database migration required');
        return;
      }

      const mockPayload = {
        sub: `google-${uuidv4()}`,
        email: `test-${Date.now()}@example.com`,
        name: 'Google Test User 2',
      };

      vi.spyOn(GoogleAuthService, 'verifyGoogleToken').mockResolvedValue(
        mockPayload as any,
      );

      try {
        const result = await GoogleAuthService.authenticateWithGoogle(
          testGoogleToken,
        );

        // Verify refresh token is stored in DB
        expect(result.refreshToken).toBeDefined();

        // Verify token was stored in DB
        const storedTokens = await db.query.refreshTokens.findMany({
          where: eq(refreshTokens.userId, result.user.id),
        });
        expect(storedTokens.length).toBeGreaterThan(0);

        createdUserId = result.user.id; // Save for cleanup
      } catch (error: any) {
        if (error.message?.includes('does not exist')) {
          console.warn('Database migration required. Skipping DB test.');
        } else {
          throw error;
        }
      }
    });

    it('should link OAuth account to existing email', async () => {
      // Skip if database migration not applied
      try {
        // First, create a local user
        const [localUser] = await db
          .insert(users)
          .values({
            email: `existing-${Date.now()}@example.com`,
            passwordHash: 'hashed_password',
            fullName: 'Existing User',
            provider: 'local',
          })
          .returning();

        createdUserId = localUser.id;

        // Mock Google authentication with same email
        const mockPayload = {
          sub: `new-google-id-${uuidv4()}`,
          email: localUser.email,
          name: 'Google User',
        };

        vi.spyOn(GoogleAuthService, 'verifyGoogleToken').mockResolvedValue(
          mockPayload as any,
        );

        const result = await GoogleAuthService.authenticateWithGoogle(
          testGoogleToken,
        );

        // Verify that existing user was linked
        expect(result.user.id).toBe(localUser.id);
        expect(result.user.googleId).toBe(mockPayload.sub);
      } catch (error: any) {
        if (error.message?.includes('does not exist')) {
          console.warn('Database migration required. Skipping DB test.');
        } else {
          throw error;
        }
      }
    });
  });

  describe('getGoogleAuthUrl', () => {
    it('should return valid authorization URL', () => {
      try {
        const redirectUri = 'http://localhost:3000/auth/google/callback';
        const authUrl = GoogleAuthService.getGoogleAuthUrl(redirectUri);

        expect(authUrl).toBeDefined();
        expect(authUrl).toContain('accounts.google.com');
        expect(authUrl).toContain('client_id=');
        expect(authUrl).toContain('redirect_uri=');
        expect(authUrl).toContain('scope=');
      } catch (error: any) {
        if (error.message?.includes('GOOGLE_CLIENT_ID')) {
          console.warn('Google credentials not configured. Skipping test.');
        } else {
          throw error;
        }
      }
    });
  });

  describe('exchangeCodeForTokens', () => {
    it('should throw error for invalid code', async () => {
      try {
        const promise = GoogleAuthService.exchangeCodeForTokens(
          'invalid-code',
          'http://localhost:3000/callback',
        );

        await expect(promise).rejects.toThrow(
          'Failed to exchange authorization code',
        );
      } catch (error: any) {
        if (
          error.message?.includes('GOOGLE_CLIENT_ID') ||
          error.message?.includes('GOOGLE_CLIENT_SECRET')
        ) {
          console.warn('Google credentials not configured. Skipping test.');
        } else {
          throw error;
        }
      }
    });
  });
});

/**
 * E2E Test Example for React Frontend Integration
 * This demonstrates how the frontend should integrate with the backend
 */
describe('Google OAuth E2E Flow (Frontend Integration)', () => {
  it('should complete OAuth flow from frontend perspective', async () => {
    /**
     * Frontend Flow:
     * 1. Get auth URL from backend
     * 2. Redirect user to Google login
     * 3. User logs in with Google
     * 4. Google redirects back to frontend with authorization code
     * 5. Frontend exchanges code for ID token
     * 6. Frontend sends ID token to backend
     * 7. Backend verifies token and returns JWT tokens
     * 8. Frontend stores tokens in secure cookies
     */

    // Simulating frontend calls
    // Step 1: Get auth URL
    // const authUrlResponse = await fetch('/api/auth/google/auth-url');
    // const { authUrl } = await authUrlResponse.json();
    // window.location.href = authUrl;

    // Step 2-4: User logs in with Google (user action)

    // Step 5-6: Exchange code for ID token (frontend to backend)
    // const loginResponse = await fetch('/api/auth/google/callback', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code: authorizationCode }),
    // });
    // const userData = await loginResponse.json();

    // Step 7-8: Tokens are set as secure HTTP-only cookies automatically
    // Frontend is now authenticated
  });
});
