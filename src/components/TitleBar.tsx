import { useEffect, useState } from 'react'
import { ChevronDown, Gem, Minus, Redo2, Save, Search, Square, Undo2, X } from 'lucide-react'
import { useWord } from '../context'

export default function TitleBar() {
  const { editor, docTitle, saveDocx, toast, setActiveTab } = useWord()
  const [, force] = useState(0)
  const [autoSave, setAutoSave] = useState(() => localStorage.getItem('oo-autosave') === '1')

  useEffect(() => {
    if (!editor) return
    const h = () => force((n) => n + 1)
    editor.on('transaction', h)
    return () => {
      editor.off('transaction', h)
    }
  }, [editor])

  return (
    <div className="titlebar">
      <div className="titlebar-left">
        <div className="app-icon" title="Word">
          <span>W</span>
        </div>

        <button
          className="autosave"
          title={autoSave ? 'AutoSave is on' : 'AutoSave is off'}
          onClick={() => {
            const next = !autoSave
            setAutoSave(next)
            localStorage.setItem('oo-autosave', next ? '1' : '0')
            toast(next ? 'AutoSave is on' : 'AutoSave is off')
          }}
        >
          <span>AutoSave</span>
          <span className={`switch${autoSave ? ' on' : ''}`}>
            <span className="knob" />
            <span className="switch-label">{autoSave ? 'On' : 'Off'}</span>
          </span>
        </button>

        <button className="qat-btn" title="Save (Ctrl+S)" onClick={saveDocx}>
          <Save size={15} />
        </button>
        <button
          className="qat-btn"
          title="Undo (Ctrl+Z)"
          disabled={!editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 size={15} />
        </button>
        <button
          className="qat-btn"
          title="Redo (Ctrl+Y)"
          disabled={!editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 size={15} />
        </button>
        <button
          className="tb-icon qat-caret"
          title="Customize Quick Access Toolbar"
          onClick={() => toast('Quick Access Toolbar')}
        >
          <ChevronDown size={13} />
        </button>

        <span className="titlebar-title">{docTitle} - Word</span>
      </div>

      <div className="titlebar-right">
        <label className="search-box" title="Search (Alt+Q)">
          <Search size={14} />
          <input
            placeholder="Search"
            onFocus={() => setActiveTab('Home')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') window.dispatchEvent(new CustomEvent('word:find'))
            }}
          />
        </label>

        <button className="upgrade-btn" title="Upgrade your plan" onClick={() => toast('Microsoft 365 — this demo is free')}>
          <Gem size={14} />
          Upgrade your plan
        </button>

        <div className="account" title="Account: Dhairya Shah">DS</div>

        <div className="window-controls">
          <button title="Minimize" onClick={() => toast('Window controls are managed by your browser')}>
            <Minus size={14} />
          </button>
          <button title="Maximize" onClick={() => toast('Window controls are managed by your browser')}>
            <Square size={12} />
          </button>
          <button className="close" title="Close" onClick={() => window.close()}>
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
