import { useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  currentTableInfo,
  getTableAttrs,
  setCellAttrs,
  setColumnWidthAtCursor,
  setRowHeightAtCursor,
  setTableAttrs,
} from '../editor/actions'

type Props = { editor: Editor; onClose: () => void }
type Tab = 'table' | 'row' | 'column' | 'cell'

export default function TablePropertiesDialog({ editor, onClose }: Props) {
  const tableAttrs = getTableAttrs(editor)
  const cellAttrs = { ...editor.getAttributes('tableHeader'), ...editor.getAttributes('tableCell') }
  const tableEl = editor.view.dom.querySelector('table')
  const renderedWidth = Math.round(tableEl?.getBoundingClientRect().width || 0)
  const renderedCellWidth = Math.round(
    tableEl?.querySelector('td, th')?.getBoundingClientRect().width || 0,
  )
  const storedWidth = tableAttrs.tableWidth ? String(tableAttrs.tableWidth) : ''
  const [tab, setTab] = useState<Tab>('table')
  const [width, setWidth] = useState(
    storedWidth && storedWidth !== 'auto'
      ? String(Number.parseFloat(storedWidth) || renderedWidth)
      : String(renderedWidth || 600),
  )
  const [widthUnit, setWidthUnit] = useState(storedWidth.includes('%') ? '%' : 'px')
  const [align, setAlign] = useState(tableAttrs.tableAlign || 'left')
  const [indent, setIndent] = useState('0')
  const [rowHeight, setRowHeight] = useState(String(cellAttrs.cellRowHeight || ''))
  const [allowBreak, setAllowBreak] = useState(true)
  const [repeatHeader, setRepeatHeader] = useState(
    Boolean(tableAttrs.headerRow) ||
      currentTableInfo(editor)?.node.firstChild?.firstChild?.type.name === 'tableHeader',
  )
  const [columnWidth, setColumnWidth] = useState(
    String(
      Array.isArray(cellAttrs.colwidth) && cellAttrs.colwidth.length
        ? cellAttrs.colwidth[0]
        : renderedCellWidth || 120,
    ),
  )
  const [verticalAlign, setVerticalAlign] = useState(cellAttrs.cellVerticalAlign || 'top')
  const [marginTop, setMarginTop] = useState(
    String(Math.round(((Number(cellAttrs.cellPadding) || 5.76) / 72) * 100) / 100),
  )
  const [marginBottom, setMarginBottom] = useState(marginTop)
  const [marginLeft, setMarginLeft] = useState(marginTop)
  const [marginRight, setMarginRight] = useState(marginTop)
  const [wrapText, setWrapText] = useState(true)

  const preview = useMemo(
    () => ({
      width: `${width}${widthUnit}`,
      marginLeft: `${Number(indent) || 0}in`,
      marginRight: align === 'center' ? 'auto' : align === 'right' ? '0' : 'auto',
    }),
    [width, widthUnit, indent, align],
  )

  const apply = () => {
    if (tab === 'table') {
      setTableAttrs(editor, {
        tableWidth: `${width}${widthUnit}`,
        tableAlign: align,
      })
      onClose()
      return
    }
    if (tab === 'row') {
      if (rowHeight) setRowHeightAtCursor(editor, rowHeight)
      if (repeatHeader !== (tableAttrs.headerRow ?? true)) {
        setTableAttrs(editor, { headerRow: repeatHeader })
      }
      onClose()
      return
    }
    if (tab === 'column') {
      setColumnWidthAtCursor(editor, Number(columnWidth) || 120)
      onClose()
      return
    }
    const paddingPt = Math.round((Number(marginLeft) || 0) * 72 * 100) / 100
    setCellAttrs(editor, {
      colwidth: [Number(columnWidth) || 120],
      cellVerticalAlign: verticalAlign,
      cellPadding: String(paddingPt),
    })
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog table-properties-dialog" role="dialog" aria-modal="true" aria-label="Table Properties">
        <div className="dialog-title">Table Properties</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button className={`dialog-tab${tab === 'table' ? ' active' : ''}`} onClick={() => setTab('table')}>Table</button>
            <button className={`dialog-tab${tab === 'row' ? ' active' : ''}`} onClick={() => setTab('row')}>Row</button>
            <button className={`dialog-tab${tab === 'column' ? ' active' : ''}`} onClick={() => setTab('column')}>Column</button>
            <button className={`dialog-tab${tab === 'cell' ? ' active' : ''}`} onClick={() => setTab('cell')}>Cell</button>
          </div>

          {tab === 'table' && (
            <>
              <div className="dialog-subtitle">Size</div>
              <div className="dialog-grid">
                <label>Preferred width:</label>
                <div className="dialog-inline">
                  <input type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value)} />
                  <select value={widthUnit} onChange={(e) => setWidthUnit(e.target.value)}>
                    <option value="px">px</option>
                    <option value="%">%</option>
                  </select>
                </div>
                <label>Alignment:</label>
                <select value={align} onChange={(e) => setAlign(e.target.value)}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
                <label>Indent from left:</label>
                <div className="dialog-inline">
                  <input type="number" step="0.1" value={indent} onChange={(e) => setIndent(e.target.value)} />
                  <span>in</span>
                </div>
              </div>
              <div className="dialog-subtitle">Text wrapping</div>
              <div className="dialog-radio-list">
                <label><input type="radio" name="wrap" defaultChecked /> None</label>
                <label><input type="radio" name="wrap" /> Around</label>
              </div>
              <div className="dialog-field-label">Preview</div>
              <div className="table-props-preview">
                <table style={preview}>
                  <tbody>
                    <tr><td>Aa</td><td>Aa</td><td>Aa</td></tr>
                    <tr><td>Aa</td><td>Aa</td><td>Aa</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'row' && (
            <>
              <div className="dialog-subtitle">Size</div>
              <div className="dialog-grid">
                <label>Row height:</label>
                <div className="dialog-inline">
                  <input type="number" step="0.05" value={rowHeight} onChange={(e) => setRowHeight(e.target.value)} />
                  <span>pt</span>
                </div>
                <label>Row height is:</label>
                <select defaultValue="At least">
                  <option>At least</option>
                  <option>Exactly</option>
                </select>
              </div>
              <div className="dialog-subtitle">Options</div>
              <label className="check-row"><input type="checkbox" checked={allowBreak} onChange={(e) => setAllowBreak(e.target.checked)} /> Allow row to break across pages</label>
              <label className="check-row"><input type="checkbox" checked={repeatHeader} onChange={(e) => setRepeatHeader(e.target.checked)} /> Repeat as header row at the top of each page</label>
            </>
          )}

          {tab === 'column' && (
            <>
              <div className="dialog-subtitle">Size</div>
              <div className="dialog-grid">
                <label>Preferred width:</label>
                <div className="dialog-inline">
                  <input type="number" min={1} value={columnWidth} onChange={(e) => setColumnWidth(e.target.value)} />
                  <span>px</span>
                </div>
              </div>
              <div className="dialog-field-label">Preview</div>
              <div className="table-props-preview">
                <table>
                  <tbody>
                    <tr><td>Aa</td><td style={{ background: '#dbe5f1' }}>Aa</td><td>Aa</td></tr>
                    <tr><td>Aa</td><td style={{ background: '#dbe5f1' }}>Aa</td><td>Aa</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'cell' && (
            <>
              <div className="dialog-subtitle">Size</div>
              <div className="dialog-grid">
                <label>Preferred width:</label>
                <div className="dialog-inline">
                  <input type="number" value={columnWidth} onChange={(e) => setColumnWidth(e.target.value)} />
                  <span>px</span>
                </div>
              </div>
              <div className="dialog-subtitle">Vertical alignment</div>
              <select value={verticalAlign} onChange={(e) => setVerticalAlign(e.target.value)}>
                <option value="top">Top</option>
                <option value="middle">Center</option>
                <option value="bottom">Bottom</option>
              </select>
              <div className="dialog-subtitle">Options</div>
              <label className="check-row"><input type="checkbox" checked={wrapText} onChange={(e) => setWrapText(e.target.checked)} /> Wrap text</label>
              <div className="dialog-field-label">Cell margins</div>
              <div className="dialog-grid cell-margin-grid">
                <label>Top:</label><input type="number" step="0.01" value={marginTop} onChange={(e) => setMarginTop(e.target.value)} />
                <label>Bottom:</label><input type="number" step="0.01" value={marginBottom} onChange={(e) => setMarginBottom(e.target.value)} />
                <label>Left:</label><input type="number" step="0.01" value={marginLeft} onChange={(e) => setMarginLeft(e.target.value)} />
                <label>Right:</label><input type="number" step="0.01" value={marginRight} onChange={(e) => setMarginRight(e.target.value)} />
              </div>
            </>
          )}
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={apply}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
