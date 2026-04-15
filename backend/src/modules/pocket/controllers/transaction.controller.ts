import { Request, Response } from "express";
import { transactionService } from "../services/transaction.service";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0];
  if (!param) throw new Error("Missing route param");
  return param;
}



export async function listTransactions(req: Request, res: Response) {
  const data = await transactionService.list(req.auth!.userId);
  res.json({ success: true, data });
}

export async function createTransaction(req: Request, res: Response) {
  const data = await transactionService.create({
    ...req.body,
    userId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

export async function updateTransaction(req: Request, res: Response) {
    const transactionId = getParam(req.params.transactionId);
  const data = await transactionService.update(transactionId, {
    ...req.body,
    userId: req.auth!.userId,
  });
  res.json({ success: true, data });
}

export async function deleteTransaction(req: Request, res: Response) {


    const transactionId = getParam(req.params.transactionId);

  const data = await transactionService.delete(
    transactionId, 
    req.auth!.userId
  );
  res.json({ success: true, data });
}