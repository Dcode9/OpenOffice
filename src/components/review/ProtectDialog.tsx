import { useState } from 'react'
import { Lock, ShieldCheck } from 'lucide-react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'
import { setProtectionState, useProtectionState } from '../../editor/review'

const RESTRICTIONS = [
  'Tracked changes',
  'Comments',
  'Filling in forms',
  'No changes (Read only)',
]

const STYLE_OPTIONS = ['Normal', 'Heading 1', 'Heading 2', 'Heading 3', 'Title', 'Quote', 'Caption']
const AUTHOR_OPTIONS = ['Charles Richardson', 'Alan Kay', 'Reviewer']

export default function ProtectDialog({ onClose }: { onClose: () => void }) {
  const { editor, toast } = useWord()
  const state = useProtectionState()
  const [restricted, setRestricted] = useState(state.restricted)
  const [editingRestriction, setEditingRestriction] = useState(state.editingRestriction)
  const [formattingRestricted, setFormattingRestricted] = useState(state.formattingRestricted)
  const [encrypted, setEncrypted] = useState(state.encrypted)
  const [markFinal, setMarkFinal] = useState(state.markFinal)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [blockedAuthors, setBlockedAuthors] = useState<string[]>(state.blockedAuthors)
  const [allowedStyles, setAllowedStyles] = useState<string[]>(state.allowedStyles)

  const apply = () => {
    if (encrypted) {
      if (!password.trim()) {
        toast('Enter a password before encrypting')
        return
      }
      if (password !== confirm) {
        toast('The passwords do not match')
        return
      }
    }
    if (restricted && restricted && !editingRestriction) {
      toast('Choose an editing restriction')
      return
    }
    setProtectionState({
      restricted,
      editingRestriction,
      formattingRestricted,
      encrypted,
      markFinal,
      blockedAuthors,
      allowedStyles,
    })
    editor?.setEditable(!(restricted && editingRestriction === 'No changes (Read only)'))
    toast(restricted ? `Protection enabled: ${editingRestriction}` : 'Document protection updated')
    onClose()
  }

  const stop = () => {
    if (encrypted) {
      setEncrypted(false)
      setPassword('')
      setConfirm('')
      toast('Encryption removed')
      return
    }
    setProtectionState({ restricted: false, encrypted: false, markFinal: false })
    editor?.setEditable(true)
    toast('Document protection stopped')
    onClose()
  }

  const toggle = (value: string, list: string[], setList: (values: string[]) => void) => {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value])
  }

  return (
    <ReviewDialog
      title="Restrict Editing"
      subtitle="Control how reviewers can change this document"
      width={620}
      onClose={onClose}
      footer={
        <>
          <div className="rv-foot-note">
            {restricted ? `Active: ${editingRestriction}` : 'Protection is off'}
          </div>
          {state.restricted || state.encrypted || state.markFinal ? (
            <ReviewButton variant="danger" onClick={stop}>
              {state.encrypted ? 'Remove Encryption' : 'Stop Protection'}
            </ReviewButton>
          ) : null}
          <ReviewButton onClick={onClose}>Cancel</ReviewButton>
          <ReviewButton variant="primary" onClick={apply}>
            <Lock size={13} /> Apply
          </ReviewButton>
        </>
      }
    >
      <div className="rv-protect-banner">
        <ShieldCheck size={18} />
        <span>Protected documents open in read-only mode where restrictions apply.</span>
      </div>
      <section className="rv-protect-section">
        <label className="rv-check rv-check-strong">
          <input type="checkbox" checked={restricted} onChange={(event) => setRestricted(event.target.checked)} />
          Limit editing to specific actions
        </label>
        <div className="rv-protect-indent">
          <div className="rv-field-line">
            <span className="rv-field-label">Editing restrictions</span>
            <select
              className="rv-select"
              value={editingRestriction}
              onChange={(event) => setEditingRestriction(event.target.value)}
              disabled={!restricted}
            >
              {RESTRICTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="rv-subhead">Start enforcement</div>
          <p className="rv-help">Exceptions can be granted to individual reviewers and styles.</p>
          <div className="rv-subhead">Exceptions</div>
          <div className="rv-exception-group">
            <span className="rv-field-label">Reviewers</span>
            <div className="rv-chip-row">
              {AUTHOR_OPTIONS.map((author) => (
                <button
                  key={author}
                  type="button"
                  className={`rv-chip${blockedAuthors.includes(author) ? ' active' : ''}`}
                  onClick={() => toggle(author, blockedAuthors, setBlockedAuthors)}
                >
                  {author}
                </button>
              ))}
            </div>
          </div>
          <div className="rv-exception-group">
            <span className="rv-field-label">Allowed styles</span>
            <div className="rv-chip-row">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  type="button"
                  className={`rv-chip${allowedStyles.includes(style) ? ' active' : ''}`}
                  onClick={() => toggle(style, allowedStyles, setAllowedStyles)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="rv-protect-section">
        <label className="rv-check rv-check-strong">
          <input
            type="checkbox"
            checked={formattingRestricted}
            onChange={(event) => setFormattingRestricted(event.target.checked)}
          />
          Limit formatting to a selection of styles
        </label>
      </section>
      <section className="rv-protect-section">
        <label className="rv-check rv-check-strong">
          <input type="checkbox" checked={markFinal} onChange={(event) => setMarkFinal(event.target.checked)} />
          Mark as final
        </label>
        <p className="rv-help">Marking as final makes the document read-only and notifies reviewers.</p>
      </section>
      <section className="rv-protect-section">
        <label className="rv-check rv-check-strong">
          <input type="checkbox" checked={encrypted} onChange={(event) => setEncrypted(event.target.checked)} />
          Encrypt with a password
        </label>
        {encrypted && (
          <div className="rv-password-row">
            <input
              className="rv-input"
              type="password"
              value={password}
              placeholder="Password"
              onChange={(event) => setPassword(event.target.value)}
            />
            <input
              className="rv-input"
              type="password"
              value={confirm}
              placeholder="Re-enter password"
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
        )}
      </section>
    </ReviewDialog>
  )
}
