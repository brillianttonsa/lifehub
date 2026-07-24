import { Menu } from 'lucide-react'

interface MobileTopBarProps {
  activeLabel: string
  onOpenMenu: () => void
}

export function MobileTopBar({ activeLabel, onOpenMenu }: MobileTopBarProps) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white">
          LH
        </div>
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {activeLabel}
        </span>
      </div>
      <button
        onClick={onOpenMenu}
        className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>
    </div>
  )
}