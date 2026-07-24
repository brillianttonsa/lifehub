import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
} from '../../api/projectApi'
import { useToast } from '../../context/toastcontext/ToastContext'
import { getApiErrorMessage } from '../../lib/apiClient'
import type { Project, Role, User } from '../../types/project'
import { usePermissions } from './usePermissions'

type ViewType = 'list' | 'detail'

interface UseProjectModuleOptions {
  currentUser: User
}

export function useProjectModule({ currentUser }: UseProjectModuleOptions) {
  const { showToast } = useToast()

  const [view, setView] = useState<ViewType>('list')
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [selectedEntryId, setSelectedEntryId] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [isLoadingEntries, setIsLoadingEntries] = useState(false)
  const [isSavingProject, setIsSavingProject] = useState(false)
  const [isSavingEntry, setIsSavingEntry] = useState(false)
  const [isSavingMember, setIsSavingMember] = useState(false)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)
  const [isCreateEntryModalOpen, setIsCreateEntryModalOpen] = useState(false)
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false)
  const [newCommentContent, setNewCommentContent] = useState('')

  const fetchedEntriesForProjectId = useRef(new Set<string>())

  const activeProject = useMemo(() => {
    return projects.find((project) => project.id === selectedProjectId) || projects[0]
  }, [projects, selectedProjectId])

  const activeEntry = useMemo(() => {
    return activeProject?.entries.find((entry) => entry.id === selectedEntryId) || activeProject?.entries[0]
  }, [activeProject, selectedEntryId])

  const activeRole = useMemo(() => {
    return activeProject?.members.find((member) => member.id === currentUser.id)?.role ?? 'viewer'
  }, [activeProject, currentUser.id])

  const permissions = usePermissions(activeRole)

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [projects, searchQuery])

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
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

    loadProjects()

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

  const handleCreateProject = useCallback(
    async (data: { name: string; description: string }) => {
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
    },
    [showToast],
  )

  const handleDeleteProject = useCallback(async () => {
    if (!activeProject) return
    if (!permissions.canDeleteProject()) {
      showToast('Administrative clearance validation failed.', 'error')
      return
    }

    try {
      await deleteProject(activeProject.id)
      setProjects((prev) => {
        const nextProjects = prev.filter((project) => project.id !== activeProject.id)
        setSelectedProjectId(nextProjects[0]?.id || '')
        setSelectedEntryId('')
        return nextProjects
      })
      setView('list')
      showToast('Project deleted successfully.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }, [activeProject, permissions, showToast])

  const handleCreateEntry = useCallback(
    async (data: { content: string; commentsEnabled: boolean }) => {
      if (!activeProject) return
      if (!permissions.canCreateEntry()) {
        showToast('Permission denied to create entries.', 'error')
        return
      }

      setIsSavingEntry(true)
      try {
        const newEntry = await createEntry(activeProject, data)

        setProjects((prev) =>
          prev.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  entries: [newEntry, ...project.entries],
                  lastActivity: 'Just updated',
                  lastActivityDate: newEntry.createdAt,
                }
              : project,
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
    },
    [activeProject, permissions, showToast],
  )

  const handleDeleteEntry = useCallback(
    async (entryId: string) => {
      if (!activeProject) return
      if (!permissions.canDeleteEntry()) {
        showToast('Administrative clearance validation failed.', 'error')
        return
      }

      try {
        await deleteEntry(activeProject.id, entryId)
        setProjects((prev) =>
          prev.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  entries: project.entries.filter((entry) => entry.id !== entryId),
                }
              : project,
          ),
        )
        setSelectedEntryId(activeProject.entries.find((entry) => entry.id !== entryId)?.id || '')
        showToast('Entry removed.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [activeProject, permissions, showToast],
  )

  const handleAddComment = useCallback(async () => {
    if (!activeProject || !activeEntry || !permissions.canAddComment()) {
      showToast('Permission denied to add comments.', 'error')
      return
    }

    if (!newCommentContent.trim()) return

    try {
      const newComment = await createComment(activeEntry, activeProject.members, newCommentContent)

      setProjects((prev) =>
        prev.map((project) =>
          project.id === activeProject.id
            ? {
                ...project,
                entries: project.entries.map((entry) =>
                  entry.id === activeEntry.id
                    ? {
                        ...entry,
                        comments: [...entry.comments, newComment],
                        commentCount: (entry.commentCount ?? entry.comments.length) + 1,
                      }
                    : entry,
                ),
              }
            : project,
        ),
      )

      setNewCommentContent('')
      showToast('Comment posted.')
    } catch (error) {
      showToast(getApiErrorMessage(error), 'error')
    }
  }, [activeEntry, activeProject, newCommentContent, permissions, showToast])

  const handleAddMember = useCallback(
    async (data: { email: string; role: Role }) => {
      if (!activeProject) return
      if (!permissions.canManageMembers()) {
        showToast('Administrative authorization denied.', 'error')
        return
      }

      const memberExists = activeProject.members.some((member) => member.email === data.email)
      if (memberExists) {
        showToast('That person is already a member of this project.', 'error')
        return
      }

      setIsSavingMember(true)
      try {
        const newMember = await addMember(activeProject.id, data)

        setProjects((prev) =>
          prev.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  members: [...project.members, newMember],
                  memberCount: project.memberCount + 1,
                }
              : project,
          ),
        )

        setIsAddMemberModalOpen(false)
        showToast(`Added ${newMember.name} as ${data.role}.`)
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      } finally {
        setIsSavingMember(false)
      }
    },
    [activeProject, permissions, showToast],
  )

  const handleChangeRole = useCallback(
    async (memberEmail: string, newRole: Role) => {
      if (!activeProject) return
      if (!permissions.canManageMembers()) {
        showToast('Administrative authorization denied.', 'error')
        return
      }

      const member = activeProject.members.find((item) => item.email === memberEmail)
      if (!member) return

      try {
        const updatedMember = await updateMemberRole(activeProject.id, member.id, newRole)
        setProjects((prev) =>
          prev.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  members: project.members.map((item) => (item.id === updatedMember.id ? updatedMember : item)),
                }
              : project,
          ),
        )
        showToast('Member role updated.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [activeProject, permissions, showToast],
  )

  const handleRemoveMember = useCallback(
    async (memberEmail: string) => {
      if (!activeProject) return
      if (!permissions.canManageMembers()) {
        showToast('Administrative authorization denied.', 'error')
        return
      }

      const member = activeProject.members.find((item) => item.email === memberEmail)
      if (!member) return

      try {
        await removeMember(activeProject.id, member.id)
        setProjects((prev) =>
          prev.map((project) =>
            project.id === activeProject.id
              ? {
                  ...project,
                  members: project.members.filter((item) => item.id !== member.id),
                  memberCount: Math.max(1, project.memberCount - 1),
                }
              : project,
          ),
        )
        showToast('Member removed.')
      } catch (error) {
        showToast(getApiErrorMessage(error), 'error')
      }
    },
    [activeProject, permissions, showToast],
  )

  const handleViewProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId)
    setSelectedEntryId('')
    setView('detail')
  }, [])

  return {
    view,
    setView,
    projects,
    selectedProjectId,
    setSelectedProjectId,
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
  }
}
