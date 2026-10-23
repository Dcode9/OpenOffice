import type {
  ColorSet,
  EffectDefinition,
  FontPair,
  PageBorderConfig,
  ParagraphPreset,
  StyleSetDefinition,
  TextStyleDefinition,
  ThemeDefinition,
  ThemePalette,
  WatermarkStyle,
} from './types'

export function mixHex(a: string, b: string, amount: number): string {
  const parse = (value: string) => {
    let hex = value.replace('#', '').trim()
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('')
    if (!/^[0-9a-f]{6}$/i.test(hex)) return [0, 0, 0]
    return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16))
  }
  const from = parse(a)
  const to = parse(b)
  const t = Math.max(0, Math.min(1, amount))
  return `#${from
    .map((v, i) => Math.round(v + (to[i] - v) * t).toString(16).padStart(2, '0'))
    .join('')}`
}

export function tint(color: string, amount: number) {
  return mixHex(color, '#ffffff', amount)
}

export function shade(color: string, amount: number) {
  return mixHex(color, '#000000', amount)
}

function palette(accent: string, second: string, third: string): ThemePalette {
  return [
    '#000000',
    '#ffffff',
    shade(accent, 0.62),
    '#e7e6e6',
    accent,
    second,
    third,
    tint(third, 0.34),
    shade(accent, 0.26),
    tint(second, 0.4),
    '#0563c1',
    '#954f72',
  ]
}

type ThemeSeed = [string, string, string, string, string, string, string, string]

const THEME_SEEDS: ThemeSeed[] = [
  ['office', 'Office', 'Calibri Light', 'Calibri', '#2b579a', '#ed7d31', '#a5a5a5', 'office'],
  ['berlin', 'Berlin', 'Segoe UI Light', 'Segoe UI', '#c00000', '#44546a', '#d9b300', 'subtle'],
  ['circuit', 'Circuit', 'Arial', 'Arial', '#1f6f6b', '#9e480e', '#4f6b2a', 'glow'],
  ['damask', 'Damask', 'Palatino Linotype', 'Calibri', '#8e3b46', '#b58b3c', '#5b6c5d', 'soft'],
  ['dividend', 'Dividend', 'Georgia', 'Calibri', '#7a5c3e', '#4f7f8c', '#a54b3c', 'bevel'],
  ['droplet', 'Droplet', 'Calibri Light', 'Calibri', '#0f6cbd', '#39a6a3', '#7a8ca8', 'soft'],
  ['facet', 'Facet', 'Aptos Display', 'Aptos', '#0f6cbd', '#c55a11', '#6b7f3a', 'office'],
  ['feathered', 'Feathered', 'Garamond', 'Garamond', '#7b5b3a', '#4d6b5a', '#9a6b4f', 'soft'],
  ['gallery', 'Gallery', 'Calibri Light', 'Calibri', '#44546a', '#c55a11', '#7f7f7f', 'subtle'],
  ['headline', 'Headline', 'Franklin Gothic Medium', 'Calibri', '#1f3864', '#c00000', '#7f7f7f', 'bevel'],
  ['ion', 'Ion', 'Georgia', 'Calibri', '#44546a', '#4472c4', '#ed7d31', 'office'],
  ['main-event', 'Main Event', 'Impact', 'Calibri', '#a6192e', '#2f2f2f', '#d4a017', 'intense'],
  ['mesh', 'Mesh', 'Corbel', 'Corbel', '#5b7f95', '#b28b6b', '#6f7f5c', 'soft'],
  ['organic', 'Organic', 'Palatino Linotype', 'Georgia', '#6b7b3f', '#a86f45', '#5f7f7a', 'soft'],
  ['retrospect', 'Retrospect', 'Century Gothic', 'Calibri', '#7a3e65', '#c48b3a', '#49777a', 'subtle'],
  ['savon', 'Savon', 'Candara', 'Candara', '#8a5a7a', '#4f7f8c', '#b08a4a', 'soft'],
  ['slice', 'Slice', 'Arial', 'Calibri', '#1f4e79', '#ff8b2b', '#8b1e2d', 'bevel'],
  ['vapor-trail', 'Vapor Trail', 'Candara', 'Candara', '#46647f', '#7fa6b8', '#b7a17c', 'glow'],
  ['view', 'View', 'Corbel', 'Corbel', '#1f6c8a', '#a7a7a7', '#d08b2c', 'office'],
  ['wisp', 'Wisp', 'Georgia', 'Arial', '#5b9bd5', '#a5a5a5', '#70ad47', 'glow'],
  ['woodland', 'Woodland', 'Georgia', 'Calibri', '#4f6b2a', '#8b5e34', '#3e6b66', 'soft'],
  ['apex', 'Apex', 'Arial', 'Arial', '#1f3864', '#c00000', '#808080', 'bevel'],
  ['aspect', 'Aspect', 'Verdana', 'Verdana', '#1f6f6b', '#e07b39', '#6e7b8b', 'office'],
  ['celestial', 'Celestial', 'Garamond', 'Garamond', '#5b4b8a', '#8b6b3f', '#4f7f7a', 'glow'],
  ['concourse', 'Concourse', 'Trebuchet MS', 'Trebuchet MS', '#1f5c8a', '#c24b3f', '#b08a3e', 'subtle'],
  ['depth', 'Depth', 'Arial Narrow', 'Arial', '#17365d', '#2e75b6', '#7f7f7f', 'intense'],
  ['integral', 'Integral', 'Impact', 'Calibri', '#7f1d1d', '#1f2937', '#c28b18', 'bevel'],
  ['metropolitan', 'Metropolitan', 'Georgia', 'Calibri', '#4a5a6a', '#a06b3f', '#5f7f6a', 'office'],
  ['mosaic', 'Mosaic', 'Candara', 'Candara', '#5d4a8a', '#2f8a8a', '#c07a2b', 'glow'],
  ['solstice', 'Solstice', 'Calibri Light', 'Calibri', '#8a6d3b', '#3f6b7f', '#a0443f', 'soft'],
]

