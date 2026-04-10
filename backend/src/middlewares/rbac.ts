import { NextFunction, Request, Response } from "express";
import { WorkspaceRole } from "@prisma/client";
import { AppError } from "../shared/errors";

export function requireWorkspaceRole(allowedRoles: WorkspaceRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const role = req.workspaceRole;
    if (!role) throw new AppError("Workspace role not resolved", 500, "ROLE_RESOLUTION_FAILED");
    if (!allowedRoles.includes(role)) {
      throw new AppError("Insufficient workspace permissions", 403, "FORBIDDEN");
    }
    next();
  };
}
