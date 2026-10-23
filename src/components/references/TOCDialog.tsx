import { useState } from 'react'
import { LEADERS, TOC_DESIGNS } from '../../lib/references'
import type { TocConfig, TocDesignId } from '../../lib/references'
import { RefButton, RefCheck, RefField, RefModal, RefSection } from './Modal'

function Thumb({ design }: { design: (typeof TOC_DESIGNS)[number] }) {
  if (design.id === 'manual') {
    return (
      <span className="refs-thumb manual">
        <span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
      </span>
    )
  }
  return (
    <span className={`refs-thumb ${design.id}`}>
      <span className="refs-thumb-title">{design.title}</span>
      <span className="refs-thumb-line">
        <span>Getting started</span>
        <span className="dots" />
        <span>1</span>
      </span>
      <span className="refs-thumb-line" style={{ paddingLeft: 6 }}>
        <span>Save your work</span>
        <span className="dots" />
        <span>2</span>
      </span>
      <span className="refs-thumb-line" style={{ paddingLeft: 12 }}>
        <span>Share a document</span>
        <span className="dots" />
        <span>3</span>
      </span>
    </span>
  )
}

export function TocGallery({
  onPick,
  onCustom,
  onRemove,
}: {
  onPick: (design: TocDesignId) => void
  onCustom: () => void
  onRemove: () => void
}) {
  return (
    <div className="refs-toc-gallery">
      <div className="refs-toc-grid">
        {TOC_DESIGNS.map((design) => (
          <button key={design.id} type="button" className="refs-toc-card" onClick={() => onPick(design.id)}>
            <Thumb design={design} />
            <span className="refs-toc-name">{design.label}</span>
            <span className="refs-toc-desc">{design.description}</span>
          </button>
        ))}
      </div>
      <div className="refs-toc-actions">
        <button type="button" className="refs-toc-card" style={{ textAlign: 'left', padding: 7 }} onClick={onCustom}>
          <span className="refs-toc-name">Custom Table of Contents…</span>
          <span className="refs-toc-desc">Choose levels, page numbers, leaders, and a design</span>
        </button>
        <button type="button" className="refs-toc-card" style={{ textAlign: 'left', padding: 7 }} onClick={onRemove}>
          <span className="refs-toc-name">Remove Table of Contents</span>
          <span className="refs-toc-desc">Delete the generated table; body text is kept</span>
        </button>
      </div>
    </div>
  )
}

export function CustomTocDialog({
  config,
  mode,
  onSave,
  onClose,
}: {
  config: TocConfig
  mode: 'insert' | 'update'
  onSave: (config: TocConfig) => void
  onClose: () => void
}) {
  const [design, setDesign] = useState<TocDesignId>(config.design)
  const [levels, setLevels] = useState(config.levels)
  const [showPageNumbers, setShowPageNumbers] = useState(config.showPageNumbers)
  const [rightAlign, setRightAlign] = useState(config.rightAlign)
  const [leader, setLeader] = useState(config.leader)
  return (
    <RefModal
      title={mode === 'insert' ? 'Table of Contents' : 'Update Table of Contents'}
      subtitle="Build the table from Heading styles and Add Text entries"
      width={520}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton
            variant="primary"
            onClick={() => onSave({ design, levels, showPageNumbers, rightAlign, leader })}
          >
            OK
          </RefButton>
        </>
      }
    >
      <RefField label="Formats">
        <select value={design} onChange={(event) => setDesign(event.target.value as TocDesignId)}>
          {TOC_DESIGNS.filter((item) => !item.manual).map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </RefField>
      <RefField label="Show levels">
        <input
          type="number"
          min={1}
          max={9}
          value={levels}
          onChange={(event) => setLevels(Math.max(1, Math.min(9, Number(event.target.value) || 1)))}
        />
      </RefField>
      <RefField label="Tab leader">
        <select value={leader} onChange={(event) => setLeader(event.target.value)}>
          {LEADERS.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </RefField>
      <div className="refs-check-row">
        <RefCheck checked={showPageNumbers} onChange={setShowPageNumbers}>
          Show page numbers
        </RefCheck>
        <RefCheck checked={rightAlign} onChange={setRightAlign}>
          Right align page numbers
        </RefCheck>
      </div>
      <RefSection title="Preview">
        <div className="refs-preview">
          <div style={{ fontWeight: 700, color: '#2f5496', marginBottom: 6 }}>
            {TOC_DESIGNS.find((item) => item.id === design)?.title || 'Contents'}
          </div>
          {Array.from({ length: levels }, (_, index) => (
            <div key={index} style={{ marginLeft: index * 14, display: 'flex', gap: 6 }}>
              <span>{index === 0 ? 'Getting started' : index === 1 ? 'Save your work' : `Level ${index + 1} entry`}</span>
              {showPageNumbers && (
                <>
                  <span style={{ flex: 1, borderBottom: '1px dotted #8a8a8a', height: 10, marginTop: 4 }} />
                  <span>{index + 1}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </RefSection>
      <div className="refs-help" style={{ marginTop: 10 }}>
        Entries are generated from paragraphs with Heading 1–{levels} styles and from Add Text levels. The table can be
        refreshed later with Update Table.
      </div>
    </RefModal>
  )
}

export function UpdateTocDialog({
  onUpdate,
  onClose,
}: {
  onUpdate: (pageNumbersOnly: boolean) => void
  onClose: () => void
}) {
  const [pageOnly, setPageOnly] = useState(false)
  return (
    <RefModal
      title="Update Table of Contents"
      subtitle="Select whether to rebuild entries or refresh page numbers"
      width={430}
      onClose={onClose}
      footer={
        <>
          <RefButton onClick={onClose}>Cancel</RefButton>
          <RefButton variant="primary" onClick={() => onUpdate(pageOnly)}>
            OK
          </RefButton>
        </>
      }
    >
      <label className="refs-radio-card">
        <input type="radio" checked={pageOnly} onChange={() => setPageOnly(true)} />
        <span>
          Update page numbers only
          <span className="sub">Keep entry text and order, refresh the page references.</span>
        </span>
      </label>
      <label className="refs-radio-card">
        <input type="radio" checked={!pageOnly} onChange={() => setPageOnly(false)} />
        <span>
          Update entire table
          <span className="sub">Regenerate entries from headings and Add Text levels, including page numbers.</span>
        </span>
      </label>
    </RefModal>
  )
}
