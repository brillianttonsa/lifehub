import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { db } from '../../db';
import { disciplineCycles, disciplineTasks, disciplineLogs } from '../../db/schema/discipline';

export type DisciplineCycleStatus = 'active' | 'completed' | 'archived';

export interface CreateCycleData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

const MAX_CYCLE_DAYS = 180;

/** Inclusive list of ISO (YYYY-MM-DD) dates between start and end. */
function enumerateDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);

  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates;
}

@Injectable()
export class DisciplineService {
  // -- Cycles -----------------------------------------------------------------

  async createCycle(userId: string, data: CreateCycleData) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end < start) {
      throw new BadRequestException('End date cannot be before start date.');
    }

    const dayCount = enumerateDates(data.startDate, data.endDate).length;
    if (dayCount > MAX_CYCLE_DAYS) {
      throw new BadRequestException(`A cycle cannot span more than ${MAX_CYCLE_DAYS} days.`);
    }

    const [cycle] = await db
      .insert(disciplineCycles)
      .values({
        userId,
        title: data.title.trim(),
        description: data.description?.trim() ?? '',
        startDate: data.startDate,
        endDate: data.endDate,
      })
      .returning();

    return cycle;
  }

  async listCycles(userId: string) {
    return db
      .select()
      .from(disciplineCycles)
      .where(eq(disciplineCycles.userId, userId))
      .orderBy(asc(disciplineCycles.startDate));
  }

  /** Confirms the cycle exists and belongs to the user; throws otherwise. */
  private async getOwnedCycle(userId: string, cycleId: string) {
    const [cycle] = await db
      .select()
      .from(disciplineCycles)
      .where(eq(disciplineCycles.id, cycleId));

    if (!cycle) throw new NotFoundException('Discipline cycle not found');
    if (cycle.userId !== userId) throw new ForbiddenException('You do not have access to this cycle');

    return cycle;
  }

  async getCycle(userId: string, cycleId: string) {
    return this.getOwnedCycle(userId, cycleId);
  }

  async updateCycleStatus(userId: string, cycleId: string, status: DisciplineCycleStatus) {
    await this.getOwnedCycle(userId, cycleId);

    const [updated] = await db
      .update(disciplineCycles)
      .set({ status, updatedAt: new Date() })
      .where(eq(disciplineCycles.id, cycleId))
      .returning();

    return updated;
  }

  async deleteCycle(userId: string, cycleId: string) {
    await this.getOwnedCycle(userId, cycleId);
    // Tasks and logs cascade-delete via the FK constraints in the schema.
    await db.delete(disciplineCycles).where(eq(disciplineCycles.id, cycleId));
  }

  // -- Tasks --------------------------------------------------------------------

  async createTask(userId: string, cycleId: string, title: string) {
    await this.getOwnedCycle(userId, cycleId);

    const [task] = await db
      .insert(disciplineTasks)
      .values({ cycleId, title: title.trim() })
      .returning();

    return task;
  }

  async listTasks(userId: string, cycleId: string) {
    await this.getOwnedCycle(userId, cycleId);

    return db
      .select()
      .from(disciplineTasks)
      .where(eq(disciplineTasks.cycleId, cycleId))
      .orderBy(asc(disciplineTasks.createdAt));
  }

  /** Confirms the task exists and its parent cycle belongs to the user. */
  private async getOwnedTask(userId: string, taskId: string) {
    const [task] = await db.select().from(disciplineTasks).where(eq(disciplineTasks.id, taskId));
    if (!task) throw new NotFoundException('Task not found');

    await this.getOwnedCycle(userId, task.cycleId);
    return task;
  }

  async updateTask(userId: string, taskId: string, title: string) {
    await this.getOwnedTask(userId, taskId);

    const [updated] = await db
      .update(disciplineTasks)
      .set({ title: title.trim(), updatedAt: new Date() })
      .where(eq(disciplineTasks.id, taskId))
      .returning();

    return updated;
  }

  async deleteTask(userId: string, taskId: string) {
    await this.getOwnedTask(userId, taskId);
    // Logs cascade-delete via the FK constraint in the schema.
    await db.delete(disciplineTasks).where(eq(disciplineTasks.id, taskId));
  }

  // -- Grid + toggle --------------------------------------------------------------

  async getGrid(userId: string, cycleId: string) {
    const cycle = await this.getOwnedCycle(userId, cycleId);

    const tasks = await db
      .select()
      .from(disciplineTasks)
      .where(eq(disciplineTasks.cycleId, cycleId))
      .orderBy(asc(disciplineTasks.createdAt));

    const dates = enumerateDates(cycle.startDate, cycle.endDate);

    const taskIds = tasks.map((task) => task.id);
    const logs = taskIds.length
      ? await db.select().from(disciplineLogs).where(inArray(disciplineLogs.taskId, taskIds))
      : [];

    // logsByTask[taskId][date] = boolean
    const logsByTask: Record<string, Record<string, boolean>> = {};
    for (const task of tasks) logsByTask[task.id] = {};
    for (const log of logs) {
      logsByTask[log.taskId][log.date] = log.isDone;
    }

    const totalCells = tasks.length * dates.length;
    const doneCells = logs.filter((log) => log.isDone).length;
    const disciplineScore = totalCells > 0 ? Math.round((doneCells / totalCells) * 10000) / 100 : 0;

    return {
      cycle,
      tasks,
      dates,
      logs: logsByTask,
      totalCells,
      doneCells,
      disciplineScore,
    };
  }

  async toggleCell(userId: string, taskId: string, date: string) {
    const task = await this.getOwnedTask(userId, taskId);

    const cycle = await this.getOwnedCycle(userId, task.cycleId);
    if (date < cycle.startDate || date > cycle.endDate) {
      throw new BadRequestException('Date is outside the cycle range.');
    }

    const [existing] = await db
      .select()
      .from(disciplineLogs)
      .where(and(eq(disciplineLogs.taskId, taskId), eq(disciplineLogs.date, date)));

    if (existing) {
      const [updated] = await db
        .update(disciplineLogs)
        .set({ isDone: !existing.isDone, updatedAt: new Date() })
        .where(eq(disciplineLogs.id, existing.id))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(disciplineLogs)
      .values({ userId, taskId, date, isDone: true })
      .returning();

    return created;
  }
}
