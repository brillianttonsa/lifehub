import { Home, CalendarClock, WalletCards, FolderKanban } from 'lucide-react'

export type SidebarRoute = 'dashboard' | 'plans' | 'discipline' | 'pocket' | 'projects' | 'settings'

export interface SidebarUser {
  fullName: string
  email: string
}

export interface SidebarProps {
  activeRoute: SidebarRoute
  onNavigate: (route: SidebarRoute) => void
  onOpenSettings: () => void
  onLogout: () => void
  currentUser: SidebarUser
}

export const NAV_ITEMS: { key: SidebarRoute; label: string; icon: typeof CalendarClock }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'plans', label: 'Plan', icon: CalendarClock },
  { key: 'discipline', label: 'Discipline', icon: FolderKanban },
  { key: 'pocket', label: 'Pocket', icon: WalletCards },
  { key: 'projects', label: 'Project', icon: FolderKanban },
]

export function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase() || 'U'
}