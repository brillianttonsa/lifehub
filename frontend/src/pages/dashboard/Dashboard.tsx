import { useAuth } from '../../context/authcontext/useAuth'
import { DashboardModulePage } from '../../components/dashboard/settings/DashboardModulePage'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <DashboardModulePage title="Dashboard" eyebrow="Overview" description="Your command center for planning, discipline, pockets, and projects.">
      <div className="flex min-h-full w-full items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center text-lg font-semibold text-slate-700 dark:text-slate-200">
          Welcome back, {user?.fullName?.split(' ')[0] ?? 'there'}!
        </div>
      </div>
    </DashboardModulePage>
  )
}
