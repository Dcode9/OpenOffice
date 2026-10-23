import type { Editor } from '@tiptap/react'
import { selectedBlocks } from '../editor/actions'

export type CustomStyle = {
  id: string
  name: string
  block: Record<string, any>
  textStyle: Record<string, any>
  marks: string[]
}

type Listener = () => void

const STORAGE_KEY = 'openoffice.customStyles'
const listeners = new Set<Listener>()
let customStyles: CustomStyle[] = load()

function load(): CustomStyle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customStyles))
  } catch {
    // storage is optional
  }
  for (const listener of listeners) listener()
}

export function getCustomStyles() {
  return customStyles
}

export function subscribeCustomStyles(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function createCustomStyle(editor: Editor, name: string) {
  const block = selectedBlocks(editor)[0]?.node
  const textStyle = editor.getAttributes('textStyle') || {}
  const marks = ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'].filter((mark) =>
    editor.isActive(mark),
  )
  const style: CustomStyle = {
    id: `style-${Date.now()}`,
    name,
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
    textStyle: {
      fontFamily: textStyle.fontFamily || null,
      fontSize: textStyle.fontSize || null,
      color: textStyle.color || null,
      textShadow: textStyle.textShadow || null,
      textStroke: textStyle.textStroke || null,
      smallCaps: Boolean(textStyle.smallCaps),
      allCaps: Boolean(textStyle.allCaps),
    },
    marks,
  }
  customStyles = [...customStyles, style]
  persist()
  return style
}

export function deleteCustomStyle(id: string) {
  customStyles = customStyles.filter((style) => style.id !== id)
  persist()
}

export function applyCustomStyle(editor: Editor, style: CustomStyle) {
  const blocks = selectedBlocks(editor)
  if (!blocks.length) return
  const tr = editor.state.tr
  for (const { node, pos } of blocks) {
    tr.setNodeMarkup(pos, undefined, { ...node.attrs, ...style.block })
  }
  editor.view.dispatch(tr)
  for (const { node, pos } of blocks) {
    const chain = editor
      .chain()
      .focus()
      .setTextSelection({ from: pos + 1, to: pos + node.nodeSize - 1 })
      .unsetAllMarks()
      .setMark('textStyle', style.textStyle)
    for (const mark of style.marks) {
      if (mark === 'bold') chain.setBold()
      else if (mark === 'italic') chain.setItalic()
      else if (mark === 'underline') chain.setUnderline()
      else if (mark === 'strike') chain.setStrike()
      else if (mark === 'subscript') chain.setSubscript()
      else if (mark === 'superscript') chain.setSuperscript()
    }
    chain.run()
  }
}
