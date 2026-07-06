import { useCallback, useEffect, useState } from 'react'
import {
  getGrid,
  toggleCell as toggleCellRequest,
  createTask as createTaskRequest,
  updateTask as updateTaskRequest,
  deleteTask as deleteTaskRequest,
} from '../api/disciplineApi'
import { DisciplineGrid, DisciplineLogsByTask } from '../types/discipline'
import { getApiErrorMessage } from '../lib/apiClient'

function recomputeScore(logs: DisciplineLogsByTask, taskCount: number, dayCount: number) {
  const totalCells = taskCount * dayCount
  let doneCells = 0
  for (const taskId in logs) {
    for (const date in logs[taskId]) {
      if (logs[taskId][date]) doneCells += 1
    }
  }
  const disciplineScore = totalCells > 0 ? Math.round((doneCells / totalCells) * 10000) / 100 : 0
  return { totalCells, doneCells, disciplineScore }
}

export function useDisciplineGrid(cycleId: string | null) {
  const [grid, setGrid] = useState<DisciplineGrid | null>(null)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!cycleId) {
      setGrid(null)
      return
    }
    setIsLoading(true)
    try {
      const data = await getGrid(cycleId)
      setGrid(data)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }, [cycleId])

  useEffect(() => {
    load()
  }, [load])

  // Optimistically flips the cell locally, fires the request, and rolls back on failure.
  const toggle = useCallback(
    async (taskId: string, date: string) => {
      if (!grid) return

      const previousValue = !!grid.logs[taskId]?.[date]

      setGrid((current) => {
        if (!current) return current
        const nextLogs: DisciplineLogsByTask = {
          ...current.logs,
          [taskId]: { ...current.logs[taskId], [date]: !previousValue },
        }
        return { ...current, logs: nextLogs, ...recomputeScore(nextLogs, current.tasks.length, current.dates.length) }
      })

      try {
        await toggleCellRequest(taskId, date)
        setError(null)
      } catch (err) {
        // Roll back on failure so the UI never lies about what's saved.
        setGrid((current) => {
          if (!current) return current
          const revertedLogs: DisciplineLogsByTask = {
            ...current.logs,
            [taskId]: { ...current.logs[taskId], [date]: previousValue },
          }
          return {
            ...current,
            logs: revertedLogs,
            ...recomputeScore(revertedLogs, current.tasks.length, current.dates.length),
          }
        })
        setError(getApiErrorMessage(err))
      }
    },
    [grid],
  )

  const addTask = useCallback(
    async (title: string) => {
      if (!cycleId) return
      try {
        await createTaskRequest(cycleId, title)
        await load()
        setError(null)
      } catch (err) {
        setError(getApiErrorMessage(err))
      }
    },
    [cycleId, load],
  )

  const renameTask = useCallback(
    async (taskId: string, title: string) => {
      try {
        await updateTaskRequest(taskId, title)
        await load()
        setError(null)
      } catch (err) {
        setError(getApiErrorMessage(err))
      }
    },
    [load],
  )

  const removeTask = useCallback(
    async (taskId: string) => {
      try {
        await deleteTaskRequest(taskId)
        await load()
        setError(null)
      } catch (err) {
        setError(getApiErrorMessage(err))
      }
    },
    [load],
  )

  return {
    grid,
    isLoading,
    error,
    refresh: load,
    toggle,
    addTask,
    renameTask,
    removeTask,
  }
}
