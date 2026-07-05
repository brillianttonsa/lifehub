import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { ArrowLeft, Plus, Search, Settings } from 'lucide-react'
import { Project, Toast as ToastMessage, User } from '../types/project'
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

import { usePermissions } from '../hooks/usePermissions'
import { ToastContainer } from '../components/projects/Toast'
import { ProjectList } from '../components/projects/ProjectList'
import { ProjectDetailCard } from '../components/projects/ProjectDetailCard'
import { EntriesPanel } from '../components/projects/EntriesPanel'
import { CommentsCard } from '../components/projects/CommentsCard'
import { MembersPanel } from '../components/projects/MembersPanel'
import { CreateProjectModal } from '../components/projects/modals/CreateProjectModal'
import { CreateEntryModal } from '../components/projects/modals/CreateEntryModal'
import { AddMemberModal } from '../components/projects/modals/AddMemberModal'

// Single-page flow: no tabs. 'list' is the landing page (all projects as
// cards); clicking "View project" on a card opens 'detail' for that project.
type ViewType = 'list' | 'detail'

interface ProjectModuleProps {
  currentUser: User
  onSignOut?: () => void
}

export default function ProjectModule({ currentUser, onSignOut }: ProjectModuleProps) {
  const [view, setView] = useState<ViewType>('list')
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

  // Tracks which project ids we've already fetched entries for. We can't use
  // `entries.length > 0` as that guard, because a project can legitimately
  // have zero entries — and setProjects always creates a fresh project
  // object, which would otherwise make the effect below think there's new
  // work to do and refetch forever.
  const fetchedEntriesForProjectId = useRef(new Set<string>())

  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0]
  }, [projects, selectedProjectId])

  const activeEntry = useMemo(() => {
    return activeProject?.entries.find((e) => e.id === selectedEntryId) || activeProject?.entries[0]
  }, [activeProject, selectedEntryId])

  const activeRole = useMemo(() => {
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
    if (fetchedEntriesForProjectId.current.has(activeProject.id)) return

    let cancelled = false

    async function loadProjectEntries() {
      setIsLoadingEntries(true)
      try {
        const entries = await listEntries(activeProject)
        if (cancelled) return

        fetchedEntriesForProjectId.current.add(activeProject.id)
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
      setView('list')
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
  const handleAddMember = async (data: { email: string; role: import('../types/project').Role }) => {
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

  const handleChangeRole = async (memberEmail: string, newRole: import('../types/project').Role) => {
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

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedEntryId('')
    setView('detail')
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
            {view === 'list' && (
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
            )}

            {onSignOut && (
              <button
                onClick={onSignOut}
                className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900"
                title="Sign Out"
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          {/* All-projects landing page */}
          {view === 'list' && (
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
                onViewProject={handleViewProject}
                onCreateProject={() => setIsCreateProjectModalOpen(true)}
              />
            </div>
          )}

          {/* Single project page */}
          {view === 'detail' && activeProject && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => setView('list')}
                    className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                    title="Back to all projects"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{activeProject.name}</h2>
                    <p className="mt-1 max-w-2xl text-sm text-slate-500">{activeProject.description}</p>
                  </div>
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

              {/* Project info + members, side by side up top */}
              <div className="grid gap-6 lg:grid-cols-2">
                <ProjectDetailCard project={activeProject} onDelete={handleDeleteProject} deletePending={false} />

                <MembersPanel
                  members={activeProject.members}
                  onAddMember={() => setIsAddMemberModalOpen(true)}
                  onChangeRole={handleChangeRole}
                  onRemoveMember={handleRemoveMember}
                  canManageMembers={permissions.canManageMembers()}
                  currentUserEmail={currentUser.email}
                />
              </div>

              {/* Entries, full width */}
              <div className="space-y-4">
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

              {/* Comments for the selected entry, following down below entries */}
              {activeEntry && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Comments</h3>
                  <CommentsCard
                    entry={activeEntry}
                    comments={activeEntry.comments}
                    onAddComment={handleAddComment}
                    canComment={permissions.canAddComment()}
                    newCommentContent={newCommentContent}
                    onCommentContentChange={setNewCommentContent}
                  />
                </div>
              )}
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
