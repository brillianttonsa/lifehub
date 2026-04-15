import pool from "../../../config/db";
import type { PoolClient } from "pg";
import type { PlanWithItems } from "../types/plans.types";

function mapPlan(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  };
}

export const plansRepo = {
  async listPlans(userId: string): Promise<PlanWithItems[]> {
    const { rows } = await pool.query(
      `
      SELECT
        p."id" as "id",
        p."user_id" as "userId",
        p."type" as "type",
        p."title" as "title",
        p."description" as "description",
        p."period_start" as "periodStart",
        p."period_end" as "periodEnd",
        p."status" as "status",
        p."created_at" as "createdAt",
        p."updated_at" as "updatedAt",
        p."deleted_at" as "deletedAt"
      FROM "Plan" p
      WHERE p."user_id" = $1
        AND p."deleted_at" IS NULL
      ORDER BY p."created_at" DESC
      `,
      [userId],
    );

    if (rows.length === 0) return [];

    const plans = rows.map(mapPlan);
    const planIds = plans.map((p) => p.id);

    const itemsRes = await pool.query(
      `
      SELECT
        i."id" as "id",
        i."plan_id" as "planId",
        i."title" as "title",
        i."description" as "description",
        i."due_date" as "dueDate",
        i."status" as "status",
        i."is_recurring" as "isRecurring"
      FROM "PlanItem" i
      WHERE i."user_id" = $1
        AND i."plan_id" = ANY($2::uuid[])
        AND i."deleted_at" IS NULL
      ORDER BY i."created_at" ASC
      `,
      [userId, planIds],
    );

    const byPlan: Record<string, Array<any>> = {};
    for (const it of itemsRes.rows) {
      const planId = it.planId;
      if (!byPlan[planId]) byPlan[planId] = [];
      byPlan[planId].push({
        id: it.id,
        title: it.title,
        description: it.description ?? undefined,
        dueDate: it.dueDate ?? undefined,
        status: it.status,
        isRecurring: Boolean(it.isRecurring),
      });
    }

    return plans.map((p) => ({
      ...p,
      items: byPlan[p.id] ?? [],
    }));
  },

  async createPlan(
    client: PoolClient,
    input: {
      userId: string;
      type: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
      title: string;
      description?: string;
      periodStart: Date;
      periodEnd: Date;
    },
  ) {
    const { rows } = await client.query(
      `
      INSERT INTO "Plan" (
        "user_id",
        "type",
        "title",
        "description",
        "period_start",
        "period_end",
        "status"
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'OPEN')
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "type" as "type",
        "title" as "title",
        "description" as "description",
        "period_start" as "periodStart",
        "period_end" as "periodEnd",
        "status" as "status",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "deleted_at" as "deletedAt"
      `,
      [
        input.userId,
        input.type,
        input.title,
        input.description ?? null,
        input.periodStart,
        input.periodEnd,
      ],
    );
    return mapPlan(rows[0]);
  },

  async assertPlanOwnedByUser(client: PoolClient, planId: string, userId: string) {
    const { rows } = await client.query(
      `
      SELECT p."id" as "id"
      FROM "Plan" p
      WHERE p."id" = $1
        AND p."user_id" = $2
        AND p."deleted_at" IS NULL
      LIMIT 1
      `,
      [planId, userId],
    );
    return !!rows[0];
  },

  async assertPlanItemOwnedByUser(client: PoolClient, itemId: string, userId: string) {
    const { rows } = await client.query(
      `
      SELECT i."id" as "id"
      FROM "PlanItem" i
      WHERE i."id" = $1
        AND i."user_id" = $2
        AND i."deleted_at" IS NULL
      LIMIT 1
      `,
      [itemId, userId],
    );
    return !!rows[0];
  },

  async updatePlan(
    client: PoolClient,
    input: {
      userId: string;
      planId: string;
      title?: string;
      description?: string;
      type?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
      periodStart?: Date;
      periodEnd?: Date;
      status?: string;
    },
  ) {
    const { rows } = await client.query(
      `
      UPDATE "Plan"
      SET
        "title" = COALESCE($3, "title"),
        "description" = COALESCE($4, "description"),
        "type" = COALESCE($5, "type"),
        "period_start" = COALESCE($6, "period_start"),
        "period_end" = COALESCE($7, "period_end"),
        "status" = COALESCE($8, "status"),
        "updated_at" = NOW()
      WHERE "id" = $1
        AND "user_id" = $2
        AND "deleted_at" IS NULL
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "type" as "type",
        "title" as "title",
        "description" as "description",
        "period_start" as "periodStart",
        "period_end" as "periodEnd",
        "status" as "status",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "deleted_at" as "deletedAt"
      `,
      [
        input.planId,
        input.userId,
        input.title ?? null,
        input.description ?? null,
        input.type ?? null,
        input.periodStart ?? null,
        input.periodEnd ?? null,
        input.status ?? null,
      ],
    );
    return mapPlan(rows[0]);
  },

  async softDeletePlan(client: PoolClient, planId: string, userId: string) {
    await client.query(
      `
      UPDATE "Plan"
      SET "deleted_at" = NOW(), "updated_at" = NOW()
      WHERE "id" = $1 AND "user_id" = $2 AND "deleted_at" IS NULL
      `,
      [planId, userId],
    );
  },

  async softDeletePlanItemsByPlan(client: PoolClient, planId: string, userId: string) {
    await client.query(
      `
      UPDATE "PlanItem"
      SET "deleted_at" = NOW(), "updated_at" = NOW()
      WHERE "plan_id" = $1 AND "user_id" = $2 AND "deleted_at" IS NULL
      `,
      [planId, userId],
    );
  },

  async updatePlanItem(
    client: PoolClient,
    input: {
      userId: string;
      itemId: string;
      title?: string;
      description?: string;
      dueDate?: Date | null;
      status?: string;
      isRecurring?: boolean;
      recurrenceRule?: string | null;
      lifetimePreset?: string;
      lifetimeValue?: number;
      lifetimeStart?: Date;
      lifetimeEnd?: Date;
    },
  ) {
    const { rows } = await client.query(
      `
      UPDATE "PlanItem"
      SET
        "title" = COALESCE($3, "title"),
        "description" = COALESCE($4, "description"),
        "due_date" = CASE
          WHEN $5::timestamptz IS NULL AND $9 = true THEN NULL
          ELSE COALESCE($5::timestamptz, "due_date")
        END,
        "status" = COALESCE($6, "status"),
        "is_recurring" = COALESCE($7, "is_recurring"),
        "recurrence_rule" = CASE
          WHEN $8::text IS NULL AND $10 = true THEN NULL
          ELSE COALESCE($8::text, "recurrence_rule")
        END,
        "lifetime_preset" = COALESCE($11, "lifetime_preset"),
        "lifetime_value" = COALESCE($12, "lifetime_value"),
        "lifetime_start" = COALESCE($13, "lifetime_start"),
        "lifetime_end" = COALESCE($14, "lifetime_end"),
        "updated_at" = NOW()
      WHERE "id" = $1
        AND "user_id" = $2
        AND "deleted_at" IS NULL
      RETURNING
        "id" as "id",
        "plan_id" as "planId",
        "title" as "title",
        "description" as "description",
        "due_date" as "dueDate",
        "status" as "status",
        "is_recurring" as "isRecurring"
      `,
      [
        input.itemId,
        input.userId,
        input.title ?? null,
        input.description ?? null,
        input.dueDate instanceof Date ? input.dueDate : null,
        input.status ?? null,
        typeof input.isRecurring === "boolean" ? input.isRecurring : null,
        input.recurrenceRule === null ? null : input.recurrenceRule ?? null,
        input.dueDate === null,
        input.recurrenceRule === null,
        input.lifetimePreset ?? null,
        input.lifetimeValue ?? null,
        input.lifetimeStart ?? null,
        input.lifetimeEnd ?? null,
      ],
    );
    const it = rows[0];
    return {
      id: it.id,
      planId: it.planId,
      title: it.title,
      description: it.description ?? undefined,
      dueDate: it.dueDate ?? undefined,
      status: it.status,
      isRecurring: Boolean(it.isRecurring),
    };
  },

  async softDeletePlanItem(client: PoolClient, itemId: string, userId: string) {
    await client.query(
      `
      UPDATE "PlanItem"
      SET "deleted_at" = NOW(), "updated_at" = NOW()
      WHERE "id" = $1 AND "user_id" = $2 AND "deleted_at" IS NULL
      `,
      [itemId, userId],
    );
  },

  async addItem(
    client: PoolClient,
    input: {
      userId: string;
      planId: string;
      title: string;
      description?: string;
      dueDate?: Date;
      isRecurring?: boolean;
      recurrenceRule?: string;
      lifetimePreset?: string;
      lifetimeValue?: number;
      lifetimeStart?: Date;
      lifetimeEnd?: Date;
    },
  ) {
    const { rows } = await client.query(
      `
      INSERT INTO "PlanItem" (
        "user_id",
        "plan_id",
        "title",
        "description",
        "due_date",
        "status",
        "is_recurring",
        "recurrence_rule",
        "lifetime_preset",
        "lifetime_value",
        "lifetime_start",
        "lifetime_end"
      )
      VALUES ($1, $2, $3, $4, $5, 'TODO', $6, $7, $8, $9, $10, $11)
      RETURNING
        "id" as "id",
        "plan_id" as "planId",
        "title" as "title",
        "description" as "description",
        "due_date" as "dueDate",
        "status" as "status",
        "is_recurring" as "isRecurring"
      `,
      [
        input.userId,
        input.planId,
        input.title,
        input.description ?? null,
        input.dueDate ?? null,
        input.isRecurring ?? false,
        input.recurrenceRule ?? null,
        input.lifetimePreset ?? null,
        input.lifetimeValue ?? null,
        input.lifetimeStart ?? null,
        input.lifetimeEnd ?? null,
      ],
    );
    const it = rows[0];
    return {
      id: it.id,
      planId: it.planId,
      title: it.title,
      description: it.description ?? undefined,
      dueDate: it.dueDate ?? undefined,
      status: it.status,
      isRecurring: Boolean(it.isRecurring),
    };
  },
};

