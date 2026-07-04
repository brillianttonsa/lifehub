import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import { activities } from '../../db/schema/pocket/activities';

@Injectable()
export class ActivityService {
  async create(userId: string, name: string) {
    const clean = name.trim().toLowerCase();

    if (!clean) {
      throw new BadRequestException('Activity name is required');
    }

    const existing = await db.query.activities.findFirst({
      where: and(eq(activities.userId, userId), eq(activities.name, clean)),
    });

    if (existing) {
      if (existing.isDeleted) {
        throw new ConflictException('Activity exists but was deleted. Please restore it instead.');
      }
      throw new ConflictException('Activity already exists');
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
    const isDeleted = status === 'deleted' ? true : status === 'active' ? false : false;

    return db
      .select()
      .from(activities)
      .where(and(eq(activities.userId, userId), eq(activities.isDeleted, isDeleted)));
  }

  async delete(userId: string, id: string) {
    const activity = await db.query.activities.findFirst({
      where: and(eq(activities.id, id), eq(activities.userId, userId), eq(activities.isDeleted, false)),
    });

    if (!activity) {
      throw new NotFoundException('Activity not found');
    }

    if (activity.isDefault) {
      throw new BadRequestException('Default activities cannot be deleted');
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
      where: and(eq(activities.id, id), eq(activities.userId, userId), eq(activities.isDeleted, true)),
    });

    if (!activity) {
      throw new NotFoundException('Activity not found or not deleted');
    }

    const existing = await db.query.activities.findFirst({
      where: and(eq(activities.userId, userId), eq(activities.name, activity.name), eq(activities.isDeleted, false)),
    });

    if (existing) {
      throw new ConflictException('Cannot restore. Active activity with same name exists.');
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
