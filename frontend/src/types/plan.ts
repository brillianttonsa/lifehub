export type PlanTimeframe = 'Yearly' | 'Half-Yearly' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Custom Range'
export type PlanPriority = 'Low' | 'Medium' | 'High'
export type PlanStatus = 'Draft' | 'Active' | 'Completed' | 'Archived' | 'Cancelled'

export interface Plan {
  id: string
  userId: string
  title: string
  description: string
  timeframe: PlanTimeframe
  startDate: string
  endDate: string
  priority: PlanPriority
  status: PlanStatus
  progress: number
  notes: string
  archivedAt?: string | null
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface PlanDashboard {
  totalPlans: number
  activePlans: number
  completedPlans: number
  upcomingPlans: number
  overduePlans: number
}

export interface PlanListResponse {
  plans: Plan[]
  page: number
  pageSize: number
}

export interface CreatePlanInput {
  title: string
  description?: string
  timeframe: PlanTimeframe
  startDate: string
  endDate: string
  priority?: PlanPriority
  status?: PlanStatus
  notes?: string
}

export interface UpdatePlanInput extends Partial<CreatePlanInput> {
  progress?: number
}

export interface UpdateProgressInput {
  progress: number
}
