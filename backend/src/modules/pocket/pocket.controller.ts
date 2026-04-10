import { Request, Response } from "express";
import { z } from "zod";
import { pocketService } from "./pocket.service";

const createWalletSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["CASH", "BANK", "MOBILE_MONEY"]),
  provider: z.enum(["AIRTEL", "TIGO", "TTCL", "HALOTEL", "OTHER"]).optional(),
});

const transactionSchema = z.object({
  kind: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive(),
  occurredAt: z.string(),
  sourceWalletId: z.string().uuid().optional(),
  destinationWalletId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export async function createWallet(req: Request, res: Response) {
  const payload = createWalletSchema.parse(req.body);
  const wallet = await pocketService.createWallet({
    ...payload,
    workspaceId: req.workspaceId!,
    actorUserId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data: wallet });
}

export async function createTransaction(req: Request, res: Response) {
  const payload = transactionSchema.parse(req.body);
  const transaction = await pocketService.createTransaction({
    ...payload,
    workspaceId: req.workspaceId!,
    actorUserId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data: transaction });
}

export async function updateTransaction(req: Request, res: Response) {
  const payload = transactionSchema.parse(req.body);
  const transaction = await pocketService.updateTransaction(String(req.params.transactionId), {
    ...payload,
    workspaceId: req.workspaceId!,
    actorUserId: req.auth!.userId,
  });
  res.json({ success: true, data: transaction });
}

export async function deleteTransaction(req: Request, res: Response) {
  const output = await pocketService.deleteTransaction(String(req.params.transactionId), req.workspaceId!);
  res.json({ success: true, data: output });
}
