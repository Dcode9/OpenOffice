import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  BORDER_COLORS,
  BORDER_STYLES,
  BORDER_WIDTHS,
  type BorderStyleId,
} from '../../editor/textEffects'
import { PAGE_BORDER_ART } from './data'
import type { PageBorderConfig, PageBorderSetting, PageBorderSide } from './types'

const SIDES: PageBorderSide[] = ['top', 'bottom', 'left', 'right']

function styleIdFromCss(css: string): BorderStyleId {
  return BORDER_STYLES.find((item) => item.css === css)?.id || 'solid'
}

export default function PageBordersDialog({
  initial,
  onApply,
  onClose,
}: {
  initial: PageBorderConfig
  onApply: (config: PageBorderConfig) => void
  onClose: () => void
}) {
  const [setting, setSetting] = useState<PageBorderSetting>(initial.setting)
  const [style, setStyle] = useState<BorderStyleId>(styleIdFromCss(initial.style))
  const [color, setColor] = useState(initial.color)
  const [width, setWidth] = useState(initial.width)
  const [art, setArt] = useState(initial.art)
  const [inset, setInset] = useState(initial.inset)
  const [sides, setSides] = useState<Record<PageBorderSide, boolean>>({ ...initial.sides })
  const [showOptions, setShowOptions] = useState(false)
  const [measureFrom, setMeasureFrom] = useState('edge')
  const [alwaysFront, setAlwaysFront] = useState(false)
  const [surround, setSurround] = useState(false)

  const css = BORDER_STYLES.find((item) => item.id === style)?.css || 'solid'
  const artImage = PAGE_BORDER_ART.find((item) => item.id === art)?.image || ''
  const activeSides = setting === 'custom' ? sides : { top: true, right: true, bottom: true, left: true }
  const shadow =
    setting === 'shadow'
      ? '6px 6px 0 rgba(0,0,0,0.4)'
      : setting === '3d'
        ? 'inset 2px 2px 0 rgba(255,255,255,0.45), inset -2px -2px 0 rgba(0,0,0,0.35)'
        : 'none'
  const lineCss = setting === '3d' ? 'outset' : setting === 'shadow' ? 'solid' : css

  const chooseSetting = (next: PageBorderSetting) => {
    setSetting(next)
    if (next === 'box' || next === 'shadow' || next === '3d') {
      setSides({ top: true, right: true, bottom: true, left: true })
    }
  }

  const toggleSide = (side: PageBorderSide) => {
    setSetting('custom')
    setSides((prev) => ({ ...prev, [side]: !prev[side] }))
  }

  const previewStyle = useMemo(() => {
    if (setting === 'none') return { border: 'none' } as CSSProperties
    const value = `${Math.max(1, width)}pt ${lineCss} ${color}`
    return {
      borderTop: activeSides.top ? value : 'none',
      borderRight: activeSides.right ? value : 'none',
      borderBottom: activeSides.bottom ? value : 'none',
      borderLeft: activeSides.left ? value : 'none',
      borderImage: artImage ? `${artImage} 30 round` : undefined,
      boxShadow: shadow,
      padding: `${Math.max(6, inset / 2)}px`,
    } as CSSProperties
  }, [setting, width, lineCss, color, activeSides, artImage, shadow, inset])

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog ds-pb-dialog" role="dialog" aria-modal="true" aria-label="Borders and Shading">
        <div className="dialog-title">Borders and Shading</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <span className="dialog-tab">Borders</span>
            <span className="dialog-tab active">Page Border</span>
            <span className="dialog-tab">Shading</span>
          </div>
          <div className="ds-pb-grid">
            <div>
              <div className="ds-dialog-section-title">Setting</div>
              <div className="ds-pb-settings">
                {(['none', 'box', 'shadow', '3d', 'custom'] as PageBorderSetting[]).map((value) => (
                  <label key={value}>
                    <input type="radio" name="pb-setting" checked={setting === value} onChange={() => chooseSetting(value)} />
                    {value === 'none' ? 'None' : value === 'box' ? 'Box' : value === 'shadow' ? 'Shadow' : value === '3d' ? '3-D' : 'Custom'}
                  </label>
                ))}
              </div>

              <div className="ds-dialog-section-title">Style</div>
              <div className="ds-style-list">
                {BORDER_STYLES.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={style === item.id ? 'active' : ''}
                    onClick={() => {
                      setStyle(item.id)
                      if (setting === 'none') setSetting('box')
                    }}
                  >
                    <span style={{ borderTop: `2px ${item.css} ${color}` }} />
                    <em>{item.label}</em>
                  </button>
                ))}
              </div>

              <div className="ds-dialog-row">
                <label>Color</label>
                <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
                <select value={width} onChange={(event) => setWidth(Number(event.target.value))}>
                  {BORDER_WIDTHS.map((value) => <option key={value} value={value}>{value} pt</option>)}
                </select>
              </div>
              <div className="ds-color-strip">
                {BORDER_COLORS.map((value) => (
                  <button type="button" key={value} style={{ background: value }} title={value} onClick={() => setColor(value)} />
                ))}
              </div>

              <div className="ds-dialog-row">
                <label>Art</label>
                <select value={art} onChange={(event) => setArt(event.target.value)}>
                  {PAGE_BORDER_ART.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              <div className="ds-dialog-row">
                <label>Width</label>
                <input type="number" min={1} max={31} value={width} onChange={(event) => setWidth(Number(event.target.value))} style={{ width: 56 }} /> pt
              </div>
              <div className="ds-dialog-row">
                <label>Inset</label>
                <input type="number" min={0} max={31} value={inset} onChange={(event) => setInset(Number(event.target.value))} style={{ width: 56 }} /> px
              </div>

              <button type="button" className="ds-pb-options-toggle" onClick={() => setShowOptions((prev) => !prev)}>
                {showOptions ? '▾' : '▸'} Options
              </button>
              {showOptions && (
                <div className="ds-pb-options">
                  <div className="ds-dialog-row">
                    <label>Measure from</label>
                    <select value={measureFrom} onChange={(event) => setMeasureFrom(event.target.value)}>
                      <option value="edge">Edge of page</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <label className="ds-check-row"><input type="checkbox" checked={alwaysFront} onChange={(event) => setAlwaysFront(event.target.checked)} /> Always display in front</label>
                  <label className="ds-check-row"><input type="checkbox" checked={surround} onChange={(event) => setSurround(event.target.checked)} /> Surround header</label>
                  <label className="ds-check-row"><input type="checkbox" checked={surround} onChange={(event) => setSurround(event.target.checked)} /> Surround footer</label>
                </div>
              )}
            </div>

            <div className="ds-pb-preview-col">
              <div className="ds-pb-preview-sheet" style={previewStyle}>
                <div className="ds-pb-preview-lines" />
              </div>
              <div className="ds-pb-side-toggles">
                {SIDES.map((side) => (
                  <button
                    type="button"
                    key={side}
                    className={activeSides[side] && setting !== 'none' ? 'active' : ''}
                    onClick={() => toggleSide(side)}
                  >
                    {side[0].toUpperCase() + side.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button
            type="button"
            className="dialog-btn primary"
            onClick={() =>
              onApply({
                setting,
                style: setting === '3d' ? 'outset' : setting === 'shadow' ? 'solid' : css,
                color,
                width,
                art,
                inset,
                sides: setting === 'custom' ? sides : { top: true, right: true, bottom: true, left: true },
                shadow,
              })
            }
          >
            OK
          </button>
          <button type="button" className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
