import type { Request, Response } from 'express'
import { MemberService } from '../services/member.service'
import { params } from '../../../utils/AppError'

export class MemberController {
  static async list(req: Request, res: Response) {
    const { projectId } = params(req)

    const rows = await MemberService.listMembers(projectId)

    res.json(
      rows.map((r) => ({
        ...r,
        joinedAt: r.joinedAt.toISOString(),
      })),
    )
  }

  static async add(req: Request, res: Response) {
    const { projectId } = params(req)
    const { email, role } = req.body

    const dto = await MemberService.addMember(projectId, email, role)

    res.status(201).json(dto)
  }

  static async update(req: Request, res: Response) {
    const { projectId, userId } = params(req)
    const { role } = req.body

    const result = await MemberService.updateMember(
      projectId,
      userId,
      role,
    )

    res.json(result)
  }

  static async remove(req: Request, res: Response) {
    const { projectId, userId } = params(req)

    await MemberService.removeMember(projectId, userId)

    res.status(204).end()
  }
}