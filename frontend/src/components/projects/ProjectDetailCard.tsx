import { useState } from 'react'
import { Activity, Trash2 } from 'lucide-react'
import { Project } from '../../types/project'
import { formatDate } from '../../utils/projects/format'
import { ConfirmDialog } from './ConfirmDialog'

interface ProjectDetailCardProps {
  project: Project
  onDelete?: () => void
  deletePending?: boolean
}

export function ProjectDetailCard({ project, onDelete, deletePending = false }: ProjectDetailCardProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  const handleConfirmDelete = () => {
    onDelete?.()
    setIsConfirmOpen(false)
  }

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="space-y-2 border-b border-slate-100 pb-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Activity size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{project.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">{project.description}</p>
          </div>
        </div>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Created</dt>
          <dd className="font-medium text-slate-700">{formatDate(project.createdAt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Owner</dt>
          <dd className="font-medium text-slate-700">{project.owner || 'Unknown'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Members</dt>
          <dd className="font-medium text-slate-700">{project.memberCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Entries</dt>
          <dd className="font-medium text-slate-700">{project.entries.length}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Last activity</dt>
          <dd className="font-medium text-slate-700">{project.lastActivity || 'Never'}</dd>
        </div>
      </dl>

      {onDelete && (
        <>
          <button
            onClick={() => setIsConfirmOpen(true)}
            disabled={deletePending}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
          >
            <Trash2 size={14} />
            {deletePending ? 'Deleting…' : 'Delete project'}
          </button>

          <ConfirmDialog
            isOpen={isConfirmOpen}
            title="Delete this project?"
            message={`This will permanently remove "${project.name}" along with all of its entries, comments, and member access. This can't be undone.`}
            confirmLabel="Delete project"
            isPending={deletePending}
            onConfirm={handleConfirmDelete}
            onCancel={() => setIsConfirmOpen(false)}
          />
        </>
      )}
    </article>
  )
}
