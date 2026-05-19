import { Router } from 'express';
import { AuthController } from './auth.controller';
import { googleAuthRoutes } from './google';
import { asyncHandler } from '../../utils/asyncHandler';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

// Local auth routes
router.post('/signup', asyncHandler(AuthController.signup));
router.post('/login', asyncHandler(AuthController.login));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/forgot-password', asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', asyncHandler(AuthController.resetPassword));
router.get('/me', authMiddleware, asyncHandler(AuthController.me));

// Google OAuth routes (prefixed with /google)
router.use('/google', googleAuthRoutes);

export default router;
