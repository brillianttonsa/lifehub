import type { Request, Response, NextFunction } from 'express'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { projectMembers, type Role } from '../db/schema'
import { asyncHandler } from '../utils/asyncHandler'
import { forbidden, notFound, unauthorized } from '../utils/AppError'

/** Capability checks derived from a role */
export const can = {
  /** Owner-only: manage project + members + delete any entry */
  manageProject: (role: Role) => role === 'owner',
  /** Owner or contributor: write entries */
  writeEntry: (role: Role) => role === 'owner' || role === 'contributor',
  /** Everyone who is a member can read */
  read: (_role: Role) => true,
  /** Owner, contributor, or viewer_comment can comment */
  comment: (role: Role) =>
    role === 'owner' || role === 'contributor' || role === 'viewer_comment',
}

/**
 * Loads the caller's role for the project named in req.params.projectId
 * (falls back to :id). Attaches it to req.projectRole or 404s if not a member.
 * Must run after requireAuth.
 */
export const loadProjectRole = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.userId) throw unauthorized()
    const p = req.params as Record<string, string>
    const projectId = p.projectId ?? p.id
    if (!projectId) throw notFound('Project not found')

    const [membership] = await db
      .select({ role: projectMembers.role })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, req.userId),
        ),
      )
      .limit(1)

    if (!membership) throw notFound('Project not found')
    req.projectRole = membership.role
    next()
  },
)

/** Guard factory: requires a given capability on the loaded project role */
export function requireCapability(check: (role: Role) => boolean, message = 'You do not have permission to do that') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.projectRole || !check(req.projectRole)) {
      return next(forbidden(message))
    }
    next()
  }
}
