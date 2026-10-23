import { useEffect, useState } from 'react'
import { Clipboard, Trash2 } from 'lucide-react'
import { useWord } from '../context'
import { clearClipItems, getClipItems, insertClip, pasteAll, subscribeClipboard, type ClipItem } from '../lib/clipboard'

export default function OfficeClipboardPane({ onClose }: { onClose: () => void }) {
  const { editor, toast } = useWord()
  const [items, setItems] = useState<ClipItem[]>(getClipItems())

  useEffect(() => subscribeClipboard(() => setItems(getClipItems())), [])

  return (
    <div className="side-pane clipboard-pane">
      <div className="side-pane-head">
        <span><Clipboard size={15} /> Clipboard</span>
        <button className="side-pane-close" onClick={onClose} title="Close">✕</button>
      </div>
      <div className="side-pane-note">Click an item to paste it at the cursor. Up to 24 items.</div>
      <div className="clip-list">
        {items.length === 0 && (
          <div className="side-pane-empty">Clipboard is empty. Copy or cut something to collect it here.</div>
        )}
        {items.map((item) => (
          <button
            key={item.id}
            className="clip-item"
            onClick={() => {
              if (!editor) return
              if (insertClip(editor, item, 'html')) toast('Pasted from Office Clipboard')
            }}
          >
            <div className="clip-preview" dangerouslySetInnerHTML={{ __html: item.html || item.text }} />
            <div className="clip-meta">
              <span>{new Date(item.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>{item.text.length} chars</span>
            </div>
          </button>
        ))}
      </div>
      <div className="side-pane-actions">
        <button
          className="bs-secondary"
          disabled={!items.length || !editor}
          onClick={() => {
            if (editor && pasteAll(editor)) toast('Pasted all clipboard items')
          }}
        >
          Paste All
        </button>
        <button
          className="bs-secondary"
          disabled={!items.length}
          onClick={() => {
            clearClipItems()
            toast('Office Clipboard cleared')
          }}
        >
          <Trash2 size={14} /> Clear All
        </button>
      </div>
    </div>
  )
}
