import type { Editor } from '@tiptap/react'
import type { Node as PMNode } from '@tiptap/pm/model'

export type CitationStyleId = 'APA' | 'MLA' | 'Chicago' | 'Harvard' | 'IEEE'
export const CITATION_STYLES: { id: CitationStyleId; label: string }[] = [
  { id: 'APA', label: 'APA Seventh Edition' },
  { id: 'MLA', label: 'MLA Ninth Edition' },
  { id: 'Chicago', label: 'Chicago Seventeenth Edition' },
  { id: 'Harvard', label: 'Harvard - Anglia Ruskin University' },
  { id: 'IEEE', label: 'IEEE' },
]

export type SourceTypeId = 'book' | 'bookSection' | 'journal' | 'website' | 'report' | 'conference' | 'misc'
export type SourceType = { id: SourceTypeId; label: string; fields: string[] }

export const SOURCE_TYPES: SourceType[] = [
  { id: 'book', label: 'Book', fields: ['authors', 'title', 'year', 'publisher', 'city', 'edition'] },
  { id: 'bookSection', label: 'Book Section', fields: ['authors', 'title', 'bookTitle', 'year', 'publisher', 'city', 'pages'] },
  { id: 'journal', label: 'Journal Article', fields: ['authors', 'title', 'journal', 'year', 'volume', 'issue', 'pages'] },
  { id: 'website', label: 'Web Site', fields: ['authors', 'title', 'website', 'year', 'url', 'accessed'] },
  { id: 'report', label: 'Report', fields: ['authors', 'title', 'year', 'institution', 'city', 'pages'] },
  { id: 'conference', label: 'Conference Proceedings', fields: ['authors', 'title', 'conference', 'year', 'city', 'publisher', 'pages'] },
  { id: 'misc', label: 'Misc', fields: ['authors', 'title', 'year', 'medium', 'publisher', 'city'] },
]

export const SOURCE_FIELD_LABELS: Record<string, string> = {
  authors: 'Author(s)',
  title: 'Title',
  bookTitle: 'Book title',
  year: 'Year',
  publisher: 'Publisher',
  city: 'City',
  edition: 'Edition',
  journal: 'Journal name',
  volume: 'Volume',
  issue: 'Issue',
  pages: 'Pages',
  website: 'Web site name',
  url: 'URL',
  accessed: 'Date accessed',
  institution: 'Institution',
  conference: 'Conference name',
  medium: 'Medium',
}

export type Source = {
  id: string
  tag: string
  type: SourceTypeId
  authors: string
  title: string
  year: string
  publisher: string
  city: string
  edition: string
  bookTitle: string
  journal: string
  volume: string
  issue: string
  pages: string
  website: string
  url: string
  accessed: string
  institution: string
  conference: string
  medium: string
  placeholder?: boolean
}

export type NumberFormat = 'decimal' | 'alpha-lower' | 'alpha-upper' | 'roman-lower' | 'roman-upper' | 'symbol'
export const NUMBER_FORMATS: { id: NumberFormat; label: string }[] = [
  { id: 'decimal', label: '1, 2, 3, …' },
  { id: 'alpha-lower', label: 'a, b, c, …' },
  { id: 'alpha-upper', label: 'A, B, C, …' },
  { id: 'roman-lower', label: 'i, ii, iii, …' },
  { id: 'roman-upper', label: 'I, II, III, …' },
  { id: 'symbol', label: '*, †, ‡, …' },
]

export type NoteKind = 'footnote' | 'endnote'
export type NoteRecord = { id: string; text: string; kind: NoteKind }
export type NoteSettings = {
  footnoteFormat: NumberFormat
  endnoteFormat: NumberFormat
  startAt: number
  footnoteRestart: string
  endnoteRestart: string
  footnoteLocation: string
  endnoteLocation: string
}

export type TocDesignId =
  | 'automatic1'
  | 'automatic2'
  | 'manual'
  | 'classic'
  | 'fancy'
  | 'modern'
  | 'simple'
  | 'formal'
export type TocDesign = {
  id: TocDesignId
  label: string
  description: string
  title: string
  accent: string
  titleSize: number
  titleAlign: 'left' | 'center'
  titleBorder: boolean
  entryBold: boolean
  entryItalic: boolean
  entrySize: number
  manual?: boolean
}

export const TOC_DESIGNS: TocDesign[] = [
  { id: 'automatic1', label: 'Automatic Table 1', description: 'Contents with dot leaders', title: 'Contents', accent: '#000000', titleSize: 18, titleAlign: 'left', titleBorder: false, entryBold: false, entryItalic: false, entrySize: 12 },
  { id: 'automatic2', label: 'Automatic Table 2', description: 'Table of Contents heading', title: 'Table of Contents', accent: '#2f5496', titleSize: 18, titleAlign: 'left', titleBorder: false, entryBold: false, entryItalic: false, entrySize: 12 },
  { id: 'manual', label: 'Manual Table', description: 'Static placeholder entries', title: 'Table of Contents', accent: '#000000', titleSize: 18, titleAlign: 'left', titleBorder: false, entryBold: false, entryItalic: false, entrySize: 12, manual: true },
  { id: 'classic', label: 'Classic', description: 'Centered classic heading', title: 'Table of Contents', accent: '#000000', titleSize: 19, titleAlign: 'center', titleBorder: false, entryBold: false, entryItalic: false, entrySize: 12 },
  { id: 'fancy', label: 'Fancy', description: 'Italic serif entries', title: 'Table of Contents', accent: '#5b4b8a', titleSize: 20, titleAlign: 'center', titleBorder: true, entryBold: false, entryItalic: true, entrySize: 12 },
  { id: 'modern', label: 'Modern', description: 'Accent bar and bold levels', title: 'Contents', accent: '#1f6feb', titleSize: 21, titleAlign: 'left', titleBorder: true, entryBold: true, entryItalic: false, entrySize: 12 },
  { id: 'simple', label: 'Simple', description: 'Compact plain list', title: 'Contents', accent: '#404040', titleSize: 16, titleAlign: 'left', titleBorder: false, entryBold: false, entryItalic: false, entrySize: 11 },
  { id: 'formal', label: 'Formal', description: 'Small caps formal heading', title: 'TABLE OF CONTENTS', accent: '#000000', titleSize: 16, titleAlign: 'center', titleBorder: false, entryBold: false, entryItalic: false, entrySize: 12 },
]

export const LEADERS: { id: string; label: string; char: string }[] = [
  { id: 'none', label: '(none)', char: '' },
  { id: 'dot', label: '......', char: '.' },
  { id: 'dash', label: '------', char: '-' },
  { id: 'underline', label: '______', char: '_' },
]

export type TocConfig = {
  design: TocDesignId
  showPageNumbers: boolean
  rightAlign: boolean
  leader: string
  levels: number
}
export const DEFAULT_TOC: TocConfig = { design: 'automatic1', showPageNumbers: true, rightAlign: true, leader: 'dot', levels: 3 }

export type TofConfig = {
  label: string
  includeLabel: boolean
  showPageNumbers: boolean
  rightAlign: boolean
  leader: string
  levels: number
}
export const DEFAULT_TOF: TofConfig = { label: 'Figure', includeLabel: true, showPageNumbers: true, rightAlign: true, leader: 'dot', levels: 3 }

