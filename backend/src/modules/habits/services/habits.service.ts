import { AppError } from "../../../shared/errors";
import pool from "../../../config/db";
import { habitsRepo } from "../repositories/habits.repository";

export const habitsService = {
  listHabitSets(userId: string) {
    return habitsRepo.listSets(userId);
  },

  async createHabitSet(input: {
    userId: string;
    title: string;
    goalDescription?: string;
    cycleUnit: "DAY" | "WEEK" | "MONTH";
    cycleLength: number;
    startDate: string;
    habits: Array<{ name: string; targetCountPerDay?: number }>;
  }) {
    const start = new Date(input.startDate);
    const days =
      input.cycleUnit === "DAY"
        ? input.cycleLength
        : input.cycleUnit === "WEEK"
          ? input.cycleLength * 7
          : input.cycleLength * 30;
    const end = new Date(start.getTime() + days * 24 * 60 * 60 * 1000);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const created = await habitsRepo.createSet(client, {
        userId: input.userId,
        title: input.title,
        goalDescription: input.goalDescription,
        cycleUnit: input.cycleUnit,
        cycleLength: input.cycleLength,
        startDate: start,
        endDate: end,
        habits: input.habits.map((h) => ({
          name: h.name,
          targetCountPerDay: h.targetCountPerDay ?? 1,
        })),
      });
      await client.query("COMMIT");
      return created;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },

  async checkinHabit(input: {
    userId: string;
    habitId: string;
    checkinDate: string;
    status: "DONE" | "NOT_DONE";
    note?: string;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const ok = await habitsRepo.assertHabitOwnedByUser(client, input.habitId, input.userId);
      if (!ok) throw new AppError("Habit not found", 404, "NOT_FOUND");

      const checkin = await habitsRepo.upsertCheckin(client, {
        userId: input.userId,
        habitId: input.habitId,
        checkinDate: new Date(input.checkinDate),
        status: input.status,
        note: input.note,
      });

      await client.query("COMMIT");
      return checkin;
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  },
};