export const THEMES: ThemeDefinition[] = THEME_SEEDS.map(
  ([id, label, headingFont, bodyFont, accent, second, third, effectId]) => ({
    id,
    label,
    headingFont,
    bodyFont,
    accent,
    colors: palette(accent, second, third),
    effectId,
  }),
)

function extraColorSet(id: string, label: string, colors: ThemePalette): ColorSet {
  return { id, label, colors }
}

const gray = ['#000000', '#ffffff', '#404040', '#d9d9d9', '#7f7f7f', '#a6a6a6', '#bfbfbf', '#d9d9d9', '#595959', '#f2f2f2', '#0563c1', '#954f72'] as ThemePalette

export const COLOR_SETS: ColorSet[] = [
  ...THEMES.map((theme) => ({ id: theme.id, label: theme.label, colors: theme.colors })),
  extraColorSet('grayscale', 'Grayscale', gray),
  extraColorSet('blue-warm', 'Blue Warm', palette('#1f6feb', '#4c9aff', '#8fbaff')),
  extraColorSet('blue-green', 'Blue Green', palette('#1f7a6b', '#2fa39a', '#7ec8c2')),
  extraColorSet('green', 'Green', palette('#4f7f3f', '#78a55a', '#a8c98a')),
  extraColorSet('gold', 'Gold', palette('#b58a2b', '#d4ad49', '#ead58a')),
  extraColorSet('red', 'Red', palette('#c0392b', '#e05a4d', '#ee9a91')),
  extraColorSet('violet', 'Violet', palette('#6b4fa0', '#8a71bd', '#b7a5df')),
  extraColorSet('orange', 'Orange', palette('#c55a11', '#e07b39', '#f0a878')),
]

const classicFonts: FontPair[] = [
  { id: 'font-calibri', label: 'Calibri', headingFont: 'Calibri Light', bodyFont: 'Calibri' },
  { id: 'font-cambria', label: 'Cambria', headingFont: 'Cambria', bodyFont: 'Calibri' },
  { id: 'font-georgia', label: 'Georgia', headingFont: 'Georgia', bodyFont: 'Calibri' },
  { id: 'font-arial', label: 'Arial', headingFont: 'Arial', bodyFont: 'Arial' },
  { id: 'font-times', label: 'Times New Roman', headingFont: 'Times New Roman', bodyFont: 'Times New Roman' },
  { id: 'font-garamond', label: 'Garamond', headingFont: 'Garamond', bodyFont: 'Garamond' },
  { id: 'font-segoe', label: 'Segoe UI', headingFont: 'Segoe UI Light', bodyFont: 'Segoe UI' },
  { id: 'font-aptos', label: 'Aptos', headingFont: 'Aptos Display', bodyFont: 'Aptos' },
]

