import { Router } from 'express';
import { PocketController } from '../controller/pocket.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();
const controller = new PocketController();

router.use(authMiddleware);
router.get('/', asyncHandler(controller.overview));

export default router;
