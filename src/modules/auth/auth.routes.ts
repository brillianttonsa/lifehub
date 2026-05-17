import { Router } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.post('/signup', asyncHandler(AuthController.signup));
router.post('/login', asyncHandler(AuthController.login));
router.post('/logout', asyncHandler(AuthController.logout));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/forgot-password', asyncHandler(AuthController.forgotPassword));
router.post('/reset-password', asyncHandler(AuthController.resetPassword));

export default router;
