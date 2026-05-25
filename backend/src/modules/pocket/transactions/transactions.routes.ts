import { Router } from 'express';
import { TransactionController } from './transactions.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validate } from '../../../middlewares/validate.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import {
  createTransactionSchema,
  updateTransactionSchema,
} from './transactions.schema';

const router = Router();
const controller = new TransactionController();

router.use(authMiddleware);

// CREATE
router.post(
  '/',
  validate(createTransactionSchema),
  asyncHandler(controller.create),
);

// READ
router.get('/', asyncHandler(controller.getUserTransactions));

// UPDATE ⭐ NEW
router.patch(
  '/:id',
  validate(updateTransactionSchema),
  asyncHandler(controller.update),
);

// DELETE
router.delete('/:id', asyncHandler(controller.delete));

export default router;
