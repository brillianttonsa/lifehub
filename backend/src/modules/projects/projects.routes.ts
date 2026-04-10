import { Router } from "express";
import { WorkspaceRole } from "@prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { requireWorkspaceRole } from "../../middlewares/rbac";
import { requireWorkspaceMember } from "../../middlewares/workspace";
import { asyncHandler } from "../../shared/http";
import { addProjectComment, addProjectTask, createProject, listProjects } from "./projects.controller";

export const projectsRouter = Router();

projectsRouter.use(requireAuth, asyncHandler(requireWorkspaceMember));
const canWrite = requireWorkspaceRole([WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]);
projectsRouter.post("/", canWrite, asyncHandler(createProject));
projectsRouter.get("/", asyncHandler(listProjects));
projectsRouter.post("/:projectId/tasks", canWrite, asyncHandler(addProjectTask));
projectsRouter.post("/:projectId/comments", canWrite, asyncHandler(addProjectComment));
