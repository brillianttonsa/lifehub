// Toast.tsx
import { useEffect } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ToastItem {
  id: string | number
  message: string
  type: 'success' | 'error' | 'info' | string
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onClose: (id: any) => void
  duration?: number // duration in ms, defaults to 4000ms
}

function ToastCard({ toast, onClose, duration = 4000 }: { toast: ToastItem; onClose: (id: any) => void; duration?: number }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, duration)

    return () => clearTimeout(timer)
  }, [toast.id, duration, onClose])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-lg backdrop-blur-md border transition-colors ${
        toast.type === 'success'
          ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
          : toast.type === 'error'
          ? 'bg-red-500/15 border-red-500/25 text-red-700 dark:text-red-400'
          : 'bg-indigo-500/15 border-indigo-500/25 text-indigo-700 dark:text-indigo-400'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {toast.type === 'success' && <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />}
        {toast.type === 'error' && <AlertCircle size={16} className="shrink-0 text-red-500" />}
        {toast.type !== 'success' && toast.type !== 'error' && (
          <Info size={16} className="shrink-0 text-indigo-500" />
        )}
        
        <span className="truncate">{toast.message}</span>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 rounded-lg p-1 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <X size={14} />
      </button>
    </motion.div>
  )
}

export function ToastContainer({ toasts, onClose, duration = 4000 }: ToastContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={onClose} duration={duration} />
        ))}
      </AnimatePresence>
    </div>
  )
}