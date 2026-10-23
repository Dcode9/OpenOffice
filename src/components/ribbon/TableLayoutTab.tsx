import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ArrowDownAZ,
  ArrowLeftRight,
  Columns3,
  Eraser,
  Grid3x3,
  Rows3,
  Table2,
  TextCursorInput,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonRow, SmallButton } from './ui'
import {
  convertTableToText,
  deleteCells,
  distributeColumns,
  distributeRows,
  getTableAttrs,
  insertCells,
  selectTable,
  selectCellAtCursor,
  selectRowAtCursor,
  selectColumnAtCursor,
  setAutoFit,
  setCellAttrs,
  setTableAttrs,
  sortTable,
  splitTableAtCursor,
} from '../../editor/actions'
import InsertCellsDialog from '../InsertCellsDialog'
import TablePropertiesDialog from '../TablePropertiesDialog'
import SortTableDialog from '../SortTableDialog'

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

const ALIGN_CELLS = [
  { key: 'top-left', v: 'top', h: 'left', label: 'Align Top Left', symbol: '↖' },
  { key: 'top-center', v: 'top', h: 'center', label: 'Align Top Center', symbol: '↑' },
  { key: 'top-right', v: 'top', h: 'right', label: 'Align Top Right', symbol: '↗' },
  { key: 'center-left', v: 'middle', h: 'left', label: 'Align Center Left', symbol: '←' },
  { key: 'center', v: 'middle', h: 'center', label: 'Align Center', symbol: '·' },
  { key: 'center-right', v: 'middle', h: 'right', label: 'Align Center Right', symbol: '→' },
  { key: 'bottom-left', v: 'bottom', h: 'left', label: 'Align Bottom Left', symbol: '↙' },
  { key: 'bottom-center', v: 'bottom', h: 'center', label: 'Align Bottom Center', symbol: '↓' },
  { key: 'bottom-right', v: 'bottom', h: 'right', label: 'Align Bottom Right', symbol: '↘' },
]

const MARGIN_PRESETS = [
  { id: 'normal', label: 'Normal', value: '5.76' },
  { id: 'narrow', label: 'Narrow', value: '2.88' },
  { id: 'wide', label: 'Wide', value: '11.52' },
]

