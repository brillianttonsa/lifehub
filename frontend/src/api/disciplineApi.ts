import { apiClient } from '../lib/apiClient'
import {
  DisciplineCycle,
  DisciplineTask,
  DisciplineGrid,
  DisciplineCycleStatus,
} from '../types/discipline'

// ---------------------------------------------------------------------------
// Cycles
// ---------------------------------------------------------------------------

export async function createCycle(payload: {
  title: string
  description?: string
  startDate: string
  endDate: string
}): Promise<DisciplineCycle> {
  const { data } = await apiClient.post('/discipline/cycles', payload)
  return data
}

export async function listCycles(): Promise<DisciplineCycle[]> {
  const { data } = await apiClient.get('/discipline/cycles')
  return data
}

export async function getCycle(cycleId: string): Promise<DisciplineCycle> {
  const { data } = await apiClient.get(`/discipline/cycles/${cycleId}`)
  return data
}

export async function updateCycleStatus(
  cycleId: string,
  status: DisciplineCycleStatus,
): Promise<DisciplineCycle> {
  const { data } = await apiClient.patch(`/discipline/cycles/${cycleId}/status`, { status })
  return data
}

export async function deleteCycle(cycleId: string): Promise<void> {
  await apiClient.delete(`/discipline/cycles/${cycleId}`)
}

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export async function createTask(cycleId: string, title: string): Promise<DisciplineTask> {
  const { data } = await apiClient.post(`/discipline/cycles/${cycleId}/tasks`, { title })
  return data
}

export async function listTasks(cycleId: string): Promise<DisciplineTask[]> {
  const { data } = await apiClient.get(`/discipline/cycles/${cycleId}/tasks`)
  return data
}

export async function updateTask(taskId: string, title: string): Promise<DisciplineTask> {
  const { data } = await apiClient.patch(`/discipline/tasks/${taskId}`, { title })
  return data
}

export async function deleteTask(taskId: string): Promise<void> {
  await apiClient.delete(`/discipline/tasks/${taskId}`)
}

// ---------------------------------------------------------------------------
// Grid + toggle
// ---------------------------------------------------------------------------

export async function getGrid(cycleId: string): Promise<DisciplineGrid> {
  const { data } = await apiClient.get(`/discipline/cycles/${cycleId}/grid`)
  return data
}

export async function toggleCell(taskId: string, date: string) {
  const { data } = await apiClient.post('/discipline/toggle', { task_id: taskId, date })
  return data as { id: string; taskId: string; date: string; isDone: boolean }
}
