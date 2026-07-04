import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { and, asc, desc, eq, isNull, ilike, not, or, SQL } from 'drizzle-orm';
import { db } from '../../db';
import { plans } from '../../db/schema/plan';

export type TimeframeType = "Yearly" | "Half-Yearly" | "Quarterly" | "Monthly" | "Weekly" | "Custom Range";
export type PriorityType = "Low" | "Medium" | "High";
export type StatusType = "Draft" | "Active" | "Completed" | "Archived" | "Cancelled";

export interface CreatePlanData {
  title: string;
  description?: string;
  timeframe: TimeframeType;
  startDate: string;
  endDate: string;
  priority?: PriorityType;
  status?: StatusType;
  progress?: number;
  notes?: string;
}

export interface UpdatePlanData {
  title?: string;
  description?: string;
  timeframe?: TimeframeType;
  startDate?: string;
  endDate?: string;
  priority?: PriorityType;
  status?: StatusType;
  progress?: number;
  notes?: string;
}

export interface UpdateProgressData {
  progress: number;
}

export interface PlanFilters {
  status?: StatusType;
  timeframe?: TimeframeType;
  priority?: PriorityType;
  sort?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class PlanService {
  private buildSort(filters: PlanFilters) {
    const sortMap: Record<string, { column: any; direction: 'asc' | 'desc' }> = {
      newest: { column: plans.createdAt, direction: 'desc' },
      oldest: { column: plans.createdAt, direction: 'asc' },
      deadline: { column: plans.endDate, direction: 'asc' },
      priority: { column: plans.priority, direction: 'desc' },
      progress: { column: plans.progress, direction: 'desc' },
    };

    return filters.sort && sortMap[filters.sort] ? sortMap[filters.sort] : sortMap.newest;
  }

  async list(userId: string, filters: PlanFilters = {}) {
    const conditions = [eq(plans.userId, userId), isNull(plans.deletedAt)];

    if (filters.status) conditions.push(eq(plans.status, filters.status));
    if (filters.timeframe) conditions.push(eq(plans.timeframe, filters.timeframe));
    if (filters.priority) conditions.push(eq(plans.priority, filters.priority));

    if (filters.search) {
      const query = `%${filters.search.trim()}%`;

      const searchConditions: SQL[] = [
        ilike(plans.title, query),
        ilike(plans.description, query),
        ilike(plans.notes, query),
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
      .from(plans)
      .where(and(...conditions))
      .orderBy(sort.direction === 'asc' ? asc(sort.column) : desc(sort.column))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    return {
      plans: list,
      page,
      pageSize,
    };
  }

  async search(userId: string, filters: PlanFilters = {}) {
    return this.list(userId, filters);
  }

  async dashboard(userId: string) {
    const allPlans = await db
      .select()
      .from(plans)
      .where(and(eq(plans.userId, userId), isNull(plans.deletedAt)));

    const today = new Date().toISOString().slice(0, 10);

    return {
      totalPlans: allPlans.length,
      activePlans: allPlans.filter((plan) => plan.status === 'Active').length,
      completedPlans: allPlans.filter((plan) => plan.status === 'Completed').length,
      upcomingPlans: allPlans.filter(
        (plan) =>
          plan.status !== 'Completed' &&
          plan.status !== 'Archived' &&
          plan.startDate > today,
      ).length,
      overduePlans: allPlans.filter(
        (plan) =>
          plan.status !== 'Completed' &&
          plan.status !== 'Archived' &&
          plan.endDate < today,
      ).length,
    };
  }

  async get(userId: string, planId: string) {
    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.userId, userId), isNull(plans.deletedAt)));

    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async create(userId: string, data: CreatePlanData) {
    const title = data.title.trim();
    const timeframe = data.timeframe;
    const existing = await db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.userId, userId),
          eq(plans.title, title),
          eq(plans.timeframe, timeframe),
          isNull(plans.deletedAt),
        ),
      )
      .limit(1);

    if (existing.length) {
      throw new BadRequestException('A plan with the same title and timeframe already exists.');
    }

    const [plan] = await db
      .insert(plans)
      .values({
        userId,
        title,
        description: data.description ?? '',
        timeframe: data.timeframe,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority ?? 'Medium',
        status: data.status ?? 'Active',
        progress: data.progress ?? 0,
        notes: data.notes ?? '',
      })
      .returning();

    return plan;
  }

  async update(userId: string, planId: string, data: UpdatePlanData) {
    const plan = await this.get(userId, planId);
    const nextTitle = data.title?.trim() ?? plan.title;
    const nextTimeframe = data.timeframe ?? plan.timeframe;

    const duplicate = await db
      .select()
      .from(plans)
      .where(
        and(
          eq(plans.userId, userId),
          eq(plans.title, nextTitle),
          eq(plans.timeframe, nextTimeframe),
          isNull(plans.deletedAt),
          not(eq(plans.id, planId)),
        ),
      )
      .limit(1);

    if (duplicate.length) {
      throw new BadRequestException('A plan with the same title and timeframe already exists.');
    }

    const updatePayload: UpdatePlanData = {
      ...data,
    };

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
      .update(plans)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)));

    return this.get(userId, planId);
  }

  async delete(userId: string, planId: string) {
    await db
      .update(plans)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)));
  }

  async archive(userId: string, planId: string) {
    await db
      .update(plans)
      .set({ status: 'Archived', archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)));

    return this.get(userId, planId);
  }

  async updateProgress(userId: string, planId: string, data: UpdateProgressData) {
    const plan = await this.get(userId, planId);
    const progress = Math.max(0, Math.min(100, data.progress));
    const status: StatusType = progress === 100 ? 'Completed' : plan.status === 'Completed' ? 'Completed' : plan.status;

    await db
      .update(plans)
      .set({ progress, status, updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)));

    return this.get(userId, planId);
  }
}