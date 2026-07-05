import { Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, isNull, ilike, or, SQL } from 'drizzle-orm';
import { db } from '../../../db';
import { goals } from '../../../db/schema/plan';
import { PlanningCycleService } from '../planning-cycle/planning-cycle.service';

export type GoalPriority = 'Low' | 'Medium' | 'High';
export type GoalStatus = 'Pending' | 'In Progress' | 'Completed';

export interface CreateGoalData {
  title: string;
  description?: string;
  priority?: GoalPriority;
  status?: GoalStatus;
  progress?: number;
  notes?: string;
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  priority?: GoalPriority;
  status?: GoalStatus;
  progress?: number;
  notes?: string;
  planningCycleId?: string;
}

export interface GoalFilters {
  status?: GoalStatus;
  priority?: GoalPriority;
  sort?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class GoalService {
  constructor(private readonly planningCycleService: PlanningCycleService) {}

  private buildSort(filters: GoalFilters) {
    const sortMap: Record<string, { column: any; direction: 'asc' | 'desc' }> = {
      newest: { column: goals.createdAt, direction: 'desc' },
      oldest: { column: goals.createdAt, direction: 'asc' },
      priority: { column: goals.priority, direction: 'desc' },
      progress: { column: goals.progress, direction: 'desc' },
    };

    return filters.sort && sortMap[filters.sort] ? sortMap[filters.sort] : sortMap.newest;
  }

  async listByCycle(userId: string, cycleId: string, filters: GoalFilters = {}) {
    // Ensures the cycle exists and belongs to this user before exposing its goals.
    await this.planningCycleService.getRaw(userId, cycleId);

    const conditions = [
      eq(goals.planningCycleId, cycleId),
      eq(goals.userId, userId),
      isNull(goals.deletedAt),
    ];

    if (filters.status) conditions.push(eq(goals.status, filters.status));
    if (filters.priority) conditions.push(eq(goals.priority, filters.priority));

    if (filters.search) {
      const query = `%${filters.search.trim()}%`;
      const searchConditions: SQL[] = [
        ilike(goals.title, query),
        ilike(goals.description, query),
        ilike(goals.notes, query),
      ].filter((condition): condition is SQL => !!condition);

      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions)!);
      }
    }

    const sort = this.buildSort(filters);
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? Math.min(filters.pageSize, 50) : 20;

    const list = await db
      .select()
      .from(goals)
      .where(and(...conditions))
      .orderBy(sort.direction === 'asc' ? asc(sort.column) : desc(sort.column))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return { goals: list, page, pageSize };
  }

  async get(userId: string, goalId: string) {
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId), isNull(goals.deletedAt)));

    if (!goal) throw new NotFoundException('Goal not found');
    return goal;
  }

  async create(userId: string, cycleId: string, data: CreateGoalData) {
    // Ensures the cycle exists and belongs to this user before attaching a goal to it.
    await this.planningCycleService.getRaw(userId, cycleId);

    const [goal] = await db
      .insert(goals)
      .values({
        planningCycleId: cycleId,
        userId,
        title: data.title.trim(),
        description: data.description ?? '',
        priority: data.priority ?? 'Medium',
        status: data.status ?? 'Pending',
        progress: data.progress ?? 0,
        notes: data.notes ?? '',
      })
      .returning();

    return goal;
  }

  async update(userId: string, goalId: string, data: UpdateGoalData) {
    await this.get(userId, goalId);

    if (data.planningCycleId) {
      // Ensures the destination cycle also belongs to this user.
      await this.planningCycleService.getRaw(userId, data.planningCycleId);
    }

    const updatePayload: UpdateGoalData = { ...data };

    if (data.progress !== undefined) {
      updatePayload.progress = Math.max(0, Math.min(100, data.progress));
      if (updatePayload.progress === 100) {
        updatePayload.status = 'Completed';
      }
    }

    if (data.status === 'Completed' && updatePayload.progress === undefined) {
      updatePayload.progress = 100;
    }

    await db
      .update(goals)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

    return this.get(userId, goalId);
  }

  async delete(userId: string, goalId: string) {
    await this.get(userId, goalId);

    await db
      .update(goals)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
  }

  async updateProgress(userId: string, goalId: string, progressValue: number) {
    const goal = await this.get(userId, goalId);
    const progress = Math.max(0, Math.min(100, progressValue));
    const status: GoalStatus =
      progress === 100 ? 'Completed' : progress > 0 && goal.status === 'Pending' ? 'In Progress' : goal.status;

    await db
      .update(goals)
      .set({ progress, status, updatedAt: new Date() })
      .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

    return this.get(userId, goalId);
  }
}
