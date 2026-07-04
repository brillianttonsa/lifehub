import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { and, eq, or } from 'drizzle-orm';
import { db, DbClient } from '../../db';
import { transactions } from '../../db/schema/pocket/transactions';
import { wallets } from '../../db/schema/pocket/wallets';
import type { CreateWalletDto } from './dto/create-wallet.dto';
import type { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletService {
  async create(userId: string, data: CreateWalletDto) {
    const name = data.name.trim();

    const [wallet] = await db
      .insert(wallets)
      .values({
        userId,
        name,
        type: data.type,
        provider: data.provider ?? null,
        balance: data.balance ?? '0',
      })
      .returning();

    return wallet;
  }

  async getUserWallets(userId: string) {
    return db.select().from(wallets).where(eq(wallets.userId, userId));
  }

  async getById(userId: string, walletId: string) {
    const wallet = await db.query.wallets.findFirst({
      where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async update(userId: string, walletId: string, data: UpdateWalletDto) {
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
      throw new NotFoundException('Wallet not found');
    }

    return updated;
  }

  async delete(userId: string, walletId: string) {
    const wallet = await db.query.wallets.findFirst({
      where: and(eq(wallets.id, walletId), eq(wallets.userId, userId)),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const hasTransactions = await db.query.transactions.findFirst({
      where: or(
        eq(transactions.sourceWalletId, walletId),
        eq(transactions.destinationWalletId, walletId),
      ),
    });

    if (hasTransactions) {
      throw new ConflictException('Cannot delete wallet with transaction history');
    }

    await db
      .update(wallets)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(wallets.id, walletId), eq(wallets.userId, userId)));

    return { success: true };
  }

  async adjustBalance(tx: DbClient, walletId: string, amount: number) {
    const wallet = await tx.query.wallets.findFirst({
      where: eq(wallets.id, walletId),
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const current = parseFloat(wallet.balance.toString());
    const newBalance = current + amount;

    if (newBalance < 0) {
      throw new BadRequestException('Insufficient balance');
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
