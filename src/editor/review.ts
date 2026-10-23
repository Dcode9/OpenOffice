import { Extension, Mark, mergeAttributes } from '@tiptap/core'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import type { Editor } from '@tiptap/react'
import { useSyncExternalStore } from 'react'
import { getCommentState, makeId } from './comments'

export type MarkupMode = 'simple' | 'all' | 'no' | 'original'

export type RevisionType = 'insertion' | 'deletion'

export type Revision = {
  id: string
  type: RevisionType
  from: number
  to: number
  text: string
  author: string
  timestamp: number
  color: string
}

type TrackConfig = {
  enabled: boolean
  author: string
  color: string
}

const trackConfig: TrackConfig = {
  enabled: false,
  author: 'Charles Richardson',
  color: '#c00000',
}

export function setTrackingConfig(patch: Partial<TrackConfig>) {
  Object.assign(trackConfig, patch)
}

export function getTrackingConfig() {
  return trackConfig
}

function authorColor(author: string) {
  const palette = ['#c00000', '#2b579a', '#548235', '#7030a0', '#c55a11', '#0f7b6c']
  let hash = 0
  for (let index = 0; index < author.length; index += 1) hash = (hash * 31 + author.charCodeAt(index)) >>> 0
  return palette[hash % palette.length]
}

function revisionAttributes(type: RevisionType) {
  return {
    revId: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute('data-rev-id'), renderHTML: (attributes: Record<string, unknown>) => (attributes.revId ? { 'data-rev-id': attributes.revId } : {}) },
    author: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute('data-rev-author'), renderHTML: (attributes: Record<string, unknown>) => (attributes.author ? { 'data-rev-author': attributes.author } : {}) },
    timestamp: { default: null, parseHTML: (element: HTMLElement) => Number(element.getAttribute('data-rev-time') || 0), renderHTML: (attributes: Record<string, unknown>) => (attributes.timestamp ? { 'data-rev-time': String(attributes.timestamp) } : {}) },
    color: { default: null, parseHTML: (element: HTMLElement) => element.getAttribute('data-rev-color'), renderHTML: (attributes: Record<string, unknown>) => (attributes.color ? { 'data-rev-color': attributes.color } : {}) },
  }
}

function revisionMark(name: RevisionType) {
  return Mark.create({
    name,
    inclusive: false,
    keepOnSplit: false,
    addAttributes() {
      return revisionAttributes(name)
    },
    parseHTML() {
      return [
        { tag: `span[data-revision="${name}"]` },
        { tag: `span.rev-${name}` },
      ]
    },
    renderHTML({ HTMLAttributes }) {
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          class: `rev-${name}`,
          'data-revision': name,
          style: `--rev-color: ${HTMLAttributes['data-rev-color'] || '#c00000'}`,
        }),
        0,
      ]
    },
  })
}

export const InsertionMark = revisionMark('insertion')
export const DeletionMark = revisionMark('deletion')

function makeRevisionAttrs(type: RevisionType, revId: string) {
  const author = trackConfig.author || getCommentState().author
  return {
    revId,
    author,
    timestamp: Date.now(),
    color: type === 'insertion' ? '#c00000' : authorColor(author),
  }
}

function isRevisionMark(markName: string) {
  return markName === 'insertion' || markName === 'deletion'
}

function decorationBuild(state: { doc: any }) {
  const decorations: Decoration[] = []
  state.doc.descendants((node: any, pos: number) => {
    if (!node.isBlock || node.type.name === 'doc') return true
    let changed = false
    node.descendants((child: any) => {
      if (changed) return false
      if (child.isText && child.marks.some((mark: any) => isRevisionMark(mark.type.name))) changed = true
      return true
    })
    if (changed) decorations.push(Decoration.node(pos, pos + node.nodeSize, { class: 'has-revision' }))
    return true
  })
  return DecorationSet.create(state.doc, decorations)
}

