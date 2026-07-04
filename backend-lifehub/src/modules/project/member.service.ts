import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { projectMembers, projects, type Role } from '../../db/schema/project';
import {users} from '../../db/schema/auth/users';

export class MemberService {
  async listMembers(projectId: string) {
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
      .where(eq(projectMembers.projectId, projectId));
  }

  async addMember(projectId: string, email: string, role: Role) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new NotFoundException('No user found with that email');
    }

    const [existing] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, user.id),
        ),
      )
      .limit(1);

    if (existing) {
      throw new ConflictException('User already a member');
    }

    await db.insert(projectMembers).values({
      projectId,
      userId: user.id,
      role,
    });

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role,
    };
  }

  async updateMember(projectId: string, userId: string, role: Role) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId === userId) {
      throw new BadRequestException("Owner's role cannot be changed");
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
      .returning();

    if (!updated) {
      throw new NotFoundException('Member not found');
    }

    const [user] = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return { ...user, role };
  }

  async removeMember(projectId: string, userId: string) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId === userId) {
      throw new BadRequestException('Owner cannot be removed');
    }

    await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      );
  }
}
