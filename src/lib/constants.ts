import type { CSSProperties } from 'react'

export const FONTS = [
  'Aptos',
  'Aptos Display',
  'Calibri',
  'Arial',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Cambria',
  'Segoe UI',
  'Tahoma',
  'Verdana',
  'Trebuchet MS',
  'Courier New',
  'Consolas',
  'Comic Sans MS',
  'Impact',
  'Franklin Gothic Medium',
  'Palatino Linotype',
  'Book Antiqua',
  'Lucida Console',
]

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72]

export const TEXT_COLORS = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200',
  '#22b14c', '#00a2e8', '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3',
  '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea',
  '#7092be', '#c8bfe7', '#2b579a', '#185abd', '#0f6cbd', '#2e74b5',
  '#c00000', '#548235', '#7030a0', '#833c00', '#1f4e79', '#375623',
]

export const HIGHLIGHT_COLORS = [
  '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#0000ff', '#ff0000',
  '#000080', '#008080', '#008000', '#800080', '#800000', '#808000',
  '#808080', '#c0c0c0', '#00b0f0', '#92d050',
]

export type StyleDef = {
  id: string
  label: string
  level?: 1 | 2 | 3 | 4
  sample: CSSProperties
}

export const STYLES: StyleDef[] = [
  { id: 'normal', label: 'Normal', sample: { fontSize: 15, fontFamily: 'Calibri' } },
  { id: 'noSpacing', label: 'No Spacing', sample: { fontSize: 13, fontFamily: 'Calibri' } },
  { id: 'h1', label: 'Heading', level: 1, sample: { fontSize: 20, color: '#2f5496', fontFamily: 'Calibri Light', fontWeight: 400 } },
  { id: 'h2', label: 'Heading 2', level: 2, sample: { fontSize: 17, color: '#2f5496', fontFamily: 'Calibri Light', fontWeight: 400 } },
  { id: 'h3', label: 'Heading 3', level: 3, sample: { fontSize: 15, color: '#1f3864', fontFamily: 'Calibri Light', fontWeight: 400 } },
  { id: 'h4', label: 'Heading 4', level: 4, sample: { fontSize: 13, color: '#2f5496', fontFamily: 'Calibri Light', fontStyle: 'italic' } },
  { id: 'title', label: 'Title', sample: { fontSize: 26, fontFamily: 'Calibri Light', letterSpacing: 1 } },
  { id: 'subtitle', label: 'Subtitle', sample: { fontSize: 17, color: '#5a5a5a', fontFamily: 'Calibri Light' } },
  { id: 'quote', label: 'Quote', sample: { fontSize: 14, fontStyle: 'italic', color: '#404040' } },
  { id: 'intenseQuote', label: 'Intense Quote', sample: { fontSize: 14, fontStyle: 'italic', color: '#2f5496' } },
]

export type ThemeDef = {
  id: string
  label: string
  bodyFont: string
  headingFont: string
  accent: string
}

export const THEMES: ThemeDef[] = [
  { id: 'office', label: 'Office', bodyFont: 'Calibri', headingFont: 'Calibri Light', accent: '#2b579a' },
  { id: 'aptos', label: 'Aptos', bodyFont: 'Aptos', headingFont: 'Aptos Display', accent: '#185abd' },
  { id: 'stdlib', label: 'Standard', bodyFont: 'Times New Roman', headingFont: 'Arial', accent: '#1f4e79' },
  { id: 'facet', label: 'Facet', bodyFont: 'Aptos', headingFont: 'Aptos Display', accent: '#0f6cbd' },
  { id: 'ion', label: 'Ion', bodyFont: 'Calibri', headingFont: 'Georgia', accent: '#44546a' },
  { id: 'organic', label: 'Organic', bodyFont: 'Georgia', headingFont: 'Palatino Linotype', accent: '#6b7b3f' },
  { id: 'wisp', label: 'Wisp', bodyFont: 'Arial', headingFont: 'Georgia', accent: '#5b9bd5' },
  { id: 'berlin', label: 'Berlin', bodyFont: 'Segoe UI', headingFont: 'Segoe UI Light', accent: '#c00000' },
]

export const PAGE_SIZES: Record<string, { label: string; w: number; h: number }> = {
  letter: { label: 'Letter (8.5" x 11")', w: 816, h: 1056 },
  legal: { label: 'Legal (8.5" x 14")', w: 816, h: 1344 },
  a4: { label: 'A4 (21cm x 29.7cm)', w: 794, h: 1123 },
  a3: { label: 'A3 (29.7cm x 42cm)', w: 1123, h: 1587 },
  a5: { label: 'A5 (14.8cm x 21cm)', w: 559, h: 794 },
  tabloid: { label: 'Tabloid (11" x 17")', w: 1056, h: 1632 },
}

export const MARGIN_PRESETS: Record<string, { label: string; top: number; right: number; bottom: number; left: number }> = {
  normal: { label: 'Normal', top: 96, right: 96, bottom: 96, left: 96 },
  narrow: { label: 'Narrow', top: 48, right: 48, bottom: 48, left: 48 },
  moderate: { label: 'Moderate', top: 96, right: 72, bottom: 96, left: 72 },
  wide: { label: 'Wide', top: 96, right: 192, bottom: 96, left: 192 },
  mirrored: { label: 'Mirrored', top: 96, right: 96, bottom: 96, left: 120 },
}

export const SYMBOLS = [
  '©', '®', '™', '§', '¶', '†', '‡', '•', '…', '—', '–', "'", '"', '"', '\u00A0',
  '€', '£', '¥', '¢', '°', '±', '×', '÷', '≠', '≤', '≥', '≈', '∞', '√', '∑', '∏',
  'π', 'µ', 'Ω', 'α', 'β', 'γ', 'δ', 'λ', 'σ', 'φ', '→', '←', '↑', '↓', '↔', '⇒',
  '★', '☆', '♦', '♣', '♥', '♠', '✓', '✗', '☺', '☹', '☼', '☂', '♫', '♭', '♯', '⌘',
]

export const LINE_SPACINGS = [
  { label: '1.0', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: '2.0', value: '2' },
  { label: '2.5', value: '2.5' },
  { label: '3.0', value: '3' },
]

