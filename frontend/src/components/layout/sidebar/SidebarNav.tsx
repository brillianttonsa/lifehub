import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { NAV_ITEMS, SidebarRoute } from './types'

interface SidebarNavProps {
  activeRoute: SidebarRoute
  onNavigate: (route: SidebarRoute) => void
  onOpenSettings: () => void
}

export function SidebarNav({ activeRoute, onNavigate, onOpenSettings }: SidebarNavProps) {
  return (
    <>
      <nav className="flex-1 space-y-1 px-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
          Menu
        </p>
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeRoute === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
              }`}
            >
              <Icon
                size={18}
                className={`relative z-10 ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                }`}
              />
              <span className="relative z-10">{label}</span>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 rounded-2xl bg-indigo-600 shadow-sm shadow-indigo-500/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4 dark:border-slate-800">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
        >
          <Settings size={18} className="text-slate-400 dark:text-slate-500" />
          Settings
        </button>
      </div>
    </>
  )
}