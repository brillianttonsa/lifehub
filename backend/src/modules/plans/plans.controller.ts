import { Request, Response } from "express";
import { z } from "zod";
import { plansService } from "./plans.service";

const createPlanSchema = z.object({
  type: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]),
  title: z.string().min(1),
  description: z.string().optional(),
  periodStart: z.string(),
  periodEnd: z.string(),
});

const createPlanItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().optional(),
  linkedProjectId: z.string().uuid().optional(),
  linkedHabitId: z.string().uuid().optional(),
});

export async function createPlan(req: Request, res: Response) {
  const payload = createPlanSchema.parse(req.body);
  const data = await plansService.createPlan({
    ...payload,
    workspaceId: req.workspaceId!,
    actorUserId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

export async function listPlans(req: Request, res: Response) {
  const data = await plansService.listPlans(req.workspaceId!);
  res.json({ success: true, data });
}

export async function addPlanItem(req: Request, res: Response) {
  const payload = createPlanItemSchema.parse(req.body);
  const data = await plansService.addPlanItem({
    ...payload,
    workspaceId: req.workspaceId!,
    planId: String(req.params.planId),
  });
  res.status(201).json({ success: true, data });
}
