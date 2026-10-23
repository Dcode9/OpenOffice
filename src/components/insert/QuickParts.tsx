import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { useWord } from '../../context'
import { insertTable } from '../../editor/actions'
import { insertHtml, insertTextBox, styledRun } from '../../editor/insertActions'
import { DialogButton, FieldRow, InsertModal } from './Modal'
import { MenuItem, MenuLabel, MenuSep } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

type DocProperties = {
  author: string
  category: string
  comments: string
  company: string
  manager: string
  status: string
}

const PROPS_KEY = 'openoffice:document-properties'

const DEFAULT_PROPS: DocProperties = {
  author: 'Dhairya Shah',
  category: 'General',
  comments: 'Created with OpenOffice',
  company: 'OpenOffice',
  manager: '',
  status: 'Draft',
}

function loadProperties(): DocProperties {
  try {
    const raw = localStorage.getItem(PROPS_KEY)
    return raw ? { ...DEFAULT_PROPS, ...JSON.parse(raw) } : DEFAULT_PROPS
  } catch {
    return DEFAULT_PROPS
  }
}

function saveProperties(props: DocProperties) {
  try {
    localStorage.setItem(PROPS_KEY, JSON.stringify(props))
  } catch {
    /* ignore */
  }
}

const PROPERTY_NAMES: { key: keyof DocProperties | 'title'; label: string }[] = [
  { key: 'author', label: 'Author' },
  { key: 'category', label: 'Category' },
  { key: 'comments', label: 'Comments' },
  { key: 'company', label: 'Company' },
  { key: 'manager', label: 'Manager' },
  { key: 'status', label: 'Status' },
  { key: 'title', label: 'Title' },
]

