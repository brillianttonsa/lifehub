import { RequestHandler } from 'express';
import { TransactionService } from '../services/transactions.service';
import { AuthRequest } from '../../../utils/auth-request';

const transactionService = new TransactionService();

export class TransactionController {
  create: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const transaction = await transactionService.create(userId, req.body);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  };

  getUserTransactions: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const transactions = await transactionService.getUserTransactions(userId);

    res.status(200).json({
      success: true,
      data: transactions,
    });
  };

  update: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const updated = await transactionService.update(userId, id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
    });
  };

  delete: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await transactionService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
