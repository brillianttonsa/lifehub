import { useMemo, useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/authcontext/useAuth'
import { getApiErrorMessage } from '../../lib/apiClient'
import {
  getPlanningCycleDashboard,
  listPlanningCycles,
  createPlanningCycle,
  deletePlanningCycle,
  archivePlanningCycle,
  createGoal,
  updateGoalProgress,
  updateGoal,
  deleteGoal,
} from '../../api/planApi'
import { PlanningCycle, Goal, CycleType, CycleStatus, GoalPriority, GoalStatus } from '../../types/plan'
import { InputField } from '../../components/ui/InputField'
import {
  Plus,
  List,
  LayoutGrid,
  Search,
  Trash2,
  Archive,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Target,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const cycleStatusOptions: CycleStatus[] = ['Active', 'Completed', 'Archived']
const cycleTypeOptions: CycleType[] = ['Yearly', 'Half-Yearly', 'Quarterly', 'Monthly', 'Weekly', 'Custom']
const goalPriorityOptions: GoalPriority[] = ['Low', 'Medium', 'High']
const goalStatusOptions: GoalStatus[] = ['Pending', 'In Progress', 'Completed']
const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'deadline', label: 'Deadline' },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getCycleStatusStyle(status: CycleStatus) {
  const styles: Record<CycleStatus, string> = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/50',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50',
    Archived: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800/60 dark:text-zinc-300 dark:border-zinc-700/50',
  }
  return styles[status]
}

function getGoalStatusStyle(status: GoalStatus) {
  const styles: Record<GoalStatus, string> = {
    Pending: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300 dark:border-slate-700/50',
    'In Progress': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/50',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/50',
  }
  return styles[status]
}

function getPriorityStyle(priority: GoalPriority) {
  const styles: Record<GoalPriority, string> = {
    Low: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400',
    High: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
  }
  return styles[priority]
}

const emptyCycleForm = () => ({
  name: '',
  type: 'Monthly' as CycleType,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
  status: 'Active' as CycleStatus,
})

const emptyGoalForm = () => ({
  title: '',
  description: '',
  priority: 'Medium' as GoalPriority,
  status: 'Pending' as GoalStatus,
  notes: '',
})