export type IndexConfig = {
  type: 'indented' | 'run-in'
  columns: number
  showPageNumbers: boolean
  rightAlign: boolean
  leader: string
}
export const DEFAULT_INDEX: IndexConfig = { type: 'indented', columns: 2, showPageNumbers: true, rightAlign: true, leader: 'dot' }

export type ToaConfig = {
  category: string
  passim: boolean
  keepFormatting: boolean
  leader: string
}
export const DEFAULT_TOA: ToaConfig = { category: 'All', passim: true, keepFormatting: false, leader: 'dot' }

export type CaptionRecord = { id: string; label: string; number: string; text: string }
export type IndexEntry = {
  id: string
  main: string
  sub: string
  crossRef: string
  bold: boolean
  italic: boolean
  pageBold: boolean
  pageItalic: boolean
  pages: number[]
}
export type AuthorityEntry = {
  id: string
  selectedText: string
  category: string
  short: string
  long: string
  pages: number[]
}
export type BookmarkRecord = { id: string; name: string; page: number }

export type ReferenceStore = {
  sources: Source[]
  masterSources: Source[]
  footnotes: NoteRecord[]
  endnotes: NoteRecord[]
  citationStyle: CitationStyleId
  toc: TocConfig
  tof: TofConfig
  index: IndexConfig
  toa: ToaConfig
  customLabels: string[]
  captions: CaptionRecord[]
  indexEntries: IndexEntry[]
  authorities: AuthorityEntry[]
  bookmarks: BookmarkRecord[]
  noteSettings: NoteSettings
}

const STORE_KEY = 'openoffice:references:v1'

export const MARKERS = {
  tocTitle: '#toc-title',
  tocEntry: '#toc-entry-',
  tocLevel: '#toclevel-',
  tocSkip: '#tocskip',
  tofTitle: '#tof-title',
  tofEntry: '#tof-entry-',
  bibTitle: '#bib-title',
  bibEntry: '#bib-entry-',
  indexTitle: '#index-title',
  indexEntry: '#index-entry-',
  toaTitle: '#toa-title',
  toaEntry: '#toa-entry-',
  footnote: '#fn-',
  footnoteNote: '#fn-note-',
  endnote: '#en-',
  endnoteNote: '#en-note-',
  notesFootnote: '#notes-section-footnote',
  notesEndnote: '#notes-section-endnote',
  noteSep: '#notes-sep-',
  citation: '#cite-',
  caption: '#caption-',
  xref: '#xref-',
}

export const TOA_CATEGORIES = [
  'Cases',
  'Statutes',
  'Other Authorities',
  'Rules',
  'Treatises',
  'Regulations',
  'Constitutional Provisions',
]

