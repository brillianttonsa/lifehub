import { TrendingDown, TrendingUp, Wallet, Loader2 } from 'lucide-react'
import { PocketOverview } from '../../types/pocket'
import { formatMoney } from '../../utils/pocket'

interface PocketOverviewCardProps {
  pocketData: PocketOverview | null
  totalBalance: number
  isLoading: boolean
}

export default function PocketOverviewCard({ pocketData, totalBalance }: PocketOverviewCardProps) {
  
  return (
    <div className="space-y-4">
      {/* Total Balance Card */}
      <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lg dark:from-emerald-900 dark:to-emerald-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-emerald-100">Total Balance</p>
          <p className="mt-2 text-3xl font-bold">{formatMoney(totalBalance)}</p>
          </div>
          <Wallet size={32} className="text-emerald-200" />
        </div>
      </div>

      {/* Income vs Expense */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Income</p>
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatMoney(pocketData?.income ?? 0)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <TrendingDown size={18} className="text-red-600 dark:text-red-400" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Expense</p>
          </div>
          <p className="mt-2 text-xl font-bold text-red-600 dark:text-red-400">
            {formatMoney(pocketData?.expense ?? 0)}
          </p>
        </div>
      </div>

    </div>
  )
}
