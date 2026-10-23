import { PAGE_BORDER_ART, mixHex } from './data'
import type {
  ColorSet,
  EffectDefinition,
  FontPair,
  PageBorderConfig,
  StyleSetDefinition,
  ThemeDefinition,
  WatermarkStyle,
} from './types'

const root = () => document.documentElement

function setVar(name: string, value: string) {
  root().style.setProperty(name, value)
}

function removeVar(name: string) {
  root().style.removeProperty(name)
}

export function applyFonts(fonts: FontPair) {
  setVar('--doc-heading-font', fonts.headingFont)
  setVar('--doc-body-font', fonts.bodyFont)
}

export function applyColors(set: ColorSet) {
  const colors = set.colors
  const names = ['dark-1', 'light-1', 'dark-2', 'light-2', 'accent-1', 'accent-2', 'accent-3', 'accent-4', 'accent-5', 'accent-6', 'hyperlink', 'followed']
  names.forEach((name, index) => setVar(`--doc-color-${name}`, colors[index]))
  setVar('--doc-accent', colors[4])
  setVar('--doc-accent-2', colors[5])
  setVar('--doc-accent-3', colors[6])
  setVar('--doc-link', colors[10])
  setVar('--doc-link-followed', colors[11])
  setVar('--doc-token-accent', colors[4])
  setVar('--doc-token-text', '#000000')
  setVar('--doc-token-dark', colors[2])
  setVar('--doc-token-muted', mixHex(colors[4], '#000000', 0.38))
  setVar('--doc-table-accent', colors[4])
  setVar('--doc-quote-border', colors[4])
  setVar('--doc-title-rule', colors[4])
}

function colorValue(token: 'accent' | 'text' | 'dark' | 'muted') {
  return `var(--doc-token-${token})`
}

export function applyStyleSet(set: StyleSetDefinition) {
  const title = set.title
  const heading = set.heading
  setVar('--doc-title-size', `${title.size}pt`)
  setVar('--doc-title-weight', String(title.weight))
  setVar('--doc-title-style', title.italic ? 'italic' : 'normal')
  setVar('--doc-title-spacing', `${title.spacing}px`)
  setVar('--doc-title-transform', title.transform)
  setVar('--doc-title-color', colorValue(title.color))
  setVar('--doc-title-border-width', title.border ? '1px' : '0px')
  setVar('--doc-title-border-color', 'var(--doc-token-accent)')
  setVar('--doc-heading-size', `${heading.size}pt`)
  setVar('--doc-heading-weight', String(heading.weight))
  setVar('--doc-heading-style', heading.italic ? 'italic' : 'normal')
  setVar('--doc-heading-spacing', `${heading.spacing}px`)
  setVar('--doc-heading-transform', heading.transform)
  setVar('--doc-heading-color', colorValue(heading.color))
  setVar('--doc-heading-border-width', heading.border ? '1px' : '0px')
  setVar('--doc-heading-border-color', 'var(--doc-token-accent)')
  setVar('--doc-h1-size', `${set.h1Size}pt`)
  setVar('--doc-h2-size', `${set.h2Size}pt`)
  setVar('--doc-h3-size', `${set.h3Size}pt`)
  setVar('--doc-style-line-height', String(set.lineHeight))
  setVar('--doc-style-para-before', `${set.before}pt`)
  setVar('--doc-style-para-after', `${set.after}pt`)
}

export function applyEffects(effect: EffectDefinition) {
  setVar('--doc-shape-shadow', effect.shadow)
  setVar('--doc-shape-filter', effect.filter)
  setVar('--doc-shape-outline', effect.outline)
  setVar('--doc-shape-radius', effect.radius)
}

export function applyParagraphSpacing(before: number, after: number, lineHeight: number) {
  setVar('--doc-spacing-before', `${before}pt`)
  setVar('--doc-spacing-after', `${after}pt`)
  setVar('--doc-line-height', String(lineHeight))
}

