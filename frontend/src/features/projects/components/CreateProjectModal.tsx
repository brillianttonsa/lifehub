import { useState } from 'react'
import { Plus } from 'lucide-react'

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string }) => void
  isPending?: boolean
}

export function CreateProjectModal({ isOpen, onClose, onSubmit, isPending = false }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim() && formData.description.trim()) {
      onSubmit(formData)
      setFormData({ name: '', description: '' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-tight flex items-center gap-2">
            <Plus size={16} /> Link New Local Sync Domain
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Sync Directory Name</label>
            <input
              type="text"
              required
              placeholder="e.g., DHIS2 Integration System"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Description and Compliance Notes</label>
            <textarea
              required
              placeholder="Provide scope, data access structures, or compliance guidelines..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full h-24 px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white resize-none"
            />
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
              {isPending ? 'Creating...' : 'Commit Domain Map'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}