export function uid(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${Date.now().toString(36)}${random}`
}

export function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function emptySource(): Source {
  return {
    id: uid('src'),
    tag: '',
    type: 'book',
    authors: '',
    title: '',
    year: '',
    publisher: '',
    city: '',
    edition: '',
    bookTitle: '',
    journal: '',
    volume: '',
    issue: '',
    pages: '',
    website: '',
    url: '',
    accessed: '',
    institution: '',
    conference: '',
    medium: '',
  }
}

export function defaultReferenceStore(): ReferenceStore {
  return {
    sources: [],
    masterSources: [],
    footnotes: [],
    endnotes: [],
    citationStyle: 'APA',
    toc: { ...DEFAULT_TOC },
    tof: { ...DEFAULT_TOF },
    index: { ...DEFAULT_INDEX },
    toa: { ...DEFAULT_TOA },
    customLabels: [],
    captions: [],
    indexEntries: [],
    authorities: [],
    bookmarks: [],
    noteSettings: {
      footnoteFormat: 'decimal',
      endnoteFormat: 'roman-lower',
      startAt: 1,
      footnoteRestart: 'Continuous',
      endnoteRestart: 'Continuous',
      footnoteLocation: 'Bottom of page',
      endnoteLocation: 'End of document',
    },
  }
}

export function loadReferenceStore(): ReferenceStore {
  const base = defaultReferenceStore()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<ReferenceStore>
    return {
      ...base,
      ...parsed,
      sources: Array.isArray(parsed.sources) ? parsed.sources : base.sources,
      masterSources: Array.isArray(parsed.masterSources) ? parsed.masterSources : base.masterSources,
      footnotes: Array.isArray(parsed.footnotes) ? parsed.footnotes : base.footnotes,
      endnotes: Array.isArray(parsed.endnotes) ? parsed.endnotes : base.endnotes,
      customLabels: Array.isArray(parsed.customLabels) ? parsed.customLabels : base.customLabels,
      captions: Array.isArray(parsed.captions) ? parsed.captions : base.captions,
      indexEntries: Array.isArray(parsed.indexEntries) ? parsed.indexEntries : base.indexEntries,
      authorities: Array.isArray(parsed.authorities) ? parsed.authorities : base.authorities,
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : base.bookmarks,
      toc: { ...base.toc, ...(parsed.toc || {}) },
      tof: { ...base.tof, ...(parsed.tof || {}) },
      index: { ...base.index, ...(parsed.index || {}) },
      toa: { ...base.toa, ...(parsed.toa || {}) },
      noteSettings: { ...base.noteSettings, ...(parsed.noteSettings || {}) },
    }
  } catch {
    return base
  }
}

export function saveReferenceStore(store: ReferenceStore) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store))
  } catch {
    /* ignore */
  }
}

function linkHrefs(node: PMNode): string[] {
  const hrefs: string[] = []
  node.descendants((child) => {
    if (!child.isText) return true
    for (const mark of child.marks) {
      if (mark.type.name === 'link' && typeof mark.attrs.href === 'string') hrefs.push(mark.attrs.href)
    }
    return true
  })
  return hrefs
}

function nodeHasHref(node: PMNode, predicate: (href: string) => boolean) {
  return linkHrefs(node).some(predicate)
}

function isStructuralBlock(node: PMNode) {
  const prefixes = [
    MARKERS.tocTitle,
    MARKERS.tocEntry,
    MARKERS.tofTitle,
    MARKERS.tofEntry,
    MARKERS.bibTitle,
    MARKERS.bibEntry,
    MARKERS.indexTitle,
    MARKERS.indexEntry,
    MARKERS.toaTitle,
    MARKERS.toaEntry,
    MARKERS.notesFootnote,
    MARKERS.notesEndnote,
    MARKERS.noteSep,
    MARKERS.footnoteNote,
    MARKERS.endnoteNote,
  ]
  return nodeHasHref(node, (href) => prefixes.some((prefix) => href.startsWith(prefix)))
}

function textOf(node: PMNode) {
  return node.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim()
}

function roman(number: number) {
  if (number <= 0) return String(number)
  const table: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]
  let value = number
  let out = ''
  for (const [amount, glyph] of table) {
    while (value >= amount) {
      out += glyph
      value -= amount
    }
  }
  return out
}

export function alphaNumber(value: number, upper = false) {
  if (value <= 0) return String(value)
  let n = value
  let out = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    out = String.fromCharCode((upper ? 65 : 97) + rem) + out
    n = Math.floor((n - 1) / 26)
  }
  return out
}

export function formatSequenceNumber(value: number, format: NumberFormat) {
  switch (format) {
    case 'alpha-lower':
      return alphaNumber(value, false)
    case 'alpha-upper':
      return alphaNumber(value, true)
    case 'roman-lower':
      return roman(value).toLowerCase()
    case 'roman-upper':
      return roman(value)
    case 'symbol':
      return ['*', '†', '‡', '§'][(Math.max(1, value) - 1) % 4]
    default:
      return String(value)
  }
}

export function formatNoteNumber(index: number, settings: NoteSettings, kind: NoteKind) {
  const start = Math.max(1, Number(settings.startAt) || 1)
  const format = kind === 'footnote' ? settings.footnoteFormat : settings.endnoteFormat
  return formatSequenceNumber(start + index, format)
}

export function estimatePageForPos(editor: Editor, pos: number) {
  const doc = editor.state.doc
  let page = 1
  let characters = 0
  let reached = false
  doc.forEach((node, offset) => {
    if (reached || offset >= pos) {
      reached = true
      return
    }
    if (node.type.name === 'pageBreak') {
      page += 1
      return
    }
    characters += node.textContent.length
    while (characters > 1800) {
      page += 1
      characters -= 1800
    }
  })
  return page
}

export function pageAtSelection(editor: Editor) {
  return estimatePageForPos(editor, editor.state.selection.from)
}

export function selectedText(editor: Editor) {
  const { from, to, empty } = editor.state.selection
  if (empty) return ''
  return editor.state.doc.textBetween(from, to, ' ')
}

export function selectedBlocks(editor: Editor) {
  const { from, to } = editor.state.selection
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

export function applyTocLevel(editor: Editor, level: number | null) {
  const blocks = selectedBlocks(editor)
  if (!blocks.length) return false
  const link = editor.schema.marks.link
  if (!link) return false
  const tr = editor.state.tr
  for (const block of blocks) {
    const from = block.pos + 1
    const to = block.pos + block.node.nodeSize - 1
    if (to <= from) continue
    tr.addMark(from, to, link.create({ href: level ? `${MARKERS.tocLevel}${level}` : MARKERS.tocSkip }))
  }
  editor.view.dispatch(tr)
  editor.commands.focus()
  return true
}

type TocEntry = { level: number; text: string; pos: number }

function tocInfo(node: PMNode) {
  let level: number | null = null
  let skip = false
  node.descendants((child) => {
    if (!child.isText) return true
    for (const mark of child.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (href.startsWith(MARKERS.tocLevel)) {
        const parsed = Number.parseInt(href.slice(MARKERS.tocLevel.length), 10)
        if (Number.isFinite(parsed)) level = parsed
      }
      if (href === MARKERS.tocSkip) skip = true
    }
    return true
  })
  return { level, skip }
}

export function collectTocEntries(editor: Editor, maxLevel = 3): TocEntry[] {
  const entries: TocEntry[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'heading' && node.type.name !== 'paragraph') return true
    if (isStructuralBlock(node)) return false
    const info = tocInfo(node)
    if (info.skip) return false
    const headingLevel = node.type.name === 'heading' ? Number(node.attrs.level) : null
    const level = info.level ?? headingLevel
    const text = textOf(node)
    if (level && level <= maxLevel && text) entries.push({ level, text, pos })
    return false
  })
  return entries
}

export function hasToc(editor: Editor) {
  return findMarkedBlocks(editor, MARKERS.tocTitle, MARKERS.tocEntry).length > 0
}

function tocTitleHtml(design: TocDesign) {
  const styles: string[] = []
  if (design.titleAlign === 'center') styles.push('text-align: center')
  const border = design.titleBorder ? ' data-border-sides="bottom" data-border-color="#8aa4c8" data-border-width="1px"' : ''
  const inner = `<strong><span style="font-size: ${design.titleSize}px; color: ${design.accent}"><a href="${MARKERS.tocTitle}">${escapeHtml(design.title)}</a></span></strong>`
  return `<p style="${styles.join('; ')}"${border}>${inner}</p>`
}

function leaderText(length: number, char: string) {
  if (!char) return ' '
  return char.repeat(Math.max(4, Math.min(70, length)))
}

function tocEntryHtml(entry: TocEntry, index: number, design: TocDesign, config: TocConfig, editor: Editor) {
  const page = estimatePageForPos(editor, entry.pos)
  const indent = Math.max(0, Math.min(8, entry.level - 1))
  const bold = design.entryBold && entry.level === 1
  const sizeStyle = `font-size: ${design.entrySize}px${design.entryItalic ? '; font-style: italic' : ''}`
  const label = bold
    ? `<strong><span style="${sizeStyle}"><a href="${MARKERS.tocEntry}${index}">${escapeHtml(entry.text)}</a></span></strong>`
    : `<span style="${sizeStyle}"><a href="${MARKERS.tocEntry}${index}">${escapeHtml(entry.text)}</a></span>`
  const leader = config.leader === 'none' ? '' : LEADERS.find((item) => item.id === config.leader)?.char || '.'
  const dots = leaderText(80 - entry.text.length - indent * 3 - String(page).length, leader)
  const pageHtml = config.showPageNumbers
    ? `<span style="font-size: ${design.entrySize}px">${config.rightAlign ? dots : ' '}${page}</span>`
    : ''
  return `<p data-indent="${indent}" style="margin-top: 2px; margin-bottom: 2px">${label}${pageHtml}</p>`
}

export function buildTocHtml(editor: Editor, config: TocConfig) {
  const design = TOC_DESIGNS.find((item) => item.id === config.design) || TOC_DESIGNS[0]
  const entries = collectTocEntries(editor, config.levels)
  let html = tocTitleHtml(design)
  if (!entries.length) {
    return `${html}<p><a href="${MARKERS.tocEntry}0"><em>No headings found. Apply Heading styles or use Add Text to include paragraphs.</em></a></p>`
  }
  html += entries.map((entry, index) => tocEntryHtml(entry, index, design, config, editor)).join('')
  return html
}

export function buildManualTocHtml(editor: Editor) {
  const entries = collectTocEntries(editor, 3)
  const title = `<p><strong><span style="font-size: 18px"><a href="${MARKERS.tocTitle}">${escapeHtml(TOC_DESIGNS[2].title)}</a></span></strong></p>`
  if (!entries.length) {
    return `${title}<p><a href="${MARKERS.tocEntry}0">Type chapter title (level 1) .......... 1</a></p><p data-indent="1"><a href="${MARKERS.tocEntry}1">Type section title (level 2) .......... 2</a></p><p data-indent="2"><a href="${MARKERS.tocEntry}2">Type subsection title (level 3) .......... 3</a></p>`
  }
  return `${title}${entries
    .map((entry, index) => `<p data-indent="${entry.level - 1}"><a href="${MARKERS.tocEntry}${index}">${escapeHtml(entry.text)} .......... ${estimatePageForPos(editor, entry.pos)}</a></p>`)
    .join('')}`
}

type BlockRange = { start: number; end: number }

function findMarkedBlocks(editor: Editor, titleHref: string, entryPrefix: string): BlockRange[] {
  const blocks: BlockRange[] = []
  let current: BlockRange | null = null
  editor.state.doc.forEach((node, offset) => {
    if (nodeHasHref(node, (href) => href === titleHref)) {
      if (current) blocks.push(current)
      current = { start: offset, end: offset + node.nodeSize }
      return
    }
    if (!current) return
    if (nodeHasHref(node, (href) => href.startsWith(entryPrefix))) {
      current.end = offset + node.nodeSize
    } else {
      blocks.push(current)
      current = null
    }
  })
  if (current) blocks.push(current)
  return blocks
}

function replaceBlocks(editor: Editor, blocks: BlockRange[], html: string) {
  if (!blocks.length) return false
  const first = blocks[0].start
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    editor.chain().focus().deleteRange({ from: blocks[index].start, to: blocks[index].end }).run()
  }
  editor.chain().focus().insertContentAt(first, html).run()
  return true
}

export function insertToc(editor: Editor, config: TocConfig, manual = false) {
  const html = manual ? buildManualTocHtml(editor) : buildTocHtml(editor, config)
  editor.chain().focus().insertContent(html).run()
  return true
}

export function updateToc(editor: Editor, config: TocConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.tocTitle, MARKERS.tocEntry)
  if (!blocks.length) return false
  return replaceBlocks(editor, blocks, buildTocHtml(editor, config))
}

export function removeToc(editor: Editor) {
  const blocks = findMarkedBlocks(editor, MARKERS.tocTitle, MARKERS.tocEntry)
  if (!blocks.length) return false
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    editor.chain().focus().deleteRange({ from: blocks[index].start, to: blocks[index].end }).run()
  }
  return true
}

export function createNote(kind: NoteKind, text: string): NoteRecord {
  return { id: uid(kind === 'footnote' ? 'fn' : 'en'), kind, text }
}

export function insertNoteReference(editor: Editor, kind: NoteKind, id: string) {
  const href = `${kind === 'footnote' ? MARKERS.footnote : MARKERS.endnote}${id}`
  editor.chain().focus().insertContent(`<sup><a href="${href}">1</a></sup>`).run()
}

type NoteRef = { from: number; to: number; kind: NoteKind; id: string; marks: PMNode['marks'] }

function collectNoteRefs(editor: Editor): NoteRef[] {
  const refs: NoteRef[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (href.startsWith(MARKERS.footnote) && !href.startsWith(MARKERS.footnoteNote)) {
        refs.push({ from: pos, to: pos + node.nodeSize, kind: 'footnote', id: href.slice(MARKERS.footnote.length), marks: node.marks })
      } else if (href.startsWith(MARKERS.endnote) && !href.startsWith(MARKERS.endnoteNote)) {
        refs.push({ from: pos, to: pos + node.nodeSize, kind: 'endnote', id: href.slice(MARKERS.endnote.length), marks: node.marks })
      }
    }
    return true
  })
  return refs
}

export function renumberNotes(editor: Editor, store: ReferenceStore) {
  const refs = collectNoteRefs(editor)
  if (!refs.length) return
  const counters: Record<NoteKind, number> = { footnote: 0, endnote: 0 }
  const updates = refs.map((ref) => {
    const index = counters[ref.kind]
    counters[ref.kind] += 1
    const label = formatNoteNumber(index, store.noteSettings, ref.kind)
    return { ref, label }
  })
  const tr = editor.state.tr
  for (let index = updates.length - 1; index >= 0; index -= 1) {
    const { ref, label } = updates[index]
    tr.replaceWith(ref.from, ref.to, editor.schema.text(label, ref.marks))
  }
  editor.view.dispatch(tr)
}

function collectNoteIds(editor: Editor, kind: NoteKind) {
  const prefix = kind === 'footnote' ? MARKERS.footnote : MARKERS.endnote
  const notePrefix = kind === 'footnote' ? MARKERS.footnoteNote : MARKERS.endnoteNote
  const ids: string[] = []
  editor.state.doc.descendants((node) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (href.startsWith(prefix) && !href.startsWith(notePrefix)) ids.push(href.slice(prefix.length))
    }
    return true
  })
  return ids
}

function findNoteBlocks(editor: Editor, kind: NoteKind) {
  const titleHref = kind === 'footnote' ? MARKERS.notesFootnote : MARKERS.notesEndnote
  const notePrefix = kind === 'footnote' ? MARKERS.footnoteNote : MARKERS.endnoteNote
  const blocks: BlockRange[] = []
  let current: BlockRange | null = null
  editor.state.doc.forEach((node, offset) => {
    if (nodeHasHref(node, (href) => href === titleHref)) {
      if (current) blocks.push(current)
      current = { start: offset, end: offset + node.nodeSize }
      return
    }
    if (!current) return
    if (nodeHasHref(node, (href) => href.startsWith(notePrefix) || href.startsWith(MARKERS.noteSep))) {
      current.end = offset + node.nodeSize
    } else {
      blocks.push(current)
      current = null
    }
  })
  if (current) blocks.push(current)
  return blocks
}

function collectNoteBodies(editor: Editor, kind: NoteKind) {
  const notePrefix = kind === 'footnote' ? MARKERS.footnoteNote : MARKERS.endnoteNote
  const bodies = new Map<string, string>()
  editor.state.doc.descendants((node) => {
    if (node.type.name !== 'paragraph') return true
    let id = ''
    let labelText = ''
    node.descendants((child) => {
      if (!child.isText) return true
      for (const mark of child.marks) {
        if (mark.type.name !== 'link') continue
        const href = String(mark.attrs.href || '')
        if (!href.startsWith(notePrefix)) continue
        id = href.slice(notePrefix.length)
        labelText += child.textContent
      }
      return true
    })
    if (!id) return false
    const full = textOf(node)
    const body = full.startsWith(labelText) ? full.slice(labelText.length).replace(/^[:\s]+/, '').trim() : full
    bodies.set(id, body)
    return false
  })
  return bodies
}

export function syncNoteTexts(editor: Editor, store: ReferenceStore): ReferenceStore {
  const merge = (records: NoteRecord[], bodies: Map<string, string>, kind: NoteKind) => {
    const next = records.map((note) => (bodies.has(note.id) ? { ...note, text: bodies.get(note.id) || '' } : note))
    for (const [id, text] of bodies) {
      if (!next.some((note) => note.id === id)) next.push({ id, text, kind })
    }
    return next
  }
  return {
    ...store,
    footnotes: merge(store.footnotes, collectNoteBodies(editor, 'footnote'), 'footnote'),
    endnotes: merge(store.endnotes, collectNoteBodies(editor, 'endnote'), 'endnote'),
  }
}

function notesHtml(editor: Editor, store: ReferenceStore, kind: NoteKind) {
  const ids = collectNoteIds(editor, kind)
  if (!ids.length) return ''
  const records = kind === 'footnote' ? store.footnotes : store.endnotes
  const byId = new Map(records.map((note) => [note.id, note]))
  const title = kind === 'footnote' ? 'Footnotes' : 'Endnotes'
  const titleHref = kind === 'footnote' ? MARKERS.notesFootnote : MARKERS.notesEndnote
  const notePrefix = kind === 'footnote' ? MARKERS.footnoteNote : MARKERS.endnoteNote
  const sepHref = `${MARKERS.noteSep}${kind}`
  let html = `<p><strong><span style="font-size: 10px; color: #595959"><a href="${titleHref}">${title}</a></span></strong></p>`
  html += `<p data-border-sides="top" data-border-color="#a6a6a6" data-border-width="1px"><a href="${sepHref}">&#160;</a></p>`
  ids.forEach((id, index) => {
    const note = byId.get(id)
    const label = formatNoteNumber(index, store.noteSettings, kind)
    const body = escapeHtml(note?.text || '')
    html += `<p><sup><a href="${notePrefix}${id}">${label}</a></sup> ${body}</p>`
  })
  return html
}

