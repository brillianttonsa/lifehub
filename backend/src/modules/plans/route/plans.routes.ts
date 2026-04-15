import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth";
import { asyncHandler } from "../../../shared/http";
import {
  addPlanItem,
  createPlan,
  deletePlan,
  deletePlanItem,
  listPlans,
  updatePlan,
  updatePlanItem,
} from "../controllers/plans.controller";

export const plansRouter = Router();

/**
 * Plans is a personal domain module.
 * Only requires authentication to resolve req.auth.userId.
 */
plansRouter.use(requireAuth);

plansRouter.get("/", asyncHandler(listPlans));
plansRouter.post("/", asyncHandler(createPlan));
plansRouter.patch("/:planId", asyncHandler(updatePlan));
plansRouter.delete("/:planId", asyncHandler(deletePlan));
plansRouter.post("/:planId/items", asyncHandler(addPlanItem));
plansRouter.patch("/items/:itemId", asyncHandler(updatePlanItem));
plansRouter.delete("/items/:itemId", asyncHandler(deletePlanItem));

