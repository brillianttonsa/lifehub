import { Router } from 'express';
import { GoogleAuthController } from './google.controller';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();

/**
 * Google OAuth Routes
 * All routes are prefixed with /auth/google
 */

// POST /auth/google/login
// Frontend sends Google ID token, receives JWT tokens
router.post('/login', asyncHandler(GoogleAuthController.login));

// GET /auth/google/auth-url
// Frontend gets Google authorization URL to redirect user
router.get('/auth-url', asyncHandler(GoogleAuthController.getAuthUrl));

// POST /auth/google/callback
// Backend handles Google OAuth callback and exchanges code for tokens
router.post('/callback', asyncHandler(GoogleAuthController.callback));

export default router;
