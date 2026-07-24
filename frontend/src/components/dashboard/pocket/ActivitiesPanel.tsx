import { FormEvent, useState } from 'react'
import { Tag } from 'lucide-react'
import { ActivityStatus, PocketActivity } from '../../../types/pocket'
import { EmptyState, Panel } from './PocketPrimitives'

interface ActivitiesPanelProps {
  activities: PocketActivity[]
  activityStatus: ActivityStatus
  isSaving: boolean
  onStatusChange: (status: ActivityStatus) => void
  onCreate: (name: string) => Promise<boolean>
  onArchive: (activityId: string) => void
  onRestore: (activityId: string) => void
}

export function ActivitiesPanel({
  activities,
  activityStatus,
  isSaving,
  onStatusChange,
  onCreate,
  onArchive,
  onRestore,
}: ActivitiesPanelProps) {
  const [activityName, setActivityName] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!activityName.trim()) return

    const created = await onCreate(activityName.trim())
    if (created) setActivityName('')
  }

  return (
    <Panel title="Activities" icon={Tag} subtitle="Tag transactions by purpose">
      <div className="mb-4 flex gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {(['active', 'deleted'] as ActivityStatus[]).map((status) => (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold capitalize transition ${
              activityStatus === status
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
        <input
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
          placeholder="Activity name"
          className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
        />
        <button
          disabled={isSaving}
          className="shrink-0 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Add
        </button>
      </form>

      <div className="space-y-2">
        {activities.length === 0 && <EmptyState label="No activities in this view." />}
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950"
          >
            <span className="truncate font-medium capitalize text-slate-700 dark:text-slate-300">{activity.name}</span>
            {activity.isDeleted ? (
              <button
                onClick={() => onRestore(activity.id)}
                className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                Restore
              </button>
            ) : (
              <button
                onClick={() => onArchive(activity.id)}
                className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 dark:hover:text-rose-300"
              >
                Archive
              </button>
            )}
          </div>
        ))}
      </div>
    </Panel>
  )
}