import { Router } from "express";
import { requireAuth } from "../../../middlewares/auth";
import { asyncHandler } from "../../../shared/http";
import {
  createHabitSet,
  listHabitSets,
  checkinHabit,
} from "../controllers/habits.controller";

export const habitsRouter = Router();

/**
 * Habits is a personal domain module.
 * Only requires authentication to resolve req.auth.userId.
 */
habitsRouter.use(requireAuth);

habitsRouter.get("/sets", asyncHandler(listHabitSets));
habitsRouter.post("/sets", asyncHandler(createHabitSet));
habitsRouter.post("/checkins", asyncHandler(checkinHabit));

