import type { Request, Response } from 'express'
import { CommentService } from '../services/comment.service'
import { params } from '../../../utils/AppError'

export class CommentController {
  static async list(req: Request, res: Response) {
    const { entryId } = params(req)

    const rows = await CommentService.listComments(entryId, req.userId!)

    res.json(
      rows.map((r) => ({
        id: r.id,
        entryId: r.entryId,
        authorId: r.authorId,
        authorName: r.authorName,
        content: r.content,
        createdAt: r.createdAt.toISOString(),
      })),
    )
  }

  static async create(req: Request, res: Response) {
    const { entryId } = params(req)
    const { content } = req.body as { content: string }

    const comment = await CommentService.createComment(entryId, req.userId!, content)

    res.status(201).json({
      id: comment.id,
      entryId: comment.entryId,
      authorId: comment.authorId,
      authorName: comment.authorName,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
    })
  }

  static async remove(req: Request, res: Response) {
    const { entryId, commentId } = params(req)

    await CommentService.deleteComment(entryId, commentId, req.userId!)

    res.status(204).end()
  }
}