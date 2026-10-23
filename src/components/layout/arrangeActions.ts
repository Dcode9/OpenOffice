import type { Editor } from '@tiptap/react'
import type { Node as PMNode } from '@tiptap/pm/model'
import { NodeSelection } from '@tiptap/pm/state'

export type GraphicTarget = { pos: number; node: PMNode }
export type GraphicInfo = { pos: number; alt: string; src: string; hidden: boolean; group: string | null }

let panePositions: number[] = []
let lastGroupId: string | null = null

export function setPanePositions(positions: number[]) {
  panePositions = positions
}

export function getPanePositions() {
  return panePositions
}

export function collectGraphics(editor: Editor): GraphicInfo[] {
  const items: GraphicInfo[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'image') {
      items.push({
        pos,
        alt: String(node.attrs.alt || ''),
        src: String(node.attrs.src || ''),
        hidden: Boolean(node.attrs.layoutHidden),
        group: (node.attrs.layoutGroup as string | null) || null,
      })
    }
    return true
  })
  return items
}

export function getArrangeTargets(editor: Editor): GraphicTarget[] {
  const valid: GraphicTarget[] = []
  for (const pos of panePositions) {
    const node = editor.state.doc.nodeAt(pos)
    if (node?.type.name === 'image') valid.push({ pos, node })
  }
  if (valid.length) return valid
  const selection = editor.state.selection
  if (selection instanceof NodeSelection && selection.node.type.name === 'image') {
    return [{ pos: selection.from, node: selection.node }]
  }
  editor.state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
    if (node.type.name === 'image') valid.push({ pos, node })
    return true
  })
  return valid
}

export function focusGraphic(editor: Editor, pos: number) {
  const node = editor.state.doc.nodeAt(pos)
  if (!node || node.type.name !== 'image') return
  const selection = NodeSelection.create(editor.state.doc, pos)
  editor.view.dispatch(editor.state.tr.setSelection(selection))
  editor.commands.focus()
}

function patchTargets(editor: Editor, targets: GraphicTarget[], patch: Record<string, any>) {
  if (!targets.length) return false
  const tr = editor.state.tr
  for (const target of targets) {
    const node = editor.state.doc.nodeAt(target.pos)
    if (!node || node.type.name !== 'image') continue
    tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, ...patch })
  }
  if (!tr.docChanged) return false
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

const POSITION_STYLES: Record<string, string> = {
  inline: 'display: inline-block; float: none; position: static; margin: 0;',
  square: 'float: left; margin: 0 12px 8px 0;',
  tight: 'float: left; margin: 0 9px 4px 0;',
  through: 'float: right; margin: 0 0 8px 12px;',
  topBottom: 'display: block; float: none; position: relative; margin: 12px auto;',
  behind: 'position: absolute; left: 8%; top: 15%; z-index: 0; opacity: 0.85;',
  front: 'position: absolute; left: 8%; top: 15%; z-index: 30;',
}

export function applyGraphicPosition(editor: Editor, targets: GraphicTarget[], key: string) {
  const style = POSITION_STYLES[key]
  if (!style) return false
  const z = key === 'behind' ? 0 : key === 'front' ? 30 : 0
  return patchTargets(editor, targets, { layoutStyle: style, layoutZ: z })
}

export function applyWrapText(editor: Editor, targets: GraphicTarget[], key: string) {
  return applyGraphicPosition(editor, targets, key)
}

function currentZ(target: GraphicTarget): number {
  return Number(target.node.attrs.layoutZ || 0)
}

function ensurePositioned(style: string | null | undefined): string {
  const value = style || ''
  if (/(^|;)\s*position\s*:/.test(value)) return value
  return `position: relative; ${value}`
}

export function bringForward(editor: Editor, targets: GraphicTarget[], direction: 'forward' | 'backward' | 'front' | 'back') {
  if (!targets.length) return false
  const tr = editor.state.tr
  for (const target of targets) {
    const node = editor.state.doc.nodeAt(target.pos)
    if (!node || node.type.name !== 'image') continue
    const z = Number(node.attrs.layoutZ || 0)
    let next = z
    if (direction === 'forward') next = z + 1
    else if (direction === 'backward') next = z - 1
    else if (direction === 'front') next = 40
    else next = -5
    tr.setNodeMarkup(target.pos, undefined, {
      ...node.attrs,
      layoutZ: next,
      layoutStyle: ensurePositioned(node.attrs.layoutStyle as string | null),
    })
  }
  if (!tr.docChanged) return false
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

export function rotateGraphic(editor: Editor, targets: GraphicTarget[], direction: 'right' | 'left') {
  if (!targets.length) return false
  const tr = editor.state.tr
  for (const target of targets) {
    const node = editor.state.doc.nodeAt(target.pos)
    if (!node || node.type.name !== 'image') continue
    const current = Number(node.attrs.layoutRotate || 0)
    const next = direction === 'right' ? (current + 90) % 360 : (current + 270) % 360
    tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, layoutRotate: next })
  }
  if (!tr.docChanged) return false
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

