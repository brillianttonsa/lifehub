import { Flame, Loader2 } from 'lucide-react'
import { DisciplineGrid } from '../../types/discipline'
import { useMemo } from 'react'

interface HabitTrackerProps {
  disciplineData: DisciplineGrid | null
  isLoading: boolean
}

export default function HabitTracker({ disciplineData, isLoading }: HabitTrackerProps) {
  // Transform discipline data into habits
  const habits = useMemo(() => {
    if (!disciplineData || !disciplineData.tasks) return []

    // Calculate streaks for each task
    return disciplineData.tasks.map((task) => {
      const taskLogs = disciplineData.logs[task.id] || {}
      const today = new Date().toISOString().split('T')[0]
      const completedToday = taskLogs[today] === true

      // Calculate streak by checking consecutive days from today backwards
      let streak = 0
      let currentDate = new Date(today)
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0]
        if (taskLogs[dateStr]) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else {
          break
        }
      }

      return {
        id: task.id,
        name: task.title,
        completed: completedToday,
        streak: streak,
      }
    })
  }, [disciplineData])

  const disciplineScore = disciplineData?.disciplineScore ?? 0

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Habit Tracker & Discipline</h3>
          <div className="flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 dark:bg-orange-900/30">
            <Flame size={18} className="text-orange-600 dark:text-orange-400" />
            <span className="font-bold text-orange-600 dark:text-orange-400">{disciplineScore}%</span>
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Daily routines & habit progress</p>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : habits.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">No habits tracked yet. Start by creating your first habit!</p>
          </div>
        ) : (
          habits.map(habit => (
            <div key={habit.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="flex-shrink-0">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold transition ${
                    habit.completed
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                  }`}
                >
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-900 dark:text-slate-100">{habit.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {habit.completed ? '✓ Completed today' : 'Not yet today'}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1">
                  <Flame size={16} className="text-orange-500" />
                  <span className="font-bold text-slate-900 dark:text-slate-100">{habit.streak}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">day streak</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
