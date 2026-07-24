import { ReactNode, useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './sidebar/Sidebar'
import { SidebarRoute } from './sidebar/types'
import { useAuth } from '../../context/authcontext/useAuth'

interface ProtectedLayoutProps {
  children?: ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Derive active route from URL
  const activeRoute = useMemo<SidebarRoute>(() => {
    const path = location.pathname
    if (path.startsWith('/plans')) return 'plans'
    if (path.startsWith('/discipline')) return 'discipline'
    if (path.startsWith('/pocket')) return 'pocket'
    if (path.startsWith('/project')) return 'projects'
    if (path.startsWith('/settings')) return 'settings'
    return 'dashboard'
  }, [location.pathname])

  // Single-line navigation handler
  const handleNavigate = (route: SidebarRoute) => {
    const targetPath = route === 'projects' ? '/project' : `/${route}`
    navigate(targetPath)
  }

  // Handle logout cleanly
  const handleLogout = async () => {
    try {
      await signOut()
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          onOpenSettings={() => navigate('/settings')}
          onLogout={handleLogout}
          currentUser={{
            fullName: user?.fullName ?? 'LifeHub User',
            email: user?.email ?? 'hello@lifehub.app',
          }}
        />

        <main className="flex-1 overflow-y-auto">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}