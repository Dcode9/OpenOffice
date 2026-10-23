import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { getTableAttrs, sortTable } from '../editor/actions'

type Props = { editor: Editor; onClose: () => void }

function firstRowHasHeader(editor: Props['editor']) {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth)
    if (node.type.name === 'table') {
      return node.firstChild?.firstChild?.type.name === 'tableHeader'
    }
  }
  return false
}

export default function SortTableDialog({ editor, onClose }: Props) {
  const attrs = getTableAttrs(editor)
  const [ascending, setAscending] = useState(true)
  const [hasHeader, setHasHeader] = useState(Boolean(attrs.headerRow) || firstRowHasHeader(editor))
  const [sortBy, setSortBy] = useState('Paragraphs')

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog sort-table-dialog" role="dialog" aria-modal="true" aria-label="Sort">
        <div className="dialog-title">Sort</div>
        <div className="dialog-body">
          <div className="dialog-grid">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option>Paragraphs</option>
              <option>Text</option>
              <option>Number</option>
              <option>Date</option>
            </select>
            <label>Type:</label>
            <select defaultValue="Text">
              <option>Text</option>
              <option>Number</option>
              <option>Date</option>
            </select>
            <label>Using:</label>
            <select defaultValue="Paragraph">
              <option>Paragraph</option>
            </select>
          </div>
          <div className="dialog-subtitle">Order</div>
          <div className="dialog-radio-list">
            <label>
              <input type="radio" name="sort-order" checked={ascending} onChange={() => setAscending(true)} />
              Ascending
            </label>
            <label>
              <input type="radio" name="sort-order" checked={!ascending} onChange={() => setAscending(false)} />
              Descending
            </label>
          </div>
          <label className="check-row" style={{ marginTop: 10 }}>
            <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
            My list has headers
          </label>
        </div>
        <div className="dialog-actions">
          <button
            className="dialog-btn primary"
            onClick={() => {
              sortTable(editor, ascending, hasHeader)
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
