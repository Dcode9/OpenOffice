import type { Editor } from '@tiptap/react'
import type { Node as PMNode } from '@tiptap/pm/model'
import type { StyleDef } from '../lib/constants'
import { NodeSelection } from '@tiptap/pm/state'
import { CellSelection, TableMap } from '@tiptap/pm/tables'

export function setTextStyle(editor: Editor, patch: Record<string, any>) {
  const current = editor.getAttributes('textStyle') || {}
  editor.chain().focus().setMark('textStyle', { ...current, ...patch }).run()
}

export function setFontSize(editor: Editor, size: number | string) {
  setTextStyle(editor, { fontSize: String(size) })
}

function transformCase(text: string, mode: string): string {
  switch (mode) {
    case 'upper':
      return text.toUpperCase()
    case 'lower':
      return text.toLowerCase()
    case 'sentence':
      return text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())
    case 'capitalize':
      return text.replace(/\b\w/g, (c) => c.toUpperCase())
    case 'toggle':
      return text.replace(/\w+/g, (w) => (w === w.toUpperCase() ? w.toLowerCase() : w.toUpperCase()))
    default:
      return text
  }
}

function transformNode(node: PMNode, mode: string): Record<string, any> {
  if (node.isText) return { ...node.toJSON(), text: transformCase(node.text || '', mode) }
  if (node.isLeaf) return node.toJSON()
  return { ...node.toJSON(), content: (node.content.content || []).map((child) => transformNode(child, mode)) }
}

export function changeCase(editor: Editor, mode: string) {
  const { from, to } = editor.state.selection
  if (from === to) return
  const nodes = editor.state.selection.content().content.content.map((node) => transformNode(node, mode))
  if (!nodes.length) return
  editor.chain().focus().insertContentAt({ from, to }, nodes).run()
  editor.commands.setTextSelection({ from, to })
}

export function selectedBlocks(editor: Editor): { node: PMNode; pos: number }[] {
  const { from, to } = editor.state.selection
  if (from === undefined) return []
  const doc = editor.state.doc
  const $from = doc.resolve(from)
  const $to = doc.resolve(to)
  let start = $from.depth > 0 ? $from.before(1) : from
  const toAtStart = $to.depth > 0 && $to.parentOffset === 0 && to > from
  let end = toAtStart ? $to.before(1) : $to.depth > 0 ? $to.after(1) : to
  if (end <= start) {
    start = $from.depth > 0 ? $from.before(1) : 0
    end = $from.depth > 0 ? $from.after(1) : doc.content.size
  }
  const blocks: { node: PMNode; pos: number }[] = []
  doc.nodesBetween(start, end, (node, pos) => {
    if (node.type.name === 'paragraph' || node.type.name === 'heading') {
      blocks.push({ node, pos })
      return false
    }
    return true
  })
  return blocks
}

export function updateSelectedBlocks(editor: Editor, attrs: Record<string, any>) {
  const blocks = selectedBlocks(editor)
  if (!blocks.length) return
  const tr = editor.state.tr
  for (const { node, pos } of blocks) {
    tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...attrs })
  }
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function applyBulletList(
  editor: Editor,
  style: string,
  extra: { symbol?: string | null; font?: string | null } = {},
) {
  if (style === 'none') {
    if (editor.isActive('bulletList')) editor.chain().focus().toggleBulletList().run()
    return
  }
  if (editor.isActive('orderedList')) editor.chain().focus().toggleOrderedList().run()
  const chain = editor.chain().focus()
  if (!editor.isActive('bulletList')) chain.toggleBulletList()
  chain
    .updateAttributes('bulletList', {
      bulletStyle: style,
      bulletSymbol: extra.symbol || null,
      bulletFont: extra.font || null,
    })
    .run()
}

export function applyNumberedList(editor: Editor, style: string, start = 1) {
  if (style === 'none') {
    if (editor.isActive('orderedList')) editor.chain().focus().toggleOrderedList().run()
    return
  }
  if (editor.isActive('bulletList')) editor.chain().focus().toggleBulletList().run()
  const chain = editor.chain().focus()
  if (!editor.isActive('orderedList')) chain.toggleOrderedList()
  chain.updateAttributes('orderedList', { numberStyle: style, start }).run()
}

