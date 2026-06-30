import { Router } from 'express';
import activityRoutes from './routes/activity.routes';
import walletRoutes from './routes/wallet.routes';
import transactionRoutes from './routes/transactions.routes';
import pocketRoutes from './routes/pocket.routes';

const router = Router();

router.use('/activities', activityRoutes);
router.use('/wallets', walletRoutes);
router.use('/transactions', transactionRoutes);
router.use('/overview', pocketRoutes);

export default router;
