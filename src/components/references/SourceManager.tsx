import { useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { formatBibliographyEntry, makeSourceTag, sourceSummary } from '../../lib/references'
import type { ReferenceStore, Source } from '../../lib/references'
import { RefButton, RefModal } from './Modal'
import { SourceDialog } from './SourceDialog'

type Side = 'master' | 'current'

export function SourceManager({
  store,
  onCommit,
  onClose,
}: {
  store: ReferenceStore
  onCommit: (store: ReferenceStore) => void
  onClose: () => void
}) {
  const [master, setMaster] = useState<Source[]>(store.masterSources.map((source) => ({ ...source })))
  const [current, setCurrent] = useState<Source[]>(store.sources.map((source) => ({ ...source })))
  const [side, setSide] = useState<Side>('current')
  const [selectedId, setSelectedId] = useState<string>('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Source | null | 'new'>(null)
  const list = side === 'master' ? master : current
  const selected = list.find((source) => source.id === selectedId) || null
  const filtered = side === 'master' && search.trim()
    ? list.filter((source) => sourceSummary(source).toLowerCase().includes(search.trim().toLowerCase()))
    : list

  const commit = (nextMaster: Source[], nextCurrent: Source[]) => {
    setMaster(nextMaster)
    setCurrent(nextCurrent)
    onCommit({ ...store, masterSources: nextMaster, sources: nextCurrent })
  }

  const saveSource = (source: Source) => {
    const tags = [...master, ...current].filter((item) => item.id !== source.id).map((item) => item.tag)
    const resolved = { ...source, tag: tags.includes(source.tag) ? makeSourceTag(source, tags) : source.tag }
    const exists = list.some((item) => item.id === source.id)
    const nextList = exists ? list.map((item) => (item.id === source.id ? resolved : item)) : [...list, resolved]
    setSelectedId(resolved.id)
    if (side === 'master') commit(nextList, current)
    else commit(master, nextList)
    setEditing(null)
  }

  const remove = () => {
    if (!selected) return
    const nextList = list.filter((item) => item.id !== selected.id)
    setSelectedId('')
    if (side === 'master') commit(nextList, current)
    else commit(master, nextList)
  }

  const copyToCurrent = () => {
    if (!selected) return
    if (current.some((source) => source.tag === selected.tag)) return
    commit(master, [...current, { ...selected }])
    setSide('current')
  }

  const removeFromCurrent = () => {
    if (!selected) return
    const next = current.filter((source) => source.id !== selected.id)
    commit(master, next)
  }

  const preview = selected || (side === 'master' ? master[0] : current[0])

  return (
    <RefModal
      title="Source Manager"
      subtitle="Copy sources between the master list and the current document"
      width={860}
      onClose={onClose}
      footer={
        <>
          <span className="refs-foot-note">
            {current.length} source{current.length === 1 ? '' : 's'} in current list · {master.length} in master list
          </span>
          <RefButton variant="primary" onClick={onClose}>
            Close
          </RefButton>
        </>
      }
    >
      <div className="refs-inline" style={{ marginBottom: 10 }}>
        <input
          className="refs-input"
          type="text"
          placeholder="Search master list"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <RefButton small onClick={() => setEditing('new')}>
          <Plus size={12} /> New…
        </RefButton>
        <RefButton small disabled={!selected} onClick={() => selected && setEditing(selected)}>
          <Pencil size={12} /> Edit…
        </RefButton>
        <RefButton small variant="danger" disabled={!selected} onClick={remove}>
          <Trash2 size={12} /> Delete
        </RefButton>
      </div>
      <div className="refs-sources">
        <div>
          <div className="refs-section-title">Master List</div>
          <div className="refs-list">
            {!filtered.length && <div className="refs-list-empty">No sources in the master list.</div>}
            {filtered.map((source) => (
              <button
                key={source.id}
                type="button"
                className={`refs-list-item${side === 'master' && selectedId === source.id ? ' active' : ''}`}
                onClick={() => {
                  setSide('master')
                  setSelectedId(source.id)
                }}
              >
                <span>{sourceSummary(source)}</span>
                <span className="meta">{source.tag}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="refs-sources-mid">
          <RefButton small disabled={!selected || side !== 'master'} title="Copy to current list" onClick={copyToCurrent}>
            <ChevronRight size={14} />
          </RefButton>
          <RefButton small disabled={!selected || side !== 'current'} title="Remove from current list" onClick={removeFromCurrent}>
            <ChevronLeft size={14} />
          </RefButton>
        </div>
        <div>
          <div className="refs-section-title">Current List</div>
          <div className="refs-list">
            {!current.length && <div className="refs-list-empty">No sources in the current list.</div>}
            {current.map((source) => (
              <button
                key={source.id}
                type="button"
                className={`refs-list-item${side === 'current' && selectedId === source.id ? ' active' : ''}`}
                onClick={() => {
                  setSide('current')
                  setSelectedId(source.id)
                }}
              >
                <span>{sourceSummary(source)}</span>
                <span className="meta">{source.tag}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="refs-section-title" style={{ marginTop: 12 }}>
        Preview
      </div>
      <div className="refs-preview">
        {preview ? (
          <div dangerouslySetInnerHTML={{ __html: formatBibliographyEntry(preview, store.citationStyle) }} />
        ) : (
          <span className="refs-help">Select a source to preview its bibliography entry.</span>
        )}
      </div>
      {editing && (
        <SourceDialog
          source={editing === 'new' ? undefined : editing}
          existingTags={[...master, ...current].filter((item) => editing === 'new' || item.id !== editing.id).map((item) => item.tag)}
          onSave={saveSource}
          onClose={() => setEditing(null)}
        />
      )}
    </RefModal>
  )
}
