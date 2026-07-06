import { DisciplineTask } from '../../types/discipline'
import GridRow from './GridRow'

interface GridProps {
  tasks: DisciplineTask[]
  dates: string[]
  logs: Record<string, Record<string, boolean>>
  onToggle: (taskId: string, date: string) => void
}

function formatDayLabel(date: string) {
  const d = new Date(`${date}T00:00:00Z`)
  return {
    weekday: new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'UTC' }).format(d),
    day: new Intl.DateTimeFormat('en', { day: '2-digit', timeZone: 'UTC' }).format(d),
  }
}

export default function Grid({ tasks, dates, logs, onToggle }: GridProps) {
  const today = new Date().toISOString().slice(0, 10)

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        No non-negotiable tasks yet. Add your first task to generate the grid.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <div className="min-w-max">
        {/* Header row: sticky task-column label + date labels */}
        <div className="flex items-stretch border-b border-slate-200 bg-slate-50">
          <div className="sticky left-0 z-20 w-48 shrink-0 border-r border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Task
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            {dates.map((date) => {
              const { weekday, day } = formatDayLabel(date)
              const isToday = date === today
              return (
                <div
                  key={date}
                  className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-semibold ${
                    isToday ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500'
                  }`}
                  title={date}
                >
                  <span>{weekday}</span>
                  <span>{day}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task rows */}
        <div className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <GridRow
              key={task.id}
              task={task}
              dates={dates}
              today={today}
              logs={logs[task.id] ?? {}}
              onToggle={onToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
