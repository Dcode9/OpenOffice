import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { NUMBER_FORMATS } from '../../lib/references'
import type { NoteKind, NoteRecord, NoteSettings, NumberFormat } from '../../lib/references'
import { formatNoteNumber } from '../../lib/references'
import { RefButton, RefCheck, RefField, RefModal, RefSection } from './Modal'

export function NoteInsertDialog({
  kind,
  onInsert,
  onClose,
}: {
  kind: NoteKind
  onInsert: (text: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState('')
  return (
    <RefModal
      title={kind === 'footnote' ? 'Insert Footnote' : 'Insert Endnote'}
      subtitle={kind === 'footnote' ? 'The note is placed at the bottom of the page and at the end of the document context' : 'The note is collected at the end of the document'}
      width={470}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" disabled={!text.trim()} onClick={() => onInsert(text.trim())}>
            Insert
          </RefButton>
        </>
      }
    >
      <RefField label="Note text" wide>
        <textarea
          autoFocus
          className="refs-textarea"
          value={text}
          placeholder={kind === 'footnote' ? 'Type the footnote text' : 'Type the endnote text'}
          onChange={(event) => setText(event.target.value)}
        />
      </RefField>
      <div className="refs-help">
        A superscript reference is inserted at the cursor and the note is appended to the {kind === 'footnote' ? 'footnotes' : 'endnotes'} area at the end of the document.
      </div>
    </RefModal>
  )
}

export function NoteSettingsDialog({
  settings,
  onSave,
  onConvert,
  onClose,
}: {
  settings: NoteSettings
  onSave: (settings: NoteSettings) => void
  onConvert: (mode: 'fn-to-en' | 'en-to-fn' | 'swap') => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<NoteSettings>({ ...settings })
  const set = <K extends keyof NoteSettings>(key: K, value: NoteSettings[K]) => setDraft({ ...draft, [key]: value })
  return (
    <RefModal
      title="Footnote and Endnote"
      subtitle="Set note location, numbering, and conversion options"
      width={560}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" onClick={() => onSave(draft)}>
            Apply
          </RefButton>
        </>
      }
    >
      <RefSection title="Location">
        <RefField label="Footnotes">
          <select value={draft.footnoteLocation} onChange={(event) => set('footnoteLocation', event.target.value)}>
            <option>Bottom of page</option>
            <option>Below text</option>
          </select>
        </RefField>
        <RefField label="Endnotes">
          <select value={draft.endnoteLocation} onChange={(event) => set('endnoteLocation', event.target.value)}>
            <option>End of document</option>
            <option>End of section</option>
          </select>
        </RefField>
      </RefSection>
      <RefSection title="Format">
        <div className="refs-grid-2">
          <RefField label="Footnote format">
            <select
              value={draft.footnoteFormat}
              onChange={(event) => set('footnoteFormat', event.target.value as NumberFormat)}
            >
              {NUMBER_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </RefField>
          <RefField label="Endnote format">
            <select
              value={draft.endnoteFormat}
              onChange={(event) => set('endnoteFormat', event.target.value as NumberFormat)}
            >
              {NUMBER_FORMATS.map((format) => (
                <option key={format.id} value={format.id}>
                  {format.label}
                </option>
              ))}
            </select>
          </RefField>
          <RefField label="Start at">
            <input
              type="number"
              min={1}
              value={draft.startAt}
              onChange={(event) => set('startAt', Math.max(1, Number(event.target.value) || 1))}
            />
          </RefField>
          <RefField label="Numbering">
            <select value={draft.footnoteRestart} onChange={(event) => set('footnoteRestart', event.target.value)}>
              <option>Continuous</option>
              <option>Restart each section</option>
              <option>Restart each page</option>
            </select>
          </RefField>
        </div>
        <RefCheck checked={draft.endnoteRestart === 'Continuous'} onChange={(checked) => set('endnoteRestart', checked ? 'Continuous' : 'Restart each section')}>
          Number endnotes continuously
        </RefCheck>
      </RefSection>
      <RefSection title="Convert notes">
        <div className="refs-inline">
          <RefButton small onClick={() => onConvert('fn-to-en')}>
            Convert all footnotes to endnotes
          </RefButton>
          <RefButton small onClick={() => onConvert('en-to-fn')}>
            Convert all endnotes to footnotes
          </RefButton>
          <RefButton small onClick={() => onConvert('swap')}>
            Swap footnotes and endnotes
          </RefButton>
        </div>
        <div className="refs-help" style={{ marginTop: 8 }}>
          Conversion keeps note text and rebuilds references and the notes area.
        </div>
      </RefSection>
    </RefModal>
  )
}

export function ShowNotesDialog({
  footnotes,
  endnotes,
  settings,
  onSave,
  onClose,
}: {
  footnotes: NoteRecord[]
  endnotes: NoteRecord[]
  settings: NoteSettings
  onSave: (footnotes: NoteRecord[], endnotes: NoteRecord[]) => void
  onClose: () => void
}) {
  const [tab, setTab] = useState<NoteKind>('footnote')
  const [fn, setFn] = useState<NoteRecord[]>(footnotes.map((note) => ({ ...note })))
  const [en, setEn] = useState<NoteRecord[]>(endnotes.map((note) => ({ ...note })))
  const list = tab === 'footnote' ? fn : en
  const setList = tab === 'footnote' ? setFn : setEn
  const update = (id: string, text: string) => setList(list.map((note) => (note.id === id ? { ...note, text } : note)))
  const remove = (id: string) => setList(list.filter((note) => note.id !== id))
  return (
    <RefModal
      title="Notes"
      subtitle="Edit the note text stored in the document"
      width={600}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" onClick={() => onSave(fn, en)}>
            Apply
          </RefButton>
        </>
      }
    >
      <div className="refs-note-tabs">
        <button
          type="button"
          className={`refs-tab${tab === 'footnote' ? ' active' : ''}`}
          onClick={() => setTab('footnote')}
        >
          All Footnotes ({fn.length})
        </button>
        <button
          type="button"
          className={`refs-tab${tab === 'endnote' ? ' active' : ''}`}
          onClick={() => setTab('endnote')}
        >
          All Endnotes ({en.length})
        </button>
      </div>
      {!list.length && <div className="refs-note-empty">No {tab === 'footnote' ? 'footnotes' : 'endnotes'} in this document.</div>}
      {list.map((note, index) => (
        <div className="refs-note-item" key={note.id}>
          <div className="refs-note-item-head">
            <span className="refs-note-ref">{formatNoteNumber(index, settings, tab)}</span>
            <span>Note {index + 1}</span>
            <button className="refs-icon-btn" type="button" title="Delete note text" onClick={() => remove(note.id)}>
              <Trash2 size={13} />
            </button>
          </div>
          <textarea
            className="refs-textarea"
            value={note.text}
            onChange={(event) => update(note.id, event.target.value)}
          />
        </div>
      ))}
    </RefModal>
  )
}
