import { DisciplineTask } from '../../../types/discipline'
import GridCell from './GridCell'

interface GridRowProps {
  task: DisciplineTask
  dates: string[]
  today: string
  logs: Record<string, boolean>
  onToggle: (taskId: string, date: string) => void
}

export default function GridRow({ task, dates, today, logs, onToggle }: GridRowProps) {
  return (
    <div className="flex h-13 items-center gap-2 px-3">
      {dates.map((date) => (
        <GridCell
          key={date}
          isDone={!!logs[date]}
          isToday={date === today}
          onToggle={() => onToggle(task.id, date)}
        />
      ))}
    </div>
  )
}