export function rebuildNotes(editor: Editor, store: ReferenceStore) {
  const footnoteBlocks = findNoteBlocks(editor, 'footnote')
  const endnoteBlocks = findNoteBlocks(editor, 'endnote')
  const allBlocks = [...footnoteBlocks, ...endnoteBlocks].sort((a, b) => b.start - a.start)
  for (const block of allBlocks) {
    editor.chain().focus().deleteRange({ from: block.start, to: block.end }).run()
  }
  const html = `${notesHtml(editor, store, 'footnote')}${notesHtml(editor, store, 'endnote')}`
  if (!html) return
  editor.chain().focus().insertContentAt(editor.state.doc.content.size, html).run()
}

export function notePositions(editor: Editor, kind: NoteKind) {
  const prefix = kind === 'footnote' ? MARKERS.footnote : MARKERS.endnote
  const notePrefix = kind === 'footnote' ? MARKERS.footnoteNote : MARKERS.endnoteNote
  const positions: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (href.startsWith(prefix) && !href.startsWith(notePrefix)) {
        positions.push(pos)
        break
      }
    }
    return true
  })
  return positions
}

export function navigateNote(editor: Editor, kind: NoteKind, direction: 1 | -1) {
  const positions = notePositions(editor, kind)
  if (!positions.length) return false
  const cursor = editor.state.selection.from
  let target = direction > 0 ? positions.find((pos) => pos > cursor) : [...positions].reverse().find((pos) => pos < cursor)
  if (target === undefined) target = direction > 0 ? positions[0] : positions[positions.length - 1]
  editor.chain().focus().setTextSelection(target + 1).scrollIntoView().run()
  return true
}

