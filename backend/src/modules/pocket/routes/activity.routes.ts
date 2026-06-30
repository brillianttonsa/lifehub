import { Router } from 'express';
import { ActivityController } from '../controller/activity.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middlewares/validate.middleware';
import { createActivitySchema } from '../schema/activity.schema';

const router = Router();
const controller = new ActivityController();

router.use(authMiddleware);

router.post(
  '/',
  validate(createActivitySchema),
  asyncHandler(controller.create),
);
router.get('/', asyncHandler(controller.getUserActivities));
router.delete('/:id', asyncHandler(controller.delete));
router.patch('/:id/restore', asyncHandler(controller.restore));

export default router;
