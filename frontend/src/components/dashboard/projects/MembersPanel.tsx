import { useState } from 'react'
import { Users } from 'lucide-react'
import { ProjectMember, Role } from '../../../types/project'
import { getRoleColor, getRoleLabel } from '../../../utils/projects/style'
import { ConfirmDialog } from './ConfirmDialog'

interface MembersPanelProps {
  members: ProjectMember[]
  onAddMember?: () => void
  onChangeRole?: (memberEmail: string, newRole: Role) => void
  onRemoveMember?: (memberEmail: string) => void
  canManageMembers?: boolean
  currentUserEmail?: string
}

export function MembersPanel({
  members,
  onAddMember,
  onChangeRole,
  onRemoveMember,
  canManageMembers = false,
  currentUserEmail = '',
}: MembersPanelProps) {
  const [memberPendingRemoval, setMemberPendingRemoval] = useState<ProjectMember | null>(null)

  const handleConfirmRemove = () => {
    if (memberPendingRemoval) onRemoveMember?.(memberPendingRemoval.email)
    setMemberPendingRemoval(null)
  }

  return (
    <>
      <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Users size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Members</h4>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{members.length} total members</p>
            </div>
          </div>
          {canManageMembers && onAddMember && (
            <button onClick={onAddMember} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
              + Add
            </button>
          )}
        </div>

        <div className="space-y-3">
          {members.length === 0 && <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">No members yet</p>}

          {members.map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0 dark:border-slate-800"
            >
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white dark:bg-slate-800">
                  {member.name?.substring(0, 1).toUpperCase() || member.email.substring(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-slate-900 dark:text-slate-100">{member.name}</strong>
                  <span className="truncate text-xs text-slate-400 dark:text-slate-500">{member.email}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {canManageMembers && member.email !== currentUserEmail ? (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole?.(member.email, e.target.value as Role)}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                    >
                      <option value="owner">Owner</option>
                      <option value="contributor">Contributor</option>
                      <option value="viewer_comment">Commenter</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    {onRemoveMember && (
                      <button
                        onClick={() => setMemberPendingRemoval(member)}
                        className="px-1 font-bold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                        title="Remove member"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ) : (
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getRoleColor(member.role)}`}
                  >
                    {getRoleLabel(member.role)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </article>

      <ConfirmDialog
        isOpen={!!memberPendingRemoval}
        title="Remove this member?"
        message={`${memberPendingRemoval?.name || 'This member'} will immediately lose access to the project.`}
        confirmLabel="Remove member"
        onConfirm={handleConfirmRemove}
        onCancel={() => setMemberPendingRemoval(null)}
      />
    </>
  )
}