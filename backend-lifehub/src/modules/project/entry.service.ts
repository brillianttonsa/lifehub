import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { and, desc, eq, inArray, sql, lt } from 'drizzle-orm';
import { db } from '../../db';
import { comments, entries, projectMembers, type Role } from '../../db/schema/project';
import { users } from '../../db/schema/auth/users';
import { can } from '../../common/utils/project-permissions';

const PAGE_SIZE = 20;

export class EntryService {
  private async resolveProjectMembership(projectId: string, userId: string) {
    const [membership] = await db
      .select({ role: projectMembers.role })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId),
        ),
      )
      .limit(1);

    if (!membership) {
      throw new NotFoundException('Project not found');
    }

    return membership.role as Role;
  }

  async listEntries(projectId: string, cursor?: string) {
    const conditions = [eq(entries.projectId, projectId)];

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!isNaN(cursorDate.getTime())) {
        conditions.push(lt(entries.createdAt, cursorDate));
      }
    }

    const rows = await db
      .select({
        id: entries.id,
        projectId: entries.projectId,
        authorId: entries.authorId,
        authorName: users.fullName,
        content: entries.content,
        entryDate: entries.entryDate,
        commentsEnabled: entries.commentsEnabled,
        createdAt: entries.createdAt,
        updatedAt: entries.updatedAt,
      })
      .from(entries)
      .innerJoin(users, eq(users.id, entries.authorId))
      .where(and(...conditions))
      .orderBy(desc(entries.createdAt))
      .limit(PAGE_SIZE + 1);

    const hasMore = rows.length > PAGE_SIZE;
    const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
    const ids = page.map((r) => r.id);
    const countMap = new Map<string, number>();

    if (ids.length) {
      const counts = await db
        .select({ entryId: comments.entryId, count: sql<number>`count(*)::int` })
        .from(comments)
        .where(inArray(comments.entryId, ids))
        .groupBy(comments.entryId);

      counts.forEach((c) => countMap.set(c.entryId, c.count));
    }

    return { page, hasMore, countMap };
  }

  async createEntry(projectId: string, userId: string, data: { content: string; entryDate: string; commentsEnabled: boolean }) {
    const role = await this.resolveProjectMembership(projectId, userId);
    if (!can.writeEntry(role)) {
      throw new ForbiddenException('You do not have permission to write entries');
    }

    const [row] = await db
      .insert(entries)
      .values({
        projectId,
        authorId: userId,
        content: data.content,
        entryDate: data.entryDate,
        commentsEnabled: data.commentsEnabled,
      })
      .returning();

    const [author] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return { row, authorName: author?.fullName ?? '' };
  }

  async updateEntry(
    projectId: string,
    entryId: string,
    userId: string,
    data: { content?: string; entryDate?: string; commentsEnabled?: boolean },
  ) {
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, entryId), eq(entries.projectId, projectId)))
      .limit(1);

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    const role = await this.resolveProjectMembership(projectId, userId);
    const isOwner = can.manageProject(role);
    const isAuthor = entry.authorId === userId;
    if (!isOwner && !isAuthor) {
      throw new ForbiddenException('You can only update your own entries');
    }

    const [updated] = await db
      .update(entries)
      .set({
        content: data.content ?? entry.content,
        entryDate: data.entryDate ?? entry.entryDate,
        commentsEnabled: data.commentsEnabled ?? entry.commentsEnabled,
        updatedAt: new Date(),
      })
      .where(and(eq(entries.id, entryId), eq(entries.projectId, projectId)))
      .returning();

    return updated;
  }

  async deleteEntry(projectId: string, entryId: string, userId: string) {
    const [entry] = await db
      .select()
      .from(entries)
      .where(and(eq(entries.id, entryId), eq(entries.projectId, projectId)))
      .limit(1);

    if (!entry) {
      throw new NotFoundException('Entry not found');
    }

    const role = await this.resolveProjectMembership(projectId, userId);
    const isOwner = can.manageProject(role);
    const isAuthor = entry.authorId === userId;
    if (!isOwner && !isAuthor) {
      throw new ForbiddenException('You can only delete your own entries');
    }

    await db.delete(entries).where(eq(entries.id, entryId));
  }
}
