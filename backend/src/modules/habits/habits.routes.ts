import { Router } from "express";
import { WorkspaceRole } from "@prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { requireWorkspaceRole } from "../../middlewares/rbac";
import { requireWorkspaceMember } from "../../middlewares/workspace";
import { asyncHandler } from "../../shared/http";
import { checkinHabit, closeExpiredHabitSets, createHabitSet, listHabitSets } from "./habits.controller";

export const habitsRouter = Router();

habitsRouter.use(requireAuth, asyncHandler(requireWorkspaceMember));
const canWrite = requireWorkspaceRole([WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]);
habitsRouter.post("/sets", canWrite, asyncHandler(createHabitSet));
habitsRouter.get("/sets", asyncHandler(listHabitSets));
habitsRouter.post("/checkins", canWrite, asyncHandler(checkinHabit));
habitsRouter.post("/sets/close-expired", canWrite, asyncHandler(closeExpiredHabitSets));