export const FONT_PAIRS: FontPair[] = [
  ...THEMES.map((theme) => ({
    id: theme.id,
    label: theme.label,
    headingFont: theme.headingFont,
    bodyFont: theme.bodyFont,
  })),
  ...classicFonts,
]

function textStyle(overrides: Partial<TextStyleDefinition> = {}): TextStyleDefinition {
  return {
    size: 15,
    weight: 400,
    italic: false,
    transform: 'none',
    spacing: 0,
    color: 'accent',
    border: false,
    ...overrides,
  }
}

const baseStyle = {
  title: textStyle({ size: 28, weight: 400, spacing: 0, color: 'accent' }),
  heading: textStyle({ size: 15, weight: 400, spacing: 0, color: 'accent' }),
  h1Size: 20,
  h2Size: 16,
  h3Size: 13,
  lineHeight: 1.08,
  before: 0,
  after: 8,
}

function styleSet(
  id: string,
  label: string,
  overrides: Partial<Omit<StyleSetDefinition, 'title' | 'heading'>> & {
    title?: Partial<TextStyleDefinition>
    heading?: Partial<TextStyleDefinition>
  } = {},
): StyleSetDefinition {
  return {
    id,
    label,
    ...baseStyle,
    ...overrides,
    title: { ...baseStyle.title, ...overrides.title },
    heading: { ...baseStyle.heading, ...overrides.heading },
  }
}

export const STYLE_SETS: StyleSetDefinition[] = [
  styleSet('default', 'Default'),
  styleSet('standard', 'Standard', { title: { size: 26, weight: 600 }, heading: { size: 14, weight: 600 } }),
  styleSet('basic-elegant', 'Basic (Elegant)', {
    title: { size: 30, weight: 300, spacing: 1.2 },
    heading: { size: 15, weight: 300, spacing: 0.4 },
    h1Size: 21,
  }),
  styleSet('basic-simple', 'Basic (Simple)', {
    title: { size: 25, weight: 400, color: 'text' },
    heading: { size: 14, weight: 400, color: 'text' },
    h1Size: 18,
    h2Size: 15,
  }),
  styleSet('basic-smart', 'Basic (Smart)', {
    title: { size: 27, weight: 600, color: 'dark' },
    heading: { size: 14, weight: 600, color: 'accent' },
    lineHeight: 1.12,
  }),
  styleSet('basic-traditional', 'Basic (Traditional)', {
    title: { size: 24, weight: 400, color: 'text' },
    heading: { size: 14, weight: 700, color: 'dark' },
    lineHeight: 1.2,
  }),
  styleSet('casual', 'Casual', {
    title: { size: 28, weight: 600, italic: true, color: 'accent' },
    heading: { size: 15, weight: 600, italic: true, color: 'accent' },
    lineHeight: 1.18,
  }),
  styleSet('classic', 'Classic', {
    title: { size: 26, weight: 400, spacing: 1.6, color: 'dark' },
    heading: { size: 14, weight: 400, spacing: 0.7, color: 'dark' },
    lineHeight: 1.24,
  }),
  styleSet('contemporary', 'Contemporary', {
    title: { size: 29, weight: 300, transform: 'uppercase', spacing: 2.4 },
    heading: { size: 14, weight: 500, transform: 'uppercase', spacing: 1.2 },
    lineHeight: 1.3,
  }),
  styleSet('elegant', 'Elegant', {
    title: { size: 31, weight: 300, italic: true, spacing: 1.2 },
    heading: { size: 16, weight: 300, italic: true, spacing: 0.5 },
    h1Size: 22,
    lineHeight: 1.32,
  }),
  styleSet('fancy', 'Fancy', {
    title: { size: 30, weight: 700, italic: true, color: 'accent', border: true },
    heading: { size: 16, weight: 700, italic: true, color: 'accent', border: true },
    lineHeight: 1.2,
  }),
  styleSet('formal', 'Formal', {
    title: { size: 24, weight: 400, transform: 'uppercase', spacing: 2.2, color: 'dark' },
    heading: { size: 13, weight: 700, transform: 'uppercase', spacing: 1.4, color: 'dark' },
    lineHeight: 1.5,
    after: 10,
  }),
  styleSet('manuscript', 'Manuscript', {
    title: { size: 23, weight: 400, color: 'text' },
    heading: { size: 14, weight: 400, italic: true, color: 'text' },
    lineHeight: 2,
    after: 0,
  }),
  styleSet('modern', 'Modern', {
    title: { size: 30, weight: 700, color: 'accent' },
    heading: { size: 15, weight: 700, color: 'accent' },
    h1Size: 21,
    lineHeight: 1.15,
  }),
  styleSet('newsletter', 'Newsletter', {
    title: { size: 27, weight: 600, color: 'dark' },
    heading: { size: 15, weight: 700, color: 'accent', transform: 'uppercase', spacing: 0.6 },
    lineHeight: 1.24,
  }),
  styleSet('original', 'Original', {
    title: { size: 28, weight: 400 },
    heading: { size: 15, weight: 400 },
  }),
  styleSet('simple', 'Simple', {
    title: { size: 26, weight: 400, color: 'text' },
    heading: { size: 14, weight: 400, color: 'text' },
    h1Size: 18,
    h2Size: 15,
    lineHeight: 1.2,
  }),
  styleSet('traditional', 'Traditional', {
    title: { size: 25, weight: 400, color: 'text', border: true },
    heading: { size: 14, weight: 700, color: 'dark', border: true },
    lineHeight: 1.35,
  }),
  styleSet('word-2003', 'Word 2003', {
    title: { size: 26, weight: 400, color: 'dark' },
    heading: { size: 14, weight: 700, color: 'dark' },
    h1Size: 18,
  }),
  styleSet('word-2010', 'Word 2010', {
    title: { size: 28, weight: 300, color: 'accent' },
    heading: { size: 15, weight: 400, color: 'accent' },
  }),
  styleSet('word-2013', 'Word 2013', {
    title: { size: 28, weight: 300, color: 'accent', spacing: 0.6 },
    heading: { size: 15, weight: 400, color: 'accent' },
    h1Size: 20,
  }),
  styleSet('word-2016', 'Word 2016', {
    title: { size: 27, weight: 600, color: 'accent' },
    heading: { size: 15, weight: 600, color: 'accent' },
    h1Size: 20,
  }),
]

