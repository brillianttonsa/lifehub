import { Role } from '../../types/project'

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
