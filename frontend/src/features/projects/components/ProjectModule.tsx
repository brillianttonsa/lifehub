import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Users,
  MessageSquareText,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  BookOpen,
  Activity,
  Folder,
  Calendar,
  Search,
  Layout,
  Settings,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import {
  Project,
  Role,
  Entry,
  Comment,
  ProjectMember,
  User,
  Toast as ToastMessage,
  PERMISSION_MAP,
} from '../../../types/project'
import { getApiErrorMessage } from '../../../lib/apiClient'
import {
  addMember,
  createComment,
  createEntry,
  createProject,
  deleteEntry,
  deleteProject,
  listComments,
  listEntries,
  listProjects,
  removeMember,
  updateMemberRole,
} from '../api/projectApi'

// ============================================================================
// Permissions Hook & Utility Functions (from hooks.ts)
// ============================================================================

export const usePermissions = (userRole: Role) => {
  const checkPermission = useCallback(
    (action: string): boolean => {
      const allowedActions = PERMISSION_MAP[userRole] || []
      return allowedActions.includes(action)
    },
    [userRole],
  )

  const hasPermission = useCallback(
    (actions: string[]): boolean => {
      return actions.every((action) => checkPermission(action))
    },
    [checkPermission],
  )

  const canDeleteProject = useCallback(() => checkPermission('delete_project'), [checkPermission])
  const canManageMembers = useCallback(() => checkPermission('manage_members'), [checkPermission])
  const canCreateEntry = useCallback(() => checkPermission('create_entry'), [checkPermission])
  const canAddComment = useCallback(() => checkPermission('add_comment'), [checkPermission])
  const canDeleteEntry = useCallback(() => checkPermission('delete_entry'), [checkPermission])

  return {
    checkPermission,
    hasPermission,
    canDeleteProject,
    canManageMembers,
    canCreateEntry,
    canAddComment,
    canDeleteEntry,
  }
}

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No activity yet'

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString))
  } catch {
    return 'Invalid date'
  }
}

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'No activity yet'

  try {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  } catch {
    return 'Invalid date'
  }
}

export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export const getRoleColor = (role: Role): string => {
  const colors: Record<Role, string> = {
    owner: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    contributor: 'bg-blue-50 text-blue-700 border-blue-200',
    viewer_comment: 'bg-amber-50 text-amber-700 border-amber-200',
    viewer: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  }
  return colors[role]
}

export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    owner: 'Owner',
    contributor: 'Contributor',
    viewer_comment: 'Viewer + Comment',
    viewer: 'Viewer',
  }
  return labels[role]
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
    Archived: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  }
  return colors[status] || 'bg-zinc-50 text-zinc-700 border-zinc-200'
}

// ============================================================================
// Toast Notifications (from Toast.tsx)
// ============================================================================

interface ToastProps {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  onClose: (id: number) => void
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  const bgStyle =
    type === 'error'
      ? 'bg-red-50 border-red-200 text-red-900'
      : type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : 'bg-blue-50 border-blue-200 text-blue-900'