export function applyMultilevelList(editor: Editor, level = 1, style = 'decimal') {
  applyNumberedList(editor, style)
  updateSelectedBlocks(editor, (attrs: Record<string, any>) => ({ ...attrs, indentLeft: Math.max(0, level - 1) * 0.25 }))
  editor.chain().focus().run()
}

export function applyUnderlineStyle(editor: Editor, style: string, color?: string | null) {
  if (style === 'none') {
    editor.chain().focus().unsetUnderline().run()
    return
  }
  const current = editor.getAttributes('underline') || {}
  editor
    .chain()
    .focus()
    .setMark('underline', {
      underlineStyle: style,
      underlineColor: color === undefined ? current.underlineColor || null : color,
    })
    .run()
}

export function clearFormatting(editor: Editor) {
  updateSelectedBlocks(editor, {
    textAlign: null,
    indent: 0,
    indentLeft: null,
    indentRight: null,
    firstLine: null,
    lineHeight: null,
    borderSides: null,
    borderColor: null,
    borderWidth: null,
    shading: null,
    spaceBefore: null,
    spaceAfter: null,
    keepNext: false,
    pageBreakBefore: false,
  })
  editor
    .chain()
    .focus()
    .unsetAllMarks()
    .clearNodes()
    .run()
}

export function blockType(editor: Editor): string {
  if (editor.isActive('heading')) return 'heading'
  return 'paragraph'
}

export function indent(editor: Editor, dir: 1 | -1) {
  const type = blockType(editor)
  const current = Number(editor.getAttributes(type).indent || 0)
  updateSelectedBlocks(editor, { indent: Math.max(0, Math.min(12, current + dir)), indentLeft: null, indentRight: null })
}

export function setLineHeight(editor: Editor, value: string) {
  updateSelectedBlocks(editor, { lineHeight: value })
}

export function applyDocumentStyle(editor: Editor, style: StyleDef) {
  if (style.level) {
    editor.chain().focus().setHeading({ level: style.level }).run()
    return
  }
  if (style.id === 'quote' || style.id === 'intenseQuote') {
    editor.chain().focus().setBlockquote().run()
    return
  }
  editor.chain().focus().setParagraph().run()
  const patch =
    style.id === 'title'
      ? { fontFamily: 'Calibri Light', fontSize: '37', color: '#2f5496' }
      : style.id === 'subtitle'
        ? { fontFamily: 'Calibri Light', fontSize: '20', color: '#5a5a5a' }
        : style.id === 'noSpacing'
          ? { fontFamily: 'Calibri', fontSize: '15' }
          : { fontFamily: 'Calibri', fontSize: '15', color: '#000000' }
  const reset = style.id === 'noSpacing' ? { spaceBefore: 0, spaceAfter: 0 } : {}
  updateSelectedBlocks(editor, { lineHeight: style.id === 'noSpacing' ? '1' : null, ...reset })
  const blocks = selectedBlocks(editor)
  for (const { node, pos } of blocks) {
    editor
      .chain()
      .focus()
      .setTextSelection({ from: pos + 1, to: pos + node.nodeSize - 1 })
      .unsetAllMarks()
      .setMark('textStyle', patch)
      .run()
  }
}

