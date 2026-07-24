import { Briefcase, ArrowRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Project } from '../../types/project'

interface ActiveProjectsProps {
  isLoading: boolean
  projects: Project[]
}

export default function ActiveProjects({ isLoading, projects }: ActiveProjectsProps) {
  const navigate = useNavigate()

  // Helper function to format time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Active Projects</h3>
          <button
            onClick={() => navigate('/project')}
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all
          </button>
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 size={32} className="animate-spin text-slate-400" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-center">
            <Briefcase size={32} className="mx-auto text-slate-400 dark:text-slate-600" />
            <p className="mt-2 text-slate-600 dark:text-slate-400">No active projects. Create one to get started!</p>
            <button
              onClick={() => navigate('/project')}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
            >
              New Project <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          projects.slice(0, 3).map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => navigate('/project')}
              className="w-full p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
              title={`Open ${project.name}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{project.name}</p>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Updated {getRelativeTime(project.lastActivityDate ?? project.createdAt)}</p>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{project.status}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <p className="text-slate-600 dark:text-slate-400">{project.lastActivity}</p>
                <p className="text-slate-600 dark:text-slate-400">{project.memberCount} Members</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
