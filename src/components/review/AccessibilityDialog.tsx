import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, ScanSearch } from 'lucide-react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'
import {
  accessibilitySummary,
  applyAccessibilityFix,
  collectAccessibilityIssues,
} from './accessibility'
import type { AccessibilityIssue } from './accessibility'

function SeverityIcon({ severity }: { severity: AccessibilityIssue['severity'] }) {
  if (severity === 'error') return <AlertTriangle size={15} className="rv-sev-error" />
  if (severity === 'warning') return <AlertTriangle size={15} className="rv-sev-warning" />
  return <Info size={15} className="rv-sev-tip" />
}

const severityLabel: Record<AccessibilityIssue['severity'], string> = {
  error: 'Error',
  warning: 'Warning',
  tip: 'Tip',
}

export default function AccessibilityDialog({ onClose }: { onClose: () => void }) {
  const { editor, toast } = useWord()
  const [tick, setTick] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const [keepRunning, setKeepRunning] = useState(true)

  useEffect(() => {
    if (!editor) return
    const update = () => setTick((value) => value + 1)
    editor.on('transaction', update)
    return () => {
      editor.off('transaction', update)
    }
  }, [editor])

  const issues = useMemo(() => {
    const order = { error: 0, warning: 1, tip: 2 }
    return collectAccessibilityIssues(editor).sort((a, b) => order[a.severity] - order[b.severity] || a.from - b.from)
  }, [editor, tick])
  const summary = useMemo(() => accessibilitySummary(issues), [issues])
  const selected = issues.find((issue) => issue.id === selectedId) ?? issues[0] ?? null

  useEffect(() => {
    if (selected?.kind === 'alt') setAltText('')
  }, [selected?.id, selected?.kind])

  const fix = (issue: AccessibilityIssue) => {
    if (!editor) return
    const ok = applyAccessibilityFix(editor, issue, altText)
    if (ok) {
      toast(issue.kind === 'alt' ? 'Alternative text added' : `${issue.title} fixed`)
      setTick((value) => value + 1)
    } else {
      toast('This issue could not be fixed automatically')
    }
  }

  const fixAll = () => {
    if (!editor || !issues.length) return
    let fixed = 0
    const ordered = [...issues].sort((a, b) => b.nodePos - a.nodePos)
    for (const issue of ordered) {
      if (applyAccessibilityFix(editor, issue, 'Decorative image')) fixed += 1
    }
    toast(fixed ? `Fixed ${fixed} accessibility issue${fixed === 1 ? '' : 's'}` : 'No issues could be fixed automatically')
    setTick((value) => value + 1)
  }

  return (
    <ReviewDialog
      title="Accessibility"
      subtitle="Inspection results"
      width={760}
      onClose={onClose}
      footer={
        <>
          <label className="rv-check">
            <input type="checkbox" checked={keepRunning} onChange={(event) => setKeepRunning(event.target.checked)} />
            Keep accessibility checker running while I work
          </label>
          <ReviewButton onClick={() => setTick((value) => value + 1)}>Recheck</ReviewButton>
          <ReviewButton onClick={fixAll} disabled={!issues.length}>Fix All</ReviewButton>
          <ReviewButton variant="primary" onClick={onClose}>Close</ReviewButton>
        </>
      }
    >
      <div className="rv-a11y-summary">
        <div className="rv-a11y-stat error"><span>{summary.errors}</span>Errors</div>
        <div className="rv-a11y-stat warning"><span>{summary.warnings}</span>Warnings</div>
        <div className="rv-a11y-stat tip"><span>{summary.tips}</span>Tips</div>
      </div>
      <div className="rv-a11y-layout">
        <div className="rv-a11y-list">
          <div className="rv-a11y-list-head">
            <ScanSearch size={14} /> Inspection Results
          </div>
          {issues.length === 0 && (
            <div className="rv-a11y-empty">
              <CheckCircle2 size={28} />
              <strong>No accessibility issues found</strong>
              <span>Great job. Keep adding alt text and table headers as you edit.</span>
            </div>
          )}
          {issues.map((issue) => (
            <button
              key={issue.id}
              type="button"
              className={`rv-a11y-item${selected?.id === issue.id ? ' active' : ''}`}
              onClick={() => setSelectedId(issue.id)}
            >
              <SeverityIcon severity={issue.severity} />
              <span className="rv-a11y-item-main">
                <span className="rv-a11y-item-title">{issue.title}</span>
                <span className="rv-a11y-item-note">{issue.message}</span>
              </span>
              <span className={`rv-a11y-badge ${issue.severity}`}>{severityLabel[issue.severity]}</span>
            </button>
          ))}
        </div>
        <div className="rv-a11y-detail">
          {!selected ? (
            <div className="rv-a11y-detail-empty">Select an inspection result to see details and recommended actions.</div>
          ) : (
            <>
              <div className="rv-a11y-detail-title">
                <SeverityIcon severity={selected.severity} />
                {selected.title}
              </div>
              <div className={`rv-a11y-badge ${selected.severity}`}>{severityLabel[selected.severity]}</div>
              <p className="rv-a11y-detail-text">{selected.detail}</p>
              <div className="rv-a11y-why">
                <strong>Why fix this?</strong>
                <span>
                  Accessible documents are easier to read with screen readers, keyboard navigation, and other assistive technology.
                </span>
              </div>
              {selected.kind === 'alt' && (
                <label className="rv-field">
                  <span className="rv-field-label">Alternative text</span>
                  <input
                    className="rv-input"
                    value={altText}
                    onChange={(event) => setAltText(event.target.value)}
                    placeholder="Describe the image"
                  />
                </label>
              )}
              <div className="rv-a11y-actions">
                <ReviewButton variant="primary" onClick={() => fix(selected)}>{selected.fixLabel}</ReviewButton>
                <ReviewButton onClick={() => editor?.chain().focus().setTextSelection(selected.from).run()}>
                  Go to Issue
                </ReviewButton>
              </div>
            </>
          )}
        </div>
      </div>
    </ReviewDialog>
  )
}
