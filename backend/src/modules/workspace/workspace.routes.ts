import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/prisma";
import { requireAuth } from "../../middlewares/auth";
import { asyncHandler } from "../../shared/http";

export const workspaceRouter = Router();

const createWorkspaceSchema = z.object({
  name: z.string().min(2),
  type: z.enum(["FAMILY", "FRIENDS"]),
});

workspaceRouter.get(
  "/mine",
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await prisma.workspaceMember.findMany({
      where: { userId: req.auth!.userId },
      include: { workspace: true },
    });
    res.json({ success: true, data: items.map((item: any) => ({ role: item.role, workspace: item.workspace })) });
  }),
);

workspaceRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = createWorkspaceSchema.parse(req.body);
    const workspace = await prisma.workspace.create({
      data: {
        name: payload.name,
        type: payload.type,
        ownerUserId: req.auth!.userId,
        members: {
          create: {
            userId: req.auth!.userId,
            role: "OWNER",
          },
        },
      },
    });
    res.status(201).json({ success: true, data: workspace });
  }),
);
