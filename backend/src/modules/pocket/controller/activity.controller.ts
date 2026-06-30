import { RequestHandler } from 'express';
import { ActivityService } from '../services/activity.service';
import { AuthRequest } from '../../../utils/auth-request';

const activityService = new ActivityService();

export class ActivityController {
  create: RequestHandler = async (req, res) => {
    const { name } = req.body;
    const userId = (req as AuthRequest).userId;

    const activity = await activityService.create(userId, name);

    res.status(201).json({
      success: true,
      data: activity,
    });
  };

  getUserActivities: RequestHandler = async (req, res) => {
    const userId = (req as AuthRequest).userId;

    const status = req.query.status as string | undefined;

    const activities = await activityService.getUserActivities(userId, status);

    res.status(200).json({
      success: true,
      data: activities,
    });
  };

  delete: RequestHandler = async (req, res) => {
    const userId = (req as AuthRequest).userId;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await activityService.delete(userId, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };

  restore: RequestHandler = async (req, res) => {
    const { userId } = req as AuthRequest;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const result = await activityService.restore(userId, id);

    res.status(200).json({
      success: true,
      data: result,
    });
  };
}
