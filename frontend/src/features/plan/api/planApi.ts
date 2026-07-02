import { apiClient } from '../../../lib/apiClient'
import {
  CreatePlanInput,
  Plan,
  PlanDashboard,
  PlanListResponse,
  UpdatePlanInput,
  UpdateProgressInput,
} from '../../../types/plan'

export async function getPlanDashboard(): Promise<PlanDashboard> {
  const response = await apiClient.get<PlanDashboard>('/plans/dashboard')
  return response.data
}

export async function listPlans(params?: Record<string, string | number | undefined>): Promise<PlanListResponse> {
  const response = await apiClient.get<PlanListResponse>('/plans', { params })
  return response.data
}

export async function getPlan(planId: string): Promise<Plan> {
  const response = await apiClient.get<Plan>(`/plans/${planId}`)
  return response.data
}

export async function createPlan(data: CreatePlanInput): Promise<Plan> {
  const response = await apiClient.post<Plan>('/plans', data)
  return response.data
}

export async function updatePlan(planId: string, data: UpdatePlanInput): Promise<Plan> {
  const response = await apiClient.patch<Plan>(`/plans/${planId}`, data)
  return response.data
}

export async function deletePlan(planId: string): Promise<void> {
  await apiClient.delete(`/plans/${planId}`)
}

export async function archivePlan(planId: string): Promise<Plan> {
  const response = await apiClient.patch<Plan>(`/plans/${planId}/archive`, {})
  return response.data
}

export async function updatePlanProgress(planId: string, data: UpdateProgressInput): Promise<Plan> {
  const response = await apiClient.patch<Plan>(`/plans/${planId}/progress`, data)
  return response.data
}

export async function searchPlans(query: string, params?: Record<string, string | number | undefined>): Promise<PlanListResponse> {
  const response = await apiClient.get<PlanListResponse>('/plans/search', { params: { q: query, ...params } })
  return response.data
}
