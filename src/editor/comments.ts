import { Mark, mergeAttributes } from '@tiptap/core'
import type { Editor } from '@tiptap/react'
import { useSyncExternalStore } from 'react'

export type CommentReply = {
  id: string
  author: string
  initials: string
  body: string
  createdAt: number
}

export type CommentThread = {
  id: string
  author: string
  initials: string
  color: string
  body: string
  quote: string
  createdAt: number
  resolved: boolean
  draft?: boolean
  replies: CommentReply[]
}

export type CommentState = {
  threads: CommentThread[]
  author: string
  initials: string
}

export type CommentAnchor = {
  from: number
  to: number
}

const STORAGE_KEY = 'openoffice:review:comments'
const AUTHOR_KEY = 'openoffice:review:author'

const COLORS = ['#c00000', '#2b579a', '#548235', '#7030a0', '#c55a11', '#0f7b6c', '#b4009e']

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore storage failures */
  }
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'A'
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase()
}

function loadState(): CommentState {
  const saved = readJson<CommentState>(STORAGE_KEY)
  const author = localStorage.getItem(AUTHOR_KEY) || saved?.author || 'Charles Richardson'
  return {
    author,
    initials: initialsFor(author),
    threads: Array.isArray(saved?.threads)
      ? saved!.threads.filter(
          (thread) =>
            thread &&
            typeof thread.id === 'string' &&
            typeof thread.body === 'string' &&
            Array.isArray(thread.replies),
        )
      : [],
  }
}

let state: CommentState = loadState()
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function persist() {
  writeJson(STORAGE_KEY, { threads: state.threads, author: state.author, initials: state.initials })
}

function setState(patch: Partial<CommentState>) {
  state = { ...state, ...patch }
  persist()
  emit()
}

export function subscribeComments(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getCommentState() {
  return state
}

export function useComments() {
  return useSyncExternalStore(subscribeComments, getCommentState, getCommentState)
}

export function makeId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function setCommentAuthor(name: string) {
  const author = name.trim() || 'Author'
  setState({ author, initials: initialsFor(author) })
  try {
    localStorage.setItem(AUTHOR_KEY, author)
  } catch {
    /* ignore */
  }
}

function nextColor() {
  const count = state.threads.length
  return COLORS[count % COLORS.length]
}

export const CommentMark = Mark.create({
  name: 'comment',
  inclusive: false,
  keepOnSplit: false,
  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-id'),
        renderHTML: (attributes) =>
          attributes.commentId ? { 'data-comment-id': attributes.commentId } : {},
      },
      author: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-author'),
        renderHTML: (attributes) =>
          attributes.author ? { 'data-comment-author': attributes.author } : {},
      },
      color: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-comment-color'),
        renderHTML: (attributes) =>
          attributes.color ? { 'data-comment-color': attributes.color } : {},
      },
    }
  },
  parseHTML() {
    return [{ tag: 'span[data-comment-id]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'comment-mark',
        style: `--comment-color: ${HTMLAttributes['data-comment-color'] || '#c00000'}`,
      }),
      0,
    ]
  },
})

export function getThread(id: string | null | undefined) {
  if (!id) return null
  return state.threads.find((thread) => thread.id === id) ?? null
}

export function getActiveThreadId() {
  return activeCommentId
}

let activeCommentId: string | null = null

export function setActiveComment(id: string | null) {
  activeCommentId = id
  emit()
}

export function getCommentAnchors(editor: Editor | null): Map<string, CommentAnchor> {
  const anchors = new Map<string, CommentAnchor>()
  if (!editor) return anchors
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'comment' || !mark.attrs.commentId) continue
      const id = mark.attrs.commentId as string
      const current = anchors.get(id)
      if (!current) anchors.set(id, { from: pos, to: pos + node.nodeSize })
      else anchors.set(id, { from: Math.min(current.from, pos), to: Math.max(current.to, pos + node.nodeSize) })
    }
    return true
  })
  return anchors
}

