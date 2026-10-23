import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Accessibility,
  BookA,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Columns,
  EyeOff,
  FileSearch,
  Languages,
  MessageSquare,
  MessageSquarePlus,
  ShieldCheck,
  SpellCheck,
  Trash2,
  UserX,
  Volume2,
  XCircle,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'

function BigMenu({
  icon,
  label,
  width = 230,
  children,
}: {
  icon: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={label}>
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
  width = 210,
  children,
}: {
  icon?: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => <SmallButton icon={icon} label={label} wide caret onClick={toggle} onCaret={toggle} />}
    >
      {children}
    </Popover>
  )
}

const MARKUP_MODES = ['Simple Markup', 'All Markup', 'No Markup', 'Original']

export default function ReviewTab() {
  const { editor, trackChanges, setTrackChanges, toast, wordCount } = useWord()
  const [markup, setMarkup] = useState('Simple Markup')
  const [showComments, setShowComments] = useState(true)
  const [hideInk, setHideInk] = useState(false)
  if (!editor) return null

  return (
    <>
      <RibbonGroup label="Proofing" launcher={{ title: 'Editor', onClick: () => toast('Editor') }}>
        <BigButton icon={<SpellCheck size={22} />} label="Spelling & Grammar" onClick={() => toast('No spelling or grammar errors found')} />
        <BigButton icon={<BookA size={22} />} label="Thesaurus" onClick={() => toast('Thesaurus: select a word first')} />
        <BigButton icon={<FileSearch size={22} />} label="Word Count" onClick={() => toast(`${wordCount.words} words, ${wordCount.characters} characters, ${wordCount.paragraphs} paragraphs`)} />
      </RibbonGroup>

      <RibbonGroup label="Speech">
        <BigButton icon={<Volume2 size={22} />} label="Read Aloud" onClick={() => toast('Read Aloud started')} />
      </RibbonGroup>

      <RibbonGroup label="Accessibility">
        <BigMenu icon={<Accessibility size={22} />} label="Accessibility" width={240}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Check Accessibility" onClick={() => { toast('No accessibility issues found'); close() }} />
              <MenuItem label="Alt Text" onClick={() => { toast('Alt Text pane'); close() }} />
              <MenuItem label="Navigation Pane" onClick={() => { toast('Navigation Pane'); close() }} />
              <MenuItem label="Focus" onClick={() => { toast('Focus mode'); close() }} />
              <MenuSep />
              <MenuItem label="Options: Accessibility" onClick={() => { toast('Accessibility options'); close() }} />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>

      <RibbonGroup label="Language">
        <BigButton icon={<Languages size={22} />} label="Translate" onClick={() => toast('Translator pane')} />
        <BigButton icon={<Languages size={22} />} label="Language" onClick={() => toast('Language: English (United States)')} />
      </RibbonGroup>

      <RibbonGroup label="Comments">
        <BigButton icon={<MessageSquarePlus size={22} />} label="New Comment" onClick={() => toast('Select text to add a comment')} />
        <RibbonStack>
          <SmallMenu icon={<Trash2 size={15} />} label="Delete" width={260}>
            {(close) => (
              <div className="menu">
                <MenuItem label="Delete" onClick={() => { toast('No comment selected'); close() }} />
                <MenuItem label="Delete All Comments in Document" onClick={() => { toast('No comments to delete'); close() }} />
                <MenuItem label="Delete All Comments Shown" onClick={() => { toast('No comments shown'); close() }} />
              </div>
            )}
          </SmallMenu>
          <SmallButton icon={<ChevronUp size={15} />} label="Previous" wide onClick={() => toast('No comments')} />
          <SmallButton icon={<ChevronDown size={15} />} label="Next" wide onClick={() => toast('No comments')} />
          <SmallButton icon={<MessageSquare size={15} />} label="Show Comments" wide active={showComments} onClick={() => setShowComments(!showComments)} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Tracking">
        <BigButton
          icon={<CheckCheck size={22} />}
          label="Track Changes"
          active={trackChanges}
          onClick={() => {
            setTrackChanges(!trackChanges)
            toast(trackChanges ? 'Track Changes turned off' : 'Track Changes turned on')
          }}
        />
        <Popover
          width={190}
          trigger={({ toggle }) => (
            <button className="combo markup-combo" onClick={toggle} type="button" title="Markup display">
              <span className="combo-label">{markup}</span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <div className="menu">
              {MARKUP_MODES.map((m) => (
                <MenuItem key={m} label={m} active={markup === m} onClick={() => { setMarkup(m); close() }} />
              ))}
            </div>
          )}
        </Popover>
        <BigMenu icon={<FileSearch size={22} />} label="Show Markup" width={250}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Insertions and Deletions" onClick={() => { toast('Insertions and Deletions'); close() }} />
              <MenuItem label="Formatting" onClick={() => { toast('Formatting markup'); close() }} />
              <MenuSep />
              <MenuItem label="Balloons" onClick={() => { toast('Balloons'); close() }} />
              <MenuItem label="Specific People…" onClick={() => { toast('Specific People'); close() }} />
              <MenuSep />
              <MenuItem label="Highlight Updates" onClick={() => { toast('Highlight Updates'); close() }} />
              <MenuItem label="Other Authors" onClick={() => { toast('Other Authors'); close() }} />
            </div>
          )}
        </BigMenu>
        <BigMenu icon={<Columns size={22} />} label="Reviewing Pane" width={220}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Reviewing Pane Vertical" onClick={() => { toast('Reviewing Pane: Vertical'); close() }} />
              <MenuItem label="Reviewing Pane Horizontal" onClick={() => { toast('Reviewing Pane: Horizontal'); close() }} />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>

      <RibbonGroup label="Changes">
        <BigMenu icon={<CheckCheck size={22} />} label="Accept" width={250}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Accept and Move to Next" onClick={() => { toast('All changes accepted'); close() }} />
              <MenuItem label="Accept This Change" onClick={() => { toast('No changes to accept'); close() }} />
              <MenuItem label="Accept All Changes Shown" onClick={() => { toast('All shown changes accepted'); close() }} />
              <MenuItem label="Accept All Changes" onClick={() => { toast('All changes accepted'); close() }} />
              <MenuSep />
              <MenuItem label="Accept All Changes and Stop Tracking" onClick={() => { setTrackChanges(false); toast('Accepted all and stopped tracking'); close() }} />
            </div>
          )}
        </BigMenu>
        <BigMenu icon={<XCircle size={22} />} label="Reject" width={240}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Reject and Move to Next" onClick={() => { toast('No tracked changes to reject'); close() }} />
              <MenuItem label="Reject This Change" onClick={() => { toast('No tracked changes to reject'); close() }} />
              <MenuItem label="Reject All Changes Shown" onClick={() => { toast('No tracked changes to reject'); close() }} />
              <MenuItem label="Reject All Changes" onClick={() => { toast('No tracked changes to reject'); close() }} />
            </div>
          )}
        </BigMenu>
        <RibbonStack>
          <SmallButton icon={<ChevronUp size={15} />} label="Previous" wide onClick={() => toast('No changes')} />
          <SmallButton icon={<ChevronDown size={15} />} label="Next" wide onClick={() => toast('No changes')} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Compare">
        <BigMenu icon={<FileSearch size={22} />} label="Compare" width={250}>
          {(close) => (
            <div className="menu">
              <MenuLabel>Compare</MenuLabel>
              <MenuItem label="Major Version" onClick={() => { toast('Major Version'); close() }} />
              <MenuItem label="Last Version" onClick={() => { toast('Last Version'); close() }} />
              <MenuItem label="Specific Version…" onClick={() => { toast('Specific Version'); close() }} />
              <MenuSep />
              <MenuItem label="Compare…" onClick={() => { toast('Compare Documents'); close() }} />
              <MenuItem label="Combine…" onClick={() => { toast('Combine Documents'); close() }} />
              <MenuItem label="Compare Documents…" onClick={() => { toast('Compare Documents'); close() }} />
              <MenuSep />
              <MenuItem label="Show Source Documents" disabled />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>

      <RibbonGroup label="Protect">
        <BigButton icon={<UserX size={22} />} label="Block Authors" onClick={() => toast('Block Authors pane')} />
        <BigButton icon={<ShieldCheck size={22} />} label="Restrict Editing" onClick={() => toast('Restrict Editing pane')} />
      </RibbonGroup>

      <RibbonGroup label="Ink">
        <BigMenu icon={<EyeOff size={22} />} label="Hide Ink" width={220}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Hide Ink" active={hideInk} onClick={() => { setHideInk(!hideInk); close() }} />
              <MenuSep />
              <MenuItem label="Delete All Ink in Document" onClick={() => { toast('No ink to delete'); close() }} />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>
    </>
  )
}
