import { useCallback, useEffect, useMemo, useState } from 'react'
import { Project, Role, Toast, User } from '../../../types/project'
import { usePermissions } from '../coreFiles/hooks'
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
import { ProjectList } from './ProjectList'
import { ProjectDetailCard } from './ProjectDetailCard'
import { EntriesPanel } from './EntriesPanel'
import { CommentsCard } from './CommentsCard'
import { MembersPanel } from './MembersPanel'
import { CreateProjectModal } from './CreateProjectModal'
import { CreateEntryModal } from './CreateEntryModal'
import { AddMemberModal } from './AddMemberModal'
import { ToastContainer } from './Toast'
import { Plus, Search, Layout, Settings } from 'lucide-react'

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
  const [toasts, setToasts] = useState<Toast[]>([])
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
