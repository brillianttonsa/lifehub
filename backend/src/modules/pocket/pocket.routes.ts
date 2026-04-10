import { Router } from "express";
import { WorkspaceRole } from "@prisma/client";
import { requireAuth } from "../../middlewares/auth";
import { requireWorkspaceRole } from "../../middlewares/rbac";
import { requireWorkspaceMember } from "../../middlewares/workspace";
import { asyncHandler } from "../../shared/http";
import { createTransaction, createWallet, deleteTransaction, updateTransaction } from "./pocket.controller";

export const pocketRouter = Router();

pocketRouter.use(requireAuth, asyncHandler(requireWorkspaceMember));
const canWrite = requireWorkspaceRole([WorkspaceRole.OWNER, WorkspaceRole.ADMIN, WorkspaceRole.MEMBER]);
pocketRouter.post("/wallets", canWrite, asyncHandler(createWallet));
pocketRouter.post("/transactions", canWrite, asyncHandler(createTransaction));
pocketRouter.patch("/transactions/:transactionId", canWrite, asyncHandler(updateTransaction));
pocketRouter.delete("/transactions/:transactionId", canWrite, asyncHandler(deleteTransaction));
