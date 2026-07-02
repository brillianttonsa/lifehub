import { Request, Response } from 'express'
import { PlanService } from '../services/plan.service'
import { AuthRequest } from '../../../utils/auth-request'

export class PlanController {
  static async list(req: Request, res: Response) {
    const query = req.query
    const plans = await PlanService.list((req as AuthRequest).userId, {
      status: String(query.status || ''),
      timeframe: String(query.timeframe || ''),
      priority: String(query.priority || ''),
      sort: String(query.sort || ''),
      search: String(query.search || ''),
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    })

    res.json(plans)
  }

  static async search(req: Request, res: Response) {
    const query = req.query
    const plans = await PlanService.search((req as AuthRequest).userId, {
      status: String(query.status || ''),
      timeframe: String(query.timeframe || ''),
      priority: String(query.priority || ''),
      sort: String(query.sort || ''),
      search: String(query.q || query.search || ''),
      page: query.page ? Number(query.page) : undefined,
      pageSize: query.pageSize ? Number(query.pageSize) : undefined,
    })

    res.json(plans)
  }

  static async dashboard(req: Request, res: Response) {
    const overview = await PlanService.dashboard((req as AuthRequest).userId)
    res.json(overview)
  }

  static async get(req: Request, res: Response) {
    const plan = await PlanService.get((req as AuthRequest).userId, String(req.params.id))
    res.json(plan)
  }

  static async create(req: Request, res: Response) {
    const payload = req.body
    const plan = await PlanService.create((req as AuthRequest).userId, payload)
    res.status(201).json(plan)
  }

  static async update(req: Request, res: Response) {
    const plan = await PlanService.update((req as AuthRequest).userId, String(req.params.id), req.body)
    res.json(plan)
  }

  static async delete(req: Request, res: Response) {
    await PlanService.delete((req as AuthRequest).userId, String(req.params.id))
    res.status(204).end()
  }

  static async archive(req: Request, res: Response) {
    const plan = await PlanService.archive((req as AuthRequest).userId, String(req.params.id))
    res.json(plan)
  }

  static async updateProgress(req: Request, res: Response) {
    const plan = await PlanService.updateProgress(
      (req as AuthRequest).userId,
      String(req.params.id),
      req.body,
    )
    res.json(plan)
  }
}
