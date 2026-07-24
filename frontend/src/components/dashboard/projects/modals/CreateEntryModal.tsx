import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CreateEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { content: string; commentsEnabled: boolean }) => void
  isPending?: boolean
  currentUserName?: string
}

export function CreateEntryModal({
  isOpen,
  onClose,
  onSubmit,
  isPending = false,
  currentUserName = 'User',
}: CreateEntryModalProps) {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm dark:bg-slate-950/70"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="w-full max-w-lg space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
                  New entry
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">Write a log entry</h3>
              </div>
              <button
                onClick={onClose}
                className="text-lg font-bold text-slate-400 transition hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Author
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUserName}
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-950/80 dark:text-slate-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Entry content
                </label>
                <textarea
                  required
                  placeholder="Document updates, milestones, or notes..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Allow comments on this entry
                </span>
                <input
                  type="checkbox"
                  checked={formData.commentsEnabled}
                  onChange={(e) => setFormData({ ...formData, commentsEnabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Writing…' : 'Write entry'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}