const AUTOTEXT = [
  { id: 'confidential', name: 'CONFIDENTIAL', description: 'Confidential notice', html: '<p style="text-align:center"><strong><span style="color:#c00000">CONFIDENTIAL</span></strong></p><p></p>' },
  { id: 'meeting', name: 'Meeting Notes', description: 'Agenda and action items', html: '<p><strong>Meeting Notes</strong></p><p>Date: </p><p>Attendees: </p><p>Agenda</p><ul><li>Topic 1</li><li>Topic 2</li></ul><p>Action Items</p><ul><li>Owner — Task — Due date</li></ul><p></p>' },
  { id: 'signature', name: 'Signature Block', description: 'Closing and signature line', html: `<p>Sincerely,</p><p><br></p><p>X ________________________________________</p><p>${styledRun('Name · Title · Date', { size: 10, color: '#7f7f7f' })}</p><p></p>` },
  { id: 'closing', name: 'Closing', description: 'Formal sign-off', html: `<p>Best regards,</p><p><br></p><p>${styledRun('Your Name', { size: 12, bold: true })}</p><p></p>` },
  { id: 'date', name: 'Current Date', description: 'Today’s date', html: `<p>${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p><p></p>` },
  { id: 'placeholder', name: 'Lorem Ipsum', description: 'Body text placeholder', html: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.</p><p></p>' },
]

const FIELD_GROUPS: { name: string; fields: { code: string; label: string; value: (props: DocProperties, docTitle: string) => string }[] }[] = [
  {
    name: 'Date and Time',
    fields: [
      { code: 'DATE', label: 'Date', value: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
      { code: 'TIME', label: 'Time', value: () => new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
      { code: 'PRINTDATE', label: 'Print Date', value: () => new Date().toLocaleDateString() },
    ],
  },
  {
    name: 'Document Information',
    fields: [
      { code: 'AUTHOR', label: 'Author', value: (props) => props.author },
      { code: 'COMMENTS', label: 'Comments', value: (props) => props.comments },
      { code: 'FILENAME', label: 'File Name', value: (_props, title) => title },
      { code: 'TITLE', label: 'Title', value: (_props, title) => title },
    ],
  },
  {
    name: 'Numbering',
    fields: [
      { code: 'PAGE', label: 'Page', value: () => '1' },
      { code: 'NUMPAGES', label: 'Number of Pages', value: () => '1' },
      { code: 'SECTION', label: 'Section', value: () => '1' },
    ],
  },
  {
    name: 'User Information',
    fields: [
      { code: 'USERNAME', label: 'User Name', value: (props) => props.author },
      { code: 'USERINITIALS', label: 'User Initials', value: (props) => props.author.split(' ').map((part) => part[0]).join('').slice(0, 3).toUpperCase() },
    ],
  },
]

function AutoTextDialog({ editor, onInserted, onClose }: { editor: Editor; onInserted: (message: string) => void; onClose: () => void }) {
  return (
    <InsertModal
      title="AutoText"
      subtitle="Insert reusable content into your document"
      width={520}
      onClose={onClose}
      footer={<DialogButton onClick={onClose}>Close</DialogButton>}
    >
      <div className="ins-block-list">
        {AUTOTEXT.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className="ins-block-row"
            onClick={() => {
              insertHtml(editor, entry.html)
              onInserted(`AutoText inserted: ${entry.name}`)
              onClose()
            }}
          >
            <span className="ins-block-icon"><FileText size={18} /></span>
            <span>
              <span className="ins-block-name">{entry.name}</span>
              <span className="ins-block-desc">{entry.description}</span>
            </span>
          </button>
        ))}
      </div>
    </InsertModal>
  )
}

function FieldDialog({
  editor,
  docTitle,
  props,
  onInserted,
  onClose,
}: {
  editor: Editor
  docTitle: string
  props: DocProperties
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [group, setGroup] = useState(FIELD_GROUPS[0].name)
  const [selected, setSelected] = useState(FIELD_GROUPS[0].fields[0].code)
  const [showCode, setShowCode] = useState(false)
  const groupDef = FIELD_GROUPS.find((item) => item.name === group) || FIELD_GROUPS[0]
  const field = groupDef.fields.find((item) => item.code === selected) || groupDef.fields[0]

  const insert = () => {
    const value = showCode ? `{ ${field.code} }` : field.value(props, docTitle)
    insertHtml(editor, styledRun(value, { size: 11 }))
    onInserted(`Field inserted: ${field.code}`)
    onClose()
  }

  return (
    <InsertModal
      title="Field"
      subtitle="Insert a field into the document"
      width={520}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={insert}>OK</DialogButton>
        </>
      }
    >
      <FieldRow label="Categories">
        <select
          value={group}
          onChange={(event) => {
            setGroup(event.target.value)
            const next = FIELD_GROUPS.find((item) => item.name === event.target.value)
            if (next) setSelected(next.fields[0].code)
          }}
        >
          {FIELD_GROUPS.map((item) => (
            <option key={item.name} value={item.name}>{item.name}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Field names">
        <select value={selected} onChange={(event) => setSelected(event.target.value)}>
          {groupDef.fields.map((item) => (
            <option key={item.code} value={item.code}>{item.label}</option>
          ))}
        </select>
      </FieldRow>
      <div className="ins-field-preview">
        <span className="ins-field-code">{`{ ${field.code} }`}</span>
        <span className="ins-field-result">{field.value(props, docTitle)}</span>
      </div>
      <label className="ins-check">
        <input type="checkbox" checked={showCode} onChange={(event) => setShowCode(event.target.checked)} />
        Insert field code instead of result
      </label>
    </InsertModal>
  )
}

function PropertiesDialog({
  properties,
  docTitle,
  onSave,
  onClose,
}: {
  properties: DocProperties
  docTitle: string
  onSave: (props: DocProperties) => void
  onClose: () => void
}) {
  const [draft, setDraft] = useState(properties)
  return (
    <InsertModal
      title="Document Properties"
      subtitle={`Properties for ${docTitle}`}
      width={480}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={() => onSave(draft)}>OK</DialogButton>
        </>
      }
    >
      {(Object.keys(draft) as (keyof DocProperties)[]).map((key) => (
        <FieldRow key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
          <input value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} />
        </FieldRow>
      ))}
    </InsertModal>
  )
}

function BuildingBlocksDialog({ editor, onInserted, onClose }: { editor: Editor; onInserted: (message: string) => void; onClose: () => void }) {
  const { setShowHeader, setShowFooter, setHeaderText, setFooterText } = useWord()
  const [selected, setSelected] = useState('cover')
  const blocks = [
    { id: 'cover', name: 'Automatic Cover', gallery: 'Cover Pages', category: 'General', insert: () => insertHtml(editor, '<p class="cover-title">Document Title</p><p class="cover-sub">Subtitle</p><p class="cover-meta">Author Name</p><p class="cover-meta">' + new Date().toLocaleDateString() + '</p><hr data-cover><p></p>') },
    { id: 'header', name: 'Austin Header', gallery: 'Headers', category: 'General', insert: () => { setHeaderText('Document Title'); setShowHeader(true) } },
    { id: 'footer', name: 'Austin Footer', gallery: 'Footers', category: 'General', insert: () => { setFooterText('Document Title   |   Page 1'); setShowFooter(true) } },
    { id: 'textbox', name: 'Austin Quote', gallery: 'Text Boxes', category: 'General', insert: () => insertTextBox(editor, { content: styledRun('“Design is intelligence made visible.”', { size: 16, italic: true, color: '#1f3864' }), borderSides: 'top,bottom', borderColor: '#2b579a', borderWidth: '2px', align: 'center' }) },
    { id: 'table', name: 'Calendar 3×4', gallery: 'Tables', category: 'General', insert: () => insertTable(editor, 4, 3) },
    { id: 'equation', name: 'Quadratic Formula', gallery: 'Equations', category: 'General', insert: () => insertHtml(editor, '<p style="font-family:Cambria Math;font-style:italic;text-align:center">x = (-b ± √(b² - 4ac)) / 2a</p><p></p>') },
    { id: 'toc', name: 'Table of Contents', gallery: 'Tables of Contents', category: 'General', insert: () => insertHtml(editor, '<p class="toc-title">Table of Contents</p><p class="toc-entry toc-l1">Introduction</p><p class="toc-entry toc-l2">Overview</p><p class="toc-entry toc-l2">Details</p><p></p>') },
  ]
  const chosen = blocks.find((block) => block.id === selected) || blocks[0]
  return (
    <InsertModal
      title="Building Blocks Organizer"
      subtitle="Browse and insert reusable document building blocks"
      width={760}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Close</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              chosen.insert()
              onInserted(`Building block inserted: ${chosen.name}`)
              onClose()
            }}
          >
            Insert
          </DialogButton>
        </>
      }
    >
      <div className="ins-bb-table">
        <div className="ins-bb-head">
          <span>Name</span>
          <span>Gallery</span>
          <span>Category</span>
        </div>
        {blocks.map((block) => (
          <button
            key={block.id}
            type="button"
            className={`ins-bb-row${selected === block.id ? ' active' : ''}`}
            onClick={() => setSelected(block.id)}
          >
            <span>{block.name}</span>
            <span>{block.gallery}</span>
            <span>{block.category}</span>
          </button>
        ))}
      </div>
      <div className="ins-bb-preview">
        <div className="ins-bb-preview-title">{chosen.name}</div>
        <div className="ins-bb-preview-body">{chosen.gallery} · {chosen.category} · Inserted at the cursor</div>
      </div>
    </InsertModal>
  )
}

