import type { Editor } from '@tiptap/react'
import { selectedBlocks } from '../editor/actions'

export type PainterState = {
  textStyle: Record<string, any>
  marks: string[]
  block: Record<string, any>
}

type Listener = () => void

let painter: PainterState | null = null
const listeners = new Set<Listener>()

function emit() {
  for (const listener of listeners) listener()
}

export function getPainter() {
  return painter
}

export function subscribePainter(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function startFormatPainter(editor: Editor) {
  const block = selectedBlocks(editor)[0]?.node
  painter = {
    textStyle: { ...(editor.getAttributes('textStyle') || {}) },
    marks: ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'].filter((mark) =>
      editor.isActive(mark),
    ),
    block: block
      ? {
          textAlign: block.attrs.textAlign || null,
          indent: block.attrs.indent || 0,
          indentLeft: block.attrs.indentLeft || null,
          indentRight: block.attrs.indentRight || null,
          lineHeight: block.attrs.lineHeight || null,
          shading: block.attrs.shading || null,
          borderSides: block.attrs.borderSides || null,
          borderColor: block.attrs.borderColor || null,
          borderWidth: block.attrs.borderWidth || null,
          spaceBefore: block.attrs.spaceBefore || null,
          spaceAfter: block.attrs.spaceAfter || null,
        }
      : {},
  }
  document.body.classList.add('format-painter-active')
  emit()
}

export function cancelFormatPainter() {
  painter = null
  document.body.classList.remove('format-painter-active')
  emit()
}

export function applyFormatPainter(editor: Editor) {
  if (!painter || editor.state.selection.empty) return false
  const state = painter
  const blocks = selectedBlocks(editor)
  if (blocks.length) {
    const tr = editor.state.tr
    for (const { node, pos } of blocks) {
      tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...state.block })
    }
    editor.view.dispatch(tr)
  }
  const chain = editor
    .chain()
    .focus()
    .unsetAllMarks()
    .setMark('textStyle', state.textStyle)
  for (const mark of state.marks) {
    if (mark === 'bold') chain.setBold()
    else if (mark === 'italic') chain.setItalic()
    else if (mark === 'underline') chain.setUnderline()
    else if (mark === 'strike') chain.setStrike()
    else if (mark === 'subscript') chain.setSubscript()
    else if (mark === 'superscript') chain.setSuperscript()
  }
  chain.run()
  painter = null
  document.body.classList.remove('format-painter-active')
  emit()
  return true
}
