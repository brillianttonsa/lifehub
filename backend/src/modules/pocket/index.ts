import { Router } from 'express';
import activityRoutes from './activities/activity.routes';
import walletRoutes from './wallets/wallet.routes';
import transactionRoutes from './transactions/transactions.routes';
import pocketRoutes from './pocket/pocket.routes';

const router = Router();

router.use('/activities', activityRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/overview', pocketRoutes);

export default router;
