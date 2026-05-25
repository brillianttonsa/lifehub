import { Router } from 'express';
import { PocketController } from './pocket.controller';
import { asyncHandler } from '../../../utils/asyncHandler';

const router = Router();
const controller = new PocketController();

router.get('/', asyncHandler(controller.overview));

export default router;
