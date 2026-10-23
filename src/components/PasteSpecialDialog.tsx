import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  getDefaultPasteMode,
  insertClip,
  latestClip,
  pasteFromSystem,
  setDefaultPasteMode,
  type PasteMode,
} from '../lib/clipboard'

type Props = { editor: Editor; onClose: () => void }

const MODES: { mode: PasteMode; label: string; description: string }[] = [
  { mode: 'html', label: 'Keep Source Formatting', description: 'Preserve fonts, colors, and layout from the copied content.' },
  { mode: 'merge', label: 'Merge Formatting', description: 'Keep basic emphasis but adopt the formatting at the destination.' },
  { mode: 'text', label: 'Keep Text Only', description: 'Insert plain text without any formatting.' },
  { mode: 'merge', label: 'Use Destination Theme', description: 'Match the theme styles used by this document.' },
  { mode: 'text', label: 'Unformatted Unicode Text', description: 'Insert the clipboard as unformatted Unicode text.' },
]

export default function PasteSpecialDialog({ editor, onClose }: Props) {
  const [mode, setMode] = useState<PasteMode>(getDefaultPasteMode())
  const [choice, setChoice] = useState(0)
  const [saved, setSaved] = useState(false)
  const clip = latestClip()

  const paste = async () => {
    const chosen = MODES[choice].mode
    if (clip) insertClip(editor, clip, chosen)
    else await pasteFromSystem(editor, chosen)
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog paste-special-dialog" role="dialog" aria-modal="true" aria-label="Paste Special">
        <div className="dialog-title">Paste Special</div>
        <div className="dialog-body">
          <div className="dialog-field-label">Source</div>
          <div className="paste-source">{clip ? clip.text.slice(0, 180) || '(formatted content)' : 'System clipboard'}</div>
          <div className="dialog-field-label">As</div>
          <div className="paste-mode-list">
            {MODES.map((item, index) => (
              <button key={index} className={`paste-mode${choice === index ? ' active' : ''}`} onClick={() => setChoice(index)}>
                <strong>{item.label}</strong>
                <small>{item.description}</small>
              </button>
            ))}
          </div>
          <div className="dialog-row">
            <label>Default paste:</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as PasteMode)}>
              <option value="html">Keep Source Formatting</option>
              <option value="merge">Merge Formatting</option>
              <option value="text">Keep Text Only</option>
            </select>
            <button className="dialog-btn" onClick={() => { setDefaultPasteMode(mode); setSaved(true) }}>Set As Default</button>
          </div>
          {saved && <div className="dialog-note">Default paste setting saved.</div>}
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={paste}>Paste</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
