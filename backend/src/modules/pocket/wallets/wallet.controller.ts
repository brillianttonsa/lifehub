import { RequestHandler } from 'express';
import { WalletService } from './wallet.service';
import { AuthRequest } from '../../../utils/auth-request';

const walletService = new WalletService();

export class WalletController {
  create: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const wallet = await walletService.create(userId, req.body);

    res.status(201).json({
      success: true,
      data: wallet,
    });
  };

  getUserWallets: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const wallets = await walletService.getUserWallets(userId);

    res.status(200).json({
      success: true,
      data: wallets,
    });
  };

  getById: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const wallet = await walletService.getById(userId, id);

    res.status(200).json({
      success: true,
      data: wallet,
    });
  };

  update: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const updated = await walletService.update(userId, id, req.body);

    res.status(200).json({
      success: true,
      data: updated,
    });
  };

  delete: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await walletService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
