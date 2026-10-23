import { useMemo, useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { TEXT_COLORS } from '../../lib/constants'
import {
  STANDARD_COLORS,
  THEME_COLOR_LABELS,
  shade,
  tint,
} from './data'
import type { ColorSet, ThemePalette } from './types'

function normalizeHex(value: string): string {
  let hex = value.replace('#', '').trim()
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
  if (!/^[0-9a-f]{6}$/i.test(hex)) return '#000000'
  return `#${hex.toLowerCase()}`
}

function hexToRgb(hex: string): [number, number, number] {
  const value = normalizeHex(hex).slice(1)
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0'))
    .join('')}`
}

function rgbToHsl(hex: string): [number, number, number] {
  const [r0, g0, b0] = hexToRgb(hex).map((value) => value / 255)
  const max = Math.max(r0, g0, b0)
  const min = Math.min(r0, g0, b0)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r0) h = (g0 - b0) / d + (g0 < b0 ? 6 : 0)
  else if (max === g0) h = (b0 - r0) / d + 2
  else h = (r0 - g0) / d + 4
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)]
}

function hslToHex(h: number, s: number, l: number): string {
  const hn = ((h % 360) + 360) % 360
  const sn = Math.max(0, Math.min(100, s)) / 100
  const ln = Math.max(0, Math.min(100, l)) / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((hn / 60) % 2) - 1))
  const m = ln - c / 2
  let r = 0
  let g = 0
  let b = 0
  if (hn < 60) [r, g, b] = [c, x, 0]
  else if (hn < 120) [r, g, b] = [x, c, 0]
  else if (hn < 180) [r, g, b] = [0, c, x]
  else if (hn < 240) [r, g, b] = [0, x, c]
  else if (hn < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255)
}

function readImage(file: File, onLoad: (value: string) => void) {
  const reader = new FileReader()
  reader.addEventListener('load', () => onLoad(String(reader.result || '')))
  reader.readAsDataURL(file)
}

export function MoreColorsDialog({
  initial,
  title = 'Colors',
  onApply,
  onClose,
}: {
  initial: string
  title?: string
  onApply: (color: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'standard' | 'custom'>('standard')
  const [model, setModel] = useState<'RGB' | 'HSL'>('RGB')
  const [color, setColor] = useState(normalizeHex(initial))
  const [start] = useState(normalizeHex(initial))
  const [r, g, b] = hexToRgb(color)
  const [h, s, l] = rgbToHsl(color)
  const swatches = useMemo(() => {
    const set = new Set([...TEXT_COLORS, ...STANDARD_COLORS])
    return [...set]
  }, [])

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog" role="dialog" aria-modal="true" aria-label={title}>
        <div className="dialog-title">{title}</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button type="button" className={`dialog-tab${tab === 'standard' ? ' active' : ''}`} onClick={() => setTab('standard')}>
              Standard
            </button>
            <button type="button" className={`dialog-tab${tab === 'custom' ? ' active' : ''}`} onClick={() => setTab('custom')}>
              Custom
            </button>
          </div>
          {tab === 'standard' ? (
            <>
              <div className="ds-color-wheel" />
              <div className="ds-dialog-label">Standard colors</div>
              <div className="ds-swatches">
                {swatches.map((value) => (
                  <button
                    type="button"
                    key={value}
                    style={{ background: value }}
                    title={value}
                    onClick={() => setColor(value)}
                  />
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="ds-dialog-row">
                <label>Color model</label>
                <select value={model} onChange={(event) => setModel(event.target.value as 'RGB' | 'HSL')}>
                  <option value="RGB">RGB</option>
                  <option value="HSL">HSL</option>
                </select>
                <label>Hex</label>
                <input
                  type="text"
                  value={color}
                  onChange={(event) => setColor(normalizeHex(event.target.value))}
                  style={{ width: 92 }}
                />
              </div>
              <div className="ds-rgb-row">
                {model === 'RGB' ? (
                  <>
                    <label>R <input className="ds-dialog-input" type="number" min={0} max={255} value={r} onChange={(event) => setColor(rgbToHex(Number(event.target.value), g, b))} /></label>
                    <label>G <input className="ds-dialog-input" type="number" min={0} max={255} value={g} onChange={(event) => setColor(rgbToHex(r, Number(event.target.value), b))} /></label>
                    <label>B <input className="ds-dialog-input" type="number" min={0} max={255} value={b} onChange={(event) => setColor(rgbToHex(r, g, Number(event.target.value)))} /></label>
                  </>
                ) : (
                  <>
                    <label>H <input className="ds-dialog-input" type="number" min={0} max={359} value={h} onChange={(event) => setColor(hslToHex(Number(event.target.value), s, l))} /></label>
                    <label>S <input className="ds-dialog-input" type="number" min={0} max={100} value={s} onChange={(event) => setColor(hslToHex(h, Number(event.target.value), l))} /></label>
                    <label>L <input className="ds-dialog-input" type="number" min={0} max={100} value={l} onChange={(event) => setColor(hslToHex(h, s, Number(event.target.value)))} /></label>
                  </>
                )}
              </div>
              <div className="ds-color-preview-row">
                <div>
                  <div className="ds-dialog-label">Current</div>
                  <div className="ds-color-preview-old" style={{ background: start }} />
                </div>
                <div>
                  <div className="ds-dialog-label">New</div>
                  <div className="ds-color-preview-new" style={{ background: color }} />
                </div>
                <div className="ds-color-readout">
                  {color.toUpperCase()}
                  <br />
                  RGB {r}, {g}, {b}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" onClick={() => onApply(color)}>OK</button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export function CustomizeColorsDialog({
  initial,
  fallback,
  onSave,
  onClose,
}: {
  initial: ColorSet
  fallback: ThemePalette
  onSave: (set: ColorSet) => void
  onClose: () => void
}) {
  const [name, setName] = useState(initial.custom ? initial.label : 'Custom 1')
  const [colors, setColors] = useState<ThemePalette>([...initial.colors] as ThemePalette)

  const change = (index: number, value: string) => {
    setColors((prev) => {
      const next = [...prev] as ThemePalette
      next[index] = normalizeHex(value)
      return next
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog" role="dialog" aria-modal="true" aria-label="Create New Theme Colors">
        <div className="dialog-title">Create New Theme Colors</div>
        <div className="dialog-body">
          <div className="ds-dialog-section-title">Theme colors</div>
          <div className="ds-color-slots">
            {THEME_COLOR_LABELS.map((label, index) => (
              <label key={label} className="ds-color-slot">
                <input type="color" value={colors[index]} onChange={(event) => change(index, event.target.value)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="ds-dialog-section-title" style={{ marginTop: 14 }}>Preview</div>
          <div className="ds-theme-colors-preview">
            {colors.map((color, index) => <span key={`${color}-${index}`} style={{ background: color }} />)}
          </div>
          <div className="ds-theme-preview-text" style={{ color: colors[4], fontFamily: 'Calibri' }}>
            Sample text with an <span style={{ color: colors[10], textDecoration: 'underline' }}>hyperlink</span>
          </div>
          <div className="ds-dialog-row" style={{ marginTop: 12 }}>
            <label>Name</label>
            <input type="text" value={name} onChange={(event) => setName(event.target.value)} style={{ flex: 1 }} />
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn" onClick={() => setColors([...fallback] as ThemePalette)}>Reset</button>
          <button
            type="button"
            className="dialog-btn primary"
            onClick={() =>
              onSave({
                id: initial.custom ? initial.id : `custom-colors-${Date.now()}`,
                label: name.trim() || 'Custom 1',
                colors,
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

type Texture = { id: string; label: string; base: string; image: string }
type Pattern = { id: string; label: string; image: string }

const TEXTURES: Texture[] = [
  { id: 'paper', label: 'Paper', base: '#f4f1e8', image: 'repeating-linear-gradient(0deg, rgba(120,100,70,.06) 0 1px, transparent 1px 4px)' },
  { id: 'canvas', label: 'Canvas', base: '#e8e2d4', image: 'repeating-linear-gradient(0deg, rgba(0,0,0,.08) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.05) 0 1px, transparent 1px 3px)' },
  { id: 'marble', label: 'Marble', base: '#f2f2f0', image: 'repeating-linear-gradient(115deg, rgba(120,120,120,.12) 0 2px, transparent 2px 16px)' },
  { id: 'wood', label: 'Wood', base: '#d8b98a', image: 'repeating-linear-gradient(90deg, rgba(90,55,25,.22) 0 2px, transparent 2px 9px)' },
  { id: 'water', label: 'Water', base: '#c5e3f2', image: 'repeating-linear-gradient(165deg, rgba(255,255,255,.4) 0 3px, transparent 3px 12px)' },
  { id: 'granite', label: 'Granite', base: '#d9d9d6', image: 'radial-gradient(circle, rgba(0,0,0,.18) 0 1px, transparent 1.5px)' },
  { id: 'linen', label: 'Linen', base: '#eee8da', image: 'repeating-linear-gradient(45deg, rgba(0,0,0,.05) 0 1px, transparent 1px 4px)' },
  { id: 'sand', label: 'Sand', base: '#e7d2a7', image: 'radial-gradient(circle, rgba(120,90,40,.16) 0 1px, transparent 1.5px)' },
]

const PATTERNS: Pattern[] = [
  { id: 'p5', label: '5%', image: 'radial-gradient(circle, currentColor 0 1px, transparent 1.2px)' },
  { id: 'p10', label: '10%', image: 'radial-gradient(circle, currentColor 0 1px, transparent 1.4px)' },
  { id: 'p20', label: '20%', image: 'radial-gradient(circle, currentColor 0 1.5px, transparent 1.8px)' },
  { id: 'p30', label: '30%', image: 'radial-gradient(circle, currentColor 0 2px, transparent 2.3px)' },
  { id: 'p40', label: '40%', image: 'radial-gradient(circle, currentColor 0 2.5px, transparent 2.8px)' },
  { id: 'p50', label: '50%', image: 'radial-gradient(circle, currentColor 0 3px, transparent 3.3px)' },
  { id: 'horizontal', label: 'Horizontal', image: 'repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 5px)' },
  { id: 'vertical', label: 'Vertical', image: 'repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 5px)' },
  { id: 'diagonal', label: 'Diagonal', image: 'repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 5px)' },
  { id: 'cross', label: 'Cross', image: 'repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, currentColor 0 1px, transparent 1px 6px)' },
  { id: 'diagCross', label: 'Diagonal Cross', image: 'repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 7px), repeating-linear-gradient(-45deg, currentColor 0 1px, transparent 1px 7px)' },
  { id: 'checker', label: 'Checker', image: 'repeating-linear-gradient(0deg, currentColor 0 3px, transparent 3px 6px), repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 6px)' },
]

const GRADIENT_PRESETS = [
  { label: 'Early Sunset', fill: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  { label: 'Daybreak', fill: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  { label: 'Meadow', fill: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  { label: 'Deep Ocean', fill: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' },
  { label: 'Plum', fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
]

function gradientDirection(style: string) {
  switch (style) {
    case 'vertical':
      return 'to bottom'
    case 'diagonal-down':
      return '135deg'
    case 'diagonal-up':
      return '45deg'
    case 'from-corner':
      return 'to bottom right'
    case 'from-center':
      return 'circle at center'
    default:
      return 'to right'
  }
}

export function FillEffectsDialog({
  initial,
  onApply,
  onClose,
}: {
  initial: string
  onApply: (fill: string) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<'gradient' | 'texture' | 'pattern' | 'picture'>('gradient')
  const [mode, setMode] = useState<'one' | 'two' | 'preset'>('two')
  const [color1, setColor1] = useState('#dbe9fa')
  const [color2, setColor2] = useState('#2f5496')
  const [light, setLight] = useState(20)
  const [transparency1, setTransparency1] = useState(0)
  const [transparency2, setTransparency2] = useState(0)
  const [shadeStyle, setShadeStyle] = useState('horizontal')
  const [preset, setPreset] = useState(0)
  const [texture, setTexture] = useState(TEXTURES[0].id)
  const [customTexture, setCustomTexture] = useState('')
  const [pattern, setPattern] = useState(PATTERNS[0].id)
  const [foreground, setForeground] = useState('#000000')
  const [background, setBackground] = useState('#ffffff')
  const [picture, setPicture] = useState(initial.startsWith('url(') ? initial : '')
  const fileRef = useRef<HTMLInputElement>(null)

  const fill = useMemo(() => {
    if (tab === 'gradient') {
      if (mode === 'preset') return GRADIENT_PRESETS[preset]?.fill || GRADIENT_PRESETS[0].fill
      const effective2 = mode === 'one' ? (light >= 0 ? tint(color1, light / 100) : shade(color1, -light / 100)) : color2
      const c1 = transparency1 > 0 ? `color-mix(in srgb, ${color1} ${100 - transparency1}%, transparent)` : color1
      const c2 = transparency2 > 0 ? `color-mix(in srgb, ${effective2} ${100 - transparency2}%, transparent)` : effective2
      const direction = gradientDirection(shadeStyle)
      if (direction.startsWith('circle')) {
        return `radial-gradient(${direction}, ${c1} 0%, ${c2} 100%)`
      }
      return `linear-gradient(${direction}, ${c1} 0%, ${c2} 100%)`
    }
    if (tab === 'texture') {
      const selected = TEXTURES.find((item) => item.id === texture) || TEXTURES[0]
      if (customTexture) return `${customTexture}, ${selected.base}`
      return `${selected.image}, ${selected.base}`
    }
    if (tab === 'pattern') {
      const selected = PATTERNS.find((item) => item.id === pattern) || PATTERNS[0]
      const image = selected.image.replaceAll('currentColor', foreground)
      return `${image}, ${background}`
    }
    if (picture) return picture
    return initial
  }, [tab, mode, color1, color2, light, transparency1, transparency2, shadeStyle, preset, texture, customTexture, pattern, foreground, background, picture, initial])

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog" role="dialog" aria-modal="true" aria-label="Fill Effects">
        <div className="dialog-title">Fill Effects</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            {(['gradient', 'texture', 'pattern', 'picture'] as const).map((value) => (
              <button
                type="button"
                key={value}
                className={`dialog-tab${tab === value ? ' active' : ''}`}
                onClick={() => setTab(value)}
              >
                {value[0].toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
          <div className="ds-gradient-preview" style={{ background: fill }} />
          {tab === 'gradient' && (
            <>
              <div className="ds-dialog-section">
                <div className="ds-radio-list">
                  <label><input type="radio" checked={mode === 'one'} onChange={() => setMode('one')} /> One color</label>
                  <label><input type="radio" checked={mode === 'two'} onChange={() => setMode('two')} /> Two colors</label>
                  <label><input type="radio" checked={mode === 'preset'} onChange={() => setMode('preset')} /> Preset</label>
                </div>
              </div>
              <div className="ds-dialog-section">
                {mode === 'preset' ? (
                  <div className="ds-dialog-row">
                    <label>Preset</label>
                    <select value={preset} onChange={(event) => setPreset(Number(event.target.value))}>
                      {GRADIENT_PRESETS.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
                    </select>
                  </div>
                ) : (
                  <div className="ds-gradient-colors">
                    <label className="ds-dialog-row">Color 1 <input type="color" value={color1} onChange={(event) => setColor1(event.target.value)} /></label>
                    {mode === 'two' && (
                      <label className="ds-dialog-row">Color 2 <input type="color" value={color2} onChange={(event) => setColor2(event.target.value)} /></label>
                    )}
                    {mode === 'one' && (
                      <label className="ds-dialog-row">
                        Dark/Light
                        <input type="range" min={-100} max={100} value={light} onChange={(event) => setLight(Number(event.target.value))} />
                        <span>{light}</span>
                      </label>
                    )}
                  </div>
                )}
                <div className="ds-dialog-row">
                  <label>Transparency</label>
                  <input type="number" min={0} max={100} value={transparency1} onChange={(event) => setTransparency1(Number(event.target.value))} />%
                  {mode === 'two' && (
                    <>
                      <input type="number" min={0} max={100} value={transparency2} onChange={(event) => setTransparency2(Number(event.target.value))} />%
                    </>
                  )}
                </div>
                <div className="ds-dialog-row">
                  <label>Shading style</label>
                  <select value={shadeStyle} onChange={(event) => setShadeStyle(event.target.value)}>
                    <option value="horizontal">Horizontal</option>
                    <option value="vertical">Vertical</option>
                    <option value="diagonal-down">Diagonal down</option>
                    <option value="diagonal-up">Diagonal up</option>
                    <option value="from-corner">From corner</option>
                    <option value="from-center">From center</option>
                  </select>
                </div>
              </div>
            </>
          )}
          {tab === 'texture' && (
            <div className="ds-dialog-section">
              <div className="ds-texture-grid">
                {TEXTURES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={texture === item.id && !customTexture ? 'active' : ''}
                    title={item.label}
                    style={{ background: `${item.image}, ${item.base}` }}
                    onClick={() => {
                      setTexture(item.id)
                      setCustomTexture('')
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                <button type="button" className="dialog-btn" onClick={() => fileRef.current?.click()}>
                  <Upload size={13} /> Other Texture…
                </button>
                <input
                  ref={fileRef}
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) readImage(file, (value) => setCustomTexture(`url("${value}") center/cover no-repeat`))
                  }}
                />
              </div>
            </div>
          )}
          {tab === 'pattern' && (
            <div className="ds-dialog-section">
              <div className="ds-dialog-row">
                <label>Foreground</label>
                <input type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} />
                <label>Background</label>
                <input type="color" value={background} onChange={(event) => setBackground(event.target.value)} />
              </div>
              <div className="ds-pattern-grid">
                {PATTERNS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={pattern === item.id ? 'active' : ''}
                    title={item.label}
                    style={{ background: `${item.image.replaceAll('currentColor', foreground)}, ${background}` }}
                    onClick={() => setPattern(item.id)}
                  />
                ))}
              </div>
            </div>
          )}
          {tab === 'picture' && (
            <div className="ds-dialog-section ds-picture-fill">
              <button type="button" className="dialog-btn" onClick={() => fileRef.current?.click()}>
                <Upload size={13} /> Select Picture…
              </button>
              <input
                ref={fileRef}
                hidden
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (file) readImage(file, (value) => setPicture(`url("${value}") center/cover no-repeat`))
                }}
              />
              {picture && <img src={picture.slice(5, picture.indexOf('")'))} alt="Page fill preview" />}
            </div>
          )}
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" onClick={() => onApply(fill)}>OK</button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}


