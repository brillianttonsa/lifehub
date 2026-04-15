import { AppError } from "../../../shared/errors";
import { ledgerService } from "./ledger.service";
import { transactionRepo } from "../repositories/transaction.repository";
import { TransactionInput } from "../types/pocket.types";
import pool from "../../../config/db";

export const transactionService = {
  list(userId: string) {
    return transactionRepo.findAll(userId);
  },

  async create(input: TransactionInput) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const created = await transactionRepo.create(client, {
        ...input,
        occurredAt: new Date(input.occurredAt),
      });
      if (!created) throw new AppError("Failed to create transaction");

      await ledgerService.apply(client, {
        ...input,
        transactionId: created.id,
      });

      await client.query("COMMIT");
      return created;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async update(txnId: string, input: TransactionInput) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const oldTx = await transactionRepo.findById(client, txnId, input.userId);
      if (!oldTx) throw new AppError("Transaction not found");

      await ledgerService.reverse(client, oldTx.id, input.userId);

      const updated = await transactionRepo.update(client, oldTx.id, {
        ...input,
        occurredAt: new Date(input.occurredAt),
      });
      if (!updated) throw new AppError("Failed to update transaction");

      await ledgerService.apply(client, {
        ...input,
        transactionId: updated.id,
      });

      await client.query("COMMIT");
      return updated;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async delete(txnId: string, userId: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const oldTx = await transactionRepo.findById(client, txnId, userId);
      if (!oldTx) throw new AppError("Transaction not found");

      await ledgerService.reverse(client, oldTx.id, userId);
      await transactionRepo.softDelete(client, oldTx.id, userId);

      await client.query("COMMIT");
      return { id: oldTx.id };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};