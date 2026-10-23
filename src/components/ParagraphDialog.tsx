import { useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { setParagraphFormat } from '../editor/actions'

type Props = { editor: Editor; onClose: () => void }

const ALIGNMENTS = ['Left', 'Center', 'Right', 'Justify'] as const

export default function ParagraphDialog({ editor, onClose }: Props) {
  const attrs = editor.getAttributes('paragraph') as Record<string, any>
  const [tab, setTab] = useState<'indents' | 'breaks'>('indents')
  const [align, setAlign] = useState<string>((editor.getAttributes('paragraph').textAlign as string) || 'Left')
  const [left, setLeft] = useState(String(Number.parseFloat(attrs.indentLeft || '0') || 0))
  const [right, setRight] = useState(String(Number.parseFloat(attrs.indentRight || '0') || 0))
  const [special, setSpecial] = useState<'none' | 'first' | 'hanging'>(
    attrs.firstLine ? (Number.parseFloat(attrs.firstLine) < 0 ? 'hanging' : 'first') : 'none',
  )
  const [specialBy, setSpecialBy] = useState(String(Math.abs(Number.parseFloat(attrs.firstLine || '0.5')) || 0.5))
  const [before, setBefore] = useState(String(Number.parseFloat(attrs.spaceBefore || '0') || 0))
  const [after, setAfter] = useState(String(Number.parseFloat(attrs.spaceAfter || '8') || 0))
  const initialLine = String(attrs.lineHeight || '1.08')
  const exactLine = initialLine.endsWith('pt')
  const [lineMode, setLineMode] = useState<'multiple' | 'exact'>(exactLine ? 'exact' : 'multiple')
  const [line, setLine] = useState(exactLine ? initialLine.replace('pt', '') : initialLine)
  const [keepNext, setKeepNext] = useState(Boolean(attrs.keepNext))
  const [pageBreak, setPageBreak] = useState(Boolean(attrs.pageBreakBefore))

  const preview = useMemo(
    () => ({
      textAlign: align.toLowerCase() as any,
      marginLeft: `${Number(left) || 0}in`,
      marginRight: `${Number(right) || 0}in`,
      textIndent:
        special === 'none' ? '0' : `${special === 'hanging' ? '-' : ''}${Number(specialBy) || 0}in`,
      marginTop: `${Number(before) || 0}pt`,
      marginBottom: `${Number(after) || 0}pt`,
      lineHeight: lineMode === 'exact' ? `${Number(line) || 12}pt` : line,
    }),
    [align, left, right, special, specialBy, before, after, line, lineMode],
  )

  const apply = () => {
    editor.chain().focus().setTextAlign(align.toLowerCase()).run()
    setParagraphFormat(editor, {
      indentLeft: Number(left) || null,
      indentRight: Number(right) || null,
      firstLine:
        special === 'none' ? null : `${special === 'hanging' ? '-' : ''}${Number(specialBy) || 0}`,
      spaceBefore: Number(before) || null,
      spaceAfter: Number(after) || null,
      lineHeight: lineMode === 'exact' ? `${Number(line) || 12}pt` : line,
      keepNext,
      pageBreakBefore: pageBreak,
      indent: 0,
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog paragraph-dialog" role="dialog" aria-modal="true" aria-label="Paragraph">
        <div className="dialog-title">Paragraph</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button className={`dialog-tab${tab === 'indents' ? ' active' : ''}`} onClick={() => setTab('indents')}>Indents and Spacing</button>
            <button className={`dialog-tab${tab === 'breaks' ? ' active' : ''}`} onClick={() => setTab('breaks')}>Line and Page Breaks</button>
          </div>

          {tab === 'indents' ? (
            <>
              <div className="dialog-subtitle">General</div>
              <div className="dialog-grid">
                <label>Alignment:</label>
                <select value={align} onChange={(e) => setAlign(e.target.value)}>
                  {ALIGNMENTS.map((a) => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div className="dialog-subtitle">Indentation</div>
              <div className="dialog-grid">
                <label>Left:</label>
                <input type="number" step="0.1" value={left} onChange={(e) => setLeft(e.target.value)} />
                <label>Right:</label>
                <input type="number" step="0.1" value={right} onChange={(e) => setRight(e.target.value)} />
                <label>Special:</label>
                <select value={special} onChange={(e) => setSpecial(e.target.value as typeof special)}>
                  <option value="none">(none)</option>
                  <option value="first">First line</option>
                  <option value="hanging">Hanging</option>
                </select>
                <label>By:</label>
                <input type="number" step="0.1" value={specialBy} onChange={(e) => setSpecialBy(e.target.value)} disabled={special === 'none'} />
              </div>
              <div className="dialog-subtitle">Spacing</div>
              <div className="dialog-grid">
                <label>Before:</label>
                <input type="number" step="1" value={before} onChange={(e) => setBefore(e.target.value)} />
                <label>After:</label>
                <input type="number" step="1" value={after} onChange={(e) => setAfter(e.target.value)} />
                <label>Line spacing:</label>
                <select value={lineMode} onChange={(e) => setLineMode(e.target.value as typeof lineMode)}>
                  <option value="multiple">Multiple</option>
                  <option value="exact">Exactly</option>
                </select>
                <label>At:</label>
                <input type="number" step="0.05" value={line} onChange={(e) => setLine(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="dialog-section">
              <label className="check-row"><input type="checkbox" checked={keepNext} onChange={(e) => setKeepNext(e.target.checked)} /> Keep with next</label>
              <label className="check-row"><input type="checkbox" checked={pageBreak} onChange={(e) => setPageBreak(e.target.checked)} /> Page break before</label>
              <div className="dialog-grid">
                <label>Line spacing:</label>
                <select value={lineMode} onChange={(e) => setLineMode(e.target.value as typeof lineMode)}>
                  <option value="multiple">Multiple</option>
                  <option value="exact">Exactly</option>
                </select>
                <label>At:</label>
                <input type="number" step="0.05" value={line} onChange={(e) => setLine(e.target.value)} />
              </div>
            </div>
          )}

          <div className="font-preview">
            <div className="dialog-field-label">Preview</div>
            <div className="paragraph-preview" style={preview}>
              The quick brown fox jumps over the lazy dog. Select this text to preview paragraph formatting.
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={() => { apply(); onClose() }}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
          <button className="dialog-btn" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  )
}
