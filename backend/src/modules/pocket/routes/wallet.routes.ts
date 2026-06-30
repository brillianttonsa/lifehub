import { Router } from 'express';
import { WalletController } from '../controller/wallet.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { asyncHandler } from '../../../utils/asyncHandler';
import { validate } from '../../../middlewares/validate.middleware';
import { createWalletSchema, updateWalletSchema } from '../schema/wallet.schema';

const router = Router();
const controller = new WalletController();

router.use(authMiddleware);

router.post('/', validate(createWalletSchema), asyncHandler(controller.create));

router.get('/', asyncHandler(controller.getUserWallets));
router.get('/:id', asyncHandler(controller.getById));
router.patch(
  '/:id',
  validate(updateWalletSchema),
  asyncHandler(controller.update),
);
router.delete('/:id', asyncHandler(controller.delete));

export default router;
