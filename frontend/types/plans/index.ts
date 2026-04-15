export type PlanItem = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: string;
  isRecurring: boolean;
};

export type Plan = {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  periodStart: string;
  periodEnd: string;
  items: PlanItem[];
};

