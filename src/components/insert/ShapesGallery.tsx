import { useEffect, useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { insertHtml, insertSvg } from '../../editor/insertActions'
import { ALL_SHAPES, SHAPE_CATEGORIES, shapeById } from './graphics'
import '../../styles/insert-advanced.css'

const RECENT_KEY = 'openoffice:recent-shapes'

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string').slice(0, 12) : []
  } catch {
    return []
  }
}

export function ShapesGallery({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (name: string) => void
  onClose: () => void
}) {
  const [recent, setRecent] = useState<string[]>(readRecent)
  const [category, setCategory] = useState('lines')
  const selected = SHAPE_CATEGORIES.find((item) => item.id === category) || SHAPE_CATEGORIES[0]

  useEffect(() => {
    if (category === 'recent' && recent.length === 0) setCategory('lines')
  }, [category, recent.length])

  const recentShapes = useMemo(
    () => recent.map((id) => shapeById(id)).filter((shape): shape is NonNullable<ReturnType<typeof shapeById>> => Boolean(shape)),
    [recent],
  )

  const insert = (id: string) => {
    const shape = shapeById(id)
    if (!shape) return
    if (shape.kind === 'hline') {
      insertHtml(editor, '<p data-border-sides="bottom" data-border-color="#2b579a" data-border-width="1.5px"><br></p><p></p>')
    } else {
      insertSvg(editor, shape.svg(260, 182), shape.name)
    }
    const next = [id, ...recent.filter((item) => item !== id)].slice(0, 12)
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
    onInserted(shape.name)
    onClose()
  }

  const list = category === 'recent' ? recentShapes : selected.shapes

  return (
    <div className="ins-shapes">
      <div className="ins-shapes-side">
        <button
          type="button"
          className={`ins-shapes-cat${category === 'recent' ? ' active' : ''}`}
          onClick={() => setCategory('recent')}
        >
          Recently Used
        </button>
        {SHAPE_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`ins-shapes-cat${category === item.id ? ' active' : ''}`}
            onClick={() => setCategory(item.id)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="ins-shapes-main">
        <div className="ins-shapes-heading">
          {category === 'recent' ? 'Recently Used Shapes' : selected.name}
          <span>{list.length} shapes</span>
        </div>
        {list.length === 0 ? (
          <div className="ins-empty">No recently used shapes yet. Insert a shape to see it here.</div>
        ) : (
          <div className="ins-shapes-grid">
            {list.map((shape) => (
              <button key={shape.id} type="button" className="ins-shape-card" onClick={() => insert(shape.id)} title={shape.name}>
                <span className="ins-shape-preview" dangerouslySetInnerHTML={{ __html: shape.svg(74, 52) }} />
                <span className="ins-shape-name">{shape.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function totalShapeCount() {
  return ALL_SHAPES.length
}
