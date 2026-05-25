import { db } from '../../../db';
import { wallets } from '../../../db/schema/pocket/wallets';
import { transactions } from '../../../db/schema/pocket/transactions';
import { eq, and, or } from 'drizzle-orm';
import { AppError } from '../../../utils/AppError';
import { CreateWalletDTO, UpdateWalletDTO } from '../types/wallet.types';

export class WalletService {
  // -----------------------------
  // CREATE WALLET
  // -----------------------------
  async create(userId: string, data: CreateWalletDTO) {
    const name = data.name.trim();

    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        name,
        type: data.type,
        provider: data.provider || null,
        balance: data.balance ?? '0',
      })
      .returning();

    return wallet;
  }

  // -----------------------------
  // GET ALL WALLETS
  // -----------------------------
  async getUserWallets(userId: string) {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  // -----------------------------
  // GET SINGLE WALLET
  // -----------------------------
  async getById(userId: string, walletId: string) {
    const wallet = await db.query.wallets.findFirst({
      where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
    });

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    return wallet;
  }

  // -----------------------------
  // UPDATE WALLET
  // -----------------------------
  async update(userId: string, walletId: string, data: UpdateWalletDTO) {
    const [updated] = await db
      .update(wallets)
      .set({
        name: data.name?.trim(),
        provider: data.provider ?? undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)))
      .returning();

    if (!updated) {
      throw new AppError('Wallet not found', 404);
    }

    return updated;
  }

  // -----------------------------
  // DELETE WALLET (SAFE)
  // -----------------------------
  async delete(userId: string, walletId: string) {
    const wallet = await db.query.wallets.findFirst({
      where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
    });

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    const hasTransactions = await db.query.transactions.findFirst({
      where: or(
        eq(transactions.sourceWalletId, walletId),
        eq(transactions.destinationWalletId, walletId),
      ),
    });

    if (hasTransactions) {
      throw new AppError('Cannot delete wallet with transaction history', 403);
    }

    await db
      .update(wallets)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)));

    return { success: true };
  }

  // -----------------------------
  // BALANCE ENGINE
  // -----------------------------
  async adjustBalance(tx: any, walletId: string, amount: number) {
    const wallet = await tx.query.wallets.findFirst({
      where: eq(wallets.id, walletId),
    });

    if (!wallet) {
      throw new AppError('Wallet not found', 404);
    }

    const current = parseFloat(wallet.balance);
    const newBalance = current + amount;

    if (newBalance < 0) {
      throw new AppError('Insufficient balance', 400);
    }

    await tx
      .update(wallets)
      .set({
        balance: newBalance.toString(),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId));
  }
}