function wordRangeAt(editor: Editor, pos: number): CommentAnchor | null {
  const { doc } = editor.state
  let from = pos
  let to = pos
  const text = doc.textBetween(0, doc.content.size, '\n', '\n')
  while (from > 0 && /[\p{L}\p{N}'’-]/u.test(text[from - 1] || '')) from -= 1
  while (to < text.length && /[\p{L}\p{N}'’-]/u.test(text[to] || '')) to += 1
  if (from === to) return null
  return { from, to }
}

export function commentText(editor: Editor, id: string) {
  const anchor = getCommentAnchors(editor).get(id)
  if (!anchor) return ''
  return editor.state.doc.textBetween(anchor.from, anchor.to, ' ')
}

export function createComment(editor: Editor, body = ''): string | null {
  let range: CommentAnchor = { from: editor.state.selection.from, to: editor.state.selection.to }
  if (range.from === range.to) {
    const word = wordRangeAt(editor, range.from)
    if (word) range = word
    else {
      editor.chain().focus().insertContentAt(range.from, '\u200b').run()
      range = { from: range.from, to: range.from + 1 }
    }
  }
  const id = makeId('comment')
  const color = nextColor()
  const thread: CommentThread = {
    id,
    author: state.author,
    initials: state.initials,
    color,
    body,
    quote: editor.state.doc.textBetween(range.from, range.to, ' '),
    createdAt: Date.now(),
    resolved: false,
    draft: !body,
    replies: [],
  }
  editor
    .chain()
    .focus()
    .setTextSelection(range)
    .setMark('comment', { commentId: id, author: state.author, color })
    .run()
  setState({ threads: [...state.threads, thread] })
  activeCommentId = id
  emit()
  return id
}

export function updateCommentBody(id: string, body: string) {
  setState({
    threads: state.threads.map((thread) =>
      thread.id === id ? { ...thread, body, draft: false, createdAt: thread.createdAt } : thread,
    ),
  })
}

export function addReply(id: string, body: string) {
  const thread = getThread(id)
  if (!thread || !body.trim()) return
  const reply: CommentReply = {
    id: makeId('reply'),
    author: state.author,
    initials: state.initials,
    body: body.trim(),
    createdAt: Date.now(),
  }
  setState({
    threads: state.threads.map((item) =>
      item.id === id ? { ...item, replies: [...item.replies, reply] } : item,
    ),
  })
}

export function setCommentResolved(id: string, resolved: boolean) {
  setState({
    threads: state.threads.map((thread) => (thread.id === id ? { ...thread, resolved } : thread)),
  })
}

export function removeCommentMark(editor: Editor, id: string) {
  if (!editor) return
  const ranges: CommentAnchor[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    if (node.marks.some((mark) => mark.type.name === 'comment' && mark.attrs.commentId === id)) {
      ranges.push({ from: pos, to: pos + node.nodeSize })
    }
    return true
  })
  if (!ranges.length) return
  const tr = editor.state.tr
  for (const range of ranges.reverse()) {
    tr.removeMark(range.from, range.to, editor.schema.marks.comment)
  }
  editor.view.dispatch(tr)
}

export function deleteComment(editor: Editor, id: string) {
  removeCommentMark(editor, id)
  setState({ threads: state.threads.filter((thread) => thread.id !== id) })
  if (activeCommentId === id) activeCommentId = null
  emit()
}

export function deleteAllComments(editor: Editor, ids?: string[]) {
  const targets = ids ? state.threads.filter((thread) => ids.includes(thread.id)) : [...state.threads]
  for (const thread of targets) removeCommentMark(editor, thread.id)
  const remove = new Set(targets.map((thread) => thread.id))
  setState({ threads: state.threads.filter((thread) => !remove.has(thread.id)) })
  activeCommentId = null
  emit()
}

export function resetComments(editor: Editor | null) {
  if (editor) deleteAllComments(editor)
  else setState({ threads: [] })
}

export function orderedComments(editor: Editor | null) {
  const anchors = getCommentAnchors(editor)
  return [...state.threads].sort((a, b) => {
    const pa = anchors.get(a.id)?.from ?? Number.MAX_SAFE_INTEGER
    const pb = anchors.get(b.id)?.from ?? Number.MAX_SAFE_INTEGER
    if (pa !== pb) return pa - pb
    return a.createdAt - b.createdAt
  })
}

export function navigateComment(editor: Editor | null, direction: 1 | -1) {
  if (!editor) return null
  const threads = orderedComments(editor)
  if (!threads.length) return null
  const anchors = getCommentAnchors(editor)
  const currentIndex = threads.findIndex((thread) => thread.id === activeCommentId)
  let nextIndex = direction > 0 ? currentIndex + 1 : currentIndex - 1
  if (currentIndex === -1) nextIndex = direction > 0 ? 0 : threads.length - 1
  if (nextIndex >= threads.length) nextIndex = 0
  if (nextIndex < 0) nextIndex = threads.length - 1
  const target = threads[nextIndex]
  setActiveComment(target.id)
  const anchor = anchors.get(target.id)
  if (anchor) {
    editor.chain().focus().setTextSelection({ from: anchor.from, to: anchor.to }).scrollIntoView().run()
  }
  return target.id
}

export function goToComment(editor: Editor | null, id: string) {
  if (!editor) return false
  setActiveComment(id)
  const anchor = getCommentAnchors(editor).get(id)
  if (!anchor) return false
  editor.chain().focus().setTextSelection({ from: anchor.from, to: anchor.to }).scrollIntoView().run()
  return true
}

export function formatCommentTime(timestamp: number) {
  const delta = Date.now() - timestamp
  if (delta < 60_000) return 'Just now'
  if (delta < 3_600_000) return `${Math.max(1, Math.floor(delta / 60_000))} min ago`
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)} hr ago`
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
