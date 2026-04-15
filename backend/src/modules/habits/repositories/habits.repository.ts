import pool from "../../../config/db";
import type { PoolClient } from "pg";
import type { HabitSetWithHabits } from "../types/habits.types";

function mapSet(row: any) {
  return {
    id: row.id,
    userId: row.userId,
    title: row.title,
    goalDescription: row.goalDescription ?? undefined,
    cycleUnit: row.cycleUnit,
    cycleLength: Number(row.cycleLength),
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  };
}

export const habitsRepo = {
  async listSets(userId: string): Promise<HabitSetWithHabits[]> {
    const { rows } = await pool.query(
      `
      SELECT
        hs."id" as "id",
        hs."user_id" as "userId",
        hs."title" as "title",
        hs."goal_description" as "goalDescription",
        hs."cycle_unit" as "cycleUnit",
        hs."cycle_length" as "cycleLength",
        hs."start_date" as "startDate",
        hs."end_date" as "endDate",
        hs."status" as "status",
        hs."created_at" as "createdAt",
        hs."updated_at" as "updatedAt",
        hs."deleted_at" as "deletedAt"
      FROM "HabitSet" hs
      WHERE hs."user_id" = $1
        AND hs."deleted_at" IS NULL
      ORDER BY hs."created_at" DESC
      `,
      [userId],
    );

    if (rows.length === 0) return [];

    const sets = rows.map(mapSet);
    const setIds = sets.map((s) => s.id);

    const habitsRes = await pool.query(
      `
      SELECT
        h."id" as "id",
        h."habit_set_id" as "habitSetId",
        h."name" as "name",
        h."target_count_per_day" as "targetCountPerDay"
      FROM "Habit" h
      WHERE h."user_id" = $1
        AND h."habit_set_id" = ANY($2::uuid[])
        AND h."deleted_at" IS NULL
      ORDER BY h."created_at" ASC
      `,
      [userId, setIds],
    );

    const bySet: Record<string, Array<{ id: string; name: string; targetCountPerDay: number }>> = {};
    for (const h of habitsRes.rows) {
      const setId = h.habitSetId;
      if (!bySet[setId]) bySet[setId] = [];
      bySet[setId].push({
        id: h.id,
        name: h.name,
        targetCountPerDay: Number(h.targetCountPerDay),
      });
    }

    return sets.map((s) => ({
      ...s,
      habits: bySet[s.id] ?? [],
    }));
  },

  async createSet(
    client: PoolClient,
    input: {
      userId: string;
      title: string;
      goalDescription?: string;
      cycleUnit: "DAY" | "WEEK" | "MONTH";
      cycleLength: number;
      startDate: Date;
      endDate: Date;
      habits: Array<{ name: string; targetCountPerDay: number }>;
    },
  ): Promise<HabitSetWithHabits> {
    const { rows } = await client.query(
      `
      INSERT INTO "HabitSet" (
        "user_id",
        "title",
        "goal_description",
        "cycle_unit",
        "cycle_length",
        "start_date",
        "end_date",
        "status"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "title" as "title",
        "goal_description" as "goalDescription",
        "cycle_unit" as "cycleUnit",
        "cycle_length" as "cycleLength",
        "start_date" as "startDate",
        "end_date" as "endDate",
        "status" as "status",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt",
        "deleted_at" as "deletedAt"
      `,
      [
        input.userId,
        input.title,
        input.goalDescription ?? null,
        input.cycleUnit,
        input.cycleLength,
        input.startDate,
        input.endDate,
      ],
    );

    const set = mapSet(rows[0]);

    const createdHabits: Array<{ id: string; name: string; targetCountPerDay: number }> = [];
    for (const h of input.habits) {
      const { rows: habitRows } = await client.query(
        `
        INSERT INTO "Habit" (
          "user_id",
          "habit_set_id",
          "name",
          "target_count_per_day"
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          "id" as "id",
          "name" as "name",
          "target_count_per_day" as "targetCountPerDay"
        `,
        [input.userId, set.id, h.name, h.targetCountPerDay],
      );
      createdHabits.push({
        id: habitRows[0].id,
        name: habitRows[0].name,
        targetCountPerDay: Number(habitRows[0].targetCountPerDay),
      });
    }

    return { ...set, habits: createdHabits };
  },

  async assertHabitOwnedByUser(client: PoolClient, habitId: string, userId: string) {
    const { rows } = await client.query(
      `
      SELECT h."id" as "id"
      FROM "Habit" h
      WHERE h."id" = $1
        AND h."user_id" = $2
        AND h."deleted_at" IS NULL
      LIMIT 1
      `,
      [habitId, userId],
    );
    return !!rows[0];
  },

  async upsertCheckin(
    client: PoolClient,
    input: {
      userId: string;
      habitId: string;
      checkinDate: Date;
      status: "DONE" | "NOT_DONE";
      note?: string;
    },
  ) {
    const { rows } = await client.query(
      `
      INSERT INTO "HabitCheckin" (
        "user_id",
        "habit_id",
        "checkin_date",
        "status",
        "note"
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("habit_id", "checkin_date")
      DO UPDATE SET
        "status" = EXCLUDED."status",
        "note" = EXCLUDED."note",
        "updated_at" = NOW()
      RETURNING
        "id" as "id",
        "user_id" as "userId",
        "habit_id" as "habitId",
        "checkin_date" as "checkinDate",
        "status" as "status",
        "note" as "note",
        "created_at" as "createdAt",
        "updated_at" as "updatedAt"
      `,
      [input.userId, input.habitId, input.checkinDate, input.status, input.note ?? null],
    );
    return rows[0];
  },
};

