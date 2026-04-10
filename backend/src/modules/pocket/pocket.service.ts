import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors";

type TransactionInput = {
  workspaceId: string;
  kind: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  occurredAt: string;
  sourceWalletId?: string;
  destinationWalletId?: string;
  categoryId?: string;
  description?: string;
  actorUserId: string;
};

class PocketService {
  async createWallet(input: {
    workspaceId: string;
    name: string;
    type: "CASH" | "BANK" | "MOBILE_MONEY";
    provider?: "AIRTEL" | "TIGO" | "TTCL" | "HALOTEL" | "OTHER";
    actorUserId: string;
  }) {
    return prisma.wallet.create({
      data: {
        workspaceId: input.workspaceId,
        name: input.name,
        type: input.type,
        provider: input.provider,
        createdBy: input.actorUserId,
      },
    });
  }

  private validateKind(input: TransactionInput) {
    if (input.kind === "INCOME" && !input.destinationWalletId) {
      throw new AppError("Income transaction requires destinationWalletId");
    }
    if (input.kind === "EXPENSE" && !input.sourceWalletId) {
      throw new AppError("Expense transaction requires sourceWalletId");
    }
    if (input.kind === "TRANSFER") {
      if (!input.sourceWalletId || !input.destinationWalletId) {
        throw new AppError("Transfer requires sourceWalletId and destinationWalletId");
      }
      if (input.sourceWalletId === input.destinationWalletId) {
        throw new AppError("Transfer wallets must be different");
      }
    }
  }

  async createTransaction(input: TransactionInput) {
    this.validateKind(input);
    const amount = input.amount;
    if (amount <= 0) throw new AppError("Amount must be greater than zero");

    return prisma.$transaction(async (tx: any) => {
      const created = await tx.pocketTransaction.create({
        data: {
          workspaceId: input.workspaceId,
          kind: input.kind,
          amount,
          occurredAt: new Date(input.occurredAt),
          sourceWalletId: input.sourceWalletId,
          destinationWalletId: input.destinationWalletId,
          categoryId: input.categoryId,
          description: input.description,
          createdBy: input.actorUserId,
          updatedBy: input.actorUserId,
        },
      });

      await this.applyLedger(tx, created.id, input.workspaceId, input.kind, amount, input.sourceWalletId, input.destinationWalletId, input.actorUserId);
      return created;
    });
  }

  async updateTransaction(txnId: string, input: TransactionInput) {
    this.validateKind(input);
    return prisma.$transaction(async (tx: any) => {
      const oldTx = await tx.pocketTransaction.findFirst({
        where: { id: txnId, workspaceId: input.workspaceId, deletedAt: null },
      });
      if (!oldTx) throw new AppError("Transaction not found", 404, "NOT_FOUND");

      await this.reverseLedger(tx, oldTx.id, input.workspaceId);

      const updated = await tx.pocketTransaction.update({
        where: { id: oldTx.id },
        data: {
          kind: input.kind,
          amount: input.amount,
          occurredAt: new Date(input.occurredAt),
          sourceWalletId: input.sourceWalletId,
          destinationWalletId: input.destinationWalletId,
          categoryId: input.categoryId,
          description: input.description,
          updatedBy: input.actorUserId,
        },
      });

      await this.applyLedger(
        tx,
        updated.id,
        input.workspaceId,
        updated.kind,
        updated.amount,
        updated.sourceWalletId ?? undefined,
        updated.destinationWalletId ?? undefined,
        input.actorUserId,
      );
      return updated;
    });
  }

  async deleteTransaction(txnId: string, workspaceId: string) {
    return prisma.$transaction(async (tx: any) => {
      const oldTx = await tx.pocketTransaction.findFirst({ where: { id: txnId, workspaceId, deletedAt: null } });
      if (!oldTx) throw new AppError("Transaction not found", 404, "NOT_FOUND");
      await this.reverseLedger(tx, oldTx.id, workspaceId);
      await tx.pocketTransaction.update({ where: { id: oldTx.id }, data: { deletedAt: new Date() } });
      return { id: oldTx.id };
    });
  }

  private async applyLedger(
    tx: any,
    transactionId: string,
    workspaceId: string,
    kind: "INCOME" | "EXPENSE" | "TRANSFER",
    amount: number,
    sourceWalletId: string | undefined,
    destinationWalletId: string | undefined,
    actorUserId: string,
  ) {
    const updateWallet = async (walletId: string, entryType: "DEBIT" | "CREDIT") => {
      const wallet = await tx.wallet.findFirst({ where: { id: walletId, workspaceId, deletedAt: null } });
      if (!wallet) throw new AppError("Wallet not found", 404, "WALLET_NOT_FOUND");
      const before = Number(wallet.balance);
      const delta = entryType === "CREDIT" ? amount : -amount;
      const after = before + delta;
      if (after < 0) throw new AppError("Insufficient wallet balance", 400, "INSUFFICIENT_FUNDS");
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: after } });
      await tx.walletLedgerEntry.create({
        data: {
          workspaceId,
          walletId,
          transactionId,
          entryType,
          amount: Math.abs(amount),
          balanceBefore: before,
          balanceAfter: after,
          recordedBy: actorUserId,
        },
      });
    };

    if (kind === "INCOME" && destinationWalletId) await updateWallet(destinationWalletId, "CREDIT");
    if (kind === "EXPENSE" && sourceWalletId) await updateWallet(sourceWalletId, "DEBIT");
    if (kind === "TRANSFER" && sourceWalletId && destinationWalletId) {
      await updateWallet(sourceWalletId, "DEBIT");
      await updateWallet(destinationWalletId, "CREDIT");
    }
  }

  private async reverseLedger(tx: any, transactionId: string, workspaceId: string) {
    const entries = await tx.walletLedgerEntry.findMany({
      where: { transactionId, workspaceId },
      orderBy: { recordedAt: "desc" },
    });

    for (const entry of entries) {
      const wallet = await tx.wallet.findUnique({ where: { id: entry.walletId } });
      if (!wallet) continue;
      const delta = entry.entryType === "CREDIT" ? -Number(entry.amount) : Number(entry.amount);
      const next = Number(wallet.balance) + delta;
      if (next < 0) throw new AppError("Balance correction failed", 400, "BALANCE_CORRUPTION_PREVENTED");
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: next } });
    }

    await tx.walletLedgerEntry.deleteMany({ where: { transactionId, workspaceId } });
  }
}

export const pocketService = new PocketService();
