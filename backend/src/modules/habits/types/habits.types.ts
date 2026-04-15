export type HabitSetStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";

export type HabitSetRow = {
  id: string;
  userId: string;
  title: string;
  goalDescription: string | null;
  cycleUnit: "DAY" | "WEEK" | "MONTH";
  cycleLength: number;
  startDate: string;
  endDate: string;
  status: HabitSetStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type HabitRow = {
  id: string;
  userId: string;
  habitSetId: string;
  name: string;
  targetCountPerDay: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type HabitCheckinRow = {
  id: string;
  userId: string;
  habitId: string;
  checkinDate: string;
  status: "DONE" | "NOT_DONE";
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HabitSetWithHabits = Omit<HabitSetRow, "goalDescription"> & {
  goalDescription?: string;
  habits: Array<Pick<HabitRow, "id" | "name" | "targetCountPerDay">>;
};

