import { useState } from 'react'


interface CreateEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { content: string; commentsEnabled: boolean }) => void
  isPending?: boolean
  currentUserName?: string
}

export function CreateEntryModal({ isOpen, onClose, onSubmit, isPending = false, currentUserName = 'User' }: CreateEntryModalProps) {
  const [formData, setFormData] = useState({
    content: '',
    commentsEnabled: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.content.trim()) {
      onSubmit(formData)
      setFormData({ content: '', commentsEnabled: true })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white border border-zinc-200 rounded-lg p-6 shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
          <h3 className="font-bold text-sm text-zinc-900 uppercase font-mono tracking-tight flex items-center gap-2">
            📝 Commit Log to Node
          </h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-900 font-bold text-lg">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Author Name</label>
            <input
              type="text"
              disabled
              value={currentUserName}
              className="w-full px-3 py-1.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-400 cursor-not-allowed font-mono text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-mono font-bold text-zinc-600 uppercase tracking-wider">Active Stream Entry Logs</label>
            <textarea
              required
              placeholder="Document system updates, optimization milestones, or regional validation results..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full h-32 px-3 py-1.5 rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:bg-white resize-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-zinc-50 border border-zinc-200 rounded">
            <span className="font-mono text-[11px] text-zinc-500 font-bold">ALLOW COLLABORATIVE COMMENTS</span>
            <input
              type="checkbox"
              checked={formData.commentsEnabled}
              onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
              className="w-4 h-4 rounded text-zinc-950 focus:ring-zinc-950 border-zinc-300"
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
              {isPending ? 'Writing...' : 'Write to Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}