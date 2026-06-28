import { ProjectMember, Role } from '../../../types/project'
import { getRoleColor, getRoleLabel } from '../coreFiles/hooks'
import { Users } from 'lucide-react'

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
  return (
    <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-zinc-600" />
          <div>
            <h4 className="font-bold text-sm text-zinc-950">Operator Permissions</h4>
            <p className="text-[10.5px] text-zinc-500 mt-0.5">{members.length} total members</p>
          </div>
        </div>
        {canManageMembers && onAddMember && (
          <button onClick={onAddMember} className="text-[11px] font-bold text-zinc-900 hover:underline">
            [+] Add
          </button>
        )}
      </div>

      <div className="space-y-3">
        {members.length === 0 && <p className="text-[11px] text-zinc-400 text-center py-4">No members yet</p>}

        {members.map((member) => (
          <div key={member.email} className="flex items-center justify-between text-xs pb-3 border-b border-zinc-100 last:border-0 last:pb-0">
            <div className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full bg-zinc-700 text-white font-bold flex items-center justify-center text-[10px]">
                {member.name?.substring(0, 1).toUpperCase() || member.email.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <strong className="text-zinc-900 block truncate">{member.name}</strong>
                <span className="text-[9.5px] font-mono text-zinc-400 truncate">{member.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {canManageMembers && member.email !== currentUserEmail ? (
                <div className="flex items-center gap-1">
                  <select
                    value={member.role}
                    onChange={(e) => onChangeRole?.(member.email, e.target.value as Role)}
                    className="text-[9.5px] font-mono font-bold uppercase bg-white border border-zinc-200 rounded py-0.5 px-1 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                  >
                    <option value="owner">Owner</option>
                    <option value="contributor">Contributor</option>
                    <option value="viewer_comment">Commenter</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {onRemoveMember && (
                    <button
                      onClick={() => onRemoveMember(member.email)}
                      className="text-red-500 hover:text-red-700 font-bold px-1"
                      title="Revoke Node Access"
                    >
                      ×
                    </button>
                  )}
                </div>
              ) : (
                <span className={`text-[10px] font-mono font-bold uppercase rounded px-2 py-0.5 border ${getRoleColor(member.role)}`}>
                  {getRoleLabel(member.role)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </article>
  )
}