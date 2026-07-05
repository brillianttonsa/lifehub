import { useMemo } from 'react'
import { useAuth } from '../context/authcontext/useAuth'
import { ArrowUpRight, FolderKanban, WalletCards, Settings, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()

  const stats = useMemo(
    () => [
      { label: 'Active plans', value: '7', icon: ArrowUpRight, color: 'bg-indigo-50 text-indigo-700' },
      { label: 'Pocket balance', value: '$12,840', icon: WalletCards, color: 'bg-emerald-50 text-emerald-700' },
      { label: 'Active projects', value: '4', icon: FolderKanban, color: 'bg-sky-50 text-sky-700' },
      { label: 'Settings', value: 'Customize', icon: Settings, color: 'bg-amber-50 text-amber-700' },
    ],
    [],
  )

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-600">Dashboard</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back, {user?.fullName.split(' ')[0] ?? 'there'}.</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Your LifeHub workspace is ready. Use the sidebar to jump between plans, pocket, projects, and settings.</p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
            <Sparkles size={24} className="text-indigo-500" />
            <div>
              <p className="text-sm text-slate-500">Workspace status</p>
              <p className="text-lg font-semibold text-slate-900">Running smoothly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Today’s focus</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Review your active plans, update progress, and keep your pocket balances aligned with current goals. The sidebar helps you move between the core LifeHub modules.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Next goal</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">Save 25% more this month</p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Project priority</p>
              <p className="mt-3 text-sm font-semibold text-slate-900">Finalize launch scope</p>
            </div>
          </div>
        </div>

        <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick actions</h3>
          <div className="mt-5 space-y-3">
            <button className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500">Open Plan board</button>
            <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Open Pocket</button>
            <button className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">Open Projects</button>
          </div>
        </aside>
      </section>
    </div>
  )
}
