import { useState } from 'react'
import { LEADERS, NUMBER_FORMATS } from '../../lib/references'
import type { CrossRefTarget, CrossRefType, NumberFormat, TofConfig } from '../../lib/references'
import { RefButton, RefCheck, RefField, RefModal } from './Modal'

const BASE_LABELS = ['Figure', 'Table', 'Equation']

export function InsertCaptionDialog({
  customLabels,
  onInsert,
  onClose,
}: {
  customLabels: string[]
  onInsert: (input: {
    label: string
    text: string
    position: 'above' | 'below'
    excludeLabel: boolean
    format: NumberFormat
    includeChapter: boolean
    chapter: string
  }) => void
  onClose: () => void
}) {
  const labels = [...BASE_LABELS, ...customLabels.filter((label) => !BASE_LABELS.includes(label))]
  const [label, setLabel] = useState(labels[0])
  const [newLabel, setNewLabel] = useState('')
  const [text, setText] = useState('')
  const [position, setPosition] = useState<'above' | 'below'>('below')
  const [excludeLabel, setExcludeLabel] = useState(false)
  const [format, setFormat] = useState<NumberFormat>('decimal')
  const [includeChapter, setIncludeChapter] = useState(false)
  const [chapter, setChapter] = useState('1')
  const [creatingLabel, setCreatingLabel] = useState(false)
  const finalLabel = creatingLabel && newLabel.trim() ? newLabel.trim() : label
  return (
    <RefModal
      title="Caption"
      subtitle="Add a numbered caption to the selected object or paragraph"
      width={520}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton
            variant="primary"
            onClick={() =>
              onInsert({ label: finalLabel, text, position, excludeLabel, format, includeChapter, chapter })
            }
          >
            OK
          </RefButton>
        </>
      }
    >
      <RefField label="Caption">
        {creatingLabel ? (
          <div className="refs-inline">
            <input
              className="refs-input"
              autoFocus
              type="text"
              placeholder="New label"
              value={newLabel}
              onChange={(event) => setNewLabel(event.target.value)}
            />
            <RefButton small onClick={() => setCreatingLabel(false)}>
              Existing
            </RefButton>
          </div>
        ) : (
          <div className="refs-inline">
            <select value={label} onChange={(event) => setLabel(event.target.value)}>
              {labels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <RefButton small onClick={() => setCreatingLabel(true)}>
              New Label…
            </RefButton>
          </div>
        )}
      </RefField>
      <RefField label="Position">
        <select value={position} onChange={(event) => setPosition(event.target.value as 'above' | 'below')}>
          <option value="above">Above selected item</option>
          <option value="below">Below selected item</option>
        </select>
      </RefField>
      <RefField label="Numbering">
        <select value={format} onChange={(event) => setFormat(event.target.value as NumberFormat)}>
          {NUMBER_FORMATS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </RefField>
      <RefCheck checked={excludeLabel} onChange={setExcludeLabel}>
        Exclude label from caption
      </RefCheck>
      <RefCheck checked={includeChapter} onChange={setIncludeChapter}>
        Include chapter number
      </RefCheck>
      {includeChapter && (
        <RefField label="Chapter starts with">
          <input type="text" value={chapter} onChange={(event) => setChapter(event.target.value)} />
        </RefField>
      )}
      <RefField label="Caption text" wide>
        <input
          type="text"
          value={text}
          placeholder="Describe the figure, table, or equation"
          onChange={(event) => setText(event.target.value)}
        />
      </RefField>
      <div className="refs-caption-preview">
        {excludeLabel ? '' : `${finalLabel} 1`}
        {!excludeLabel && text ? ': ' : ''}
        {text}
      </div>
    </RefModal>
  )
}

export function TableOfFiguresDialog({
  config,
  customLabels,
  mode,
  onSave,
  onClose,
}: {
  config: TofConfig
  customLabels: string[]
  mode: 'insert' | 'update'
  onSave: (config: TofConfig, pageNumbersOnly: boolean) => void
  onClose: () => void
}) {
  const labels = [...BASE_LABELS, ...customLabels.filter((label) => !BASE_LABELS.includes(label))]
  const [draft, setDraft] = useState<TofConfig>({ ...config })
  const [pageOnly, setPageOnly] = useState(false)
  const set = <K extends keyof TofConfig>(key: K, value: TofConfig[K]) => setDraft({ ...draft, [key]: value })
  return (
    <RefModal
      title={mode === 'insert' ? 'Insert Table of Figures' : 'Update Table of Figures'}
      subtitle="Collect captions with a matching label"
      width={500}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" onClick={() => onSave(draft, pageOnly)}>
            OK
          </RefButton>
        </>
      }
    >
      <RefField label="Caption label">
        <div className="refs-inline">
          <select value={draft.label} onChange={(event) => set('label', event.target.value)}>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <input
            className="refs-input"
            type="text"
            value={draft.label}
            onChange={(event) => set('label', event.target.value)}
            aria-label="Custom caption label"
          />
        </div>
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
      <RefCheck checked={draft.includeLabel} onChange={(value) => set('includeLabel', value)}>
        Include label and number
      </RefCheck>
      <RefCheck checked={draft.showPageNumbers} onChange={(value) => set('showPageNumbers', value)}>
        Show page numbers
      </RefCheck>
      <RefCheck checked={draft.rightAlign} onChange={(value) => set('rightAlign', value)}>
        Right align page numbers
      </RefCheck>
      {mode === 'update' && (
        <RefCheck checked={pageOnly} onChange={setPageOnly}>
          Update page numbers only
        </RefCheck>
      )}
      <div className="refs-help" style={{ marginTop: 8 }}>
        Captions are collected from the whole document. Use Insert Caption to add entries first.
      </div>
    </RefModal>
  )
}

