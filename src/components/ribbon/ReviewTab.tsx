import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Accessibility,
  BookA,
  Check,
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
import type { MarkupMode } from '../../editor/review'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import SpellingDialog from '../review/SpellingDialog'
import ThesaurusDialog from '../review/ThesaurusDialog'
import WordCountDialog from '../review/WordCountDialog'
import ReadAloudBar from '../review/ReadAloudBar'
import AccessibilityDialog from '../review/AccessibilityDialog'
import TranslateDialog from '../review/TranslateDialog'
import LanguageDialog from '../review/LanguageDialog'
import CompareDialog from '../review/CompareDialog'
import ProtectDialog from '../review/ProtectDialog'
import {
  createComment,
  deleteComment,
  deleteAllComments,
  navigateComment,
  getActiveThreadId,
} from '../../editor/comments'
import {
  acceptAllRevisions,
  rejectAllRevisions,
  acceptRevision,
  rejectRevision,
  navigateRevision,
  activeRevisionAt,
} from '../../editor/review'

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

const MARKUP_LABELS: Record<MarkupMode, string> = {
  simple: 'Simple Markup',
  all: 'All Markup',
  no: 'No Markup',
  original: 'Original',
}

export default function ReviewTab() {
  const {
    editor,
    trackChanges,
    setTrackChanges,
    markupMode,
    setMarkupMode,
    showInsertions,
    setShowInsertions,
    showDeletions,
    setShowDeletions,
    showFormatting,
    setShowFormatting,
    showCommentsPane,
    setShowCommentsPane,
    reviewingPane,
    setReviewingPane,
    reviewingOrientation,
    setReviewingOrientation,
    setShowNav,
    toast,
  } = useWord()

  const [hideInk, setHideInk] = useState(false)

  // Dialog & Bar states
  const [showSpelling, setShowSpelling] = useState(false)
  const [showThesaurus, setShowThesaurus] = useState(false)
  const [showWordCount, setShowWordCount] = useState(false)
  const [showReadAloud, setShowReadAloud] = useState(false)
  const [showAccessibility, setShowAccessibility] = useState(false)
  const [showTranslate, setShowTranslate] = useState(false)
  const [showLanguage, setShowLanguage] = useState(false)
  const [showCompare, setShowCompare] = useState(false)
  const [showProtect, setShowProtect] = useState(false)

  if (!editor) return null

  return (
    <>
      <RibbonGroup label="Proofing" launcher={{ title: 'Editor', onClick: () => setShowSpelling(true) }}>
        <BigButton icon={<SpellCheck size={22} />} label="Spelling & Grammar" onClick={() => setShowSpelling(true)} />
        <BigButton icon={<BookA size={22} />} label="Thesaurus" onClick={() => setShowThesaurus(true)} />
        <BigButton icon={<FileSearch size={22} />} label="Word Count" onClick={() => setShowWordCount(true)} />
      </RibbonGroup>

      <RibbonGroup label="Speech">
        <BigButton
          icon={<Volume2 size={22} />}
          label="Read Aloud"
          active={showReadAloud}
          onClick={() => setShowReadAloud((prev) => !prev)}
        />
      </RibbonGroup>

      <RibbonGroup label="Accessibility">
        <BigMenu icon={<Accessibility size={22} />} label="Accessibility" width={240}>
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Check Accessibility"
                onClick={() => {
                  close()
                  setShowAccessibility(true)
                }}
              />
              <MenuItem
                label="Alt Text"
                onClick={() => {
                  close()
                  setShowAccessibility(true)
                }}
              />
              <MenuItem
                label="Navigation Pane"
                onClick={() => {
                  close()
                  setShowNav(true)
                }}
              />
              <MenuItem
                label="Focus"
                onClick={() => {
                  close()
                  toast('Focus mode')
                }}
              />
              <MenuSep />
              <MenuItem
                label="Options: Accessibility"
                onClick={() => {
                  close()
                  setShowAccessibility(true)
                }}
              />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>

      <RibbonGroup label="Language">
        <BigButton icon={<Languages size={22} />} label="Translate" onClick={() => setShowTranslate(true)} />
        <BigButton icon={<Languages size={22} />} label="Language" onClick={() => setShowLanguage(true)} />
      </RibbonGroup>

      <RibbonGroup label="Comments">
        <BigButton
          icon={<MessageSquarePlus size={22} />}
          label="New Comment"
          onClick={() => {
            setShowCommentsPane(true)
            createComment(editor)
          }}
        />
        <RibbonStack>
          <SmallMenu icon={<Trash2 size={15} />} label="Delete" width={260}>
            {(close) => (
              <div className="menu">
                <MenuItem
                  label="Delete"
                  onClick={() => {
                    const activeId = getActiveThreadId()
                    if (activeId) {
                      deleteComment(editor, activeId)
                      toast('Comment deleted')
                    } else {
                      toast('No comment selected')
                    }
                    close()
                  }}
                />
                <MenuItem
                  label="Delete All Comments in Document"
                  onClick={() => {
                    deleteAllComments(editor)
                    toast('All comments deleted')
                    close()
                  }}
                />
                <MenuItem
                  label="Delete All Comments Shown"
                  onClick={() => {
                    deleteAllComments(editor)
                    toast('All comments deleted')
                    close()
                  }}
                />
              </div>
            )}
          </SmallMenu>
          <SmallButton
            icon={<ChevronUp size={15} />}
            label="Previous"
            wide
            onClick={() => {
              const res = navigateComment(editor, -1)
              if (!res) toast('No comments in document')
            }}
          />
          <SmallButton
            icon={<ChevronDown size={15} />}
            label="Next"
            wide
            onClick={() => {
              const res = navigateComment(editor, 1)
              if (!res) toast('No comments in document')
            }}
          />
          <SmallButton
            icon={<MessageSquare size={15} />}
            label="Show Comments"
            wide
            active={showCommentsPane}
            onClick={() => setShowCommentsPane(!showCommentsPane)}
          />
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
              <span className="combo-label">{MARKUP_LABELS[markupMode] || 'Simple Markup'}</span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <div className="menu">
              {(['simple', 'all', 'no', 'original'] as MarkupMode[]).map((m) => (
                <MenuItem
                  key={m}
                  label={MARKUP_LABELS[m]}
                  active={markupMode === m}
                  onClick={() => {
                    setMarkupMode(m)
                    close()
                  }}
                />
              ))}
            </div>
          )}
        </Popover>
        <BigMenu icon={<FileSearch size={22} />} label="Show Markup" width={250}>
          {(close) => (
            <div className="menu">
              <MenuItem
                icon={showInsertions ? <Check size={14} /> : undefined}
                label="Insertions and Deletions"
                onClick={() => {
                  const next = !showInsertions
                  setShowInsertions(next)
                  setShowDeletions(next)
                  close()
                }}
              />
              <MenuItem
                icon={showFormatting ? <Check size={14} /> : undefined}
                label="Formatting"
                onClick={() => {
                  setShowFormatting(!showFormatting)
                  close()
                }}
              />
              <MenuSep />
              <MenuItem label="Balloons" onClick={() => { toast('Balloons'); close() }} />
              <MenuItem label="Specific People…" onClick={() => { toast('Specific People'); close() }} />
              <MenuSep />
              <MenuItem label="Highlight Updates" onClick={() => { toast('Highlight Updates'); close() }} />
              <MenuItem label="Other Authors" onClick={() => { toast('Other Authors'); close() }} />
            </div>
          )}
        </BigMenu>
        <Popover
          width={220}
          trigger={({ toggle }) => (
            <BigButton
              icon={<Columns size={22} />}
              label="Reviewing Pane"
              caret
              active={reviewingPane}
              onClick={() => setReviewingPane(!reviewingPane)}
              onCaret={toggle}
            />
          )}
        >
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Reviewing Pane Vertical"
                active={reviewingPane && reviewingOrientation === 'vertical'}
                onClick={() => {
                  setReviewingOrientation('vertical')
                  setReviewingPane(reviewingPane && reviewingOrientation === 'vertical' ? false : true)
                  close()
                }}
              />
              <MenuItem
                label="Reviewing Pane Horizontal"
                active={reviewingPane && reviewingOrientation === 'horizontal'}
                onClick={() => {
                  setReviewingOrientation('horizontal')
                  setReviewingPane(reviewingPane && reviewingOrientation === 'horizontal' ? false : true)
                  close()
                }}
              />
            </div>
          )}
        </Popover>
      </RibbonGroup>

      <RibbonGroup label="Changes">
        <BigMenu icon={<CheckCheck size={22} />} label="Accept" width={260}>
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Accept and Move to Next"
                onClick={() => {
                  const rev = activeRevisionAt(editor, editor.state.selection.from)
                  if (rev) {
                    acceptRevision(editor, rev)
                    navigateRevision(editor, 1)
                    toast('Change accepted')
                  } else {
                    toast('No change at cursor')
                  }
                  close()
                }}
              />
              <MenuItem
                label="Accept This Change"
                onClick={() => {
                  const rev = activeRevisionAt(editor, editor.state.selection.from)
                  if (rev) {
                    acceptRevision(editor, rev)
                    toast('Change accepted')
                  } else {
                    toast('No change at cursor')
                  }
                  close()
                }}
              />
              <MenuItem
                label="Accept All Changes Shown"
                onClick={() => {
                  acceptAllRevisions(editor)
                  toast('All changes accepted')
                  close()
                }}
              />
              <MenuItem
                label="Accept All Changes"
                onClick={() => {
                  acceptAllRevisions(editor)
                  toast('All changes accepted')
                  close()
                }}
              />
              <MenuSep />
              <MenuItem
                label="Accept All Changes and Stop Tracking"
                onClick={() => {
                  acceptAllRevisions(editor)
                  setTrackChanges(false)
                  toast('Accepted all changes and stopped tracking')
                  close()
                }}
              />
            </div>
          )}
        </BigMenu>
        <BigMenu icon={<XCircle size={22} />} label="Reject" width={250}>
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Reject and Move to Next"
                onClick={() => {
                  const rev = activeRevisionAt(editor, editor.state.selection.from)
                  if (rev) {
                    rejectRevision(editor, rev)
                    navigateRevision(editor, 1)
                    toast('Change rejected')
                  } else {
                    toast('No change at cursor')
                  }
                  close()
                }}
              />
              <MenuItem
                label="Reject This Change"
                onClick={() => {
                  const rev = activeRevisionAt(editor, editor.state.selection.from)
                  if (rev) {
                    rejectRevision(editor, rev)
                    toast('Change rejected')
                  } else {
                    toast('No change at cursor')
                  }
                  close()
                }}
              />
              <MenuItem
                label="Reject All Changes Shown"
                onClick={() => {
                  rejectAllRevisions(editor)
                  toast('All changes rejected')
                  close()
                }}
              />
              <MenuItem
                label="Reject All Changes"
                onClick={() => {
                  rejectAllRevisions(editor)
                  toast('All changes rejected')
                  close()
                }}
              />
            </div>
          )}
        </BigMenu>
        <RibbonStack>
          <SmallButton
            icon={<ChevronUp size={15} />}
            label="Previous"
            wide
            onClick={() => {
              const rev = navigateRevision(editor, -1)
              if (!rev) toast('No revisions found')
            }}
          />
          <SmallButton
            icon={<ChevronDown size={15} />}
            label="Next"
            wide
            onClick={() => {
              const rev = navigateRevision(editor, 1)
              if (!rev) toast('No revisions found')
            }}
          />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Compare">
        <Popover
          width={240}
          trigger={({ toggle }) => (
            <BigButton
              icon={<FileSearch size={22} />}
              label="Compare"
              caret
              onClick={() => setShowCompare(true)}
              onCaret={toggle}
            />
          )}
        >
          {(close) => (
            <div className="menu">
              <MenuLabel>Compare</MenuLabel>
              <MenuItem
                label="Compare Documents…"
                onClick={() => {
                  close()
                  setShowCompare(true)
                }}
              />
              <MenuItem
                label="Combine Documents…"
                onClick={() => {
                  close()
                  setShowCompare(true)
                }}
              />
              <MenuSep />
              <MenuItem label="Show Source Documents" disabled />
            </div>
          )}
        </Popover>
      </RibbonGroup>

      <RibbonGroup label="Protect">
        <BigButton icon={<UserX size={22} />} label="Block Authors" onClick={() => setShowProtect(true)} />
        <BigButton icon={<ShieldCheck size={22} />} label="Restrict Editing" onClick={() => setShowProtect(true)} />
      </RibbonGroup>

      <RibbonGroup label="Ink">
        <BigMenu icon={<EyeOff size={22} />} label="Hide Ink" width={220}>
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Hide Ink"
                active={hideInk}
                onClick={() => {
                  setHideInk(!hideInk)
                  close()
                }}
              />
              <MenuSep />
              <MenuItem
                label="Delete All Ink in Document"
                onClick={() => {
                  toast('No ink to delete')
                  close()
                }}
              />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>

      {/* Review Dialogs */}
      {showSpelling && <SpellingDialog onClose={() => setShowSpelling(false)} />}
      {showThesaurus && <ThesaurusDialog onClose={() => setShowThesaurus(false)} />}
      {showWordCount && <WordCountDialog onClose={() => setShowWordCount(false)} />}
      {showReadAloud && <ReadAloudBar onClose={() => setShowReadAloud(false)} />}
      {showAccessibility && <AccessibilityDialog onClose={() => setShowAccessibility(false)} />}
      {showTranslate && <TranslateDialog onClose={() => setShowTranslate(false)} />}
      {showLanguage && <LanguageDialog onClose={() => setShowLanguage(false)} />}
      {showCompare && <CompareDialog onClose={() => setShowCompare(false)} />}
      {showProtect && <ProtectDialog onClose={() => setShowProtect(false)} />}
    </>
  )
}
