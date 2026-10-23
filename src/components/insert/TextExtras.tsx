import { useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Calendar, FileBox, Minus, PenTool } from 'lucide-react'
import { insertHtml, insertSvg, styledRun } from '../../editor/insertActions'
import { DialogButton, FieldRow, InsertModal } from './Modal'
import { MenuItem, Popover, SmallButton } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

function SignatureLineDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [signer, setSigner] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [instructions, setInstructions] = useState('Before signing, please review this document.')
  const [showDate, setShowDate] = useState(true)

  const insert = () => {
    const name = signer || 'Signature'
    const meta = [title, email].filter(Boolean).map((value) => styledRun(value, { size: 10, color: '#7f7f7f' })).join('<br>')
    const date = showDate ? `<p>${styledRun(`Date: ${new Date().toLocaleDateString()}`, { size: 10, color: '#7f7f7f' })}</p>` : ''
    insertHtml(
      editor,
      `<p style="margin-top:18pt">X ________________________________________</p><p>${styledRun(name, { size: 11, bold: true })}${meta ? `<br>${meta}` : ''}</p>${date}<p>${styledRun(instructions, { size: 9, color: '#9a9a9a', italic: true })}</p><p></p>`,
    )
    onInserted(`Signature line inserted for ${name}`)
    onClose()
  }

  return (
    <InsertModal
      title="Signature Setup"
      subtitle="Add a Microsoft Office signature line"
      width={520}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton variant="primary" onClick={insert}>OK</DialogButton>
        </>
      }
    >
      <FieldRow label="Suggested signer">
        <input value={signer} onChange={(event) => setSigner(event.target.value)} placeholder="Full name" autoFocus />
      </FieldRow>
      <FieldRow label="Suggested signer's title">
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Job title" />
      </FieldRow>
      <FieldRow label="Suggested signer's e-mail address">
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" />
      </FieldRow>
      <FieldRow label="Instructions to the signer">
        <input value={instructions} onChange={(event) => setInstructions(event.target.value)} />
      </FieldRow>
      <label className="ins-check">
        <input type="checkbox" checked={showDate} onChange={(event) => setShowDate(event.target.checked)} />
        Show sign date in signature line
      </label>
    </InsertModal>
  )
}