export const PARAGRAPH_PRESETS: ParagraphPreset[] = [
  { id: 'none', label: 'No Paragraph Space', before: 0, after: 0, lineHeight: 1, preview: 'none' },
  { id: 'compact', label: 'Compact', before: 0, after: 4, lineHeight: 1, preview: 'compact' },
  { id: 'tight', label: 'Tight', before: 0, after: 6, lineHeight: 1.15, preview: 'tight' },
  { id: 'open', label: 'Open', before: 0, after: 10, lineHeight: 1.15, preview: 'open' },
  { id: 'relaxed', label: 'Relaxed', before: 0, after: 6, lineHeight: 1.5, preview: 'relaxed' },
  { id: 'double', label: 'Double', before: 0, after: 8, lineHeight: 2, preview: 'double' },
]

function effect(
  id: string,
  label: string,
  shadow: string,
  filter = 'none',
  outline = 'none',
  radius = '2px',
): EffectDefinition {
  return { id, label, shadow, filter, outline, radius }
}

export const EFFECTS: EffectDefinition[] = [
  effect('office', 'Office', '0 2px 4px rgba(0,0,0,.28)', 'none', 'none', '2px'),
  effect('office-2013', 'Office 2013', '0 1px 2px rgba(0,0,0,.22)', 'none', 'none', '0'),
  effect('subtle', 'Subtle Shadow', '0 1px 2px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.04)', 'none', 'none', '0'),
  effect('banded', 'Banded Edge', 'inset 0 0 0 2px rgba(255,255,255,.35), 0 2px 4px rgba(0,0,0,.25)', 'none', 'none', '0'),
  effect('smokey', 'Smoky Glass', '0 5px 12px rgba(0,0,0,.34)', 'blur(.15px)', '1px solid rgba(255,255,255,.55)', '4px'),
  effect('glow', 'Glow Edge', '0 0 8px rgba(74,158,255,.75)', 'none', 'none', '0'),
  effect('grunge', 'Grunge Texture', '2px 2px 0 rgba(0,0,0,.28)', 'contrast(1.08) saturate(.9)', '1px solid rgba(0,0,0,.25)', '0'),
  effect('frosted', 'Frosted Glass', '0 4px 14px rgba(255,255,255,.28), 0 2px 5px rgba(0,0,0,.2)', 'blur(.2px)', '1px solid rgba(255,255,255,.7)', '6px'),
  effect('top-shadow', 'Top Shadow', '0 -3px 6px rgba(0,0,0,.3)', 'none', 'none', '0'),
  effect('inset', 'Inset', 'inset 0 3px 8px rgba(0,0,0,.35)', 'none', 'none', '0'),
  effect('mirror', 'Mirror', '0 3px 5px rgba(0,0,0,.2)', 'none', 'none', '0'),
  effect('reflection', 'Reflection', '0 9px 8px -6px rgba(0,0,0,.34)', 'none', 'none', '0'),
  effect('extreme', 'Extreme Shadow', '8px 8px 0 rgba(0,0,0,.32)', 'none', 'none', '0'),
  effect('glossy', 'Glossy', 'inset 0 8px 12px rgba(255,255,255,.55), 0 4px 8px rgba(0,0,0,.28)', 'saturate(1.15)', '1px solid rgba(255,255,255,.5)', '12px'),
  effect('bevel', 'Bevel', 'inset 2px 2px 0 rgba(255,255,255,.7), inset -2px -2px 0 rgba(0,0,0,.3)', 'none', 'none', '3px'),
  effect('intense', 'Intense', '0 10px 24px rgba(0,0,0,.42)', 'contrast(1.05)', '2px solid rgba(255,255,255,.35)', '0'),
  effect('soft', 'Soft Edge', '0 4px 16px rgba(0,0,0,.2)', 'blur(.4px)', 'none', '18px'),
  effect('paper', 'Paper', '0 2px 3px rgba(0,0,0,.18), 0 0 12px rgba(255,255,255,.7) inset', 'sepia(.05)', '1px solid rgba(0,0,0,.12)', '0'),
  effect('metro', 'Metro', '0 0 0 2px rgba(31,108,189,.6)', 'none', 'none', '0'),
  effect('solstice', 'Solstice', '0 6px 18px rgba(138,109,59,.36)', 'saturate(1.06)', '1px solid rgba(138,109,59,.35)', '8px'),
]

