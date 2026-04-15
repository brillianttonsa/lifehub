export type PlanStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type PlanItemStatus = "TODO" | "DOING" | "DONE" | "SKIPPED";

export type PlanRow = {
  id: string;
  userId: string;
  type: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  title: string;
  description: string | null;
  periodStart: string;
  periodEnd: string;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PlanItemRow = {
  id: string;
  userId: string;
  planId: string;
  title: string;
  description: string | null;
  status: PlanItemStatus;
  dueDate: string | null;
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type PlanWithItems = Omit<PlanRow, "description"> & {
  description?: string;
  items: Array<
    Pick<PlanItemRow, "id" | "title" | "description" | "dueDate" | "status" | "isRecurring">
  >;
};

