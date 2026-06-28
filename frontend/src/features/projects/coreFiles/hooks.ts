import { useCallback } from 'react'
import { Role, PERMISSION_MAP } from '../../../types/project'

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