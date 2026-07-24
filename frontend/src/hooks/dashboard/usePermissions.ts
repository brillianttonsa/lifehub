import { useCallback } from 'react'
import { Role, PERMISSION_MAP } from '../../types/project'

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