  const Icon = type === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 animate-slide-in ${bgStyle}`}
    >
      <Icon size={18} />
      <span className="text-xs font-medium tracking-tight">{message}</span>
      <button onClick={() => onClose(id)} className="ml-2 font-bold text-lg opacity-50 hover:opacity-100">
        ×
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastMessage[]; onClose: (id: number) => void }) {
  return (
    <div className="font-sans">
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={onClose} />
      ))}
    </div>
  )
}

// ============================================================================
// ProjectList (from ProjectList.tsx)
// ============================================================================

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

// ============================================================================
// ProjectDetailCard (from ProjectDetailCard.tsx)
// ============================================================================

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

// ============================================================================
// EntriesPanel (from EntriesPanel.tsx)
// ============================================================================

interface EntriesPanelProps {
  entries: Entry[]
  selectedEntryId: string
  onSelectEntry: (entryId: string) => void
  onDeleteEntry?: (entryId: string) => void
  onCreateEntry?: () => void
  canDelete?: boolean
  isLoading?: boolean
}

export function EntriesPanel({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onCreateEntry,
  canDelete = false,
  isLoading = false,
}: EntriesPanelProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-zinc-200 rounded-lg p-4 bg-white space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
            <div className="h-3 bg-zinc-200 rounded w-full"></div>
            <div className="h-2 bg-zinc-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50">
        <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
        <p className="text-xs text-zinc-500 font-medium mt-2">Active log ledger is empty for this domain node.</p>
        {onCreateEntry && (
          <button
            onClick={onCreateEntry}
            className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-md transition-all flex items-center gap-1 mx-auto"
          >
            <Plus size={14} /> Initialize First Entry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onSelectEntry(entry.id)}
          className={`border rounded-lg p-5 space-y-3 shadow-sm transition-all cursor-pointer ${
            selectedEntryId === entry.id
              ? 'border-zinc-400 bg-zinc-50'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          {/* Entry Metadata */}
          <div className="flex justify-between items-start gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-800 text-white font-mono flex items-center justify-center text-[10px] font-bold">
                {entry.author.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-zinc-900">{entry.author}</span>
                <span className={`text-[9.5px] uppercase tracking-wider font-bold ml-2 px-1.5 py-0.5 rounded border ${getRoleColor(entry.role)}`}>
                  {entry.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <span className="font-mono text-zinc-400 text-[10.5px]">{entry.date}</span>
          </div>

          {/* Entry Content */}
          <p className="text-xs text-zinc-700 leading-relaxed font-normal line-clamp-3">{entry.content}</p>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <button className="hover:text-zinc-950 flex items-center gap-1 transition-all">
              <MessageSquare size={14} />
              <span>{entry.comments.length} Comments</span>
            </button>

            {canDelete && onDeleteEntry && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteEntry(entry.id)
                }}
                className="hover:text-red-600 flex items-center text-red-500 transition-all gap-1 font-bold"
              >
                <Trash2 size={14} /> Drop
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// CommentsCard (from CommentsCard.tsx)
// ============================================================================

interface CommentsCardProps {
  entry?: Entry
  comments: Comment[]
  onAddComment?: (content: string) => void
  onDeleteComment?: (commentId: string) => void
  isLoading?: boolean
  canComment?: boolean
  newCommentContent?: string
  onCommentContentChange?: (content: string) => void
}

export function CommentsCard({
  entry,
  comments,
  onAddComment,
  onDeleteComment,
  isLoading = false,
  canComment = false,
  newCommentContent = '',
  onCommentContentChange,
}: CommentsCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCommentContent.trim() && onAddComment) {
      onAddComment(newCommentContent)
    }
  }

  if (!entry) {
    return (
      <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-zinc-500">
          <MessageSquareText size={18} />
          <p className="text-xs font-medium">Select an entry to view comments</p>
        </div>
      </article>
    )
  }

  return (
    <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
      <div className="border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-zinc-600" />
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Comments</h3>
            <p className="text-[10.5px] text-zinc-500 mt-0.5">
              {entry.commentsEnabled ? `Entry ${entry.id}` : 'Comments disabled for this entry'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-[11px] text-zinc-400 font-medium text-center py-4">No comments mapped to this thread loop yet.</p>
        )}

        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded p-2 animate-pulse space-y-1">
                <div className="h-3 bg-zinc-200 rounded w-2/3"></div>
                <div className="h-2 bg-zinc-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="text-xs border-b border-zinc-100 pb-2.5 last:border-0">
            <div className="flex justify-between font-mono text-[10px] text-zinc-400 mb-1">
              <span>
                <strong className="text-zinc-700">{comment.author}</strong> ({comment.role.replace('_', ' ')})
              </span>
              <span>{comment.timestamp}</span>
            </div>
            <p className="text-zinc-600 leading-normal">{comment.text}</p>
            {onDeleteComment && (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="text-[9px] text-red-500 hover:text-red-700 mt-1 font-bold"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      {entry.commentsEnabled ? (
        <form onSubmit={handleSubmit} className="pt-3 border-t border-zinc-200 space-y-2">
          <textarea
            value={newCommentContent}
            onChange={(e) => onCommentContentChange?.(e.target.value)}
            placeholder="Write administrative feedback..."
            className="w-full px-3 py-1.5 text-xs bg-white rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none min-h-20"
          />
          <button
            type="submit"
            disabled={!canComment || !newCommentContent.trim()}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5"
          >
            <Send size={12} />
            Post Comment
          </button>
        </form>
      ) : (
        <div className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-100 border border-zinc-200 rounded px-2.5 py-1">
          🔒 Comment permission level restricted
        </div>
      )}
    </article>
  )
}

// ============================================================================
// MembersPanel (from MembersPanel.tsx)
// ============================================================================

interface MembersPanelProps {
  members: ProjectMember[]
  onAddMember?: () => void
  onChangeRole?: (memberEmail: string, newRole: Role) => void
  onRemoveMember?: (memberEmail: string) => void
  canManageMembers?: boolean
  currentUserEmail?: string
}

export function MembersPanel({
  members,
  onAddMember,
  onChangeRole,
  onRemoveMember,
  canManageMembers = false,
  currentUserEmail = '',
}: MembersPanelProps) {
  return (
    <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-zinc-600" />
          <div>
            <h4 className="font-bold text-sm text-zinc-950">Operator Permissions</h4>
            <p className="text-[10.5px] text-zinc-500 mt-0.5">{members.length} total members</p>
          </div>
        </div>
        {canManageMembers && onAddMember && (
          <button onClick={onAddMember} className="text-[11px] font-bold text-zinc-900 hover:underline">
            [+] Add
          </button>
        )}
      </div>

      <div className="space-y-3">
        {members.length === 0 && <p className="text-[11px] text-zinc-400 text-center py-4">No members yet</p>}

        {members.map((member) => (
          <div key={member.email} className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-zinc-700 text-white font-bold flex items-center justify-center text-[10px]">
                {member.name?.substring(0, 1).toUpperCase() || member.email.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-zinc-900 block truncate">{member.name}</strong>
                <span className="text-[9.5px] font-mono text-zinc-400 truncate">{member.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {canManageMembers && member.email !== currentUserEmail ? (
                <div className="flex items-center gap-1">
                  <select
                    value={member.role}
                    onChange={(e) => onChangeRole?.(member.email, e.target.value as Role)}
                    className="text-[9.5px] font-mono font-bold uppercase bg-white border border-zinc-200 rounded py-0.5 px-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="owner">Owner</option>
                    <option value="contributor">Contributor</option>
                    <option value="viewer_comment">Commenter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {onRemoveMember && (
                    <button
                      onClick={() => onRemoveMember(member.email)}
                      className="text-red-500 hover:text-red-700 font-bold px-1"
                      title="Revoke Node Access"
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <span className={`text-[10px] font-mono font-bold uppercase rounded px-2 py-0.5 border ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}

// ============================================================================
// CreateProjectModal (from CreateProjectModal.tsx)
// ============================================================================

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string }) => void
  isPending?: boolean
}

export function CreateProjectModal({ isOpen, onClose, onSubmit, isPending = false }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim()) {
      onSubmit(formData)
      setFormData({ name: '', description: '' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-tight flex items-center gap-2">
            <Plus size={16} /> Link New Local Sync Domain
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Sync Directory Name</label>
            <input
              type="text"
              required
              placeholder="e.g., DHIS2 Integration System"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Description and Compliance Notes</label>
            <textarea
              required
              placeholder="Provide scope, data access structures, or compliance guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold rounded text-xs transition-all"
            >
              {isPending ? 'Creating...' : 'Commit Domain Map'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// CreateEntryModal (from CreateEntryModal.tsx)
// ============================================================================

interface CreateEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { content: string; commentsEnabled: boolean }) => void
  isPending?: boolean
  currentUserName?: string
}

export function CreateEntryModal({ isOpen, onClose, onSubmit, isPending = false, currentUserName = 'User' }: CreateEntryModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    commentsEnabled: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.content.trim()) {
      onSubmit(formData)
      setFormData({ content: '', commentsEnabled: true })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-tight flex items-center gap-2">
            📝 Commit Log to Node
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Author Name</label>
            <input
              type="text"
              disabled
              value={currentUserName}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Active Stream Entry Logs</label>
            <textarea
              required
              placeholder="Document system updates, optimization milestones, or regional validation results..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full h-32 px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded">
            <span className="font-mono text-[11px] text-zinc-500 font-bold">ALLOW COLLABORATIVE COMMENTS</span>
            <input
              type="checkbox"
              checked={formData.commentsEnabled}
              onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 border-zinc-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold rounded text-xs transition-all"
            >
              {isPending ? 'Writing...' : 'Write to Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// AddMemberModal (from AddMemberModal.tsx)
// ============================================================================

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { email: string; role: Role }) => void
  isPending?: boolean
}

export function AddMemberModal({ isOpen, onClose, onSubmit, isPending = false }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'contributor' as Role,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email.trim()) {
      onSubmit(formData)
      setFormData({ email: '', role: 'contributor' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-tight flex items-center gap-2">
            <Users size={16} /> Bind Operator Authority
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Network Email Identity</label>
            <input
              type="email"
              required
              placeholder="operator.name@domain.tz"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Default Permissions Tier</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white font-mono font-bold uppercase text-xs"
            >
              <option value="contributor">Contributor</option>
              <option value="viewer_comment">Commenter</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold rounded text-xs transition-all"
            >
              {isPending ? 'Authorizing...' : 'Authorize Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ============================================================================
// ProjectModule (main component, from ProjectModule.tsx)
// ============================================================================

type ViewType = 'dashboard' | 'projects' | 'detail'

interface ProjectModuleProps {
  currentUser: User
  onSignOut?: () => void
}

export function ProjectModule({ currentUser, onSignOut }: ProjectModuleProps) {
  const [view, setView] = useState<ViewType>('dashboard')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [isSavingEntry, setIsSavingEntry] = useState(false)
  const [isSavingMember, setIsSavingMember] = useState(false)

  // Modal states
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isCreateEntryModalOpen, setIsCreateEntryModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0]
  }, [projects, selectedProjectId])

  const activeEntry = useMemo(() => {
    return activeProject?.entries.find((e) => e.id === selectedEntryId) || activeProject?.entries[0]
  }, [activeProject, selectedEntryId])

  const activeRole = useMemo<Role>(() => {
    return activeProject?.members.find((member) => member.id === currentUser.id)?.role ?? 'viewer'
  }, [activeProject, currentUser.id])

  const permissions = usePermissions(activeRole)

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [projects, searchQuery])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoadingProjects(true)
      try {
        const nextProjects = await listProjects()
        if (cancelled) return

        setProjects(nextProjects)
        setSelectedProjectId((current) => current || nextProjects[0]?.id || '')
      } catch (error) {
        if (!cancelled) showToast(getApiErrorMessage(error), 'error')
      } finally {
        if (!cancelled) setIsLoadingProjects(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [showToast])

  useEffect(() => {
    if (!activeProject) return
    if (activeProject.entries.length > 0) return

    let cancelled = false

    async function loadProjectEntries() {
      setIsLoadingEntries(true)
      try {
        const entries = await listEntries(activeProject)
        if (cancelled) return

        setProjects((prev) =>
          prev.map((project) => (project.id === activeProject.id ? { ...project, entries } : project)),
        )
        setSelectedEntryId((current) => current || entries[0]?.id || '')
      } catch (error) {
        if (!cancelled) showToast(getApiErrorMessage(error), 'error')
      } finally {
        if (!cancelled) setIsLoadingEntries(false)
      }
    }

    loadProjectEntries()

    return () => {
      cancelled = true
    }
  }, [activeProject, showToast])

  useEffect(() => {
    if (!activeProject || !activeEntry) return
    if (activeEntry.comments.length > 0 || activeEntry.commentCount === 0) return

    let cancelled = false

    async function loadEntryComments() {
      try {
        const comments = await listComments(activeEntry, activeProject.members)
        if (cancelled) return

        setProjects((prev) =>
          prev.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  entries: project.entries.map((entry) =>
                    entry.id === activeEntry.id ? { ...entry, comments } : entry,
                  ),
                }
              : project,
          ),
        )
      } catch (error) {
        if (!cancelled) showToast(getApiErrorMessage(error), 'error')
      }
    }

    loadEntryComments()

    return () => {
      cancelled = true
    }
  }, [activeEntry, activeProject, showToast])

  // Project operations
  const handleCreateProject = async (data: { name: string; description: string }) => {
    setIsSavingProject(true)
    try {
      const newProject = await createProject(data)
      setProjects((prev) => [newProject, ...prev])
      setSelectedProjectId(newProject.id)
      setSelectedEntryId('')
      setIsCreateProjectModalOpen(false)
      setView('detail')
      showToast(`Workspace '${data.name}' created successfully.`)
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsSavingProject(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!activeProject) return
    if (!permissions.canDeleteProject()) {
      showToast('Administrative clearance validation failed.', 'error')
      return
    }
    try {
      await deleteProject(activeProject.id)
      setProjects((prev) => {
        const nextProjects = prev.filter((p) => p.id !== activeProject.id)
        setSelectedProjectId(nextProjects[0]?.id || '')
        setSelectedEntryId('')
        return nextProjects
      })
      setView('dashboard')
      showToast('Project deleted successfully.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  // Entry operations
  const handleCreateEntry = async (data: { content: string; commentsEnabled: boolean }) => {
    if (!activeProject) return
    if (!permissions.canCreateEntry()) {
      showToast('Permission denied to create entries.', 'error')
      return
    }

    setIsSavingEntry(true)
    try {
      const newEntry = await createEntry(activeProject, data)

      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                entries: [newEntry, ...p.entries],
                lastActivity: 'Just updated',
                lastActivityDate: newEntry.createdAt,
              }
            : p,
        ),
      )

      setSelectedEntryId(newEntry.id)
      setIsCreateEntryModalOpen(false)
      showToast('Log entry created successfully.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsSavingEntry(false)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!activeProject) return
    if (!permissions.canDeleteEntry()) {
      showToast('Administrative clearance validation failed.', 'error')
      return
    }

    try {
      await deleteEntry(activeProject.id, entryId)
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                entries: p.entries.filter((e) => e.id !== entryId),
              }
            : p,
        ),
      )
      setSelectedEntryId(activeProject.entries.find((entry) => entry.id !== entryId)?.id || '')
      showToast('Sync log dropped securely.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  // Comment operations
  const handleAddComment = async () => {
    if (!activeProject || !activeEntry || !permissions.canAddComment()) {
      showToast('Permission denied to add comments.', 'error')
      return
    }

    if (!newCommentContent.trim()) return

    try {
      const newComment = await createComment(activeEntry, activeProject.members, newCommentContent)

      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                entries: p.entries.map((e) =>
                  e.id === activeEntry.id
                    ? {
                        ...e,
                        comments: [...e.comments, newComment],
                        commentCount: (e.commentCount ?? e.comments.length) + 1,
                      }
                    : e,
                ),
              }
            : p,
        ),
      )

      setNewCommentContent('')
      showToast('Feedback thread committed.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  // Member operations
  const handleAddMember = async (data: { email: string; role: Role }) => {
    if (!activeProject) return
    if (!permissions.canManageMembers()) {
      showToast('Administrative authorization denied.', 'error')
      return
    }

    const memberExists = activeProject.members.some((m) => m.email === data.email)
    if (memberExists) {
      showToast('Operator record already linked to this node.', 'error')
      return
    }

    setIsSavingMember(true)
    try {
      const newMember = await addMember(activeProject.id, data)

      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                members: [...p.members, newMember],
                memberCount: p.memberCount + 1,
              }
            : p,
        ),
      )

      setIsAddMemberModalOpen(false)
      showToast(`Authorized: ${newMember.name} linked as ${data.role}.`)
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    } finally {
      setIsSavingMember(false)
    }
  }

  const handleChangeRole = async (memberEmail: string, newRole: Role) => {
    if (!activeProject) return
    if (!permissions.canManageMembers()) {
      showToast('Administrative authorization denied.', 'error')
      return
    }

    const member = activeProject.members.find((m) => m.email === memberEmail)
    if (!member) return

    try {
      const updatedMember = await updateMemberRole(activeProject.id, member.id, newRole)
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                members: p.members.map((m) => (m.id === updatedMember.id ? updatedMember : m)),
              }
            : p,
        ),
      )
      showToast('Operator permissions map modified.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  const handleRemoveMember = async (memberEmail: string) => {
    if (!activeProject) return
    if (!permissions.canManageMembers()) {
      showToast('Administrative authorization denied.', 'error')
      return
    }

    const member = activeProject.members.find((m) => m.email === memberEmail)
    if (!member) return

    try {
      await removeMember(activeProject.id, member.id)
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProject.id
            ? {
                ...p,
                members: p.members.filter((m) => m.id !== member.id),
                memberCount: Math.max(1, p.memberCount - 1),
              }
            : p,
        ),
      )
      showToast('Linked domain operator revoked successfully.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-30">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded flex items-center justify-center text-white font-bold text-sm">
              LH
            </div>
            <div>
              <h1 className="font-bold text-sm text-zinc-900">Project Module</h1>
              <p className="text-xs text-zinc-500">Manage projects, entries, and team collaboration</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-zinc-100 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setView(view === 'dashboard' ? 'projects' : 'dashboard')}
                className="p-2 hover:bg-zinc-100 rounded transition-all"
                title={view === 'dashboard' ? 'All Projects' : 'Dashboard'}
              >
                <Layout size={18} />
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="p-2 hover:bg-zinc-100 rounded transition-all"
                  title="Sign Out"
                >
                  <Settings size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4 border-b border-zinc-100 -mx-6 px-6">
          {(['dashboard', 'projects', 'detail'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                view === v
                  ? 'text-zinc-900 border-zinc-900'
                  : 'text-zinc-500 border-transparent hover:text-zinc-700'
              }`}
            >
              {v === 'dashboard' && '📊 Dashboard'}
              {v === 'projects' && '📂 All Projects'}
              {v === 'detail' && '🔍 Project Details'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                  <p className="text-xs font-mono text-zinc-400 font-bold uppercase">Total Projects</p>
                  <p className="text-2xl font-bold mt-2">{projects.length}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                  <p className="text-xs font-mono text-zinc-400 font-bold uppercase">Total Entries</p>
                  <p className="text-2xl font-bold mt-2">{projects.reduce((acc, p) => acc + p.entries.length, 0)}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                  <p className="text-xs font-mono text-zinc-400 font-bold uppercase">Total Members</p>
                  <p className="text-2xl font-bold mt-2">{projects.reduce((acc, p) => acc + p.memberCount, 0)}</p>
                </div>
                <div className="bg-white border border-zinc-200 rounded-lg p-4">
                  <p className="text-xs font-mono text-zinc-400 font-bold uppercase">Your Role</p>
                  <p className="text-lg font-bold mt-2 capitalize">{activeRole.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Recent Active Nodes</h2>
                    <button
                      onClick={() => setIsCreateProjectModalOpen(true)}
                      className="flex items-center gap-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded transition-all"
                    >
                      <Plus size={14} /> Create Project
                    </button>
                  </div>
                  <ProjectList
                    projects={projects.slice(0, 3)}
                    selectedProjectId={selectedProjectId}
                    isLoading={isLoadingProjects}
                    onSelectProject={(id) => {
                      setSelectedProjectId(id)
                      setSelectedEntryId('')
                      setView('detail')
                    }}
                    onCreateProject={() => setIsCreateProjectModalOpen(true)}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold mb-3">Compliance Status</h3>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🔒</span>
                      <div>
                        <p className="font-bold text-zinc-900">Data Security</p>
                        <p className="text-zinc-500 text-[10px] mt-1">All entries are locally managed with secure access controls.</p>
                      </div>
                    </div>
                    <div className="border-t border-zinc-100 pt-3">
                      <p className="font-mono text-[10px] text-zinc-500 uppercase font-bold">System Info</p>
                      <p className="text-[10.5px] text-zinc-600 mt-2 leading-relaxed">• User: {currentUser.fullName}</p>
                      <p className="text-[10.5px] text-zinc-600">• Email: {currentUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects List View */}
          {view === 'projects' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Active Sync Nodes Directory</h2>
                  <p className="text-xs text-zinc-500 mt-1">Unified ledger monitoring of local enterprise pipelines.</p>
                </div>
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="flex items-center gap-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded transition-all"
                >
                  <Plus size={14} /> Create Node Map
                </button>
              </div>

              <ProjectList
                projects={filteredProjects}
                selectedProjectId={selectedProjectId}
                isLoading={isLoadingProjects}
                onSelectProject={(id) => {
                  setSelectedProjectId(id)
                  setSelectedEntryId('')
                  setView('detail')
                }}
                onCreateProject={() => setIsCreateProjectModalOpen(true)}
              />
            </div>
          )}

          {/* Project Detail View */}
          {view === 'detail' && activeProject && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    📂 {activeProject.name}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1 max-w-2xl">{activeProject.description}</p>
                </div>

                {permissions.canCreateEntry() && (
                  <button
                    onClick={() => setIsCreateEntryModalOpen(true)}
                    className="flex items-center gap-1 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded transition-all"
                  >
                    <Plus size={14} /> Write Log Entry
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Entries */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-sm uppercase tracking-wider">Sync Logs & Milestones</h3>
                  <EntriesPanel
                    entries={activeProject.entries}
                    selectedEntryId={selectedEntryId}
                    onSelectEntry={setSelectedEntryId}
                    onDeleteEntry={handleDeleteEntry}
                    onCreateEntry={() => setIsCreateEntryModalOpen(true)}
                    canDelete={permissions.canDeleteEntry()}
                    isLoading={isLoadingEntries}
                  />
                </div>

                {/* Sidebar: Project Info & Members */}
                <div className="space-y-6">
                  <ProjectDetailCard
                    project={activeProject}
                    onDelete={handleDeleteProject}
                    deletePending={false}
                  />

                  <MembersPanel
                    members={activeProject.members}
                    onAddMember={() => setIsAddMemberModalOpen(true)}
                    onChangeRole={handleChangeRole}
                    onRemoveMember={handleRemoveMember}
                    canManageMembers={permissions.canManageMembers()}
                    currentUserEmail={currentUser.email}
                  />

                  {activeEntry && (
                    <CommentsCard
                      entry={activeEntry}
                      comments={activeEntry.comments}
                      onAddComment={handleAddComment}
                      canComment={permissions.canAddComment()}
                      newCommentContent={newCommentContent}
                      onCommentContentChange={setNewCommentContent}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal
        isOpen={isCreateProjectModalOpen}
        onClose={() => setIsCreateProjectModalOpen(false)}
        onSubmit={handleCreateProject}
        isPending={isSavingProject}
      />

      <CreateEntryModal
        isOpen={isCreateEntryModalOpen}
        onClose={() => setIsCreateEntryModalOpen(false)}
        onSubmit={handleCreateEntry}
        isPending={isSavingEntry}
        currentUserName={currentUser.fullName}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
        isPending={isSavingMember}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}