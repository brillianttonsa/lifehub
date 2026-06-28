import { Project } from '../../../types/project'
import { formatDate } from '../coreFiles/hooks'
import { Activity, Trash2 } from 'lucide-react'

interface ProjectDetailCardProps {
  project: Project
  onDelete?: () => void
  deletePending?: boolean
}

export function ProjectDetailCard({ project, onDelete, deletePending = false }: ProjectDetailCardProps) {
  return (
    <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
      <div className="space-y-2 border-b border-zinc-200 pb-4">
        <div className="flex items-start gap-2">
          <Activity size={18} className="text-zinc-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-sm text-zinc-950">{project.name}</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">{project.description}</p>
          </div>
        </div>
      </div>

      <dl className="space-y-3 text-[11px]">
        <div className="flex justify-between">
          <dt className="font-mono font-bold text-zinc-500 uppercase tracking-wider">Created</dt>
          <dd className="text-zinc-700 font-medium">{formatDate(project.createdAt)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-mono font-bold text-zinc-500 uppercase tracking-wider">Owner</dt>
          <dd className="text-zinc-700 font-medium">{project.owner || 'Unknown'}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-mono font-bold text-zinc-500 uppercase tracking-wider">Members</dt>
          <dd className="text-zinc-700 font-medium">{project.memberCount}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-mono font-bold text-zinc-500 uppercase tracking-wider">Entries</dt>
          <dd className="text-zinc-700 font-medium">{project.entries.length}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="font-mono font-bold text-zinc-500 uppercase tracking-wider">Last Activity</dt>
          <dd className="text-zinc-700 font-medium">{project.lastActivity || 'Never'}</dd>
        </div>
      </dl>

      {onDelete && (
        <button
          onClick={onDelete}
          disabled={deletePending}
          className="w-full bg-red-50 hover:bg-red-100 disabled:bg-zinc-100 text-red-600 disabled:text-zinc-400 font-bold text-xs py-2 rounded transition-all flex items-center justify-center gap-1.5 border border-red-200 disabled:border-zinc-200"
        >
          <Trash2 size={14} />
          {deletePending ? 'Deleting...' : 'Delete Project'}
        </button>
      )}
    </article>
  )
}