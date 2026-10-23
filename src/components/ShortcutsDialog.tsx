import { useEffect } from 'react'

const GROUPS: { title: string; rows: [string, string][] }[] = [
  {
    title: 'File',
    rows: [
      ['New', 'Ctrl+N'],
      ['Open', 'Ctrl+O'],
      ['Save', 'Ctrl+S'],
      ['Print', 'Ctrl+P'],
    ],
  },
  {
    title: 'Edit',
    rows: [
      ['Undo', 'Ctrl+Z'],
      ['Redo', 'Ctrl+Y'],
      ['Find', 'Ctrl+F'],
      ['Replace', 'Ctrl+H'],
    ],
  },
  {
    title: 'Format',
    rows: [
      ['Bold', 'Ctrl+B'],
      ['Italic', 'Ctrl+I'],
      ['Underline', 'Ctrl+U'],
      ['Link', 'Ctrl+K'],
    ],
  },
  {
    title: 'Paragraph',
    rows: [
      ['Align left', 'Ctrl+L'],
      ['Center', 'Ctrl+E'],
      ['Align right', 'Ctrl+R'],
      ['Justify', 'Ctrl+J'],
    ],
  },
  {
    title: 'Insert',
    rows: [
      ['Page break', 'Ctrl+Enter'],
      ['Show/hide ¶', 'Ctrl+Shift+8'],
      ['Superscript', 'Ctrl+Shift+='],
      ['Subscript', 'Ctrl+='],
    ],
  },
  {
    title: 'View',
    rows: [
      ['Search commands', 'Alt+Q'],
      ['Zoom in', 'Ctrl+Alt+= '],
      ['Zoom out', 'Ctrl+Alt+-'],
      ['Close dialog', 'Esc'],
    ],
  },
]

export default function ShortcutsDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="word-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-modal" role="dialog" aria-label="Keyboard shortcuts">
        <h2>Keyboard shortcuts</h2>
        <div className="modal-sub">Frequently used shortcuts in Word</div>
        <div className="shortcut-grid">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="menu-label" style={{ padding: '6px 0' }}>{g.title}</div>
              {g.rows.map(([label, key]) => (
                <div className="shortcut-row" key={label}>
                  <span>{label}</span>
                  <kbd>{key}</kbd>
                </div>
              ))}
            </div>
          ))}
        </div>
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
