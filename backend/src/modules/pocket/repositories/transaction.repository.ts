import pool from "../../../config/db";
import type { PoolClient } from "pg";

type WalletLite = {
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

type CategoryLite = {
  id: string;
  userId: string;
  name: string;
  type: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PocketTransactionRow = {
  id: string;
  userId: string;
  kind: "INCOME" | "EXPENSE" | "TRANSFER";
  amount: number;
  currencyCode: string;
  occurredAt: string;
  description: string | null;
  sourceWalletId: string | null;
  destinationWalletId: string | null;
  categoryId: string | null;
  referenceCode: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sourceWallet?: WalletLite | null;
  destinationWallet?: WalletLite | null;
  category?: CategoryLite | null;
};

function mapWalletLite(prefix: "sw" | "dw", row: any): WalletLite | null {
  const id = row[`${prefix}_id`];
  if (!id) return null;
  return {
    id,
    userId: row[`${prefix}_userId`],
    name: row[`${prefix}_name`],
    type: row[`${prefix}_type`],
    provider: row[`${prefix}_provider`],
    currencyCode: row[`${prefix}_currencyCode`],
    balance: Number(row[`${prefix}_balance`]),
    isActive: Boolean(row[`${prefix}_isActive`]),
    createdAt: row[`${prefix}_createdAt`],
    updatedAt: row[`${prefix}_updatedAt`],
    deletedAt: row[`${prefix}_deletedAt`],
  };
}

function mapCategoryLite(row: any): CategoryLite | null {
  const id = row["cat_id"];
  if (!id) return null;
  return {
    id,
    userId: row["cat_userId"],
    name: row["cat_name"],
    type: row["cat_type"],
    parentId: row["cat_parentId"],
    createdAt: row["cat_createdAt"],
    updatedAt: row["cat_updatedAt"],
    deletedAt: row["cat_deletedAt"],
  };
}

function mapTransactionWithIncludes(row: any): PocketTransactionRow {
  return {
    id: row.id,
    userId: row.userId,
    kind: row.kind,
    amount: Number(row.amount),
    currencyCode: row.currencyCode,
    occurredAt: row.occurredAt,
    description: row.description,
    sourceWalletId: row.sourceWalletId,
    destinationWalletId: row.destinationWalletId,
    categoryId: row.categoryId,
    referenceCode: row.referenceCode,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    sourceWallet: mapWalletLite("sw", row),
    destinationWallet: mapWalletLite("dw", row),
    category: mapCategoryLite(row),
  };
}

function baseSelectWithIncludes() {
  return `
    SELECT
      t."id" as "id",
      t."user_id" as "userId",
      t."kind" as "kind",
      t."amount" as "amount",
      t."currency_code" as "currencyCode",
      t."occurred_at" as "occurredAt",
      t."description" as "description",
      t."source_wallet_id" as "sourceWalletId",
      t."destination_wallet_id" as "destinationWalletId",
      t."category_id" as "categoryId",
      t."reference_code" as "referenceCode",
      t."created_at" as "createdAt",
      t."updated_at" as "updatedAt",
      t."deleted_at" as "deletedAt",

      sw."id" as "sw_id",
      sw."user_id" as "sw_userId",
      sw."name" as "sw_name",
      sw."type" as "sw_type",
      sw."provider" as "sw_provider",
      sw."currency_code" as "sw_currencyCode",
      sw."balance" as "sw_balance",
      sw."is_active" as "sw_isActive",
      sw."created_at" as "sw_createdAt",
      sw."updated_at" as "sw_updatedAt",
      sw."deleted_at" as "sw_deletedAt",

      dw."id" as "dw_id",
      dw."user_id" as "dw_userId",
      dw."name" as "dw_name",
      dw."type" as "dw_type",
      dw."provider" as "dw_provider",
      dw."currency_code" as "dw_currencyCode",
      dw."balance" as "dw_balance",
      dw."is_active" as "dw_isActive",
      dw."created_at" as "dw_createdAt",
      dw."updated_at" as "dw_updatedAt",
      dw."deleted_at" as "dw_deletedAt",

      c."id" as "cat_id",
      c."user_id" as "cat_userId",
      c."name" as "cat_name",
      c."type" as "cat_type",
      c."parent_id" as "cat_parentId",
      c."created_at" as "cat_createdAt",
      c."updated_at" as "cat_updatedAt",
      c."deleted_at" as "cat_deletedAt"
    FROM "PocketTransaction" t
    LEFT JOIN "Wallet" sw ON sw."id" = t."source_wallet_id"
    LEFT JOIN "Wallet" dw ON dw."id" = t."destination_wallet_id"
    LEFT JOIN "PocketCategory" c ON c."id" = t."category_id"
  `;
}

export const transactionRepo = {
  async findAll(userId: string) {
    const { rows } = await pool.query(
      `
      ${baseSelectWithIncludes()}
      WHERE t."user_id" = $1
        AND t."deleted_at" IS NULL
      ORDER BY t."occurred_at" DESC
      `,
      [userId],
    );

    return rows.map(mapTransactionWithIncludes);
  },

  async findById(client: PoolClient, id: string, userId: string) {
    const { rows } = await client.query(
      `
      SELECT
        t."id" as "id",
        t."user_id" as "userId",
        t."kind" as "kind",
        t."amount" as "amount",
        t."currency_code" as "currencyCode",
        t."occurred_at" as "occurredAt",
        t."description" as "description",
        t."source_wallet_id" as "sourceWalletId",
        t."destination_wallet_id" as "destinationWalletId",
        t."category_id" as "categoryId",
        t."reference_code" as "referenceCode",
        t."created_at" as "createdAt",
        t."updated_at" as "updatedAt",
        t."deleted_at" as "deletedAt"
      FROM "PocketTransaction" t
      WHERE t."id" = $1
        AND t."user_id" = $2
        AND t."deleted_at" IS NULL
      LIMIT 1
      `,
      [id, userId],
    );

    if (!rows[0]) return null;
    return {
      ...rows[0],
      amount: Number(rows[0].amount),
    } as PocketTransactionRow;
  },

  async create(
    client: PoolClient,
    data: {
      userId: string;
      kind: "INCOME" | "EXPENSE" | "TRANSFER";
      amount: number;
      occurredAt: Date;
      sourceWalletId?: string;
      destinationWalletId?: string;
      categoryId?: string;
      description?: string;
    },
  ) {
    const { rows } = await client.query(
      `
      INSERT INTO "PocketTransaction" (
        "user_id",
        "kind",
        "amount",
        "occurred_at",
        "description",
        "source_wallet_id",
        "destination_wallet_id",
        "category_id"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING "id"
      `,
      [
        data.userId,
        data.kind,
        data.amount,
        data.occurredAt,
        data.description ?? null,
        data.sourceWalletId ?? null,
        data.destinationWalletId ?? null,
        data.categoryId ?? null,
      ],
    );

    return this.findByIdWithIncludes(client, rows[0].id, data.userId);
  },

  async update(
    client: PoolClient,
    id: string,
    data: {
      userId: string;
      kind: "INCOME" | "EXPENSE" | "TRANSFER";
      amount: number;
      occurredAt: Date;
      sourceWalletId?: string;
      destinationWalletId?: string;
      categoryId?: string;
      description?: string;
    },
  ) {
    await client.query(
      `
      UPDATE "PocketTransaction"
      SET
        "kind" = $2,
        "amount" = $3,
        "occurred_at" = $4,
        "description" = $5,
        "source_wallet_id" = $6,
        "destination_wallet_id" = $7,
        "category_id" = $8,
        "updated_at" = NOW()
      WHERE "id" = $1
        AND "user_id" = $9
        AND "deleted_at" IS NULL
      `,
      [
        id,
        data.kind,
        data.amount,
        data.occurredAt,
        data.description ?? null,
        data.sourceWalletId ?? null,
        data.destinationWalletId ?? null,
        data.categoryId ?? null,
        data.userId,
      ],
    );

    return this.findByIdWithIncludes(client, id, data.userId);
  },

  async softDelete(client: PoolClient, id: string, userId: string) {
    await client.query(
      `
      UPDATE "PocketTransaction"
      SET
        "deleted_at" = NOW(),
        "updated_at" = NOW()
      WHERE "id" = $1
        AND "user_id" = $2
        AND "deleted_at" IS NULL
      `,
      [id, userId],
    );
  },

  async findByIdWithIncludes(client: PoolClient, id: string, userId: string) {
    const { rows } = await client.query(
      `
      ${baseSelectWithIncludes()}
      WHERE t."id" = $1
        AND t."user_id" = $2
        AND t."deleted_at" IS NULL
      LIMIT 1
      `,
      [id, userId],
    );

    return rows[0] ? mapTransactionWithIncludes(rows[0]) : null;
  },
};