export const STANDARD_COLORS = [
  '#c00000',
  '#ff0000',
  '#ffc000',
  '#ffff00',
  '#92d050',
  '#00b050',
  '#00b0f0',
  '#0070c0',
  '#002060',
  '#7030a0',
]

export const THEME_COLOR_LABELS = [
  'Text/Background - Dark 1',
  'Text/Background - Light 1',
  'Text/Background - Dark 2',
  'Text/Background - Light 2',
  'Accent 1',
  'Accent 2',
  'Accent 3',
  'Accent 4',
  'Accent 5',
  'Accent 6',
]

export function colorColumns(colors: ThemePalette): string[][] {
  const base = colors.slice(0, 10)
  const levels = ['', 'Lighter 80%', 'Lighter 60%', 'Lighter 40%', 'Darker 25%', 'Darker 50%']
  return base.map((color, index) => {
    if (index === 0) return ['#000000', '#262626', '#404040', '#595959', '#000000', '#000000']
    if (index === 1) return ['#ffffff', '#ffffff', '#ffffff', '#ffffff', '#f2f2f2', '#d9d9d9']
    return [
      color,
      mixHex(color, '#ffffff', 0.8),
      mixHex(color, '#ffffff', 0.6),
      mixHex(color, '#ffffff', 0.4),
      mixHex(color, '#000000', 0.25),
      mixHex(color, '#000000', 0.5),
    ]
  })
}

export const THEME_COLOR_LEVELS = ['', 'Lighter 80%', 'Lighter 60%', 'Lighter 40%', 'Darker 25%', 'Darker 50%']

export type PageBorderArt = {
  id: string
  label: string
  image: string
}

