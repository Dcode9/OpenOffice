import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { applyMultilevelList } from '../editor/actions'

type Props = { editor: Editor; onClose: () => void }

const STYLES = [
  { id: 'decimal', label: '1, 2, 3' },
  { id: 'lower-alpha', label: 'a, b, c' },
  { id: 'upper-alpha', label: 'A, B, C' },
  { id: 'lower-roman', label: 'i, ii, iii' },
  { id: 'upper-roman', label: 'I, II, III' },
]

export default function MultilevelDialog({ editor, onClose }: Props) {
  const [level, setLevel] = useState('1')
  const [style, setStyle] = useState('decimal')
  const [indent, setIndent] = useState('0.25')

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog" role="dialog" aria-modal="true" aria-label="Define New Multilevel List">
        <div className="dialog-title">Define New Multilevel List</div>
        <div className="dialog-body">
          <div className="dialog-row">
            <label>List level:</label>
            <select value={level} onChange={(e) => setLevel(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>Level {n}</option>)}
            </select>
          </div>
          <div className="dialog-row">
            <label>Number style:</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              {STYLES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
          <div className="dialog-row">
            <label>Indent at (in):</label>
            <input className="dialog-input" type="number" step="0.25" min="0" value={indent} onChange={(e) => setIndent(e.target.value)} />
          </div>
          <div className="font-preview">
            <div className="dialog-field-label">Preview</div>
            <div className="font-preview-box" style={{ fontFamily: 'Calibri' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ paddingLeft: (Number(level) - 1) * 24 + i * 8, fontSize: 14 }}>
                  <span style={{ display: 'inline-block', width: 30 }}>{i + 1}.</span>
                  Level {Number(level)} item
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button
            className="dialog-btn primary"
            onClick={() => {
              applyMultilevelList(editor, Number(level), style)
              const amount = Number(indent)
              if (Number.isFinite(amount)) {
                editor.chain().focus().updateAttributes('paragraph', { indentLeft: (Number(level) - 1) * amount + amount }).run()
              }
              onClose()
            }}
          >
            OK
          </button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
