import { prisma } from "../../config/prisma";
import { AppError } from "../../shared/errors";

class HabitsService {
  async createHabitSet(input: {
    workspaceId: string;
    actorUserId: string;
    title: string;
    goalDescription?: string;
    cycleUnit: "WEEK" | "MONTH";
    cycleLength: number;
    startDate: string;
    habits: Array<{ name: string; targetCountPerDay?: number }>;
  }) {
    const start = new Date(input.startDate);
    const days = input.cycleUnit === "WEEK" ? input.cycleLength * 7 : input.cycleLength * 30;
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

    return prisma.habitSet.create({
      data: {
        workspaceId: input.workspaceId,
        createdBy: input.actorUserId,
        title: input.title,
        goalDescription: input.goalDescription,
        cycleUnit: input.cycleUnit,
        cycleLength: input.cycleLength,
        startDate: start,
        endDate: end,
        habits: {
          create: input.habits.map((h) => ({
            workspaceId: input.workspaceId,
            name: h.name,
            targetCountPerDay: h.targetCountPerDay ?? 1,
          })),
        },
      },
      include: { habits: true },
    });
  }

  async listHabitSets(workspaceId: string) {
    return prisma.habitSet.findMany({
      where: { workspaceId, deletedAt: null },
      include: { habits: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async checkinHabit(input: {
    workspaceId: string;
    actorUserId: string;
    habitId: string;
    checkinDate: string;
    status: "DONE" | "NOT_DONE";
    note?: string;
  }) {
    const habit = await prisma.habit.findFirst({
      where: { id: input.habitId, workspaceId: input.workspaceId, deletedAt: null },
      include: { habitSet: true },
    });
    if (!habit) throw new AppError("Habit not found", 404, "NOT_FOUND");
    if (habit.habitSet.status !== "ACTIVE") throw new AppError("Habit set is not active", 400, "HABIT_SET_CLOSED");

    return prisma.habitCheckin.upsert({
      where: {
        habitId_checkinDate: {
          habitId: input.habitId,
          checkinDate: new Date(input.checkinDate),
        },
      },
      update: {
        status: input.status,
        note: input.note,
        checkedBy: input.actorUserId,
      },
      create: {
        workspaceId: input.workspaceId,
        habitId: input.habitId,
        checkinDate: new Date(input.checkinDate),
        status: input.status,
        note: input.note,
        checkedBy: input.actorUserId,
      },
    });
  }

  async closeExpiredSets(workspaceId: string) {
    const now = new Date();
    const updated = await prisma.habitSet.updateMany({
      where: { workspaceId, status: "ACTIVE", autoCloseEnabled: true, endDate: { lt: now } },
      data: { status: "CLOSED", closedAt: now, summaryGeneratedAt: now },
    });
    return { closedCount: updated.count };
  }
}

export const habitsService = new HabitsService();
