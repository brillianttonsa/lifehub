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
          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600'
          : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400 hover:bg-slate-50',
        isToday ? 'ring-2 ring-indigo-400 ring-offset-1' : '',
      ].join(' ')}
    >
      {isDone ? '✔' : ''}
    </button>
  )
}
