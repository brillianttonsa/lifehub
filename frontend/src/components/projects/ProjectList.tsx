import { motion } from 'framer-motion'
import { Calendar, Folder, Plus, Users } from 'lucide-react'
import { Project } from '../../types/project'
import { formatDate } from '../../utils/projects/format'
import { getStatusColor } from '../../utils/projects/style'

interface ProjectListProps {
  projects: Project[]
  selectedProjectId: string
  onViewProject: (projectId: string) => void
  onCreateProject?: () => void
  isLoading?: boolean
}

export function ProjectList({
  projects,
  selectedProjectId,
  onViewProject,
  onCreateProject,
  isLoading = false,
}: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-2 rounded-3xl border border-slate-200 bg-white p-5">
            <div className="h-4 w-1/3 rounded-full bg-slate-200"></div>
            <div className="h-3 w-full rounded-full bg-slate-100"></div>
            <div className="h-3 w-2/3 rounded-full bg-slate-100"></div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <Folder className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm text-slate-500">No projects yet. Create one to get started.</p>
        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus size={16} /> Create your first project
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {projects.map((project) => (
        <motion.div
          key={project.id}
          whileHover={{ y: -2 }}
          className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
            selectedProjectId === project.id ? 'border-indigo-300 bg-indigo-50/40' : 'border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-indigo-500" />
                <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
              </div>
              <p className="max-w-2xl text-sm text-slate-600">{project.description}</p>
            </div>

            <div className="flex shrink-0 items-center gap-4 text-sm">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Members</span>
                <span className="flex items-center gap-1 font-semibold text-slate-800">
                  <Users size={14} /> {project.memberCount}
                </span>
              </div>
              <div className="flex flex-col border-l border-slate-200 pl-4 text-right">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Created</span>
                <span className="font-semibold text-slate-800">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {project.lastActivity}
            </span>
            <button
              onClick={() => onViewProject(project.id)}
              className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-500"
            >
              View project
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
