import { z } from "zod";

export const createPlanSchema = z.object({
  type: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().max(1000).optional(),
  periodStart: z.string().datetime({ message: "Invalid periodStart format" }),
  periodEnd: z.string().datetime({ message: "Invalid periodEnd format" }),
});

export const createPlanItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime({ message: "Invalid dueDate format" }).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().max(200).optional(),
});

export const updatePlanSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(1000).optional(),
  type: z.enum(["YEARLY", "MONTHLY", "WEEKLY", "DAILY"]).optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  status: z.enum(["OPEN", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
});

export const updatePlanItemSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(2000).optional(),
  dueDate: z.string().datetime().optional().nullable(),
  status: z.enum(["TODO", "DOING", "DONE", "SKIPPED"]).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().max(200).optional().nullable(),
  // Lifetime feature (optional)
  lifetimePreset: z.enum(["DAYS", "WEEK", "MONTH", "RANGE"]).optional(),
  lifetimeValue: z.number().int().positive().optional(),
  lifetimeStart: z.string().datetime().optional(),
  lifetimeEnd: z.string().datetime().optional(),
});

