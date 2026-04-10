import { Request, Response } from "express";
import { z } from "zod";
import { habitsService } from "./habits.service";

const createHabitSetSchema = z.object({
  title: z.string().min(1),
  goalDescription: z.string().optional(),
  cycleUnit: z.enum(["WEEK", "MONTH"]),
  cycleLength: z.number().int().positive(),
  startDate: z.string(),
  habits: z.array(
    z.object({
      name: z.string().min(1),
      targetCountPerDay: z.number().int().positive().optional(),
    }),
  ),
});

const checkinSchema = z.object({
  habitId: z.string().uuid(),
  checkinDate: z.string(),
  status: z.enum(["DONE", "NOT_DONE"]),
  note: z.string().optional(),
});

export async function createHabitSet(req: Request, res: Response) {
  const payload = createHabitSetSchema.parse(req.body);
  const data = await habitsService.createHabitSet({
    ...payload,
    workspaceId: req.workspaceId!,
    actorUserId: req.auth!.userId,
  });
  res.status(201).json({ success: true, data });
}

export async function listHabitSets(req: Request, res: Response) {
  const data = await habitsService.listHabitSets(req.workspaceId!);
  res.json({ success: true, data });
}

export async function checkinHabit(req: Request, res: Response) {
  const payload = checkinSchema.parse(req.body);
  const data = await habitsService.checkinHabit({
    ...payload,
    workspaceId: req.workspaceId!,
    actorUserId: req.auth!.userId,
  });
  res.json({ success: true, data });
}

export async function closeExpiredHabitSets(req: Request, res: Response) {
  const data = await habitsService.closeExpiredSets(req.workspaceId!);
  res.json({ success: true, data });
}
