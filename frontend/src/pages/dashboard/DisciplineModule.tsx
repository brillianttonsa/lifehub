import { useCallback, useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import {
  listCycles,
  createCycle,
  deleteCycle,
  updateCycleStatus,
} from '../../api/disciplineApi'
import { DisciplineCycle } from '../../types/discipline'
import { useDisciplineGrid } from '../../hooks/dashboard/useDisciplineGrid'
import CycleHeader from '../../components/dashboard/dicipline/CycleHeader'
import TaskList from '../../components/dashboard/dicipline/TaskList'
import Grid from '../../components/dashboard/dicipline/Grid'
import { getApiErrorMessage } from '../../lib/apiClient'

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
  completed: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
  archived: 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
}

export default function DisciplineModule() {
  const [cycles, setCycles] = useState<DisciplineCycle[]>([])
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().slice(0, 10),
  })

  const { grid, isLoading, error: gridError, toggle, addTask, renameTask, removeTask } =
    useDisciplineGrid(selectedCycleId)

  const loadCycles = useCallback(async () => {
    try {
      const data = await listCycles()
      setCycles(data)
      setError(null)
      if (!selectedCycleId && data.length > 0) {
        setSelectedCycleId(data[0].id)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    loadCycles()
  }, [loadCycles])

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleCreateCycle = async () => {
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
      const created = await createCycle({
        title: form.title.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      })
      setForm((prev) => ({ ...prev, title: '', description: '' }))
      setShowCreate(false)
      await loadCycles()
      setSelectedCycleId(created.id)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCycle = async (cycleId: string) => {
    try {
      await deleteCycle(cycleId)
      if (selectedCycleId === cycleId) setSelectedCycleId(null)
      await loadCycles()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleArchiveCycle = async (cycleId: string) => {
    try {
      await updateCycleStatus(cycleId, 'archived')
      await loadCycles()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleCompleteCycle = async (cycleId: string) => {
    try {
      await updateCycleStatus(cycleId, 'completed')
      await loadCycles()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">Discipline</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Discipline cycles</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
              Set non-negotiable tasks for a fixed date range, then click each day to mark it done. No forms, no scheduling — just execution.
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
          >
            <Plus size={16} /> New cycle
          </button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
          {/* Cycle list / selector */}
          <aside className="space-y-2">
            {cycles.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                No cycles yet. Create your first one.
              </div>
            ) : (
              cycles.map((cycle) => (
                <button
                  key={cycle.id}
                  onClick={() => setSelectedCycleId(cycle.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selectedCycleId === cycle.id
                      ? 'border-indigo-300 bg-indigo-50 dark:border-indigo-500/50 dark:bg-indigo-950/40'
                      : 'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{cycle.title}</span>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyles[cycle.status]}`}>
                      {cycle.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {cycle.startDate} → {cycle.endDate}
                  </p>
                </button>
              ))
            )}
          </aside>

          {/* Active cycle: header, tasks, grid */}
          <div className="min-w-0 space-y-4">
            {(error || gridError) && (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-400">
                {error || gridError}
              </p>
            )}

            {!selectedCycleId ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                Select or create a cycle to see its grid.
              </div>
            ) : isLoading || !grid ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">Loading…</div>
            ) : (
              <>
                <CycleHeader
                  cycle={grid.cycle}
                  disciplineScore={grid.disciplineScore}
                  doneCells={grid.doneCells}
                  totalCells={grid.totalCells}
                  onArchive={() => handleArchiveCycle(grid.cycle.id)}
                  onComplete={() => handleCompleteCycle(grid.cycle.id)}
                  onDelete={() => handleDeleteCycle(grid.cycle.id)}
                />
                <TaskList tasks={grid.tasks} onAdd={addTask} onRename={renameTask} onDelete={removeTask} />
                <Grid tasks={grid.tasks} dates={grid.dates} logs={grid.logs} onToggle={toggle} />
              </>
            )}
          </div>
        </div>

        {/* Create cycle modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm dark:bg-slate-950/80">
            <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">New cycle</p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Create a discipline cycle</h2>
                </div>
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Title</label>
                  <input
                    value={form.title}
                    onChange={(event) => updateForm('title', event.target.value)}
                    placeholder="30-day discipline sprint"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 dark:focus:border-indigo-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Description</label>
                  <input
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    placeholder="Optional context"
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-600 dark:focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Start date</label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => updateForm('startDate', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">End date</label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => updateForm('endDate', event.target.value)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-rose-600 dark:text-rose-400">{error}</p>}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCycle}
                  disabled={isSaving}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500"
                >
                  {isSaving ? 'Saving…' : 'Create cycle'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