export function clearParagraphSpacing() {
  removeVar('--doc-spacing-before')
  removeVar('--doc-spacing-after')
  removeVar('--doc-line-height')
}

export function applyWatermark(style: WatermarkStyle | null) {
  if (!style || style.kind === 'none') {
    removeVar('--dw-image')
    removeVar('--dw-font-size')
    removeVar('--dw-color')
    removeVar('--dw-opacity')
    removeVar('--dw-rotate')
    removeVar('--dw-letter-spacing')
    removeVar('--dw-filter')
    removeVar('--dw-image-size')
    return
  }
  if (style.kind === 'picture' && style.image) {
    setVar('--dw-image', `url("${style.image}")`)
    setVar('--dw-font-size', '0px')
    setVar('--dw-color', 'transparent')
    setVar('--dw-opacity', style.washout ? '0.22' : '1')
    setVar('--dw-rotate', '0deg')
    setVar('--dw-letter-spacing', '0px')
    setVar('--dw-filter', style.washout ? 'grayscale(1)' : 'none')
    setVar('--dw-image-size', `${Math.max(10, style.scale)}%`)
    return
  }
  removeVar('--dw-image')
  setVar('--dw-font', style.font)
  setVar('--dw-font-size', `${style.size}px`)
  setVar('--dw-color', style.color)
  setVar('--dw-opacity', style.semitransparent ? '0.32' : '0.9')
  setVar('--dw-rotate', style.layout === 'horizontal' ? '0deg' : '-45deg')
  setVar('--dw-letter-spacing', style.layout === 'horizontal' ? '4px' : '6px')
  setVar('--dw-filter', 'none')
  setVar('--dw-image-size', '0%')
}

export function applyPageBorder(config: PageBorderConfig | null) {
  if (!config || config.setting === 'none') {
    removeVar('--dpb-inset')
    removeVar('--dpb-shadow')
    removeVar('--dpb-top')
    removeVar('--dpb-right')
    removeVar('--dpb-bottom')
    removeVar('--dpb-left')
    removeVar('--wp-border-image')
    removeVar('--wp-border-shadow')
    removeVar('--wp-border-width')
    removeVar('--wp-border-style')
    removeVar('--wp-border-color')
    removeVar('--wp-border-inset')
    return
  }
  const art = PAGE_BORDER_ART.find((item) => item.id === config.art)
  const lineStyle =
    config.setting === '3d' ? 'outset' : config.setting === 'shadow' ? 'solid' : config.style
  const sideOn = config.setting === 'custom' ? config.sides : { top: true, right: true, bottom: true, left: true }
  const sideValue = (on: boolean) => (on ? `${config.width}pt ${lineStyle} ${config.color}` : '0')
  setVar('--dpb-inset', `${config.inset}px`)
  setVar('--dpb-shadow', config.shadow || 'none')
  setVar('--dpb-top', sideValue(sideOn.top))
  setVar('--dpb-right', sideValue(sideOn.right))
  setVar('--dpb-bottom', sideValue(sideOn.bottom))
  setVar('--dpb-left', sideValue(sideOn.left))
  setVar('--wp-border-width', `${config.width}pt`)
  setVar('--wp-border-style', lineStyle)
  setVar('--wp-border-color', config.color)
  setVar('--wp-border-inset', `${config.inset}px`)
  setVar('--wp-border-shadow', config.shadow || 'none')
  if (art && art.image) setVar('--wp-border-image', art.image)
  else removeVar('--wp-border-image')
}

export function applyDesignTheme(theme: ThemeDefinition, fonts: FontPair, colors: ColorSet, style: StyleSetDefinition, effect: EffectDefinition) {
  applyFonts(fonts)
  applyColors(colors)
  applyStyleSet(style)
  applyEffects(effect)
  setVar('--doc-theme-name', theme.id)
}

export function applyFontOverride(fonts: FontPair) {
  applyFonts(fonts)
}

export function applyColorOverride(colors: ColorSet) {
  applyColors(colors)
}
