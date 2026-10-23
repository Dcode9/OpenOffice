import type { Editor } from '@tiptap/react'
import { DOMSerializer } from '@tiptap/pm/model'

export type PasteMode = 'html' | 'merge' | 'text'

const DEFAULT_PASTE_KEY = 'word.defaultPasteMode'

export function getDefaultPasteMode(): PasteMode {
  try {
    const value = localStorage.getItem(DEFAULT_PASTE_KEY)
    if (value === 'merge' || value === 'text' || value === 'html') return value
  } catch {
    /* ignore unavailable storage */
  }
  return 'html'
}

export function setDefaultPasteMode(mode: PasteMode) {
  try {
    localStorage.setItem(DEFAULT_PASTE_KEY, mode)
  } catch {
    /* ignore unavailable storage */
  }
}

export type ClipItem = {
  id: string
  html: string
  text: string
  at: number
}

type Listener = () => void

let items: ClipItem[] = []
const listeners = new Set<Listener>()
let seq = 0

export function getClipItems() {
  return items
}

export function subscribeClipboard(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function emit() {
  for (const listener of listeners) listener()
}

export function addClipItem(html: string, text: string) {
  if (!html && !text) return
  const item: ClipItem = { id: `clip-${Date.now()}-${seq++}`, html, text, at: Date.now() }
  items = [item, ...items].slice(0, 24)
  emit()
}

export function clearClipItems() {
  items = []
  emit()
}

export function latestClip() {
  return items[0] || null
}

function selectionPayload(editor: Editor) {
  const selection = editor.state.selection
  if (selection.empty) return null
  const div = document.createElement('div')
  const fragment = DOMSerializer.fromSchema(editor.schema).serializeFragment(selection.content().content, {
    document,
  })
  div.appendChild(fragment)
  const html = div.innerHTML
  const text = selection.content().content.textBetween(0, selection.content().content.size, '\n')
  return { html, text, from: selection.from, to: selection.to }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => window.setTimeout(() => resolve(null), ms)),
  ])
}

async function writeSystemClipboard(html: string, text: string) {
  try {
    if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
      const written = await withTimeout(
        navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]),
        1500,
      )
      if (written !== null) return true
    }
  } catch {
    // fall through to plain text
  }
  try {
    if (navigator.clipboard?.writeText) {
      const written = await withTimeout(navigator.clipboard.writeText(text), 1500)
      return written !== null
    }
  } catch {
    return false
  }
  return false
}

export async function copySelection(editor: Editor, cut = false) {
  const payload = selectionPayload(editor)
  if (!payload) return { ok: false, empty: true }
  addClipItem(payload.html, payload.text)
  const system = await writeSystemClipboard(payload.html, payload.text)
  if (cut) editor.chain().focus().deleteSelection().run()
  else editor.commands.focus()
  return { ok: true, system }
}

export function captureDomSelection(html: string, text: string) {
  addClipItem(html, text)
}

function splitText(text: string) {
  return text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function stripFormatting(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  doc.body.querySelectorAll('*').forEach((el) => {
    el.removeAttribute('style')
    el.removeAttribute('class')
    for (const attr of [...el.attributes]) {
      if (attr.name.startsWith('data-')) el.removeAttribute(attr.name)
    }
  })
  return doc.body.innerHTML
}

export function insertClip(editor: Editor, item: ClipItem, mode: 'html' | 'merge' | 'text') {
  if (mode === 'text') {
    const lines = splitText(item.text)
    if (!lines.length) return false
    editor.chain().focus().insertContent(lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('')).run()
    return true
  }
  const html = mode === 'merge' ? stripFormatting(item.html) : item.html
  if (html) {
    editor.chain().focus().insertContent(html).run()
    return true
  }
  if (item.text) {
    editor.chain().focus().insertContent(escapeHtml(item.text)).run()
    return true
  }
  return false
}

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function pasteFromSystem(editor: Editor, mode: 'html' | 'merge' | 'text') {
  try {
    if (navigator.clipboard?.read) {
      const clipItems = await withTimeout(navigator.clipboard.read(), 1500)
      if (!clipItems) return false
      for (const entry of clipItems) {
        const htmlType = entry.types.includes('text/html') ? 'text/html' : null
        const textType = entry.types.includes('text/plain') ? 'text/plain' : null
        let html = ''
        let text = ''
        if (htmlType) html = await (await entry.getType(htmlType)).text()
        if (textType) text = await (await entry.getType(textType)).text()
        if (html || text) {
          const item: ClipItem = { id: 'system', html, text, at: Date.now() }
          addClipItem(html, text)
          return insertClip(editor, item, mode)
        }
      }
    }
    if (navigator.clipboard?.readText) {
      const text = (await withTimeout(navigator.clipboard.readText(), 1500)) || ''
      if (text) {
        const item: ClipItem = { id: 'system', html: '', text, at: Date.now() }
        addClipItem('', text)
        return insertClip(editor, item, mode)
      }
    }
  } catch {
    return false
  }
  return false
}

export async function pasteLatest(editor: Editor, mode: 'html' | 'merge' | 'text') {
  if (await pasteFromSystem(editor, mode)) return true
  const item = latestClip()
  if (item) return insertClip(editor, item, mode)
  return false
}

export function pasteAll(editor: Editor) {
  const list = [...items].reverse()
  if (!list.length) return false
  for (const item of list) {
    insertClip(editor, item, 'html')
  }
  return true
}
