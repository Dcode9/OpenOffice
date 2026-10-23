import { useState } from 'react'
import { emptySource, makeSourceTag, SOURCE_FIELD_LABELS, SOURCE_TYPES } from '../../lib/references'
import type { Source, SourceTypeId } from '../../lib/references'
import { RefButton, RefCheck, RefField, RefModal } from './Modal'

const ALL_FIELDS = ['authors', 'title', 'bookTitle', 'year', 'publisher', 'city', 'edition', 'journal', 'volume', 'issue', 'pages', 'website', 'url', 'accessed', 'institution', 'conference', 'medium']

export function SourceDialog({
  source,
  existingTags,
  onSave,
  onClose,
}: {
  source?: Source
  existingTags: string[]
  onSave: (source: Source) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Source>(source ? { ...source } : emptySource())
  const [showAll, setShowAll] = useState(false)
  const type = SOURCE_TYPES.find((item) => item.id === draft.type) || SOURCE_TYPES[0]
  const fields = showAll ? ALL_FIELDS : type.fields
  const setField = (key: keyof Source, value: string) => setDraft({ ...draft, [key]: value })
  const setType = (value: SourceTypeId) => setDraft({ ...draft, type: value })
  const suggestedTag = source?.tag || makeSourceTag(draft, existingTags)
  const canSave = Boolean(draft.title.trim() || draft.placeholder)
  return (
    <RefModal
      title={source ? 'Edit Source' : 'Create Source'}
      subtitle="Add the fields required by the selected bibliography style"
      width={600}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton
            variant="primary"
            disabled={!canSave}
            onClick={() =>
              onSave({
                ...draft,
                authors: draft.authors.trim(),
                title: draft.title.trim(),
                tag: draft.tag.trim() || suggestedTag,
              })
            }
          >
            OK
          </RefButton>
        </>
      }
    >
      <RefField label="Type of source">
        <select value={draft.type} onChange={(event) => setType(event.target.value as SourceTypeId)}>
          {SOURCE_TYPES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </RefField>
      <RefField label="Author(s)">
        <input
          type="text"
          value={draft.authors}
          placeholder="Last, First; Last, First — or a corporate author"
          onChange={(event) => setField('authors', event.target.value)}
        />
      </RefField>
      <RefField label={SOURCE_FIELD_LABELS.title}>
        <input type="text" value={draft.title} onChange={(event) => setField('title', event.target.value)} />
      </RefField>
      <div className="refs-grid-2">
        {fields
          .filter((field) => field !== 'authors' && field !== 'title')
          .map((field) => (
            <RefField key={field} label={SOURCE_FIELD_LABELS[field] || field}>
              <input
                type={field === 'year' ? 'text' : field === 'url' ? 'url' : 'text'}
                value={String(draft[field as keyof Source] || '')}
                onChange={(event) => setField(field as keyof Source, event.target.value)}
              />
            </RefField>
          ))}
      </div>
      <div className="refs-check-row" style={{ marginTop: 8 }}>
        <RefCheck checked={showAll} onChange={setShowAll}>
          Show All Bibliography Fields
        </RefCheck>
      </div>
      <RefField label="Tag name">
        <input
          type="text"
          value={draft.tag}
          placeholder={suggestedTag}
          onChange={(event) => setField('tag', event.target.value)}
        />
      </RefField>
      <div className="refs-help">
        The tag is the unique key used by in-text citations and the bibliography. Leave it blank to use
        {' '}
        <strong>{suggestedTag}</strong>.
      </div>
    </RefModal>
  )
}

export function PlaceholderDialog({
  onSave,
  onClose,
}: {
  onSave: (name: string) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  return (
    <RefModal
      title="Add New Placeholder"
      subtitle="Create an unresolved citation placeholder"
      width={420}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" disabled={!name.trim()} onClick={() => onSave(name.trim())}>
            OK
          </RefButton>
        </>
      }
    >
      <RefField label="Placeholder name">
        <input
          autoFocus
          type="text"
          value={name}
          placeholder="e.g. Smith 2026"
          onChange={(event) => setName(event.target.value)}
        />
      </RefField>
      <div className="refs-help" style={{ marginTop: 10 }}>
        Placeholder citations appear as [name] until you edit the source and resolve them. Unresolved placeholders are marked in the bibliography.
      </div>
    </RefModal>
  )
}
