import { and, asc, desc, eq, isNull, ilike, like, not, or } from 'drizzle-orm'
import { db } from '../../../db'
import { plans } from '../../../db/schema/plan'
import { AppError } from '../../../utils/AppError'

export interface CreatePlanData {
  title: string
  description?: string
  timeframe: string
  startDate: string
  endDate: string
  priority?: string
  status?: string
  progress?: number
  notes?: string
}

export interface UpdatePlanData {
  title?: string
  description?: string
  timeframe?: string
  startDate?: string
  endDate?: string
  priority?: string
  status?: string
  progress?: number
  notes?: string
}

export interface UpdateProgressData {
  progress: number
}

export interface PlanFilters {
  status?: string
  timeframe?: string
  priority?: string
  sort?: string
  search?: string
  page?: number
  pageSize?: number
}

export class PlanService {
  static async list(userId: string, filters: PlanFilters = {}) {
    const conditions = [eq(plans.userId, userId), isNull(plans.deletedAt)]

    if (filters.status) {
      conditions.push(eq(plans.status, filters.status))
    }

    if (filters.timeframe) {
      conditions.push(eq(plans.timeframe, filters.timeframe))
    }

    if (filters.priority) {
      conditions.push(eq(plans.priority, filters.priority))
    }

    if (filters.search) {
      const query = `%${filters.search.trim()}%`
      conditions.push(
        or(
          ilike(plans.title, query),
          ilike(plans.description, query),
          ilike(plans.notes, query),
        ),
      )
    }

    const sortMap: Record<string, { column: any; direction: 'asc' | 'desc' }> = {
      newest: { column: plans.createdAt, direction: 'desc' },
      oldest: { column: plans.createdAt, direction: 'asc' },
      deadline: { column: plans.endDate, direction: 'asc' },
      priority: { column: plans.priority, direction: 'desc' },
      progress: { column: plans.progress, direction: 'desc' },
    }

    const sort = filters.sort && sortMap[filters.sort] ? sortMap[filters.sort] : sortMap.newest
    const page = filters.page && filters.page > 0 ? filters.page : 1
    const pageSize = filters.pageSize && filters.pageSize > 0 ? Math.min(filters.pageSize, 50) : 20

    const list = await db
      .select()
      .from(plans)
      .where(and(...conditions))
      .orderBy(sort.direction === 'asc' ? asc(sort.column) : desc(sort.column))
      .limit(pageSize)
      .offset((page - 1) * pageSize)

    return {
      plans: list,
      page,
      pageSize,
    }
  }

  static async search(userId: string, filters: PlanFilters = {}) {
    return this.list(userId, filters)
  }

  static async dashboard(userId: string) {
    const allPlans = await db
      .select()
      .from(plans)
      .where(and(eq(plans.userId, userId), isNull(plans.deletedAt)))

    const today = new Date().toISOString().slice(0, 10)

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
    }
  }

  static async get(userId: string, planId: string) {
    const [plan] = await db
      .select()
      .from(plans)
      .where(and(eq(plans.id, planId), eq(plans.userId, userId), isNull(plans.deletedAt)))

    if (!plan) {
      throw new AppError('Plan not found', 404)
    }

    return plan
  }

  static async create(userId: string, data: CreatePlanData) {
    const title = data.title.trim()
    const timeframe = data.timeframe

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
      .limit(1)

    if (existing.length) {
      throw new AppError('A plan with the same title and timeframe already exists.', 400)
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
      .returning()

    return plan
  }

  static async update(userId: string, planId: string, data: UpdatePlanData) {
    const plan = await this.get(userId, planId)
    const nextTitle = data.title?.trim() ?? plan.title
    const nextTimeframe = data.timeframe ?? plan.timeframe

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
      .limit(1)

    if (duplicate.length) {
      throw new AppError('A plan with the same title and timeframe already exists.', 400)
    }

    const updatePayload: Record<string, unknown> = { ...data }

    if (data.progress !== undefined) {
      updatePayload.progress = Math.max(0, Math.min(100, data.progress))
      if (updatePayload.progress === 100) {
        updatePayload.status = 'Completed'
      }
    }

    if (data.status === 'Completed' && updatePayload.progress === undefined) {
      updatePayload.progress = 100
    }

    await db
      .update(plans)
      .set({ ...updatePayload, updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)))

    return this.get(userId, planId)
  }

  static async delete(userId: string, planId: string) {
    await db
      .update(plans)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)))
  }

  static async archive(userId: string, planId: string) {
    await db
      .update(plans)
      .set({ status: 'Archived', archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)))

    return this.get(userId, planId)
  }

  static async updateProgress(userId: string, planId: string, data: UpdateProgressData) {
    const plan = await this.get(userId, planId)
    const progress = Math.max(0, Math.min(100, data.progress))
    const status = progress === 100 ? 'Completed' : plan.status === 'Completed' ? 'Completed' : plan.status

    await db
      .update(plans)
      .set({ progress, status, updatedAt: new Date() })
      .where(and(eq(plans.id, planId), eq(plans.userId, userId)))

    return this.get(userId, planId)
  }
}