const XREF_MODES = [
  { id: 'full', label: 'Full reference' },
  { id: 'page', label: 'Page number' },
  { id: 'label', label: 'Only label and number' },
  { id: 'caption', label: 'Only caption text' },
  { id: 'above-below', label: 'Above/below' },
]

export function CrossReferenceDialog({
  getTargets,
  onInsert,
  onClose,
}: {
  getTargets: (type: CrossRefType) => CrossRefTarget[]
  onInsert: (target: CrossRefTarget, mode: string, hyperlink: boolean, aboveBelow: boolean) => void
  onClose: () => void
}) {
  const [type, setType] = useState<CrossRefType>('Heading')
  const [selectedId, setSelectedId] = useState('')
  const [mode, setMode] = useState('full')
  const [hyperlink, setHyperlink] = useState(false)
  const [aboveBelow, setAboveBelow] = useState(false)
  const targets = getTargets(type)
  const selected = targets.find((target) => target.id === selectedId) || targets[0]
  return (
    <RefModal
      title="Cross-reference"
      subtitle="Insert a reference to a heading, caption, or bookmark"
      width={540}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton
            variant="primary"
            disabled={!selected}
            onClick={() => selected && onInsert(selected, mode, hyperlink, aboveBelow)}
          >
            Insert
          </RefButton>
        </>
      }
    >
      <RefField label="Reference type">
        <select
          value={type}
          onChange={(event) => {
            setType(event.target.value as CrossRefType)
            setSelectedId('')
          }}
        >
          <option value="Heading">Heading</option>
          <option value="Figure">Figure</option>
          <option value="Table">Table</option>
          <option value="Bookmark">Bookmark</option>
        </select>
      </RefField>
      <RefField label="Insert reference to">
        <select value={mode} onChange={(event) => setMode(event.target.value)}>
          {XREF_MODES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </RefField>
      <div className="refs-section-title">For which item</div>
      <div className="refs-xref-list">
        {!targets.length && (
          <div className="refs-list-empty">
            No {type.toLowerCase()} items found. Add headings, captions, or bookmarks first.
          </div>
        )}
        {targets.map((target, index) => (
          <button
            key={`${target.id}-${index}`}
            type="button"
            className={`refs-list-item${selected?.id === target.id ? ' active' : ''}`}
            onClick={() => setSelectedId(target.id)}
          >
            <span>{target.label}</span>
            <span className="meta">p. {target.page}</span>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 8 }}>
        <RefCheck checked={hyperlink} onChange={setHyperlink}>
          Insert as hyperlink
        </RefCheck>
        <RefCheck checked={aboveBelow} onChange={setAboveBelow}>
          Include above/below
        </RefCheck>
      </div>
    </RefModal>
  )
}