export function setBorder(
  editor: Editor,
  sides: 'top' | 'bottom' | 'left' | 'right' | 'none' | 'all' | 'outside' | 'inside',
) {
  const blocks = selectedBlocks(editor)
  if (!blocks.length) return
  const tr = editor.state.tr
  if (sides === 'inside') {
    if (blocks.length <= 1) {
      const { node, pos } = blocks[0]
      const current = String(node.attrs.borderSides || '').split(',').filter(Boolean)
      const next = Array.from(new Set([...current, 'bottom']))
      tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        borderSides: next.join(','),
        borderColor: node.attrs.borderColor || '#000000',
        borderWidth: node.attrs.borderWidth || '1px',
      })
    } else {
      blocks.forEach(({ node, pos }, idx) => {
        if (idx < blocks.length - 1) {
          const current = String(node.attrs.borderSides || '').split(',').filter(Boolean)
          const next = Array.from(new Set([...current, 'bottom']))
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            borderSides: next.join(','),
            borderColor: node.attrs.borderColor || '#000000',
            borderWidth: node.attrs.borderWidth || '1px',
          })
        }
      })
    }
    editor.view.dispatch(tr)
    editor.commands.focus()
    return
  }
  for (const { node, pos } of blocks) {
    const current = String(node.attrs.borderSides || '').split(',').filter(Boolean)
    let next: string[] = current
    if (sides === 'none') next = []
    else if (sides === 'all' || sides === 'outside') next = ['top', 'bottom', 'left', 'right']
    else next = Array.from(new Set([...current, sides]))
    tr.setNodeMarkup(pos, undefined, {
      ...node.attrs,
      borderSides: next.length ? next.join(',') : null,
      borderColor: node.attrs.borderColor || '#000000',
      borderWidth: node.attrs.borderWidth || '1px',
    })
  }
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function setShading(editor: Editor, color: string | null) {
  updateSelectedBlocks(editor, { shading: color })
}

export function setParagraphFormat(editor: Editor, attrs: Record<string, any>) {
  updateSelectedBlocks(editor, attrs)
}

export function sortParagraphs(editor: Editor, ascending = true, numeric = false) {
  const blocks = selectedBlocks(editor)
  if (blocks.length < 2) return false
  const items = blocks.map(({ node }) => ({ node, text: node.textContent.trim() }))
  items.sort((a, b) => {
    const left = numeric ? Number.parseFloat(a.text.replace(/[^0-9.-]/g, '')) || 0 : a.text.toLocaleLowerCase()
    const right = numeric ? Number.parseFloat(b.text.replace(/[^0-9.-]/g, '')) || 0 : b.text.toLocaleLowerCase()
    if (left < right) return ascending ? -1 : 1
    if (left > right) return ascending ? 1 : -1
    return 0
  })
  const first = blocks[0]
  const last = blocks[blocks.length - 1]
  const start = first.pos
  const end = last.pos + last.node.nodeSize
  const tr = editor.state.tr.delete(start, end)
  let pos = start
  for (const item of items) {
    tr.insert(pos, item.node)
    pos += item.node.nodeSize
  }
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

export function setParagraphSpacing(editor: Editor, before: number, after: number) {
  const root = document.documentElement
  root.style.setProperty('--doc-para-before', `${before}pt`)
  root.style.setProperty('--doc-para-after', `${after}pt`)
}

export function insertTable(editor: Editor, rows: number, cols: number) {
  editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
}

export function insertImageFromFile(editor: Editor, file: File, onDone?: (src: string) => void) {
  const reader = new FileReader()
  reader.onload = () => {
    const src = reader.result as string
    editor.chain().focus().setImage({ src }).run()
    onDone?.(src)
  }
  reader.readAsDataURL(file)
}

export function applyLink(editor: Editor, href: string, text?: string) {
  if (!href) {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  const url = /^https?:\/\//i.test(href) || href.startsWith('#') || href.startsWith('mailto:') ? href : `https://${href}`
  if (text) {
    editor.chain().focus().insertContent(`<a href="${url}">${text}</a>`).run()
  } else {
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

export function insertPageBreak(editor: Editor) {
  editor.chain().focus().insertContent({ type: 'pageBreak' }).run()
}

export function insertHorizontalRule(editor: Editor) {
  editor.chain().focus().setHorizontalRule().run()
}

export function insertText(editor: Editor, text: string) {
  editor.chain().focus().insertContent(text).run()
}

export function insertDateTime(editor: Editor, date: Date, format: 'short' | 'long' | 'iso') {
  const opts: Intl.DateTimeFormatOptions =
    format === 'long'
      ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      : format === 'iso'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: '2-digit', day: '2-digit' }
  const str = date.toLocaleDateString('en-US', opts)
  editor.chain().focus().insertContent(str).run()
}

export function collectHeadings(editor: Editor) {
  const items: { level: number; text: string; pos: number }[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'heading') items.push({ level: node.attrs.level, text: node.textContent, pos })
    return true
  })
  return items
}

export function insertTOC(editor: Editor) {
  const headings = collectHeadings(editor)
  if (!headings.length) {
    editor.chain().focus().insertContent('<p class="toc-empty">No headings found in document.</p>').run()
    return
  }
  const html = headings
    .map(
      (h) =>
        `<p class="toc-entry toc-l${h.level}" style="margin-left:${(h.level - 1) * 0.25}in">${h.text || '(blank)'}</p>`,
    )
    .join('')
  editor.chain().focus().insertContent(`<p class="toc-title">Table of Contents</p>${html}`).run()
}

export function insertWordCountField(editor: Editor) {
  const words = editor.storage.characterCount.words()
  editor.chain().focus().insertContent(`<p>${words} words</p>`).run()
}

export function currentTableInfo(editor: Editor) {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth)
    if (node.type.name === 'table') {
      return { node, pos: $from.before(depth), depth }
    }
  }
  return null
}

