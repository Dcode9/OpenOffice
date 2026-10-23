import { useSyncExternalStore } from 'react'
import { PAGE_SIZES } from '../../lib/constants'

export type ColumnPreset = 'one' | 'two' | 'three' | 'left' | 'right' | 'custom'
export type ColumnWidth = { width: number; spacing: number }
export type ColumnConfig = {
  preset: ColumnPreset
  count: number
  gapIn: number
  lineBetween: boolean
  equalWidth: boolean
  widths: ColumnWidth[]
  applyTo: string
}

export type LineNumberMode = 'none' | 'continuous' | 'page' | 'section'
export type LineNumberConfig = {
  mode: LineNumberMode
  startAt: number
  fromText: number
  autoFromText: boolean
  countBy: number
}

export type HyphenationConfig = {
  mode: 'none' | 'auto' | 'manual'
  hyphenateCaps: boolean
  zoneIn: number
  limit: number
}

export type CustomMargins = {
  top: number
  right: number
  bottom: number
  left: number
  gutter: number
  mirrored: boolean
}

export type PageLayoutOptions = {
  sectionStart: string
  header: number
  footer: number
  verticalAlign: string
  differentOddEven: boolean
  differentFirstPage: boolean
  multiplePages: string
  applyTo: string
}

export type LayoutAdvancedState = {
  columns: ColumnConfig
  lineNumbers: LineNumberConfig
  hyphenation: HyphenationConfig
  customMargins: CustomMargins
  customPaper: { width: number; height: number; key: string } | null
  pageSetup: PageLayoutOptions
}

const STORAGE_KEY = 'openoffice:layout-advanced'

const DEFAULT_COLUMNS: ColumnConfig = {
  preset: 'one',
  count: 1,
  gapIn: 0.5,
  lineBetween: false,
  equalWidth: true,
  widths: [{ width: 6.5, spacing: 0.5 }],
  applyTo: 'whole',
}

const DEFAULT_LINE_NUMBERS: LineNumberConfig = {
  mode: 'none',
  startAt: 1,
  fromText: 0.25,
  autoFromText: true,
  countBy: 1,
}

const DEFAULT_HYPHENATION: HyphenationConfig = {
  mode: 'none',
  hyphenateCaps: false,
  zoneIn: 0.25,
  limit: 2,
}

const DEFAULT_MARGINS: CustomMargins = {
  top: 1,
  right: 1,
  bottom: 1,
  left: 1,
  gutter: 0,
  mirrored: false,
}

const DEFAULT_PAGE_SETUP: PageLayoutOptions = {
  sectionStart: 'New page',
  header: 0.5,
  footer: 0.5,
  verticalAlign: 'Top',
  differentOddEven: false,
  differentFirstPage: false,
  multiplePages: 'Normal',
  applyTo: 'Whole document',
}

export const PAGE_SIZE_OPTIONS = [
  { key: 'letter', label: 'Letter', detail: '8.5" × 11"' },
  { key: 'legal', label: 'Legal', detail: '8.5" × 14"' },
  { key: 'tabloid', label: 'Tabloid', detail: '11" × 17"' },
  { key: 'a3', label: 'A3', detail: '11.69" × 16.54"' },
  { key: 'a4', label: 'A4', detail: '8.27" × 11.69"' },
  { key: 'a5', label: 'A5', detail: '5.83" × 8.27"' },
  { key: 'b5', label: 'B5', detail: '7.17" × 10.12"' },
  { key: 'executive', label: 'Executive', detail: '7.25" × 10.5"' },
  { key: 'statement', label: 'Statement', detail: '5.5" × 8.5"' },
  { key: 'folio', label: 'Folio', detail: '8.5" × 13"' },
] as const

const EXTRA_SIZES: Record<string, { label: string; w: number; h: number }> = {
  b5: { label: 'B5 (7.17" x 10.12")', w: 688, h: 971 },
  executive: { label: 'Executive (7.25" x 10.5")', w: 696, h: 1008 },
  statement: { label: 'Statement (5.5" x 8.5")', w: 528, h: 816 },
  folio: { label: 'Folio (8.5" x 13")', w: 816, h: 1248 },
}

for (const [key, size] of Object.entries(EXTRA_SIZES)) {
  if (!PAGE_SIZES[key]) PAGE_SIZES[key] = size
}

