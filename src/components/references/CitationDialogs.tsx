import { useState } from 'react'
import { Plus } from 'lucide-react'
import { emptySource, formatInText, makeSourceTag, sourceByTag, sourceSummary } from '../../lib/references'
import type { ReferenceStore, Source } from '../../lib/references'
import { RefButton, RefField, RefModal } from './Modal'
import { PlaceholderDialog, SourceDialog } from './SourceDialog'

export function InsertCitationDialog({
  store,
  onChangeStore,
  onInsert,
  onClose,
}: {
  store: ReferenceStore
  onChangeStore: (store: ReferenceStore) => void
  onInsert: (source: Source, locator: string) => void
  onClose: () => void
}) {
  const [selectedTag, setSelectedTag] = useState(store.sources[0]?.tag || '')
  const [locator, setLocator] = useState('')
  const [creating, setCreating] = useState(false)
  const [placeholder, setPlaceholder] = useState(false)
  const selected = sourceByTag(store, selectedTag)
  const preview = selected ? formatInText(selected, store.citationStyle, store.sources.findIndex((source) => source.tag === selected.tag) + 1, locator) : ''

  const addSource = (source: Source) => {
    const tags = store.sources.map((item) => item.tag)
    const resolved = { ...source, tag: tags.includes(source.tag) ? makeSourceTag(source, tags) : source.tag }
    onChangeStore({ ...store, sources: [...store.sources, resolved] })
    setSelectedTag(resolved.tag)
    setCreating(false)
  }

  const addPlaceholder = (name: string) => {
    const source: Source = { ...emptySource(), title: name, tag: name, placeholder: true }
    onChangeStore({ ...store, sources: [...store.sources, source] })
    setSelectedTag(source.tag)
    setPlaceholder(false)
  }

  return (
    <RefModal
      title="Insert Citation"
      subtitle="Pick a source from the current document list"
      width={520}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={() => setPlaceholder(true)}>Add New Placeholder…</RefButton>
          <RefButton onClick={() => setCreating(true)}>
            <Plus size={12} /> Add New Source…
          </RefButton>
          <RefButton variant="primary" disabled={!selected} onClick={() => selected && onInsert(selected, locator)}>
            Insert
          </RefButton>
        </>
      }
    >
      <RefField label="Source">
        <select value={selectedTag} onChange={(event) => setSelectedTag(event.target.value)}>
          {!store.sources.length && <option value="">No sources in the current list</option>}
          {store.sources.map((source) => (
            <option key={source.id} value={source.tag}>
              {source.placeholder ? `${source.title} (placeholder)` : sourceSummary(source)}
            </option>
          ))}
        </select>
      </RefField>
      <RefField label="Locator">
        <input
          type="text"
          value={locator}
          placeholder="Page, chapter, or paragraph (optional)"
          onChange={(event) => setLocator(event.target.value)}
        />
      </RefField>
      <div className="refs-preview">
        {selected ? (
          <>
            <div>{preview}</div>
            <div className="refs-help" style={{ marginTop: 6 }}>
              {selected.placeholder
                ? 'This is a placeholder. Edit the source later to complete its details.'
                : `Tag: ${selected.tag}`}
            </div>
          </>
        ) : (
          <span className="refs-help">Choose a source or add one to cite it.</span>
        )}
      </div>
      {creating && (
        <SourceDialog
          existingTags={store.sources.map((source) => source.tag)}
          onSave={addSource}
          onClose={() => setCreating(false)}
        />
      )}
      {placeholder && <PlaceholderDialog onSave={addPlaceholder} onClose={() => setPlaceholder(false)} />}
    </RefModal>
  )
}

export function EditSourceDialog({
  source,
  existingTags,
  onSave,
  onClose,
}: {
  source: Source
  existingTags: string[]
  onSave: (source: Source) => void
  onClose: () => void
}) {
  return <SourceDialog source={source} existingTags={existingTags} onSave={onSave} onClose={onClose} />
}