export default function PlansModule() {
  const { isAuthenticated } = useAuth()
  const [dashboard, setDashboard] = useState({
    totalCycles: 0,
    activeCycles: 0,
    completedCycles: 0,
    upcomingCycles: 0,
    overdueCycles: 0,
    totalGoals: 0,
    completedGoals: 0,
    inProgressGoals: 0,
  })
  const [cycles, setCycles] = useState<PlanningCycle[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [sort, setSort] = useState('newest')
  const [showCreateCycle, setShowCreateCycle] = useState(false)
  const [expandedCycleId, setExpandedCycleId] = useState<string | null>(null)
  const [showAddGoalFor, setShowAddGoalFor] = useState<string | null>(null)
  const [cycleForm, setCycleForm] = useState(emptyCycleForm())
  const [goalForm, setGoalForm] = useState(emptyGoalForm())

  const filters = useMemo(
    () => ({
      search: query,
      status: (status || undefined) as CycleStatus | undefined,
      type: (type || undefined) as CycleType | undefined,
      sort,
      pageSize: 50,
    }),
    [query, status, type, sort],
  )

  const loadDashboard = useCallback(async () => {
    try {
      const overview = await getPlanningCycleDashboard()
      setDashboard(overview)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [])

  const loadCycles = useCallback(async () => {
    try {
      const response = await listPlanningCycles(filters)
      setCycles(response.cycles)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }, [filters])

  const refreshAll = useCallback(async () => {
    await Promise.all([loadDashboard(), loadCycles()])
  }, [loadDashboard, loadCycles])

  useEffect(() => {
    if (!isAuthenticated) return
    refreshAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filters])

  const updateCycleForm = (field: keyof typeof cycleForm, value: string) => {
    setCycleForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateGoalForm = (field: keyof typeof goalForm, value: string) => {
    setGoalForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateCycle = async () => {
    if (!cycleForm.name.trim()) {
      setError('Name is required.')
      return
    }
    if (new Date(cycleForm.endDate) < new Date(cycleForm.startDate)) {
      setError('End date cannot be before start date.')
      return
    }

    setIsSaving(true)
    try {
      await createPlanningCycle({
        name: cycleForm.name.trim(),
        type: cycleForm.type,
        startDate: cycleForm.startDate,
        endDate: cycleForm.endDate,
        status: cycleForm.status,
      })
      setCycleForm(emptyCycleForm())
      setShowCreateCycle(false)
      await refreshAll()
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCycle = async (cycleId: string) => {
    try {
      await deletePlanningCycle(cycleId)
      await refreshAll()
      if (expandedCycleId === cycleId) setExpandedCycleId(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleArchiveCycle = async (cycleId: string) => {
    try {
      await archivePlanningCycle(cycleId)
      await refreshAll()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleAddGoal = async (cycleId: string) => {
    if (!goalForm.title.trim()) {
      setError('Goal title is required.')
      return
    }

    setIsSaving(true)
    try {
      await createGoal(cycleId, {
        title: goalForm.title.trim(),
        description: goalForm.description.trim(),
        priority: goalForm.priority,
        status: goalForm.status,
        notes: goalForm.notes.trim(),
      })
      setGoalForm(emptyGoalForm())
      setShowAddGoalFor(null)
      await refreshAll()
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleGoalProgressChange = async (goalId: string, value: number) => {
    try {
      await updateGoalProgress(goalId, value)
      await refreshAll()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleGoalStatusChange = async (goalId: string, value: GoalStatus) => {
    try {
      await updateGoal(goalId, { status: value })
      await refreshAll()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
      await refreshAll()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 max-w-xl text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500 mb-3">Protected page</p>
          <h1 className="text-3xl font-semibold mb-3 text-slate-900 dark:text-slate-100">Sign in to access your plans</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Planning cycles are stored securely and require an authenticated LifeHub session.</p>
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition">
            Return to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 px-4 py-6 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
          <div>
            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.24em]">Plan</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Planning cycles &amp; goals</h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Group everything you're working toward into a shared timeframe — like "Q1 2027" — then track each goal
              inside it instead of juggling separate plans with duplicated dates.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex gap-2 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <button onClick={() => setViewMode('grid')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === 'grid' ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                <LayoutGrid size={16} /> Grid
              </button>
              <button onClick={() => setViewMode('list')} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${viewMode === 'list' ? 'bg-indigo-600 text-white dark:bg-indigo-500' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`}>
                <List size={16} /> List
              </button>
            </div>
            <button onClick={() => setShowCreateCycle(true)} className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500">
              <Plus size={16} /> New planning cycle
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-4">
          {[
            { key: 'totalCycles', label: 'Total cycles', value: dashboard.totalCycles, icon: ArrowUpRight },
            { key: 'activeCycles', label: 'Active', value: dashboard.activeCycles, icon: ArrowUpRight },
            { key: 'overdueCycles', label: 'Overdue', value: dashboard.overdueCycles, icon: ArrowDownRight },
            { key: 'totalGoals', label: 'Total goals', value: dashboard.totalGoals, icon: Target },
          ].map((card) => (
            <motion.div key={card.key} whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">{card.value}</p>
                </div>
                <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600 shadow-inner shadow-indigo-100/80 dark:bg-indigo-950/60 dark:text-indigo-400 dark:shadow-none">
                  <card.icon size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm mb-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Planning cycles</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Filter and sort your cycles, then open one to manage its goals.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/50">
                <Search size={16} className="text-slate-400 dark:text-slate-500" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search cycles" className="w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500" />
              </div>
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100" value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="" className="dark:bg-slate-900">All statuses</option>
                {cycleStatusOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
              </select>
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100" value={type} onChange={(event) => setType(event.target.value)}>
                <option value="" className="dark:bg-slate-900">All types</option>
                {cycleTypeOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
              </select>
              <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100" value={sort} onChange={(event) => setSort(event.target.value)}>
                {sortOptions.map((option) => (<option key={option.value} value={option.value} className="dark:bg-slate-900">{option.label}</option>))}
              </select>
            </div>
          </div>
        </section>

        {error && <p className="mb-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

        <div className={`${viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'}`}>
          {cycles.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No planning cycles yet. Create one (e.g. "Q1 2027") to start grouping your goals.
            </div>
          ) : (
            cycles.map((cycle) => {
              const isExpanded = expandedCycleId === cycle.id
              return (
                <motion.article key={cycle.id} layout className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{cycle.type}</p>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{cycle.name}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getCycleStatusStyle(cycle.status)}`}>{cycle.status}</span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Goals</p>
                      <p className="mt-2 font-semibold text-slate-900 dark:text-slate-100">{cycle.completedGoalCount} / {cycle.goalCount} completed</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/50 dark:text-slate-400">
                      <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Overall progress</p>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                        <div className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all" style={{ width: `${cycle.progress}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-slate-100">{cycle.progress}%</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button onClick={() => setExpandedCycleId(isExpanded ? null : cycle.id)} className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} {isExpanded ? 'Hide goals' : 'View goals'}
                    </button>
                    <button onClick={() => setShowAddGoalFor(cycle.id)} className="inline-flex items-center gap-1.5 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800/60 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition">
                      <Plus size={14} /> Add goal
                    </button>
                    <button onClick={() => handleArchiveCycle(cycle.id)} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-900/60 transition">
                      <Archive size={14} className="inline mr-1.5 -mt-0.5" /> Archive
                    </button>
                    <button onClick={() => handleDeleteCycle(cycle.id)} className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 transition">
                      <Trash2 size={14} className="inline mr-1.5 -mt-0.5" /> Delete
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-5 overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-4">
                        {cycle.goals.length === 0 ? (
                          <p className="text-sm text-slate-500 dark:text-slate-400">No goals in this cycle yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {cycle.goals.map((goal: Goal) => (
                              <div key={goal.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <h4 className="font-semibold text-slate-900 dark:text-slate-100">{goal.title}</h4>
                                    {goal.description && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{goal.description}</p>}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(goal.priority)}`}>{goal.priority}</span>
                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${getGoalStatusStyle(goal.status)}`}>{goal.status}</span>
                                  </div>
                                </div>
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div className="w-full sm:max-w-xs">
                                    <label className="text-[10px] uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">Progress ({goal.progress}%)</label>
                                    <input type="range" min={0} max={100} value={goal.progress} onChange={(event) => handleGoalProgressChange(goal.id, Number(event.target.value))} className="mt-1 w-full accent-indigo-600 dark:accent-indigo-500" />
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <select value={goal.status} onChange={(event) => handleGoalStatusChange(goal.id, event.target.value as GoalStatus)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                                      {goalStatusOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
                                    </select>
                                    <button onClick={() => handleDeleteGoal(goal.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-900/60 transition">
                                      <Trash2 size={13} className="inline mr-1 -mt-0.5" /> Delete
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              )
            })
          )}
        </div>

        <AnimatePresence>
          {showCreateCycle && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/70 p-4">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">New cycle</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Create a planning cycle</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A shared timeframe you'll group goals into, e.g. "Q1 2027" or "Ramadan Goals".</p>
                  </div>
                  <button onClick={() => setShowCreateCycle(false)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">Cancel</button>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <InputField label="Name" value={cycleForm.name} onChange={(value) => updateCycleForm('name', value)} placeholder="Q1 2027" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</label>
                    <select value={cycleForm.type} onChange={(event) => updateCycleForm('type', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      {cycleTypeOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</label>
                    <select value={cycleForm.status} onChange={(event) => updateCycleForm('status', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      {cycleStatusOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Start date</label>
                    <input type="date" value={cycleForm.startDate} onChange={(event) => updateCycleForm('startDate', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">End date</label>
                    <input type="date" value={cycleForm.endDate} onChange={(event) => updateCycleForm('endDate', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100" />
                  </div>
                </div>
                {error && <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setShowCreateCycle(false)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition">Cancel</button>
                  <button onClick={handleCreateCycle} disabled={isSaving} className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500">
                    {isSaving ? 'Saving…' : 'Create cycle'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showAddGoalFor && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 dark:bg-slate-950/70 p-4">
              <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">New goal</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Add a goal to this cycle</h2>
                  </div>
                  <button onClick={() => setShowAddGoalFor(null)} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">Cancel</button>
                </div>
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <InputField label="Title" value={goalForm.title} onChange={(value) => updateGoalForm('title', value)} placeholder="Learn Docker" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Priority</label>
                    <select value={goalForm.priority} onChange={(event) => updateGoalForm('priority', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      {goalPriorityOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</label>
                    <select value={goalForm.status} onChange={(event) => updateGoalForm('status', event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100">
                      {goalStatusOptions.map((option) => (<option key={option} value={option} className="dark:bg-slate-900">{option}</option>))}
                    </select>
                  </div>
                  <div className="lg:col-span-2">
                    <InputField label="Description" value={goalForm.description} onChange={(value) => updateGoalForm('description', value)} placeholder="What does 'done' look like?" />
                  </div>
                  <div className="lg:col-span-2">
                    <InputField label="Notes" value={goalForm.notes} onChange={(value) => updateGoalForm('notes', value)} placeholder="Optional context, milestones, and reminders" />
                  </div>
                </div>
                {error && <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button onClick={() => setShowAddGoalFor(null)} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition">Cancel</button>
                  <button onClick={() => showAddGoalFor && handleAddGoal(showAddGoalFor)} disabled={isSaving} className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500">
                    {isSaving ? 'Saving…' : 'Add goal'}
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