export function SignatureLineMenu({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Popover
        width={230}
        trigger={({ toggle }) => <SmallButton icon={<PenTool size={15} />} label="Signature Line" wide onClick={toggle} />}
      >
        {(close) => (
          <div className="menu">
            <MenuItem label="Microsoft Office Signature Line…" onClick={() => { setOpen(true); close() }} />
            <MenuItem label="Add Signature Service…" onClick={() => { onInserted('Signature service is already connected'); close() }} />
          </div>
        )}
      </Popover>
      {open && (
        <SignatureLineDialog
          editor={editor}
          onInserted={(message) => {
            onInserted(message)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

const DATE_FORMATS: { id: string; label: (date: Date) => string }[] = [
  { id: 'short', label: (date) => date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) },
  { id: 'long', label: (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
  { id: 'medium', label: (date) => date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
  { id: 'dmy', label: (date) => date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) },
  { id: 'time', label: (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) },
  { id: 'datetime', label: (date) => date.toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) },
]

function DateTimeDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [format, setFormat] = useState('medium')
  const [automatic, setAutomatic] = useState(false)
  const now = new Date()
  const selected = DATE_FORMATS.find((item) => item.id === format) || DATE_FORMATS[0]

  return (
    <InsertModal
      title="Date and Time"
      subtitle="Insert the current date and time"
      width={460}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              insertHtml(editor, styledRun(selected.label(new Date()), { size: 11 }))
              onInserted(automatic ? 'Automatic date field inserted' : 'Date and time inserted')
              onClose()
            }}
          >
            OK
          </DialogButton>
        </>
      }
    >
      <FieldRow label="Available formats">
        <select value={format} onChange={(event) => setFormat(event.target.value)}>
          {DATE_FORMATS.map((item) => (
            <option key={item.id} value={item.id}>{item.label(now)}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Language">
        <select defaultValue="en-US">
          <option value="en-US">English (United States)</option>
          <option value="en-GB">English (United Kingdom)</option>
        </select>
      </FieldRow>
      <label className="ins-check">
        <input type="checkbox" checked={automatic} onChange={(event) => setAutomatic(event.target.checked)} />
        Update automatically
      </label>
    </InsertModal>
  )
}

export function DateTimeMenu({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Popover
        width={230}
        trigger={({ toggle }) => <SmallButton icon={<Calendar size={15} />} label="Date & Time" wide onClick={toggle} />}
      >
        {(close) => (
          <div className="menu">
            <MenuItem
              label={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              onClick={() => {
                insertHtml(editor, styledRun(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), { size: 11 }))
                onInserted('Date inserted')
                close()
              }}
            />
            <MenuItem
              label={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              onClick={() => {
                insertHtml(editor, styledRun(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }), { size: 11 }))
                onInserted('Time inserted')
                close()
              }}
            />
            <MenuItem label="Date & Time…" onClick={() => { setOpen(true); close() }} />
          </div>
        )}
      </Popover>
      {open && (
        <DateTimeDialog
          editor={editor}
          onInserted={(message) => {
            onInserted(message)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

const OBJECT_TYPES = [
  { id: 'bitmap', name: 'Bitmap Image' },
  { id: 'worksheet', name: 'Microsoft Excel Worksheet' },
  { id: 'presentation', name: 'Microsoft PowerPoint Presentation' },
  { id: 'package', name: 'Package' },
]

function objectSvg(type: string, file: string) {
  const accent = type === 'worksheet' ? '#217346' : type === 'presentation' ? '#c43e1c' : type === 'package' ? '#7f6000' : '#2b579a'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="210" viewBox="0 0 360 210"><rect width="360" height="210" rx="10" fill="#ffffff" stroke="#d9e4ef"/><rect x="28" y="28" width="72" height="88" rx="6" fill="${accent}" opacity=".14"/><rect x="42" y="44" width="44" height="8" rx="4" fill="${accent}"/><rect x="42" y="60" width="34" height="6" rx="3" fill="${accent}" opacity=".55"/><rect x="42" y="74" width="40" height="6" rx="3" fill="${accent}" opacity=".4"/><rect x="42" y="88" width="30" height="6" rx="3" fill="${accent}" opacity=".3"/><text x="120" y="58" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" fill="#2f3b4a">${file || 'Embedded object'}</text><text x="120" y="80" font-family="Segoe UI, sans-serif" font-size="11" fill="#7f8c9b">${OBJECT_TYPES.find((item) => item.id === type)?.name || 'Object'}</text><text x="120" y="102" font-family="Segoe UI, sans-serif" font-size="10" fill="#9aa8b6">Double-click to edit</text><rect x="28" y="140" width="304" height="42" rx="5" fill="#f3f6fa"/><text x="44" y="166" font-family="Segoe UI, sans-serif" font-size="10" fill="#7f8c9b">OLE object placeholder · ${type.toUpperCase()}</text></svg>`
}

function ObjectDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [type, setType] = useState('bitmap')
  const [file, setFile] = useState('')
  const [asIcon, setAsIcon] = useState(false)

  return (
    <InsertModal
      title="Object"
      subtitle="Insert an embedded object"
      width={520}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              insertSvg(editor, objectSvg(type, file || (asIcon ? 'Object' : '')), `${OBJECT_TYPES.find((item) => item.id === type)?.name || 'Object'}`)
              onInserted(`${OBJECT_TYPES.find((item) => item.id === type)?.name || 'Object'} inserted`)
              onClose()
            }}
          >
            OK
          </DialogButton>
        </>
      }
    >
      <FieldRow label="Object type">
        <select value={type} onChange={(event) => setType(event.target.value)}>
          {OBJECT_TYPES.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="File name">
        <input value={file} onChange={(event) => setFile(event.target.value)} placeholder="Embedded object" />
      </FieldRow>
      <label className="ins-check">
        <input type="checkbox" checked={asIcon} onChange={(event) => setAsIcon(event.target.checked)} />
        Display as icon
      </label>
      <div className="ins-object-preview" dangerouslySetInnerHTML={{ __html: objectSvg(type, file || 'Embedded object') }} />
    </InsertModal>
  )
}

export function ObjectMenu({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  return (
    <>
      <Popover
        width={230}
        trigger={({ toggle }) => <SmallButton icon={<FileBox size={15} />} label="Object" wide onClick={toggle} />}
      >
        {(close) => (
          <div className="menu">
            <MenuItem label="Object…" onClick={() => { setOpen(true); close() }} />
            <MenuItem label="Text from File…" onClick={() => fileRef.current?.click()} />
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv"
              className="hidden-input"
              onChange={(event) => {
                const selected = event.target.files?.[0]
                if (selected) {
                  const reader = new FileReader()
                  reader.onload = () => {
                    const text = String(reader.result || '')
                    insertHtml(editor, text.split(/\r?\n/).filter((line) => line.trim()).map((line) => `<p>${line}</p>`).join('') + '<p></p>')
                    onInserted(`Text inserted from ${selected.name}`)
                    close()
                  }
                  reader.readAsText(selected)
                }
                event.target.value = ''
              }}
            />
          </div>
        )}
      </Popover>
      {open && (
        <ObjectDialog
          editor={editor}
          onInserted={(message) => {
            onInserted(message)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

const LINE_STYLES = [
  { id: 'single', name: 'Single line', dash: '' },
  { id: 'double', name: 'Double line', dash: '' },
  { id: 'dashed', name: 'Dashed', dash: '8 5' },
  { id: 'dotted', name: 'Dotted', dash: '2 5' },
  { id: 'thick', name: 'Thick line', dash: '' },
  { id: 'wave', name: 'Wave', dash: '' },
]

function HorizontalLineDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [style, setStyle] = useState('single')
  const [color, setColor] = useState('#2b579a')
  const [weight, setWeight] = useState(2)

  const lineSvg = () => {
    const selected = LINE_STYLES.find((item) => item.id === style) || LINE_STYLES[0]
    let body = ''
    if (selected.id === 'double') {
      body = `<line x1="0" y1="8" x2="560" y2="8" stroke="${color}" stroke-width="1.5"/><line x1="0" y1="13" x2="560" y2="13" stroke="${color}" stroke-width="1.5"/>`
    } else if (selected.id === 'wave') {
      body = `<path d="M0 12 Q20 2 40 12 T80 12 T120 12 T160 12 T200 12 T240 12 T280 12 T320 12 T360 12 T400 12 T440 12 T480 12 T520 12 T560 12" fill="none" stroke="${color}" stroke-width="2"/>`
    } else {
      body = `<line x1="0" y1="12" x2="560" y2="12" stroke="${color}" stroke-width="${style === 'thick' ? Math.max(4, weight) : weight}" ${selected.dash ? `stroke-dasharray="${selected.dash}"` : ''}/>`
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="24" viewBox="0 0 560 24">${body}</svg>`
  }

  return (
    <InsertModal
      title="Horizontal Line"
      subtitle="Choose a line style and color"
      width={440}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              insertSvg(editor, lineSvg(), 'Horizontal line')
              onInserted('Horizontal line inserted')
              onClose()
            }}
          >
            OK
          </DialogButton>
        </>
      }
    >
      <FieldRow label="Style">
        <select value={style} onChange={(event) => setStyle(event.target.value)}>
          {LINE_STYLES.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </FieldRow>
      <FieldRow label="Color">
        <input type="color" value={color} onChange={(event) => setColor(event.target.value)} />
      </FieldRow>
      <FieldRow label="Weight">
        <input type="number" min={1} max={8} value={weight} onChange={(event) => setWeight(Number(event.target.value) || 1)} />
      </FieldRow>
      <div className="ins-line-preview" dangerouslySetInnerHTML={{ __html: lineSvg() }} />
    </InsertModal>
  )
}

export function HorizontalLineButton({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <SmallButton icon={<Minus size={15} />} label="Horizontal Line" wide onClick={() => setOpen(true)} />
      {open && (
        <HorizontalLineDialog
          editor={editor}
          onInserted={(message) => {
            onInserted(message)
            setOpen(false)
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
