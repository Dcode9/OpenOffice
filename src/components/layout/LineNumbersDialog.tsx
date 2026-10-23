import { useState } from 'react'
import { layoutSnapshot, setLineNumberConfig, type LineNumberMode } from './layoutStore'
import '../../styles/layout-advanced.css'

type Props = { onClose: () => void }

export default function LineNumbersDialog({ onClose }: Props) {
  const stored = layoutSnapshot().lineNumbers
  const [enabled, setEnabled] = useState(stored.mode !== 'none')
  const [mode, setMode] = useState<LineNumberMode>(stored.mode === 'none' ? 'continuous' : stored.mode)
  const [startAt, setStartAt] = useState(String(stored.startAt))
  const [fromText, setFromText] = useState(String(stored.fromText))
  const [autoFromText, setAutoFromText] = useState(stored.autoFromText)
  const [countBy, setCountBy] = useState(String(stored.countBy))

  const apply = () => {
    setLineNumberConfig({
      mode: enabled ? mode : 'none',
      startAt: Math.max(0, Number(startAt) || 0),
      fromText: Math.max(0, Number(fromText) || 0),
      autoFromText,
      countBy: Math.max(1, Math.min(100, Number(countBy) || 1)),
    })
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog line-numbers-dialog" role="dialog" aria-modal="true" aria-label="Line Numbers">
        <div className="dialog-title">Line Numbers</div>
        <div className="dialog-body">
          <label className="check-row line-numbers-enable">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
            Add line numbering
          </label>
          <fieldset className="layout-fieldset" disabled={!enabled}>
            <div className="dialog-grid line-numbers-grid">
              <label>Start at:</label>
              <input type="number" min={0} value={startAt} onChange={(event) => setStartAt(event.target.value)} />
              <label>From text:</label>
              <div className="line-numbers-from">
                <input type="number" min={0} step={0.05} value={fromText} disabled={autoFromText} onChange={(event) => setFromText(event.target.value)} />
                <label className="check-row"><input type="checkbox" checked={autoFromText} onChange={(event) => setAutoFromText(event.target.checked)} /> Auto</label>
              </div>
              <label>Count by:</label>
              <input type="number" min={1} max={100} value={countBy} onChange={(event) => setCountBy(event.target.value)} />
            </div>
            <div className="dialog-subtitle">Numbering</div>
            <div className="dialog-radio-list">
              <label><input type="radio" checked={mode === 'continuous'} onChange={() => setMode('continuous')} /> Continuous</label>
              <label><input type="radio" checked={mode === 'page'} onChange={() => setMode('page')} /> Restart each page</label>
              <label><input type="radio" checked={mode === 'section'} onChange={() => setMode('section')} /> Restart each section</label>
            </div>
            <div className="dialog-grid line-numbers-grid line-numbers-apply">
              <label>Apply to:</label>
              <select defaultValue="whole">
                <option value="whole">Whole document</option>
                <option value="sections">Selected sections</option>
              </select>
            </div>
          </fieldset>
          <p className="layout-dialog-note">Line numbers print in the left margin and are visible in Print Layout.</p>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" type="button" onClick={apply}>OK</button>
          <button className="dialog-btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
