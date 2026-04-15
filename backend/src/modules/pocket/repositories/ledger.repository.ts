import type { PoolClient } from "pg";

export type LedgerEntry = {
  id: string;
  userId: string;
  walletId: string;
  transactionId: string;
  entryType: "DEBIT" | "CREDIT";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  recordedAt: string;
};

function mapEntry(row: any): LedgerEntry {
  return {
    ...row,
    amount: Number(row.amount),
    balanceBefore: Number(row.balanceBefore),
    balanceAfter: Number(row.balanceAfter),
  };
}

export const ledgerRepo = {
  async create(
    client: PoolClient,
    data: {
      userId: string;
      walletId: string;
      transactionId: string;
      entryType: "DEBIT" | "CREDIT";
      amount: number;
      balanceBefore: number;
      balanceAfter: number;
    },
  ) {
    const { rows } = await client.query(
      `
      INSERT INTO "WalletLedgerEntry" (
        "user_id",
        "wallet_id",
        "transaction_id",
        "entry_type",
        "amount",
        "balance_before",
        "balance_after"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "wallet_id" as "walletId",
        "transaction_id" as "transactionId",
        "entry_type" as "entryType",
        "amount" as "amount",
        "balance_before" as "balanceBefore",
        "balance_after" as "balanceAfter",
        "recorded_at" as "recordedAt"
      `,
      [
        data.userId,
        data.walletId,
        data.transactionId,
        data.entryType,
        data.amount,
        data.balanceBefore,
        data.balanceAfter,
      ],
    );

    return mapEntry(rows[0]);
  },

  async findByTransaction(client: PoolClient, transactionId: string, userId: string) {
    const { rows } = await client.query(
      `
      SELECT
        e."id" as "id",
        e."user_id" as "userId",
        e."wallet_id" as "walletId",
        e."transaction_id" as "transactionId",
        e."entry_type" as "entryType",
        e."amount" as "amount",
        e."balance_before" as "balanceBefore",
        e."balance_after" as "balanceAfter",
        e."recorded_at" as "recordedAt"
      FROM "WalletLedgerEntry" e
      WHERE e."transaction_id" = $1
        AND e."user_id" = $2
      ORDER BY e."recorded_at" DESC
      `,
      [transactionId, userId],
    );

    return rows.map(mapEntry);
  },

  async deleteByTransaction(client: PoolClient, transactionId: string, userId: string) {
    await client.query(
      `
      DELETE FROM "WalletLedgerEntry"
      WHERE "transaction_id" = $1
        AND "user_id" = $2
      `,
      [transactionId, userId],
    );
  },
};