export const TrackChanges = Extension.create({
  name: 'trackChanges',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('trackChangesInput'),
        props: {
          handleTextInput(view, from, to, text) {
            if (!trackConfig.enabled || view.composing) return false
            const { state } = view
            const tr = state.tr
            if (from !== to) {
              tr.addMark(from, to, state.schema.marks.deletion.create(makeRevisionAttrs('deletion', makeId('rev'))))
            }
            const insertAt = from !== to ? to : from
            tr.insertText(text, insertAt, insertAt)
            tr.addMark(insertAt, insertAt + text.length, state.schema.marks.insertion.create(makeRevisionAttrs('insertion', makeId('rev'))))
            tr.setSelection(TextSelection.create(tr.doc, insertAt + text.length))
            view.dispatch(tr)
            return true
          },
          handleKeyDown(view, event) {
            if (!trackConfig.enabled || event.isComposing) return false
            if (event.ctrlKey || event.metaKey || event.altKey) return false
            if (event.key !== 'Backspace' && event.key !== 'Delete') return false
            const { state } = view
            const { selection } = state
            let from = selection.from
            let to = selection.to
            if (from === to) {
              if (event.key === 'Backspace') {
                if (selection.$from.parentOffset === 0) return false
                from -= 1
                to = from + 1
              } else {
                if (selection.$from.parentOffset >= selection.$from.parent.content.size) return false
                to += 1
              }
            }
            const text = state.doc.textBetween(from, to, '\n', '\n')
            if (!text) return false
            const tr = state.tr
            tr.addMark(from, to, state.schema.marks.deletion.create(makeRevisionAttrs('deletion', makeId('rev'))))
            tr.setSelection(TextSelection.create(tr.doc, from))
            view.dispatch(tr)
            return true
          },
          handlePaste(view, _event, slice) {
            if (!trackConfig.enabled) return false
            const { state } = view
            const { from, to } = state.selection
            const tr = state.tr
            if (from !== to) {
              tr.addMark(from, to, state.schema.marks.deletion.create(makeRevisionAttrs('deletion', makeId('rev'))))
              tr.setSelection(TextSelection.create(tr.doc, to))
            }
            const insertAt = tr.selection.from
            tr.replaceSelection(slice)
            const insertedTo = Math.min(tr.doc.content.size, insertAt + slice.content.size)
            if (insertedTo > insertAt) {
              tr.addMark(insertAt, insertedTo, state.schema.marks.insertion.create(makeRevisionAttrs('insertion', makeId('rev'))))
            }
            view.dispatch(tr)
            return true
          },
        },
      }),
      new Plugin({
        key: new PluginKey('trackChangesDecorations'),
        props: {
          decorations(state) {
            return decorationBuild(state)
          },
        },
      }),
    ]
  },
})

export function collectRevisions(editor: Editor | null): Revision[] {
  if (!editor) return []
  const segments: Revision[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const type of ['insertion', 'deletion'] as RevisionType[]) {
      const mark = node.marks.find((item) => item.type.name === type)
      if (!mark) continue
      segments.push({
        id: String(mark.attrs.revId || `${type}-${pos}`),
        type,
        from: pos,
        to: pos + node.nodeSize,
        text: node.text || '',
        author: String(mark.attrs.author || 'Author'),
        timestamp: Number(mark.attrs.timestamp || 0),
        color: String(mark.attrs.color || '#c00000'),
      })
    }
    return true
  })
  segments.sort((a, b) => a.from - b.from)
  const merged: Revision[] = []
  for (const segment of segments) {
    const previous = merged[merged.length - 1]
    if (
      previous &&
      previous.to === segment.from &&
      previous.type === segment.type &&
      previous.id === segment.id
    ) {
      previous.to = segment.to
      previous.text += segment.text
      continue
    }
    merged.push({ ...segment })
  }
  return merged
}

export function revisionCount(editor: Editor | null) {
  return collectRevisions(editor).length
}

export function activeRevisionAt(editor: Editor | null, pos: number) {
  const revisions = collectRevisions(editor)
  if (!revisions.length) return null
  return revisions.find((revision) => revision.from <= pos && revision.to >= pos) ?? revisions.find((revision) => revision.from >= pos) ?? revisions[revisions.length - 1]
}

export function applyRevisions(editor: Editor, revisions: Revision[], accept: boolean) {
  if (!revisions.length) return 0
  const tr = editor.state.tr
  const ordered = [...revisions].sort((a, b) => b.from - a.from)
  for (const revision of ordered) {
    if (accept) {
      if (revision.type === 'insertion') {
        const mark = editor.schema.marks.insertion
        if (mark) tr.removeMark(revision.from, revision.to, mark)
      } else {
        tr.delete(revision.from, revision.to)
      }
    } else {
      if (revision.type === 'insertion') {
        tr.delete(revision.from, revision.to)
      } else {
        const mark = editor.schema.marks.deletion
        if (mark) tr.removeMark(revision.from, revision.to, mark)
      }
    }
  }
  editor.view.dispatch(tr)
  return revisions.length
}

export function acceptAllRevisions(editor: Editor) {
  return applyRevisions(editor, collectRevisions(editor), true)
}

export function rejectAllRevisions(editor: Editor) {
  return applyRevisions(editor, collectRevisions(editor), false)
}

export function acceptRevision(editor: Editor, revision: Revision | null) {
  if (!revision) return 0
  return applyRevisions(editor, [revision], true)
}

export function rejectRevision(editor: Editor, revision: Revision | null) {
  if (!revision) return 0
  return applyRevisions(editor, [revision], false)
}

let activeRevisionKey: string | null = null

export function setActiveRevision(revision: Revision | null) {
  activeRevisionKey = revision ? `${revision.type}:${revision.from}:${revision.to}` : null
}

export function getActiveRevisionKey() {
  return activeRevisionKey
}

