import { useState } from 'react'
import { SidebarProps, NAV_ITEMS } from './types'
import { SidebarNav } from './SidebarNav'
import { SidebarUserProfile } from './SidebarUserProfile'
import { MobileTopBar } from './MobileTopBar'
import { MobileDrawer } from './MobileDrawer'

function SidebarContent(props: SidebarProps & { onNavClick?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white shadow-sm shadow-indigo-500/20">
          LH
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            LifeHub
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">Workspace</p>
        </div>
      </div>

      {/* Navigation Links */}
      <SidebarNav
        activeRoute={props.activeRoute}
        onNavigate={(route) => {
          props.onNavigate(route)
          props.onNavClick?.()
        }}
        onOpenSettings={() => {
          props.onOpenSettings()
          props.onNavClick?.()
        }}
      />

      {/* User Profile Footer */}
      <SidebarUserProfile currentUser={props.currentUser} onLogout={props.onLogout} />
    </div>
  )
}

export default function Sidebar(props: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const activeItem = NAV_ITEMS.find((item) => item.key === props.activeRoute)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile Header Bar */}
      <MobileTopBar
        activeLabel={activeItem?.label ?? 'LifeHub'}
        onOpenMenu={() => setIsMobileOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)}>
        <SidebarContent {...props} onNavClick={() => setIsMobileOpen(false)} />
      </MobileDrawer>
    </>
  )
}