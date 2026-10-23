import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { TableMap } from '@tiptap/pm/tables'
import { currentTableInfo, currentCellPosition } from '../editor/actions'

type Props = {
  editor: Editor
  onClose: () => void
}

const NUMBER_FORMATS = [
  '',
  '0',
  '0.00',
  '#,##0',
  '#,##0.00',
  '$#,##0.00;($#,##0.00)',
  '0%',
  '0.00%',
]

const FUNCTIONS = [
  'SUM',
  'AVERAGE',
  'COUNT',
  'MAX',
  'MIN',
  'PRODUCT',
  'ROUND',
  'ABS',
  'INT',
]

function evaluateTableFormula(editor: Editor, formula: string, format: string): string {
  const match = formula.trim().match(/^=\s*([A-Za-z]+)\s*\(\s*([A-Za-z]+)?\s*\)$/i)
  if (!match) {
    return formula
  }
  const fn = match[1].toUpperCase()
  const direction = (match[2] || 'ABOVE').toUpperCase()

  const info = currentTableInfo(editor)
  const cellPos = currentCellPosition(editor)
  if (!info || cellPos === null) return formula

  const map = TableMap.get(info.node)
  const cellIndex = map.map.indexOf(cellPos - (info.pos + 1))
  if (cellIndex === -1) return formula

  const targetRow = Math.floor(cellIndex / map.width)
  const targetCol = cellIndex % map.width

  const numbers: number[] = []

  if (direction === 'ABOVE') {
    for (let r = 0; r < targetRow; r++) {
      const pos = map.map[r * map.width + targetCol]
      const node = info.node.nodeAt(pos)
      if (node) {
        const text = node.textContent.trim().replace(/[^0-9.-]/g, '')
        const num = parseFloat(text)
        if (!isNaN(num)) numbers.push(num)
      }
    }
  } else if (direction === 'LEFT') {
    for (let c = 0; c < targetCol; c++) {
      const pos = map.map[targetRow * map.width + c]
      const node = info.node.nodeAt(pos)
      if (node) {
        const text = node.textContent.trim().replace(/[^0-9.-]/g, '')
        const num = parseFloat(text)
        if (!isNaN(num)) numbers.push(num)
      }
    }
  }

  if (numbers.length === 0) {
    return formula
  }

  let result = 0
  switch (fn) {
    case 'SUM':
      result = numbers.reduce((a, b) => a + b, 0)
      break
    case 'AVERAGE':
      result = numbers.reduce((a, b) => a + b, 0) / numbers.length
      break
    case 'COUNT':
      result = numbers.length
      break
    case 'MAX':
      result = Math.max(...numbers)
      break
    case 'MIN':
      result = Math.min(...numbers)
      break
    case 'PRODUCT':
      result = numbers.reduce((a, b) => a * b, 1)
      break
    default:
      return formula
  }

  if (format === '0') return String(Math.round(result))
  if (format === '0.00') return result.toFixed(2)
  if (format === '#,##0') return Math.round(result).toLocaleString('en-US')
  if (format === '#,##0.00') {
    return result.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  if (format === '0%') return `${Math.round(result * 100)}%`
  if (format === '0.00%') return `${(result * 100).toFixed(2)}%`
  if (format.includes('$')) {
    return `$${result.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return Number.isInteger(result) ? String(result) : String(Number(result.toFixed(2)))
}

export default function TableFormulaDialog({ editor, onClose }: Props) {
  const [formula, setFormula] = useState('=SUM(ABOVE)')
  const [numberFormat, setNumberFormat] = useState('')

  const handlePasteFunction = (fn: string) => {
    if (!fn) return
    setFormula(`=${fn}(ABOVE)`)
  }

  const handleApply = () => {
    const val = evaluateTableFormula(editor, formula, numberFormat)
    editor.chain().focus().insertContent(val).run()
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="word-dialog formula-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Formula"
        style={{ width: 380 }}
      >
        <div className="dialog-title">Formula</div>
        <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>
              Formula:
            </label>
            <input
              type="text"
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px',
                background: '#1a1a1a',
                border: '1px solid #444',
                color: '#fff',
                borderRadius: 3,
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>
              Number format:
            </label>
            <select
              value={numberFormat}
              onChange={(e) => setNumberFormat(e.target.value)}
              style={{
                width: '100%',
                padding: '5px 8px',
                background: '#1a1a1a',
                border: '1px solid #444',
                color: '#fff',
                borderRadius: 3,
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            >
              {NUMBER_FORMATS.map((fmt, i) => (
                <option key={i} value={fmt}>
                  {fmt || '(None)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 500 }}>
              Paste function:
            </label>
            <select
              defaultValue=""
              onChange={(e) => {
                handlePasteFunction(e.target.value)
                e.target.value = ''
              }}
              style={{
                width: '100%',
                padding: '5px 8px',
                background: '#1a1a1a',
                border: '1px solid #444',
                color: '#fff',
                borderRadius: 3,
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            >
              <option value="" disabled>
                -- Select Function --
              </option>
              {FUNCTIONS.map((fn) => (
                <option key={fn} value={fn}>
                  {fn}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={handleApply}>
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
