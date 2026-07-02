import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/authcontext/useAuth'
import { getApiErrorMessage } from '../lib/apiClient'
import { getPlanDashboard, listPlans, createPlan, deletePlan, archivePlan, updatePlanProgress } from '../features/plan/api/planApi'
import { Plan, PlanPriority, PlanStatus, PlanTimeframe } from '../types/plan'
import { InputField } from '../components/ui/InputField'
import { Plus, List, LayoutGrid, Search, Trash2, Archive, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const statusOptions: PlanStatus[] = ['Draft', 'Active', 'Completed', 'Archived', 'Cancelled']
const timeframeOptions: PlanTimeframe[] = ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Custom Range']
const priorityOptions: PlanPriority[] = ['Low', 'Medium', 'High']
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'priority', label: 'Priority' },
  { value: 'progress', label: 'Progress' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getStatusStyle(status: PlanStatus) {
  return {
    Draft: 'bg-slate-100 text-slate-700 border-slate-200',
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200',
    Archived: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  }[status]
}

function getPriorityStyle(priority: PlanPriority) {
  return {
    Low: 'bg-emerald-50 text-emerald-700',
    Medium: 'bg-amber-50 text-amber-700',
    High: 'bg-rose-50 text-rose-700',
  }[priority]
}

export default function Plans() {
  const { user, isAuthenticated } = useAuth()
  const [dashboard, setDashboard] = useState({
    totalPlans: 0,
    activePlans: 0,
    completedPlans: 0,
    upcomingPlans: 0,
    overduePlans: 0,
  })
  const [plans, setPlans] = useState<Plan[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [timeframe, setTimeframe] = useState('')
  const [priority, setPriority] = useState('')
  const [sort, setSort] = useState('newest')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    timeframe: 'Monthly' as PlanTimeframe,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
    priority: 'Medium' as PlanPriority,
    status: 'Active' as PlanStatus,
    notes: '',
  })

  const filters = useMemo(
    () => ({
      search: query,
      status: status || undefined,
      timeframe: timeframe || undefined,
      priority: priority || undefined,
      sort,
      pageSize: 50,
    }),
    [query, status, timeframe, priority, sort],
  )

  const loadDashboard = useCallback(async () => {
    try {
      const overview = await getPlanDashboard()
      setDashboard(overview)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [])

  const loadPlans = useCallback(async () => {
    try {
      const response = await listPlans(filters)
      setPlans(response.plans)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [filters])

  useEffect(() => {
    if (!isAuthenticated) return
    loadDashboard()
    loadPlans()
  }, [isAuthenticated, loadDashboard, loadPlans])

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreatePlan = async () => {
    if (!form.title.trim()) {
      setError('Title is required.')
      return
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError('End date cannot be before start date.')
      return
    }

    setIsSaving(true)
    try {
      await createPlan({
        title: form.title.trim(),
        description: form.description.trim(),
        timeframe: form.timeframe,
        startDate: form.startDate,
        endDate: form.endDate,
        priority: form.priority,
        status: form.status,
        notes: form.notes.trim(),
      })
      setForm((prev) => ({ ...prev, title: '', description: '', notes: '' }))
      setShowCreate(false)
      await loadDashboard()
      await loadPlans()
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (planId: string) => {
    try {
      await deletePlan(planId)
      await loadDashboard()
      await loadPlans()
      if (selectedPlan?.id === planId) setSelectedPlan(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleArchive = async (planId: string) => {
    try {
      await archivePlan(planId)
      await loadDashboard()
      await loadPlans()
      if (selectedPlan?.id === planId) setSelectedPlan(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleProgressChange = async (planId: string, value: number) => {
    try {
      await updatePlanProgress(planId, { progress: value })
      await loadDashboard()
      await loadPlans()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-slate-50 text-slate-900">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-lg p-10 max-w-xl text-center">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400 mb-3">Protected page</p>
          <h1 className="text-3xl font-semibold mb-3">Sign in to access your plans</h1>
          <p className="text-sm text-slate-500 mb-6">Plans are stored securely and require an authenticated LifeHub session.</p>
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition">
            Return to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-indigo-600 uppercase tracking-[0.24em]">Plan</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Strategic plans and objectives</h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">Define what you want to accomplish over time, then track progress, archive completed milestones, and keep the plan visible.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button onClick={() => setViewMode('grid')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <LayoutGrid size={16} /> Grid
              </button>
              <button onClick={() => setViewMode('list')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}>
                <List size={16} /> List
              </button>
            </div>
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-500">
              <Plus size={16} /> New plan
            </button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { key: 'totalPlans', label: 'Total plans', value: dashboard.totalPlans, icon: ArrowUpRight },
                { key: 'activePlans', label: 'Active', value: dashboard.activePlans, icon: ArrowUpRight },
                { key: 'completedPlans', label: 'Completed', value: dashboard.completedPlans, icon: ArrowDownRight },
                { key: 'upcomingPlans', label: 'Upcoming', value: dashboard.upcomingPlans, icon: ArrowUpRight },
                { key: 'overduePlans', label: 'Overdue', value: dashboard.overduePlans, icon: ArrowDownRight },
              ].map((card) => (
                <motion.div key={card.key} whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{card.label}</p>
                      <p className="mt-3 text-3xl font-semibold text-slate-900">{card.value}</p>
                    </div>
                    <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner shadow-indigo-100/80">
                      <card.icon size={18} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Plans</h2>
                  <p className="text-sm text-slate-500">Filter, sort, and review plans by status, timeframe and progress.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                    <Search size={16} className="text-slate-400" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search plans" className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400" />
                  </div>
                  <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={status} onChange={(event) => setStatus(event.target.value)}>
                    <option value="">All statuses</option>
                    {statusOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                  </select>
                  <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900" value={sort} onChange={(event) => setSort(event.target.value)}>
                    {sortOptions.map((option) => (<option key={option.value} value={option.value}>{option.label}</option>))}
                  </select>
                </div>
              </div>
            </section>

            <div className={`${viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2' : ''}`}>
              {plans.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                  No plans found. Add a plan to get started.
                </div>
              ) : (
                plans.map((plan) => (
                  <motion.article key={plan.id} layout whileHover={{ y: -2 }} className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${viewMode === 'list' ? 'flex flex-col gap-4' : ''}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{plan.timeframe}</p>
                        <h3 className="text-xl font-semibold text-slate-900">{plan.title}</h3>
                        <p className="text-sm leading-6 text-slate-600 line-clamp-2">{plan.description || 'No description added yet.'}</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusStyle(plan.status)}`}>{plan.status}</span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-600">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Period</p>
                        <p className="mt-2 font-semibold text-slate-900">{formatDate(plan.startDate)} — {formatDate(plan.endDate)}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-600">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Priority</p>
                        <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPriorityStyle(plan.priority)}`}>{plan.priority}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-600">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Progress</p>
                        <p className="mt-2 text-slate-900 font-semibold">{plan.progress}%</p>
                      </div>
                      <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-600">
                        <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">Updated</p>
                        <p className="mt-2 text-slate-900 font-semibold">{formatDate(plan.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="w-full">
                        <label className="text-xs uppercase tracking-[0.24em] text-slate-400">Adjust progress</label>
                        <input type="range" min={0} max={100} value={plan.progress} onChange={(event) => handleProgressChange(plan.id, Number(event.target.value))} className="mt-2 w-full" />
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setSelectedPlan(plan)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">View</button>
                        <button onClick={() => handleArchive(plan.id)} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 transition">Archive</button>
                        <button onClick={() => handleDelete(plan.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition">Delete</button>
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Help guide</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Use this module to capture your yearly and quarterly intentions. Keep each plan strategic, not a daily task. Update progress manually and archive when completed.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm uppercase tracking-[0.24em] text-slate-400">Quick stats</h3>
              <div className="mt-4 grid gap-3">
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold">{plans.filter((p) => p.progress === 100).length}</p>
                  <p className="text-slate-500">Fully completed plans</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold">{plans.filter((p) => p.status === 'Draft').length}</p>
                  <p className="text-slate-500">Draft plans</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="font-semibold">{plans.filter((p) => p.status === 'Completed').length}%</p>
                  <p className="text-slate-500">Completed status count</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <AnimatePresence>
          {selectedPlan && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-start">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Plan details</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">{selectedPlan.title}</h2>
                  <p className="mt-3 text-sm text-slate-600 leading-6">{selectedPlan.description || 'No additional description provided.'}</p>
                </div>
                <button onClick={() => setSelectedPlan(null)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Close</button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Status', value: selectedPlan.status },
                  { label: 'Timeframe', value: selectedPlan.timeframe },
                  { label: 'Period', value: `${formatDate(selectedPlan.startDate)} — ${formatDate(selectedPlan.endDate)}` },
                  { label: 'Updated', value: formatDate(selectedPlan.updatedAt) },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                    <p className="mt-2 font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Progress</p>
                  <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full bg-indigo-600 transition-all" style={{ width: `${selectedPlan.progress}%` }} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{selectedPlan.progress}% complete</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Notes</p>
                  <p className="mt-3 leading-6 text-slate-600">{selectedPlan.notes || 'No notes yet.'}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">New plan</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">Create a planning objective</h2>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <InputField label="Title" value={form.title} onChange={(value) => updateForm('title', value)} placeholder="Save TZS 5,000,000" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Timeframe</label>
                    <select value={form.timeframe} onChange={(event) => updateForm('timeframe', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
                      {timeframeOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Start date</label>
                    <input type="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">End date</label>
                    <input type="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none" />
                  </div>
                  <InputField label="Priority" value={form.priority} onChange={(value) => updateForm('priority', value)} placeholder="Medium" />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</label>
                    <select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none">
                      {statusOptions.map((option) => (<option key={option} value={option}>{option}</option>))}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <InputField label="Description" value={form.description} onChange={(value) => updateForm('description', value)} placeholder="What do you want to achieve?" />
                  </div>
                  <div className="lg:col-span-2">
                    <InputField label="Notes" value={form.notes} onChange={(value) => updateForm('notes', value)} placeholder="Optional context, milestones, and reminders" />
                  </div>
                </div>
                {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setShowCreate(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">Cancel</button>
                  <button onClick={handleCreatePlan} disabled={isSaving} className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
                    {isSaving ? 'Saving…' : 'Create plan'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
