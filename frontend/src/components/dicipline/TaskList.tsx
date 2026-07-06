import { useState } from 'react'
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { DisciplineTask } from '../../types/discipline'

interface TaskListProps {
  tasks: DisciplineTask[]
  onAdd: (title: string) => Promise<void>
  onRename: (taskId: string, title: string) => Promise<void>
  onDelete: (taskId: string) => Promise<void>
}

export default function TaskList({ tasks, onAdd, onRename, onDelete }: TaskListProps) {
  const [newTitle, setNewTitle] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAdd = async () => {
    const title = newTitle.trim()
    if (!title) return
    setIsSaving(true)
    try {
      await onAdd(title)
      setNewTitle('')
    } finally {
      setIsSaving(false)
    }
  }

  const startEditing = (task: DisciplineTask) => {
    setEditingId(task.id)
    setEditingTitle(task.title)
  }

  const commitEditing = async () => {
    if (!editingId) return
    const title = editingTitle.trim()
    if (title) await onRename(editingId, title)
    setEditingId(null)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Non-negotiable tasks</h3>

      <div className="mt-3 flex gap-2">
        <input
          value={newTitle}
          onChange={(event) => setNewTitle(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && handleAdd()}
          placeholder="e.g. Read 10 pages"
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={isSaving || !newTitle.trim()}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
            {editingId === task.id ? (
              <input
                autoFocus
                value={editingTitle}
                onChange={(event) => setEditingTitle(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && commitEditing()}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none"
              />
            ) : (
              <span className="truncate text-sm text-slate-800">{task.title}</span>
            )}

            <div className="flex shrink-0 items-center gap-1">
              {editingId === task.id ? (
                <>
                  <button onClick={commitEditing} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50" title="Save">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" title="Cancel">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => startEditing(task)} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100" title="Rename">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => onDelete(task.id)} className="rounded-md p-1.5 text-rose-600 hover:bg-rose-50" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {tasks.length === 0 && <p className="text-sm text-slate-400">No tasks yet.</p>}
      </ul>
    </div>
  )
}
