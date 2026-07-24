import { DisciplineTask } from '../../../types/discipline'
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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        No non-negotiable tasks yet. Add your first task to generate the grid.
      </div>
    )
  }

  return (
    <div className="max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex min-w-0">
        {/* Task Column (Fixed Left) */}
        <div className="w-48 shrink-0 border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex h-11 items-center border-b border-slate-200 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Task
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex h-13 items-center px-4 text-sm font-medium text-slate-800 dark:text-slate-200"
              >
                <span className="truncate" title={task.title}>
                  {task.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dates Column Area (Only this area scrolls horizontally) */}
        <div className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain">
          {/* Header row: date labels */}
          <div className="flex h-11 items-center border-b border-slate-200 bg-slate-50 px-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              {dates.map((date) => {
                const { weekday, day } = formatDayLabel(date)
                const isToday = date === today
                return (
                  <div
                    key={date}
                    className={`flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-md text-[10px] font-semibold ${
                      isToday
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300'
                        : 'text-slate-500 dark:text-slate-400'
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

          {/* Grid rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
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
    </div>
  )
}
