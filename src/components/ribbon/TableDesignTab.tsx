import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Eraser,
  Grid3x3,
  PaintBucket,
  Paintbrush,
  PenLine,
  Table2,
} from 'lucide-react'
import { useWord } from '../../context'
import { MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, SmallButton } from './ui'
import {
  applyCellBorders,
  applyTableStyle,
  clearTableStyle,
  getTableAttrs,
  setCellAttrs,
  setTableAttrs,
  updateAllTableCells,
} from '../../editor/actions'
import { TEXT_COLORS } from '../../lib/constants'
import ModifyTableStyleDialog from '../ModifyTableStyleDialog'
import BordersAndShadingDialog from '../BordersAndShadingDialog'

const ACCENTS = [
  { name: 'Blue', value: '#4472C4' },
  { name: 'Orange', value: '#ED7D31' },
  { name: 'Gray', value: '#A5A5A5' },
  { name: 'Gold', value: '#FFC000' },
  { name: 'Light Blue', value: '#5B9BD5' },
  { name: 'Green', value: '#70AD47' },
  { name: 'Red', value: '#C00000' },
]

const INTENSITIES = [
  { id: 'light', label: 'Lighter 60%' },
  { id: 'medium', label: 'Medium' },
  { id: 'dark', label: 'Darker 50%' },
]

const BORDER_STYLES = [
  { id: 'solid', label: 'Solid' },
  { id: 'dashed', label: 'Dashed' },
  { id: 'dotted', label: 'Dotted' },
  { id: 'double', label: 'Double' },
  { id: 'groove', label: '3-D Groove' },
  { id: 'ridge', label: '3-D Ridge' },
  { id: 'inset', label: '3-D Inset' },
  { id: 'outset', label: '3-D Outset' },
]

const LINE_WEIGHTS = ['¼ pt', '½ pt', '¾ pt', '1 pt', '1½ pt', '2¼ pt', '3 pt', '4½ pt', '6 pt']

const SHADING_COLORS = [
  '#f2f2f2', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#808080', '#595959', '#404040', '#262626', '#0d0d0d', '#ffffff',
  '#e7e6e6', '#d0cece', '#aeaeb2', '#767171', '#3a3838', '#181717', '#4472c4', '#d9e2f3', '#b4c6e7', '#8faadc',
  '#ed7d31', '#fbe5d6', '#f8cbad', '#f4b084', '#a5a5a5', '#ededed', '#dbdbdb', '#c9c9c9', '#ffc000', '#fff2cc',
  '#ffe699', '#ffd966', '#5b9bd5', '#deebf7', '#bdd7ee', '#9dc3e6', '#70ad47', '#e2f0d9', '#c6e0b4', '#a9d08e',
  '#c00000', '#f4cccc', '#ea9999', '#d96262', '#7030a0', '#e4d5ec', '#c9a7d8', '#aa78bd', '#833c00', '#fce4d6',
]