export function getTableAttrs(editor: Editor): Record<string, any> {
  return editor.getAttributes('table') || {}
}

export function setTableAttrs(editor: Editor, attrs: Record<string, any>) {
  if (!editor.isActive('table')) return
  editor.chain().focus().updateAttributes('table', attrs).run()
}

export function setCellAttrs(editor: Editor, attrs: Record<string, any>) {
  if (!editor.isActive('table')) return
  const chain = editor.chain().focus()
  for (const [name, value] of Object.entries(attrs)) {
    chain.setCellAttribute(name, value)
  }
  chain.run()
}

export function updateAllTableCells(editor: Editor, attrs: Record<string, any>) {
  const info = currentTableInfo(editor)
  if (!info) return
  const tr = editor.state.tr
  info.node.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      tr.setNodeMarkup(info.pos + 1 + pos, undefined, { ...node.attrs, ...attrs })
    }
    return true
  })
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function applyCellBorders(
  editor: Editor,
  sides: string[],
  value: string | null,
  wholeTable = false,
) {
  if (!editor.isActive('table')) return
  if (wholeTable) {
    const attrs: Record<string, any> = {}
    for (const side of sides) {
      attrs[`cellBorder${side[0].toUpperCase()}${side.slice(1)}`] = value
    }
    updateAllTableCells(editor, attrs)
    return
  }
  setCellAttrs(
    editor,
    Object.fromEntries(
      sides.map((side) => [`cellBorder${side[0].toUpperCase()}${side.slice(1)}`, value]),
    ),
  )
}

export type TableBorderEdges = {
  top: boolean
  bottom: boolean
  left: boolean
  right: boolean
  insideH: boolean
  insideV: boolean
}

