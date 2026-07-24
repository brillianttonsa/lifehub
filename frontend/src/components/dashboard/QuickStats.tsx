import { Flame, Wallet, Briefcase, Loader2 } from 'lucide-react'
import { formatMoney } from '../../utils/pocket'

interface QuickStatsProps {
  isLoading: boolean
  stats: {
    disciplineStreak: number
    monthlySpend: number
    activeProjects: number
  }
}

export default function QuickStats({ isLoading, stats }: QuickStatsProps) {
  const statItems = [
    {
      label: 'Discipline Streak',
      value: `${stats.disciplineStreak} days`,
      icon: Flame,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      label: 'Recorded Expenses',
      value: formatMoney(stats.monthlySpend),
      icon: Wallet,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      label: 'Active Projects',
      value: stats.activeProjects,
      icon: Briefcase,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {statItems.map((item) => {
        const Icon = item.icon
        return (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.label}</p>
                {isLoading ? (
                  <div className="mt-2 flex items-center gap-2">
                    <Loader2 size={20} className="animate-spin text-slate-400" />
                  </div>
                ) : (
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{item.value}</p>
                )}
              </div>
              <div className={`rounded-lg p-3 ${item.bgColor}`}>
                <Icon size={20} className={item.color} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