export function rewriteNoteLinks(editor: Editor, fromPrefix: string, toPrefix: string) {
  const link = editor.schema.marks.link
  if (!link) return
  const ranges: { from: number; to: number; href: string }[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (href.startsWith(fromPrefix)) ranges.push({ from: pos, to: pos + node.nodeSize, href: toPrefix + href.slice(fromPrefix.length) })
    }
    return true
  })
  if (!ranges.length) return
  const tr = editor.state.tr
  for (const range of ranges) {
    tr.removeMark(range.from, range.to, link)
    tr.addMark(range.from, range.to, link.create({ href: range.href }))
  }
  editor.view.dispatch(tr)
}

export function firstAuthorLast(source: Source) {
  const raw = (source.authors || '').split(';')[0]?.trim() || ''
  if (!raw) return 'Anon.'
  if (raw.includes(',')) return raw.split(',')[0].trim()
  const parts = raw.split(/\s+/)
  return parts[parts.length - 1] || raw
}

export function sourceByTag(store: ReferenceStore, tag: string) {
  return store.sources.find((source) => source.tag === tag) || store.masterSources.find((source) => source.tag === tag)
}

export function makeSourceTag(source: Source, existing: string[]) {
  const base = `${firstAuthorLast(source).replace(/[^A-Za-z0-9]/g, '')}${(source.year || '').replace(/[^A-Za-z0-9]/g, '')}` || 'Source'
  let tag = base
  let suffix = 2
  while (existing.includes(tag)) {
    tag = `${base}${suffix}`
    suffix += 1
  }
  return tag
}

function apaAuthors(source: Source) {
  const authors = (source.authors || '').split(';').map((author) => author.trim()).filter(Boolean)
  if (!authors.length) return 'Anon.'
  return authors
    .map((author) => {
      const [last, ...rest] = author.split(',')
      if (!rest.length) return author
      const initials = rest
        .join(' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => `${part[0].toUpperCase()}.`)
        .join(' ')
      return `${last.trim()}, ${initials}`
    })
    .join(', ')
}

function parseCitationHref(href: string) {
  const raw = href.slice(MARKERS.citation.length)
  const split = raw.indexOf('?locator=')
  if (split < 0) return { tag: decodeURIComponent(raw), locator: '' }
  return {
    tag: decodeURIComponent(raw.slice(0, split)),
    locator: decodeURIComponent(raw.slice(split + '?locator='.length)),
  }
}

function citationHref(tag: string, locator = '') {
  const base = `${MARKERS.citation}${encodeURIComponent(tag)}`
  return locator.trim() ? `${base}?locator=${encodeURIComponent(locator.trim())}` : base
}

function citationNumber(editor: Editor, tag: string) {
  const tags: string[] = []
  editor.state.doc.descendants((node) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (!href.startsWith(MARKERS.citation)) continue
      const value = parseCitationHref(href).tag
      if (!tags.includes(value)) tags.push(value)
    }
    return true
  })
  const index = tags.indexOf(tag)
  return index >= 0 ? index + 1 : tags.length + 1
}

export function formatInText(source: Source, style: CitationStyleId, number: number, locator = '') {
  if (source.placeholder) return `[${source.authors || source.title || 'Placeholder'}]`
  const last = firstAuthorLast(source)
  const year = source.year || 'n.d.'
  const page = locator.trim()
  switch (style) {
    case 'MLA':
      return `(${last}${page ? ` ${page}` : ''})`
    case 'Chicago':
      return `(${last} ${year}${page ? `, ${page}` : ''})`
    case 'Harvard':
      return `(${last} ${year}${page ? `, p. ${page}` : ''})`
    case 'IEEE':
      return `[${number}]`
    default:
      return `(${last}, ${year}${page ? `, p. ${page}` : ''})`
  }
}

export function formatBibliographyEntry(source: Source, style: CitationStyleId) {
  if (source.placeholder) return `<em>${escapeHtml(source.title || source.authors || 'Placeholder')} (unresolved placeholder)</em>`
  const authors = apaAuthors(source)
  const title = `<em>${escapeHtml(source.title || 'Untitled')}</em>`
  const year = escapeHtml(source.year || 'n.d.')
  const publisher = escapeHtml(source.publisher || '')
  const city = escapeHtml(source.city || '')
  const journal = `<em>${escapeHtml(source.journal || source.bookTitle || source.website || '')}</em>`
  switch (style) {
    case 'MLA':
      return `${escapeHtml(authors)}. ${title}.${publisher ? ` ${publisher},` : ''} ${year}.`
    case 'Chicago':
      return `${escapeHtml(authors)}. ${year}. ${title}.${city ? ` ${city}:` : ''} ${publisher}.`
    case 'Harvard':
      return `${escapeHtml(authors)} (${year}) ${title}.${city ? ` ${city}:` : ''} ${publisher}.`
    case 'IEEE': {
      const details = [source.volume ? `vol. ${escapeHtml(source.volume)}` : '', source.issue ? `no. ${escapeHtml(source.issue)}` : '', source.pages ? `pp. ${escapeHtml(source.pages)}` : ''].filter(Boolean).join(', ')
      return `${escapeHtml(authors)}, "${escapeHtml(source.title || 'Untitled')}," ${journal}${details ? `, ${details}` : ''}, ${year}.`
    }
    default: {
      if (source.type === 'journal') {
        const details = [source.volume, source.issue ? `(${source.issue})` : '', source.pages].filter(Boolean).join(', ')
        return `${escapeHtml(authors)} (${year}). ${escapeHtml(source.title || 'Untitled')}. ${journal}${details ? `, ${escapeHtml(details)}` : ''}.`
      }
      if (source.type === 'website') {
        const site = escapeHtml(source.website || '')
        return `${escapeHtml(authors)} (${year}). ${escapeHtml(source.title || 'Untitled')}.${site ? ` ${site}.` : ''}${source.url ? ` ${escapeHtml(source.url)}` : ''}`
      }
      return `${escapeHtml(authors)} (${year}). ${title}.${city ? ` ${city}:` : ''} ${publisher}.`
    }
  }
}

