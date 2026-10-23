import { useState } from 'react'
import { LEADERS, TOA_CATEGORIES } from '../../lib/references'
import type { ToaConfig } from '../../lib/references'
import { RefButton, RefCheck, RefField, RefModal } from './Modal'

export function MarkCitationDialog({
  selectedText,
  onSubmit,
  onClose,
}: {
  selectedText: string
  onSubmit: (data: { selectedText: string; category: string; short: string; long: string }) => void
  onClose: () => void
}) {
  const [category, setCategory] = useState(TOA_CATEGORIES[0])
  const [short, setShort] = useState(selectedText)
  const [long, setLong] = useState('')
  const [text, setText] = useState(selectedText)
  return (
    <RefModal
      title="Mark Citation"
      subtitle="Add the selected authority to the table of authorities"
      width={540}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton
            variant="primary"
            disabled={!short.trim() && !text.trim()}
            onClick={() => onSubmit({ selectedText: text, category, short, long })}
          >
            Mark
          </RefButton>
        </>
      }
    >
      <RefField label="Selected text" wide>
        <textarea className="refs-textarea" value={text} onChange={(event) => setText(event.target.value)} />
      </RefField>
      <RefField label="Category">
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {TOA_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </RefField>
      <RefField label="Short citation">
        <input type="text" value={short} onChange={(event) => setShort(event.target.value)} />
      </RefField>
      <RefField label="Long citation">
        <input
          type="text"
          value={long}
          placeholder="Full citation shown in the table (optional)"
          onChange={(event) => setLong(event.target.value)}
        />
      </RefField>
      <div className="refs-help">
        The short citation is listed in the table. The long citation can include the full case name or statutory
        reference.
      </div>
    </RefModal>
  )
}

export function TableOfAuthoritiesDialog({
  config,
  onSave,
  onClose,
}: {
  config: ToaConfig
  onSave: (config: ToaConfig) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<ToaConfig>({ ...config })
  const set = <K extends keyof ToaConfig>(key: K, value: ToaConfig[K]) => setDraft({ ...draft, [key]: value })
  return (
    <RefModal
      title="Table of Authorities"
      subtitle="Collect marked citations by category"
      width={480}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" onClick={() => onSave(draft)}>
            OK
          </RefButton>
        </>
      }
    >
      <RefField label="Category">
        <select value={draft.category} onChange={(event) => set('category', event.target.value)}>
          <option value="All">All categories</option>
          {TOA_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </RefField>
      <RefField label="Tab leader">
        <select value={draft.leader} onChange={(event) => set('leader', event.target.value)}>
          {LEADERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </RefField>
      <RefCheck checked={draft.passim} onChange={(value) => set('passim', value)}>
        Use passim for five or more page references
      </RefCheck>
      <RefCheck checked={draft.keepFormatting} onChange={(value) => set('keepFormatting', value)}>
        Keep original formatting
      </RefCheck>
      <div className="refs-help" style={{ marginTop: 8 }}>
        Mark authorities with Mark Citation before inserting the table. The table is refreshed in place when one
        already exists.
      </div>
    </RefModal>
  )
}
