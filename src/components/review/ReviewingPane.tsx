import React, { useMemo } from 'react'
import { useWord } from '../../context'
import {
  collectRevisions,
  acceptRevision,
  rejectRevision,
  setActiveRevision,
  acceptAllRevisions,
  rejectAllRevisions,
  type Revision,
} from '../../editor/review'
import { useComments, goToComment } from '../../editor/comments'
import { X, Check, CheckCheck, Trash2, GitCommit, ArrowRight, CornerDownRight } from 'lucide-react'

export default function ReviewingPane() {
  const { editor, setReviewingPane, reviewingOrientation, setReviewingOrientation } = useWord()
  const { threads } = useComments()

  const revisions = useMemo(() => {
    return collectRevisions(editor)
  }, [editor, editor?.state.doc])

  const insertions = revisions.filter((r) => r.type === 'insertion')
  const deletions = revisions.filter((r) => r.type === 'deletion')

  const totalSummary = revisions.length + threads.length

  const handleSelectRevision = (rev: Revision) => {
    if (!editor) return
    setActiveRevision(rev)
    editor.commands.setTextSelection({ from: rev.from, to: rev.to })
    editor.commands.scrollIntoView()
  }

  const isHorizontal = reviewingOrientation === 'horizontal'

  return (
    <aside
      className={`task-pane reviewing-pane ${isHorizontal ? 'reviewing-pane-horizontal' : 'reviewing-pane-vertical'}`}
      aria-label="Reviewing Pane"
    >
      <div className="task-pane-header">
        <div className="task-pane-title">
          <GitCommit size={16} className="text-muted" />
          <span>Revisions ({totalSummary})</span>
        </div>
        <div className="reviewing-pane-toggles">
          <button
            type="button"
            className={`btn-ghost-sm ${!isHorizontal ? 'active' : ''}`}
            onClick={() => setReviewingOrientation('vertical')}
            title="Vertical docked pane"
          >
            Vert
          </button>
          <button
            type="button"
            className={`btn-ghost-sm ${isHorizontal ? 'active' : ''}`}
            onClick={() => setReviewingOrientation('horizontal')}
            title="Horizontal docked pane"
          >
            Horiz
          </button>
          <button
            type="button"
            className="task-pane-close"
            onClick={() => setReviewingPane(false)}
            title="Close Reviewing Pane"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="task-pane-content">
        {/* Summary box */}
        <div className="revisions-summary-box">
          <div className="summary-stat-row">
            <span className="stat-label">Total revisions:</span>
            <span className="stat-value font-bold">{totalSummary}</span>
          </div>
          <div className="summary-stat-sub">
            <div className="stat-pill stat-insertions">
              <span className="pill-dot" /> Insertions: {insertions.length}
            </div>
            <div className="stat-pill stat-deletions">
              <span className="pill-dot" /> Deletions: {deletions.length}
            </div>
            <div className="stat-pill stat-comments">
              <span className="pill-dot" /> Comments: {threads.length}
            </div>
          </div>
          {revisions.length > 0 && (
            <div className="summary-actions-row">
              <button
                type="button"
                className="btn btn-xs btn-outline-success"
                onClick={() => editor && acceptAllRevisions(editor)}
              >
                <CheckCheck size={12} className="mr-1" /> Accept All
              </button>
              <button
                type="button"
                className="btn btn-xs btn-outline-danger"
                onClick={() => editor && rejectAllRevisions(editor)}
              >
                <Trash2 size={12} className="mr-1" /> Reject All
              </button>
            </div>
          )}
        </div>

        {/* Detailed revision list */}
        {totalSummary === 0 ? (
          <div className="task-pane-empty">
            <GitCommit size={36} strokeWidth={1.5} className="empty-icon" />
            <p>No revisions or comments in this document.</p>
            <p className="text-xs text-muted">
              Turn on Track Changes or insert comments to record markup.
            </p>
          </div>
        ) : (
          <div className="revisions-tree">
            {insertions.length > 0 && (
              <div className="rev-group">
                <div className="rev-group-header">Insertions ({insertions.length})</div>
                {insertions.map((rev) => (
                  <div
                    key={rev.id}
                    className="rev-item insertion-item"
                    onClick={() => handleSelectRevision(rev)}
                  >
                    <div className="rev-item-header">
                      <span className="rev-author" style={{ color: rev.color }}>
                        {rev.author}
                      </span>
                      <span className="rev-type">Inserted</span>
                    </div>
                    <div className="rev-snippet">&ldquo;{rev.text}&rdquo;</div>
                    <div className="rev-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        title="Accept insertion"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editor) acceptRevision(editor, rev)
                        }}
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon text-danger"
                        title="Reject insertion"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editor) rejectRevision(editor, rev)
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {deletions.length > 0 && (
              <div className="rev-group">
                <div className="rev-group-header">Deletions ({deletions.length})</div>
                {deletions.map((rev) => (
                  <div
                    key={rev.id}
                    className="rev-item deletion-item"
                    onClick={() => handleSelectRevision(rev)}
                  >
                    <div className="rev-item-header">
                      <span className="rev-author" style={{ color: rev.color }}>
                        {rev.author}
                      </span>
                      <span className="rev-type">Deleted</span>
                    </div>
                    <div className="rev-snippet strike">&ldquo;{rev.text}&rdquo;</div>
                    <div className="rev-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        title="Accept deletion"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editor) acceptRevision(editor, rev)
                        }}
                      >
                        <Check size={12} />
                      </button>
                      <button
                        type="button"
                        className="btn-icon text-danger"
                        title="Reject deletion"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (editor) rejectRevision(editor, rev)
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {threads.length > 0 && (
              <div className="rev-group">
                <div className="rev-group-header">Comments ({threads.length})</div>
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    className="rev-item comment-item"
                    onClick={() => editor && goToComment(editor, thread.id)}
                  >
                    <div className="rev-item-header">
                      <span className="rev-author" style={{ color: thread.color }}>
                        {thread.author}
                      </span>
                      <span className="rev-type">{thread.resolved ? 'Resolved' : 'Active'}</span>
                    </div>
                    {thread.quote && <div className="rev-snippet quote">&ldquo;{thread.quote}&rdquo;</div>}
                    <div className="rev-comment-body">{thread.body}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
