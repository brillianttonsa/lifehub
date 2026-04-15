import { Request, Response } from "express";
import { walletService } from "../services/wallet.service";
import { createWalletSchema, updateWalletSchema } from "../validators/pocket.validator";

// utils/params.ts
export function getParam(value: string | string[] | undefined, name: string): string {
  if (Array.isArray(value)) return value[0];
  if (!value) throw new Error(`Missing route param: ${name}`);
  return value;
}

/**
 * GET /api/v1/pocket/wallets
 * Fetches all wallets belonging to the authenticated user.
 */
export async function listWallets(req: Request, res: Response) {
  const data = await walletService.list(req.auth!.userId);
  res.json({ 
    success: true, 
    data 
  });
}

/**
 * POST /api/v1/pocket/wallets
 * Creates a new personal wallet.
 */
export async function createWallet(req: Request, res: Response) {
  // Validate request body against schema
  const payload = createWalletSchema.parse(req.body);
  
  const data = await walletService.create({
    ...payload,
    userId: req.auth!.userId,
  });

  res.status(201).json({ 
    success: true, 
    data 
  });
}

/**
 * PATCH /api/v1/pocket/wallets/:walletId
 * Updates metadata (name, type, provider) but NEVER the balance.
 */
export async function updateWallet(req: Request, res: Response) {
    const walletId = getParam(req.params.walletId, "walletId");
    
  const payload = updateWalletSchema.parse(req.body);
  
  const data = await walletService.update(
    walletId, 
    req.auth!.userId, 
    payload
  );

  res.json({ 
    success: true, 
    data 
  });
}

/**
 * DELETE /api/v1/pocket/wallets/:walletId
 * Soft-deletes a wallet.
 */
export async function deleteWallet(req: Request, res: Response) {

    const walletId = getParam(req.params.walletId, "walletId");

  const data = await walletService.delete(
    walletId, 
    req.auth!.userId
  );

  res.json({ 
    success: true, 
    data 
  });
}