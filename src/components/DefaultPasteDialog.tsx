import { useState } from 'react'
import { getDefaultPasteMode, setDefaultPasteMode, type PasteMode } from '../lib/clipboard'

type Props = { onClose: () => void }

export default function DefaultPasteDialog({ onClose }: Props) {
  const [mode, setMode] = useState<PasteMode>(getDefaultPasteMode())
  const [saved, setSaved] = useState(false)

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog" role="dialog" aria-modal="true" aria-label="Set Default Paste">
        <div className="dialog-title">Set Default Paste</div>
        <div className="dialog-body">
          <div className="dialog-field-label">When content is pasted with Ctrl+V</div>
          <div className="paste-mode-list">
            {([
              ['html', 'Keep Source Formatting'],
              ['merge', 'Merge Formatting'],
              ['text', 'Keep Text Only'],
            ] as const).map(([value, label]) => (
              <button key={value} className={`paste-mode${mode === value ? ' active' : ''}`} onClick={() => { setMode(value); setSaved(false) }}>
                <strong>{label}</strong>
              </button>
            ))}
          </div>
          {saved && <div className="dialog-note">Default paste setting saved.</div>}
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={() => { setDefaultPasteMode(mode); onClose() }}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
