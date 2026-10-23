import { useState } from 'react'
import { layoutSnapshot, setHyphenationConfig } from './layoutStore'
import '../../styles/layout-advanced.css'

type Props = { onClose: () => void }

export default function HyphenationDialog({ onClose }: Props) {
  const stored = layoutSnapshot().hyphenation
  const [automatic, setAutomatic] = useState(stored.mode === 'auto')
  const [hyphenateCaps, setHyphenateCaps] = useState(stored.hyphenateCaps)
  const [zone, setZone] = useState(String(stored.zoneIn))
  const [limit, setLimit] = useState(String(stored.limit))

  const apply = () => {
    setHyphenationConfig({
      mode: automatic ? 'auto' : 'none',
      hyphenateCaps,
      zoneIn: Math.max(0, Number(zone) || 0),
      limit: Math.max(0, Math.min(10, Number(limit) || 0)),
    })
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog hyphenation-dialog" role="dialog" aria-modal="true" aria-label="Hyphenation">
        <div className="dialog-title">Hyphenation</div>
        <div className="dialog-body">
          <label className="check-row">
            <input type="checkbox" checked={automatic} onChange={(event) => setAutomatic(event.target.checked)} />
            Automatically hyphenate document
          </label>
          <label className="check-row">
            <input type="checkbox" checked={hyphenateCaps} onChange={(event) => setHyphenateCaps(event.target.checked)} />
            Hyphenate words in CAPS
          </label>
          <div className="dialog-subtitle">Hyphenation zone</div>
          <div className="dialog-grid hyphenation-grid">
            <label>Zone:</label>
            <div className="columns-number">
              <input type="number" min={0} step={0.05} value={zone} onChange={(event) => setZone(event.target.value)} />
              <span>"</span>
            </div>
            <label>Limit consecutive hyphens to:</label>
            <input type="number" min={0} max={10} value={limit} onChange={(event) => setLimit(event.target.value)} />
          </div>
          <p className="layout-dialog-note">Automatic hyphenation uses the browser's language dictionary for the document text.</p>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" type="button" onClick={apply}>OK</button>
          <button className="dialog-btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
