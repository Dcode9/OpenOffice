import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  Check,
  CircleHelp,
  Eraser,
  Eye,
  EyeOff,
  Frame,
  Hand,
  Highlighter,
  LassoSelect,
  MousePointer2,
  PaintBucket,
  Pencil,
  PenLine,
  Plus,
  Redo2,
  RotateCcw,
  Ruler,
  Shapes,
  Sigma,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup } from './ui'
import { INK_COLORS } from '../../lib/ink'
import { PAGE_SIZES, TEXT_COLORS } from '../../lib/constants'
import {
  addCanvas,
  addPen,
  choosePen,
  clearInk,
  deleteSelection,
  inkToShapeDataUrl,
  recognizeMath,
  removePen,
  removeStrokes,
  setBackground,
  setEraserMode,
  setSelection,
  setTool,
  setTouchOnly,
  startReplay,
  strokeWidthPx,
  toggleHidden,
  toggleRuler,
  undoInk,
  redoInk,
  updatePen,
  useInkState,
  type PenDef,
  type PenKind,
} from '../../lib/ink'

const SIZE_OPTIONS: Record<PenKind, number[]> = {
  pen: [0.25, 0.35, 0.5, 0.75, 1, 2, 3.5],
  pencil: [0.25, 0.35, 0.5, 0.75, 1, 1.5],
  highlighter: [2, 3, 4, 5, 6, 8],
  effects: [0.35, 0.5, 0.75, 1, 2],
}

function InkSwatch({ pen }: { pen: PenDef }) {
  return (
    <span
      className={`ink-swatch${pen.kind === 'highlighter' ? ' ink-highlighter' : ''}${pen.kind === 'effects' ? ' ink-effects' : ''}${pen.kind === 'pencil' ? ' ink-pencil' : ''}`}
      style={{ background: pen.kind === 'effects' ? undefined : pen.color }}
    />
  )
}

function AddPenMenu({
  close,
  count,
  toast,
}: {
  close: () => void
  count: number
  toast: (message: string) => void
}) {
  const [kind, setKind] = useState<PenKind>('pen')
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(0.5)
  const options = SIZE_OPTIONS[kind]

  const changeKind = (next: PenKind) => {
    setKind(next)
    setSize(SIZE_OPTIONS[next][next === 'highlighter' ? 2 : 2])
  }

  const create = () => {
    const label = kind === 'highlighter' ? 'Highlighter' : kind === 'pencil' ? 'Pencil' : 'Pen'
    addPen({ name: `${label} ${count + 1}`, color, size, kind })
    toast(`${label} added: ${size} mm`)
    close()
  }

  return (
    <div className="menu">
      <MenuLabel>Add Pen</MenuLabel>
      <div className="ink-add-types">
        <button type="button" className={`ink-add-type${kind === 'pen' ? ' active' : ''}`} onClick={() => changeKind('pen')}>
          <PenLine size={13} /> Pen
        </button>
        <button type="button" className={`ink-add-type${kind === 'pencil' ? ' active' : ''}`} onClick={() => changeKind('pencil')}>
          <Pencil size={13} /> Pencil
        </button>
        <button
          type="button"
          className={`ink-add-type${kind === 'highlighter' ? ' active' : ''}`}
          onClick={() => changeKind('highlighter')}
        >
          <Highlighter size={13} /> Highlighter
        </button>
      </div>
      <MenuLabel>Color</MenuLabel>
      <div className="ink-colors">
        {INK_COLORS.map((value) => (
          <button
            key={value}
            type="button"
            className="ink-color"
            style={{ background: value }}
            title={value}
            onClick={() => setColor(value)}
          >
            {color === value ? <Check size={11} color={value === '#ffffff' ? '#333' : '#fff'} /> : null}
          </button>
        ))}
      </div>
      <MenuLabel>Thickness</MenuLabel>
      <div className="ink-size-row">
        {options.map((value) => (
          <button
            key={value}
            type="button"
            className={`ink-size-chip${size === value ? ' active' : ''}`}
            onClick={() => setSize(value)}
          >
            {value} mm
          </button>
        ))}
      </div>
      <div className="ink-preview-line">
        <span
          style={{
            height: Math.min(18, Math.max(2, strokeWidthPx(size, kind))),
            background: color,
            opacity: kind === 'highlighter' ? 0.45 : 1,
          }}
        />
      </div>
      <button type="button" className="ink-add-confirm" onClick={create}>
        Add Pen
      </button>
    </div>
  )
}