const hexToRgba = (hex: string, alpha: number) => {
  const clean = hex.replace('#', '')
  const value = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const n = Number.parseInt(value, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function BigMenu({
  icon,
  label,
  width = 230,
  children,
}: {
  icon: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={label}>
          <span className="rb-big-icon">{icon}</span>
          <span className="rb-big-label">{label}</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {children}
    </Popover>
  )
}

function TableStylePreview({ accent, intensity, kind }: { accent: string; intensity: string; kind: string }) {
  const headerAlpha = intensity === 'light' ? 0.18 : intensity === 'dark' ? 0.62 : 0.32
  const bandAlpha = intensity === 'light' ? 0.08 : intensity === 'dark' ? 0.22 : 0.14
  return (
    <div className="table-style-preview" style={{ borderColor: kind === 'plain' ? '#d8d8d8' : accent }}>
      {[0, 1, 2].map((row) => (
        <div className="tsp-row" key={row}>
          {[0, 1, 2].map((col) => {
            const banded = kind === 'grid' && row > 0 && row % 2 === 1
            const background =
              kind === 'plain'
                ? '#fff'
                : row === 0
                  ? hexToRgba(accent, headerAlpha)
                  : banded
                    ? hexToRgba(accent, bandAlpha)
                    : '#fff'
            return (
              <span
                className="tsp-cell"
                key={col}
                style={{
                  background,
                  borderRight: kind === 'list' ? 'none' : undefined,
                  borderTop: kind === 'list' && row === 0 ? `2px solid ${accent}` : undefined,
                  borderBottom: kind === 'list' ? `1px solid ${hexToRgba(accent, 0.45)}` : undefined,
                }}
              >
                {row === 0 ? 'Aa' : 'Aa'}
              </span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function TableDesignTab() {
  const { editor, toast } = useWord()
  const [borderStyle, setBorderStyle] = useState('solid')
  const [lineWeight, setLineWeight] = useState('1 pt')
  const [penColor, setPenColor] = useState('#000000')
  const [shadingColor, setShadingColor] = useState('#ffffff')
  const [painter, setPainter] = useState(false)
  const [showModify, setShowModify] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showBorders, setShowBorders] = useState(false)
  const stripRef = useRef<HTMLDivElement | null>(null)

  const attrs = editor ? getTableAttrs(editor) : {}

  useEffect(() => {
    if (!painter || !editor) return
    document.body.classList.add('border-painter-active')
    const apply = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const cell = target?.closest('td, th') as HTMLElement | null
      if (!cell || !editor.view.dom.contains(cell)) return
      event.preventDefault()
      event.stopPropagation()
      const pos = editor.view.posAtDOM(cell, 0)
      const value = `${lineWeight.replace(' pt', 'pt')} ${borderStyle} ${penColor}`
      editor
        .chain()
        .focus()
        .setTextSelection(pos)
        .setCellAttribute('cellBorderTop', value)
        .setCellAttribute('cellBorderBottom', value)
        .setCellAttribute('cellBorderLeft', value)
        .setCellAttribute('cellBorderRight', value)
        .run()
    }
    document.addEventListener('mousedown', apply, true)
    return () => {
      document.body.classList.remove('border-painter-active')
      document.removeEventListener('mousedown', apply, true)
    }
  }, [painter, editor, borderStyle, lineWeight, penColor])

  if (!editor) return null

  const borderValue = `${lineWeight.replace(' pt', 'pt')} ${borderStyle} ${penColor}`
  const options: [string, string][] = [
    ['headerRow', 'Header Row'],
    ['totalRow', 'Total Row'],
    ['bandedRows', 'Banded Rows'],
    ['firstColumn', 'First Column'],
    ['lastColumn', 'Last Column'],
    ['bandedColumns', 'Banded Columns'],
  ]

  const toggleOption = (key: string) => {
    const current = attrs[key] ?? (key === 'headerRow' || key === 'bandedRows')
    setTableAttrs(editor, { [key]: !current })
  }

  const applyBorder = (sides: string[], value: string | null, wholeTable = false) => {
    applyCellBorders(editor, sides, value, wholeTable)
    toast(value ? 'Borders applied' : 'Borders removed')
  }

  return (
    <>
      <RibbonGroup label="Table Style Options" className="table-design-options">
        <div className="table-options-ribbon">
          {options.map(([key, label]) => (
            <label className="check-row" key={key}>
              <input
                type="checkbox"
                checked={Boolean(attrs[key] ?? (key === 'headerRow' || key === 'bandedRows'))}
                onChange={() => toggleOption(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </RibbonGroup>

      <RibbonGroup
        label="Table Styles"
        className="table-styles-group"
        launcher={{ title: 'Modify Table Style', onClick: () => setShowModify(true) }}
      >
        <div className="table-styles-inline">
          <div className="table-styles-strip" ref={stripRef}>
            <button
              className={`table-style-card compact${attrs.tableStyle === 'plain' ? ' active' : ''}`}
              title="Table Grid"
              type="button"
              onClick={() => applyTableStyle(editor, 'plain', '#000000', 'medium')}
            >
              <TableStylePreview accent="#000000" intensity="light" kind="plain" />
            </button>
            {ACCENTS.map((accent) =>
              INTENSITIES.map((intensity) => (
                <button
                  key={`${accent.name}-${intensity.id}`}
                  className={`table-style-card compact${
                    attrs.tableStyle === 'grid' &&
                    attrs.tableAccent === accent.value &&
                    attrs.tableIntensity === intensity.id
                      ? ' active'
                      : ''
                  }`}
                  title={`Grid, ${accent.name}, ${intensity.label}`}
                  type="button"
                  onClick={() => applyTableStyle(editor, 'grid', accent.value, intensity.id)}
                >
                  <TableStylePreview
                    accent={accent.value}
                    intensity={intensity.id}
                    kind="grid"
                  />
                </button>
              )),
            )}
            {ACCENTS.slice(0, 4).map((accent) => (
              <button
                key={`list-${accent.name}`}
                className={`table-style-card compact${
                  attrs.tableStyle === 'list' && attrs.tableAccent === accent.value ? ' active' : ''
                }`}
                title={`List Table, ${accent.name}`}
                type="button"
                onClick={() => applyTableStyle(editor, 'list', accent.value, 'medium')}
              >
                <TableStylePreview accent={accent.value} intensity="medium" kind="list" />
              </button>
            ))}
          </div>
          <div className="table-styles-more">
            <button
              className="ribbon-scroll-btn"
              type="button"
              title="Scroll up"
              onClick={() => stripRef.current?.scrollBy({ top: -32, behavior: 'smooth' })}
            >
              ▴
            </button>
            <button
              className="ribbon-scroll-btn"
              type="button"
              title="Scroll down"
              onClick={() => stripRef.current?.scrollBy({ top: 32, behavior: 'smooth' })}
            >
              ▾
            </button>
            <Popover
              width={210}
              trigger={({ toggle }) => (
                <button className="ribbon-more-btn" type="button" title="More" onClick={toggle}>
                  <span className="rb-caret" />
                </button>
              )}
            >
              {(close) => (
                <div className="menu">
                  <MenuItem label="Clear" onClick={() => { clearTableStyle(editor); toast('Table style cleared'); close() }} />
                  <MenuItem label="New Table Style…" onClick={() => { setShowNew(true); close() }} />
                  <MenuItem label="Modify Table Style…" onClick={() => { setShowModify(true); close() }} />
                </div>
              )}
            </Popover>
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup
        label="Borders"
        className="table-borders-group"
        launcher={{ title: 'Borders and Shading', onClick: () => setShowBorders(true) }}
      >
        <BigMenu icon={<PaintBucket size={22} />} label="Shading" width={220}>
          {(close) => (
            <div>
              <MenuLabel>Theme Colors</MenuLabel>
              <div className="table-palette">
                {SHADING_COLORS.map((color) => (
                  <button
                    key={color}
                    className="swatch"
                    title={color}
                    type="button"
                    style={{ background: color }}
                    onClick={() => {
                      setShadingColor(color)
                      setCellAttrs(editor, { backgroundColor: color })
                      toast('Shading applied')
                      close()
                    }}
                  />
                ))}
              </div>
              <MenuSep />
              <MenuItem
                label="No Color"
                onClick={() => {
                  setCellAttrs(editor, { backgroundColor: null })
                  close()
                }}
              />
              <MenuItem
                label="Apply to Table"
                onClick={() => {
                  updateAllTableCells(editor, { backgroundColor: shadingColor })
                  close()
                }}
              />
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<Paintbrush size={22} />} label="Border Styles" width={210}>
          {(close) => (
            <div className="menu">
              <MenuLabel>Border Styles</MenuLabel>
              {BORDER_STYLES.map((style) => (
                <MenuItem
                  key={style.id}
                  label={style.label}
                  active={borderStyle === style.id}
                  onClick={() => {
                    setBorderStyle(style.id)
                    close()
                  }}
                />
              ))}
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<PenLine size={22} />} label="Line Weight" width={160}>
          {(close) => (
            <div className="menu">
              <MenuLabel>Line Weight</MenuLabel>
              {LINE_WEIGHTS.map((weight) => (
                <MenuItem
                  key={weight}
                  label={weight}
                  active={lineWeight === weight}
                  onClick={() => {
                    setLineWeight(weight)
                    close()
                  }}
                />
              ))}
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<PenLine size={22} />} label="Pen Color" width={220}>
          {(close) => (
            <div>
              <MenuLabel>Pen Color</MenuLabel>
              <div className="table-palette">
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    className="swatch"
                    title={color}
                    type="button"
                    style={{ background: color }}
                    onClick={() => {
                      setPenColor(color)
                      close()
                    }}
                  />
                ))}
              </div>
              <MenuSep />
              <MenuItem label="Automatic" onClick={() => { setPenColor('#000000'); close() }} />
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<Grid3x3 size={22} />} label="Borders" width={230}>
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Bottom Border"
                onClick={() => { applyBorder(['bottom'], borderValue); close() }}
              />
              <MenuItem
                label="Top Border"
                onClick={() => { applyBorder(['top'], borderValue); close() }}
              />
              <MenuItem
                label="Left Border"
                onClick={() => { applyBorder(['left'], borderValue); close() }}
              />
              <MenuItem
                label="Right Border"
                onClick={() => { applyBorder(['right'], borderValue); close() }}
              />
              <MenuSep />
              <MenuItem
                label="No Border"
                onClick={() => { applyBorder(['top', 'bottom', 'left', 'right'], null); close() }}
              />
              <MenuItem
                label="All Borders"
                onClick={() => { applyBorder(['top', 'bottom', 'left', 'right'], borderValue, true); close() }}
              />
              <MenuItem
                label="Outside Borders"
                onClick={() => { applyBorder(['top', 'bottom', 'left', 'right'], borderValue, true); close() }}
              />
              <MenuItem
                label="Inside Horizontal Border"
                onClick={() => { applyBorder(['top'], borderValue, true); close() }}
              />
              <MenuItem
                label="Inside Vertical Border"
                onClick={() => { applyBorder(['left'], borderValue, true); close() }}
              />
              <MenuSep />
              <MenuItem label="Borders and Shading…" onClick={() => { setShowBorders(true); close() }} />
            </div>
          )}
        </BigMenu>

        <SmallButton
          icon={<Paintbrush size={16} />}
          label="Border Painter"
          wide
          active={painter}
          onClick={() => setPainter(!painter)}
        />
      </RibbonGroup>

      {showModify && <ModifyTableStyleDialog editor={editor} onClose={() => setShowModify(false)} />}
      {showNew && (
        <ModifyTableStyleDialog editor={editor} onClose={() => setShowNew(false)} isNew />
      )}
      {showBorders && (
        <BordersAndShadingDialog editor={editor} onClose={() => setShowBorders(false)} />
      )}
    </>
  )
}
