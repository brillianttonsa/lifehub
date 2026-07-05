import { useMemo } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar, { SidebarRoute } from './Sidebar'
import { useAuth } from '../../context/authcontext/useAuth'

export default function ProtectedLayout() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const activeRoute = useMemo<SidebarRoute>(() => {
    if (location.pathname.startsWith('/plans')) return 'plans'
    if (location.pathname.startsWith('/pocket')) return 'pocket'
    if (location.pathname.startsWith('/project')) return 'projects'
    return 'dashboard'
  }, [location.pathname])

  const handleNavigate = (route: SidebarRoute) => {
    switch (route) {
      case 'dashboard':
        navigate('/dashboard')
        break
      case 'plans':
        navigate('/plans')
        break
      case 'pocket':
        navigate('/pocket')
        break
      case 'projects':
        navigate('/project')
        break
      default:
        navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="lg:flex lg:min-h-screen">
        <Sidebar
          activeRoute={activeRoute}
          onNavigate={handleNavigate}
          onOpenSettings={() => navigate('/settings')}
          onLogout={async () => {
            await signOut()
            navigate('/', { replace: true })
          }}
          currentUser={{
            fullName: user?.fullName ?? 'LifeHub User',
            email: user?.email ?? 'hello@lifehub.app',
          }}
        />

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
