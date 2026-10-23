import { useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { getTableAttrs, setTableAttrs } from '../editor/actions'

type Props = { editor: Editor; onClose: () => void; isNew?: boolean }

const ACCENTS = ['#4472C4', '#ED7D31', '#A5A5A5', '#FFC000', '#5B9BD5', '#70AD47', '#C00000']
const FONT_CHOICES = ['Calibri', 'Aptos', 'Times New Roman', 'Arial', 'Georgia']
const BORDER_STYLES = ['Solid', 'Dashed', 'Dotted', 'Double', '3-D Groove', '3-D Ridge']
const LINE_WEIGHTS = ['¼ pt', '½ pt', '¾ pt', '1 pt', '1½ pt', '2¼ pt', '3 pt', '4½ pt', '6 pt']

export default function ModifyTableStyleDialog({ editor, onClose, isNew = false }: Props) {
  const attrs = getTableAttrs(editor)
  const [name, setName] = useState(isNew ? 'Custom Table Style' : 'Table Grid')
  const [basedOn, setBasedOn] = useState('Table Normal')
  const [applyTo, setApplyTo] = useState('Whole table')
  const [font, setFont] = useState(attrs.tableFont || 'Calibri')
  const [fontSize, setFontSize] = useState(String(attrs.tableFontSize || 11))
  const [accent, setAccent] = useState(attrs.tableAccent || '#4472C4')
  const [intensity, setIntensity] = useState(attrs.tableIntensity || 'medium')
  const [borderStyle, setBorderStyle] = useState('Solid')
  const [lineWeight, setLineWeight] = useState('1 pt')
  const [shading, setShading] = useState('#ffffff')
  const [alignment, setAlignment] = useState(attrs.tableAlign || 'left')
  const [onlyDocument, setOnlyDocument] = useState(true)
  const [headerRow, setHeaderRow] = useState(attrs.headerRow ?? true)
  const [bandedRows, setBandedRows] = useState(attrs.bandedRows ?? true)
  const [firstColumn, setFirstColumn] = useState(attrs.firstColumn ?? false)

  const preview = useMemo(
    () => ({
      fontFamily: font,
      fontSize: `${Math.max(8, Math.min(13, Number(fontSize) || 11))}px`,
    }),
    [font, fontSize],
  )

  const apply = () => {
    setTableAttrs(editor, {
      tableStyle: 'grid',
      tableAccent: accent,
      tableIntensity: intensity,
      tableAlign: alignment,
      headerRow,
      bandedRows,
      firstColumn,
      tableFont: font,
      tableFontSize: Number(fontSize) || 11,
    })
    const width = lineWeight.replace(' pt', 'pt')
    const style = borderStyle.toLowerCase().includes('3-d')
      ? borderStyle.toLowerCase().includes('groove')
        ? 'groove'
        : 'ridge'
      : borderStyle.toLowerCase()
    editor
      .chain()
      .focus()
      .setCellAttribute('cellBorderTop', `${width} ${style} ${accent}`)
      .setCellAttribute('cellBorderBottom', `${width} ${style} ${accent}`)
      .setCellAttribute('cellBorderLeft', `${width} ${style} ${accent}`)
      .setCellAttribute('cellBorderRight', `${width} ${style} ${accent}`)
      .run()
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog modify-table-dialog" role="dialog" aria-modal="true" aria-label="Modify Style">
        <div className="dialog-title">{isNew ? 'New Table Style' : 'Modify Style'}</div>
        <div className="dialog-body">
          <div className="dialog-grid modify-table-meta">
            <label>Name:</label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
            <label>Style type:</label>
            <input value="Table" disabled />
            <label>Style based on:</label>
            <select value={basedOn} onChange={(e) => setBasedOn(e.target.value)}>
              <option>Table Normal</option>
              <option>Table Grid</option>
              <option>List Table</option>
            </select>
            <label>Apply formatting to:</label>
            <select value={applyTo} onChange={(e) => setApplyTo(e.target.value)}>
              <option>Whole table</option>
              <option>Header row</option>
              <option>First column</option>
              <option>Last row</option>
              <option>Banded rows</option>
            </select>
          </div>

          <div className="dialog-subtitle">Formatting</div>
          <div className="modify-format-row">
            <select value={font} onChange={(e) => setFont(e.target.value)} style={{ width: 128 }}>
              {FONT_CHOICES.map((f) => <option key={f}>{f}</option>)}
            </select>
            <input
              className="dialog-input short"
              type="number"
              min={6}
              max={72}
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
            />
            <button className="modify-format-btn" type="button">B</button>
            <button className="modify-format-btn" type="button"><i>I</i></button>
            <button className="modify-format-btn" type="button"><u>U</u></button>
            <button className="modify-format-btn" type="button">A</button>
            <button className="modify-format-btn" type="button">¶</button>
          </div>
          <div className="modify-format-row">
            <span className="dialog-field-label">Borders:</span>
            <select value={borderStyle} onChange={(e) => setBorderStyle(e.target.value)}>
              {BORDER_STYLES.map((b) => <option key={b}>{b}</option>)}
            </select>
            <select value={lineWeight} onChange={(e) => setLineWeight(e.target.value)}>
              {LINE_WEIGHTS.map((w) => <option key={w}>{w}</option>)}
            </select>
            <select value={accent} onChange={(e) => setAccent(e.target.value)}>
              {ACCENTS.map((c, i) => <option key={c} value={c}>Accent {i + 1}</option>)}
            </select>
            <span className="dialog-field-label">Shading:</span>
            <input type="color" value={shading} onChange={(e) => setShading(e.target.value)} />
          </div>
          <div className="modify-format-row">
            <span className="dialog-field-label">Alignment:</span>
            <select value={alignment} onChange={(e) => setAlignment(e.target.value)}>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <span className="dialog-field-label">Intensity:</span>
            <select value={intensity} onChange={(e) => setIntensity(e.target.value)}>
              <option value="light">Lighter 60%</option>
              <option value="medium">Medium</option>
              <option value="dark">Darker 50%</option>
            </select>
          </div>

          <div className="modify-style-options">
            <label className="check-row"><input type="checkbox" checked={headerRow} onChange={(e) => setHeaderRow(e.target.checked)} /> Header row</label>
            <label className="check-row"><input type="checkbox" checked={bandedRows} onChange={(e) => setBandedRows(e.target.checked)} /> Banded rows</label>
            <label className="check-row"><input type="checkbox" checked={firstColumn} onChange={(e) => setFirstColumn(e.target.checked)} /> First column</label>
          </div>

          <div className="dialog-field-label">Preview</div>
          <div className="table-props-preview" style={{ height: 112 }}>
            <table style={{ background: shading }}>
              <tbody>
                {[0, 1, 2].map((row) => (
                  <tr key={row} style={{ background: row === 0 ? accent : undefined }}>
                    {[0, 1, 2].map((col) => (
                      <td
                        key={col}
                        style={{
                          ...preview,
                          color: row === 0 ? '#fff' : '#333',
                          fontWeight: row === 0 || col === 0 ? 700 : 400,
                          borderColor: accent,
                        }}
                      >
                        Aa
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="modify-radio-row">
            <label><input type="radio" checked={onlyDocument} onChange={() => setOnlyDocument(true)} /> Only in this document</label>
            <label><input type="radio" checked={!onlyDocument} onChange={() => setOnlyDocument(false)} /> New documents based on this template</label>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn" onClick={() => {}}>Format</button>
          <span style={{ flex: 1 }} />
          <button className="dialog-btn primary" onClick={apply}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
