import type { Editor } from '@tiptap/react'

export type AccessibilitySeverity = 'error' | 'warning' | 'tip'
export type AccessibilityKind = 'alt' | 'heading' | 'table-header' | 'merged' | 'blank'

export type AccessibilityIssue = {
  id: string
  severity: AccessibilitySeverity
  kind: AccessibilityKind
  title: string
  message: string
  detail: string
  fixLabel: string
  from: number
  to: number
  nodePos: number
  cellPos?: number
  extraPositions?: number[]
  count?: number
}

export function collectAccessibilityIssues(editor: Editor | null): AccessibilityIssue[] {
  if (!editor) return []
  const issues: AccessibilityIssue[] = []
  const doc = editor.state.doc

  doc.descendants((node, pos) => {
    if (node.type.name === 'image') {
      const alt = String(node.attrs.alt || '').trim()
      if (!alt) {
        issues.push({
          id: `alt-${pos}`,
          severity: 'error',
          kind: 'alt',
          title: 'Missing alternative text',
          message: 'An image has no alternative text description.',
          detail: 'Alternative text helps people who use screen readers understand the image.',
          fixLabel: 'Add a description',
          from: pos,
          to: pos + node.nodeSize,
          nodePos: pos,
        })
      }
    }
    if (node.type.name === 'heading' && !node.textContent.replace(/\u200b/g, '').trim()) {
      issues.push({
        id: `heading-${pos}`,
        severity: 'warning',
        kind: 'heading',
        title: 'Empty heading',
        message: `Heading ${node.attrs.level || 1} contains no text.`,
        detail: 'Empty headings create confusing navigation landmarks for screen readers.',
        fixLabel: 'Convert to paragraph',
        from: pos,
        to: pos + node.nodeSize,
        nodePos: pos,
      })
    }
    if (node.type.name === 'table') {
      let hasHeader = false
      let rowIndex = 0
      const firstRowCells: { pos: number; type: string }[] = []
      node.forEach((row, rowOffset) => {
        let column = 0
        row.forEach((cell, cellOffset) => {
          const cellPos = pos + 1 + rowOffset + 1 + cellOffset
          if (rowIndex === 0) firstRowCells.push({ pos: cellPos, type: cell.type.name })
          if (cell.type.name === 'tableHeader') hasHeader = true
          const colspan = Number(cell.attrs.colspan || 1)
          const rowspan = Number(cell.attrs.rowspan || 1)
          if (colspan > 1 || rowspan > 1) {
            issues.push({
              id: `merged-${cellPos}`,
              severity: 'warning',
              kind: 'merged',
              title: 'Merged table cells',
              message: `Table cell at row ${rowIndex + 1}, column ${column + 1} is merged.`,
              detail: 'Merged cells can be difficult for screen readers to navigate predictably.',
              fixLabel: 'Split merged cell',
              from: cellPos,
              to: cellPos + cell.nodeSize,
              nodePos: pos,
              cellPos,
            })
          }
          column += colspan
        })
        rowIndex += 1
      })
      if (!hasHeader) {
        issues.push({
          id: `table-header-${pos}`,
          severity: 'warning',
          kind: 'table-header',
          title: 'Table has no header row',
          message: 'The first row of this table is not marked as a header.',
          detail: 'Header rows let screen readers announce column names as cells are read.',
          fixLabel: 'Add header row',
          from: pos,
          to: pos + node.nodeSize,
          nodePos: pos,
          extraPositions: firstRowCells.map((cell) => cell.pos),
        })
      }
    }
    return true
  })

  let previousEmpty = false
  let emptyRun: number[] = []
  doc.forEach((node, offset) => {
    const isEmpty = node.type.name === 'paragraph' && !node.textContent.replace(/\u200b/g, '').trim()
    if (isEmpty) {
      if (previousEmpty) emptyRun.push(offset)
      else emptyRun = []
      previousEmpty = true
    } else {
      if (emptyRun.length >= 1) {
        issues.push({
          id: `blank-${emptyRun[0]}`,
          severity: 'tip',
          kind: 'blank',
          title: 'Repeated blank paragraphs',
          message: `${emptyRun.length + 1} consecutive blank paragraphs found.`,
          detail: 'Several blank paragraphs can make reading order harder to follow.',
          fixLabel: 'Remove extra blank paragraphs',
          from: emptyRun[0],
          to: emptyRun[emptyRun.length - 1] + 1,
          nodePos: emptyRun[0],
          extraPositions: [...emptyRun],
          count: emptyRun.length + 1,
        })
      }
      previousEmpty = false
      emptyRun = []
    }
  })
  if (emptyRun.length >= 1) {
    issues.push({
      id: `blank-${emptyRun[0]}`,
      severity: 'tip',
      kind: 'blank',
      title: 'Repeated blank paragraphs',
      message: `${emptyRun.length + 1} consecutive blank paragraphs found.`,
      detail: 'Several blank paragraphs can make reading order harder to follow.',
      fixLabel: 'Remove extra blank paragraphs',
      from: emptyRun[0],
      to: emptyRun[emptyRun.length - 1] + 1,
      nodePos: emptyRun[0],
      extraPositions: [...emptyRun],
      count: emptyRun.length + 1,
    })
  }

  return issues
}

export function applyAccessibilityFix(editor: Editor, issue: AccessibilityIssue, altText?: string) {
  if (issue.kind === 'alt') {
    const node = editor.state.doc.nodeAt(issue.nodePos)
    if (!node) return false
    const tr = editor.state.tr.setNodeMarkup(issue.nodePos, undefined, {
      ...node.attrs,
      alt: (altText || 'Decorative image').trim(),
    })
    editor.view.dispatch(tr)
    return true
  }
  if (issue.kind === 'heading') {
    const tr = editor.state.tr.setNodeMarkup(issue.nodePos, editor.schema.nodes.paragraph, {})
    editor.view.dispatch(tr)
    return true
  }
  if (issue.kind === 'table-header') {
    const table = editor.state.doc.nodeAt(issue.nodePos)
    if (!table) return false
    const tr = editor.state.tr
    const cells: { pos: number; attrs: Record<string, unknown> }[] = []
    table.forEach((row, rowOffset) => {
      if (rowOffset !== 0) return
      row.forEach((cell, cellOffset) => {
        cells.push({ pos: issue.nodePos + 1 + rowOffset + 1 + cellOffset, attrs: { ...cell.attrs } })
      })
    })
    for (const cell of cells.reverse()) {
      tr.setNodeMarkup(cell.pos, editor.schema.nodes.tableHeader, cell.attrs)
    }
    editor.view.dispatch(tr)
    return true
  }
  if (issue.kind === 'merged') {
    if (issue.cellPos === undefined) return false
    editor.chain().focus().setTextSelection(issue.cellPos + 1).splitCell().run()
    return true
  }
  if (issue.kind === 'blank' && issue.extraPositions?.length) {
    const tr = editor.state.tr
    const positions = [...issue.extraPositions].sort((a, b) => b - a)
    for (const pos of positions) {
      const node = tr.doc.nodeAt(pos)
      if (node && node.type.name === 'paragraph' && !node.textContent.trim()) {
        tr.delete(pos, pos + node.nodeSize)
      }
    }
    editor.view.dispatch(tr)
    return true
  }
  return false
}

export function accessibilitySummary(issues: AccessibilityIssue[]) {
  return {
    errors: issues.filter((issue) => issue.severity === 'error').length,
    warnings: issues.filter((issue) => issue.severity === 'warning').length,
    tips: issues.filter((issue) => issue.severity === 'tip').length,
  }
}
