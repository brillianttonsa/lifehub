import { WalletCards } from 'lucide-react'
import { PocketOverview, WalletType } from '../../types/pocket'
import { formatMoney, walletTypeLabels } from '../../utils/pocket'
import { Panel } from './PocketPrimitives'

export function TypeBreakdownPanel({ overview }: { overview: PocketOverview }) {
  return (
    <Panel title="By wallet type" icon={WalletCards}>
      <div className="space-y-3">
        {(Object.keys(walletTypeLabels) as WalletType[]).map((type) => (
          <div key={type} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm">
            <span className="shrink-0 font-medium text-slate-600">{walletTypeLabels[type]}</span>
            <span className="truncate text-right font-semibold text-slate-900">
              {formatMoney(overview.byType[type] ?? 0)}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  )
}