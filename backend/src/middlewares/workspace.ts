import { NextFunction, Request, Response } from "express";
import { WorkspaceRole } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../shared/errors";

declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      workspaceRole?: WorkspaceRole;
    }
  }
}

export async function requireWorkspaceMember(req: Request, _res: Response, next: NextFunction) {
  const workspaceId = req.headers["x-workspace-id"];
  if (typeof workspaceId !== "string") {
    throw new AppError("x-workspace-id header is required", 400, "WORKSPACE_HEADER_REQUIRED");
  }
  if (!req.auth?.userId) {
    throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId,
        userId: req.auth.userId,
      },
    },
  });

  if (!membership) {
    throw new AppError("You do not belong to this workspace", 403, "FORBIDDEN");
  }

  req.workspaceId = workspaceId;
  req.workspaceRole = membership.role;
  next();
}
