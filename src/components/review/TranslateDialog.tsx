import { useMemo, useState } from 'react'
import { ArrowLeftRight, Copy, RotateCcw } from 'lucide-react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'
import { phrasebookSize, translateText } from './translate'

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi'] as const

export default function TranslateDialog({ onClose }: { onClose: () => void }) {
  const { editor, toast } = useWord()
  const [sourceLanguage, setSourceLanguage] = useState<(typeof LANGUAGES)[number]>('English')
  const [targetLanguage, setTargetLanguage] = useState<(typeof LANGUAGES)[number]>('Spanish')
  const [edited, setEdited] = useState<string | null>(null)

  const selection = useMemo(() => {
    if (!editor) return { text: '', range: null as null | { from: number; to: number } }
    const { from, to } = editor.state.selection
    if (from !== to) return { text: editor.state.doc.textBetween(from, to, ' '), range: { from, to } }
    return { text: editor.getText().slice(0, 2000), range: null }
  }, [editor])

  const translated = useMemo(() => {
    if (edited !== null) return edited
    return translateText(selection.text, targetLanguage)
  }, [edited, selection.text, targetLanguage])

  const swap = () => {
    const previousSource = sourceLanguage
    setSourceLanguage(targetLanguage)
    setTargetLanguage(previousSource)
    setEdited(null)
  }

  const insert = (replace: boolean) => {
    if (!editor) return
    if (!translated.trim()) return
    if (replace && selection.range) {
      editor.chain().focus().insertContentAt(selection.range, translated).run()
      toast('Selected text replaced with the translation')
    } else {
      editor.chain().focus().insertContent(` ${translated}`).run()
      toast('Translation inserted')
    }
    onClose()
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(translated)
      toast('Translation copied')
    } catch {
      toast('Could not copy to the clipboard')
    }
  }

  return (
    <ReviewDialog
      title="Translator"
      subtitle={`${selection.text.trim().split(/\s+/).filter(Boolean).length} words · local phrasebook (${phrasebookSize()} entries)`}
      width={820}
      onClose={onClose}
      footer={
        <>
          <div className="rv-foot-note">
            {selection.range ? 'Using the selected text' : 'Using the beginning of the document'}
          </div>
          <ReviewButton onClick={copy} disabled={!translated.trim()}>
            <Copy size={13} /> Copy
          </ReviewButton>
          <ReviewButton onClick={onClose}>Cancel</ReviewButton>
          <ReviewButton onClick={() => insert(false)} disabled={!translated.trim()}>Insert</ReviewButton>
          <ReviewButton variant="primary" onClick={() => insert(true)} disabled={!selection.range || !translated.trim()}>
            Replace
          </ReviewButton>
        </>
      }
    >
      <div className="rv-translate-bar">
        <select
          className="rv-select"
          value={sourceLanguage}
          onChange={(event) => {
            setSourceLanguage(event.target.value as (typeof LANGUAGES)[number])
            setEdited(null)
          }}
        >
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
        <button
          type="button"
          className="rv-icon-btn"
          onClick={swap}
          aria-label="Swap languages"
        >
          <ArrowLeftRight size={15} />
        </button>
        <select
          className="rv-select"
          value={targetLanguage}
          onChange={(event) => {
            setTargetLanguage(event.target.value as (typeof LANGUAGES)[number])
            setEdited(null)
          }}
        >
          {LANGUAGES.filter((language) => language !== sourceLanguage).map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
        <button type="button" className="rv-icon-btn" onClick={() => setEdited(null)} aria-label="Reset translation">
          <RotateCcw size={15} />
        </button>
      </div>
      <div className="rv-translate-grid">
        <div className="rv-translate-pane">
          <div className="rv-translate-head">{sourceLanguage}</div>
          <div className="rv-translate-text source">{selection.text || 'There is no text to translate.'}</div>
        </div>
        <div className="rv-translate-pane">
          <div className="rv-translate-head">{targetLanguage}</div>
          <textarea
            className="rv-translate-text target"
            value={translated}
            onChange={(event) => setEdited(event.target.value)}
            spellCheck={false}
          />
        </div>
      </div>
      <p className="rv-help">
        Translation runs entirely offline using a bundled phrasebook. Word order and grammar are simplified; review the result before replacing text.
      </p>
    </ReviewDialog>
  )
}
