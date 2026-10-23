import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Editor } from '@tiptap/react'
import { useWord } from '../context'
import {
  applyCellBorder,
  applyCellShading,
  applyParagraphBorder,
  applyParagraphShading,
  applyTextBorder,
  applyTextShading,
  BORDER_COLORS,
  BORDER_STYLES,
  BORDER_WIDTHS,
  borderStyleCss,
  FILL_COLORS,
  patternBackground,
  SHADING_PATTERNS,
  toHexColor,
  type BorderOptions,
  type BorderSetting,
  type BorderSide,
  type BorderStyleId,
  type ShadingPatternId,
  type TextBorderState,
} from '../editor/textEffects'
import '../styles/home-advanced.css'

type Props = {
  editor: Editor
  onClose: () => void
  initialTab?: 'borders' | 'page' | 'shading'
}

type DialogTab = 'borders' | 'page' | 'shading'
type ApplyTo = 'paragraph' | 'text' | 'cell'

const SIDES: BorderSide[] = ['top', 'bottom', 'left', 'right']

const PAGE_ART = [
  { id: 'none', label: '(none)' },
  { id: 'confetti', label: 'Confetti' },
  { id: 'zigzag', label: 'Zig Zag' },
  { id: 'chain', label: 'Chain' },
  { id: 'hearts', label: 'Hearts' },
  { id: 'forest', label: 'Forest' },
  { id: 'stars', label: 'Stars' },
] as const

type PageArtId = (typeof PAGE_ART)[number]['id']

function artImage(id: PageArtId): string {
  switch (id) {
    case 'confetti':
      return 'repeating-linear-gradient(45deg, #2f5597 0 5px, transparent 5px 11px, #c00000 11px 16px, transparent 16px 24px)'
    case 'zigzag':
      return 'repeating-linear-gradient(135deg, #2f5597 0 6px, transparent 6px 12px)'
    case 'chain':
      return 'repeating-linear-gradient(90deg, #7f7f7f 0 3px, transparent 3px 8px, #bfbfbf 8px 11px, transparent 11px 16px)'
    case 'hearts':
      return 'repeating-linear-gradient(45deg, #c00000 0 4px, transparent 4px 10px)'
    case 'forest':
      return 'repeating-linear-gradient(90deg, #375623 0 4px, transparent 4px 9px, #548235 9px 13px, transparent 13px 18px)'
    case 'stars':
      return 'repeating-linear-gradient(0deg, #bf9000 0 2px, transparent 2px 8px), repeating-linear-gradient(90deg, #bf9000 0 2px, transparent 2px 8px)'
    default:
      return ''
  }
}

function firstColor(value: unknown, fallback: string): string {
  const text = String(value || '').split(';')[0].trim()
  return toHexColor(text, fallback)
}

