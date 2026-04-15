export type Habit = {
  id: string;
  name: string;
  targetCountPerDay: number;
};

export type HabitSet = {
  id: string;
  userId: string;
  title: string;
  goalDescription?: string;
  cycleUnit: string;
  cycleLength: number;
  startDate: string;
  endDate: string;
  status: string;
  habits: Habit[];
};

export type HabitCheckinStatus = 'DONE' | 'NOT_DONE';

export type CheckIn = {
  habitId: string;
  date: string;
  status: HabitCheckinStatus;
};

