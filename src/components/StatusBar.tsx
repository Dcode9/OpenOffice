import { Minus, Plus, BookOpen, Printer, Monitor } from 'lucide-react'
import { useWord } from '../context'

export default function StatusBar() {
  const { editor, zoom, setZoom, viewMode, setViewMode, showNav, setShowNav, trackChanges } = useWord()
  if (!editor) return null

  const words = editor.storage.characterCount.words()
  const chars = editor.storage.characterCount.characters()
  const paragraphs = editor.state.doc.childCount

  return (
    <div className="statusbar">
      <div className="status-left">
        <button className="status-btn" title="Page 1 of 1">Page 1 of 1</button>
        <span className="status-words" title="Word count">
          {words.toLocaleString()} words
        </span>
        <span className="status-dim">
          {chars.toLocaleString()} characters · {paragraphs} paragraphs
        </span>
        <span className="status-lang" title="Proofing language">English (United States)</span>
        {trackChanges && <span className="status-track" title="Track Changes is on">Track Changes: On</span>}
      </div>
      <div className="status-right">
        <button className={`status-icon${showNav ? ' active' : ''}`} title="Navigation Pane" onClick={() => setShowNav(!showNav)}>
          <BookOpen size={15} />
        </button>
        <button className={`status-icon${viewMode === 'read' ? ' active' : ''}`} title="Read Mode" onClick={() => setViewMode('read')}>
          <BookOpen size={15} />
        </button>
        <button className={`status-icon${viewMode === 'print' ? ' active' : ''}`} title="Print Layout" onClick={() => setViewMode('print')}>
          <Printer size={15} />
        </button>
        <button className={`status-icon${viewMode === 'web' ? ' active' : ''}`} title="Web Layout" onClick={() => setViewMode('web')}>
          <Monitor size={15} />
        </button>
        <div className="zoom-control">
          <button className="status-icon" onClick={() => setZoom(Math.max(0.25, zoom - 0.1))} title="Zoom out">
            <Minus size={14} />
          </button>
          <input
            type="range"
            min={25}
            max={300}
            value={Math.round(zoom * 100)}
            onChange={(e) => setZoom(Number(e.target.value) / 100)}
            className="zoom-slider"
          />
          <button className="status-icon" onClick={() => setZoom(Math.min(3, zoom + 0.1))} title="Zoom in">
            <Plus size={14} />
          </button>
          <button className="zoom-pct" onClick={() => setZoom(1)} title="Reset zoom">
            {Math.round(zoom * 100)}%
          </button>
        </div>
      </div>
    </div>
  )
}
