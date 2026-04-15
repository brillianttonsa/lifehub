import { AppError } from "../../../shared/errors";
import pool from "../../../config/db";
import { plansRepo } from "../repositories/plans.repository";

export const plansService = {
  listPlans(userId: string) {
    return plansRepo.listPlans(userId);
  },

  async createPlan(input: {
    userId: string;
    type: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    title: string;
    description?: string;
    periodStart: string;
    periodEnd: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const created = await plansRepo.createPlan(client, {
        userId: input.userId,
        type: input.type,
        title: input.title,
        description: input.description,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
      });
      await client.query("COMMIT");
      return { ...created, items: [] };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async addPlanItem(input: {
    userId: string;
    planId: string;
    title: string;
    description?: string;
    dueDate?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ok = await plansRepo.assertPlanOwnedByUser(client, input.planId, input.userId);
      if (!ok) throw new AppError("Plan not found", 404, "NOT_FOUND");

      const item = await plansRepo.addItem(client, {
        userId: input.userId,
        planId: input.planId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        isRecurring: input.isRecurring,
        recurrenceRule: input.recurrenceRule,
      });

      await client.query("COMMIT");
      return item;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async updatePlan(input: {
    userId: string;
    planId: string;
    title?: string;
    description?: string;
    type?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    periodStart?: string;
    periodEnd?: string;
    status?: "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ok = await plansRepo.assertPlanOwnedByUser(client, input.planId, input.userId);
      if (!ok) throw new AppError("Plan not found", 404, "NOT_FOUND");

      const updated = await plansRepo.updatePlan(client, {
        userId: input.userId,
        planId: input.planId,
        title: input.title,
        description: input.description,
        type: input.type,
        periodStart: input.periodStart ? new Date(input.periodStart) : undefined,
        periodEnd: input.periodEnd ? new Date(input.periodEnd) : undefined,
        status: input.status,
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

  async deletePlan(planId: string, userId: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ok = await plansRepo.assertPlanOwnedByUser(client, planId, userId);
      if (!ok) throw new AppError("Plan not found", 404, "NOT_FOUND");

      await plansRepo.softDeletePlan(client, planId, userId);
      await plansRepo.softDeletePlanItemsByPlan(client, planId, userId);

      await client.query("COMMIT");
      return { id: planId };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async updatePlanItem(input: {
    userId: string;
    itemId: string;
    title?: string;
    description?: string;
    dueDate?: string | null;
    status?: "TODO" | "DOING" | "DONE" | "SKIPPED";
    isRecurring?: boolean;
    recurrenceRule?: string | null;
    lifetimePreset?: "DAYS" | "WEEK" | "MONTH" | "RANGE";
    lifetimeValue?: number;
    lifetimeStart?: string;
    lifetimeEnd?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ok = await plansRepo.assertPlanItemOwnedByUser(client, input.itemId, input.userId);
      if (!ok) throw new AppError("Plan item not found", 404, "NOT_FOUND");

      const updated = await plansRepo.updatePlanItem(client, {
        userId: input.userId,
        itemId: input.itemId,
        title: input.title,
        description: input.description,
        dueDate:
          input.dueDate === null ? null : input.dueDate ? new Date(input.dueDate) : undefined,
        status: input.status,
        isRecurring: input.isRecurring,
        recurrenceRule: input.recurrenceRule === null ? null : input.recurrenceRule,
        lifetimePreset: input.lifetimePreset,
        lifetimeValue: input.lifetimeValue,
        lifetimeStart: input.lifetimeStart ? new Date(input.lifetimeStart) : undefined,
        lifetimeEnd: input.lifetimeEnd ? new Date(input.lifetimeEnd) : undefined,
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

  async deletePlanItem(itemId: string, userId: string) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ok = await plansRepo.assertPlanItemOwnedByUser(client, itemId, userId);
      if (!ok) throw new AppError("Plan item not found", 404, "NOT_FOUND");

      await plansRepo.softDeletePlanItem(client, itemId, userId);

      await client.query("COMMIT");
      return { id: itemId };
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};

