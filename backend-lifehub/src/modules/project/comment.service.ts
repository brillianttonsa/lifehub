import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../db';
import { comments, entries, projectMembers, type Role } from '../../db/schema/project';
import { users } from '../../db/schema/auth/users';
import { can } from '../../common/utils/project-permissions';

async function resolveEntryAccess(entryId: string, userId: string) {
  const [entry] = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1);
  if (!entry) {
    throw new NotFoundException('Entry not found');
  }

  const [membership] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, entry.projectId),
        eq(projectMembers.userId, userId),
      ),
    )
    .limit(1);

  if (!membership) {
    throw new NotFoundException('Entry not found');
  }

  return { entry, role: membership.role as Role };
}

export class CommentService {
  async listComments(entryId: string, userId: string) {
    await resolveEntryAccess(entryId, userId);

    return db
      .select({
        id: comments.id,
        entryId: comments.entryId,
        authorId: comments.authorId,
        authorName: users.fullName,
        content: comments.content,
        createdAt: comments.createdAt,
      })
      .from(comments)
      .innerJoin(users, eq(users.id, comments.authorId))
      .where(eq(comments.entryId, entryId))
      .orderBy(asc(comments.createdAt));
  }

  async createComment(entryId: string, userId: string, content: string) {
    const { entry, role } = await resolveEntryAccess(entryId, userId);
    if (!entry.commentsEnabled) {
      throw new BadRequestException('Comments are disabled for this entry');
    }
    if (!can.comment(role)) {
      throw new ForbiddenException('You do not have permission to comment');
    }

    const [row] = await db
      .insert(comments)
      .values({ entryId, authorId: userId, content })
      .returning();

    const [author] = await db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      id: row.id,
      entryId: row.entryId,
      authorId: row.authorId,
      authorName: author?.fullName ?? '',
      content: row.content,
      createdAt: row.createdAt,
    };
  }

  async deleteComment(entryId: string, commentId: string, userId: string) {
    const { role } = await resolveEntryAccess(entryId, userId);

    const [comment] = await db
      .select()
      .from(comments)
      .where(and(eq(comments.id, commentId), eq(comments.entryId, entryId)))
      .limit(1);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isOwner = can.manageProject(role);
    const isAuthor = comment.authorId === userId;
    if (!isOwner && !isAuthor) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await db.delete(comments).where(eq(comments.id, commentId));
  }
}