export function bibliographyHeading(style: CitationStyleId) {
  if (style === 'MLA') return 'Works Cited'
  if (style === 'IEEE') return 'References'
  return 'Bibliography'
}

export function collectCitationTags(editor: Editor) {
  const tags: string[] = []
  editor.state.doc.descendants((node) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (!href.startsWith(MARKERS.citation)) continue
      const tag = parseCitationHref(href).tag
      if (!tags.includes(tag)) tags.push(tag)
    }
    return true
  })
  return tags
}

export function insertCitation(editor: Editor, store: ReferenceStore, source: Source, locator = '') {
  const number = citationNumber(editor, source.tag)
  const text = formatInText(source, store.citationStyle, number, locator)
  const href = citationHref(source.tag, locator)
  editor.chain().focus().insertContent(`<a href="${href}">${escapeHtml(text)}</a>`).run()
  restyleCitations(editor, store)
}

export function restyleCitations(editor: Editor, store: ReferenceStore) {
  const link = editor.schema.marks.link
  if (!link) return 0
  type Item = { from: number; to: number; marks: PMNode['marks']; tag: string; locator: string; text: string }
  const items: Item[] = []
  const numbers = new Map<string, number>()
  let nextNumber = 1
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (!href.startsWith(MARKERS.citation)) continue
      const { tag, locator } = parseCitationHref(href)
      const source = sourceByTag(store, tag)
      let number = numbers.get(tag)
      if (number === undefined) {
        number = nextNumber
        numbers.set(tag, number)
        nextNumber += 1
      }
      const text = source ? formatInText(source, store.citationStyle, number, locator) : node.text || ''
      items.push({ from: pos, to: pos + node.nodeSize, marks: node.marks, tag, locator, text })
      break
    }
    return true
  })
  if (!items.length) return 0
  const tr = editor.state.tr
  for (let index = items.length - 1; index >= 0; index -= 1) {
    const item = items[index]
    tr.replaceWith(item.from, item.to, editor.schema.text(item.text, item.marks))
  }
  editor.view.dispatch(tr)
  return items.length
}

export function convertCitationsToStatic(editor: Editor) {
  const link = editor.schema.marks.link
  if (!link) return
  const ranges: { from: number; to: number }[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    for (const mark of node.marks) {
      if (mark.type.name !== 'link') continue
      const href = String(mark.attrs.href || '')
      if (href.startsWith(MARKERS.citation) || href.startsWith(MARKERS.bibTitle) || href.startsWith(MARKERS.bibEntry)) {
        ranges.push({ from: pos, to: pos + node.nodeSize })
        break
      }
    }
    return true
  })
  if (!ranges.length) return
  const tr = editor.state.tr
  for (const range of ranges) tr.removeMark(range.from, range.to, link)
  editor.view.dispatch(tr)
}

export function buildBibliographyHtml(editor: Editor, store: ReferenceStore) {
  const style = store.citationStyle
  const tags = collectCitationTags(editor)
  let sources = tags.map((tag) => sourceByTag(store, tag)).filter((source): source is Source => Boolean(source))
  if (style !== 'IEEE') {
    sources = [...sources].sort((left, right) => {
      const leftKey = `${firstAuthorLast(left)}${left.year}${left.title}`.toLowerCase()
      const rightKey = `${firstAuthorLast(right)}${right.year}${right.title}`.toLowerCase()
      return leftKey.localeCompare(rightKey)
    })
  }
  const heading = bibliographyHeading(style)
  let html = `<p><strong><span style="font-size: 17px; color: #2f5496"><a href="${MARKERS.bibTitle}">${heading}</a></span></strong></p>`
  if (!sources.length) {
    return `${html}<p><a href="${MARKERS.bibEntry}empty"><em>No sources cited yet.</em></a></p>`
  }
  sources.forEach((source) => {
    const entry = formatBibliographyEntry(source, style)
    const href = `${MARKERS.bibEntry}${encodeURIComponent(source.tag)}`
    html += `<p data-indent-left="0.5" data-first-line="-0.5" style="margin-top: 2px; margin-bottom: 4px"><a href="${href}">${entry}</a></p>`
  })
  return html
}

export function insertBibliography(editor: Editor, store: ReferenceStore) {
  const blocks = findMarkedBlocks(editor, MARKERS.bibTitle, MARKERS.bibEntry)
  const html = buildBibliographyHtml(editor, store)
  if (blocks.length) return replaceBlocks(editor, blocks, html)
  editor.chain().focus().insertContent(html).run()
  return true
}

export function updateBibliographies(editor: Editor, store: ReferenceStore) {
  const blocks = findMarkedBlocks(editor, MARKERS.bibTitle, MARKERS.bibEntry)
  if (!blocks.length) return false
  return replaceBlocks(editor, blocks, buildBibliographyHtml(editor, store))
}

export function syncCitationsAndBibliography(editor: Editor, store: ReferenceStore) {
  restyleCitations(editor, store)
  updateBibliographies(editor, store)
}

export type CaptionInfo = { id: string; label: string; labelText: string; text: string; pos: number; page: number }

export function collectCaptions(editor: Editor, label?: string): CaptionInfo[] {
  const captions: CaptionInfo[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== 'paragraph') return true
    let id = ''
    let labelText = ''
    node.descendants((child) => {
      if (!child.isText) return true
      for (const mark of child.marks) {
        if (mark.type.name !== 'link') continue
        const href = String(mark.attrs.href || '')
        if (href.startsWith(MARKERS.caption)) {
          id = href.slice(MARKERS.caption.length)
          labelText += child.textContent
        }
      }
      return true
    })
    if (!id) return false
    const full = textOf(node)
    const rest = full.startsWith(labelText) ? full.slice(labelText.length).replace(/^[:\s]+/, '').trim() : full
    const space = labelText.lastIndexOf(' ')
    const captionLabel = space > 0 ? labelText.slice(0, space) : labelText
    if (!label || captionLabel === label) {
      captions.push({ id, label: captionLabel, labelText, text: rest, pos, page: estimatePageForPos(editor, pos) })
    }
    return false
  })
  return captions
}

export type CaptionInput = {
  label: string
  text: string
  position: 'above' | 'below'
  excludeLabel: boolean
  format: NumberFormat
  includeChapter: boolean
  chapter: string
}

