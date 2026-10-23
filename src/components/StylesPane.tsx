import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useWord } from '../context'
import { STYLES } from '../lib/constants'
import { applyDocumentStyle, clearFormatting } from '../editor/actions'
import {
  applyCustomStyle,
  createCustomStyle,
  deleteCustomStyle,
  getCustomStyles,
  subscribeCustomStyles,
  type CustomStyle,
} from '../lib/styles'

export default function StylesPane({ onClose }: { onClose: () => void }) {
  const { editor, toast } = useWord()
  const [custom, setCustom] = useState<CustomStyle[]>(getCustomStyles())

  useEffect(() => subscribeCustomStyles(() => setCustom(getCustomStyles())), [])

  return (
    <div className="side-pane styles-pane">
      <div className="side-pane-head">
        <span>Styles</span>
        <button className="side-pane-close" onClick={onClose} title="Close">✕</button>
      </div>
      <button
        className="styles-new"
        onClick={() => {
          if (!editor) return
          const name = window.prompt('Style name:')
          if (!name?.trim()) return
          createCustomStyle(editor, name.trim())
          toast(`Style "${name.trim()}" created`)
        }}
      >
        <Plus size={14} /> New Style
      </button>
      <div className="styles-current">{editor ? editor.getAttributes('paragraph').textAlign || 'Left' : ''}</div>
      <div className="styles-list">
        {STYLES.map((style) => (
          <button
            key={style.id}
            className="styles-row"
            onClick={() => {
              if (!editor) return
              applyDocumentStyle(editor, style)
              toast(`${style.label} applied`)
            }}
          >
            <span className="styles-sample" style={style.sample}>{style.label}</span>
            <span className="styles-kind">Paragraph</span>
          </button>
        ))}
        {custom.map((style) => (
          <div key={style.id} className="styles-row-wrap">
            <button
              className="styles-row"
              onClick={() => {
                if (!editor) return
                applyCustomStyle(editor, style)
                toast(`${style.name} applied`)
              }}
            >
              <span
                className="styles-sample"
                style={{
                  fontFamily: style.textStyle.fontFamily || undefined,
                  fontSize: style.textStyle.fontSize ? `${style.textStyle.fontSize}px` : undefined,
                  color: style.textStyle.color || undefined,
                }}
              >
                {style.name}
              </span>
              <span className="styles-kind">Custom</span>
            </button>
            <button
              className="styles-delete"
              title={`Delete ${style.name}`}
              onClick={() => {
                deleteCustomStyle(style.id)
                toast(`Style "${style.name}" deleted`)
              }}
            >
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="side-pane-actions">
        <button
          className="bs-secondary"
          onClick={() => {
            if (!editor) return
            clearFormatting(editor)
            toast('Formatting cleared')
          }}
        >
          Clear Formatting
        </button>
      </div>
    </div>
  )
}
