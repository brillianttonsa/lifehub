import { db } from '../../../db';
import { transactions } from '../../../db/schema/pocket/transactions';
import { wallets } from '../../../db/schema/pocket/wallets';
import { activities } from '../../../db/schema/pocket/activities';
import { WalletService } from '../wallets/wallet.service';
import { eq, and, desc } from 'drizzle-orm';
import { AppError } from '../../../utils/AppError';

const walletService = new WalletService();

type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

type CreateTransactionDTO = {
  type: TransactionType;
  amount: number;
  sourceWalletId?: string;
  destinationWalletId?: string;
  activityId?: string;
  description?: string;
  occurredAt: Date;
};

export class TransactionService {
  async create(userId: string, data: CreateTransactionDTO) {
    const {
      type,
      amount,
      sourceWalletId,
      destinationWalletId,
      activityId,
      description,
      occurredAt,
    } = data;

    const safeAmount = Number(amount);

    if (!safeAmount || safeAmount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    // RULES
    if (type === 'EXPENSE' && !sourceWalletId) {
      throw new AppError('Expense requires source wallet', 400);
    }

    if (type === 'INCOME' && !destinationWalletId) {
      throw new AppError('Income requires destination wallet', 400);
    }

    if (type === 'TRANSFER') {
      if (!sourceWalletId || !destinationWalletId) {
        throw new AppError('Transfer requires both wallets', 400);
      }

      if (sourceWalletId === destinationWalletId) {
        throw new AppError('Cannot transfer to same wallet', 400);
      }
    }

    // SECURITY CHECKS
    if (sourceWalletId) {
      const src = await db.query.wallets.findFirst({
        where: and(eq(wallets.id, sourceWalletId), eq(wallets.userId, userId)),
      });

      if (!src) throw new AppError('Invalid source wallet', 404);
    }

    if (destinationWalletId) {
      const dest = await db.query.wallets.findFirst({
        where: and(
          eq(wallets.id, destinationWalletId),
          eq(wallets.userId, userId),
        ),
      });

      if (!dest) throw new AppError('Invalid destination wallet', 404);
    }

    if (activityId) {
      const activity = await db.query.activities.findFirst({
        where: and(
          eq(activities.id, activityId),
          eq(activities.userId, userId),
        ),
      });

      if (!activity) throw new AppError('Invalid activity', 404);
    }

    // TRANSACTION
    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(transactions)
        .values({
          userId,
          type,
          amount: safeAmount.toString(),
          sourceWalletId: sourceWalletId ?? null,
          destinationWalletId: destinationWalletId ?? null,
          activityId: activityId ?? null,
          description: description ?? null,
          occurredAt,
        })
        .returning();

      if (type === 'EXPENSE' && sourceWalletId) {
        await walletService.adjustBalance(tx, sourceWalletId, -safeAmount);
      }

      if (type === 'INCOME' && destinationWalletId) {
        await walletService.adjustBalance(tx, destinationWalletId, safeAmount);
      }

      if (type === 'TRANSFER' && sourceWalletId && destinationWalletId) {
        await walletService.adjustBalance(tx, sourceWalletId, -safeAmount);
        await walletService.adjustBalance(tx, destinationWalletId, safeAmount);
      }

      return created;
    });
  }

  async getUserTransactions(userId: string) {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.occurredAt));
  }

  async update(userId: string, id: string, data: any) {
    const existing = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
    });

    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    const amount = Number(existing.amount);

    return db.transaction(async (tx) => {
      // 1. REVERSE OLD TRANSACTION EFFECT
      if (existing.type === 'EXPENSE' && existing.sourceWalletId) {
        await walletService.adjustBalance(tx, existing.sourceWalletId, amount);
      }

      if (existing.type === 'INCOME' && existing.destinationWalletId) {
        await walletService.adjustBalance(
          tx,
          existing.destinationWalletId,
          -amount,
        );
      }

      if (existing.type === 'TRANSFER') {
        if (existing.sourceWalletId) {
          await walletService.adjustBalance(
            tx,
            existing.sourceWalletId,
            amount,
          );
        }
        if (existing.destinationWalletId) {
          await walletService.adjustBalance(
            tx,
            existing.destinationWalletId,
            -amount,
          );
        }
      }

      // 2. APPLY UPDATE (simple overwrite for now)
      const [updated] = await tx
        .update(transactions)
        .set({
          ...data,
          amount: data.amount?.toString(),
        })
        .where(eq(transactions.id, id))
        .returning();

      // 3. APPLY NEW EFFECT
      const newAmount = Number(updated.amount);

      if (updated.type === 'EXPENSE' && updated.sourceWalletId) {
        await walletService.adjustBalance(
          tx,
          updated.sourceWalletId,
          -newAmount,
        );
      }

      if (updated.type === 'INCOME' && updated.destinationWalletId) {
        await walletService.adjustBalance(
          tx,
          updated.destinationWalletId,
          newAmount,
        );
      }

      if (
        updated.type === 'TRANSFER' &&
        updated.sourceWalletId &&
        updated.destinationWalletId
      ) {
        await walletService.adjustBalance(
          tx,
          updated.sourceWalletId,
          -newAmount,
        );
        await walletService.adjustBalance(
          tx,
          updated.destinationWalletId,
          newAmount,
        );
      }

      return updated;
    });
  }

  async delete(userId: string, id: string) {
    const record = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
    });

    if (!record) {
      throw new AppError('Transaction not found', 404);
    }

    const amount = Number(record.amount);

    return db.transaction(async (tx) => {
      if (record.type === 'EXPENSE' && record.sourceWalletId) {
        await walletService.adjustBalance(tx, record.sourceWalletId, amount);
      }

      if (record.type === 'INCOME' && record.destinationWalletId) {
        await walletService.adjustBalance(
          tx,
          record.destinationWalletId,
          -amount,
        );
      }

      if (record.type === 'TRANSFER') {
        if (record.sourceWalletId) {
          await walletService.adjustBalance(tx, record.sourceWalletId, amount);
        }
        if (record.destinationWalletId) {
          await walletService.adjustBalance(
            tx,
            record.destinationWalletId,
            -amount,
          );
        }
      }

      await tx.delete(transactions).where(eq(transactions.id, id));

      return { success: true };
    });
  }
}