export function insertCaption(editor: Editor, input: CaptionInput) {
  const existing = collectCaptions(editor, input.label)
  const base = existing.length + 1
  const number = formatSequenceNumber(base, input.format)
  const withChapter = input.includeChapter && input.chapter ? `${input.chapter}-${number}` : number
  const labelText = input.excludeLabel ? '' : `${input.label} ${withChapter}`
  const id = uid('cap')
  const body = escapeHtml(input.text)
  const labelHtml = labelText
    ? `<a href="${MARKERS.caption}${id}">${escapeHtml(labelText)}</a>${body ? ': ' : ''}`
    : ''
  const html = `<p style="text-align: center">${labelHtml}${body}</p>`
  const { $from } = editor.state.selection
  const docSize = editor.state.doc.content.size
  let pos = docSize
  if ($from.depth > 0) pos = input.position === 'above' ? $from.before(1) : $from.after(1)
  editor.chain().focus().insertContentAt(pos, html).run()
  return { id, label: input.label, number: withChapter, text: input.text } as CaptionRecord
}

function figureEntries(editor: Editor, config: TofConfig) {
  return collectCaptions(editor, config.label).map((caption, index) => {
    const text = config.includeLabel
      ? `${caption.labelText}${caption.text ? `: ${caption.text}` : ''}`
      : caption.text || caption.labelText
    return { ...caption, index, display: text }
  })
}

export function buildTableOfFiguresHtml(editor: Editor, config: TofConfig) {
  const entries = figureEntries(editor, config)
  const heading = `Table of ${config.label === 'Figure' ? 'Figures' : config.label === 'Table' ? 'Tables' : config.label === 'Equation' ? 'Equations' : `${config.label}s`}`
  let html = `<p><strong><span style="font-size: 17px; color: #2f5496"><a href="${MARKERS.tofTitle}">${escapeHtml(heading)}</a></span></strong></p>`
  if (!entries.length) return `${html}<p><a href="${MARKERS.tofEntry}0"><em>No captions with the ${escapeHtml(config.label)} label were found.</em></a></p>`
  const leader = config.leader === 'none' ? '' : LEADERS.find((item) => item.id === config.leader)?.char || '.'
  entries.forEach((entry) => {
    const dots = config.showPageNumbers ? leaderText(76 - entry.display.length - String(entry.page).length, leader) : ''
    const page = config.showPageNumbers ? `<span>${config.rightAlign ? dots : ' '}${entry.page}</span>` : ''
    html += `<p style="margin-top: 2px; margin-bottom: 2px"><a href="${MARKERS.tofEntry}${entry.index}">${escapeHtml(entry.display)}</a>${page}</p>`
  })
  return html
}

export function insertTableOfFigures(editor: Editor, config: TofConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.tofTitle, MARKERS.tofEntry)
  const html = buildTableOfFiguresHtml(editor, config)
  if (blocks.length) return replaceBlocks(editor, blocks, html)
  editor.chain().focus().insertContent(html).run()
  return true
}

export function updateTableOfFigures(editor: Editor, config: TofConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.tofTitle, MARKERS.tofEntry)
  if (!blocks.length) return false
  return replaceBlocks(editor, blocks, buildTableOfFiguresHtml(editor, config))
}

export type CrossRefType = 'Heading' | 'Figure' | 'Table' | 'Bookmark'
export type CrossRefTarget = { id: string; label: string; text: string; page: number; pos: number; href: string }

export function collectCrossRefTargets(editor: Editor, store: ReferenceStore, type: CrossRefType): CrossRefTarget[] {
  if (type === 'Heading') {
    const entries = collectTocEntries(editor, 9)
    return entries.map((entry, index) => ({
      id: `heading-${index}`,
      label: entry.text,
      text: entry.text,
      page: estimatePageForPos(editor, entry.pos),
      pos: entry.pos,
      href: `${MARKERS.xref}heading-${index}`,
    }))
  }
  if (type === 'Bookmark') {
    return store.bookmarks.map((bookmark) => ({
      id: bookmark.id,
      label: bookmark.name,
      text: bookmark.name,
      page: bookmark.page,
      pos: 0,
      href: `${MARKERS.xref}${bookmark.id}`,
    }))
  }
  return collectCaptions(editor, type).map((caption) => ({
    id: caption.id,
    label: `${caption.labelText}${caption.text ? `: ${caption.text}` : ''}`,
    text: `${caption.labelText}${caption.text ? `: ${caption.text}` : ''}`,
    page: caption.page,
    pos: caption.pos,
    href: `${MARKERS.xref}${caption.id}`,
  }))
}

export function insertCrossRef(
  editor: Editor,
  target: CrossRefTarget,
  mode: string,
  hyperlink: boolean,
  aboveBelow: boolean,
) {
  const cursor = editor.state.selection.from
  let text = target.text
  if (mode === 'page') text = String(target.page)
  else if (mode === 'label') text = target.label.split(':')[0]
  else if (mode === 'caption') text = target.label.includes(':') ? target.label.split(':').slice(1).join(':').trim() : target.text
  else if (mode === 'above-below') text = target.pos < cursor ? 'above' : 'below'
  if (aboveBelow && mode !== 'above-below') text = `${text} (${target.pos < cursor ? 'above' : 'below'})`
  const html = hyperlink ? `<a href="${target.href}">${escapeHtml(text)}</a>` : escapeHtml(text)
  editor.chain().focus().insertContent(html).run()
}

export function addIndexEntry(
  store: ReferenceStore,
  data: { main: string; sub: string; crossRef: string; bold: boolean; italic: boolean; pageBold: boolean; pageItalic: boolean },
  page: number,
): ReferenceStore {
  const main = data.main.trim()
  const sub = data.sub.trim()
  if (!main) return store
  const existing = store.indexEntries.find(
    (entry) => entry.main.toLowerCase() === main.toLowerCase() && entry.sub.toLowerCase() === sub.toLowerCase(),
  )
  if (existing) {
    return {
      ...store,
      indexEntries: store.indexEntries.map((entry) =>
        entry.id === existing.id
          ? {
              ...entry,
              crossRef: data.crossRef || entry.crossRef,
              bold: data.bold,
              italic: data.italic,
              pageBold: data.pageBold,
              pageItalic: data.pageItalic,
              pages: entry.pages.includes(page) ? entry.pages : [...entry.pages, page].sort((a, b) => a - b),
            }
          : entry,
      ),
    }
  }
  return {
    ...store,
    indexEntries: [
      ...store.indexEntries,
      {
        id: uid('idx'),
        main,
        sub,
        crossRef: data.crossRef.trim(),
        bold: data.bold,
        italic: data.italic,
        pageBold: data.pageBold,
        pageItalic: data.pageItalic,
        pages: [page],
      },
    ],
  }
}

export function mergeIndexPages(store: ReferenceStore, main: string, sub: string, pages: number[]) {
  if (!pages.length) return store
  const existing = store.indexEntries.find(
    (entry) => entry.main.toLowerCase() === main.toLowerCase() && entry.sub.toLowerCase() === sub.toLowerCase(),
  )
  if (!existing) {
    return {
      ...store,
      indexEntries: [
        ...store.indexEntries,
        {
          id: uid('idx'),
          main,
          sub,
          crossRef: '',
          bold: false,
          italic: false,
          pageBold: false,
          pageItalic: false,
          pages: [...new Set(pages)].sort((a, b) => a - b),
        },
      ],
    }
  }
  return {
    ...store,
    indexEntries: store.indexEntries.map((entry) =>
      entry.id === existing.id ? { ...entry, pages: [...new Set([...entry.pages, ...pages])].sort((a, b) => a - b) } : entry,
    ),
  }
}

