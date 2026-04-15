import pool from "../../../config/db";

type WalletRow = {
  id: string;
  userId: string;
  name: string;
  type: string;
  provider: string | null;
  currencyCode: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

function mapWallet(row: any): WalletRow {
  return {
    ...row,
    balance: Number(row.balance),
    isActive: Boolean(row.isActive),
  };
}

export const walletRepo = {
  async findById(id: string, userId: string) {
    const { rows } = await pool.query(
      `
      SELECT
        w."id" as "id",
        w."user_id" as "userId",
        w."name" as "name",
        w."type" as "type",
        w."provider" as "provider",
        w."currency_code" as "currencyCode",
        w."balance" as "balance",
        w."is_active" as "isActive",
        w."created_at" as "createdAt",
        w."updated_at" as "updatedAt",
        w."deleted_at" as "deletedAt"
      FROM "Wallet" w
      WHERE w."id" = $1
        AND w."user_id" = $2
        AND w."deleted_at" IS NULL
      LIMIT 1
      `,
      [id, userId],
    );

    return rows[0] ? mapWallet(rows[0]) : null;
  },

  async findAll(userId: string) {
    const { rows } = await pool.query(
      `
      SELECT
        w."id" as "id",
        w."user_id" as "userId",
        w."name" as "name",
        w."type" as "type",
        w."provider" as "provider",
        w."currency_code" as "currencyCode",
        w."balance" as "balance",
        w."is_active" as "isActive",
        w."created_at" as "createdAt",
        w."updated_at" as "updatedAt",
        w."deleted_at" as "deletedAt"
      FROM "Wallet" w
      WHERE w."user_id" = $1
        AND w."deleted_at" IS NULL
      ORDER BY w."created_at" DESC
      `,
      [userId],
    );

    return rows.map(mapWallet);
  },

  async create(data: {
    userId: string;
    name: string;
    type: string;
    provider?: string;
    balance?: number;
  }) {
    const { rows } = await pool.query(
      `
      INSERT INTO "Wallet" (
        "user_id",
        "name",
        "type",
        "provider",
        "balance"
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "name" as "name",
        "type" as "type",
        "provider" as "provider",
        "currency_code" as "currencyCode",
        "balance" as "balance",
        "is_active" as "isActive",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "deleted_at" as "deletedAt"
      `,
      [data.userId, data.name, data.type, data.provider ?? null, data.balance ?? 0],
    );

    return mapWallet(rows[0]);
  },

  async update(id: string, data: { name: string; type: string; provider?: string }) {
    const { rows } = await pool.query(
      `
      UPDATE "Wallet"
      SET
        "name" = $2,
        "type" = $3,
        "provider" = $4,
        "updated_at" = NOW()
      WHERE "id" = $1
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "name" as "name",
        "type" as "type",
        "provider" as "provider",
        "currency_code" as "currencyCode",
        "balance" as "balance",
        "is_active" as "isActive",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "deleted_at" as "deletedAt"
      `,
      [id, data.name, data.type, data.provider ?? null],
    );

    return mapWallet(rows[0]);
  },

  async softDelete(id: string) {
    const { rows } = await pool.query(
      `
      UPDATE "Wallet"
      SET
        "deleted_at" = NOW(),
        "updated_at" = NOW()
      WHERE "id" = $1
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "name" as "name",
        "type" as "type",
        "provider" as "provider",
        "currency_code" as "currencyCode",
        "balance" as "balance",
        "is_active" as "isActive",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "deleted_at" as "deletedAt"
      `,
      [id],
    );

    return rows[0] ? mapWallet(rows[0]) : null;
  },
};