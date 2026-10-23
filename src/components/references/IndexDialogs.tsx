import { useState } from 'react'
import { LEADERS } from '../../lib/references'
import type { IndexConfig } from '../../lib/references'
import { RefButton, RefCheck, RefField, RefModal, RefSection } from './Modal'

export type IndexEntryInput = {
  main: string
  sub: string
  crossRef: string
  bold: boolean
  italic: boolean
  pageBold: boolean
  pageItalic: boolean
}

export function MarkIndexEntryDialog({
  initialTerm,
  onSubmit,
  onClose,
}: {
  initialTerm: string
  onSubmit: (data: IndexEntryInput, markAll: boolean) => void
  onClose: () => void
}) {
  const [main, setMain] = useState(initialTerm)
  const [sub, setSub] = useState('')
  const [crossRef, setCrossRef] = useState('')
  const [bold, setBold] = useState(false)
  const [italic, setItalic] = useState(false)
  const [pageBold, setPageBold] = useState(false)
  const [pageItalic, setPageItalic] = useState(false)
  const canSubmit = Boolean(main.trim())
  const data = { main, sub, crossRef, bold, italic, pageBold, pageItalic }
  return (
    <RefModal
      title="Mark Index Entry"
      subtitle="Add the selected text or a custom term to the index"
      width={500}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton disabled={!canSubmit} onClick={() => onSubmit(data, true)}>
            Mark All
          </RefButton>
          <RefButton variant="primary" disabled={!canSubmit} onClick={() => onSubmit(data, false)}>
            Mark
          </RefButton>
        </>
      }
    >
      <RefField label="Main entry">
        <input type="text" value={main} onChange={(event) => setMain(event.target.value)} autoFocus />
      </RefField>
      <RefField label="Subentry">
        <input type="text" value={sub} onChange={(event) => setSub(event.target.value)} />
      </RefField>
      <RefSection title="Options">
        <RefField label="Cross-reference">
          <input
            type="text"
            value={crossRef}
            placeholder="e.g. See also Bibliography"
            onChange={(event) => setCrossRef(event.target.value)}
          />
        </RefField>
        <div className="refs-check-row">
          <RefCheck checked={bold} onChange={setBold}>
            Bold main entry
          </RefCheck>
          <RefCheck checked={italic} onChange={setItalic}>
            Italic subentry
          </RefCheck>
          <RefCheck checked={pageBold} onChange={setPageBold}>
            Bold page numbers
          </RefCheck>
          <RefCheck checked={pageItalic} onChange={setPageItalic}>
            Italic page numbers
          </RefCheck>
        </div>
      </RefSection>
      <div className="refs-help" style={{ marginTop: 8 }}>
        Mark adds the entry at the page containing the cursor. Mark All also indexes every other occurrence of the
        main entry in the document.
      </div>
    </RefModal>
  )
}

export function InsertIndexDialog({
  config,
  onSave,
  onClose,
}: {
  config: IndexConfig
  onSave: (config: IndexConfig) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<IndexConfig>({ ...config })
  const set = <K extends keyof IndexConfig>(key: K, value: IndexConfig[K]) => setDraft({ ...draft, [key]: value })
  return (
    <RefModal
      title="Index"
      subtitle="Build an index from marked entries"
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
      <RefField label="Type">
        <select value={draft.type} onChange={(event) => set('type', event.target.value as IndexConfig['type'])}>
          <option value="indented">Indented</option>
          <option value="run-in">Run-in</option>
        </select>
      </RefField>
      <RefField label="Columns">
        <select value={draft.columns} onChange={(event) => set('columns', Number(event.target.value))}>
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
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
      <RefCheck checked={draft.showPageNumbers} onChange={(value) => set('showPageNumbers', value)}>
        Show page numbers
      </RefCheck>
      <RefCheck checked={draft.rightAlign} onChange={(value) => set('rightAlign', value)}>
        Right align page numbers
      </RefCheck>
      <div className="refs-help" style={{ marginTop: 8 }}>
        The index is inserted at the cursor. Existing indexes in the document are refreshed instead of duplicated.
      </div>
    </RefModal>
  )
}