export function navigateRevision(editor: Editor | null, direction: 1 | -1, fromPos?: number) {
  if (!editor) return null
  const revisions = collectRevisions(editor)
  if (!revisions.length) return null
  const pos = fromPos ?? editor.state.selection.from
  const sorted = [...revisions].sort((a, b) => a.from - b.from)
  let target: Revision | null = null
  if (direction > 0) target = sorted.find((revision) => revision.from > pos) ?? sorted[0]
  else target = [...sorted].reverse().find((revision) => revision.to < pos) ?? sorted[sorted.length - 1]
  if (!target) return null
  setActiveRevision(target)
  editor.chain().focus().setTextSelection({ from: target.from, to: target.to }).scrollIntoView().run()
  return target
}

export type ProtectionState = {
  restricted: boolean
  editingRestriction: string
  formattingRestricted: boolean
  encrypted: boolean
  markFinal: boolean
  blockedAuthors: string[]
  allowedStyles: string[]
}

const PROTECTION_KEY = 'openoffice:review:protection'

const defaultProtection: ProtectionState = {
  restricted: false,
  editingRestriction: 'No changes (Read only)',
  formattingRestricted: false,
  encrypted: false,
  markFinal: false,
  blockedAuthors: [],
  allowedStyles: ['Normal', 'Heading 1', 'Heading 2', 'Heading 3'],
}

function loadProtection(): ProtectionState {
  try {
    const raw = localStorage.getItem(PROTECTION_KEY)
    if (!raw) return { ...defaultProtection, allowedStyles: [...defaultProtection.allowedStyles] }
    return { ...defaultProtection, ...(JSON.parse(raw) as Partial<ProtectionState>) }
  } catch {
    return { ...defaultProtection, allowedStyles: [...defaultProtection.allowedStyles] }
  }
}

let protectionState = loadProtection()
const metaListeners = new Set<() => void>()

function emitMeta() {
  metaListeners.forEach((listener) => listener())
}

function subscribeMeta(listener: () => void) {
  metaListeners.add(listener)
  return () => metaListeners.delete(listener)
}

export function getProtectionState() {
  return protectionState
}

export function useProtectionState() {
  return useSyncExternalStore(subscribeMeta, getProtectionState, getProtectionState)
}

export function setProtectionState(patch: Partial<ProtectionState>) {
  protectionState = { ...protectionState, ...patch }
  try {
    localStorage.setItem(PROTECTION_KEY, JSON.stringify(protectionState))
  } catch {
    /* ignore */
  }
  emitMeta()
}

export function resetProtectionState() {
  protectionState = { ...defaultProtection, allowedStyles: [...defaultProtection.allowedStyles] }
  try {
    localStorage.removeItem(PROTECTION_KEY)
  } catch {
    /* ignore */
  }
  emitMeta()
}

export type CompareSources = {
  original: string
  revised: string
  author: string
  createdAt: number
}

let compareSources: CompareSources | null = null

export function setCompareSources(sources: CompareSources | null) {
  compareSources = sources
  emitMeta()
}

export function getCompareSources() {
  return compareSources
}

export type DiffOp = { type: 'equal' | 'insert' | 'delete'; text: string }

function tokenize(value: string) {
  return value.match(/\s+|[^\s]+/g) ?? []
}

export function diffWords(original: string, revised: string): DiffOp[] {
  const a = tokenize(original)
  const b = tokenize(revised)
  const rows = a.length
  const cols = b.length
  const table: number[][] = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0))
  for (let i = rows - 1; i >= 0; i -= 1) {
    for (let j = cols - 1; j >= 0; j -= 1) {
      table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1])
    }
  }
  const ops: DiffOp[] = []
  const push = (type: DiffOp['type'], text: string) => {
    const last = ops[ops.length - 1]
    if (last && last.type === type) last.text += text
    else ops.push({ type, text })
  }
  let i = 0
  let j = 0
  while (i < rows && j < cols) {
    if (a[i] === b[j]) {
      push('equal', a[i])
      i += 1
      j += 1
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      push('delete', a[i])
      i += 1
    } else {
      push('insert', b[j])
      j += 1
    }
  }
  while (i < rows) {
    push('delete', a[i])
    i += 1
  }
  while (j < cols) {
    push('insert', b[j])
    j += 1
  }
  return ops
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function buildComparedHtml(original: string, revised: string, author: string) {
  const ops = diffWords(original, revised)
  const stamp = Date.now()
  let html = '<p>'
  let revisionIndex = 0
  for (const op of ops) {
    if (op.type === 'equal') {
      html += escapeHtml(op.text)
      continue
    }
    const type = op.type === 'insert' ? 'insertion' : 'deletion'
    const color = type === 'insertion' ? '#c00000' : authorColor(author)
    html += `<span class="rev-${type}" data-revision="${type}" data-rev-id="compare-${stamp}-${revisionIndex}" data-rev-author="${escapeHtml(author)}" data-rev-time="${stamp}" data-rev-color="${color}">${escapeHtml(op.text)}</span>`
    revisionIndex += 1
  }
  html += '</p>'
  html = html.replace(/\n/g, '</p><p>')
  html = html.replace(/<p><\/p>/g, '<p><br></p>')
  return { html, insertions: ops.filter((op) => op.type === 'insert').length, deletions: ops.filter((op) => op.type === 'delete').length }
}
