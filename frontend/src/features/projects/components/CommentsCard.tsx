import { Entry, Comment } from '../../../types/project'
import { MessageSquareText, Send } from 'lucide-react'

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
      <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-zinc-500">
          <MessageSquareText size={18} />
          <p className="text-xs font-medium">Select an entry to view comments</p>
        </div>
      </article>
    )
  }

  return (
    <article className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
      <div className="border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquareText size={18} className="text-zinc-600" />
          <div>
            <h3 className="font-bold text-sm text-zinc-950">Comments</h3>
            <p className="text-[10.5px] text-zinc-500 mt-0.5">
              {entry.commentsEnabled ? `Entry ${entry.id}` : 'Comments disabled for this entry'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-[11px] text-zinc-400 font-medium text-center py-4">No comments mapped to this thread loop yet.</p>
        )}

        {isLoading && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded p-2 animate-pulse space-y-1">
                <div className="h-3 bg-zinc-200 rounded w-2/3"></div>
                <div className="h-2 bg-zinc-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="text-xs border-b border-zinc-100 pb-2.5 last:border-0">
            <div className="flex justify-between font-mono text-[10px] text-zinc-400 mb-1">
              <span>
                <strong className="text-zinc-700">{comment.author}</strong> ({comment.role.replace('_', ' ')})
              </span>
              <span>{comment.timestamp}</span>
            </div>
            <p className="text-zinc-600 leading-normal">{comment.text}</p>
            {onDeleteComment && (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="text-[9px] text-red-500 hover:text-red-700 mt-1 font-bold"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comment Form */}
      {entry.commentsEnabled ? (
        <form onSubmit={handleSubmit} className="pt-3 border-t border-zinc-200 space-y-2">
          <textarea
            value={newCommentContent}
            onChange={(e) => onCommentContentChange?.(e.target.value)}
            placeholder="Write administrative feedback..."
            className="w-full px-3 py-1.5 text-xs bg-white rounded border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-900 resize-none min-h-20"
          />
          <button
            type="submit"
            disabled={!canComment || !newCommentContent.trim()}
            className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white px-3 py-1.5 text-xs font-bold rounded transition-all flex items-center justify-center gap-1.5"
          >
            <Send size={12} />
            Post Comment
          </button>
        </form>
      ) : (
        <div className="text-[10px] text-zinc-400 font-mono mt-2 bg-zinc-100 border border-zinc-200 rounded px-2.5 py-1">
          🔒 Comment permission level restricted
        </div>
      )}
    </article>
  )
}