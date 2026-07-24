import { MessageSquareText, Send } from 'lucide-react'
import { Comment, Entry } from '../../../types/project'

interface CommentsCardProps {
  entry?: Entry
  comments: Comment[]
  onAddComment?: (content: string) => void
  onDeleteComment?: (commentId: string) => void
  isLoading?: boolean
  canComment?: boolean
  newCommentContent?: string
  onCommentContentChange?: (content: string) => void
}

export function CommentsCard({
  entry,
  comments,
  onAddComment,
  onDeleteComment,
  isLoading = false,
  canComment = false,
  newCommentContent = '',
  onCommentContentChange,
}: CommentsCardProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCommentContent.trim() && onAddComment) {
      onAddComment(newCommentContent)
    }
  }

  if (!entry) {
    return (
      <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <MessageSquareText size={18} />
          <p className="text-sm">Select an entry to view comments</p>
        </div>
      </article>
    )
  }

  return (
    <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <MessageSquareText size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Comments</h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {entry.commentsEnabled ? `Entry ${entry.id}` : 'Comments disabled for this entry'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">No comments on this entry yet.</p>
        )}

        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse space-y-1 rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
                <div className="h-3 w-2/3 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900"></div>
              </div>
            ))}
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="rounded-2xl bg-slate-50 p-3 text-sm last:border-0 dark:bg-slate-950">
            <div className="mb-1 flex justify-between text-xs text-slate-400 dark:text-slate-500">
              <span>
                <strong className="text-slate-700 dark:text-slate-300">{comment.author}</strong> ({comment.role.replace('_', ' ')})
              </span>
              <span>{comment.timestamp}</span>
            </div>
            <p className="leading-normal text-slate-600 dark:text-slate-300">{comment.text}</p>
            {onDeleteComment && (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="mt-1 text-xs font-semibold text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      {entry.commentsEnabled ? (
        <form onSubmit={handleSubmit} className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <textarea
            value={newCommentContent}
            onChange={(e) => onCommentContentChange?.(e.target.value)}
            placeholder="Write a comment..."
            className="min-h-20 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!canComment || !newCommentContent.trim()}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-300 md:ml-auto md:w-auto dark:disabled:bg-slate-800 dark:disabled:text-slate-500"
          >
            <Send size={14} />
            Post comment
          </button>
        </form>
      ) : (
        <div className="mt-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-400 dark:bg-slate-950 dark:text-slate-500">
          Comments are restricted for your role on this entry
        </div>
      )}
    </article>
  )
}