function numericWidth(value: unknown, fallback: number): number {
  const parsed = Number.parseFloat(String(value || ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

function styleFromValue(value: unknown): BorderStyleId {
  const text = String(value || '')
  if (/border-style:\s*outset/i.test(text)) return 'solid'
  if (/border-style:\s*double/i.test(text)) return 'double'
  if (/border-style:\s*dashed/i.test(text)) return 'dashed'
  if (/border-style:\s*dotted/i.test(text)) return 'dotted'
  return 'solid'
}

function previewShading(fill: string, pattern: ShadingPatternId, patternColor: string): CSSProperties {
  if (pattern === 'clear') return { backgroundColor: fill }
  if (pattern === 'solid') return { backgroundColor: patternColor }
  const raw = patternBackground(pattern, patternColor)
  const parts = raw.split(';').map((part) => part.trim())
  const image = parts.find((part) => part.startsWith('background-image:'))?.replace('background-image:', '').trim()
  const size = parts.find((part) => part.startsWith('background-size:'))?.replace('background-size:', '').trim()
  return { backgroundColor: fill, backgroundImage: image, backgroundSize: size }
}

function readPageVar(name: string, fallback: string): string {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback
  } catch {
    return fallback
  }
}

export default function TextBordersShadingDialog({ editor, onClose, initialTab = 'borders' }: Props) {
  const { setPageBorders } = useWord()
  const blockType = editor.isActive('heading') ? 'heading' : 'paragraph'
  const blockAttrs = editor.getAttributes(blockType) || {}
  const tableActive = editor.isActive('table')
  const initialSides = String(blockAttrs.borderSides || '')
    .split(',')
    .filter(Boolean) as BorderSide[]
  const hasBorder = initialSides.length > 0
  const initialBorderColor = firstColor(blockAttrs.borderColor, '#000000')
  const initialBorderWidth = numericWidth(blockAttrs.borderWidth, 1)
  const initialBorderStyle = styleFromValue(blockAttrs.borderColor)
  const rawBorderColor = String(blockAttrs.borderColor || '')
  const initialSetting: BorderSetting = !hasBorder
    ? 'box'
    : /box-shadow\s*:/i.test(rawBorderColor)
      ? 'shadow'
      : /border-style\s*:\s*outset/i.test(rawBorderColor)
        ? '3d'
        : initialSides.length === SIDES.length
          ? 'box'
          : 'custom'
  const initialShadingColor = firstColor(blockAttrs.shading, '#d9e2f3')

  const [tab, setTab] = useState<DialogTab>(initialTab)
  const [applyTo, setApplyTo] = useState<ApplyTo>(tableActive ? 'cell' : 'paragraph')
  const [setting, setSetting] = useState<BorderSetting>(initialSetting)
  const [sides, setSides] = useState<Record<BorderSide, boolean>>({
    top: !hasBorder || initialSides.includes('top'),
    bottom: !hasBorder || initialSides.includes('bottom'),
    left: !hasBorder || initialSides.includes('left'),
    right: !hasBorder || initialSides.includes('right'),
  })
  const [borderStyle, setBorderStyle] = useState<BorderStyleId>(initialBorderStyle)
  const [borderColor, setBorderColor] = useState(initialBorderColor)
  const [borderWidth, setBorderWidth] = useState(initialBorderWidth)
  const [borderOffset, setBorderOffset] = useState(1)
  const [measureFrom, setMeasureFrom] = useState('text')
  const [showOptions, setShowOptions] = useState(false)

  const [fill, setFill] = useState(initialShadingColor)
  const [pattern, setPattern] = useState<ShadingPatternId>('clear')
  const [patternColor, setPatternColor] = useState('#000000')

  const [pageSetting, setPageSetting] = useState<BorderSetting>(() => {
    const style = readPageVar('--wp-border-style', 'none')
    if (style === 'none') return 'box'
    if (style === 'outset') return '3d'
    if (readPageVar('--wp-border-shadow', 'none') !== 'none') return 'shadow'
    return 'box'
  })
  const [pageStyle, setPageStyle] = useState<BorderStyleId>(() => {
    const style = readPageVar('--wp-border-style', 'solid')
    const match = BORDER_STYLES.find((item) => item.css === style)
    return match?.id || 'solid'
  })
  const [pageColor, setPageColor] = useState(toHexColor(readPageVar('--wp-border-color', '#2f5496'), '#2f5496'))
  const [pageWidth, setPageWidth] = useState(numericWidth(readPageVar('--wp-border-width', '1'), 1))
  const [pageInset, setPageInset] = useState(numericWidth(readPageVar('--wp-border-inset', '18'), 18))
  const [pageArt, setPageArt] = useState<PageArtId>('none')
  const [pageApplyTo, setPageApplyTo] = useState('document')

  const chosenSides = SIDES.filter((side) => sides[side])
  const previewSides = setting === 'custom' ? chosenSides : setting === 'none' ? [] : SIDES

  const borderOptions: BorderOptions = useMemo(
    () => ({
      setting,
      sides: chosenSides,
      style: borderStyle,
      color: borderColor,
      width: borderWidth,
      offset: borderOffset,
    }),
    [setting, chosenSides, borderStyle, borderColor, borderWidth, borderOffset],
  )

  const toggleSide = (side: BorderSide) => {
    setSetting('custom')
    setSides((prev) => ({ ...prev, [side]: !prev[side] }))
  }

  const chooseSetting = (next: BorderSetting) => {
    setSetting(next)
    if (next !== 'custom') {
      const on = next !== 'none'
      setSides({ top: on, bottom: on, left: on, right: on })
    }
  }

  const applyBorder = () => {
    if (applyTo === 'text') {
      const textBorder: TextBorderState | null =
        setting === 'none'
          ? null
          : {
              setting,
              color: borderColor,
              width: borderWidth,
              style: borderStyle,
              sides: chosenSides,
              offset: borderOffset,
            }
      applyTextBorder(editor, textBorder)
      return
    }
    if (applyTo === 'cell' && tableActive) {
      applyCellBorder(editor, borderOptions)
      return
    }
    applyParagraphBorder(editor, borderOptions)
  }

  const applyShadingNow = () => {
    if (applyTo === 'text') {
      applyTextShading(editor, { color: fill, pattern, patternColor })
      return
    }
    if (applyTo === 'cell' && tableActive) {
      applyCellShading(editor, fill, pattern, patternColor)
      return
    }
    applyParagraphShading(editor, fill, pattern, patternColor)
  }

  const applyPageBorder = () => {
    const root = document.documentElement
    if (pageSetting === 'none') {
      setPageBorders(false)
      root.style.removeProperty('--wp-border-image')
      root.style.removeProperty('--wp-border-shadow')
      return
    }
    root.style.setProperty('--wp-border-width', `${pageWidth}pt`)
    root.style.setProperty('--wp-border-style', pageSetting === '3d' ? 'outset' : pageSetting === 'shadow' ? 'solid' : borderStyleCss(pageStyle))
    root.style.setProperty('--wp-border-color', pageColor)
    root.style.setProperty('--wp-border-inset', `${pageInset}px`)
    root.style.setProperty('--wp-border-shadow', pageShadow)
    const art = artImage(pageArt)
    if (art) root.style.setProperty('--wp-border-image', art)
    else root.style.removeProperty('--wp-border-image')
    setPageBorders(true)
  }

  const previewBorderStyle = (side: BorderSide): CSSProperties => {
    const property = `border${side[0].toUpperCase()}${side.slice(1)}` as keyof CSSProperties
    if (!previewSides.includes(side)) return { [property]: 'none' } as CSSProperties
    const css =
      setting === '3d'
        ? 'outset'
        : setting === 'shadow'
          ? 'solid'
          : setting === 'custom' || setting === 'box'
            ? borderStyleCss(borderStyle)
            : borderStyleCss(borderStyle)
    const value = `${Math.max(1, borderWidth)}pt ${css} ${borderColor}`
    return { [`border${side[0].toUpperCase()}${side.slice(1)}`]: value } as CSSProperties
  }

  const pageShadow =
    pageSetting === 'shadow'
      ? '6px 6px 0 rgba(0,0,0,0.4)'
      : pageSetting === '3d'
        ? 'inset 2px 2px 0 rgba(255,255,255,0.45), inset -2px -2px 0 rgba(0,0,0,0.35)'
        : 'none'
  const previewShadow =
    setting === 'shadow'
      ? '5px 5px 0 rgba(0,0,0,0.4)'
      : setting === '3d'
        ? 'inset 2px 2px 0 rgba(255,255,255,0.45), inset -2px -2px 0 rgba(0,0,0,0.35)'
        : 'none'

  const pageBorderStyle = (side: BorderSide): CSSProperties => {
    if (pageSetting === 'none') return { border: 'none' }
    const css =
      pageSetting === '3d'
        ? 'outset'
        : pageSetting === 'shadow'
          ? 'solid'
          : borderStyleCss(pageStyle)
    return {
      [`border${side[0].toUpperCase()}${side.slice(1)}`]: `${Math.max(1, pageWidth)}pt ${css} ${pageColor}`,
    } as CSSProperties
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog tas-dialog" role="dialog" aria-modal="true" aria-label="Borders and Shading">
        <div className="dialog-title">Borders and Shading</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button className={`dialog-tab${tab === 'borders' ? ' active' : ''}`} onClick={() => setTab('borders')}>Borders</button>
            <button className={`dialog-tab${tab === 'page' ? ' active' : ''}`} onClick={() => setTab('page')}>Page Border</button>
            <button className={`dialog-tab${tab === 'shading' ? ' active' : ''}`} onClick={() => setTab('shading')}>Shading</button>
          </div>

          <div className="tas-apply-row">
            {tab === 'page' ? (
              <>
                <label>Apply to:</label>
                <select value={pageApplyTo} onChange={(event) => setPageApplyTo(event.target.value)}>
                  <option value="document">Whole document</option>
                  <option value="section">This section</option>
                  <option value="first">This section - first page only</option>
                </select>
              </>
            ) : (
              <>
                <label>Apply to:</label>
                <select value={applyTo} onChange={(event) => setApplyTo(event.target.value as ApplyTo)}>
                  <option value="paragraph">Paragraph</option>
                  <option value="text">Text</option>
                  {tableActive && <option value="cell">Cell</option>}
                </select>
              </>
            )}
          </div>

          {tab !== 'shading' && (
            <div className="tas-grid">
              <div className="tas-settings">
                <div className="tas-label">Setting</div>
                <div className="tas-setting-list">
                  {(['none', 'box', 'shadow', '3d', 'custom'] as BorderSetting[]).map((option) => (
                    <label key={option}>
                      <input
                        type="radio"
                        name={tab === 'page' ? 'page-setting' : 'text-setting'}
                        checked={(tab === 'page' ? pageSetting : setting) === option}
                        onChange={() => (tab === 'page' ? setPageSetting(option) : chooseSetting(option))}
                      />
                      {option === '3d' ? '3-D' : option[0].toUpperCase() + option.slice(1)}
                    </label>
                  ))}
                </div>

                <div className="tas-label">Style</div>
                <div className="tas-style-list">
                  {BORDER_STYLES.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`tas-style-option${(tab === 'page' ? pageStyle : borderStyle) === item.id ? ' active' : ''}`}
                      onClick={() => (tab === 'page' ? setPageStyle(item.id) : setBorderStyle(item.id))}
                    >
                      <span className={`tas-style-swatch tas-style-${item.id}`} />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="tas-inline">
                  <label>Color:</label>
                  <input
                    type="color"
                    value={tab === 'page' ? pageColor : borderColor}
                    onChange={(event) => (tab === 'page' ? setPageColor(event.target.value) : setBorderColor(event.target.value))}
                  />
                  <span className="tas-value">{tab === 'page' ? pageColor : borderColor}</span>
                </div>

                <div className="tas-inline">
                  <label>Width:</label>
                  <select
                    value={String(tab === 'page' ? pageWidth : borderWidth)}
                    onChange={(event) => (tab === 'page' ? setPageWidth(Number(event.target.value)) : setBorderWidth(Number(event.target.value)))}
                  >
                    {BORDER_WIDTHS.map((width) => (
                      <option key={width} value={width}>{width} pt</option>
                    ))}
                  </select>
                </div>

                {tab === 'page' && (
                  <div className="tas-inline">
                    <label>Art:</label>
                    <select value={pageArt} onChange={(event) => setPageArt(event.target.value as PageArtId)}>
                      {PAGE_ART.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="tas-preview-wrap">
                <div className="tas-label">Preview</div>
                <div className="tas-preview-holder">
                  {tab === 'borders' ? (
                    <div
                      className="tas-preview"
                      style={{
                        ...previewBorderStyle('top'),
                        ...previewBorderStyle('bottom'),
                        ...previewBorderStyle('left'),
                        ...previewBorderStyle('right'),
                        boxShadow: previewShadow,
                      }}
                    >
                      <span>AaBbCc</span>
                      <button type="button" className="tas-edge tas-edge-top" title="Toggle top border" onClick={() => toggleSide('top')} />
                      <button type="button" className="tas-edge tas-edge-bottom" title="Toggle bottom border" onClick={() => toggleSide('bottom')} />
                      <button type="button" className="tas-edge tas-edge-left" title="Toggle left border" onClick={() => toggleSide('left')} />
                      <button type="button" className="tas-edge tas-edge-right" title="Toggle right border" onClick={() => toggleSide('right')} />
                    </div>
                  ) : (
                    <div className="tas-page-preview">
                      <div
                        className="tas-page-sheet"
                        style={{
                          ...pageBorderStyle('top'),
                          ...pageBorderStyle('bottom'),
                          ...pageBorderStyle('left'),
                          ...pageBorderStyle('right'),
                          boxShadow: pageShadow,
                        }}
                      >
                        <span>Page border preview</span>
                      </div>
                    </div>
                  )}
                </div>
                {tab === 'borders' ? (
                  <button type="button" className="tas-link" onClick={() => setShowOptions((value) => !value)}>Options…</button>
                ) : (
                  <div className="tas-page-meta">Art borders are rendered with CSS patterns.</div>
                )}
              </div>
            </div>
          )}

          {showOptions && tab === 'borders' && (
            <div className="tas-options">
              <div className="tas-inline">
                <label>Measure from:</label>
                <select value={measureFrom} onChange={(event) => setMeasureFrom(event.target.value)}>
                  <option value="text">Text</option>
                  <option value="edge">Page edge</option>
                </select>
              </div>
              <div className="tas-inline">
                <label>Offset from {measureFrom}:</label>
                <input
                  type="number"
                  min={0}
                  max={36}
                  step={1}
                  value={borderOffset}
                  onChange={(event) => setBorderOffset(Number(event.target.value) || 0)}
                />
                <span>pt</span>
              </div>
            </div>
          )}

          {tab === 'shading' && (
            <div className="tas-shading">
              <div className="tas-shading-controls">
                <div className="tas-label">Fill</div>
                <div className="tas-fill-palette">
                  <button
                    type="button"
                    className="tas-no-color"
                    onClick={() => { setFill('transparent'); setPattern('clear') }}
                  >
                    No Color
                  </button>
                  {FILL_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`tas-swatch${fill === color ? ' active' : ''}`}
                      style={{ background: color }}
                      title={color}
                      onClick={() => setFill(color)}
                    />
                  ))}
                </div>
                <div className="tas-inline">
                  <label>Color:</label>
                  <input type="color" value={fill === 'transparent' ? '#ffffff' : toHexColor(fill, '#ffffff')} onChange={(event) => setFill(event.target.value)} />
                  <span className="tas-value">{fill === 'transparent' ? 'No Color' : fill}</span>
                </div>

                <div className="tas-label">Patterns</div>
                <div className="tas-inline">
                  <label>Style:</label>
                  <select value={pattern} onChange={(event) => setPattern(event.target.value as ShadingPatternId)}>
                    {SHADING_PATTERNS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </div>
                <div className="tas-inline">
                  <label>Color:</label>
                  <input type="color" value={toHexColor(patternColor)} onChange={(event) => setPatternColor(event.target.value)} />
                  <span className="tas-value">{patternColor}</span>
                </div>
              </div>

              <div className="tas-shading-preview-wrap">
                <div className="tas-label">Preview</div>
                <div className="tas-shading-preview">
                  <div className="tas-shading-swatch" style={previewShading(fill, pattern, patternColor)}>
                    <span>AaBbCc 123</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dialog-actions">
          <button
            className="dialog-btn primary"
            onClick={() => {
              if (tab === 'borders') applyBorder()
              else if (tab === 'page') applyPageBorder()
              else applyShadingNow()
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
