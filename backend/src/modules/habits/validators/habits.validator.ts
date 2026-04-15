import { z } from "zod";

export const createHabitSetSchema = z.object({
  title: z.string().min(1, "Title is required"),
  goalDescription: z.string().max(500).optional(),
  cycleUnit: z.enum(["DAY", "WEEK", "MONTH"]),
  cycleLength: z.number().int().positive(),
  startDate: z.string().datetime({ message: "Invalid startDate format" }),
  habits: z.array(
    z.object({
      name: z.string().min(1, "Habit name is required"),
      targetCountPerDay: z.number().int().positive().optional(),
    }),
  ).min(1, "At least one habit is required"),
});

export const habitCheckinSchema = z.object({
  habitId: z.string().uuid(),
  checkinDate: z.string().datetime({ message: "Invalid checkinDate format" }),
  status: z.enum(["DONE", "NOT_DONE"]),
  note: z.string().max(500).optional(),
});

