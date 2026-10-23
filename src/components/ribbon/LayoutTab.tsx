import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlignHorizontalJustifyCenter,
  BringToFront,
  Columns,
  Group as GroupIcon,
  Hash,
  LayoutGrid,
  Maximize,
  Minimize,
  Move,
  Pilcrow,
  RotateCw,
  SendToBack,
  SquareDashed,
  WrapText,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, SmallButton } from './ui'
import { insertPageBreak, setParagraphFormat } from '../../editor/actions'
import { PAGE_SIZES } from '../../lib/constants'
import {
  MARGIN_GALLERY,
  PAGE_SIZE_OPTIONS,
  getColumnGap,
  setColumnsConfig,
  setCustomMargins,
  setHyphenationConfig,
  setLineNumberConfig,
  useLayoutStore,
  type ColumnConfig,
  type ColumnPreset,
  type LineNumberMode,
} from '../layout/layoutStore'
import PageSetupDialog from '../layout/PageSetupDialog'
import ColumnsDialog from '../layout/ColumnsDialog'
import LineNumbersDialog from '../layout/LineNumbersDialog'
import HyphenationDialog from '../layout/HyphenationDialog'
import SelectionPane from '../layout/SelectionPane'
import ParagraphDialog from '../ParagraphDialog'
import {
  alignGraphics,
  applyGraphicPosition,
  bringForward,
  distributeGraphics,
  flipGraphic,
  getArrangeTargets,
  groupGraphics,
  rotateGraphic,
} from '../layout/arrangeActions'
import '../layout/layoutStore'
import '../../styles/layout-advanced.css'

type PageSetupTab = 'margins' | 'paper' | 'layout'

function BigMenu({
  icon,
  label,
  width = 220,
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
  width = 190,
  caret,
  children,
}: {
  icon?: ReactNode
  label: string
  width?: number
  caret?: boolean
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => <SmallButton icon={icon} label={label} wide caret={caret} onClick={toggle} onCaret={toggle} />}
    >
      {children}
    </Popover>
  )
}

function MarginThumb({ top, right, bottom, left }: { top: number; right: number; bottom: number; left: number }) {
  const vertical = 11
  const horizontal = 8.5
  return (
    <span className="layout-page-thumb">
      <span
        className="layout-margin-box"
        style={{
          top: `${Math.min(36, (top / vertical) * 100)}%`,
          bottom: `${Math.min(36, (bottom / vertical) * 100)}%`,
          left: `${Math.min(38, (left / horizontal) * 100)}%`,
          right: `${Math.min(38, (right / horizontal) * 100)}%`,
        }}
      >
        <span /><span /><span /><span className="short" />
      </span>
    </span>
  )
}

function OrientationThumb({ landscape }: { landscape?: boolean }) {
  return (
    <span className={`orientation-card-page${landscape ? ' landscape' : ''}`}>
      <span className="orientation-card-line" />
      <span className="orientation-card-line short" />
      <span className="orientation-card-line" />
    </span>
  )
}

function SizeThumb({ wide, tall }: { wide?: boolean; tall?: boolean }) {
  return <span className={`layout-size-thumb${wide ? ' wide' : ''}${tall ? ' tall' : ''}`} />
}

function ColumnsThumb({ preset }: { preset: String }) {
  const count = preset === 'one' ? 1 : preset === 'three' ? 3 : 2
  return (
    <span className="layout-columns-thumb">
      <span className="layout-columns-page">
        {Array.from({ length: count }).map((_, index) => (
          <span key={index} className={`layout-columns-band${preset === 'left' && index === 0 ? ' narrow' : preset === 'right' && index === 1 ? ' narrow' : ''}`} />
        ))}
      </span>
    </span>
  )
}

function presetCount(preset: ColumnPreset): number {
  if (preset === 'one') return 1
  if (preset === 'three') return 3
  return 2
}

function presetWidths(page: { sizeKey: string; orientation: string; margins: { left: number; right: number } }, preset: ColumnPreset, count: number) {
  const size = PAGE_SIZES[page.sizeKey] || PAGE_SIZES.letter
  const width = (page.orientation === 'landscape' ? size.h : size.w) - page.margins.left - page.margins.right
  const usable = Math.max(1, width / 96)
  const gap = 0.5
  if (preset === 'left') {
    return [
      { width: Math.round(((usable - gap) * 0.33) * 100) / 100, spacing: gap },
      { width: Math.round(((usable - gap) * 0.67) * 100) / 100, spacing: gap },
    ]
  }
  if (preset === 'right') {
    return [
      { width: Math.round(((usable - gap) * 0.67) * 100) / 100, spacing: gap },
      { width: Math.round(((usable - gap) * 0.33) * 100) / 100, spacing: gap },
    ]
  }
  const safe = Math.max(1, count)
  const column = Math.round(((usable - gap * (safe - 1)) / safe) * 100) / 100
  return Array.from({ length: safe }, () => ({ width: Math.max(0.1, column), spacing: gap }))
}

