import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { Goal } from '../../types/plan'

interface TodaysPrioritiesProps {
  goals: Goal[]
  isLoading: boolean
}

export default function TodaysPriorities({ goals, isLoading }: TodaysPrioritiesProps) {
  const tasks = goals
    .filter((goal) => goal.status !== 'Completed')
    .sort((a, b) => {
      const priority = { High: 0, Medium: 1, Low: 2 }
      return priority[a.priority] - priority[b.priority] || b.progress - a.progress
    })
    .slice(0, 5)

  const completedCount = tasks.filter((t) => t.status === 'Completed').length
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
      case 'Medium':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
      case 'Low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
      default:
        return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20'
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Today's Priorities</h3>
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {completedCount} of {tasks.length}
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">No high-priority tasks. Great job!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="flex-shrink-0 text-slate-400">
                {task.status === 'Completed' ? (
                  <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle size={24} />
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${task.status === 'Completed' ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                  {task.title}
                </p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