export function applyTableBorderEdges(
  editor: Editor,
  edges: TableBorderEdges,
  value: string | null,
  exclusive = true,
) {
  const info = currentTableInfo(editor)
  if (!info) return
  const map = TableMap.get(info.node)
  const tr = editor.state.tr
  let rowOffset = 0
  info.node.forEach((row, _rowPos, rowIndex) => {
    let col = 0
    let cellOffset = 0
    row.forEach((cell, _cellPos) => {
      const colspan = Number(cell.attrs.colspan) || 1
      const rowspan = Number(cell.attrs.rowspan) || 1
      const cellEdges = {
        top: rowIndex === 0 ? edges.top : edges.insideH,
        bottom: rowIndex + rowspan >= map.height ? edges.bottom : edges.insideH,
        left: col === 0 ? edges.left : edges.insideV,
        right: col + colspan >= map.width ? edges.right : edges.insideV,
      }
      const attrs: Record<string, any> = {}
      for (const [side, on] of Object.entries(cellEdges)) {
        if (!on && !exclusive) continue
        attrs[`cellBorder${side[0].toUpperCase()}${side.slice(1)}`] = on ? value : null
      }
      if (Object.keys(attrs).length) {
        const cellPos = info.pos + 2 + rowOffset + cellOffset
        tr.setNodeMarkup(cellPos, undefined, { ...cell.attrs, ...attrs })
      }
      col += colspan
      cellOffset += cell.nodeSize
    })
    rowOffset += row.nodeSize
  })
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function selectTable(editor: Editor) {
  const info = currentTableInfo(editor)
  if (!info) return
  editor.chain().focus().setNodeSelection(info.pos).run()
}

export function applyTableStyle(editor: Editor, style: string, accent: string, intensity: string) {
  setTableAttrs(editor, {
    tableStyle: style,
    tableAccent: accent,
    tableIntensity: intensity,
  })
}

export function clearTableStyle(editor: Editor) {
  setTableAttrs(editor, { tableStyle: 'plain', tableAccent: '#000000', tableIntensity: 'medium' })
}

export function setAutoFit(editor: Editor, mode: string) {
  if (mode === 'window') setTableAttrs(editor, { tableWidth: '100%' })
  else if (mode === 'fixed') setTableAttrs(editor, { tableWidth: 'auto' })
  else setTableAttrs(editor, { tableWidth: null })
}

export function distributeRows(editor: Editor, height = 30) {
  updateAllTableCells(editor, { cellRowHeight: String(height) })
}

export function distributeColumns(editor: Editor) {
  const info = currentTableInfo(editor)
  if (!info) return
  const firstRow = info.node.firstChild
  const count = firstRow?.childCount || 1
  const width = Math.max(24, Math.floor(720 / count))
  const tr = editor.state.tr
  info.node.descendants((node, pos) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      tr.setNodeMarkup(info.pos + 1 + pos, undefined, {
        ...node.attrs,
        colwidth: [width],
      })
    }
    return true
  })
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function sortTable(editor: Editor, ascending = true, hasHeader = true) {
  const info = currentTableInfo(editor)
  if (!info) return
  const rows = info.node.content.content.slice()
  const head = hasHeader ? rows.slice(0, 1) : []
  const body = rows.slice(head.length).sort((a, b) => {
    const left = a.textContent.trim().toLowerCase()
    const right = b.textContent.trim().toLowerCase()
    return ascending ? left.localeCompare(right) : right.localeCompare(left)
  })
  const table = info.node.type.create(info.node.attrs, [...head, ...body], info.node.marks)
  const tr = editor.state.tr.replaceWith(
    info.pos,
    info.pos + info.node.nodeSize,
    table,
  )
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function convertTableToText(editor: Editor) {
  const info = currentTableInfo(editor)
  if (!info) return
  const rows: string[] = []
  info.node.forEach((row) => {
    const cells: string[] = []
    row.forEach((cell) => cells.push(cell.textContent.trim()))
    rows.push(cells.join('\t'))
  })
  const text = rows.join('\n')
  const paragraph = editor.state.schema.nodes.paragraph.create(
    null,
    text ? editor.state.schema.text(text) : undefined,
  )
  const tr = editor.state.tr.replaceWith(
    info.pos,
    info.pos + info.node.nodeSize,
    paragraph,
  )
  editor.view.dispatch(tr)
  editor.commands.focus()
}

export function insertCells(editor: Editor, mode: string) {
  if (!editor.isActive('table')) return
  if (mode === 'shift-right') editor.chain().focus().addColumnAfter().run()
  else if (mode === 'shift-down') editor.chain().focus().addRowAfter().run()
  else if (mode === 'entire-row') editor.chain().focus().addRowAfter().run()
  else if (mode === 'entire-column') editor.chain().focus().addColumnAfter().run()
}

export function deleteCells(editor: Editor, mode: string) {
  if (!editor.isActive('table')) return
  if (mode === 'shift-left') editor.chain().focus().deleteColumn().run()
  else if (mode === 'shift-up') editor.chain().focus().deleteRow().run()
  else if (mode === 'entire-row') editor.chain().focus().deleteRow().run()
  else if (mode === 'entire-column') editor.chain().focus().deleteColumn().run()
}

export function selectTableNode(editor: Editor) {
  selectTable(editor)
}

export function tableNodeSelection(editor: Editor) {
  return editor.state.selection instanceof NodeSelection
}

export function splitTableAtCursor(editor: Editor) {
  const info = currentTableInfo(editor)
  if (!info) return false
  const { $from } = editor.state.selection
  let rowIndex = -1
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === 'tableRow') {
      const before = $from.before(depth)
      rowIndex = info.node.content.content.findIndex((row, index) => {
        let offset = info.pos + 1
        for (let i = 0; i < index; i++) offset += info.node.child(i).nodeSize
        return row.type.name === 'tableRow' && before === offset
      })
      break
    }
  }
  if (rowIndex <= 0) return false
  const rows = info.node.content.content
  const first = info.node.type.create(info.node.attrs, rows.slice(0, rowIndex))
  const second = info.node.type.create(info.node.attrs, rows.slice(rowIndex))
  const paragraph = editor.state.schema.nodes.paragraph.create()
  const tr = editor.state.tr.replaceWith(
    info.pos,
    info.pos + info.node.nodeSize,
    [first, paragraph, second],
  )
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}