export const MARGIN_GALLERY = [
  { key: 'normal', label: 'Normal', top: 1, right: 1, bottom: 1, left: 1 },
  { key: 'narrow', label: 'Narrow', top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
  { key: 'moderate', label: 'Moderate', top: 1, right: 0.75, bottom: 1, left: 0.75 },
  { key: 'wide', label: 'Wide', top: 1, right: 2, bottom: 1, left: 2 },
  { key: 'mirrored', label: 'Mirrored', top: 1, right: 1, bottom: 1, left: 1.25 },
  { key: 'office2003', label: 'Office 2003 Default', top: 1, right: 1.25, bottom: 1, left: 1.25 },
] as const

function cloneDefaults(): LayoutAdvancedState {
  return {
    columns: { ...DEFAULT_COLUMNS, widths: DEFAULT_COLUMNS.widths.map((w) => ({ ...w })) },
    lineNumbers: { ...DEFAULT_LINE_NUMBERS },
    hyphenation: { ...DEFAULT_HYPHENATION },
    customMargins: { ...DEFAULT_MARGINS },
    customPaper: null,
    pageSetup: { ...DEFAULT_PAGE_SETUP },
  }
}

function read(): LayoutAdvancedState {
  const base = cloneDefaults()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<LayoutAdvancedState>
    return {
      columns: { ...base.columns, ...(parsed.columns || {}) },
      lineNumbers: { ...base.lineNumbers, ...(parsed.lineNumbers || {}) },
      hyphenation: { ...base.hyphenation, ...(parsed.hyphenation || {}) },
      customMargins: { ...base.customMargins, ...(parsed.customMargins || {}) },
      customPaper: parsed.customPaper || null,
      pageSetup: { ...base.pageSetup, ...(parsed.pageSetup || {}) },
    }
  } catch {
    return base
  }
}

let state = read()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

function applyRoot() {
  if (typeof document === 'undefined') return
  if (state.customPaper) {
    PAGE_SIZES[state.customPaper.key] = {
      label: 'Custom size',
      w: state.customPaper.width,
      h: state.customPaper.height,
    }
  }
  const root = document.documentElement
  root.style.setProperty('--layout-column-count', String(state.columns.count))
  root.style.setProperty('--layout-column-gap', `${state.columns.gapIn}in`)
  root.style.setProperty('--layout-column-rule', state.columns.lineBetween ? '1px solid #a6a6a6' : 'none')
  root.style.setProperty('--layout-line-from', `${state.lineNumbers.fromText}in`)
  root.style.setProperty('--layout-hyphen-zone', `${Math.max(0, Math.min(100, (state.hyphenation.zoneIn / 6.5) * 100))}%`)
  root.style.setProperty('--layout-hyphen-chars', String(Math.max(2, state.hyphenation.limit + 3)))
  root.setAttribute('data-layout-columns', state.columns.count > 1 ? 'multi' : 'one')
  root.setAttribute('data-layout-column-preset', state.columns.preset)
  root.setAttribute('data-layout-column-lines', state.columns.lineBetween ? 'on' : 'off')
  root.setAttribute('data-layout-line-numbers', state.lineNumbers.mode)
  root.setAttribute('data-layout-hyphenation', state.hyphenation.mode)
  root.setAttribute('data-layout-hyphen-caps', state.hyphenation.hyphenateCaps ? 'on' : 'off')
  const doc = document.querySelector('.word-doc')
  if (doc) {
    if (state.hyphenation.mode === 'auto') doc.setAttribute('lang', 'en-US')
    else doc.removeAttribute('lang')
  }
}

function notify() {
  for (const listener of listeners) listener()
}

function commit(next: LayoutAdvancedState) {
  state = next
  persist()
  applyRoot()
  notify()
  refreshLineNumbers()
}