export function collectTermPages(editor: Editor, term: string) {
  if (!term.trim()) return []
  const needle = term.toLowerCase()
  const pages: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (!node.isText) return true
    if ((node.text || '').toLowerCase().includes(needle)) {
      const page = estimatePageForPos(editor, pos)
      if (!pages.includes(page)) pages.push(page)
    }
    return true
  })
  return pages.sort((a, b) => a - b)
}

function indexEntryInner(entry: IndexEntry, config: IndexConfig) {
  const main = entry.bold ? `<strong>${escapeHtml(entry.main)}</strong>` : escapeHtml(entry.main)
  const pageNumbers = entry.crossRef
    ? escapeHtml(entry.crossRef)
    : config.showPageNumbers
      ? entry.pages
          .map((page) => {
            const value = String(page)
            if (entry.pageBold && entry.pageItalic) return `<strong><em>${value}</em></strong>`
            if (entry.pageBold) return `<strong>${value}</strong>`
            if (entry.pageItalic) return `<em>${value}</em>`
            return value
          })
          .join(', ')
      : ''
  return { main, pageNumbers }
}

export function buildIndexHtml(store: ReferenceStore, config: IndexConfig) {
  const entries = [...store.indexEntries].sort((left, right) => {
    const key = left.main.localeCompare(right.main)
    return key !== 0 ? key : left.sub.localeCompare(right.sub)
  })
  let html = `<p><strong><span style="font-size: 17px; color: #2f5496"><a href="${MARKERS.indexTitle}">Index</a></span></strong></p>`
  if (!entries.length) return `${html}<p><a href="${MARKERS.indexEntry}empty"><em>No index entries. Use Mark Entry to add terms.</em></a></p>`
  if (config.type === 'run-in') {
    const grouped = new Map<string, IndexEntry[]>()
    entries.forEach((entry) => {
      const list = grouped.get(entry.main) || []
      list.push(entry)
      grouped.set(entry.main, list)
    })
    grouped.forEach((group, main) => {
      const first = group[0]
      const mainHtml = first.bold ? `<strong>${escapeHtml(main)}</strong>` : escapeHtml(main)
      const parts = group.map((entry) => {
        const { pageNumbers } = indexEntryInner(entry, config)
        const sub = entry.sub ? `${entry.italic ? `<em>${escapeHtml(entry.sub)}</em>` : escapeHtml(entry.sub)}${pageNumbers ? `, ${pageNumbers}` : ''}` : pageNumbers
        return sub
      })
      html += `<p><a href="${MARKERS.indexEntry}${first.id}">${mainHtml}</a>, ${parts.filter(Boolean).join('; ')}</p>`
    })
    return html
  }
  entries.forEach((entry) => {
    const { main, pageNumbers } = indexEntryInner(entry, config)
    html += `<p><a href="${MARKERS.indexEntry}${entry.id}">${main}</a>${pageNumbers ? ` .......... ${pageNumbers}` : ''}</p>`
    if (entry.sub) {
      const sub = entry.italic ? `<em>${escapeHtml(entry.sub)}</em>` : escapeHtml(entry.sub)
      html += `<p data-indent="1">${sub}${pageNumbers ? ` .......... ${pageNumbers}` : ''}</p>`
    }
  })
  return html
}

export function insertIndex(editor: Editor, store: ReferenceStore, config: IndexConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.indexTitle, MARKERS.indexEntry)
  const html = buildIndexHtml(store, config)
  if (blocks.length) return replaceBlocks(editor, blocks, html)
  editor.chain().focus().insertContent(html).run()
  return true
}

export function updateIndex(editor: Editor, store: ReferenceStore, config: IndexConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.indexTitle, MARKERS.indexEntry)
  if (!blocks.length) return false
  return replaceBlocks(editor, blocks, buildIndexHtml(store, config))
}

export function addAuthorityEntry(
  store: ReferenceStore,
  data: { selectedText: string; category: string; short: string; long: string },
  page: number,
): ReferenceStore {
  const short = data.short.trim() || data.selectedText.trim()
  const category = data.category || 'Other Authorities'
  if (!short) return store
  const existing = store.authorities.find(
    (entry) => entry.category === category && entry.short.toLowerCase() === short.toLowerCase(),
  )
  if (existing) {
    return {
      ...store,
      authorities: store.authorities.map((entry) =>
        entry.id === existing.id
          ? {
              ...entry,
              long: data.long || entry.long,
              selectedText: data.selectedText || entry.selectedText,
              pages: entry.pages.includes(page) ? entry.pages : [...entry.pages, page].sort((a, b) => a - b),
            }
          : entry,
      ),
    }
  }
  return {
    ...store,
    authorities: [
      ...store.authorities,
      { id: uid('toa'), selectedText: data.selectedText, category, short, long: data.long, pages: [page] },
    ],
  }
}

export function buildToaHtml(store: ReferenceStore, config: ToaConfig) {
  const entries = store.authorities
    .filter((entry) => config.category === 'All' || entry.category === config.category)
    .sort((left, right) => left.category.localeCompare(right.category) || left.short.localeCompare(right.short))
  let html = `<p><strong><span style="font-size: 17px; color: #2f5496"><a href="${MARKERS.toaTitle}">Table of Authorities</a></span></strong></p>`
  if (!entries.length) return `${html}<p><a href="${MARKERS.toaEntry}empty"><em>No citations marked. Use Mark Citation to add authorities.</em></a></p>`
  let currentCategory = ''
  entries.forEach((entry) => {
    if (currentCategory !== entry.category) {
      currentCategory = entry.category
      html += `<p><strong><span style="font-size: 13px; color: #2f5496">${escapeHtml(entry.category)}</span></strong></p>`
    }
    const pages = config.passim && entry.pages.length >= 5 ? 'passim' : entry.pages.join(', ')
    const citation = config.keepFormatting ? escapeHtml(entry.selectedText) : escapeHtml(entry.short)
    html += `<p data-indent="1"><a href="${MARKERS.toaEntry}${entry.id}">${citation}</a>${entry.long ? ` — ${escapeHtml(entry.long)}` : ''}${pages ? ` .......... ${pages}` : ''}</p>`
  })
  return html
}

export function insertTableOfAuthorities(editor: Editor, store: ReferenceStore, config: ToaConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.toaTitle, MARKERS.toaEntry)
  const html = buildToaHtml(store, config)
  if (blocks.length) return replaceBlocks(editor, blocks, html)
  editor.chain().focus().insertContent(html).run()
  return true
}

export function updateTableOfAuthorities(editor: Editor, store: ReferenceStore, config: ToaConfig) {
  const blocks = findMarkedBlocks(editor, MARKERS.toaTitle, MARKERS.toaEntry)
  if (!blocks.length) return false
  return replaceBlocks(editor, blocks, buildToaHtml(store, config))
}

export function sourceSummary(source: Source) {
  if (source.placeholder) return source.title || source.tag || 'Placeholder'
  return `${firstAuthorLast(source)}${source.year ? `, ${source.year}` : ''}${source.title ? ` — ${source.title}` : ''}`
}

export function citationStyleLabel(style: CitationStyleId) {
  return CITATION_STYLES.find((item) => item.id === style)?.label || style
}
