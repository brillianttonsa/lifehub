import { ArrowLeft, Plus, Search } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 px-4 py-6 sm:px-6 lg:px-8 dark:text-slate-100 transition-colors">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <header className="rounded-2xl bg-white dark:bg-slate-900 border border-transparent dark:border-slate-800 shadow-sm m-4 p-4 transition-colors">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
                Project
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                Team projects
              </h1>
            </div>

            <div className="relative sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 transition-colors"
              />
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
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">All projects</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Every project you have access to, in one place.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateProjectModalOpen(true)}
                    className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
                      className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                      title="Back to all projects"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                        {activeProject.name}
                      </h2>
                      <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                        {activeProject.description}
                      </p>
                    </div>
                  </div>

                  {permissions.canCreateEntry() && (
                    <button
                      onClick={() => setIsCreateEntryModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500"
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
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    Entries
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
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
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