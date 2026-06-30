import { db } from '../../../db';
import { activities } from '../../../db/schema/pocket/activities';
import { eq, and } from 'drizzle-orm';
import { AppError } from '../../../utils/AppError';

export class ActivityService {
  async create(userId: string, name: string) {
    const clean = name.trim().toLowerCase();

    if (!clean) {
      throw new AppError('Activity name is required', 400);
    }

    const existing = await db.query.activities.findFirst({
      where: and(eq(activities.userId, userId), eq(activities.name, clean)),
    });

    if (existing) {
      if (existing.isDeleted) {
        throw new AppError(
          'Activity exists but was deleted. Please restore it instead.',
          409,
        );
      }

      throw new AppError('Activity already exists', 409);
    }

    const [activity] = await db
      .insert(activities)
      .values({
        userId,
        name: clean,
        isDefault: false,
      })
      .returning();

    return activity;
  }

  async getUserActivities(userId: string, status?: string) {
    const isDeleted =
      status === 'deleted' ? true : status === 'active' ? false : false; // default = active

    return db
      .select()
      .from(activities)
      .where(
        and(eq(activities.userId, userId), eq(activities.isDeleted, isDeleted)),
      );
  }

  async delete(userId: string, id: string) {
    const activity = await db.query.activities.findFirst({
      where: and(
        eq(activities.id, id),
        eq(activities.userId, userId),
        eq(activities.isDeleted, false),
      ),
    });

    if (!activity) {
      throw new AppError('Activity not found', 404);
    }

    if (activity.isDefault) {
      throw new AppError('Default activities cannot be deleted', 403);
    }

    await db
      .update(activities)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(and(eq(activities.id, id), eq(activities.userId, userId)));

    return { success: true };
  }

  async restore(userId: string, id: string) {
    const activity = await db.query.activities.findFirst({
      where: and(
        eq(activities.id, id),
        eq(activities.userId, userId),
        eq(activities.isDeleted, true), // 🔥 IMPORTANT
      ),
    });

    if (!activity) {
      throw new AppError('Activity not found or not deleted', 404);
    }

    const existing = await db.query.activities.findFirst({
      where: and(
        eq(activities.userId, userId),
        eq(activities.name, activity.name),
        eq(activities.isDeleted, false),
      ),
    });

    if (existing) {
      throw new AppError(
        'Cannot restore. Active activity with same name exists.',
        409,
      );
    }

    await db
      .update(activities)
      .set({
        isDeleted: false,
        updatedAt: new Date(),
        deletedAt: null,
      })
      .where(eq(activities.id, id));

    return { success: true };
  }
}
