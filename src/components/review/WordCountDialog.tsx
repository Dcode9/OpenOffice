import { useEffect, useMemo, useState } from 'react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'

function selectedText(editor: ReturnType<typeof useWord>['editor']) {
  if (!editor) return ''
  const { from, to } = editor.state.selection
  if (from === to) return ''
  return editor.state.doc.textBetween(from, to, ' ')
}

function countText(text: string) {
  const words = text.trim() ? (text.trim().match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length : 0
  const characters = text.replace(/\s/g, '').length
  const paragraphs = text.trim() ? text.split(/\n+/).filter((line) => line.trim()).length : 0
  const lines = text.trim() ? text.split(/\n/).length : 0
  return { words, characters, paragraphs, lines }
}

export default function WordCountDialog({ onClose }: { onClose: () => void }) {
  const { editor, wordCount, setShowPageNumbers, toast } = useWord()
  const [tick, setTick] = useState(0)
  const [includeFootnotes, setIncludeFootnotes] = useState(true)
  const [includeTextBoxes, setIncludeTextBoxes] = useState(true)

  useEffect(() => {
    if (!editor) return
    const update = () => setTick((value) => value + 1)
    editor.on('transaction', update)
    return () => {
      editor.off('transaction', update)
    }
  }, [editor])

  const selection = useMemo(() => selectedText(editor), [editor, tick])
  const stats = useMemo(() => {
    const text = selection || editor?.getText() || ''
    const base = countText(text)
    const pages = Math.max(1, Math.ceil((editor?.getHTML().length ?? 0) / 2400))
    return { ...base, pages }
  }, [editor, selection, tick])

  const paragraphsFromContext = wordCount.paragraphs

  return (
    <ReviewDialog
      title={selection ? 'Word Count' : 'Word Count'}
      subtitle={selection ? 'Statistics for the selected text' : 'Statistics for the whole document'}
      width={480}
      onClose={onClose}
      footer={
        <>
          <label className="rv-check">
            <input type="checkbox" checked={includeFootnotes} onChange={(event) => setIncludeFootnotes(event.target.checked)} />
            Include textboxes, footnotes and endnotes
          </label>
          <ReviewButton onClick={onClose}>Close</ReviewButton>
        </>
      }
    >
      <div className="rv-count-grid">
        <span>Pages</span>
        <strong>{stats.pages}</strong>
        <span>Words</span>
        <strong>{selection ? stats.words : wordCount.words}</strong>
        <span>Characters (no spaces)</span>
        <strong>{stats.characters}</strong>
        <span>Characters (with spaces)</span>
        <strong>{selection ? (selectedText(editor) ?? '').length : wordCount.characters}</strong>
        <span>Paragraphs</span>
        <strong>{selection ? stats.paragraphs : paragraphsFromContext}</strong>
        <span>Lines</span>
        <strong>{stats.lines}</strong>
        <span>Non-Asian words</span>
        <strong>{wordCount.words}</strong>
      </div>
      <div className="rv-count-options">
        <label className="rv-check">
          <input type="checkbox" checked={includeTextBoxes} onChange={(event) => setIncludeTextBoxes(event.target.checked)} />
          Include textboxes
        </label>
        <label className="rv-check">
          <input type="checkbox" checked={includeFootnotes} onChange={(event) => setIncludeFootnotes(event.target.checked)} />
          Include footnotes and endnotes
        </label>
      </div>
      <div className="rv-foot-inline">
        <ReviewButton
          onClick={() => {
            setShowPageNumbers(true)
            toast('Word count is shown in the status bar')
          }}
        >
          Show in Status Bar
        </ReviewButton>
      </div>
    </ReviewDialog>
  )
}
