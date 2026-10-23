import { useState } from 'react'
import { FONT_OPTIONS } from './data'
import type { FontPair } from './types'

export function CustomizeFontsDialog({
  initial,
  onSave,
  onClose,
}: {
  initial: FontPair
  onSave: (pair: FontPair) => void
  onClose: () => void
}) {
  const [headingFont, setHeadingFont] = useState(initial.headingFont)
  const [bodyFont, setBodyFont] = useState(initial.bodyFont)
  const [name, setName] = useState(initial.custom ? initial.label : 'Custom 1')

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog" role="dialog" aria-modal="true" aria-label="Create New Theme Fonts">
        <div className="dialog-title">Create New Theme Fonts</div>
        <div className="dialog-body">
          <div className="ds-dialog-row">
            <label>Heading font</label>
            <select value={headingFont} onChange={(event) => setHeadingFont(event.target.value)} style={{ flex: 1 }}>
              {FONT_OPTIONS.map((font) => <option key={font}>{font}</option>)}
            </select>
          </div>
          <div className="ds-dialog-row">
            <label>Body font</label>
            <select value={bodyFont} onChange={(event) => setBodyFont(event.target.value)} style={{ flex: 1 }}>
              {FONT_OPTIONS.map((font) => <option key={font}>{font}</option>)}
            </select>
          </div>
          <div className="ds-font-preview">
            <div style={{ fontFamily: `"${headingFont}", sans-serif`, fontSize: 20 }}>Heading</div>
            <div style={{ fontFamily: `"${bodyFont}", sans-serif`, fontSize: 13 }}>
              The quick brown fox jumps over the lazy dog. 0123456789
            </div>
          </div>
          <div className="ds-dialog-row">
            <label>Name</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => { setHeadingFont(initial.headingFont); setBodyFont(initial.bodyFont) }}>
            Reset
          </button>
          <button
            type="button"
            className="dialog-btn primary"
            onClick={() =>
              onSave({
                id: initial.custom ? initial.id : `custom-fonts-${Date.now()}`,
                label: name.trim() || 'Custom 1',
                headingFont,
                bodyFont,
                custom: true,
              })
            }
          >
            Save
          </button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export type SpacingValues = {
  before: number
  after: number
  lineHeight: number
  font: string
  size: number
}

export function ParagraphSpacingDialog({
  initial,
  onApply,
  onClose,
}: {
  initial: SpacingValues
  onApply: (values: SpacingValues) => void
  onClose: () => void
}) {
  const [before, setBefore] = useState(initial.before)
  const [after, setAfter] = useState(initial.after)
  const [lineHeight, setLineHeight] = useState(initial.lineHeight)
  const [font, setFont] = useState(initial.font)
  const [size, setSize] = useState(initial.size)

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog ds-spacing-dialog" role="dialog" aria-modal="true" aria-label="Paragraph Spacing">
        <div className="dialog-title">Paragraph Spacing</div>
        <div className="dialog-body">
          <div className="ds-spacing-grid">
            <div>
              <div className="ds-dialog-row">
                <label>Before</label>
                <input type="number" min={0} max={200} value={before} onChange={(event) => setBefore(Number(event.target.value))} style={{ width: 64 }} /> pt
              </div>
              <div className="ds-dialog-row">
                <label>After</label>
                <input type="number" min={0} max={200} value={after} onChange={(event) => setAfter(Number(event.target.value))} style={{ width: 64 }} /> pt
              </div>
              <div className="ds-dialog-row">
                <label>Line spacing</label>
                <input type="number" min={0.8} max={4} step={0.05} value={lineHeight} onChange={(event) => setLineHeight(Number(event.target.value))} style={{ width: 64 }} />
              </div>
              <div className="ds-dialog-section-title" style={{ marginTop: 14 }}>Default font</div>
              <div className="ds-dialog-row">
                <label>Font</label>
                <select value={font} onChange={(event) => setFont(event.target.value)} style={{ flex: 1 }}>
                  {FONT_OPTIONS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div className="ds-dialog-row">
                <label>Size</label>
                <input type="number" min={6} max={72} value={size} onChange={(event) => setSize(Number(event.target.value))} style={{ width: 64 }} /> pt
              </div>
            </div>
            <div className="ds-spacing-preview">
              <div className="ds-spacing-preview-heading" style={{ fontFamily: `"${font}", sans-serif` }}>Heading</div>
              <div
                className="ds-spacing-preview-body"
                style={{
                  fontFamily: `"${font}", sans-serif`,
                  fontSize: `${Math.min(16, size)}pt`,
                  lineHeight,
                  marginTop: `${before / 2}px`,
                  marginBottom: `${after / 2}px`,
                }}
              >
                The quick brown fox jumps over the lazy dog.
              </div>
              <div
                className="ds-spacing-preview-body"
                style={{
                  fontFamily: `"${font}", sans-serif`,
                  fontSize: `${Math.min(16, size)}pt`,
                  lineHeight,
                  marginTop: `${before / 2}px`,
                  marginBottom: `${after / 2}px`,
                }}
              >
                Pack my box with five dozen liquor jugs.
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" onClick={() => onApply({ before, after, lineHeight, font, size })}>OK</button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export function SetDefaultDialog({
  theme,
  style,
  colors,
  fonts,
  effects,
  onConfirm,
  onClose,
}: {
  theme: string
  style: string
  colors: string
  fonts: string
  effects: string
  onConfirm: (updateNormal: boolean) => void
  onClose: () => void
}) {
  const [updateNormal, setUpdateNormal] = useState(true)

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog ds-default-dialog" role="dialog" aria-modal="true" aria-label="Set Default Design">
        <div className="dialog-title">Set Default Design</div>
        <div className="dialog-body">
          <p className="ds-default-lead">Use the current design settings as the default for new documents?</p>
          <div className="ds-default-summary">
            <div><span>Theme</span><strong>{theme}</strong></div>
            <div><span>Style set</span><strong>{style}</strong></div>
            <div><span>Theme colors</span><strong>{colors}</strong></div>
            <div><span>Theme fonts</span><strong>{fonts}</strong></div>
            <div><span>Theme effects</span><strong>{effects}</strong></div>
          </div>
          <label className="ds-check-row" style={{ marginTop: 14 }}>
            <input type="checkbox" checked={updateNormal} onChange={(event) => setUpdateNormal(event.target.checked)} />
            Also update the Normal template
          </label>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" onClick={() => onConfirm(updateNormal)}>OK</button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export function NameDialog({
  title,
  label,
  initial = '',
  onSave,
  onClose,
}: {
  title: string
  label: string
  initial?: string
  onSave: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial)

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog ds-name-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">
          <div className="ds-dialog-row">
            <label>{label}</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && name.trim()) onSave(name.trim())
              }}
              style={{ flex: 1 }}
            />
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" disabled={!name.trim()} onClick={() => onSave(name.trim())}>OK</button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
