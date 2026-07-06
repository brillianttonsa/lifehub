import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  CalendarClock,
  WalletCards,
  FolderKanban,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'

export type SidebarRoute = 'dashboard' | 'plans' | 'discipline' | 'pocket' | 'projects' | 'settings'

interface SidebarUser {
  fullName: string
  email: string
}

interface SidebarProps {
  activeRoute: SidebarRoute
  onNavigate: (route: SidebarRoute) => void
  onOpenSettings: () => void
  onLogout: () => void
  currentUser: SidebarUser
}

const navItems: { key: SidebarRoute; label: string; icon: typeof CalendarClock }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'plans', label: 'Plan', icon: CalendarClock },
  { key: 'discipline', label: 'discipline', icon: FolderKanban },
  { key: 'pocket', label: 'Pocket', icon: WalletCards },
  { key: 'projects', label: 'Project', icon: FolderKanban },
]

function initials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || 'U'
}

function SidebarContent({ activeRoute, onNavigate, onOpenSettings, onLogout, currentUser }: SidebarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white">
          LH
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900">LifeHub</p>
          <p className="text-xs text-slate-400">Workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Menu</p>
        {navItems.map(({ key, label, icon: Icon }) => {
          const isActive = activeRoute === key
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
              {label}
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute inset-0 -z-10 rounded-2xl bg-indigo-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-100 px-3 py-4">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Settings size={18} className="text-slate-400" />
          Settings
        </button>
      </div>

      <div className="relative border-t border-slate-100 p-3">
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg"
            >
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                <LogOut size={16} />
                Log out
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsProfileOpen((prev) => !prev)}
          className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition hover:bg-slate-100"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
            {initials(currentUser.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
            <p className="truncate text-xs text-slate-400">{currentUser.email}</p>
          </div>
          <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${isProfileOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  )
}

export default function Sidebar(props: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const activeItem = navItems.find((item) => item.key === props.activeRoute)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 lg:block">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white">
            LH
          </div>
          <span className="text-sm font-semibold text-slate-900">{activeItem?.label ?? 'LifeHub'}</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="rounded-full border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="h-full w-64 border-r border-slate-200 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-end px-3 pt-3">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>
              <SidebarContent
                {...props}
                onNavigate={(route) => {
                  props.onNavigate(route)
                  setIsMobileOpen(false)
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}