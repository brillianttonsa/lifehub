import { Request, Response } from "express";
import { plansService } from "../services/plans.service";
import {
  createPlanSchema,
  createPlanItemSchema,
  updatePlanSchema,
  updatePlanItemSchema,
} from "../validators/plans.validator";
import { AppError } from "../../../shared/errors";

function getParam(value: string | string[] | undefined, name: string): string {
  if (Array.isArray(value)) return value[0];
  if (!value) throw new AppError(`Missing route param: ${name}`, 400, "BAD_REQUEST");
  return value;
}

/**
 * GET /api/v1/plans
 * Fetch all plans belonging to the authenticated user.
 */
export async function listPlans(req: Request, res: Response) {
  const data = await plansService.listPlans(req.auth!.userId);
  res.json({ success: true, data });
}

/**
 * POST /api/v1/plans
 * Creates a new plan (personal).
 */
export async function createPlan(req: Request, res: Response) {
  const payload = createPlanSchema.parse(req.body);
  const data = await plansService.createPlan({
    ...payload,
    userId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

/**
 * POST /api/v1/plans/:planId/items
 * Adds an item to a plan (personal).
 */
export async function addPlanItem(req: Request, res: Response) {
  const planId = getParam(req.params.planId, "planId");
  const payload = createPlanItemSchema.parse(req.body);
  const data = await plansService.addPlanItem({
    ...payload,
    planId,
    userId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

/**
 * PATCH /api/v1/plans/:planId
 */
export async function updatePlan(req: Request, res: Response) {
  const planId = getParam(req.params.planId, "planId");
  const payload = updatePlanSchema.parse(req.body);
  const data = await plansService.updatePlan({
    planId,
    userId: req.auth!.userId,
    ...payload,
  });
  res.json({ success: true, data });
}

/**
 * DELETE /api/v1/plans/:planId
 */
export async function deletePlan(req: Request, res: Response) {
  const planId = getParam(req.params.planId, "planId");
  const data = await plansService.deletePlan(planId, req.auth!.userId);
  res.json({ success: true, data });
}

/**
 * PATCH /api/v1/plans/items/:itemId
 */
export async function updatePlanItem(req: Request, res: Response) {
  const itemId = getParam(req.params.itemId, "itemId");
  const payload = updatePlanItemSchema.parse(req.body);
  const data = await plansService.updatePlanItem({
    itemId,
    userId: req.auth!.userId,
    ...payload,
  });
  res.json({ success: true, data });
}

/**
 * DELETE /api/v1/plans/items/:itemId
 */
export async function deletePlanItem(req: Request, res: Response) {
  const itemId = getParam(req.params.itemId, "itemId");
  const data = await plansService.deletePlanItem(itemId, req.auth!.userId);
  res.json({ success: true, data });
}

