import { useEffect, useMemo, useState } from 'react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'
import {
  addDictionaryWord,
  addIgnoredWord,
  buildTextMap,
  editorRange,
  findProofIssues,
} from './proofing'

export default function SpellingDialog({ onClose }: { onClose: () => void }) {
  const { editor, proofingLanguage, toast } = useWord()
  const [tick, setTick] = useState(0)
  const [ignored, setIgnored] = useState<Set<string>>(new Set())
  const [selected, setSelected] = useState(0)
  const [replacement, setReplacement] = useState('')

  useEffect(() => {
    if (!editor) return
    const update = () => setTick((value) => value + 1)
    editor.on('transaction', update)
    editor.on('update', update)
    return () => {
      editor.off('transaction', update)
      editor.off('update', update)
    }
  }, [editor])

  const { text, map } = useMemo(() => (editor ? buildTextMap(editor) : { text: '', map: [] }), [editor, tick])
  const allIssues = useMemo(() => findProofIssues(text), [text])
  const issues = useMemo(
    () => allIssues.filter((issue) => !ignored.has(issue.word.toLowerCase())),
    [allIssues, ignored],
  )
  const issue = issues[0] ?? null

  useEffect(() => {
    setSelected(0)
    setReplacement(issue?.suggestions[0] ?? '')
  }, [issue?.id, issue?.suggestions])

  const applySuggestion = (value: string) => {
    if (!editor || !issue) return
    const range = editorRange(issue, map)
    if (!range) {
      toast('That change cannot be applied at this location')
      return
    }
    const word = replacement || value
    editor.chain().focus().insertContentAt(range, word || issue.suggestions[0] || issue.word).run()
    setTick((current) => current + 1)
    toast('Change applied')
  }

  const ignoreOnce = () => {
    if (!issue) return
    setIgnored((current) => {
      const next = new Set(current)
      next.add(issue.word.toLowerCase())
      return next
    })
  }

  const ignoreAll = () => {
    if (!issue) return
    addIgnoredWord(issue.word)
    setIgnored((current) => {
      const next = new Set(current)
      next.add(issue.word.toLowerCase())
      return next
    })
    toast(`"${issue.word}" will be ignored`)
  }

  const addToDictionary = () => {
    if (!issue) return
    addDictionaryWord(issue.word)
    setIgnored((current) => {
      const next = new Set(current)
      next.add(issue.word.toLowerCase())
      return next
    })
    toast(`"${issue.word}" added to the dictionary`)
  }

  const changeAll = () => {
    if (!editor || !issue) return
    const same = allIssues.filter((item) => item.word.toLowerCase() === issue.word.toLowerCase())
    const ranges = same.map((item) => editorRange(item, map)).filter((range): range is { from: number; to: number } => Boolean(range))
    if (!ranges.length) return
    const replacementWord = replacement || issue.suggestions[0] || issue.word
    const tr = editor.state.tr
    for (const range of ranges.reverse()) tr.insertText(replacementWord, range.from, range.to)
    editor.view.dispatch(tr)
    setTick((current) => current + 1)
    toast(`Changed ${ranges.length} occurrence${ranges.length === 1 ? '' : 's'}`)
  }

  const undoTyping = () => {
    editor?.chain().focus().undo().run()
    setTick((current) => current + 1)
  }

  return (
    <ReviewDialog
      title="Spelling and Grammar"
      subtitle={issue ? `${issue.type === 'spelling' ? 'Spelling' : 'Grammar'} · ${proofingLanguage}` : proofingLanguage}
      width={680}
      onClose={onClose}
      footer={
        <>
          <div className="rv-foot-note">{issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'} remaining` : 'No issues'}</div>
          <ReviewButton onClick={onClose}>Cancel</ReviewButton>
        </>
      }
    >
      {!issue ? (
        <div className="rv-proof-success">
          <div className="rv-proof-check">✓</div>
          <div>
            <strong>No spelling or grammar errors found.</strong>
            <p>The document has been checked against the local dictionary.</p>
          </div>
        </div>
      ) : (
        <div className="rv-proof-layout">
          <div className="rv-proof-main">
            <div className={`rv-proof-issue ${issue.type}`}>
              <span className="rv-proof-badge">{issue.type === 'spelling' ? 'Not in Dictionary' : 'Consider'}</span>
              <span className="rv-proof-word">{issue.word}</span>
            </div>
            <div className="rv-proof-sentence">
              {issue.sentence.split(new RegExp(`(${issue.word})`, 'i')).map((part, index) =>
                part.toLowerCase() === issue.word.toLowerCase() ? (
                  <mark key={index} className={`rv-proof-mark ${issue.type}`}>{part}</mark>
                ) : (
                  <span key={index}>{part}</span>
                ),
              )}
            </div>
            <div className="rv-proof-caption">
              {issue.type === 'spelling' ? 'Suggestions' : 'Suggested correction'}
            </div>
            <div className="rv-suggestions">
              {issue.suggestions.length === 0 && <div className="rv-empty-inline">No suggestions</div>}
              {issue.suggestions.map((suggestion, index) => (
                <button
                  key={suggestion + index}
                  type="button"
                  className={`rv-suggestion${selected === index ? ' active' : ''}`}
                  onClick={() => {
                    setSelected(index)
                    setReplacement(suggestion)
                  }}
                  onDoubleClick={() => applySuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
            <input
              className="rv-input"
              value={replacement}
              onChange={(event) => setReplacement(event.target.value)}
              placeholder="Change to"
            />
          </div>
          <div className="rv-proof-actions">
            <ReviewButton onClick={ignoreOnce}>Ignore Once</ReviewButton>
            <ReviewButton onClick={ignoreAll}>Ignore All</ReviewButton>
            <ReviewButton onClick={addToDictionary}>Add to Dictionary</ReviewButton>
            <ReviewButton variant="primary" onClick={() => applySuggestion(replacement)}>
              Change
            </ReviewButton>
            <ReviewButton onClick={changeAll} disabled={issue.suggestions.length === 0}>
              Change All
            </ReviewButton>
            <ReviewButton onClick={undoTyping}>Undo</ReviewButton>
            <ReviewButton onClick={() => toast('Proofing options are managed from Word Options')}>Options…</ReviewButton>
          </div>
        </div>
      )}
    </ReviewDialog>
  )
}
