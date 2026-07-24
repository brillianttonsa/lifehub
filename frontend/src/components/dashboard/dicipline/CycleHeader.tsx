import { Archive, Trash2, CheckCircle2 } from 'lucide-react'
import { DisciplineCycle } from '../../../types/discipline'

interface CycleHeaderProps {
  cycle: DisciplineCycle
  disciplineScore: number
  doneCells: number
  totalCells: number
  onArchive: () => void
  onComplete: () => void
  onDelete: () => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${value}T00:00:00Z`),
  )
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  completed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  archived: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
}

export default function CycleHeader({
  cycle,
  disciplineScore,
  doneCells,
  totalCells,
  onArchive,
  onComplete,
  onDelete,
}: CycleHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{cycle.title}</h2>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyles[cycle.status]}`}>
              {cycle.status}
            </span>
          </div>
          {cycle.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{cycle.description}</p>}
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {cycle.status === 'active' && (
            <button onClick={onComplete} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/60">
              <CheckCircle2 size={16} /> Complete
            </button>
          )}
          {cycle.status !== 'archived' && (
            <button onClick={onArchive} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/60">
              <Archive size={16} /> Archive
            </button>
          )}
          <button onClick={onDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-indigo-600 transition-all dark:bg-indigo-500" style={{ width: `${disciplineScore}%` }} />
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-slate-100">
          {disciplineScore}% ({doneCells}/{totalCells})
        </span>
      </div>
    </div>
  )
}