export type CycleType = 'Yearly' | 'Half-Yearly' | 'Quarterly' | 'Monthly' | 'Weekly' | 'Custom'
export type CycleStatus = 'Active' | 'Completed' | 'Archived'

export type GoalPriority = 'Low' | 'Medium' | 'High'
export type GoalStatus = 'Pending' | 'In Progress' | 'Completed'

export interface Goal {
  id: string
  planningCycleId: string
  userId: string
  title: string
  description: string
  priority: GoalPriority
  status: GoalStatus
  progress: number
  notes: string
  createdAt: string
  updatedAt: string
}

export interface PlanningCycle {
  id: string
  userId: string
  name: string
  type: CycleType
  startDate: string
  endDate: string
  status: CycleStatus
  archivedAt: string | null
  createdAt: string
  updatedAt: string
  // Derived/aggregated server-side from the cycle's goals.
  goals: Goal[]
  goalCount: number
  completedGoalCount: number
  progress: number
}

export interface PlanningCycleDashboard {
  totalCycles: number
  activeCycles: number
  completedCycles: number
  upcomingCycles: number
  overdueCycles: number
  totalGoals: number
  completedGoals: number
  inProgressGoals: number
}
