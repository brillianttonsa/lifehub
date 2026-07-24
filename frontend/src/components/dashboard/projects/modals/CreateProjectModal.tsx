import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
            className="w-full max-w-md space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
                  New project
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">Create a project</h3>
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
                  Project name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., DHIS2 Integration System"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Description
                </label>
                <textarea
                  required
                  placeholder="Provide scope, data access structures, or notes..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
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
                  {isPending ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}