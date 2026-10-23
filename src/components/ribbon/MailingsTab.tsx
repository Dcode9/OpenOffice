import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Contact,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Highlighter,
  ListChecks,
  Mail,
  MailOpen,
  Merge,
  Printer,
  Send,
  Table2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import { insertText } from '../../editor/actions'

const FIELDS = ['First Name', 'Last Name', 'Company', 'Address', 'City', 'State', 'Postal Code', 'Email']

function BigMenu({
  icon,
  label,
  width = 240,
  disabled,
  children,
}: {
  icon: ReactNode
  label: string
  width?: number
  disabled?: boolean
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={label} disabled={disabled}>
          <span className="rb-big-icon">{icon}</span>
          <span className="rb-big-label">{label}</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {children}
    </Popover>
  )
}

function SmallMenu({
  icon,
  label,
  width = 220,
  disabled,
  children,
}: {
  icon?: ReactNode
  label: string
  width?: number
  disabled?: boolean
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => <SmallButton icon={icon} label={label} wide caret disabled={disabled} onClick={toggle} onCaret={toggle} />}
    >
      {children}
    </Popover>
  )
}

export default function MailingsTab() {
  const { editor, toast } = useWord()
  const [recipients, setRecipients] = useState(false)
  const [preview, setPreview] = useState(false)
  const [record, setRecord] = useState(1)
  const [highlight, setHighlight] = useState(true)
  if (!editor) return null
  const total = 3

  const connectList = () => {
    setRecipients(true)
    toast('Recipient list connected (3 records)')
  }

  const insertField = (f: string) => {
    editor.chain().focus().insertContent(`«${f}»`).run()
  }

  return (
    <>
      <RibbonGroup label="Create">
        <BigButton icon={<Mail size={22} />} label="Envelopes" onClick={() => toast('Envelopes and Labels')} />
        <BigButton icon={<Table2 size={22} />} label="Labels" onClick={() => toast('Envelopes and Labels')} />
      </RibbonGroup>

      <RibbonGroup label="Start Mail Merge">
        <BigMenu icon={<MailOpen size={22} />} label="Start Mail Merge" width={260}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Letters" onClick={() => { toast('Main document: Letters'); close() }} />
              <MenuItem label="E-mail Messages…" onClick={() => { toast('Main document: E-mail Messages'); close() }} />
              <MenuItem label="Envelopes…" onClick={() => { toast('Main document: Envelopes'); close() }} />
              <MenuItem label="Labels…" onClick={() => { toast('Main document: Labels'); close() }} />
              <MenuItem label="Directory" onClick={() => { toast('Main document: Directory'); close() }} />
              <MenuSep />
              <MenuItem label="Normal Word Document" onClick={() => { toast('Normal Word Document'); close() }} />
              <MenuSep />
              <MenuItem label="Step-by-Step Mail Merge Wizard…" onClick={() => { toast('Mail Merge Wizard'); close() }} />
            </div>
          )}
        </BigMenu>
        <BigMenu icon={<UserPlus size={22} />} label="Select Recipients" width={240}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Type a New List…" onClick={() => { connectList(); close() }} />
              <MenuItem label="Use an Existing List…" onClick={() => { connectList(); close() }} />
              <MenuItem label="Choose from Outlook Contacts…" onClick={() => { connectList(); close() }} />
            </div>
          )}
        </BigMenu>
        <BigButton icon={<Users size={22} />} label="Edit Recipient List" disabled={!recipients} onClick={() => toast('Mail Merge Recipients')} />
      </RibbonGroup>

      <RibbonGroup label="Write & Insert Fields">
        <BigButton icon={<Contact size={22} />} label="Address Block…" disabled={!recipients} onClick={() => insertText(editor, '«Address Block»')} />
        <BigButton icon={<UserCheck size={22} />} label="Greeting Line…" disabled={!recipients} onClick={() => insertText(editor, '«Greeting Line»')} />
        <BigMenu icon={<Table2 size={22} />} label="Insert Merge Field" width={210} disabled={!recipients}>
          {(close) => (
            <div className="menu">
              <MenuLabel>Insert Merge Field</MenuLabel>
              {FIELDS.map((f) => (
                <MenuItem key={f} label={f} onClick={() => { insertField(f); close() }} />
              ))}
            </div>
          )}
        </BigMenu>
        <BigMenu icon={<Merge size={22} />} label="Rules" width={240} disabled={!recipients}>
          {(close) => (
            <div className="menu">
              {['Ask…', 'Fill-in…', 'If…Then…Else…', 'Merge Record #', 'Merge Sequence #', 'Next Record', 'Next Record If…', 'Set Bookmark…', 'Skip Record If…'].map((r) => (
                <MenuItem key={r} label={r} onClick={() => { toast(`Rule: ${r}`); close() }} />
              ))}
            </div>
          )}
        </BigMenu>
        <RibbonStack>
          <SmallButton icon={<Highlighter size={15} />} label="Highlight Merge Fields" wide active={highlight} onClick={() => setHighlight(!highlight)} />
          <SmallButton icon={<ListChecks size={15} />} label="Match Fields" wide disabled={!recipients} onClick={() => toast('Match Fields')} />
          <SmallButton icon={<Table2 size={15} />} label="Update Labels" wide disabled={!recipients} onClick={() => toast('Labels updated')} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Preview Results">
        <BigButton
          icon={preview ? <EyeOff size={22} /> : <Eye size={22} />}
          label="Preview Results"
          disabled={!recipients}
          active={preview}
          onClick={() => { setPreview(!preview); toast(preview ? 'Preview off' : 'Preview results on') }}
        />
        <RibbonStack>
          <div className="mail-arrows">
            <SmallButton icon={<ChevronsLeft size={14} />} title="First" disabled={!recipients || !preview} onClick={() => { setRecord(1); toast('First record') }} />
            <SmallButton icon={<ChevronLeft size={14} />} title="Previous" disabled={!recipients || !preview} onClick={() => { setRecord(Math.max(1, record - 1)); toast('Previous record') }} />
            <SmallButton icon={<ChevronRight size={14} />} title="Next" disabled={!recipients || !preview} onClick={() => { setRecord(Math.min(total, record + 1)); toast('Next record') }} />
            <SmallButton icon={<ChevronsRight size={14} />} title="Last" disabled={!recipients || !preview} onClick={() => { setRecord(total); toast('Last record') }} />
            <span className="record-counter">Record {record} of {total}</span>
          </div>
          <SmallButton icon={<Contact size={15} />} label="Find Recipient…" wide disabled={!recipients} onClick={() => toast('Find Recipient')} />
          <SmallMenu icon={<AlertCircle size={15} />} label="Check for Errors…" width={230} disabled={!recipients}>
            {(close) => (
              <div className="menu">
                <MenuItem label="Simulated Merge…" onClick={() => { toast('Simulating merge'); close() }} />
                <MenuItem label="Auto Check for Errors" onClick={() => { toast('Auto check complete'); close() }} />
                <MenuItem label="Complete the merge" onClick={() => { toast('Merge complete'); close() }} />
              </div>
            )}
          </SmallMenu>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Finish">
        <BigMenu icon={<Printer size={22} />} label="Finish & Merge" width={250} disabled={!recipients}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Edit Individual Documents…" onClick={() => { toast('Merged documents created'); close() }} />
              <MenuItem label="Print Documents…" onClick={() => { toast('Printing merged documents'); close() }} />
              <MenuItem label="Send Email Messages…" onClick={() => { toast('Sending email messages'); close() }} />
              <MenuSep />
              <MenuItem label="Finish & Merge" icon={<Send size={14} />} onClick={() => { toast('Mail merge finished'); close() }} />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>
    </>
  )
}
