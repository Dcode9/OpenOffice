import { useState } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { useWord } from '../../context'
import { insertHtml, styledRun } from '../../editor/insertActions'
import { DialogButton, FieldRow, InsertModal } from './Modal'
import { MenuItem, MenuLabel, MenuSep } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

type Position = 'top' | 'bottom' | 'margins' | 'current'

type NumberStyle = {
  id: string
  name: string
  token: string
  align: 'left' | 'center' | 'right'
}

const NUMBER_STYLES: NumberStyle[] = [
  { id: 'plain1', name: 'Plain Number 1', token: '1', align: 'left' },
  { id: 'plain2', name: 'Plain Number 2', token: '1', align: 'center' },
  { id: 'plain3', name: 'Plain Number 3', token: '1', align: 'right' },
  { id: 'accent', name: 'Accent Bar', token: '1', align: 'left' },
  { id: 'bold', name: 'Bold Numbers', token: '1', align: 'right' },
  { id: 'brackets', name: 'Brackets', token: '[1]', align: 'center' },
  { id: 'dots', name: 'Dots', token: '• 1 •', align: 'center' },
  { id: 'large', name: 'Large', token: '1', align: 'center' },
  { id: 'roman', name: 'Roman', token: 'i', align: 'center' },
  { id: 'pageof', name: 'Page X of Y', token: '1 of 1', align: 'right' },
]

const POSITIONS: { id: Position; name: string }[] = [
  { id: 'top', name: 'Top of Page' },
  { id: 'bottom', name: 'Bottom of Page' },
  { id: 'margins', name: 'Page Margins' },
  { id: 'current', name: 'Current Position' },
]

const FORMAT_OPTIONS = [
  { id: 'decimal', name: '1, 2, 3, …' },
  { id: 'roman-lower', name: 'i, ii, iii, …' },
  { id: 'roman-upper', name: 'I, II, III, …' },
  { id: 'letters-lower', name: 'a, b, c, …' },
  { id: 'letters-upper', name: 'A, B, C, …' },
]

function applyRootStyle(styleId: string | null) {
  if (styleId) document.documentElement.dataset.pnStyle = styleId
  else delete document.documentElement.dataset.pnStyle
}

function applyRootFormat(formatId: string | null) {
  if (formatId && formatId !== 'decimal') document.documentElement.dataset.pnFormat = formatId
  else delete document.documentElement.dataset.pnFormat
}

export function PageNumberGallery({ onClose }: { onClose: () => void }) {
  const { editor, setShowHeader, setShowFooter, setShowPageNumbers, setHeaderText, setFooterText, toast } = useWord()
  const [view, setView] = useState<'root' | Position>('root')
  const [formatOpen, setFormatOpen] = useState(false)
  const [format, setFormat] = useState('decimal')
  const [startAt, setStartAt] = useState('1')
  const [continueNumbering, setContinueNumbering] = useState(true)
  const [chapter, setChapter] = useState(false)

  const apply = (position: Position, style: NumberStyle) => {
    applyRootStyle(style.id)
    applyRootFormat(format)
    if (position === 'top') {
      setShowHeader(true)
      setShowPageNumbers(true)
      setHeaderText(style.token)
    } else if (position === 'bottom') {
      setShowFooter(true)
      setShowPageNumbers(true)
      setFooterText(style.align === 'center' ? '' : '')
    } else if (position === 'margins') {
      setShowFooter(true)
      setShowPageNumbers(true)
      setFooterText(style.token)
    } else if (editor) {
      insertHtml(editor, styledRun(` ${style.token} `, { size: 12, color: '#595959' }))
    }
    toast(`Page number applied: ${style.name} · ${POSITIONS.find((item) => item.id === position)?.name}`)
    onClose()
  }

  const remove = () => {
    setShowPageNumbers(false)
    applyRootStyle(null)
    applyRootFormat(null)
    toast('Page numbers removed')
    onClose()
  }

  if (view === 'root') {
    return (
      <div className="ins-pn-menu">
        <MenuLabel>Page Number</MenuLabel>
        {POSITIONS.map((position) => (
          <button key={position.id} type="button" className="ins-pn-row" onClick={() => setView(position.id)}>
            <span>{position.name}</span>
            <ChevronRight size={14} />
          </button>
        ))}
        <MenuSep />
        <MenuItem label="Format Page Numbers…" onClick={() => setFormatOpen(true)} />
        <MenuItem label="Remove Page Numbers" onClick={remove} />
        {formatOpen && (
          <InsertModal
            title="Page Number Format"
            subtitle="Choose a number format and page numbering options"
            width={430}
            onClose={() => setFormatOpen(false)}
            footer={
              <>
                <DialogButton onClick={() => setFormatOpen(false)}>Cancel</DialogButton>
                <DialogButton
                  variant="primary"
                  onClick={() => {
                    applyRootFormat(format)
                    setShowPageNumbers(true)
                    toast('Page number format updated')
                    setFormatOpen(false)
                    onClose()
                  }}
                >
                  OK
                </DialogButton>
              </>
            }
          >
            <FieldRow label="Number format">
              <select value={format} onChange={(event) => setFormat(event.target.value)}>
                {FORMAT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </FieldRow>
            <label className="ins-check">
              <input type="checkbox" checked={chapter} onChange={(event) => setChapter(event.target.checked)} />
              Include chapter number
            </label>
            <div className="ins-sep" />
            <div className="ins-radio-group">
              <label className="ins-check">
                <input
                  type="radio"
                  checked={continueNumbering}
                  onChange={() => setContinueNumbering(true)}
                />
                Continue from previous section
              </label>
              <label className="ins-check">
                <input
                  type="radio"
                  checked={!continueNumbering}
                  onChange={() => setContinueNumbering(false)}
                />
                Start at
                <input
                  className="ins-start-at"
                  type="number"
                  min={1}
                  value={startAt}
                  disabled={continueNumbering}
                  onChange={(event) => setStartAt(event.target.value)}
                />
              </label>
            </div>
          </InsertModal>
        )}
      </div>
    )
  }

  const positionName = POSITIONS.find((item) => item.id === view)?.name || ''

  return (
    <div className="ins-pn-gallery">
      <div className="ins-pn-head">
        <button type="button" className="ins-back" onClick={() => setView('root')}>
          <ArrowLeft size={14} /> Back
        </button>
        <span>{positionName}</span>
      </div>
      <div className="ins-pn-grid">
        {NUMBER_STYLES.map((style) => (
          <button key={style.id} type="button" className="ins-pn-card" onClick={() => apply(view, style)}>
            <span className={`ins-pn-page ${view}`}>
              <span className={`ins-pn-number ${style.id}`} style={{ justifyContent: style.align === 'left' ? 'flex-start' : style.align === 'right' ? 'flex-end' : 'center' }}>
                <span className="ins-pn-token">{style.token}</span>
              </span>
              <span className="ins-pn-lines"><span /><span /><span /></span>
            </span>
            <span className="ins-pn-name">{style.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function PageNumberMenu({ onClose }: { onClose: () => void }) {
  return <PageNumberGallery onClose={onClose} />
}
