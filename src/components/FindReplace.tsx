import { useEffect, useRef, useState } from 'react'
import { Search, X, ChevronUp, ChevronDown, Replace } from 'lucide-react'
import { useWord } from '../context'

function buildText(doc: any) {
  let text = ''
  const map: number[] = []
  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      for (let i = 0; i < node.text.length; i++) {
        text += node.text[i]
        map.push(pos + i)
      }
    } else if (node.isBlock) {
      text += '\n'
      map.push(-1)
    }
    return true
  })
  return { text, map }
}

export default function FindReplace({ onClose, initialReplace = false }: { onClose: () => void; initialReplace?: boolean }) {
  const { editor } = useWord()
  const [query, setQuery] = useState('')
  const [replacement, setReplacement] = useState('')
  const [showReplace, setShowReplace] = useState(initialReplace)
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [wholeWord, setWholeWord] = useState(false)
  const [matches, setMatches] = useState<{ from: number; to: number }[]>([])
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  useEffect(() => {
    if (!editor || !query) {
      setMatches([])
      return
    }
    const { text, map } = buildText(editor.state.doc)
    const hay = caseSensitive ? text : text.toLowerCase()
    const needle = caseSensitive ? query : query.toLowerCase()
    const found: { from: number; to: number }[] = []
    let i = 0
    while (i <= hay.length) {
      const idx = hay.indexOf(needle, i)
      if (idx === -1) break
      if (!wholeWord || (!/\w/.test(hay[idx - 1] || '') && !/\w/.test(hay[idx + needle.length] || ''))) {
        const from = map[idx]
        const to = map[idx + needle.length - 1]
        if (from >= 0 && to >= 0) found.push({ from, to: to + 1 })
      }
      i = idx + needle.length
    }
    setMatches(found)
    setIndex(0)
    // eslint-disable-next-line
  }, [query, caseSensitive, wholeWord, editor?.state.doc.content.size])

  const goTo = (dir: 1 | -1) => {
    if (!editor || matches.length === 0) return
    const next = (index + dir + matches.length) % matches.length
    setIndex(next)
    const m = matches[next]
    editor.chain().focus().setTextSelection({ from: m.from, to: m.to }).scrollIntoView().run()
  }

  const replaceOne = () => {
    if (!editor || matches.length === 0) return
    const m = matches[index]
    editor.chain().focus().insertContentAt({ from: m.from, to: m.to }, replacement).run()
  }

  const replaceAll = () => {
    if (!editor || matches.length === 0) return
    editor
      .chain()
      .focus()
      .command(({ tr, state, dispatch }: any) => {
        for (let k = matches.length - 1; k >= 0; k--) {
          tr.insertText(replacement, matches[k].from, matches[k].to)
        }
        if (dispatch) dispatch(tr)
        void state
        return true
      })
      .run()
    onClose()
  }

  return (
    <div className="find-panel">
      <div className="find-row">
        <Search size={15} />
        <input
          ref={inputRef}
          className="find-input"
          placeholder={showReplace ? 'Find' : 'Find (Ctrl+F)'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goTo(e.shiftKey ? -1 : 1)
            if (e.key === 'Escape') onClose()
          }}
        />
        <span className="find-count">{matches.length ? `${index + 1}/${matches.length}` : '0/0'}</span>
        <button className="find-btn" onClick={() => goTo(-1)} title="Previous"><ChevronUp size={15} /></button>
        <button className="find-btn" onClick={() => goTo(1)} title="Next"><ChevronDown size={15} /></button>
        <button className="find-btn" onClick={() => setShowReplace((v) => !v)} title="Replace" >
          <Replace size={15} />
        </button>
        <button className="find-btn" onClick={onClose} title="Close"><X size={15} /></button>
      </div>

      {showReplace && (
        <div className="find-row">
          <Replace size={15} />
          <input
            className="find-input"
            placeholder="Replace with"
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
          />
          <button className="find-action" onClick={replaceOne}>Replace</button>
          <button className="find-action" onClick={replaceAll}>Replace All</button>
        </div>
      )}

      <div className="find-options">
        <label><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} /> Match case</label>
        <label><input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} /> Match whole word</label>
      </div>
    </div>
  )
}
