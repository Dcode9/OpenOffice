import React, { useState } from 'react'
import { useWord } from '../../context'
import {
  useComments,
  createComment,
  updateCommentBody,
  addReply,
  setCommentResolved,
  deleteComment,
  goToComment,
  formatCommentTime,
} from '../../editor/comments'
import { X, Send, Check, Trash2, MessageSquare, CornerDownRight } from 'lucide-react'

export default function CommentsPane() {
  const { editor, setShowCommentsPane } = useWord()
  const { threads, author } = useComments()
  const [replyText, setReplyText] = useState<{ [id: string]: string }>({})
  const [newCommentText, setNewCommentText] = useState('')

  const handleAddComment = () => {
    if (!editor) return
    if (!newCommentText.trim()) return
    createComment(editor, newCommentText.trim())
    setNewCommentText('')
  }

  const handleAddReply = (id: string) => {
    const text = (replyText[id] || '').trim()
    if (!text) return
    addReply(id, text)
    setReplyText((prev) => ({ ...prev, [id]: '' }))
  }

  return (
    <aside className="task-pane comments-pane" aria-label="Comments">
      <div className="task-pane-header">
        <div className="task-pane-title">
          <MessageSquare size={16} className="text-muted" />
          <span>Comments</span>
        </div>
        <button
          type="button"
          className="task-pane-close"
          onClick={() => setShowCommentsPane(false)}
          title="Close Comments"
        >
          <X size={14} />
        </button>
      </div>

      <div className="task-pane-content">
        <div className="comment-compose-box">
          <textarea
            className="comment-textarea"
            placeholder="Type a new comment..."
            rows={2}
            value={newCommentText}
            onChange={(e) => setNewCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault()
                handleAddComment()
              }
            }}
          />
          <div className="comment-compose-footer">
            <span className="comment-author-hint">Posting as {author}</span>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              disabled={!newCommentText.trim()}
              onClick={handleAddComment}
            >
              Post
            </button>
          </div>
        </div>

        {threads.length === 0 ? (
          <div className="task-pane-empty">
            <MessageSquare size={36} strokeWidth={1.5} className="empty-icon" />
            <p>There are no comments in this file.</p>
            <p className="text-xs text-muted">
              Select text and click New Comment on the Review tab or type above to start a thread.
            </p>
          </div>
        ) : (
          <div className="comments-list">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`comment-card ${thread.resolved ? 'resolved' : ''}`}
                onClick={() => editor && goToComment(editor, thread.id)}
              >
                <div className="comment-card-header">
                  <div className="comment-avatar" style={{ backgroundColor: thread.color || '#2b579a' }}>
                    {thread.initials || 'A'}
                  </div>
                  <div className="comment-meta">
                    <span className="comment-author">{thread.author}</span>
                    <span className="comment-time">{formatCommentTime(thread.createdAt)}</span>
                  </div>
                  <div className="comment-card-actions">
                    <button
                      type="button"
                      className={`btn-icon ${thread.resolved ? 'active' : ''}`}
                      title={thread.resolved ? 'Unresolve thread' : 'Resolve thread'}
                      onClick={(e) => {
                        e.stopPropagation()
                        setCommentResolved(thread.id, !thread.resolved)
                      }}
                    >
                      <Check size={13} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon text-danger"
                      title="Delete thread"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (editor) deleteComment(editor, thread.id)
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {thread.quote && (
                  <div className="comment-quote" title="Highlighted text">
                    &ldquo;{thread.quote}&rdquo;
                  </div>
                )}

                <div className="comment-body">{thread.body}</div>

                {thread.replies && thread.replies.length > 0 && (
                  <div className="comment-replies">
                    {thread.replies.map((reply) => (
                      <div key={reply.id} className="comment-reply-item">
                        <div className="comment-reply-header">
                          <span className="comment-reply-author">{reply.author}</span>
                          <span className="comment-time">{formatCommentTime(reply.createdAt)}</span>
                        </div>
                        <div className="comment-reply-body">{reply.body}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="comment-reply-input-row" onClick={(e) => e.stopPropagation()}>
                  <CornerDownRight size={13} className="text-muted" />
                  <input
                    type="text"
                    className="reply-input"
                    placeholder="Reply..."
                    value={replyText[thread.id] || ''}
                    onChange={(e) =>
                      setReplyText((prev) => ({ ...prev, [thread.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddReply(thread.id)
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn-icon btn-reply"
                    disabled={!(replyText[thread.id] || '').trim()}
                    onClick={() => handleAddReply(thread.id)}
                    title="Send reply"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
