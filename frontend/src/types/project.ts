export type Role = 'owner' | 'contributor' | 'viewer_comment' | 'viewer'
export type ProjectStatus = 'Active' | 'Maintenance' | 'Archived'

export interface User {
  id: string
  email: string
  name: string
  role: Role
  isAuthenticated?: boolean
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

export interface ApiResponse<T> {
  data: T
  error?: string
  message?: string
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'dhis2-sync',
    name: 'DHIS2 Integration System',
    description: 'On-premises synchronization pipeline securely mapping regional healthcare registries to central nodes. Fully compliant with Tanzanian PDPA regulations.',
    ownerId: 'juma-kessy',
    owner: 'Juma Kessy',
    status: 'Active',
    memberCount: 4,
    createdAt: '2026-05-12T00:00:00Z',
    createdDate: 'May 12, 2026',
    lastActivity: '2 hours ago',
    lastActivityDate: '2026-06-19T16:34:00Z',
    members: [
      { id: 'juma-kessy', email: 'j.kessy@domain.tz', name: 'Juma Kessy', role: 'owner' },
      { id: 'arnold-m', email: 'a.m@domain.tz', name: 'Arnold M.', role: 'contributor' },
      { id: 'halima-s', email: 'h.s@domain.tz', name: 'Halima S.', role: 'viewer_comment' },
      { id: 'auditor', email: 'auditor@domain.tz', name: 'External Auditor', role: 'viewer' },
    ],
    entries: [
      {
        id: 'entry-1',
        projectId: 'dhis2-sync',
        author: 'Arnold M.',
        authorId: 'arnold-m',
        role: 'contributor',
        date: '2026-06-19 16:34',
        entryDate: '2026-06-19',
        content: "Switched the application context layer state management over to using LangGraph's native SQLite checkpoint engine. This configuration fully isolates concurrent transaction locks and ensures absolute data persistence during local infrastructure drops.",
        comments: [
          { id: 'c1', entryId: 'entry-1', author: 'Juma Kessy', authorId: 'juma-kessy', role: 'owner', text: 'Excellent architectural decision. Did you run the performance benchmark on the local Windows Server virtual machine?', timestamp: '2026-06-19 17:01' },
          { id: 'c2', entryId: 'entry-1', author: 'Arnold M.', authorId: 'arnold-m', role: 'contributor', text: 'Yes. Write latency dropped from 45ms to 8ms on the Hyper-V isolated storage cluster.', timestamp: '2026-06-19 17:15' },
        ],
        commentsEnabled: true,
        createdAt: '2026-06-19T16:34:00Z',
        updatedAt: '2026-06-19T17:15:00Z',
      },
      {
        id: 'entry-2',
        projectId: 'dhis2-sync',
        author: 'Juma Kessy',
        authorId: 'juma-kessy',
        role: 'owner',
        date: '2026-06-18 09:12',
        entryDate: '2026-06-18',
        content: "Completed audit of security credentials. Verified that all read/write logs strictly check local NTFS file security properties via the Active Directory bridge. Data sovereignty rules set by the BOT and PDPA are successfully cleared.",
        comments: [],
        commentsEnabled: true,
        createdAt: '2026-06-18T09:12:00Z',
        updatedAt: '2026-06-18T09:12:00Z',
      },
    ],
  },
  {
    id: 'kariakoo-router',
    name: 'Kariakoo B2B Procurement Router',
    description: 'High-concurrency routing loop handling wholesale item distributions, local stock inventories, and asynchronous transaction updates throughout East Africa.',
    ownerId: 'arnold-m',
    owner: 'Arnold M.',
    status: 'Active',
    memberCount: 2,
    createdAt: '2026-04-02T00:00:00Z',
    createdDate: 'April 02, 2026',
    lastActivity: '1 day ago',
    lastActivityDate: '2026-06-17T14:20:00Z',
    members: [
      { id: 'arnold-m', email: 'a.m@domain.tz', name: 'Arnold M.', role: 'owner' },
      { id: 'juma-kessy', email: 'j.kessy@domain.tz', name: 'Juma Kessy', role: 'contributor' },
    ],
    entries: [
      {
        id: 'entry-3',
        projectId: 'kariakoo-router',
        author: 'Arnold M.',
        authorId: 'arnold-m',
        role: 'owner',
        date: '2026-06-17 14:20',
        entryDate: '2026-06-17',
        content: "Pushed updates to the Kariakoo order matching loop. Utilizing parallel async buffers in Python to handle high-frequency surges in client procurement orders. Simulated load at 2,000 requests/sec with zero dropped frames.",
        comments: [],
        commentsEnabled: true,
        createdAt: '2026-06-17T14:20:00Z',
        updatedAt: '2026-06-17T14:20:00Z',
      },
    ],
  },
  {
    id: 'whatsapp-gateway',
    name: 'WhatsApp Customer Operations Gateway',
    description: 'High-availability messaging hub connecting local CRM databases directly to WhatsApp Business APIs, enabling automated query parsing and SMS failovers.',
    ownerId: 'juma-kessy',
    owner: 'Juma Kessy',
    status: 'Maintenance',
    memberCount: 2,
    createdAt: '2026-03-15T00:00:00Z',
    createdDate: 'March 15, 2026',
    lastActivity: '3 days ago',
    lastActivityDate: '2026-06-14T10:00:00Z',
    members: [
      { id: 'juma-kessy', email: 'j.kessy@domain.tz', name: 'Juma Kessy', role: 'owner' },
      { id: 'support-bot', email: 'support@domain.tz', name: 'Support Bot Agent', role: 'contributor' },
    ],
    entries: [],
  },
]

export const PERMISSION_MAP: Record<Role, string[]> = {
  owner: ['delete_project', 'manage_members', 'create_entry', 'add_comment', 'delete_entry'],
  contributor: ['create_entry', 'add_comment'],
  viewer_comment: ['add_comment'],
  viewer: [],
}