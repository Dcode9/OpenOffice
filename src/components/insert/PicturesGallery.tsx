import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Image as ImageIcon, Search } from 'lucide-react'
import { insertSvg } from '../../editor/insertActions'
import { InsertModal } from './Modal'
import { STOCK_IMAGES } from './graphics'
import '../../styles/insert-advanced.css'

export function StockImagesDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = STOCK_IMAGES.filter((image) => image.name.toLowerCase().includes(query.toLowerCase()))

  const insert = (id: string) => {
    const image = STOCK_IMAGES.find((item) => item.id === id)
    if (!image) return
    insertSvg(editor, image.full, image.name)
    onInserted(`Stock image inserted: ${image.name}`)
    onClose()
  }

  return (
    <InsertModal
      title="Stock Images"
      subtitle="Curated royalty-free pictures included with OpenOffice"
      width={760}
      onClose={onClose}
      footer={
        <div className="ins-foot-note">
          <ImageIcon size={14} /> Images are inserted as editable picture objects. Select a picture to resize or move it.
        </div>
      }
    >
      <div className="ins-search-row">
        <span className="ins-search">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search stock images"
            autoFocus
          />
        </span>
        <span className="ins-pill">{filtered.length} results</span>
      </div>
      <div className="ins-stock-grid">
        {filtered.map((image) => (
          <button key={image.id} type="button" className="ins-stock-card" onClick={() => insert(image.id)}>
            <span className="ins-stock-thumb" dangerouslySetInnerHTML={{ __html: image.thumb }} />
            <span className="ins-stock-meta">
              <span className="ins-stock-name">{image.name}</span>
              <span className="ins-stock-sub">Stock image · Free to use</span>
            </span>
          </button>
        ))}
      </div>
      {filtered.length === 0 && <div className="ins-empty">No images match “{query}”.</div>}
    </InsertModal>
  )
}
