import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, LogOut } from 'lucide-react'
import { SidebarUser, getInitials } from './types'

interface SidebarUserProfileProps {
  currentUser: SidebarUser
  onLogout: () => void
}

export function SidebarUserProfile({ currentUser, onLogout }: SidebarUserProfileProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="relative border-t border-slate-100 p-3 dark:border-slate-800">
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
          >
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              <LogOut size={16} />
              Log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsProfileOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/60"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white dark:bg-slate-800">
          {getInitials(currentUser.fullName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {currentUser.fullName}
          </p>
          <p className="truncate text-xs text-slate-400 dark:text-slate-500">
            {currentUser.email}
          </p>
        </div>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition dark:text-slate-500 ${
            isProfileOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  )
}