import { RequestHandler } from 'express';
import { PocketService } from '../services/pocket.service';
import { AuthRequest } from '../../../utils/auth-request';

const pocketService = new PocketService();

export class PocketController {
  overview: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const overview = await pocketService.overview(userId);

    res.status(200).json({
      success: true,
      data: overview,
    });
  };
}
