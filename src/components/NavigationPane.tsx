import { useEffect, useState } from 'react'
import { ChevronRight, FileText, Search } from 'lucide-react'
import { useWord } from '../context'

export default function NavigationPane({ onClose }: { onClose: () => void }) {
  const { editor } = useWord()
  const [items, setItems] = useState<{ level: number; text: string; pos: number }[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (!editor) return
    const update = () => {
      const found: { level: number; text: string; pos: number }[] = []
      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === 'heading') found.push({ level: node.attrs.level, text: node.textContent, pos })
        return true
      })
      setItems(found)
    }
    update()
    editor.on('update', update)
    return () => {
      editor.off('update', update)
    }
  }, [editor])

  const jump = (pos: number) => {
    if (!editor) return
    editor.chain().focus().setTextSelection(pos + 1).scrollIntoView().run()
  }

  const visible = items.filter((i) => i.text.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="nav-pane">
      <div className="nav-head">
        <span>Navigation</span>
        <button className="find-btn" onClick={onClose}>✕</button>
      </div>
      <div className="nav-search">
        <Search size={14} />
        <input placeholder="Search document" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <div className="nav-label">Headings</div>
      <div className="nav-list">
        {visible.length === 0 && <div className="nav-empty">No headings found. Apply Heading styles to build an outline.</div>}
        {visible.map((i, k) => (
          <button
            key={k}
            className={`nav-item level-${i.level}`}
            style={{ paddingLeft: 8 + (i.level - 1) * 14 }}
            onClick={() => jump(i.pos)}
          >
            <FileText size={13} />
            <span>{i.text || '(blank heading)'}</span>
          </button>
        ))}
      </div>
      <div className="nav-label">Pages<span className="nav-pill">{Math.max(1, Math.ceil(editor?.storage.characterCount.words() / 300) || 1)}</span></div>
      <div className="nav-pages">
        <button className="nav-thumb" onClick={() => editor?.chain().focus().setTextSelection(1).scrollIntoView().run()}>
          <ChevronRight size={12} />
          <div className="thumb-page" />
          <span>Page 1</span>
        </button>
      </div>
    </div>
  )
}
