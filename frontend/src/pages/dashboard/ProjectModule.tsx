import { ArrowLeft, Plus, Search, ShieldCheck } from 'lucide-react'
import { useProjectModule } from '../../hooks/dashboard/useProjectModule'
import { User } from '../../types/project'
import { ProjectList } from '../../components/dashboard/projects/ProjectList'
import { ProjectDetailCard } from '../../components/dashboard/projects/ProjectDetailCard'
import { EntriesPanel } from '../../components/dashboard/projects/EntriesPanel'
import { CommentsCard } from '../../components/dashboard/projects/CommentsCard'
import { MembersPanel } from '../../components/dashboard/projects/MembersPanel'
import { CreateProjectModal } from '../../components/dashboard/projects/modals/CreateProjectModal'
import { CreateEntryModal } from '../../components/dashboard/projects/modals/CreateEntryModal'
import { AddMemberModal } from '../../components/dashboard/projects/modals/AddMemberModal'

interface ProjectModuleProps {
  currentUser: User
}

export default function ProjectModule({ currentUser }: ProjectModuleProps) {
  const {
    view,
    setView,
    selectedProjectId,
    selectedEntryId,
    setSelectedEntryId,
    searchQuery,
    setSearchQuery,
    isLoadingProjects,
    isLoadingEntries,
    isSavingProject,
    isSavingEntry,
    isSavingMember,
    isCreateProjectModalOpen,
    setIsCreateProjectModalOpen,
    isCreateEntryModalOpen,
    setIsCreateEntryModalOpen,
    isAddMemberModalOpen,
    setIsAddMemberModalOpen,
    newCommentContent,
    setNewCommentContent,
    activeProject,
    activeEntry,
    filteredProjects,
    permissions,
    handleCreateProject,
    handleDeleteProject,
    handleCreateEntry,
    handleDeleteEntry,
    handleAddComment,
    handleAddMember,
    handleChangeRole,
    handleRemoveMember,
    handleViewProject,
  } = useProjectModule({ currentUser })

  return (
    <div className="min-h-screen bg-[#07111c] text-slate-100 transition-colors">
      <div className="mx-auto min-h-screen max-w-[1600px] border-x border-slate-800/70 bg-[#0a1623]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-[#07111c]/95 px-5 py-4 shadow-2xl shadow-black/10 backdrop-blur sm:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-300 text-xl font-bold text-slate-950 shadow-lg shadow-emerald-500/20">L</div>
              <div>
                <p className="text-sm font-bold tracking-wide text-white">LifeHub <span className="ml-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">Projects module</span></p>
                <p className="text-xs text-slate-500">Collaborative logbook and permission engine</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2 py-1.5 text-xs text-slate-400 sm:flex"><ShieldCheck size={14} className="text-emerald-400" /> Workspace access</div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-44 rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-4 text-xs text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-emerald-500 sm:w-60"
              />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="px-4 py-6 sm:px-7 lg:px-9">
          <div className="mx-auto max-w-[1440px]">
            {/* All-projects landing page */}
            {view === 'list' && (
              <div className="space-y-7">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.25em] text-emerald-400">My workspaces</p>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Projects that move life forward.</h2>
                    <p className="mt-2 text-sm text-slate-400">Every project you have access to, in one focused workspace.</p>
                  </div>
                  <button
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-400"
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
              <div className="space-y-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setView('list')}
                      className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-emerald-500/40 hover:bg-slate-800 hover:text-emerald-400"
                      title="Back to all projects"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white">
                        {activeProject.name}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-slate-400">
                        {activeProject.description}
                      </p>
                    </div>
                  </div>

                  {permissions.canCreateEntry() && (
                    <button
                      onClick={() => setIsCreateEntryModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-400"
                    >
                      <Plus size={14} /> Write entry
                    </button>
                  )}
                </div>

                {/* Project info + members, side by side up top */}
                <div className="grid gap-5 lg:grid-cols-[1fr_1.35fr]">
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
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                    Project updates
                  </h3>
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

                {/* Comments for the selected entry */}
                {activeEntry && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-300">
                      Comments
                    </h3>
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
      </div>
    </div>
  )
}