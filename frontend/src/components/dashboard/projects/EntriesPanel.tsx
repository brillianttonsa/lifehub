import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Entry } from '../../../types/project'
import { getRoleColor } from '../../../utils/projects/style'
import { ConfirmDialog } from './ConfirmDialog'

interface EntriesPanelProps {
  entries: Entry[]
  selectedEntryId: string
  onSelectEntry: (entryId: string) => void
  onDeleteEntry?: (entryId: string) => void
  onCreateEntry?: () => void
  canDelete?: boolean
  isLoading?: boolean
}

export function EntriesPanel({
  entries,
  selectedEntryId,
  onSelectEntry,
  onDeleteEntry,
  onCreateEntry,
  canDelete = false,
  isLoading = false,
}: EntriesPanelProps) {
  const [entryPendingDelete, setEntryPendingDelete] = useState<Entry | null>(null)

  const handleConfirmDelete = () => {
    if (entryPendingDelete) onDeleteEntry?.(entryPendingDelete.id)
    setEntryPendingDelete(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-3 rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-4 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800"></div>
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-900"></div>
            <div className="h-2 w-1/2 rounded-full bg-slate-100 dark:bg-slate-900"></div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <BookOpen className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600" />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No entries yet for this project.</p>
        {onCreateEntry && (
          <button
            onClick={onCreateEntry}
            className="mx-auto mt-4 flex items-center gap-1.5 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus size={14} /> Write the first entry
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelectEntry(entry.id)}
            className={`cursor-pointer space-y-3 rounded-3xl border p-5 shadow-sm transition ${
              selectedEntryId === entry.id
                ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-500/50 dark:bg-indigo-950/20'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
            }`}
          >
            {/* Entry Metadata */}
            <div className="flex items-start justify-between gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
                  {entry.author.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{entry.author}</span>
                  <span
                    className={`ml-2 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getRoleColor(entry.role)}`}
                  >
                    {entry.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500">{entry.date}</span>
            </div>

            {/* Entry Content */}
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{entry.content}</p>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <button className="flex items-center gap-1 transition hover:text-slate-900 dark:hover:text-slate-200">
                <MessageSquare size={14} />
                <span>{entry.comments.length} comments</span>
              </button>

              {canDelete && onDeleteEntry && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEntryPendingDelete(entry)
                  }}
                  className="flex items-center gap-1 font-semibold text-rose-600 transition hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!entryPendingDelete}
        title="Delete this entry?"
        message="This will permanently remove the entry and all of its comments. This can't be undone."
        confirmLabel="Delete entry"
        onConfirm={handleConfirmDelete}
        onCancel={() => setEntryPendingDelete(null)}
      />
    </>
  )
}