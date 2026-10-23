import { useState } from 'react'

type Props = {
  mode: 'insert' | 'delete'
  onApply: (mode: string) => void
  onClose: () => void
}

export default function InsertCellsDialog({ mode, onApply, onClose }: Props) {
  const [choice, setChoice] = useState(mode === 'insert' ? 'shift-right' : 'shift-left')
  const isInsert = mode === 'insert'
  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog insert-cells-dialog" role="dialog" aria-modal="true" aria-label={isInsert ? 'Insert Cells' : 'Delete Cells'}>
        <div className="dialog-title">{isInsert ? 'Insert Cells' : 'Delete Cells'}</div>
        <div className="dialog-body">
          <div className="dialog-subtitle">{isInsert ? 'Insert' : 'Delete'}</div>
          <div className="dialog-radio-list">
            <label>
              <input type="radio" name="cells-mode" checked={choice === 'shift-right'} onChange={() => setChoice('shift-right')} />
              Shift cells right
            </label>
            <label>
              <input type="radio" name="cells-mode" checked={choice === 'shift-down'} onChange={() => setChoice('shift-down')} />
              Shift cells down
            </label>
            <label>
              <input type="radio" name="cells-mode" checked={choice === 'entire-row'} onChange={() => setChoice('entire-row')} />
              {isInsert ? 'Entire row' : 'Delete entire row'}
            </label>
            <label>
              <input type="radio" name="cells-mode" checked={choice === 'entire-column'} onChange={() => setChoice('entire-column')} />
              {isInsert ? 'Entire column' : 'Delete entire column'}
            </label>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={() => onApply(choice)}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
