import { apiClient } from '../../../lib/apiClient'
import { Comment, Entry, Project, ProjectMember, Role } from '../../../types/project'

interface ProjectDto {
  id: string
  name: string
  description: string | null
  ownerId: string
  createdAt: string
  updatedAt: string
  memberCount: number
  lastEntryDate: string | null
  members: {
    id: string
    fullName: string
    email: string
    role: Role
  }[]
}

interface EntryDto {
  id: string
  projectId: string
  authorId: string
  authorName?: string
  content: string
  entryDate: string
  commentsEnabled: boolean
  commentCount?: number
  createdAt: string
  updatedAt: string
}

interface CommentDto {
  id: string
  entryId: string
  authorId: string
  authorName?: string
  content: string
  createdAt: string
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

function getMemberRole(members: ProjectMember[], userId: string): Role {
  return members.find((member) => member.id === userId)?.role ?? 'viewer'
}

export function mapProject(dto: ProjectDto): Project {
  const members = dto.members.map((member) => ({
    id: member.id,
    email: member.email,
    name: member.fullName || member.email,
    role: member.role,
  }))

  const owner = members.find((member) => member.id === dto.ownerId)

  return {
    id: dto.id,
    name: dto.name,
    description: dto.description ?? '',
    ownerId: dto.ownerId,
    owner: owner?.name,
    status: 'Active',
    memberCount: dto.memberCount,
    createdAt: dto.createdAt,
    createdDate: formatDateTime(dto.createdAt),
    lastActivity: dto.lastEntryDate ? formatDateTime(dto.lastEntryDate) : 'No activity yet',
    lastActivityDate: dto.lastEntryDate ?? dto.updatedAt,
    members,
    entries: [],
  }
}

export function mapEntry(dto: EntryDto, members: ProjectMember[]): Entry {
  const author = members.find((member) => member.id === dto.authorId)

  return {
    id: dto.id,
    projectId: dto.projectId,
    author: dto.authorName || author?.name || 'Unknown user',
    authorId: dto.authorId,
    role: getMemberRole(members, dto.authorId),
    date: formatDateTime(dto.createdAt),
    entryDate: dto.entryDate,
    content: dto.content,
    comments: [],
    commentsEnabled: dto.commentsEnabled,
    commentCount: dto.commentCount ?? 0,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function mapComment(dto: CommentDto, members: ProjectMember[]): Comment {
  const author = members.find((member) => member.id === dto.authorId)

  return {
    id: dto.id,
    entryId: dto.entryId,
    author: dto.authorName || author?.name || 'Unknown user',
    authorId: dto.authorId,
    role: getMemberRole(members, dto.authorId),
    text: dto.content,
    content: dto.content,
    timestamp: formatDateTime(dto.createdAt),
    createdAt: dto.createdAt,
  }
}

export async function listProjects(): Promise<Project[]> {
  const response = await apiClient.get<ProjectDto[]>('/projects')
  return response.data.map(mapProject)
}

export async function createProject(data: { name: string; description: string }): Promise<Project> {
  const response = await apiClient.post<ProjectDto>('/projects', data)
  return mapProject(response.data)
}

export async function deleteProject(projectId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}`)
}

export async function listEntries(project: Project): Promise<Entry[]> {
  const response = await apiClient.get<{ entries: EntryDto[] }>(`/projects/${project.id}/entries`)
  return response.data.entries.map((entry) => mapEntry(entry, project.members))
}

export async function createEntry(
  project: Project,
  data: { content: string; commentsEnabled: boolean },
): Promise<Entry> {
  const response = await apiClient.post<EntryDto>(`/projects/${project.id}/entries`, {
    content: data.content,
    entryDate: new Date().toISOString().slice(0, 10),
    commentsEnabled: data.commentsEnabled,
  })

  return mapEntry(response.data, project.members)
}

export async function deleteEntry(projectId: string, entryId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/entries/${entryId}`)
}

export async function listComments(entry: Entry, members: ProjectMember[]): Promise<Comment[]> {
  const response = await apiClient.get<CommentDto[]>(`/project/entries/${entry.id}/comments`)
  return response.data.map((comment) => mapComment(comment, members))
}

export async function createComment(
  entry: Entry,
  members: ProjectMember[],
  content: string,
): Promise<Comment> {
  const response = await apiClient.post<CommentDto>(`/project/entries/${entry.id}/comments`, {
    content,
  })

  return mapComment(response.data, members)
}

export async function addMember(
  projectId: string,
  data: { email: string; role: Role },
): Promise<ProjectMember> {
  const response = await apiClient.post<{
    id: string
    fullName: string
    email: string
    role: Role
  }>(`/projects/${projectId}/members`, data)

  return {
    id: response.data.id,
    email: response.data.email,
    name: response.data.fullName,
    role: response.data.role,
  }
}

export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: Role,
): Promise<ProjectMember> {
  const response = await apiClient.patch<{
    id: string
    fullName: string
    email: string
    role: Role
  }>(`/projects/${projectId}/members/${userId}`, { role })

  return {
    id: response.data.id,
    email: response.data.email,
    name: response.data.fullName,
    role: response.data.role,
  }
}

export async function removeMember(projectId: string, userId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`)
}
