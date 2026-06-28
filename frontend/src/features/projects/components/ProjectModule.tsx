import { useState, useMemo } from 'react'
import { Project, Entry, User, Toast, INITIAL_PROJECTS } from '../../../types/project'
import { usePermissions } from '../coreFiles/hooks'
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
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [selectedProjectId, setSelectedProjectId] = useState(INITIAL_PROJECTS[0].id)
  const [selectedEntryId, setSelectedEntryId] = useState(INITIAL_PROJECTS[0].entries[0]?.id || '')
  const [searchQuery, setSearchQuery] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])

  // Modal states
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isCreateEntryModalOpen, setIsCreateEntryModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')

  const permissions = usePermissions(currentUser.role)

  // Computed values
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || projects[0]
  }, [projects, selectedProjectId])

  const activeEntry = useMemo(() => {
    return activeProject?.entries.find((e) => e.id === selectedEntryId) || activeProject?.entries[0]
  }, [activeProject, selectedEntryId])

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [projects, searchQuery])

  // Toast management
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Project operations
  const handleCreateProject = (data: { name: string; description: string }) => {
    const newId = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const newProject: Project = {
      id: newId,
      name: data.name,
      description: data.description,
      ownerId: currentUser.id,
      owner: currentUser.name,
      status: 'Active',
      memberCount: 1,
      createdAt: new Date().toISOString(),
      createdDate: new Date().toLocaleDateString(),
      lastActivity: 'Just created',
      lastActivityDate: new Date().toISOString(),
      members: [
        {
          id: currentUser.id,
          email: currentUser.email,
          name: currentUser.name,
          role: 'owner',
        },
      ],
      entries: [],
    }
    setProjects((prev) => [...prev, newProject])
    setSelectedProjectId(newId)
    setIsCreateProjectModalOpen(false)
    setView('detail')
    showToast(`Workspace '${data.name}' created successfully.`)
  }

  const handleDeleteProject = () => {
    if (!permissions.canDeleteProject()) {
      showToast('Administrative clearance validation failed.', 'error')
      return
    }
    setProjects((prev) => prev.filter((p) => p.id !== selectedProjectId))
    setSelectedProjectId(projects[0]?.id || '')
    showToast('Project deleted successfully.')
  }

  // Entry operations
  const handleCreateEntry = (data: { content: string; commentsEnabled: boolean }) => {
    if (!permissions.canCreateEntry()) {
      showToast('Permission denied to create entries.', 'error')
      return
    }

    const newEntry: Entry = {
      id: `entry-${Date.now()}`,
      projectId: activeProject.id,
      author: currentUser.name,
      authorId: currentUser.id,
      role: currentUser.role,
      date: new Date().toLocaleString(),
      content: data.content,
      comments: [],
      commentsEnabled: data.commentsEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            entries: [newEntry, ...p.entries],
            lastActivity: 'Just updated',
            lastActivityDate: new Date().toISOString(),
          }
        }
        return p
      }),
    )

    setSelectedEntryId(newEntry.id)
    setIsCreateEntryModalOpen(false)
    showToast('Log entry created successfully.')
  }

  const handleDeleteEntry = (entryId: string) => {
    if (!permissions.canDeleteEntry()) {
      showToast('Administrative clearance validation failed.', 'error')
      return
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            entries: p.entries.filter((e) => e.id !== entryId),
          }
        }
        return p
      }),
    )
    showToast('Sync log dropped securely.')
  }

  // Comment operations
  const handleAddComment = () => {
    if (!activeEntry || !permissions.canAddComment()) {
      showToast('Permission denied to add comments.', 'error')
      return
    }

    if (!newCommentContent.trim()) return

    const newComment = {
      id: `c-${Date.now()}`,
      entryId: activeEntry.id,
      author: currentUser.name,
      authorId: currentUser.id,
      role: currentUser.role,
      text: newCommentContent,
      timestamp: new Date().toLocaleString(),
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            entries: p.entries.map((e) => {
              if (e.id === activeEntry.id) {
                return {
                  ...e,
                  comments: [...e.comments, newComment],
                }
              }
              return e
            }),
          }
        }
        return p
      }),
    )

    setNewCommentContent('')
    showToast('Feedback thread committed.')
  }

  // Member operations
  const handleAddMember = (data: { email: string; role: any }) => {
    if (!permissions.canManageMembers()) {
      showToast('Administrative authorization denied.', 'error')
      return
    }

    const memberExists = activeProject.members.some((m) => m.email === data.email)
    if (memberExists) {
      showToast('Operator record already linked to this node.', 'error')
      return
    }

    const newMember = {
      id: `user-${Date.now()}`,
      email: data.email,
      name: data.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      role: data.role,
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            members: [...p.members, newMember],
            memberCount: p.memberCount + 1,
          }
        }
        return p
      }),
    )

    setIsAddMemberModalOpen(false)
    showToast(`Authorized: ${newMember.name} linked as ${data.role}.`)
  }

  const handleChangeRole = (memberEmail: string, newRole: any) => {
    if (!permissions.canManageMembers()) {
      showToast('Administrative authorization denied.', 'error')
      return
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            members: p.members.map((m) => (m.email === memberEmail ? { ...m, role: newRole } : m)),
          }
        }
        return p
      }),
    )
    showToast('Operator permissions map modified.')
  }

  const handleRemoveMember = (memberEmail: string) => {
    if (!permissions.canManageMembers()) {
      showToast('Administrative authorization denied.', 'error')
      return
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProject.id) {
          return {
            ...p,
            members: p.members.filter((m) => m.email !== memberEmail),
            memberCount: Math.max(1, p.memberCount - 1),
          }
        }
        return p
      }),
    )
    showToast('Linked domain operator revoked successfully.')
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
          {['dashboard', 'projects', 'detail'].map((v: any) => (
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
                  <p className="text-lg font-bold mt-2 capitalize">{currentUser.role.replace('_', ' ')}</p>
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
                    onSelectProject={(id) => {
                      setSelectedProjectId(id)
                      setView('detail')
                    }}
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
                      <p className="text-[10.5px] text-zinc-600 mt-2 leading-relaxed">• User: {currentUser.name}</p>
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
                onSelectProject={(id) => {
                  setSelectedProjectId(id)
                  setView('detail')
                }}
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
      />

      <CreateEntryModal
        isOpen={isCreateEntryModalOpen}
        onClose={() => setIsCreateEntryModalOpen(false)}
        onSubmit={handleCreateEntry}
        currentUserName={currentUser.name}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}