import { useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { applyNumberedList } from '../editor/actions'
import { FONTS } from '../lib/constants'

type Props = { editor: Editor; onClose: () => void }

const FORMATS = [
  { id: 'decimal', label: '1, 2, 3 …', sample: ['1.', '2.', '3.'] },
  { id: 'decimal-paren', label: '1), 2), 3) …', sample: ['1)', '2)', '3)'] },
  { id: 'lower-alpha', label: 'a., b., c. …', sample: ['a.', 'b.', 'c.'] },
  { id: 'upper-alpha', label: 'A., B., C. …', sample: ['A.', 'B.', 'C.'] },
  { id: 'lower-roman', label: 'i., ii., iii. …', sample: ['i.', 'ii.', 'iii.'] },
  { id: 'upper-roman', label: 'I., II., III. …', sample: ['I.', 'II.', 'III.'] },
  { id: 'alpha-paren', label: 'a), b), c) …', sample: ['a)', 'b)', 'c)'] },
  { id: 'roman-paren', label: 'i), ii), iii) …', sample: ['i)', 'ii)', 'iii)'] },
]

export default function NumberFormatDialog({ editor, onClose }: Props) {
  const attrs = editor.getAttributes('orderedList') || {}
  const [style, setStyle] = useState(attrs.numberStyle || 'decimal')
  const [start, setStart] = useState(String(attrs.start || 1))
  const [font, setFont] = useState(attrs.bulletFont || 'Calibri')
  const format = useMemo(() => FORMATS.find((f) => f.id === style) || FORMATS[0], [style])

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog" role="dialog" aria-modal="true" aria-label="Define New Number Format">
        <div className="dialog-title">Define New Number Format</div>
        <div className="dialog-body">
          <div className="dialog-row">
            <label>Number style:</label>
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              {FORMATS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
          </div>
          <div className="dialog-row">
            <label>Start at:</label>
            <input className="dialog-input" type="number" min={1} value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="dialog-row">
            <label>Font:</label>
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              {FONTS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div className="font-preview">
            <div className="dialog-field-label">Preview</div>
            <div className="font-preview-box" style={{ fontFamily: font }}>
              {format.sample.map((marker, i) => (
                <div key={marker} style={{ fontSize: 14, padding: '2px 0' }}>
                  <span style={{ display: 'inline-block', width: 42 }}>{marker}</span>List item {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={() => { applyNumberedList(editor, style, Math.max(1, Number(start) || 1)); onClose() }}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
