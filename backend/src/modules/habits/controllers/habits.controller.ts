import { Request, Response } from "express";
import { habitsService } from "../services/habits.service";
import { createHabitSetSchema, habitCheckinSchema } from "../validators/habits.validator";

/**
 * GET /api/v1/habits/sets
 * Fetch all habit sets for authenticated user.
 */
export async function listHabitSets(req: Request, res: Response) {
  const data = await habitsService.listHabitSets(req.auth!.userId);
  res.json({ success: true, data });
}

/**
 * POST /api/v1/habits/sets
 * Create a new habit set (personal).
 */
export async function createHabitSet(req: Request, res: Response) {
  const payload = createHabitSetSchema.parse(req.body);
  const data = await habitsService.createHabitSet({
    ...payload,
    userId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

/**
 * POST /api/v1/habits/checkins
 * Upsert a check-in for a habit (personal).
 */
export async function checkinHabit(req: Request, res: Response) {
  const payload = habitCheckinSchema.parse(req.body);
  const data = await habitsService.checkinHabit({
    ...payload,
    userId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

