import { useEffect } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Toast as ToastMessage } from '../../../types/project'

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
      ? 'bg-red-50 border-red-200 text-red-900'
      : type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
        : 'bg-blue-50 border-blue-200 text-blue-900'

  const Icon = type === 'error' ? AlertCircle : CheckCircle2

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg transition-all duration-300 animate-slide-in ${bgStyle}`}
    >
      <Icon size={18} />
      <span className="text-xs font-medium tracking-tight">{message}</span>
      <button onClick={() => onClose(id)} className="ml-2 font-bold text-lg opacity-50 hover:opacity-100">
        ×
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastMessage[]; onClose: (id: number) => void }) {
  return (
    <div className="font-sans">
      {toasts.map((t) => (
        <Toast key={t.id} id={t.id} message={t.message} type={t.type} onClose={onClose} />
      ))}
    </div>
  )
}
