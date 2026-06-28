import { useState } from 'react'
import { Role } from '../../../types/project'
import { Users } from 'lucide-react'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { email: string; role: Role }) => void
  isPending?: boolean
}

export function AddMemberModal({ isOpen, onClose, onSubmit, isPending = false }: AddMemberModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'contributor' as Role,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.email.trim()) {
      onSubmit(formData)
      setFormData({ email: '', role: 'contributor' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-tight flex items-center gap-2">
            <Users size={16} /> Bind Operator Authority
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Network Email Identity</label>
            <input
              type="email"
              required
              placeholder="operator.name@domain.tz"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 font-mono focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Default Permissions Tier</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white font-mono font-bold uppercase text-xs"
            >
              <option value="contributor">Contributor</option>
              <option value="viewer_comment">Commenter</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded text-xs transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold rounded text-xs transition-all"
            >
              {isPending ? 'Authorizing...' : 'Authorize Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}