export const PAGE_BORDER_ART: PageBorderArt[] = [
  { id: 'none', label: '(none)', image: '' },
  {
    id: 'confetti',
    label: 'Confetti',
    image:
      'repeating-linear-gradient(45deg, #2f5597 0 5px, transparent 5px 11px, #c00000 11px 16px, transparent 16px 24px)',
  },
  {
    id: 'zigzag',
    label: 'Zig Zag',
    image: 'repeating-linear-gradient(135deg, #2f5597 0 6px, transparent 6px 12px)',
  },
  {
    id: 'chain',
    label: 'Chain',
    image:
      'repeating-linear-gradient(90deg, #7f7f7f 0 3px, transparent 3px 8px, #bfbfbf 8px 11px, transparent 11px 16px)',
  },
  {
    id: 'hearts',
    label: 'Hearts',
    image:
      'radial-gradient(circle at 25% 25%, #c00000 0 2px, transparent 2.5px), radial-gradient(circle at 75% 75%, #c00000 0 2px, transparent 2.5px)',
  },
  {
    id: 'forest',
    label: 'Forest',
    image:
      'repeating-linear-gradient(90deg, #375623 0 4px, transparent 4px 9px, #548235 9px 13px, transparent 13px 18px)',
  },
  {
    id: 'stars',
    label: 'Stars',
    image:
      'radial-gradient(circle, #bf9000 0 1.5px, transparent 2px), repeating-linear-gradient(45deg, transparent 0 10px, rgba(191,144,0,.4) 10px 11px)',
  },
  {
    id: 'vines',
    label: 'Vines',
    image:
      'repeating-linear-gradient(45deg, #548235 0 3px, transparent 3px 9px), repeating-linear-gradient(-45deg, #7f9a5a 0 2px, transparent 2px 11px)',
  },
  {
    id: 'wave',
    label: 'Waves',
    image:
      'repeating-radial-gradient(circle at 0 0, transparent 0 8px, #2e74b5 8px 10px, transparent 10px 18px)',
  },
  {
    id: 'dots',
    label: 'Polka Dots',
    image: 'radial-gradient(circle, #a349a4 0 2px, transparent 2.5px)',
  },
  {
    id: 'stripes',
    label: 'Stripes',
    image: 'repeating-linear-gradient(90deg, #c55a11 0 3px, transparent 3px 9px)',
  },
  {
    id: 'holiday',
    label: 'Holiday',
    image:
      'repeating-linear-gradient(45deg, #c00000 0 4px, transparent 4px 10px), repeating-linear-gradient(-45deg, #375623 0 4px, transparent 4px 10px)',
  },
]

export const FONT_OPTIONS = [
  'Aptos',
  'Aptos Display',
  'Calibri',
  'Calibri Light',
  'Cambria',
  'Candara',
  'Corbel',
  'Courier New',
  'Georgia',
  'Garamond',
  'Impact',
  'Palatino Linotype',
  'Segoe UI',
  'Segoe UI Light',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
]

export const DEFAULT_WATERMARK: WatermarkStyle = {
  kind: 'text',
  text: 'DRAFT',
  font: 'Calibri',
  size: 90,
  color: '#b4b4b4',
  semitransparent: true,
  layout: 'diagonal',
  image: '',
  scale: 100,
  washout: true,
}

export const DEFAULT_PAGE_BORDER: PageBorderConfig = {
  setting: 'box',
  style: 'solid',
  color: '#2f5496',
  width: 1,
  art: 'none',
  inset: 18,
  sides: { top: true, right: true, bottom: true, left: true },
  shadow: 'none',
}

export function themeById(id: string, extra: ThemeDefinition[] = []): ThemeDefinition {
  return [...THEMES, ...extra].find((theme) => theme.id === id) ?? THEMES[0]
}

export function colorSetById(id: string, extra: ColorSet[] = []): ColorSet {
  return [...COLOR_SETS, ...extra].find((set) => set.id === id) ?? COLOR_SETS[0]
}

export function fontPairById(id: string, extra: FontPair[] = []): FontPair {
  return [...FONT_PAIRS, ...extra].find((pair) => pair.id === id) ?? FONT_PAIRS[0]
}

export function styleSetById(id: string): StyleSetDefinition {
  return STYLE_SETS.find((set) => set.id === id) ?? STYLE_SETS[0]
}

export function effectById(id: string): EffectDefinition {
  return EFFECTS.find((item) => item.id === id) ?? EFFECTS[0]
}

export function watermarkFromPreset(text: string, layout: 'diagonal' | 'horizontal'): WatermarkStyle {
  return {
    ...DEFAULT_WATERMARK,
    kind: 'text',
    text,
    layout,
    image: '',
  }
}
