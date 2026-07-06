export type DisciplineCycleStatus = 'active' | 'completed' | 'archived'

export interface DisciplineCycle {
  id: string
  userId: string
  title: string
  description: string
  startDate: string
  endDate: string
  status: DisciplineCycleStatus
  createdAt: string
  updatedAt: string
}

export interface DisciplineTask {
  id: string
  cycleId: string
  title: string
  createdAt: string
  updatedAt: string
}

export interface DisciplineLog {
  id: string
  userId: string
  taskId: string
  date: string
  isDone: boolean
}

/** logsByTask[taskId][date] === true when that task was marked done that day */
export type DisciplineLogsByTask = Record<string, Record<string, boolean>>

export interface DisciplineGrid {
  cycle: DisciplineCycle
  tasks: DisciplineTask[]
  dates: string[]
  logs: DisciplineLogsByTask
  totalCells: number
  doneCells: number
  disciplineScore: number
}