export default function DrawTab() {
  const { editor, page, setPage, toast } = useWord()
  const ink = useInkState()
  if (!editor) return null

  const size = PAGE_SIZES[page.sizeKey] || PAGE_SIZES.letter
  const pageW = page.orientation === 'landscape' ? size.h : size.w
  const pageH = page.orientation === 'landscape' ? size.w : size.h

  const choose = (pen: PenDef) => choosePen(pen.id)

  const penMenu = (pen: PenDef, close: () => void) => (
    <div className="menu">
      <MenuLabel>{pen.name} options</MenuLabel>
      {SIZE_OPTIONS[pen.kind].map((value) => (
        <MenuItem
          key={value}
          label={`${value} mm`}
          active={pen.size === value}
          onClick={() => {
            updatePen(pen.id, { size: value })
            choosePen(pen.id)
          }}
        />
      ))}
      <MenuSep />
      <MenuLabel>Color</MenuLabel>
      <div className="ink-colors">
        {INK_COLORS.map((value) => (
          <button
            key={value}
            type="button"
            className="ink-color"
            style={{ background: value }}
            title={value}
            onClick={() => {
              updatePen(pen.id, { color: value })
              choosePen(pen.id)
            }}
          />
        ))}
      </div>
      {pen.id !== 'black' && (
        <>
          <MenuSep />
          <MenuItem
            label="Delete Pen"
            onClick={() => {
              removePen(pen.id)
              close()
            }}
          />
        </>
      )}
    </div>
  )

  const sourceStrokes = () => {
    if (ink.selection.length) return ink.strokes.filter((stroke) => ink.selection.includes(stroke.id))
    const last = ink.strokes[ink.strokes.length - 1]
    return last ? [last] : []
  }

  const inkToShape = () => {
    const strokes = sourceStrokes()
    if (!strokes.length) {
      toast('Draw or select ink to convert')
      return
    }
    const art = inkToShapeDataUrl(strokes, pageW, pageH)
    if (!art) return
    editor
      .chain()
      .focus()
      .setImage({ src: art.src, alt: 'Ink shape', title: 'Ink to Shape' })
      .run()
    removeStrokes(strokes.map((stroke) => stroke.id))
    setSelection([])
    toast('Ink converted to shape')
  }

  const inkToMath = () => {
    const strokes = sourceStrokes()
    if (!strokes.length) {
      toast('Draw or select an equation first')
      return
    }
    const recognized = recognizeMath(strokes, pageW, pageH)
    const expression = recognized ?? '∫₀¹ f(x) dx = F(1) − F(0)'
    editor.chain().focus().insertContent(`<p>${expression}</p>`).run()
    if (ink.selection.length) {
      removeStrokes(strokes.map((stroke) => stroke.id))
      setSelection([])
    }
    toast(recognized ? `Recognized "${recognized}" and inserted math` : 'Math text object inserted')
  }

  const replay = () => {
    if (!ink.strokes.length) {
      toast('No ink to replay')
      return
    }
    startReplay()
    toast('Replaying ink strokes')
  }

  const inkBig = (icon: ReactNode, label: string, onClick: () => void, disabled?: boolean, active?: boolean) => (
    <BigButton icon={icon} label={label} onClick={onClick} disabled={disabled} active={active} />
  )

  return (
    <>
      <RibbonGroup label="Drawing Tools">
        <BigButton icon={<Undo2 size={22} />} label="Undo" onClick={undoInk} disabled={!ink.undo.length} />
        <BigButton icon={<Redo2 size={22} />} label="Redo" onClick={redoInk} disabled={!ink.redo.length} />
        <button className={`rb-big ink-btn${ink.tool === 'select' ? ' active' : ''}`} title="Select" onClick={() => setTool('select')} type="button">
          <span className="rb-big-icon"><MousePointer2 size={22} /></span>
          <span className="rb-big-label">Select</span>
        </button>
        <button className={`rb-big ink-btn${ink.tool === 'lasso' ? ' active' : ''}`} title="Lasso Select" onClick={() => setTool('lasso')} type="button">
          <span className="rb-big-icon"><LassoSelect size={22} /></span>
          <span className="rb-big-label">Lasso</span>
        </button>
        <Popover
          width={210}
          trigger={({ toggle }) => (
            <button
              className={`rb-big ink-btn${ink.tool === 'eraser' ? ' active' : ''}`}
              title="Eraser"
              onClick={() => {
                setTool('eraser')
                toggle()
              }}
              type="button"
            >
              <span className="rb-big-icon"><Eraser size={22} /></span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <div className="menu">
              <MenuLabel>Eraser</MenuLabel>
              {([
                ['stroke', 'Stroke Eraser'],
                ['small', 'Small Eraser'],
                ['medium', 'Medium Eraser'],
                ['large', 'Large Eraser'],
              ] as const).map(([mode, label]) => (
                <MenuItem
                  key={mode}
                  label={label}
                  active={ink.eraserMode === mode}
                  onClick={() => {
                    setEraserMode(mode)
                    close()
                  }}
                />
              ))}
            </div>
          )}
        </Popover>
        {ink.pens.map((pen) => (
          <Popover
            key={pen.id}
            width={210}
            trigger={({ toggle }) => (
              <button
                className={`rb-big ink-btn${ink.tool === pen.id ? ' active' : ''}`}
                title={`${pen.name}: ${pen.size} mm`}
                onClick={() => choose(pen)}
                type="button"
              >
                <span className="rb-big-icon"><InkSwatch pen={pen} /></span>
                <span className="rb-caret" onClick={(event) => { event.stopPropagation(); toggle() }} />
              </button>
            )}
          >
            {(close) => penMenu(pen, close)}
          </Popover>
        ))}
        <Popover
          width={240}
          trigger={({ toggle }) => (
            <button className="rb-big ink-btn" title="Add Pen" onClick={toggle} type="button">
              <span className="rb-big-icon"><Plus size={22} /></span>
              <span className="rb-big-label">Add Pen</span>
            </button>
          )}
        >
          {(close) => <AddPenMenu close={close} count={ink.pens.length} toast={toast} />}
        </Popover>
      </RibbonGroup>

      <RibbonGroup label="Touch">
        <BigButton
          icon={<Hand size={22} />}
          label="Draw with Touch"
          active={ink.touchOnly}
          onClick={() => {
            setTouchOnly(!ink.touchOnly)
            toast(ink.touchOnly ? 'Touch drawing off — mouse pens enabled' : 'Touch drawing on — use a finger or stylus')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Stencils">
        <BigButton
          icon={<Ruler size={22} />}
          label="Ruler"
          active={ink.ruler.visible}
          onClick={() => {
            toggleRuler()
            toast(ink.ruler.visible ? 'Ruler hidden' : 'Ruler shown — drag, rotate, then draw along it')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Edit">
        <Popover
          width={250}
          trigger={({ toggle }) => (
            <button className="rb-big" onClick={toggle} title="Format Background" type="button">
              <span className="rb-big-icon"><PaintBucket size={22} /></span>
              <span className="rb-big-label">Format Background</span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <div className="menu">
              <MenuLabel>Background</MenuLabel>
              <MenuItem
                label="None"
                active={ink.background === 'none'}
                onClick={() => {
                  setBackground('none')
                  close()
                }}
              />
              <MenuItem
                label="Ruled Lines"
                active={ink.background === 'ruled'}
                onClick={() => {
                  setBackground('ruled')
                  close()
                }}
              />
              <MenuItem
                label="Grid Lines"
                active={ink.background === 'grid'}
                onClick={() => {
                  setBackground('grid')
                  close()
                }}
              />
              <MenuSep />
              <MenuLabel>Page Color</MenuLabel>
              <div className="color-grid">
                <button
                  type="button"
                  className="swatch none"
                  title="No Color"
                  onClick={() => {
                    setPage({ ...page, pageColor: '#ffffff' })
                    close()
                  }}
                />
                {TEXT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="swatch"
                    style={{ background: color }}
                    title={color}
                    onClick={() => {
                      setPage({ ...page, pageColor: color })
                      close()
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </Popover>
        <BigButton
          icon={ink.hidden ? <EyeOff size={22} /> : <Eye size={22} />}
          label={ink.hidden ? 'Show Ink' : 'Hide Ink'}
          active={ink.hidden}
          onClick={toggleHidden}
        />
        <BigButton
          icon={<Trash2 size={22} />}
          label="Delete"
          disabled={!ink.selection.length}
          onClick={() => {
            deleteSelection()
            toast('Selected ink deleted')
          }}
        />
        <BigButton
          icon={<Eraser size={22} />}
          label="Clear Ink"
          disabled={!ink.strokes.length}
          onClick={() => {
            clearInk()
            toast('All ink cleared — Undo restores it')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Convert">
        {inkBig(<Shapes size={22} />, 'Ink to Shape', inkToShape, !ink.strokes.length)}
        {inkBig(<Sigma size={22} />, 'Ink to Math', inkToMath, !ink.strokes.length)}
      </RibbonGroup>

      <RibbonGroup label="Insert">
        <BigButton
          icon={<Frame size={22} />}
          label="Drawing Canvas"
          onClick={() => {
            addCanvas()
            toast('Drawing Canvas inserted on the page')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Replay">
        <BigButton icon={<RotateCcw size={22} />} label="Ink Replay" onClick={replay} disabled={!ink.strokes.length} />
      </RibbonGroup>

      <RibbonGroup label="Help">
        <Popover
          width={330}
          trigger={({ toggle }) => (
            <button className="rb-big" onClick={toggle} title="Ink Help" type="button">
              <span className="rb-big-icon"><CircleHelp size={22} /></span>
              <span className="rb-big-label">Ink Help</span>
            </button>
          )}
        >
          <div className="ink-help">
            <h4>Drawing with ink</h4>
            <ul>
              <li>Pick a pen, then draw on the page. Pressure-sensitive pens vary line width.</li>
              <li>Use <b>Lasso</b> to circle strokes and delete them, or <b>Select</b> to click strokes.</li>
              <li>Turn on <b>Ruler</b> and draw near it to snap straight lines. Drag the ruler, or use the round handle to rotate it.</li>
              <li>The <b>Highlighter</b> draws wide, translucent ink. Right-click a pen shelf item for size and color options.</li>
              <li><b>Ink to Shape</b> converts selected ink to an editable picture; <b>Ink to Math</b> recognizes simple marks or inserts an equation.</li>
              <li>Press <kbd>Delete</kbd> to remove selected ink. <kbd>Ctrl</kbd>+<kbd>Z</kbd> is the editor's text undo; use the ribbon Undo for ink.</li>
            </ul>
          </div>
        </Popover>
      </RibbonGroup>
    </>
  )
}
