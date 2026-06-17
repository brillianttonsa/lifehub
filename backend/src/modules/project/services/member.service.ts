import { and, eq } from 'drizzle-orm'
import { db } from '../../../db'
import { projectMembers, projects, users, Role } from '../../../db/schema'
import { AppError } from '../../../utils/AppError'

export class MemberService {
  static async listMembers(projectId: string) {
    return db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        role: projectMembers.role,
        joinedAt: projectMembers.createdAt,
      })
      .from(projectMembers)
      .innerJoin(users, eq(users.id, projectMembers.userId))
      .where(eq(projectMembers.projectId, projectId))
  }

  static async addMember(projectId: string, email: string, role: Role) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user) throw new AppError('No user found with that email', 404)

    const [existing] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, user.id),
        ),
      )
      .limit(1)

    if (existing) throw new AppError('User already a member', 409)

    await db.insert(projectMembers).values({
      projectId,
      userId: user.id,
      role,
    })

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role,
    }
  }

  static async updateMember(
    projectId: string,
    userId: string,
    role: Role,
  ) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project) throw new AppError('Project not found', 404)

    if (project.ownerId === userId) {
      throw new AppError("Owner's role cannot be changed", 400)
    }

    const [updated] = await db
      .update(projectMembers)
      .set({ role })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
      .returning()

    if (!updated) throw new AppError('Member not found', 404)

    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return { ...user, role }
  }

  static async removeMember(projectId: string, userId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1)

    if (!project) throw new AppError('Project not found', 404)

    if (project.ownerId === userId) {
      throw new AppError('Owner cannot be removed', 400)
    }

    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
  }
}