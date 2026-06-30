import { db } from '../../../db';
import { transactions } from '../../../db/schema/pocket/transactions';
import { wallets } from '../../../db/schema/pocket/wallets';
import { activities } from '../../../db/schema/pocket/activities';
import { WalletService } from './wallet.service';
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
  private validateRules(
    type: TransactionType,
    amount: number,
    sourceWalletId?: string | null,
    destinationWalletId?: string | null,
  ) {
    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

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
  }

  private normalizeWallets(
    type: TransactionType,
    sourceWalletId?: string | null,
    destinationWalletId?: string | null,
  ) {
    if (type === 'INCOME') {
      return { sourceWalletId: null, destinationWalletId };
    }

    if (type === 'EXPENSE') {
      return { sourceWalletId, destinationWalletId: null };
    }

    return { sourceWalletId, destinationWalletId };
  }

  private async assertOwnedReferences(
    userId: string,
    sourceWalletId?: string | null,
    destinationWalletId?: string | null,
    activityId?: string | null,
  ) {
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
  }

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
    const normalized = this.normalizeWallets(
      type,
      sourceWalletId,
      destinationWalletId,
    );

    this.validateRules(
      type,
      safeAmount,
      normalized.sourceWalletId,
      normalized.destinationWalletId,
    );
    await this.assertOwnedReferences(
      userId,
      normalized.sourceWalletId,
      normalized.destinationWalletId,
      activityId,
    );

    // TRANSACTION
    return db.transaction(async (tx) => {
      const [created] = await tx
        .insert(transactions)
        .values({
          userId,
          type,
          amount: safeAmount.toString(),
          sourceWalletId: normalized.sourceWalletId ?? null,
          destinationWalletId: normalized.destinationWalletId ?? null,
          activityId: activityId ?? null,
          description: description ?? null,
          occurredAt,
        })
        .returning();

      if (type === 'EXPENSE' && normalized.sourceWalletId) {
        await walletService.adjustBalance(tx, normalized.sourceWalletId, -safeAmount);
      }

      if (type === 'INCOME' && normalized.destinationWalletId) {
        await walletService.adjustBalance(tx, normalized.destinationWalletId, safeAmount);
      }

      if (
        type === 'TRANSFER' &&
        normalized.sourceWalletId &&
        normalized.destinationWalletId
      ) {
        await walletService.adjustBalance(tx, normalized.sourceWalletId, -safeAmount);
        await walletService.adjustBalance(tx, normalized.destinationWalletId, safeAmount);
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

  async update(userId: string, id: string, data: Partial<CreateTransactionDTO>) {
    const existing = await db.query.transactions.findFirst({
      where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
    });

    if (!existing) {
      throw new AppError('Transaction not found', 404);
    }

    const amount = Number(existing.amount);
    const nextType = data.type ?? existing.type;
    const nextAmount = data.amount === undefined ? amount : Number(data.amount);
    const normalized = this.normalizeWallets(
      nextType,
      data.sourceWalletId ?? existing.sourceWalletId,
      data.destinationWalletId ?? existing.destinationWalletId,
    );
    const nextActivityId =
      data.activityId === undefined ? existing.activityId : data.activityId;

    this.validateRules(
      nextType,
      nextAmount,
      normalized.sourceWalletId,
      normalized.destinationWalletId,
    );
    await this.assertOwnedReferences(
      userId,
      normalized.sourceWalletId,
      normalized.destinationWalletId,
      nextActivityId,
    );

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
          type: nextType,
          amount: nextAmount.toString(),
          sourceWalletId: normalized.sourceWalletId ?? null,
          destinationWalletId: normalized.destinationWalletId ?? null,
          activityId: nextActivityId ?? null,
          description:
            data.description === undefined
              ? existing.description
              : data.description,
          occurredAt: data.occurredAt ?? existing.occurredAt,
          updatedAt: new Date(),
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
