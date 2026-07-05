import { apiClient } from '../lib/apiClient'
import { CycleStatus, CycleType, GoalPriority, GoalStatus, Goal, PlanningCycle, PlanningCycleDashboard } from '../types/plan'

// NOTE: this file assumes the same `apiClient` shape used elsewhere in LifeHub
// (the request wrapper that pairs with `getApiErrorMessage`). Wire the method
// names below to whatever that client actually exposes (get/post/patch/delete).

export interface PlanningCycleFilters {
  status?: CycleStatus
  type?: CycleType
  search?: string
  sort?: string
  page?: number
  pageSize?: number
}

export interface GoalFilters {
  status?: GoalStatus
  priority?: GoalPriority
  search?: string
  sort?: string
  page?: number
  pageSize?: number
}

export interface CreatePlanningCyclePayload {
  name: string
  type: CycleType
  startDate: string
  endDate: string
  status?: CycleStatus
}

export type UpdatePlanningCyclePayload = Partial<CreatePlanningCyclePayload>

export interface CreateGoalPayload {
  title: string
  description?: string
  priority?: GoalPriority
  status?: GoalStatus
  progress?: number
  notes?: string
}

export type UpdateGoalPayload = Partial<CreateGoalPayload> & { planningCycleId?: string }

// ── Planning cycles ─────────────────────────────────────────────

export async function getPlanningCycleDashboard() {
  const { data } = await apiClient.get<PlanningCycleDashboard>('/planning-cycles/dashboard')
  return data
}

export async function listPlanningCycles(filters: PlanningCycleFilters = {}) {
  const { data } = await apiClient.get<{ cycles: PlanningCycle[]; page: number; pageSize: number }>(
    '/planning-cycles',
    { params: filters },
  )
  return data
}

export async function getPlanningCycle(id: string) {
  const { data } = await apiClient.get<PlanningCycle>(`/planning-cycles/${id}`)
  return data
}

export async function createPlanningCycle(payload: CreatePlanningCyclePayload) {
  const { data } = await apiClient.post<PlanningCycle>('/planning-cycles', payload)
  return data
}

export async function updatePlanningCycle(id: string, payload: UpdatePlanningCyclePayload) {
  const { data } = await apiClient.patch<PlanningCycle>(`/planning-cycles/${id}`, payload)
  return data
}

export async function deletePlanningCycle(id: string) {
  await apiClient.delete(`/planning-cycles/${id}`)
}

export async function archivePlanningCycle(id: string) {
  const { data } = await apiClient.patch<PlanningCycle>(`/planning-cycles/${id}/archive`)
  return data
}

// ── Goals (scoped to a planning cycle) ──────────────────────────

export async function listGoals(cycleId: string, filters: GoalFilters = {}) {
  const { data } = await apiClient.get<{ goals: Goal[]; page: number; pageSize: number }>(
    `/planning-cycles/${cycleId}/goals`,
    { params: filters },
  )
  return data
}

export async function createGoal(cycleId: string, payload: CreateGoalPayload) {
  const { data } = await apiClient.post<Goal>(`/planning-cycles/${cycleId}/goals`, payload)
  return data
}

export async function getGoal(id: string) {
  const { data } = await apiClient.get<Goal>(`/goals/${id}`)
  return data
}

export async function updateGoal(id: string, payload: UpdateGoalPayload) {
  const { data } = await apiClient.patch<Goal>(`/goals/${id}`, payload)
  return data
}

export async function deleteGoal(id: string) {
  await apiClient.delete(`/goals/${id}`)
}

export async function updateGoalProgress(id: string, progress: number) {
  const { data } = await apiClient.patch<Goal>(`/goals/${id}/progress`, { progress })
  return data
}
