import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { applyBulletList } from '../editor/actions'
import { FONTS } from '../lib/constants'

type Props = { editor: Editor; onClose: () => void }

const BULLETS = [
  { id: 'disc', symbol: '•', label: 'Solid circle' },
  { id: 'circle', symbol: '○', label: 'Open circle' },
  { id: 'square', symbol: '▪', label: 'Square' },
  { id: 'diamond', symbol: '◆', label: 'Diamond' },
  { id: 'arrow', symbol: '➢', label: 'Arrow' },
  { id: 'check', symbol: '✓', label: 'Check mark' },
  { id: 'star', symbol: '★', label: 'Star' },
  { id: 'flower', symbol: '✿', label: 'Flower' },
]

export default function BulletDialog({ editor, onClose }: Props) {
  const attrs = editor.getAttributes('bulletList') || {}
  const [symbol, setSymbol] = useState(attrs.bulletSymbol || (attrs.bulletStyle === 'arrow' ? '➢' : attrs.bulletStyle === 'square' ? '▪' : '•'))
  const [font, setFont] = useState(attrs.bulletFont || 'Calibri')

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog" role="dialog" aria-modal="true" aria-label="Define New Bullet">
        <div className="dialog-title">Define New Bullet</div>
        <div className="dialog-body">
          <div className="bullet-grid">
            {BULLETS.map((item) => (
              <button key={item.id} className={`effect-choice${symbol === item.symbol ? ' active' : ''}`} onClick={() => setSymbol(item.symbol)} title={item.label}>
                <span style={{ fontSize: 22 }}>{item.symbol}</span>
                <small>{item.label}</small>
              </button>
            ))}
          </div>
          <div className="dialog-row">
            <label>Symbol:</label>
            <input className="dialog-input" value={symbol} onChange={(e) => setSymbol(e.target.value.slice(0, 4) || '•')} />
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
              <ul className="dialog-bullet-preview" style={{ listStyle: 'none', paddingLeft: 18 }}>
                <li><span style={{ marginRight: 7 }}>{symbol}</span>First item</li>
                <li><span style={{ marginRight: 7 }}>{symbol}</span>Second item</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={() => { applyBulletList(editor, 'custom', { symbol, font }); onClose() }}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