export function subscribeLayoutStore(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function layoutSnapshot() {
  return state
}

export function useLayoutStore(): LayoutAdvancedState {
  return useSyncExternalStore(subscribeLayoutStore, layoutSnapshot, layoutSnapshot)
}

export function setColumnsConfig(patch: Partial<ColumnConfig>) {
  commit({ ...state, columns: { ...state.columns, ...patch } })
}

export function setLineNumberConfig(patch: Partial<LineNumberConfig>) {
  commit({ ...state, lineNumbers: { ...state.lineNumbers, ...patch } })
}

export function setHyphenationConfig(patch: Partial<HyphenationConfig>) {
  commit({ ...state, hyphenation: { ...state.hyphenation, ...patch } })
}

export function setCustomMargins(patch: Partial<CustomMargins>) {
  commit({ ...state, customMargins: { ...state.customMargins, ...patch } })
}

export function setPageSetupOptions(patch: Partial<PageLayoutOptions>) {
  commit({ ...state, pageSetup: { ...state.pageSetup, ...patch } })
}

export function registerCustomPaperSize(width: number, height: number) {
  const key = `custom-${Math.round(width)}x${Math.round(height)}`
  PAGE_SIZES[key] = { label: 'Custom size', w: width, h: height }
  commit({ ...state, customPaper: { width, height, key } })
  return key
}

export function getColumnGap(widths: ColumnWidth[]): number {
  if (!widths.length) return 0.5
  return Math.max(0.1, widths[0].spacing || 0.5)
}

let gutterNodes: HTMLElement[] = []

export function refreshLineNumbers() {
  if (typeof document === 'undefined') return
  for (const node of gutterNodes) {
    if (node.parentElement) node.parentElement.removeChild(node)
  }
  gutterNodes = []
  if (state.lineNumbers.mode === 'none') return
  const pageWrap = document.querySelector('.page-wrap') as HTMLElement | null
  const prose = pageWrap?.querySelector('.doc-editor .ProseMirror') as HTMLElement | null
  if (!pageWrap || !prose) return
  const pageRect = pageWrap.getBoundingClientRect()
  if (!pageRect.width) return
  const body = pageWrap.querySelector('.doc-body') as HTMLElement | null
  const bodyRect = body?.getBoundingClientRect()
  const proseRect = prose.getBoundingClientRect()
  const textLeft = (bodyRect || proseRect).left - pageRect.left
  const fromText = state.lineNumbers.autoFromText ? 38 : Math.max(16, state.lineNumbers.fromText * 96)
  const gutterTop = proseRect.top - pageRect.top
  const gutter = document.createElement('div')
  gutter.className = 'layout-line-gutter'
  gutter.style.left = `${Math.max(4, textLeft - fromText)}px`
  gutter.style.top = `${gutterTop}px`
  gutter.style.height = `${proseRect.height}px`
  pageWrap.appendChild(gutter)
  gutterNodes.push(gutter)

  const blocks = Array.from(
    prose.querySelectorAll<HTMLElement>(
      'p, h1, h2, h3, h4, h5, h6, pre, blockquote, [data-layout-break], [data-page-break]',
    ),
  )
  const countBy = Math.max(1, state.lineNumbers.countBy)
  let lineIndex = 0
  let printed = 0
  for (const block of blocks) {
    if (block.closest('table')) continue
    const breakKind = block.getAttribute('data-layout-break')
    const isPageBreak = block.hasAttribute('data-page-break')
    if (breakKind || isPageBreak) {
      const isSection = breakKind ? breakKind.startsWith('section') : false
      if ((state.lineNumbers.mode === 'section' && isSection) || (state.lineNumbers.mode === 'page' && isPageBreak)) {
        lineIndex = 0
        printed = 0
      }
      continue
    }
    if (block.closest('[data-suppress-line-numbers="true"]')) continue
    const range = document.createRange()
    range.selectNodeContents(block)
    const rects = Array.from(range.getClientRects()).filter((rect) => rect.width > 1 && rect.height > 1)
    const fallback = block.getBoundingClientRect()
    const lines = rects.length
      ? rects
      : fallback.height > 1
        ? [fallback]
        : []
    const seen = new Set<number>()
    for (const rect of lines) {
      const top = Math.round(rect.top - pageRect.top)
      if (seen.has(top)) continue
      seen.add(top)
      lineIndex += 1
      if ((lineIndex - 1) % countBy !== 0) continue
      printed += 1
      const number = document.createElement('span')
      number.className = 'layout-line-number'
      number.textContent = String(state.lineNumbers.startAt + printed - 1)
      number.style.top = `${top - gutterTop}px`
      gutter.appendChild(number)
    }
  }
  if (!gutter.childElementCount) {
    gutter.remove()
    gutterNodes = gutterNodes.filter((node) => node !== gutter)
  }
}

let loopStarted = false
let refreshHandle: number | null = null

function scheduleRefresh() {
  if (typeof window === 'undefined') return
  if (refreshHandle !== null) window.clearTimeout(refreshHandle)
  refreshHandle = window.setTimeout(() => {
    refreshHandle = null
    refreshLineNumbers()
  }, 40)
}

function startLoop() {
  if (loopStarted || typeof window === 'undefined') return
  loopStarted = true
  window.setInterval(() => {
    if (state.lineNumbers.mode !== 'none') refreshLineNumbers()
  }, 700)
  window.addEventListener('resize', scheduleRefresh)
  if (document.fonts?.ready) document.fonts.ready.then(() => scheduleRefresh()).catch(() => undefined)
  scheduleRefresh()
}

applyRoot()
startLoop()

export function scheduleLayoutRefresh() {
  scheduleRefresh()
}
