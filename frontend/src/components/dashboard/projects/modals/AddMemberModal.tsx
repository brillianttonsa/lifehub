import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Role } from '../../../../types/project'

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
            className="w-full max-w-sm space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-600 dark:text-indigo-400">
                  New member
                </p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">Add a member</h3>
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
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.tz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                >
                  <option value="contributor">Contributor</option>
                  <option value="viewer_comment">Commenter</option>
                  <option value="viewer">Viewer (read only)</option>
                </select>
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
                  {isPending ? 'Adding…' : 'Add member'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}