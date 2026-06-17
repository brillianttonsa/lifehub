import type { Request, Response } from 'express'
import { EntryService } from '../services/entry.service'
import { params } from '../../../utils/AppError'

export class EntryController {
  static async list(req: Request, res: Response) {
    const { projectId } = params(req)
    const cursor = req.query.cursor as string | undefined

    const { page, hasMore, countMap } = await EntryService.listEntries(projectId, cursor)

    const dto = page.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      authorId: r.authorId,
      authorName: r.authorName,
      content: r.content,
      entryDate: r.entryDate,
      commentsEnabled: r.commentsEnabled,
      commentCount: countMap.get(r.id) ?? 0,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))

    const nextCursor = hasMore ? page[page.length - 1].createdAt.toISOString() : null

    res.json({ entries: dto, nextCursor })
  }

  static async create(req: Request, res: Response) {
    const { projectId } = params(req)
    const { content, entryDate, commentsEnabled } = req.body as {
      content: string
      entryDate: string
      commentsEnabled: boolean
    }

    const { row, authorName } = await EntryService.createEntry(
      projectId,
      req.userId!,
      { content, entryDate, commentsEnabled }
    )

    res.status(201).json({
      id: row.id,
      projectId: row.projectId,
      authorId: row.authorId,
      authorName,
      content: row.content,
      entryDate: row.entryDate,
      commentsEnabled: row.commentsEnabled,
      commentCount: 0,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    })
  }

  static async remove(req: Request, res: Response) {
    const { projectId, entryId } = params(req)

    await EntryService.deleteEntry(projectId, entryId, req.userId!, req.projectRole!)

    res.status(204).end()
  }
}