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
import { motion, AnimatePresence } from 'framer-motion'
import {
  Project,
  Role,
  Entry,
  Comment,
  ProjectMember,
  User,
  Toast as ToastMessage,
  PERMISSION_MAP,
} from '../types/project'
import { getApiErrorMessage } from '../lib/apiClient'
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
    viewer: 'bg-slate-100 text-slate-700 border-slate-200',
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
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Maintenance: 'bg-amber-100 text-amber-800 border-amber-200',
    Archived: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  }
  return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200'
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
      ? 'bg-rose-50 border-rose-200 text-rose-900'
      : type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : 'bg-indigo-50 border-indigo-200 text-indigo-900'

  const Icon = type === 'error' ? AlertCircle : CheckCircle2

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${bgStyle}`}
    >
      <Icon size={18} />
      <span>{message}</span>
      <button onClick={() => onClose(id)} className="ml-2 text-lg font-bold opacity-50 hover:opacity-100">
        ×
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastMessage[]; onClose: (id: number) => void }) {
  return (
    <AnimatePresence>
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={onClose} />
      ))}
    </AnimatePresence>
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
        <motion.button
          key={project.id}
          whileHover={{ y: -2 }}
          onClick={() => onSelectProject(project.id)}
          className={`rounded-3xl border bg-white p-5 text-left shadow-sm transition ${
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
            <span>{project.memberCount} members</span>
            <span className="flex items-center gap-1">
              <Calendar size={12} /> {project.lastActivity}
            </span>
          </div>
        </motion.button>
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
        <button
          onClick={onDelete}
          disabled={deletePending}
          className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <Trash2 size={14} />
          {deletePending ? 'Deleting…' : 'Delete project'}
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
          <div key={i} className="animate-pulse space-y-3 rounded-3xl border border-slate-200 bg-white p-5">
            <div className="h-4 w-2/3 rounded-full bg-slate-200"></div>
            <div className="h-3 w-full rounded-full bg-slate-100"></div>
            <div className="h-2 w-1/2 rounded-full bg-slate-100"></div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <BookOpen className="mx-auto h-8 w-8 text-slate-400" />
        <p className="mt-2 text-sm text-slate-500">No entries yet for this project.</p>
        {onCreateEntry && (
          <button
            onClick={onCreateEntry}
            className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus size={14} /> Write the first entry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <motion.div
          key={entry.id}
          whileHover={{ y: -2 }}
          onClick={() => onSelectEntry(entry.id)}
          className={`cursor-pointer space-y-3 rounded-3xl border p-5 shadow-sm transition ${
            selectedEntryId === entry.id
              ? 'border-indigo-300 bg-indigo-50/40'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          {/* Entry Metadata */}
          <div className="flex items-start justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                {entry.author.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-semibold text-slate-900">{entry.author}</span>
                <span
                  className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getRoleColor(entry.role)}`}
                >
                  {entry.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-400">{entry.date}</span>
          </div>

          {/* Entry Content */}
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">{entry.content}</p>

          {/* Actions Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <button className="flex items-center gap-1 transition hover:text-slate-900">
              <MessageSquare size={14} />
              <span>{entry.comments.length} comments</span>
            </button>

            {canDelete && onDeleteEntry && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteEntry(entry.id)
                }}
                className="flex items-center gap-1 font-semibold text-rose-600 transition hover:text-rose-700"
              >
                <Trash2 size={14} /> Remove
              </button>
            )}
          </div>
        </motion.div>
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
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 text-slate-500">
          <MessageSquareText size={18} />
          <p className="text-sm">Select an entry to view comments</p>
        </div>
      </article>
    )
  }

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <MessageSquareText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Comments</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {entry.commentsEnabled ? `Entry ${entry.id}` : 'Comments disabled for this entry'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-h-64 space-y-3 overflow-y-auto">
        {comments.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400">No comments on this entry yet.</p>
        )}

        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-1 rounded-2xl bg-slate-50 p-3">
                <div className="h-3 w-2/3 rounded-full bg-slate-200"></div>
                <div className="h-2 w-full rounded-full bg-slate-100"></div>
              </div>
            ))}
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="rounded-2xl bg-slate-50 p-3 text-sm last:border-0">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>
                <strong className="text-slate-700">{comment.author}</strong> ({comment.role.replace('_', ' ')})
              </span>
              <span>{comment.timestamp}</span>
            </div>
            <p className="leading-normal text-slate-600">{comment.text}</p>
            {onDeleteComment && (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="mt-1 text-xs font-semibold text-rose-500 hover:text-rose-700"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      {entry.commentsEnabled ? (
        <form onSubmit={handleSubmit} className="space-y-2 border-t border-slate-100 pt-3">
          <textarea
            value={newCommentContent}
            onChange={(e) => onCommentContentChange?.(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
          />
          <button
            type="submit"
            disabled={!canComment || !newCommentContent.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <Send size={14} />
            Post comment
          </button>
        </form>
      ) : (
        <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-400">
          Comments are restricted for your role on this entry
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
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Users size={18} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Members</h4>
            <p className="mt-0.5 text-xs text-slate-500">{members.length} total members</p>
          </div>
        </div>
        {canManageMembers && onAddMember && (
          <button onClick={onAddMember} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            + Add
          </button>
        )}
      </div>

      <div className="space-y-3">
        {members.length === 0 && <p className="py-4 text-center text-xs text-slate-400">No members yet</p>}

        {members.map((member) => (
          <div
            key={member.email}
            className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"
          >
            <div className="flex flex-1 items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
                {member.name?.substring(0, 1).toUpperCase() || member.email.substring(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-slate-900">{member.name}</strong>
                <span className="truncate text-xs text-slate-400">{member.email}</span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {canManageMembers && member.email !== currentUserEmail ? (
                <div className="flex items-center gap-1">
                  <select
                    value={member.role}
                    onChange={(e) => onChangeRole?.(member.email, e.target.value as Role)}
                    className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase text-slate-700 outline-none"
                  >
                    <option value="owner">Owner</option>
                    <option value="contributor">Contributor</option>
                    <option value="viewer_comment">Commenter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {onRemoveMember && (
                    <button
                      onClick={() => onRemoveMember(member.email)}
                      className="px-1 font-bold text-rose-500 hover:text-rose-700"
                      title="Remove member"
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getRoleColor(member.role)}`}
                >
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-md space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">New project</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Create a project</h3>
              </div>
              <button onClick={onClose} className="text-lg font-bold text-slate-400 hover:text-slate-900">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Project name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DHIS2 Integration System"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Description</label>
                <textarea
                  required
                  placeholder="Provide scope, data access structures, or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-lg space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">New entry</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Write a log entry</h3>
              </div>
              <button onClick={onClose} className="text-lg font-bold text-slate-400 hover:text-slate-900">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Author</label>
                <input
                  type="text"
                  disabled
                  value={currentUserName}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Entry content</label>
                <textarea
                  required
                  placeholder="Document updates, milestones, or notes..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none focus:border-indigo-300"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-sm font-medium text-slate-600">Allow comments on this entry</span>
                <input
                  type="checkbox"
                  checked={formData.commentsEnabled}
                  onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Writing…' : 'Write entry'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-sm space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600">New member</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Add a member</h3>
              </div>
              <button onClick={onClose} className="text-lg font-bold text-slate-400 hover:text-slate-900">
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.tz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                >
                  <option value="contributor">Contributor</option>
                  <option value="viewer_comment">Commenter</option>
                  <option value="viewer">Viewer (read only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Adding…' : 'Add member'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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

export default function ProjectModule({ currentUser, onSignOut }: ProjectModuleProps) {
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
      showToast('Entry removed.')
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
      showToast('Comment posted.')
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
      showToast('That person is already a member of this project.', 'error')
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
      showToast(`Added ${newMember.name} as ${data.role}.`)
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
      showToast('Member role updated.')
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
      showToast('Member removed.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-semibold text-white">
              LH
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600">Project</p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900">Team projects</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-300"
              />
            </div>

            <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setView(view === 'dashboard' ? 'projects' : 'dashboard')}
                className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                title={view === 'dashboard' ? 'All Projects' : 'Dashboard'}
              >
                <Layout size={18} />
              </button>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  title="Sign Out"
                >
                  <Settings size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mx-auto mt-4 flex max-w-[1440px] gap-2 border-b border-slate-100">
          {(['dashboard', 'projects', 'detail'] as ViewType[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`border-b-2 px-3 py-2 text-sm font-semibold capitalize transition ${
                view === v ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'dashboard' && 'Dashboard'}
              {v === 'projects' && 'All projects'}
              {v === 'detail' && 'Project details'}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          {/* Dashboard View */}
          {view === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DashboardStat label="Total projects" value={projects.length} />
                <DashboardStat
                  label="Total entries"
                  value={projects.reduce((acc, p) => acc + p.entries.length, 0)}
                />
                <DashboardStat
                  label="Total members"
                  value={projects.reduce((acc, p) => acc + p.memberCount, 0)}
                />
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Your role</p>
                  <p className="mt-3 text-2xl font-semibold capitalize text-slate-900">
                    {activeRole.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Recent projects</h2>
                    <button
                      onClick={() => setIsCreateProjectModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                      <Plus size={14} /> Create project
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
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Workspace info</h3>
                  <div className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Access control</p>
                        <p className="mt-1 text-xs text-slate-500">Entries are managed with role-based access controls.</p>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 pt-3 text-xs">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
                      <p className="mt-2 leading-relaxed text-slate-600">{currentUser.fullName}</p>
                      <p className="text-slate-600">{currentUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects List View */}
          {view === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">All projects</h2>
                  <p className="mt-1 text-sm text-slate-500">Every project you have access to, in one place.</p>
                </div>
                <button
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  <Plus size={14} /> Create project
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
                  <h2 className="text-xl font-semibold text-slate-900">{activeProject.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-slate-500">{activeProject.description}</p>
                </div>

                {permissions.canCreateEntry() && (
                  <button
                    onClick={() => setIsCreateEntryModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                  >
                    <Plus size={14} /> Write entry
                  </button>
                )}
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content: Entries */}
                <div className="space-y-4 lg:col-span-2">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Entries</h3>
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

function DashboardStat({ label, value }: { label: string; value: number }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
    </motion.div>
  )
}