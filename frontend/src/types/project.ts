export type Role = 'owner' | 'contributor' | 'viewer_comment' | 'viewer'
export type ProjectStatus = 'Active' | 'Maintenance' | 'Archived'

export interface User {
  id: string
  email: string
  fullName: string
}

export interface ProjectMember {
  id: string
  email: string
  name: string
  role: Role
  joinedAt?: string
}

export interface Project {
  id: string
  name: string
  description: string
  ownerId: string
  owner?: string
  status: ProjectStatus
  memberCount: number
  createdAt: string
  createdDate?: string
  lastActivity?: string
  lastActivityDate?: string
  members: ProjectMember[]
  entries: Entry[]
}

export interface Entry {
  id: string
  projectId: string
  author: string
  authorId: string
  role: Role
  date: string
  entryDate?: string
  content: string
  comments: Comment[]
  commentsEnabled: boolean
  commentCount?: number
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  entryId: string
  author: string
  authorId: string
  role: Role
  text: string
  content?: string
  timestamp: string
  createdAt?: string
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export const PERMISSION_MAP: Record<Role, string[]> = {
  owner: ['delete_project', 'manage_members', 'create_entry', 'add_comment', 'delete_entry'],
  contributor: ['create_entry', 'add_comment'],
  viewer_comment: ['add_comment'],
  viewer: [],
}