export default function TableLayoutTab() {
  const { editor, toast } = useWord()
  const [rowHeight, setRowHeight] = useState('')
  const [colWidth, setColWidth] = useState('')
  const [showInsertCells, setShowInsertCells] = useState(false)
  const [showDeleteCells, setShowDeleteCells] = useState(false)
  const [showProperties, setShowProperties] = useState(false)
  const [showSort, setShowSort] = useState(false)

  const tableAttrs = editor ? getTableAttrs(editor) : {}
  const cellAttrs = editor
    ? { ...editor.getAttributes('tableHeader'), ...editor.getAttributes('tableCell') }
    : {}

  useEffect(() => {
    if (!editor) return
    const sync = () => {
      const attrs = { ...editor.getAttributes('tableHeader'), ...editor.getAttributes('tableCell') }
      setRowHeight(attrs.cellRowHeight ? String(attrs.cellRowHeight) : '')
      const width = attrs.colwidth
      setColWidth(Array.isArray(width) && width.length ? String(width[0]) : '')
    }
    sync()
    editor.on('selectionUpdate', sync)
    return () => {
      editor.off('selectionUpdate', sync)
    }
  }, [editor])

  if (!editor) return null

  const setHeight = (value: string) => {
    setRowHeight(value)
    const n = Number(value)
    if (n > 0) setCellAttrs(editor, { cellRowHeight: String(n) })
  }

  const setWidth = (value: string) => {
    setColWidth(value)
    const n = Number(value)
    if (n > 0) setCellAttrs(editor, { colwidth: [n] })
  }

  return (
    <>
      <RibbonGroup label="Table" className="table-layout-table">
        <BigMenu icon={<Table2 size={22} />} label="Select" width={170}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Select Cell" onClick={() => { selectCellAtCursor(editor); close() }} />
              <MenuItem label="Select Row" onClick={() => { selectRowAtCursor(editor); close() }} />
              <MenuItem label="Select Column" onClick={() => { selectColumnAtCursor(editor); close() }} />
              <MenuItem label="Select Table" onClick={() => { selectTable(editor); close() }} />
            </div>
          )}
        </BigMenu>
        <BigButton
          icon={<Grid3x3 size={22} />}
          label="Gridlines"
          active={tableAttrs.tableGridlines !== false}
          onClick={() => {
            const next = tableAttrs.tableGridlines === false
            setTableAttrs(editor, { tableGridlines: next })
            toast(next ? 'Table gridlines on' : 'Table gridlines off')
          }}
        />
        <BigButton
          icon={<Table2 size={22} />}
          label="Properties"
          onClick={() => setShowProperties(true)}
        />
      </RibbonGroup>

      <RibbonGroup
        label="Rows & Columns"
        className="table-layout-rows"
        launcher={{ title: 'Insert Cells', onClick: () => setShowInsertCells(true) }}
      >
        <BigMenu icon={<Eraser size={22} />} label="Delete" width={200}>
          {(close) => (
            <div className="menu">
              <MenuItem label="Delete Cells…" onClick={() => { setShowDeleteCells(true); close() }} />
              <MenuItem label="Delete Rows" onClick={() => { editor.chain().focus().deleteRow().run(); close() }} />
              <MenuItem label="Delete Columns" onClick={() => { editor.chain().focus().deleteColumn().run(); close() }} />
              <MenuItem label="Delete Table" onClick={() => { editor.chain().focus().deleteTable().run(); close() }} />
            </div>
          )}
        </BigMenu>
        <BigButton
          icon={<Rows3 size={22} />}
          label="Insert Above"
          onClick={() => editor.chain().focus().addRowBefore().run()}
        />
        <BigButton
          icon={<Rows3 size={22} />}
          label="Insert Below"
          onClick={() => editor.chain().focus().addRowAfter().run()}
        />
        <BigButton
          icon={<Columns3 size={22} />}
          label="Insert Left"
          onClick={() => editor.chain().focus().addColumnBefore().run()}
        />
        <BigButton
          icon={<Columns3 size={22} />}
          label="Insert Right"
          onClick={() => editor.chain().focus().addColumnAfter().run()}
        />
      </RibbonGroup>

      <RibbonGroup label="Merge" className="table-layout-merge">
        <BigButton
          icon={<Table2 size={22} />}
          label="Merge Cells"
          onClick={() => editor.chain().focus().mergeCells().run()}
        />
        <BigButton
          icon={<Columns3 size={22} />}
          label="Split Cells"
          onClick={() => editor.chain().focus().splitCell().run()}
        />
        <BigButton
          icon={<ArrowLeftRight size={22} />}
          label="Split Table"
          onClick={() => {
            const ok = splitTableAtCursor(editor)
            toast(ok ? 'Table split' : 'Select a row below the first row to split the table')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Cell Size" className="table-layout-size">
        <BigMenu icon={<Grid3x3 size={22} />} label="AutoFit" width={230}>
          {(close) => (
            <div className="menu">
              <MenuItem label="AutoFit Contents" onClick={() => { setAutoFit(editor, 'contents'); close() }} />
              <MenuItem label="AutoFit Window" onClick={() => { setAutoFit(editor, 'window'); close() }} />
              <MenuItem label="Fixed Column Width" onClick={() => { setAutoFit(editor, 'fixed'); close() }} />
              <MenuSep />
              <MenuItem label="Distribute Rows Evenly" onClick={() => { distributeRows(editor); close() }} />
              <MenuItem label="Distribute Columns Evenly" onClick={() => { distributeColumns(editor); close() }} />
            </div>
          )}
        </BigMenu>
        <div className="table-size-inputs">
          <label>
            <span>Height:</span>
            <input
              type="number"
              min={1}
              value={rowHeight}
              placeholder="Auto"
              onChange={(e) => setHeight(e.target.value)}
            />
            <span>pt</span>
          </label>
          <label>
            <span>Width:</span>
            <input
              type="number"
              min={1}
              value={colWidth}
              placeholder="Auto"
              onChange={(e) => setWidth(e.target.value)}
            />
            <span>px</span>
          </label>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Alignment" className="table-layout-align">
        <div className="table-layout-grid">
          {ALIGN_CELLS.map((cell) => {
            const active =
              (cellAttrs.cellVerticalAlign || 'top') === cell.v &&
              (cellAttrs.cellTextAlign || 'left') === cell.h
            return (
              <button
                key={cell.key}
                type="button"
                title={cell.label}
                className={active ? 'active' : ''}
                onClick={() =>
                  setCellAttrs(editor, {
                    cellVerticalAlign: cell.v,
                    cellTextAlign: cell.h,
                  })
                }
              >
                {cell.symbol}
              </button>
            )
          })}
        </div>
        <div className="table-align-extra">
          <Popover
            width={210}
            trigger={({ toggle }) => (
              <SmallButton icon={<Grid3x3 size={15} />} label="Cell Margins" wide onClick={toggle} />
            )}
          >
            {(close) => (
              <div className="menu">
                <MenuLabel>Cell Margins</MenuLabel>
                {MARGIN_PRESETS.map((preset) => (
                  <MenuItem
                    key={preset.id}
                    label={preset.label}
                    onClick={() => {
                      setCellAttrs(editor, { cellPadding: preset.value })
                      close()
                    }}
                  />
                ))}
                <MenuSep />
                <MenuItem label="Custom Margins…" onClick={() => { setShowProperties(true); close() }} />
              </div>
            )}
          </Popover>
          <Popover
            width={200}
            trigger={({ toggle }) => (
              <SmallButton icon={<TextCursorInput size={15} />} label="Text Direction" wide onClick={toggle} />
            )}
          >
            {(close) => (
              <div className="menu">
                <MenuItem label="Horizontal" onClick={() => { setCellAttrs(editor, { cellTextDirection: 'lrtb' }); close() }} />
                <MenuItem label="Rotate All Text 90°" onClick={() => { setCellAttrs(editor, { cellTextDirection: 'tbrl' }); close() }} />
                <MenuItem label="Rotate All Text 270°" onClick={() => { setCellAttrs(editor, { cellTextDirection: 'btlr' }); close() }} />
              </div>
            )}
          </Popover>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Data" className="table-layout-data">
        <BigButton
          icon={<ArrowDownAZ size={22} />}
          label="Sort"
          onClick={() => setShowSort(true)}
        />
        <BigButton
          icon={<Rows3 size={22} />}
          label="Repeat Header Rows"
          active={tableAttrs.headerRow === true}
          onClick={() => setTableAttrs(editor, { headerRow: !(tableAttrs.headerRow ?? true) })}
        />
        <BigButton
          icon={<TextCursorInput size={22} />}
          label="Convert to Text"
          onClick={() => {
            convertTableToText(editor)
            toast('Table converted to text')
          }}
        />
        <SmallButton
          icon={<Grid3x3 size={15} />}
          label="Formula"
          wide
          onClick={() => toast('Formula: use =SUM(ABOVE) or =AVERAGE(LEFT) in a cell')}
        />
      </RibbonGroup>

      {showInsertCells && <InsertCellsDialog mode="insert" onApply={(m) => { insertCells(editor, m); setShowInsertCells(false) }} onClose={() => setShowInsertCells(false)} />}
      {showDeleteCells && <InsertCellsDialog mode="delete" onApply={(m) => { deleteCells(editor, m); setShowDeleteCells(false) }} onClose={() => setShowDeleteCells(false)} />}
      {showProperties && <TablePropertiesDialog editor={editor} onClose={() => setShowProperties(false)} />}
      {showSort && <SortTableDialog editor={editor} onClose={() => setShowSort(false)} />}
    </>
  )
}
