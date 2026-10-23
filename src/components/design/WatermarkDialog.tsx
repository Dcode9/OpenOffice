import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Upload } from 'lucide-react'
import { FONT_OPTIONS } from './data'
import type { WatermarkStyle } from './types'

type CustomVars = CSSProperties & Record<string, string>

function readImage(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => onLoad(String(reader.result || '')))
  reader.readAsDataURL(file)
}

export default function WatermarkDialog({
  initial,
  onApply,
  onClose,
}: {
  initial: WatermarkStyle
  onApply: (style: WatermarkStyle) => void
  onClose: () => void
}) {
  const [kind, setKind] = useState<'none' | 'picture' | 'text'>(initial.kind === 'none' ? 'none' : initial.kind)
  const [text, setText] = useState(initial.text || 'DRAFT')
  const [font, setFont] = useState(initial.font || 'Calibri')
  const [size, setSize] = useState(initial.size || 90)
  const [color, setColor] = useState(initial.color || '#b4b4b4')
  const [semitransparent, setSemitransparent] = useState(initial.semitransparent)
  const [layout, setLayout] = useState<'diagonal' | 'horizontal'>(initial.layout)
  const [image, setImage] = useState(initial.image)
  const [scale, setScale] = useState(initial.scale || 100)
  const [washout, setWashout] = useState(initial.washout)
  const fileRef = useRef<HTMLInputElement>(null)

  const previewStyle = {
    '--preview-color': color,
    '--preview-opacity': semitransparent ? '0.32' : '0.9',
    '--preview-font': font,
    '--preview-size': `${Math.max(9, size / 3.4)}px`,
    '--preview-rotate': layout === 'diagonal' ? '-45deg' : '0deg',
    '--preview-scale': `${Math.max(12, scale * 0.6)}%`,
  } as CustomVars

  const submit = () => {
    if (kind === 'none') {
      onApply({ ...initial, kind: 'none' })
      return
    }
    if (kind === 'picture') {
      onApply({ ...initial, kind: 'picture', image, scale, washout })
      return
    }
    onApply({
      ...initial,
      kind: 'text',
      text: text.trim() || 'DRAFT',
      font,
      size,
      color,
      semitransparent,
      layout,
      image: '',
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog ds-wm-dialog" role="dialog" aria-modal="true" aria-label="Printed Watermark">
        <div className="dialog-title">Printed Watermark</div>
        <div className="dialog-body">
          <div className="ds-wm-dialog-grid">
            <div>
              <div className="ds-radio-list">
                <label><input type="radio" name="wm-kind" checked={kind === 'none'} onChange={() => setKind('none')} /> No watermark</label>
                <label><input type="radio" name="wm-kind" checked={kind === 'picture'} onChange={() => setKind('picture')} /> Picture watermark</label>
                <label><input type="radio" name="wm-kind" checked={kind === 'text'} onChange={() => setKind('text')} /> Text watermark</label>
              </div>

              <fieldset className="ds-wm-fields ds-dialog-section" disabled={kind !== 'picture'}>
                <div className="ds-dialog-section-title">Picture</div>
                <div className="ds-dialog-row">
                  <button type="button" className="dialog-btn" onClick={() => fileRef.current?.click()} disabled={kind !== 'picture'}>
                    <Upload size={13} /> Select Picture…
                  </button>
                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) readImage(file, setImage)
                    }}
                  />
                </div>
                <div className="ds-wm-cols">
                  <div className="ds-dialog-row">
                    <label>Scale</label>
                    <select value={scale} onChange={(event) => setScale(Number(event.target.value))} disabled={kind !== 'picture'}>
                      <option value={50}>50%</option>
                      <option value={100}>100%</option>
                      <option value={150}>150%</option>
                      <option value={200}>200%</option>
                      <option value={500}>500%</option>
                    </select>
                  </div>
                </div>
                <label className="ds-check-row">
                  <input type="checkbox" checked={washout} onChange={(event) => setWashout(event.target.checked)} disabled={kind !== 'picture'} />
                  Washout
                </label>
              </fieldset>

              <fieldset className="ds-wm-fields ds-dialog-section" disabled={kind !== 'text'}>
                <div className="ds-dialog-section-title">Text</div>
                <div className="ds-dialog-row">
                  <label>Language</label>
                  <select disabled={kind !== 'text'}>
                    <option>English (United States)</option>
                  </select>
                </div>
                <div className="ds-dialog-row">
                  <label>Text</label>
                  <input type="text" value={text} onChange={(event) => setText(event.target.value)} disabled={kind !== 'text'} style={{ flex: 1 }} />
                </div>
                <div className="ds-wm-cols">
                  <div className="ds-dialog-row">
                    <label>Font</label>
                    <select value={font} onChange={(event) => setFont(event.target.value)} disabled={kind !== 'text'}>
                      {FONT_OPTIONS.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <div className="ds-dialog-row">
                    <label>Size</label>
                    <select value={size} onChange={(event) => setSize(Number(event.target.value))} disabled={kind !== 'text'}>
                      <option value={36}>36</option>
                      <option value={48}>48</option>
                      <option value={60}>60</option>
                      <option value={72}>72</option>
                      <option value={90}>90</option>
                      <option value={120}>120</option>
                    </select>
                  </div>
                </div>
                <div className="ds-dialog-row">
                  <label>Color</label>
                  <input type="color" value={color} onChange={(event) => setColor(event.target.value)} disabled={kind !== 'text'} />
                  <label className="ds-check-row">
                    <input type="checkbox" checked={semitransparent} onChange={(event) => setSemitransparent(event.target.checked)} disabled={kind !== 'text'} />
                    Semitransparent
                  </label>
                </div>
                <div className="ds-dialog-row">
                  <label>Layout</label>
                  <label className="ds-wm-inline"><input type="radio" name="wm-layout" checked={layout === 'diagonal'} onChange={() => setLayout('diagonal')} disabled={kind !== 'text'} /> Diagonal</label>
                  <label className="ds-wm-inline"><input type="radio" name="wm-layout" checked={layout === 'horizontal'} onChange={() => setLayout('horizontal')} disabled={kind !== 'text'} /> Horizontal</label>
                </div>
              </fieldset>
            </div>

            <div className="ds-wm-preview">
              <div className="ds-wm-preview-sheet" style={previewStyle}>
                {kind === 'picture' && image ? (
                  <div className="ds-wm-preview-image" style={{ backgroundImage: `url("${image}")` }} />
                ) : (
                  <div className="ds-wm-preview-text">{kind === 'none' ? '' : text}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" onClick={submit} disabled={kind === 'picture' && !image}>OK</button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
