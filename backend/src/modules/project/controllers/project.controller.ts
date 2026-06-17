import { Request, Response } from 'express'
import { ProjectService } from '../services/project.service'

export class ProjectController {
  static async list(req: Request, res: Response) {
    const projects = await ProjectService.list(req.userId!)

    res.json(projects)
  }

  static async get(req: Request, res: Response) {
    const project = await ProjectService.get((req.params as any).id)

    res.json(project)
  }

  static async create(req: Request, res: Response) {
    const { name, description } = req.body

    const project = await ProjectService.create(
      req.userId!,
      name,
      description,
    )

    res.status(201).json(project)
  }

  static async delete(req: Request, res: Response) {
    await ProjectService.delete(
      (req.params as any).id,
      req.userId!,
    )

    res.status(204).end()
  }
}