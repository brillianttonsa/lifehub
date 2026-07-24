interface GridCellProps {
  isDone: boolean
  onToggle: () => void
  isToday?: boolean
}

export default function GridCell({ isDone, onToggle, isToday }: GridCellProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isDone}
      className={[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-sm font-semibold transition',
        isDone
          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600 dark:border-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500'
          : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-700 dark:hover:border-slate-600 dark:hover:bg-slate-800',
        isToday ? 'ring-2 ring-indigo-400 ring-offset-1 dark:ring-indigo-500 dark:ring-offset-slate-900' : '',
      ].join(' ')}
    >
      {isDone ? '✔' : ''}
    </button>
  )
}