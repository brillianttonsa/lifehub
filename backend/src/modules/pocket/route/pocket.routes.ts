import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth";
import { asyncHandler } from "../../../shared/http";
import { 
  createTransaction, 
  deleteTransaction, 
  listTransactions, 
  updateTransaction 
} from "../controllers/transaction.controller";
import {
  createWallet,
  deleteWallet,
  listWallets,
  updateWallet
} from "../controllers/wallet.controller";

export const pocketRouter = Router();

/**
 * All Pocket routes are personal.
 * We only need requireAuth to ensure we have a valid req.auth.userId.
 */
pocketRouter.use(requireAuth);

// Transaction Management
pocketRouter.get("/transactions", asyncHandler(listTransactions));
pocketRouter.post("/transactions", asyncHandler(createTransaction));
pocketRouter.patch("/transactions/:transactionId", asyncHandler(updateTransaction));
pocketRouter.delete("/transactions/:transactionId", asyncHandler(deleteTransaction));

// wallets
// Add these to your existing pocketRouter file
pocketRouter.get("/wallets", asyncHandler(listWallets));
pocketRouter.post("/wallets", asyncHandler(createWallet));
pocketRouter.patch("/wallets/:walletId", asyncHandler(updateWallet));
pocketRouter.delete("/wallets/:walletId", asyncHandler(deleteWallet));

// Note: You can add your Wallet routes here next once we've updated those files.