export function QuickPartsMenu({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const { docTitle } = useWord()
  const [showProps, setShowProps] = useState(false)
  const [showAutoText, setShowAutoText] = useState(false)
  const [showFields, setShowFields] = useState(false)
  const [showBlocks, setShowBlocks] = useState(false)
  const [showProperties, setShowProperties] = useState(false)
  const [props, setProps] = useState<DocProperties>(loadProperties)

  const insertProperty = (key: keyof DocProperties | 'title') => {
    const value = key === 'title' ? docTitle : props[key]
    insertHtml(editor, styledRun(value || `[${key}]`, { size: 11 }))
    onInserted(`Document property inserted: ${key === 'title' ? 'Title' : key}`)
    onClose()
  }

  return (
    <div className="ins-quickparts">
      <div className="menu">
        <MenuItem label="AutoText" onClick={() => setShowAutoText(true)} />
        <button type="button" className="menu-item" onClick={() => setShowProps((current) => !current)}>
          <span className="menu-item-icon" />
          <span className="menu-item-label">Document Property</span>
          {showProps ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {showProps && (
          <div className="ins-submenu">
            {PROPERTY_NAMES.map((item) => (
              <button key={item.key} type="button" className="ins-submenu-item" onClick={() => insertProperty(item.key)}>
                <span>{item.label}</span>
                <span className="ins-submenu-value">
                  {item.key === 'title' ? docTitle : props[item.key] || '—'}
                </span>
              </button>
            ))}
            <button type="button" className="ins-submenu-item" onClick={() => setShowProperties(true)}>
              <span>Edit Properties…</span>
              <span className="ins-submenu-value">Author, company, status</span>
            </button>
          </div>
        )}
        <MenuItem label="Field…" onClick={() => setShowFields(true)} />
        <MenuSep />
        <MenuItem label="Building Blocks Organizer…" onClick={() => setShowBlocks(true)} />
      </div>
      {showAutoText && (
        <AutoTextDialog
          editor={editor}
          onInserted={(message) => {
            onInserted(message)
            setShowAutoText(false)
            onClose()
          }}
          onClose={() => setShowAutoText(false)}
        />
      )}
      {showFields && (
        <FieldDialog
          editor={editor}
          docTitle={docTitle}
          props={props}
          onInserted={(message) => {
            onInserted(message)
            setShowFields(false)
            onClose()
          }}
          onClose={() => setShowFields(false)}
        />
      )}
      {showBlocks && (
        <BuildingBlocksDialog
          editor={editor}
          onInserted={(message) => {
            onInserted(message)
            setShowBlocks(false)
            onClose()
          }}
          onClose={() => setShowBlocks(false)}
        />
      )}
      {showProperties && (
        <PropertiesDialog
          properties={props}
          docTitle={docTitle}
          onSave={(next) => {
            setProps(next)
            saveProperties(next)
            onInserted('Document properties updated')
            setShowProperties(false)
          }}
          onClose={() => setShowProperties(false)}
        />
      )}
    </div>
  )
}
