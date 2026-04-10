import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors";

class PlansService {
  async createPlan(input: {
    workspaceId: string;
    actorUserId: string;
    type: "YEARLY" | "MONTHLY" | "WEEKLY" | "DAILY";
    title: string;
    description?: string;
    periodStart: string;
    periodEnd: string;
  }) {
    return prisma.plan.create({
      data: {
        workspaceId: input.workspaceId,
        ownerUserId: input.actorUserId,
        type: input.type,
        title: input.title,
        description: input.description,
        periodStart: new Date(input.periodStart),
        periodEnd: new Date(input.periodEnd),
      },
    });
  }

  async listPlans(workspaceId: string) {
    return prisma.plan.findMany({
      where: { workspaceId, deletedAt: null },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async addPlanItem(input: {
    workspaceId: string;
    planId: string;
    title: string;
    description?: string;
    dueDate?: string;
    isRecurring?: boolean;
    recurrenceRule?: string;
    linkedProjectId?: string;
    linkedHabitId?: string;
  }) {
    const plan = await prisma.plan.findFirst({
      where: { id: input.planId, workspaceId: input.workspaceId, deletedAt: null },
    });
    if (!plan) throw new AppError("Plan not found", 404, "NOT_FOUND");

    return prisma.planItem.create({
      data: {
        workspaceId: input.workspaceId,
        planId: input.planId,
        title: input.title,
        description: input.description,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        isRecurring: input.isRecurring ?? false,
        recurrenceRule: input.recurrenceRule,
        linkedProjectId: input.linkedProjectId,
        linkedHabitId: input.linkedHabitId,
      },
    });
  }
}

export const plansService = new PlansService();