export default function LayoutTab() {
  const {
    editor,
    page,
    setPage,
    paragraphBefore,
    paragraphAfter,
    setParagraphBefore,
    setParagraphAfter,
    toast,
  } = useWord()
  const layout = useLayoutStore()
  const [pageSetupTab, setPageSetupTab] = useState<PageSetupTab | null>(null)
  const [showColumns, setShowColumns] = useState(false)
  const [showLineNumbers, setShowLineNumbers] = useState(false)
  const [showHyphenation, setShowHyphenation] = useState(false)
  const [showParagraph, setShowParagraph] = useState(false)
  const [showSelectionPane, setShowSelectionPane] = useState(false)
  if (!editor) return null

  const type = editor.isActive('heading') ? 'heading' : 'paragraph'
  const attrs = editor.getAttributes(type)
  const curIndent = Number(attrs.indent || 0)
  const attrLeft = attrs.indentLeft !== null && attrs.indentLeft !== undefined ? Number(attrs.indentLeft) : curIndent * 0.5
  const attrRight = Number(attrs.indentRight || 0)
  const spaceBefore = attrs.spaceBefore !== null && attrs.spaceBefore !== undefined ? Number(attrs.spaceBefore) : paragraphBefore
  const spaceAfter = attrs.spaceAfter !== null && attrs.spaceAfter !== undefined ? Number(attrs.spaceAfter) : paragraphAfter
  const suppressCurrent = Boolean(attrs.suppressLineNumbers)
  const hasSelection = editor.state.selection.from !== editor.state.selection.to

  const applyMargin = (margin: { top: number; right: number; bottom: number; left: number; label: string; key: string }) => {
    setCustomMargins({
      top: margin.top,
      right: margin.right,
      bottom: margin.bottom,
      left: margin.left,
      gutter: 0,
      mirrored: margin.key === 'mirrored',
    })
    setPage({
      ...page,
      margins: {
        top: Math.round(margin.top * 96),
        right: Math.round(margin.right * 96),
        bottom: Math.round(margin.bottom * 96),
        left: Math.round(margin.left * 96),
      },
    })
    toast(`Margins: ${margin.label}`)
  }

  const applyLastCustom = () => {
    const custom = layout.customMargins
    setPage({
      ...page,
      margins: {
        top: Math.round(custom.top * 96),
        right: Math.round(custom.right * 96),
        bottom: Math.round(custom.bottom * 96),
        left: Math.round((custom.left + custom.gutter) * 96),
      },
    })
    toast('Last custom margins applied')
  }

  const applyOrientation = (orientation: 'portrait' | 'landscape') => {
    setPage({ ...page, orientation })
  }

  const applySize = (sizeKey: string) => {
    setPage({ ...page, sizeKey })
    toast(`Paper size: ${PAGE_SIZES[sizeKey]?.label || sizeKey}`)
  }

  const applyColumns = (preset: ColumnPreset) => {
    const count = presetCount(preset)
    const config: ColumnConfig = {
      ...layout.columns,
      preset,
      count,
      gapIn: getColumnGap(layout.columns.widths),
      widths: presetWidths(page, preset, count),
      equalWidth: preset === 'one' || preset === 'two' || preset === 'three',
    }
    setColumnsConfig(config)
    setPage({ ...page, columns: count })
    toast(`Columns: ${preset === 'one' ? 'One' : preset === 'two' ? 'Two' : preset === 'three' ? 'Three' : preset === 'left' ? 'Left' : 'Right'}`)
  }

  const insertBreak = (kind: string) => {
    editor.chain().focus().insertContent({ type: 'layoutBreak', attrs: { kind } }).run()
  }

  const setLineMode = (mode: LineNumberMode) => {
    setLineNumberConfig({ mode })
    if (mode !== 'none') toast(`Line numbers: ${mode === 'continuous' ? 'Continuous' : mode === 'page' ? 'Restart each page' : 'Restart each section'}`)
  }

  const toggleSuppress = () => {
    setParagraphFormat(editor, { suppressLineNumbers: !suppressCurrent })
    toast(suppressCurrent ? 'Line numbering restored for paragraph' : 'Line numbering suppressed for paragraph')
  }

  const setHyphenMode = (mode: 'none' | 'auto' | 'manual') => {
    setHyphenationConfig({ mode })
    toast(mode === 'none' ? 'Hyphenation off' : mode === 'auto' ? 'Automatic hyphenation on' : 'Manual hyphenation on')
  }

  const arrangeTargets = () => {
    const targets = getArrangeTargets(editor)
    if (!targets.length) toast('Select a picture or shape first')
    return targets
  }

  return (
    <>
      <RibbonGroup label="Page Setup" className="page-setup" launcher={{ title: 'Page Setup', onClick: () => setPageSetupTab('margins') }}>
        <BigMenu icon={<LayoutGrid size={22} />} label="Margins" width={300}>
          {(close) => (
            <div className="menu layout-menu">
              {MARGIN_GALLERY.map((margin) => {
                const active =
                  Math.round(page.margins.top / 96 * 100) === Math.round(margin.top * 100) &&
                  Math.round(page.margins.right / 96 * 100) === Math.round(margin.right * 100) &&
                  Math.round(page.margins.bottom / 96 * 100) === Math.round(margin.bottom * 100) &&
                  Math.round(page.margins.left / 96 * 100) === Math.round(margin.left * 100)
                return (
                  <button key={margin.key} type="button" className={`layout-gallery-item${active ? ' active' : ''}`} onClick={() => { applyMargin(margin); close() }}>
                    <MarginThumb top={margin.top} right={margin.right} bottom={margin.bottom} left={margin.left} />
                    <span className="layout-gallery-copy">
                      <span className="layout-gallery-label">{margin.label}</span>
                      <span className="layout-gallery-detail">Top {margin.top}" · Bottom {margin.bottom}" · Left {margin.left}" · Right {margin.right}"</span>
                    </span>
                  </button>
                )
              })}
              <MenuSep />
              <button type="button" className="layout-gallery-item" onClick={() => { applyLastCustom(); close() }}>
                <span className="layout-page-thumb"><span className="layout-margin-box custom"><span /><span /><span /></span></span>
                <span className="layout-gallery-copy">
                  <span className="layout-gallery-label">Last Custom Margins</span>
                  <span className="layout-gallery-detail">
                    Top {layout.customMargins.top}" · Bottom {layout.customMargins.bottom}" · Left {layout.customMargins.left}" · Right {layout.customMargins.right}"
                  </span>
                </span>
              </button>
              <MenuItem label="Custom Margins…" onClick={() => { setPageSetupTab('margins'); close() }} />
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<Maximize size={22} />} label="Orientation" width={250}>
          {(close) => (
            <div className="menu layout-orientation-menu">
              <button type="button" className={`layout-orientation-card${page.orientation === 'portrait' ? ' active' : ''}`} onClick={() => { applyOrientation('portrait'); close() }}>
                <OrientationThumb />
                <span className="layout-gallery-label">Portrait</span>
              </button>
              <button type="button" className={`layout-orientation-card${page.orientation === 'landscape' ? ' active' : ''}`} onClick={() => { applyOrientation('landscape'); close() }}>
                <OrientationThumb landscape />
                <span className="layout-gallery-label">Landscape</span>
              </button>
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<Minimize size={22} />} label="Size" width={290}>
          {(close) => (
            <div className="menu layout-size-menu">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size.key}
                  type="button"
                  className={`layout-size-item${page.sizeKey === size.key ? ' active' : ''}`}
                  onClick={() => { applySize(size.key); close() }}
                >
                  <SizeThumb wide={size.key === 'tabloid'} tall={size.key === 'legal' || size.key === 'folio'} />
                  <span className="layout-size-name">{size.label}</span>
                  <span className="layout-size-detail">{size.detail}</span>
                  {page.sizeKey === size.key && <span className="layout-check">✓</span>}
                </button>
              ))}
              <MenuSep />
              <MenuItem label="More Paper Sizes…" onClick={() => { setPageSetupTab('paper'); close() }} />
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<Columns size={22} />} label="Columns" width={278}>
          {(close) => (
            <div className="menu layout-columns-menu">
              <div className="layout-columns-gallery">
                {(['one', 'two', 'three', 'left', 'right'] as ColumnPreset[]).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={`layout-columns-item${layout.columns.preset === preset ? ' active' : ''}`}
                    onClick={() => { applyColumns(preset); close() }}
                  >
                    <ColumnsThumb preset={preset} />
                    <span className="layout-columns-label">{preset === 'one' ? 'One' : preset === 'two' ? 'Two' : preset === 'three' ? 'Three' : preset === 'left' ? 'Left' : 'Right'}</span>
                  </button>
                ))}
              </div>
              <MenuSep />
              <MenuItem label="More Columns…" onClick={() => { setShowColumns(true); close() }} />
            </div>
          )}
        </BigMenu>

        <div className="setup-right">
          <Popover
            width={250}
            trigger={({ toggle }) => <SmallButton icon={<Pilcrow size={15} />} label="Breaks" wide caret onClick={toggle} onCaret={toggle} />}
          >
            {(close) => (
              <div className="menu">
                <MenuLabel>Page Breaks</MenuLabel>
                <MenuItem label="Page" shortcut="Ctrl+Enter" onClick={() => { insertPageBreak(editor); close() }} />
                <MenuLabel>Column Breaks</MenuLabel>
                <MenuItem label="Column" shortcut="Ctrl+Shift+Enter" onClick={() => { insertBreak('column'); close() }} />
                <MenuLabel>Section Breaks</MenuLabel>
                <MenuItem label="Next Page" onClick={() => { insertBreak('sectionNext'); close() }} />
                <MenuItem label="Continuous" onClick={() => { insertBreak('sectionContinuous'); close() }} />
                <MenuItem label="Even Page" onClick={() => { insertBreak('sectionEven'); close() }} />
                <MenuItem label="Odd Page" onClick={() => { insertBreak('sectionOdd'); close() }} />
                <MenuLabel>Text Wrapping</MenuLabel>
                <MenuItem label="Text Wrapping" onClick={() => { insertBreak('textWrapping'); close() }} />
              </div>
            )}
          </Popover>

          <SmallMenu icon={<Hash size={15} />} label="Line Numbers" width={224} caret>
            {(close) => (
              <div className="menu">
                {[
                  { key: 'none', label: 'None' },
                  { key: 'continuous', label: 'Continuous' },
                  { key: 'page', label: 'Restart Each Page' },
                  { key: 'section', label: 'Restart Each Section' },
                ].map((item) => (
                  <MenuItem key={item.key} label={item.label} active={layout.lineNumbers.mode === item.key} onClick={() => { setLineMode(item.key as LineNumberMode); close() }} />
                ))}
                <MenuSep />
                <MenuItem label="Suppress for Current Paragraph" active={suppressCurrent} onClick={() => { toggleSuppress(); close() }} />
                <MenuItem label="Line Numbering Options…" onClick={() => { setShowLineNumbers(true); close() }} />
              </div>
            )}
          </SmallMenu>

          <SmallMenu icon={<Pilcrow size={15} />} label="Hyphenation" width={216} caret>
            {(close) => (
              <div className="menu">
                <MenuItem label="None" active={layout.hyphenation.mode === 'none'} onClick={() => { setHyphenMode('none'); close() }} />
                <MenuItem label="Automatic" active={layout.hyphenation.mode === 'auto'} onClick={() => { setHyphenMode('auto'); close() }} />
                <MenuItem label="Manual" active={layout.hyphenation.mode === 'manual'} onClick={() => { setHyphenMode('manual'); close() }} />
                <MenuSep />
                <MenuItem label="Hyphenation Options…" onClick={() => { setShowHyphenation(true); close() }} />
              </div>
            )}
          </SmallMenu>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Paragraph" launcher={{ title: 'Paragraph', onClick: () => setShowParagraph(true) }}>
        <div className="layout-para">
          <div className="layout-col">
            <span className="para-head">Indent</span>
            <div className="ribbon-rows">
              <span className="num-label">Left:</span>
              <input
                className="num-input"
                type="number"
                step={0.1}
                min={0}
                value={Math.round(attrLeft * 2.54 * 10) / 10}
                onChange={(e) => {
                  const cm = Math.max(0, Number(e.target.value) || 0)
                  const inches = cm / 2.54
                  setParagraphFormat(editor, { indentLeft: inches > 0 ? Math.round(inches * 100) / 100 : null, indent: 0 })
                }}
              />
              <span className="num-unit">cm</span>
            </div>
            <div className="ribbon-rows">
              <span className="num-label">Right:</span>
              <input
                className="num-input"
                type="number"
                step={0.1}
                min={0}
                value={Math.round(attrRight * 2.54 * 10) / 10}
                onChange={(e) => {
                  const cm = Math.max(0, Number(e.target.value) || 0)
                  const inches = cm / 2.54
                  setParagraphFormat(editor, { indentRight: inches > 0 ? Math.round(inches * 100) / 100 : null })
                }}
              />
              <span className="num-unit">cm</span>
            </div>
          </div>
          <div className="layout-col">
            <span className="para-head">Spacing</span>
            <div className="ribbon-rows">
              <span className="num-label">Before:</span>
              <input
                className="num-input"
                type="number"
                step={2}
                min={0}
                value={spaceBefore}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value) || 0)
                  setParagraphBefore(value)
                  setParagraphFormat(editor, { spaceBefore: value })
                }}
              />
              <span className="num-unit">pt</span>
            </div>
            <div className="ribbon-rows">
              <span className="num-label">After:</span>
              <input
                className="num-input"
                type="number"
                step={2}
                min={0}
                value={spaceAfter}
                onChange={(e) => {
                  const value = Math.max(0, Number(e.target.value) || 0)
                  setParagraphAfter(value)
                  setParagraphFormat(editor, { spaceAfter: value })
                }}
              />
              <span className="num-unit">pt</span>
            </div>
          </div>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Arrange" className="arrange-group">
        <BigMenu icon={<Move size={22} />} label="Position" width={224}>
          {(close) => (
            <div className="menu">
              {[
                { key: 'inline', label: 'In Line with Text' },
                { key: 'square', label: 'Square' },
                { key: 'tight', label: 'Tight' },
                { key: 'through', label: 'Through' },
                { key: 'topBottom', label: 'Top and Bottom' },
                { key: 'behind', label: 'Behind Text' },
                { key: 'front', label: 'In Front of Text' },
              ].map((item) => (
                <MenuItem
                  key={item.key}
                  label={item.label}
                  onClick={() => {
                    const targets = arrangeTargets()
                    if (targets.length) applyGraphicPosition(editor, targets, item.key)
                    close()
                  }}
                />
              ))}
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<WrapText size={22} />} label="Wrap Text" width={224}>
          {(close) => (
            <div className="menu">
              {[
                { key: 'inline', label: 'In Line with Text' },
                { key: 'square', label: 'Square' },
                { key: 'tight', label: 'Tight' },
                { key: 'through', label: 'Through' },
                { key: 'topBottom', label: 'Top and Bottom' },
                { key: 'behind', label: 'Behind Text' },
                { key: 'front', label: 'In Front of Text' },
              ].map((item) => (
                <MenuItem
                  key={item.key}
                  label={item.label}
                  onClick={() => {
                    const targets = arrangeTargets()
                    if (targets.length) applyGraphicPosition(editor, targets, item.key)
                    close()
                  }}
                />
              ))}
              <MenuSep />
              <MenuItem label="Edit Wrap Points" onClick={() => { toast('Drag the image wrap handles in the document'); close() }} />
              <MenuItem label="More Layout Options…" onClick={() => { setPageSetupTab('layout'); close() }} />
            </div>
          )}
        </BigMenu>

        <BigButton
          icon={<BringToFront size={22} />}
          label="Bring Forward"
          onClick={() => {
            const targets = arrangeTargets()
            if (targets.length) {
              bringForward(editor, targets, 'forward')
              toast('Brought forward')
            }
          }}
        />
        <BigButton
          icon={<SendToBack size={22} />}
          label="Send Backward"
          onClick={() => {
            const targets = arrangeTargets()
            if (targets.length) {
              bringForward(editor, targets, 'backward')
              toast('Sent backward')
            }
          }}
        />

        <div className="arrange-mini">
          <SmallButton icon={<SquareDashed size={15} />} label="Selection Pane" wide onClick={() => setShowSelectionPane(true)} />
          <SmallMenu icon={<AlignHorizontalJustifyCenter size={15} />} label="Align" caret>
            {(close) => (
              <div className="menu">
                <MenuLabel>Align</MenuLabel>
                {[
                  { key: 'left', label: 'Align Left' },
                  { key: 'center', label: 'Align Center' },
                  { key: 'right', label: 'Align Right' },
                  { key: 'top', label: 'Align Top' },
                  { key: 'middle', label: 'Align Middle' },
                  { key: 'bottom', label: 'Align Bottom' },
                ].map((item) => (
                  <MenuItem
                    key={item.key}
                    label={item.label}
                    onClick={() => {
                      const targets = arrangeTargets()
                      if (targets.length) alignGraphics(editor, targets, item.key as 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom')
                      close()
                    }}
                  />
                ))}
                <MenuSep />
                <MenuItem label="Distribute Horizontally" onClick={() => { const targets = arrangeTargets(); if (targets.length) distributeGraphics(editor, targets, 'horizontal'); close() }} />
                <MenuItem label="Distribute Vertically" onClick={() => { const targets = arrangeTargets(); if (targets.length) distributeGraphics(editor, targets, 'vertical'); close() }} />
                <MenuSep />
                <MenuLabel>Align to</MenuLabel>
                <MenuItem label="Page" onClick={close} />
                <MenuItem label="Margin" onClick={close} />
                <MenuItem label="Selected Objects" onClick={close} />
              </div>
            )}
          </SmallMenu>
          <SmallMenu icon={<GroupIcon size={15} />} label="Group" caret>
            {(close) => (
              <div className="menu">
                <MenuItem label="Group" onClick={() => { const targets = arrangeTargets(); if (targets.length) { groupGraphics(editor, targets, 'group'); toast('Objects grouped') } close() }} />
                <MenuItem label="Ungroup" onClick={() => { const targets = arrangeTargets(); if (targets.length) { groupGraphics(editor, targets, 'ungroup'); toast('Objects ungrouped') } close() }} />
                <MenuItem label="Regroup" onClick={() => { const targets = arrangeTargets(); if (targets.length) { groupGraphics(editor, targets, 'regroup'); toast('Objects regrouped') } close() }} />
              </div>
            )}
          </SmallMenu>
          <SmallMenu icon={<RotateCw size={15} />} label="Rotate" caret>
            {(close) => (
              <div className="menu">
                <MenuItem label="Rotate Right 90°" onClick={() => { const targets = arrangeTargets(); if (targets.length) rotateGraphic(editor, targets, 'right'); close() }} />
                <MenuItem label="Rotate Left 90°" onClick={() => { const targets = arrangeTargets(); if (targets.length) rotateGraphic(editor, targets, 'left'); close() }} />
                <MenuSep />
                <MenuItem label="Flip Vertical" onClick={() => { const targets = arrangeTargets(); if (targets.length) flipGraphic(editor, targets, 'vertical'); close() }} />
                <MenuItem label="Flip Horizontal" onClick={() => { const targets = arrangeTargets(); if (targets.length) flipGraphic(editor, targets, 'horizontal'); close() }} />
                <MenuSep />
                <MenuItem label="More Rotation Options…" onClick={() => { toast('Use the Position menu for precise placement'); close() }} />
              </div>
            )}
          </SmallMenu>
        </div>
      </RibbonGroup>

      {pageSetupTab && (
        <PageSetupDialog
          page={page}
          initialTab={pageSetupTab}
          onClose={() => setPageSetupTab(null)}
          onLineNumbers={() => { setPageSetupTab(null); setShowLineNumbers(true) }}
          onApply={(value) => {
            setPage({ ...page, sizeKey: value.sizeKey, orientation: value.orientation, margins: value.margins })
            setCustomMargins(value.customMargins)
            setPageSetupTab(null)
            toast('Page setup applied')
          }}
        />
      )}

      {showColumns && (
        <ColumnsDialog
          page={page}
          hasSelection={hasSelection}
          onClose={() => setShowColumns(false)}
          onApply={(config) => {
            setColumnsConfig(config)
            setPage({ ...page, columns: config.count })
            if (config.applyTo === 'forward') insertBreak('sectionContinuous')
            setShowColumns(false)
            toast(`Columns applied to ${config.count} column${config.count === 1 ? '' : 's'}`)
          }}
        />
      )}

      {showLineNumbers && <LineNumbersDialog onClose={() => setShowLineNumbers(false)} />}
      {showHyphenation && <HyphenationDialog onClose={() => setShowHyphenation(false)} />}
      {showParagraph && <ParagraphDialog editor={editor} onClose={() => setShowParagraph(false)} />}
      {showSelectionPane && <SelectionPane editor={editor} onClose={() => setShowSelectionPane(false)} />}
    </>
  )
}
