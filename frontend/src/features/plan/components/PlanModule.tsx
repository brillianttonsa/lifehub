import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../../../context/authcontext/useAuth'
import { getApiErrorMessage } from '../../../lib/apiClient'
import { PlanDashboard } from '../../../types/plan'
import { getPlanDashboard, listPlans } from '../api/planApi'

export function PlanModule() {
  const { isAuthenticated } = useAuth()
  const [dashboard, setDashboard] = useState<PlanDashboard>({ totalPlans: 0, activePlans: 0, completedPlans: 0, upcomingPlans: 0, overduePlans: 0 })
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setDashboard(await getPlanDashboard())
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [])

  const loadPlans = useCallback(async () => {
    try {
      await listPlans({ pageSize: 20 })
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    loadDashboard()
    loadPlans()
  }, [isAuthenticated, loadDashboard, loadPlans])

  if (!isAuthenticated) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-700">Please sign in to access plans.</div>
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-indigo-600">Planning</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">Plan module placeholder</h1>
            <p className="mt-2 text-sm text-slate-600">The main plan experience is implemented in <code className="rounded bg-slate-100 px-2 py-1">/plans</code>.</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[
            { label: 'Total plans', value: dashboard.totalPlans },
            { label: 'Active', value: dashboard.activePlans },
            { label: 'Completed', value: dashboard.completedPlans },
          ].map((card) => (
            <div key={card.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
            </div>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  )
}
