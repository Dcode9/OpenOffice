import { useState } from 'react'
import type { PageSetup } from '../../context'
import { PAGE_SIZES } from '../../lib/constants'
import {
  PAGE_SIZE_OPTIONS,
  layoutSnapshot,
  registerCustomPaperSize,
  setCustomMargins,
  setPageSetupOptions,
  type CustomMargins,
} from './layoutStore'
import '../../styles/layout-advanced.css'

type Tab = 'margins' | 'paper' | 'layout'

type Props = {
  page: PageSetup
  initialTab?: Tab
  onClose: () => void
  onApply: (value: {
    sizeKey: string
    orientation: PageSetup['orientation']
    margins: PageSetup['margins']
    customMargins: CustomMargins
  }) => void
  onLineNumbers: () => void
}

export default function PageSetupDialog({ page, initialTab = 'margins', onClose, onApply, onLineNumbers }: Props) {
  const stored = layoutSnapshot()
  const currentSize = PAGE_SIZES[page.sizeKey] || PAGE_SIZES.letter
  const [tab, setTab] = useState<Tab>(initialTab)
  const [top, setTop] = useState(String(stored.customMargins.top))
  const [bottom, setBottom] = useState(String(stored.customMargins.bottom))
  const [left, setLeft] = useState(String(stored.customMargins.left))
  const [right, setRight] = useState(String(stored.customMargins.right))
  const [gutter, setGutter] = useState(String(stored.customMargins.gutter))
  const [sizeKey, setSizeKey] = useState(page.sizeKey)
  const [paperWidth, setPaperWidth] = useState(String(Math.round((currentSize.w / 96) * 100) / 100))
  const [paperHeight, setPaperHeight] = useState(String(Math.round((currentSize.h / 96) * 100) / 100))
  const [orientation, setOrientation] = useState(page.orientation)
  const [sectionStart, setSectionStart] = useState(stored.pageSetup.sectionStart)
  const [header, setHeader] = useState(String(stored.pageSetup.header))
  const [footer, setFooter] = useState(String(stored.pageSetup.footer))
  const [verticalAlign, setVerticalAlign] = useState(stored.pageSetup.verticalAlign)
  const [differentOddEven, setDifferentOddEven] = useState(stored.pageSetup.differentOddEven)
  const [differentFirstPage, setDifferentFirstPage] = useState(stored.pageSetup.differentFirstPage)
  const [multiplePages, setMultiplePages] = useState(stored.pageSetup.multiplePages)
  const [applyTo, setApplyTo] = useState(stored.pageSetup.applyTo)

  const pageW = Number(paperWidth) * 96 || currentSize.w
  const pageH = Number(paperHeight) * 96 || currentSize.h
  const previewW = orientation === 'landscape' ? pageH : pageW
  const previewH = orientation === 'landscape' ? pageW : pageH
  const topPct = Math.min(40, (Number(top) / (previewH / 96)) * 100)
  const bottomPct = Math.min(40, (Number(bottom) / (previewH / 96)) * 100)
  const leftPct = Math.min(40, (Number(left) / (previewW / 96)) * 100)
  const rightPct = Math.min(40, (Number(right) / (previewW / 96)) * 100)

  const chooseSize = (key: string) => {
    setSizeKey(key)
    const size = PAGE_SIZES[key]
    if (size && key !== 'custom') {
      setPaperWidth(String(Math.round((size.w / 96) * 100) / 100))
      setPaperHeight(String(Math.round((size.h / 96) * 100) / 100))
    }
  }

  const apply = () => {
    const marginValues: CustomMargins = {
      top: Math.max(0, Number(top) || 0),
      right: Math.max(0, Number(right) || 0),
      bottom: Math.max(0, Number(bottom) || 0),
      left: Math.max(0, Number(left) || 0),
      gutter: Math.max(0, Number(gutter) || 0),
      mirrored: multiplePages === 'Mirror margins',
    }
    let finalKey = sizeKey
    if (sizeKey === 'custom' || !PAGE_SIZE_OPTIONS.some((item) => item.key === sizeKey)) {
      finalKey = registerCustomPaperSize(Math.round(Number(paperWidth) * 96), Math.round(Number(paperHeight) * 96))
    }
    setCustomMargins(marginValues)
    setPageSetupOptions({
      sectionStart,
      header: Math.max(0, Number(header) || 0),
      footer: Math.max(0, Number(footer) || 0),
      verticalAlign,
      differentOddEven,
      differentFirstPage,
      multiplePages,
      applyTo,
    })
    onApply({
      sizeKey: finalKey,
      orientation,
      margins: {
        top: Math.round(marginValues.top * 96),
        right: Math.round(marginValues.right * 96),
        bottom: Math.round(marginValues.bottom * 96),
        left: Math.round((marginValues.left + marginValues.gutter) * 96),
      },
      customMargins: marginValues,
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog page-setup-dialog" role="dialog" aria-modal="true" aria-label="Page Setup">
        <div className="dialog-title">Page Setup</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button className={`dialog-tab${tab === 'margins' ? ' active' : ''}`} type="button" onClick={() => setTab('margins')}>Margins</button>
            <button className={`dialog-tab${tab === 'paper' ? ' active' : ''}`} type="button" onClick={() => setTab('paper')}>Paper</button>
            <button className={`dialog-tab${tab === 'layout' ? ' active' : ''}`} type="button" onClick={() => setTab('layout')}>Layout</button>
            <button className="dialog-tab" type="button" disabled>Paper Source</button>
          </div>

          <div className="page-setup-layout">
            <div className="page-setup-fields">
              {tab === 'margins' && (
                <>
                  <div className="dialog-subtitle">Margins</div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Top:</label>
                    <input type="number" step="0.1" min="0" value={top} onChange={(event) => setTop(event.target.value)} />
                    <label>Bottom:</label>
                    <input type="number" step="0.1" min="0" value={bottom} onChange={(event) => setBottom(event.target.value)} />
                    <label>Left:</label>
                    <input type="number" step="0.1" min="0" value={left} onChange={(event) => setLeft(event.target.value)} />
                    <label>Right:</label>
                    <input type="number" step="0.1" min="0" value={right} onChange={(event) => setRight(event.target.value)} />
                    <label>Gutter:</label>
                    <input type="number" step="0.1" min="0" value={gutter} onChange={(event) => setGutter(event.target.value)} />
                    <label>Gutter position:</label>
                    <select value="Left" onChange={() => undefined}>
                      <option>Left</option>
                      <option>Top</option>
                    </select>
                  </div>
                  <div className="dialog-subtitle">Orientation</div>
                  <div className="page-setup-orientation">
                    <label className={orientation === 'portrait' ? 'active' : ''}>
                      <input type="radio" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} />
                      <span className="orientation-icon portrait" />
                      Portrait
                    </label>
                    <label className={orientation === 'landscape' ? 'active' : ''}>
                      <input type="radio" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} />
                      <span className="orientation-icon landscape" />
                      Landscape
                    </label>
                  </div>
                  <div className="dialog-subtitle">Pages</div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Multiple pages:</label>
                    <select value={multiplePages} onChange={(event) => setMultiplePages(event.target.value)}>
                      <option>Normal</option>
                      <option>Mirror margins</option>
                      <option>2 pages per sheet</option>
                      <option>Book fold</option>
                    </select>
                    <label>Apply to:</label>
                    <select value={applyTo} onChange={(event) => setApplyTo(event.target.value)}>
                      <option>Whole document</option>
                      <option>This section</option>
                      <option>This point forward</option>
                      <option>Selected text</option>
                    </select>
                  </div>
                </>
              )}

              {tab === 'paper' && (
                <>
                  <div className="dialog-subtitle">Paper size</div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Paper size:</label>
                    <select value={sizeKey} onChange={(event) => chooseSize(event.target.value)}>
                      {PAGE_SIZE_OPTIONS.map((item) => (
                        <option key={item.key} value={item.key}>{item.label} {item.detail}</option>
                      ))}
                      <option value="custom">Custom size</option>
                    </select>
                    <label>Width:</label>
                    <input type="number" step="0.01" min="1" value={paperWidth} onChange={(event) => { setSizeKey('custom'); setPaperWidth(event.target.value) }} />
                    <label>Height:</label>
                    <input type="number" step="0.01" min="1" value={paperHeight} onChange={(event) => { setSizeKey('custom'); setPaperHeight(event.target.value) }} />
                  </div>
                  <div className="dialog-subtitle">Orientation</div>
                  <div className="page-setup-orientation">
                    <label className={orientation === 'portrait' ? 'active' : ''}>
                      <input type="radio" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} />
                      <span className="orientation-icon portrait" />
                      Portrait
                    </label>
                    <label className={orientation === 'landscape' ? 'active' : ''}>
                      <input type="radio" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} />
                      <span className="orientation-icon landscape" />
                      Landscape
                    </label>
                  </div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Apply to:</label>
                    <select value={applyTo} onChange={(event) => setApplyTo(event.target.value)}>
                      <option>Whole document</option>
                      <option>This section</option>
                      <option>This point forward</option>
                      <option>Selected text</option>
                    </select>
                  </div>
                  <p className="layout-dialog-note">Changing the paper size reflows the document; text is not scaled.</p>
                </>
              )}

              {tab === 'layout' && (
                <>
                  <div className="dialog-subtitle">Section</div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Section start:</label>
                    <select value={sectionStart} onChange={(event) => setSectionStart(event.target.value)}>
                      <option>New page</option>
                      <option>Continuous</option>
                      <option>Even page</option>
                      <option>Odd page</option>
                      <option>New column</option>
                    </select>
                    <label>Vertical alignment:</label>
                    <select value={verticalAlign} onChange={(event) => setVerticalAlign(event.target.value)}>
                      <option>Top</option>
                      <option>Center</option>
                      <option>Bottom</option>
                      <option>Justified</option>
                    </select>
                  </div>
                  <div className="dialog-section page-setup-checks">
                    <label className="check-row"><input type="checkbox" checked={differentOddEven} onChange={(event) => setDifferentOddEven(event.target.checked)} /> Different odd and even</label>
                    <label className="check-row"><input type="checkbox" checked={differentFirstPage} onChange={(event) => setDifferentFirstPage(event.target.checked)} /> Different first page</label>
                  </div>
                  <div className="dialog-subtitle">Headers and footers</div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Header:</label>
                    <input type="number" step="0.1" min="0" value={header} onChange={(event) => setHeader(event.target.value)} />
                    <label>Footer:</label>
                    <input type="number" step="0.1" min="0" value={footer} onChange={(event) => setFooter(event.target.value)} />
                  </div>
                  <div className="page-setup-buttons">
                    <button className="dialog-btn" type="button" onClick={onLineNumbers}>Line Numbers…</button>
                  </div>
                  <div className="dialog-grid page-setup-grid">
                    <label>Apply to:</label>
                    <select value={applyTo} onChange={(event) => setApplyTo(event.target.value)}>
                      <option>Whole document</option>
                      <option>This section</option>
                      <option>This point forward</option>
                      <option>Selected sections</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="page-setup-preview">
              <div className="dialog-field-label">Preview</div>
              <div className="lpp-wrap">
                <div className={`lpp-sheet${orientation === 'landscape' ? ' landscape' : ''}`}>
                  <div
                    className="lpp-margins"
                    style={{ top: `${topPct}%`, right: `${rightPct}%`, bottom: `${bottomPct}%`, left: `${leftPct}%` }}
                  >
                    <div className="lpp-textline" />
                    <div className="lpp-textline short" />
                    <div className="lpp-textline" />
                    <div className="lpp-textline short" />
                    <div className="lpp-textline" />
                  </div>
                  {Number(gutter) > 0 && <div className="lpp-gutter" style={{ left: `${leftPct}%` }} />}
                </div>
              </div>
              <div className="lpp-caption">
                {orientation === 'landscape' ? 'Landscape' : 'Portrait'} · {sizeKey === 'custom' ? 'Custom size' : PAGE_SIZES[sizeKey]?.label || 'Letter'}
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" type="button" onClick={apply}>OK</button>
          <button className="dialog-btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
