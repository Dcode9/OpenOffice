import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  applyCellBorders,
  applyTableBorderEdges,
  setCellAttrs,
  updateAllTableCells,
  type TableBorderEdges,
} from '../editor/actions'

type Props = { editor: Editor; onClose: () => void }
type ShadingTab = 'borders' | 'shading'
type Setting = 'none' | 'box' | 'all' | 'grid' | 'custom'
type ApplyTo = 'table' | 'cell'

const BORDER_STYLES = ['solid', 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset']
const BORDER_WIDTHS = ['0.5pt', '0.75pt', '1pt', '1.5pt', '2.25pt', '3pt', '4.5pt', '6pt']
const SHADING_COLORS = [
  '#ffffff', '#f2f2f2', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#808080', '#595959', '#262626',
  '#d9e2f3', '#b4c6e7', '#8faadc', '#4472c4', '#2f5597', '#fbe5d6', '#f8cbad', '#ed7d31',
  '#fff2cc', '#ffe699', '#ffd966', '#ffc000', '#e2f0d9', '#c6e0b4', '#a9d08e', '#70ad47',
]

const ALL_EDGES: TableBorderEdges = {
  top: true,
  bottom: true,
  left: true,
  right: true,
  insideH: true,
  insideV: true,
}

const SETTING_EDGES: Record<Exclude<Setting, 'custom'>, TableBorderEdges> = {
  none: { top: false, bottom: false, left: false, right: false, insideH: false, insideV: false },
  box: { top: true, bottom: true, left: true, right: true, insideH: false, insideV: false },
  all: ALL_EDGES,
  grid: ALL_EDGES,
}

const LINE_META: { key: keyof TableBorderEdges; label: string }[] = [
  { key: 'top', label: 'Top border' },
  { key: 'bottom', label: 'Bottom border' },
  { key: 'left', label: 'Left border' },
  { key: 'right', label: 'Right border' },
  { key: 'insideH', label: 'Inside horizontal border' },
  { key: 'insideV', label: 'Inside vertical border' },
]

export default function BordersAndShadingDialog({ editor, onClose }: Props) {
  const [tab, setTab] = useState<ShadingTab>('borders')
  const [applyTo, setApplyTo] = useState<ApplyTo>('table')
  const [setting, setSetting] = useState<Setting>('box')
  const [edges, setEdges] = useState<TableBorderEdges>(SETTING_EDGES.box)
  const [borderStyle, setBorderStyle] = useState('solid')
  const [borderWidth, setBorderWidth] = useState('1pt')
  const [borderColor, setBorderColor] = useState('#000000')
  const [fill, setFill] = useState('#d9e2f3')

  const chooseSetting = (next: Setting) => {
    setSetting(next)
    if (next !== 'custom') setEdges(SETTING_EDGES[next])
  }

  const toggleEdge = (key: keyof TableBorderEdges) => {
    setSetting('custom')
    setEdges((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const applyBorders = () => {
    const value = `${borderWidth} ${borderStyle} ${borderColor}`
    if (applyTo === 'cell') {
      const sides = LINE_META.filter((l) => edges[l.key]).map((l) => l.key)
      applyCellBorders(editor, sides, sides.length ? value : null)
      return
    }
    applyTableBorderEdges(editor, edges, setting === 'none' ? null : value, setting !== 'custom')
  }

  const applyShading = () => {
    if (applyTo === 'cell') setCellAttrs(editor, { backgroundColor: fill })
    else updateAllTableCells(editor, { backgroundColor: fill })
  }

  return (
    <div
      className="dialog-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="word-dialog borders-shading-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Borders and Shading"
      >
        <div className="dialog-title">Borders and Shading</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button
              className={`dialog-tab${tab === 'borders' ? ' active' : ''}`}
              onClick={() => setTab('borders')}
            >
              Borders
            </button>
            <button
              className={`dialog-tab${tab === 'shading' ? ' active' : ''}`}
              onClick={() => setTab('shading')}
            >
              Shading
            </button>
          </div>

          <div className="dialog-field-label">Apply to</div>
          <select
            className="borders-apply-select"
            value={applyTo}
            onChange={(e) => setApplyTo(e.target.value as ApplyTo)}
          >
            <option value="table">Table</option>
            <option value="cell">Cell</option>
          </select>

          {tab === 'borders' ? (
            <>
              <div className="borders-columns">
                <div className="borders-setting">
                  <div className="dialog-field-label">Setting</div>
                  <div className="borders-setting-list">
                    {(['none', 'box', 'all', 'grid', 'custom'] as Setting[]).map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name="border-setting"
                          checked={setting === option}
                          onChange={() => chooseSetting(option)}
                        />
                        {option[0].toUpperCase() + option.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="borders-preview-wrap">
                  <div className="dialog-field-label">Preview</div>
                  <div className={`border-preview border-style-${borderStyle}`}>
                    <button
                      type="button"
                      className={`bp-line bp-top${edges.top ? ' on' : ''}`}
                      title="Top border"
                      onClick={() => toggleEdge('top')}
                    />
                    <button
                      type="button"
                      className={`bp-line bp-bottom${edges.bottom ? ' on' : ''}`}
                      title="Bottom border"
                      onClick={() => toggleEdge('bottom')}
                    />
                    <button
                      type="button"
                      className={`bp-line bp-left${edges.left ? ' on' : ''}`}
                      title="Left border"
                      onClick={() => toggleEdge('left')}
                    />
                    <button
                      type="button"
                      className={`bp-line bp-right${edges.right ? ' on' : ''}`}
                      title="Right border"
                      onClick={() => toggleEdge('right')}
                    />
                    <button
                      type="button"
                      className={`bp-line bp-inside-h${edges.insideH ? ' on' : ''}`}
                      title="Inside horizontal border"
                      onClick={() => toggleEdge('insideH')}
                    />
                    <button
                      type="button"
                      className={`bp-line bp-inside-v${edges.insideV ? ' on' : ''}`}
                      title="Inside vertical border"
                      onClick={() => toggleEdge('insideV')}
                    />
                    <span className="bp-sample">AaBbCc</span>
                  </div>
                </div>
              </div>

              <div className="dialog-field-label">Style</div>
              <div className="borders-style-grid">
                {BORDER_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    className={`border-style-option${borderStyle === style ? ' active' : ''}`}
                    onClick={() => setBorderStyle(style)}
                  >
                    <span className={`border-style-swatch border-style-${style}`} />
                    {style[0].toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>

              <div className="dialog-grid borders-width-grid">
                <label>Color:</label>
                <div className="dialog-inline">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                  />
                  <span className="borders-color-value">{borderColor}</span>
                </div>
                <label>Width:</label>
                <select value={borderWidth} onChange={(e) => setBorderWidth(e.target.value)}>
                  {BORDER_WIDTHS.map((width) => (
                    <option key={width} value={width}>
                      {width.replace('pt', ' pt')}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="dialog-field-label">Fill</div>
              <div className="borders-palette">
                <button
                  type="button"
                  className="borders-no-color"
                  onClick={() => setFill('transparent')}
                >
                  No Color
                </button>
                {SHADING_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`swatch${fill === color ? ' active' : ''}`}
                    style={{ background: color }}
                    title={color}
                    onClick={() => setFill(color)}
                  />
                ))}
              </div>
              <div className="dialog-inline borders-fill-row">
                <span>Color:</span>
                <input type="color" value={fill === 'transparent' ? '#ffffff' : fill} onChange={(e) => setFill(e.target.value)} />
                <span className="borders-color-value">{fill === 'transparent' ? 'No Color' : fill}</span>
              </div>
            </>
          )}
        </div>
        <div className="dialog-actions">
          <button
            className="dialog-btn primary"
            onClick={() => {
              if (tab === 'borders') applyBorders()
              else applyShading()
              onClose()
            }}
          >
            OK
          </button>
          <button className="dialog-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
