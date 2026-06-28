import { Entry } from '../../../types/project'
import {  getRoleColor } from '../coreFiles/hooks'
import { MessageSquare, Trash2, Plus, BookOpen } from 'lucide-react'

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
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-zinc-200 rounded-lg p-4 bg-white space-y-3 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
            <div className="h-3 bg-zinc-200 rounded w-full"></div>
            <div className="h-2 bg-zinc-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50">
        <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
        <p className="text-xs text-zinc-500 font-medium mt-2">Active log ledger is empty for this domain node.</p>
        {onCreateEntry && (
          <button
            onClick={onCreateEntry}
            className="mt-4 bg-zinc-900 text-white hover:bg-zinc-800 text-xs font-bold px-3 py-1.5 rounded-md transition-all flex items-center gap-1 mx-auto"
          >
            <Plus size={14} /> Initialize First Entry
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          onClick={() => onSelectEntry(entry.id)}
          className={`border rounded-lg p-5 space-y-3 shadow-sm transition-all cursor-pointer ${
            selectedEntryId === entry.id
              ? 'border-zinc-400 bg-zinc-50'
              : 'border-zinc-200 bg-white hover:border-zinc-300'
          }`}
        >
          {/* Entry Metadata */}
          <div className="flex justify-between items-start gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-zinc-800 text-white font-mono flex items-center justify-center text-[10px] font-bold">
                {entry.author.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="font-bold text-zinc-900">{entry.author}</span>
                <span className={`text-[9.5px] uppercase tracking-wider font-bold ml-2 px-1.5 py-0.5 rounded border ${getRoleColor(entry.role)}`}>
                  {entry.role.replace('_', ' ')}
                </span>
              </div>
            </div>
            <span className="font-mono text-zinc-400 text-[10.5px]">{entry.date}</span>
          </div>

          {/* Entry Content */}
          <p className="text-xs text-zinc-700 leading-relaxed font-normal line-clamp-3">{entry.content}</p>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500 font-mono">
            <button className="hover:text-zinc-950 flex items-center gap-1 transition-all">
              <MessageSquare size={14} />
              <span>{entry.comments.length} Comments</span>
            </button>

            {canDelete && onDeleteEntry && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteEntry(entry.id)
                }}
                className="hover:text-red-600 flex items-center text-red-500 transition-all gap-1 font-bold"
              >
                <Trash2 size={14} /> Drop
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}