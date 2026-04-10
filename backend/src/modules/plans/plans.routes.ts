import { Router } from "express";
import { WorkspaceRole } from "@prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { requireWorkspaceRole } from "../../middlewares/rbac";
import { requireWorkspaceMember } from "../../middlewares/workspace";
import { asyncHandler } from "../../shared/http";
import { addPlanItem, createPlan, listPlans } from "./plans.controller";

export const plansRouter = Router();

plansRouter.use(requireAuth, asyncHandler(requireWorkspaceMember));
const canWrite = requireWorkspaceRole([WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]);
plansRouter.post("/", canWrite, asyncHandler(createPlan));
plansRouter.get("/", asyncHandler(listPlans));
plansRouter.post("/:planId/items", canWrite, asyncHandler(addPlanItem));
