import { z } from 'zod';

/**
 * Google OAuth Validation Schemas
 */

// Google login request body
export const googleLoginSchema = z.object({
  token: z.string().min(10, 'Invalid token format'),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

// Google callback request body
export const googleCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
});

export type GoogleCallbackInput = z.infer<typeof googleCallbackSchema>;

// Auth URL response
export const googleAuthUrlResponseSchema = z.object({
  authUrl: z.string().url(),
});

export type GoogleAuthUrlResponse = z.infer<
  typeof googleAuthUrlResponseSchema
>;