export function currentCellPosition(editor: Editor) {
  const { $from } = editor.state.selection
  for (let depth = $from.depth; depth > 0; depth--) {
    const name = $from.node(depth).type.name
    if (name === 'tableCell' || name === 'tableHeader') return $from.before(depth)
  }
  return null
}

export function toggleDiagonalBorder(editor: Editor, direction: 'down' | 'up') {
  if (!editor.isActive('table')) return
  const attrs = { ...editor.getAttributes('tableHeader'), ...editor.getAttributes('tableCell') }
  const current = attrs.cellBorderDiagonal as string | undefined
  let next: string | null = direction
  if (current === direction) {
    next = null
  } else if (current && (current === 'down' || current === 'up')) {
    next = 'both'
  } else if (current === 'both') {
    next = direction === 'down' ? 'up' : 'down'
  }
  setCellAttrs(editor, { cellBorderDiagonal: next })
}

export function selectCellAtCursor(editor: Editor) {
  const pos = currentCellPosition(editor)
  if (pos === null) return
  const { state } = editor
  const selection = CellSelection.create(state.doc, pos)
  editor.view.dispatch(state.tr.setSelection(selection))
  editor.commands.focus()
}

export function selectRowAtCursor(editor: Editor) {
  const pos = currentCellPosition(editor)
  if (pos === null) return
  const { state } = editor
  const $cell = state.doc.resolve(pos)
  const selection = CellSelection.rowSelection($cell)
  editor.view.dispatch(state.tr.setSelection(selection))
  editor.commands.focus()
}

export function selectColumnAtCursor(editor: Editor) {
  const pos = currentCellPosition(editor)
  if (pos === null) return
  const { state } = editor
  const $cell = state.doc.resolve(pos)
  const selection = CellSelection.colSelection($cell)
  editor.view.dispatch(state.tr.setSelection(selection))
  editor.commands.focus()
}

export function setColumnWidthAtCursor(editor: Editor, width: number) {
  const info = currentTableInfo(editor)
  const cellPos = currentCellPosition(editor)
  if (!info || cellPos === null) return
  const map = TableMap.get(info.node)
  const colIndex = map.colCount(cellPos - (info.pos + 1))
  const tr = editor.state.tr
  info.node.descendants((node, rel) => {
    if (node.type.name !== 'tableCell' && node.type.name !== 'tableHeader') return true
    const cellCol = map.colCount(rel)
    const colspan = node.attrs.colspan || 1
    if (colIndex < cellCol || colIndex >= cellCol + colspan) return true
    const current = Array.isArray(node.attrs.colwidth) ? node.attrs.colwidth : []
    const widths = Array.from({ length: colspan }, (_, index) =>
      index === colIndex - cellCol ? width : (current[index] ?? width),
    )
    tr.setNodeMarkup(info.pos + 1 + rel, undefined, { ...node.attrs, colwidth: widths })
    return true
  })
  if (tr.docChanged) editor.view.dispatch(tr)
  editor.commands.focus()
}

export function setRowHeightAtCursor(editor: Editor, height: string) {
  const pos = currentCellPosition(editor)
  if (pos === null) return
  const { state } = editor
  const $cell = state.doc.resolve(pos)
  const rowStart = $cell.before($cell.depth - 1)
  const row = state.doc.nodeAt(rowStart)
  if (!row) return
  const tr = state.tr
  row.descendants((node, rel) => {
    if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
      tr.setNodeMarkup(rowStart + 1 + rel, undefined, { ...node.attrs, cellRowHeight: height })
    }
    return true
  })
  editor.view.dispatch(tr)
  editor.commands.focus()
}
