import { walletRepo } from "../repositories/wallet.repository";
import { AppError } from "../../../shared/errors";

export const walletService = {
  list(userId: string) {
    return walletRepo.findAll(userId);
  },

  create(input: { name: string; type: string; provider?: string; userId: string; balance?: number }) {
    return walletRepo.create({
      ...input,
      balance: input.balance ?? 0,
    });
  },

  async update(walletId: string, userId: string, data: { name: string; type: string; provider?: string }) {
    const wallet = await walletRepo.findById(walletId, userId);
    if (!wallet) throw new AppError("Wallet not found or access denied");

    return walletRepo.update(wallet.id, data);
  },

  async delete(walletId: string, userId: string) {
    const wallet = await walletRepo.findById(walletId, userId);
    if (!wallet) throw new AppError("Wallet not found");

    await walletRepo.softDelete(wallet.id);
    return { id: wallet.id };
  },
};