import { DisciplineTask } from '../../types/discipline'
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
    <div className="flex items-stretch">
      <div className="sticky left-0 z-10 flex w-48 shrink-0 items-center border-r border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800">
        <span className="truncate" title={task.title}>{task.title}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-2">
        {dates.map((date) => (
          <GridCell
            key={date}
            isDone={!!logs[date]}
            isToday={date === today}
            onToggle={() => onToggle(task.id, date)}
          />
        ))}
      </div>
    </div>
  )
}
