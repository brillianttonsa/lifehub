import { useState } from 'react'
import { Users } from 'lucide-react'
import { ProjectMember, Role } from '../../types/project'
import { getRoleColor, getRoleLabel } from '../../utils/projects/style'
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
      <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Users size={18} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Members</h4>
              <p className="mt-0.5 text-xs text-slate-500">{members.length} total members</p>
            </div>
          </div>
          {canManageMembers && onAddMember && (
            <button onClick={onAddMember} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
              + Add
            </button>
          )}
        </div>

        <div className="space-y-3">
          {members.length === 0 && <p className="py-4 text-center text-xs text-slate-400">No members yet</p>}

          {members.map((member) => (
            <div
              key={member.email}
              className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0"
            >
              <div className="flex flex-1 items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
                  {member.name?.substring(0, 1).toUpperCase() || member.email.substring(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-slate-900">{member.name}</strong>
                  <span className="truncate text-xs text-slate-400">{member.email}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                {canManageMembers && member.email !== currentUserEmail ? (
                  <div className="flex items-center gap-1">
                    <select
                      value={member.role}
                      onChange={(e) => onChangeRole?.(member.email, e.target.value as Role)}
                      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold uppercase text-slate-700 outline-none"
                    >
                      <option value="owner">Owner</option>
                      <option value="contributor">Contributor</option>
                      <option value="viewer_comment">Commenter</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    {onRemoveMember && (
                      <button
                        onClick={() => setMemberPendingRemoval(member)}
                        className="px-1 font-bold text-rose-500 hover:text-rose-700"
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
