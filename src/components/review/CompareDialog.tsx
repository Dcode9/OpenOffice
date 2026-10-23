import { useRef, useState } from 'react'
import { FileText, Upload } from 'lucide-react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'
import { buildComparedHtml, diffWords, getCompareSources, setCompareSources } from '../../editor/review'

async function readTextFile(file: File) {
  const raw = await file.text()
  if (/\.html?$/i.test(file.name)) {
    const parsed = new DOMParser().parseFromString(raw, 'text/html')
    return parsed.body.textContent || ''
  }
  return raw
}

export default function CompareDialog({ onClose }: { onClose: () => void }) {
  const { editor, toast, setActiveTab, setMarkupMode } = useWord()
  const previous = getCompareSources()
  const [original, setOriginal] = useState(previous?.original ?? '')
  const [revised, setRevised] = useState(previous?.revised ?? editor?.getText() ?? '')
  const [originalName, setOriginalName] = useState('Original document')
  const [revisedName, setRevisedName] = useState('Revised document (current)')
  const [author, setAuthor] = useState('Charles Richardson')
  const [result, setResult] = useState<{ insertions: number; deletions: number } | null>(null)
  const originalInput = useRef<HTMLInputElement>(null)
  const revisedInput = useRef<HTMLInputElement>(null)

  const load = async (file: File | undefined, target: 'original' | 'revised') => {
    if (!file) return
    try {
      const text = await readTextFile(file)
      if (target === 'original') {
        setOriginal(text)
        setOriginalName(file.name)
      } else {
        setRevised(text)
        setRevisedName(file.name)
      }
      toast(`${file.name} loaded`)
    } catch {
      toast('Could not read that file')
    }
  }

  const compare = () => {
    if (!editor) return
    if (!original.trim() || !revised.trim()) {
      toast('Provide both an original and a revised document')
      return
    }
    const diff = buildComparedHtml(original, revised, author)
    setCompareSources({ original, revised, author, createdAt: Date.now() })
    editor.commands.setContent(diff.html)
    setMarkupMode('all')
    setActiveTab('Review')
    setResult({ insertions: diff.insertions, deletions: diff.deletions })
    toast(`Comparison created: ${diff.insertions} insertions, ${diff.deletions} deletions`)
    onClose()
  }

  const combine = () => {
    if (!original.trim() || !revised.trim()) {
      toast('Provide both documents before combining')
      return
    }
    setRevised(`${original.trim()}\n\n${revised.trim()}`)
    setResult(null)
    toast('Documents combined in the Revised pane')
  }

  const diffCount = original && revised ? diffWords(original, revised).filter((op) => op.type !== 'equal').length : 0

  return (
    <ReviewDialog
      title="Compare Documents"
      subtitle="Create a marked-up comparison from an original and a revised document"
      width={820}
      onClose={onClose}
      footer={
        <>
          <div className="rv-foot-note">
            {diffCount ? `${diffCount} differing segment${diffCount === 1 ? '' : 's'}` : 'Choose two documents to compare'}
          </div>
          <ReviewButton onClick={onClose}>Cancel</ReviewButton>
          <ReviewButton onClick={combine} disabled={!original.trim() || !revised.trim()}>Combine</ReviewButton>
          <ReviewButton variant="primary" onClick={compare}>Compare</ReviewButton>
        </>
      }
    >
      <div className="rv-compare-grid">
        <section className="rv-compare-card">
          <div className="rv-compare-title">
            <FileText size={15} /> Original document
          </div>
          <div className="rv-compare-file">{originalName}</div>
          <textarea
            className="rv-textarea"
            value={original}
            onChange={(event) => {
              setOriginal(event.target.value)
              setOriginalName('Original document')
            }}
            placeholder="Paste the original text here"
          />
          <div className="rv-compare-actions">
            <input
              ref={originalInput}
              type="file"
              accept=".txt,.md,.html,.htm"
              hidden
              onChange={(event) => load(event.target.files?.[0], 'original')}
            />
            <ReviewButton onClick={() => originalInput.current?.click()}>
              <Upload size={13} /> Browse…
            </ReviewButton>
            <ReviewButton onClick={() => {
              setOriginal(editor?.getText() ?? '')
              setOriginalName('Current document')
            }}>
              Use Current
            </ReviewButton>
          </div>
        </section>
        <section className="rv-compare-card">
          <div className="rv-compare-title">
            <FileText size={15} /> Revised document
          </div>
          <div className="rv-compare-file">{revisedName}</div>
          <textarea
            className="rv-textarea"
            value={revised}
            onChange={(event) => {
              setRevised(event.target.value)
              setRevisedName('Revised document')
            }}
            placeholder="Paste the revised text here"
          />
          <div className="rv-compare-actions">
            <input
              ref={revisedInput}
              type="file"
              accept=".txt,.md,.html,.htm"
              hidden
              onChange={(event) => load(event.target.files?.[0], 'revised')}
            />
            <ReviewButton onClick={() => revisedInput.current?.click()}>
              <Upload size={13} /> Browse…
            </ReviewButton>
            <ReviewButton onClick={() => {
              setRevised(editor?.getText() ?? '')
              setRevisedName('Current document')
            }}>
              Use Current
            </ReviewButton>
          </div>
        </section>
      </div>
      <div className="rv-compare-options">
        <label className="rv-field">
          <span className="rv-field-label">Label changes with</span>
          <input className="rv-input" value={author} onChange={(event) => setAuthor(event.target.value)} />
        </label>
        <label className="rv-check">
          <input type="checkbox" defaultChecked /> Show changes in a new document
        </label>
      </div>
      {result && (
        <div className="rv-compare-result">
          Comparison complete: <strong>{result.insertions}</strong> insertions and <strong>{result.deletions}</strong> deletions.
        </div>
      )}
      <p className="rv-help">
        Plain text, Markdown and HTML files are supported. For .docx files, open them in the editor first, then choose “Use Current”.
      </p>
    </ReviewDialog>
  )
}
