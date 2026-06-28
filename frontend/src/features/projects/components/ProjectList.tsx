import { Project } from '../../../types/project'
import { formatDate, getStatusColor } from '../coreFiles/hooks'
import { Folder, Users, Calendar } from 'lucide-react'

interface ProjectListProps {
  projects: Project[]
  selectedProjectId: string
  onSelectProject: (projectId: string) => void
  onCreateProject?: () => void
  isLoading?: boolean
}

export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
  isLoading = false,
}: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-zinc-200 rounded-lg p-4 bg-white space-y-2 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-1/3"></div>
            <div className="h-3 bg-zinc-200 rounded w-full"></div>
            <div className="h-3 bg-zinc-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-zinc-200 rounded-lg bg-zinc-50">
        <Folder className="w-8 h-8 text-zinc-400 mx-auto" />
        <p className="text-xs text-zinc-500 font-medium mt-2">No active database directory nodes linked.</p>
        {onCreateProject && (
          <button
            onClick={onCreateProject}
            className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-md transition-all"
          >
            Create Your First Project
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {projects.map((project) => (
        <button
          key={project.id}
          onClick={() => onSelectProject(project.id)}
          className={`border rounded-lg p-5 bg-white transition-all cursor-pointer text-left hover:shadow-sm ${
            selectedProjectId === project.id ? 'border-zinc-400 bg-zinc-50' : 'border-zinc-200 hover:border-zinc-300'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-zinc-500" />
                <h3 className="font-bold text-base text-zinc-950">{project.name}</h3>
              </div>
              <p className="text-xs text-zinc-500 font-normal max-w-2xl">{project.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono shrink-0">
              <div className="flex flex-col text-right">
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Authorized Tiers</span>
                <span className="text-zinc-800 font-semibold flex items-center gap-1">
                  <Users size={14} /> {project.memberCount} Operators
                </span>
              </div>
              <div className="flex flex-col text-right border-l border-zinc-200 pl-4">
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Creation Timestamp</span>
                <span className="text-zinc-800 font-semibold">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getStatusColor(project.status)}`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-zinc-100 flex justify-between items-center text-[10.5px] font-mono text-zinc-400">
            <span>{project.memberCount} members</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {project.lastActivity}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}