export function flipGraphic(editor: Editor, targets: GraphicTarget[], axis: 'horizontal' | 'vertical') {
  if (!targets.length) return false
  const tr = editor.state.tr
  for (const target of targets) {
    const node = editor.state.doc.nodeAt(target.pos)
    if (!node || node.type.name !== 'image') continue
    tr.setNodeMarkup(target.pos, undefined, {
      ...node.attrs,
      layoutFlipH: axis === 'horizontal' ? !node.attrs.layoutFlipH : node.attrs.layoutFlipH,
      layoutFlipV: axis === 'vertical' ? !node.attrs.layoutFlipV : node.attrs.layoutFlipV,
    })
  }
  if (!tr.docChanged) return false
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

function imageElement(editor: Editor, pos: number): HTMLElement | null {
  const dom = editor.view.nodeDOM(pos)
  return dom instanceof HTMLElement ? dom : null
}

export function alignGraphics(
  editor: Editor,
  targets: GraphicTarget[],
  alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom',
) {
  if (!targets.length) return false
  const page = document.querySelector('.page-wrap') as HTMLElement | null
  const body = page?.querySelector('.doc-body') as HTMLElement | null
  const pageRect = page?.getBoundingClientRect()
  const bodyRect = body?.getBoundingClientRect()
  if (!pageRect || !bodyRect) return false
  const tr = editor.state.tr
  for (const target of targets) {
    const node = editor.state.doc.nodeAt(target.pos)
    if (!node || node.type.name !== 'image') continue
    const element = imageElement(editor, target.pos)
    const rect = element?.getBoundingClientRect()
    let style = String(node.attrs.layoutStyle || '')
    if (alignment === 'left') {
      style = 'display: block; float: left; margin-left: 0; margin-right: 12px;'
    } else if (alignment === 'center') {
      style = 'display: block; float: none; margin-left: auto; margin-right: auto;'
    } else if (alignment === 'right') {
      style = 'display: block; float: right; margin-left: 12px; margin-right: 0;'
    } else if (rect) {
      let delta = 0
      if (alignment === 'top') delta = bodyRect.top + 8 - rect.top
      else if (alignment === 'middle') delta = bodyRect.top + (bodyRect.height - rect.height) / 2 - rect.top
      else delta = bodyRect.bottom - rect.height - 8 - rect.top
      style = `${ensurePositioned(style)} top: ${Math.round(delta)}px;`
    }
    tr.setNodeMarkup(target.pos, undefined, { ...node.attrs, layoutStyle: style })
  }
  if (!tr.docChanged) return false
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

export function distributeGraphics(editor: Editor, targets: GraphicTarget[], axis: 'horizontal' | 'vertical') {
  if (targets.length < 2) return false
  const items = targets
    .map((target) => {
      const rect = imageElement(editor, target.pos)?.getBoundingClientRect()
      return rect ? { target, rect } : null
    })
    .filter((item): item is { target: GraphicTarget; rect: DOMRect } => Boolean(item))
    .sort((a, b) => (axis === 'horizontal' ? a.rect.left - b.rect.left : a.rect.top - b.rect.top))
  if (items.length < 2) return false
  const first = items[0]
  const last = items[items.length - 1]
  const tr = editor.state.tr
  items.forEach((item, index) => {
    if (index === 0 || index === items.length - 1) return
    const ratio = index / (items.length - 1)
    const delta =
      axis === 'horizontal'
        ? first.rect.left + (last.rect.left - first.rect.left) * ratio - item.rect.left
        : first.rect.top + (last.rect.top - first.rect.top) * ratio - item.rect.top
    const node = editor.state.doc.nodeAt(item.target.pos)
    if (!node || node.type.name !== 'image') return
    const prop = axis === 'horizontal' ? 'left' : 'top'
    tr.setNodeMarkup(item.target.pos, undefined, {
      ...node.attrs,
      layoutStyle: `${ensurePositioned(node.attrs.layoutStyle as string | null)} ${prop}: ${Math.round(delta)}px;`,
    })
  })
  if (!tr.docChanged) return false
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

export function groupGraphics(editor: Editor, targets: GraphicTarget[], mode: 'group' | 'ungroup' | 'regroup') {
  if (!targets.length) return false
  const id = mode === 'regroup' ? lastGroupId || `layout-group-${Date.now()}` : `layout-group-${Date.now()}`
  if (mode === 'ungroup') {
    return patchTargets(editor, targets, { layoutGroup: null })
  }
  lastGroupId = id
  return patchTargets(editor, targets, { layoutGroup: id })
}

export function setGraphicVisibility(editor: Editor, pos: number, hidden: boolean) {
  const node = editor.state.doc.nodeAt(pos)
  if (!node || node.type.name !== 'image') return
  const tr = editor.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, layoutHidden: hidden })
  editor.view.dispatch(tr)
}

export function selectGraphic(editor: Editor, pos: number) {
  const node = editor.state.doc.nodeAt(pos)
  if (!node || node.type.name !== 'image') return
  const selection = NodeSelection.create(editor.state.doc, pos)
  editor.view.dispatch(editor.state.tr.setSelection(selection))
}
