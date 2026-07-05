import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Toast as ToastMessage } from '../../types/project'

interface ToastProps {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
  onClose: (id: number) => void
}

export function Toast({ id, message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), 4000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  const bgStyle =
    type === 'error'
      ? 'bg-rose-50 border-rose-200 text-rose-900'
      : type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : 'bg-indigo-50 border-indigo-200 text-indigo-900'

  const Icon = type === 'error' ? AlertCircle : CheckCircle2

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-sm font-medium shadow-lg ${bgStyle}`}
    >
      <Icon size={18} />
      <span>{message}</span>
      <button onClick={() => onClose(id)} className="ml-2 text-lg font-bold opacity-50 hover:opacity-100">
        ×
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastMessage[]; onClose: (id: number) => void }) {
  return (
    <AnimatePresence>
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={onClose} />
      ))}
    </AnimatePresence>
  )
}
