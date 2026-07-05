import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, asc, desc, eq, isNull, ilike, inArray, not, or, SQL } from 'drizzle-orm';
import { db } from '../../../db';
import { planningCycles, goals } from '../../../db/schema/plan';

export type CycleType = 'Yearly' | 'Half-Yearly' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Custom';
export type CycleStatus = 'Active' | 'Completed' | 'Archived';

export interface CreatePlanningCycleData {
  name: string;
  type: CycleType;
  startDate: string;
  endDate: string;
  status?: CycleStatus;
}

export interface UpdatePlanningCycleData {
  name?: string;
  type?: CycleType;
  startDate?: string;
  endDate?: string;
  status?: CycleStatus;
}

export interface PlanningCycleFilters {
  status?: CycleStatus;
  type?: CycleType;
  sort?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class PlanningCycleService {
  private buildSort(filters: PlanningCycleFilters) {
    const sortMap: Record<string, { column: any; direction: 'asc' | 'desc' }> = {
      newest: { column: planningCycles.createdAt, direction: 'desc' },
      oldest: { column: planningCycles.createdAt, direction: 'asc' },
      deadline: { column: planningCycles.endDate, direction: 'asc' },
    };

    return filters.sort && sortMap[filters.sort] ? sortMap[filters.sort] : sortMap.newest;
  }

  /** Attaches each cycle's goals and a computed overall progress percentage. */
  private async withGoals<T extends { id: string }>(userId: string, cycles: T[]) {
    if (cycles.length === 0) return [];

    const cycleIds = cycles.map((cycle) => cycle.id);
    const relatedGoals = await db
      .select()
      .from(goals)
      .where(and(inArray(goals.planningCycleId, cycleIds), eq(goals.userId, userId), isNull(goals.deletedAt)));

    return cycles.map((cycle) => {
      const cycleGoals = relatedGoals.filter((goal) => goal.planningCycleId === cycle.id);
      const progress = cycleGoals.length
        ? Math.round(cycleGoals.reduce((sum, goal) => sum + goal.progress, 0) / cycleGoals.length)
        : 0;

      return {
        ...cycle,
        goals: cycleGoals,
        goalCount: cycleGoals.length,
        completedGoalCount: cycleGoals.filter((goal) => goal.status === 'Completed').length,
        progress,
      };
    });
  }

  async list(userId: string, filters: PlanningCycleFilters = {}) {
    const conditions = [eq(planningCycles.userId, userId), isNull(planningCycles.deletedAt)];

    if (filters.status) conditions.push(eq(planningCycles.status, filters.status));
    if (filters.type) conditions.push(eq(planningCycles.type, filters.type));

    if (filters.search) {
      const query = `%${filters.search.trim()}%`;
      const searchConditions: SQL[] = [ilike(planningCycles.name, query)].filter(
        (condition): condition is SQL => !!condition,
      );
      if (searchConditions.length > 0) {
        conditions.push(or(...searchConditions)!);
      }
    }

    const sort = this.buildSort(filters);
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? Math.min(filters.pageSize, 50) : 20;

    const list = await db
      .select()
      .from(planningCycles)
      .where(and(...conditions))
      .orderBy(sort.direction === 'asc' ? asc(sort.column) : desc(sort.column))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      cycles: await this.withGoals(userId, list),
      page,
      pageSize,
    };
  }

  async search(userId: string, filters: PlanningCycleFilters = {}) {
    return this.list(userId, filters);
  }

  async dashboard(userId: string) {
    const allCycles = await db
      .select()
      .from(planningCycles)
      .where(and(eq(planningCycles.userId, userId), isNull(planningCycles.deletedAt)));

    const allGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)));

    const today = new Date().toISOString().slice(0, 10);

    return {
      totalCycles: allCycles.length,
      activeCycles: allCycles.filter((cycle) => cycle.status === 'Active').length,
      completedCycles: allCycles.filter((cycle) => cycle.status === 'Completed').length,
      upcomingCycles: allCycles.filter(
        (cycle) => cycle.status !== 'Completed' && cycle.status !== 'Archived' && cycle.startDate > today,
      ).length,
      overdueCycles: allCycles.filter(
        (cycle) => cycle.status !== 'Completed' && cycle.status !== 'Archived' && cycle.endDate < today,
      ).length,
      totalGoals: allGoals.length,
      completedGoals: allGoals.filter((goal) => goal.status === 'Completed').length,
      inProgressGoals: allGoals.filter((goal) => goal.status === 'In Progress').length,
    };
  }

  async get(userId: string, cycleId: string) {
    const [cycle] = await db
      .select()
      .from(planningCycles)
      .where(
        and(eq(planningCycles.id, cycleId), eq(planningCycles.userId, userId), isNull(planningCycles.deletedAt)),
      );

    if (!cycle) throw new NotFoundException('Planning cycle not found');

    const [withGoals] = await this.withGoals(userId, [cycle]);
    return withGoals;
  }

  /** Internal helper (no goals attached) — used by GoalService for ownership checks. */
  async getRaw(userId: string, cycleId: string) {
    const [cycle] = await db
      .select()
      .from(planningCycles)
      .where(
        and(eq(planningCycles.id, cycleId), eq(planningCycles.userId, userId), isNull(planningCycles.deletedAt)),
      );

    if (!cycle) throw new NotFoundException('Planning cycle not found');
    return cycle;
  }

  async create(userId: string, data: CreatePlanningCycleData) {
    const name = data.name.trim();

    const existing = await db
      .select()
      .from(planningCycles)
      .where(
        and(
          eq(planningCycles.userId, userId),
          eq(planningCycles.name, name),
          eq(planningCycles.type, data.type),
          isNull(planningCycles.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length) {
      throw new BadRequestException('A planning cycle with the same name and type already exists.');
    }

    const [cycle] = await db
      .insert(planningCycles)
      .values({
        userId,
        name,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status ?? 'Active',
      })
      .returning();

    return { ...cycle, goals: [], goalCount: 0, completedGoalCount: 0, progress: 0 };
  }

  async update(userId: string, cycleId: string, data: UpdatePlanningCycleData) {
    const cycle = await this.getRaw(userId, cycleId);
    const nextName = data.name?.trim() ?? cycle.name;
    const nextType = data.type ?? cycle.type;

    const duplicate = await db
      .select()
      .from(planningCycles)
      .where(
        and(
          eq(planningCycles.userId, userId),
          eq(planningCycles.name, nextName),
          eq(planningCycles.type, nextType),
          isNull(planningCycles.deletedAt),
          not(eq(planningCycles.id, cycleId)),
        ),
      )
      .limit(1);

    if (duplicate.length) {
      throw new BadRequestException('A planning cycle with the same name and type already exists.');
    }

    await db
      .update(planningCycles)
      .set({ ...data, name: nextName, updatedAt: new Date() })
      .where(and(eq(planningCycles.id, cycleId), eq(planningCycles.userId, userId)));

    return this.get(userId, cycleId);
  }

  async delete(userId: string, cycleId: string) {
    await this.getRaw(userId, cycleId);

    // Soft-delete the cycle and cascade the soft-delete to its goals.
    await db
      .update(planningCycles)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(planningCycles.id, cycleId), eq(planningCycles.userId, userId)));

    await db
      .update(goals)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(goals.planningCycleId, cycleId), eq(goals.userId, userId)));
  }

  async archive(userId: string, cycleId: string) {
    await this.getRaw(userId, cycleId);

    await db
      .update(planningCycles)
      .set({ status: 'Archived', archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(planningCycles.id, cycleId), eq(planningCycles.userId, userId)));

    return this.get(userId, cycleId);
  }
}
