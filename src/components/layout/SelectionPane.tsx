import { useEffect, useReducer, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Eye, EyeOff, X } from 'lucide-react'
import {
  collectGraphics,
  focusGraphic,
  getPanePositions,
  selectGraphic,
  setGraphicVisibility,
  setPanePositions,
} from './arrangeActions'
import '../../styles/layout-advanced.css'

type Props = { editor: Editor; onClose: () => void }

export default function SelectionPane({ editor, onClose }: Props) {
  const [, forceUpdate] = useReducer((value: number) => value + 1, 0)
  const [selected, setSelected] = useState<number[]>(() => getPanePositions())

  useEffect(() => {
    const update = () => forceUpdate()
    editor.on('transaction', update)
    editor.on('selectionUpdate', update)
    return () => {
      editor.off('transaction', update)
      editor.off('selectionUpdate', update)
      setPanePositions([])
    }
  }, [editor])

  useEffect(() => {
    setPanePositions(selected)
  }, [selected])

  const images = collectGraphics(editor)
  const toggle = (pos: number) => {
    setSelected((current) => (current.includes(pos) ? current.filter((item) => item !== pos) : [...current, pos]))
  }

  return (
    <div className="selection-pane" role="dialog" aria-label="Selection Pane">
      <div className="selection-pane-head">
        <span>Selection</span>
        <button type="button" className="selection-pane-close" onClick={onClose} title="Close">
          <X size={14} />
        </button>
      </div>
      <div className="selection-pane-body">
        {images.length === 0 && <div className="selection-pane-empty">No objects on this page.</div>}
        {images.map((image, index) => (
          <div
            key={`${image.pos}-${image.src.slice(-12)}`}
            className={`selection-pane-row${selected.includes(image.pos) ? ' selected' : ''}`}
            onClick={() => {
              selectGraphic(editor, image.pos)
              focusGraphic(editor, image.pos)
            }}
          >
            <input
              type="checkbox"
              checked={selected.includes(image.pos)}
              onChange={() => toggle(image.pos)}
              onClick={(event) => event.stopPropagation()}
              aria-label={`Select ${image.alt || `Picture ${index + 1}`}`}
            />
            <span className="selection-pane-name">{image.alt || `Picture ${index + 1}`}</span>
            {image.group && <span className="selection-pane-group">Group</span>}
            <button
              type="button"
              className="selection-pane-eye"
              title={image.hidden ? 'Show' : 'Hide'}
              onClick={(event) => {
                event.stopPropagation()
                setGraphicVisibility(editor, image.pos, !image.hidden)
              }}
            >
              {image.hidden ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        ))}
      </div>
      <div className="selection-pane-foot">Click a row to select. Check rows to work with several objects.</div>
    </div>
  )
}
