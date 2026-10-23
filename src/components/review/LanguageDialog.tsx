import { useMemo, useState } from 'react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'

export const LANGUAGES = [
  'English (United States)',
  'English (United Kingdom)',
  'Spanish (Spain)',
  'French (France)',
  'German (Germany)',
  'Italian (Italy)',
  'Portuguese (Brazil)',
  'Dutch (Netherlands)',
  'Polish (Poland)',
  'Russian (Russia)',
  'Turkish (Turkey)',
  'Arabic (Saudi Arabia)',
  'Hindi (India)',
  'Japanese (Japan)',
  'Korean (Korea)',
  'Chinese (Simplified, China)',
]

const HINTS: Record<string, string[]> = {
  'Spanish (Spain)': ['el', 'la', 'los', 'las', 'de', 'que', 'y', 'en', 'un', 'una', 'para', 'con', 'por', 'es', 'como'],
  'French (France)': ['le', 'la', 'les', 'des', 'de', 'et', 'est', 'dans', 'pour', 'avec', 'une', 'un', 'que', 'qui', 'pas'],
  'German (Germany)': ['der', 'die', 'das', 'und', 'ist', 'nicht', 'mit', 'für', 'ein', 'eine', 'auf', 'zu', 'den', 'von', 'sich'],
  'Italian (Italy)': ['il', 'la', 'gli', 'le', 'di', 'che', 'e', 'per', 'con', 'una', 'un', 'non', 'sono', 'come'],
  'Portuguese (Brazil)': ['o', 'a', 'os', 'as', 'de', 'que', 'e', 'para', 'com', 'uma', 'um', 'não', 'como'],
}

export function detectLanguage(text: string) {
  if (/[\u0900-\u097F]/.test(text)) return 'Hindi (India)'
  if (/[\u0600-\u06FF]/.test(text)) return 'Arabic (Saudi Arabia)'
  if (/[\u3040-\u30ff]/.test(text)) return 'Japanese (Japan)'
  if (/[\uac00-\ud7af]/.test(text)) return 'Korean (Korea)'
  if (/[\u4e00-\u9fff]/.test(text)) return 'Chinese (Simplified, China)'
  if (/[\u0400-\u04FF]/.test(text)) return 'Russian (Russia)'
  const words = text.toLowerCase().match(/[\p{L}]+/gu) ?? []
  const total = words.length || 1
  let best = 'English (United States)'
  let score = 0
  for (const [language, hints] of Object.entries(HINTS)) {
    const hits = words.filter((word) => hints.includes(word)).length
    if (hits / total > score) {
      score = hits / total
      best = language
    }
  }
  return score > 0.08 ? best : 'English (United States)'
}

export default function LanguageDialog({ onClose }: { onClose: () => void }) {
  const { editor, proofingLanguage, setProofingLanguage, toast } = useWord()
  const detected = useMemo(() => detectLanguage(editor?.getText() || ''), [editor])
  const [selected, setSelected] = useState(proofingLanguage || detected)
  const [doNotCheck, setDoNotCheck] = useState(false)
  const [autoDetect, setAutoDetect] = useState(false)

  const apply = () => {
    setProofingLanguage(selected)
    toast(`Proofing language set to ${selected}`)
    onClose()
  }

  return (
    <ReviewDialog
      title="Language"
      subtitle="Set the proofing language for the selected text or the whole document"
      width={520}
      onClose={onClose}
      footer={
        <>
          <div className="rv-foot-note">Detected: {detected}</div>
          <ReviewButton onClick={onClose}>Cancel</ReviewButton>
          <ReviewButton variant="primary" onClick={apply}>OK</ReviewButton>
        </>
      }
    >
      <div className="rv-field-line">
        <span className="rv-field-label">Language</span>
        <select className="rv-select" value={selected} onChange={(event) => setSelected(event.target.value)}>
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>{language}</option>
          ))}
        </select>
      </div>
      <div className="rv-chip-row">
        <span className="rv-chip">Current: {proofingLanguage}</span>
        <button type="button" className="rv-link" onClick={() => setSelected(detected)}>
          Use detected language
        </button>
      </div>
      <div className="rv-check-stack">
        <label className="rv-check">
          <input type="checkbox" checked={autoDetect} onChange={(event) => setAutoDetect(event.target.checked)} />
          Detect language automatically
        </label>
        <label className="rv-check">
          <input type="checkbox" checked={doNotCheck} onChange={(event) => setDoNotCheck(event.target.checked)} />
          Do not check spelling or grammar
        </label>
      </div>
      <p className="rv-help">
        The proofing language controls the dictionary used by Spelling and Grammar and the reading voice suggestions for Read Aloud.
      </p>
    </ReviewDialog>
  )
}
