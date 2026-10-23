import type { Editor } from '@tiptap/react'
import { setCellAttrs, setTextStyle, updateSelectedBlocks } from './actions'

export type BorderStyleId =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'triple'
  | 'wave'
  | 'dashDot'
  | 'dotDash'

export type BorderSetting = 'none' | 'box' | 'shadow' | '3d' | 'custom'

export type BorderSide = 'top' | 'bottom' | 'left' | 'right'

export type BorderOptions = {
  setting: BorderSetting
  sides: BorderSide[]
  style: BorderStyleId
  color: string
  width: number
  offset?: number
}

export type ShadingPatternId =
  | 'clear'
  | 'solid'
  | 'p5'
  | 'p10'
  | 'p20'
  | 'p25'
  | 'p30'
  | 'p40'
  | 'p50'
  | 'p60'
  | 'p70'
  | 'p75'
  | 'p80'
  | 'p90'
  | 'lightHorizontal'
  | 'lightVertical'
  | 'lightDownward'
  | 'lightUpward'
  | 'darkHorizontal'
  | 'darkVertical'
  | 'darkDownward'
  | 'darkUpward'
  | 'cross'
  | 'diagCross'

export type TextFillMode = 'none' | 'solid' | 'gradient' | 'texture'
export type TextOutlineMode = 'none' | 'solid' | 'gradient'

export type TextFillState = {
  mode: TextFillMode
  color: string
  color2: string
  angle: number
  type: 'linear' | 'radial' | 'rectangular' | 'path'
  transparency: number
  texture?: string
}

export type TextOutlineState = {
  mode: TextOutlineMode
  color: string
  color2: string
  angle: number
  width: number
  dash: string
  transparency: number
  compound: string
  cap: string
  join: string
}

export type ShadowState = {
  preset: string
  color: string
  transparency: number
  size: number
  blur: number
  angle: number
  distance: number
}

export type ReflectionState = {
  preset: string
  transparency: number
  size: number
  blur: number
  distance: number
}

export type GlowState = {
  preset: string
  color: string
  size: number
  transparency: number
}

export type SoftEdgesState = {
  preset: string
  size: number
}

export type ThreeDFormatState = {
  preset: string
  topBevel: string
  bottomBevel?: string
  width: number
  height: number
  depth: number
  depthColor: string
  contour: number
  contourColor: string
  material: string
  lighting: string
  angle: number
}

export type ThreeDRotationState = {
  preset: string
  x: number
  y: number
  z: number
  perspective: number
}

export type TextBorderState = {
  setting: BorderSetting
  color: string
  width: number
  style: BorderStyleId
  sides: BorderSide[]
  offset?: number
}

export type TextShadingState = {
  color: string
  pattern: ShadingPatternId
  patternColor: string
}

export type TextStyleState = {
  fill: TextFillState
  outline: TextOutlineState
  shadow: ShadowState | null
  reflection: ReflectionState | null
  glow: GlowState | null
  softEdges: SoftEdgesState | null
  threeDFormat: ThreeDFormatState | null
  threeDRotation: ThreeDRotationState | null
  border: TextBorderState | null
  shading: TextShadingState | null
  legacyShadow: string | null
}

export const BORDER_WIDTHS = [0.25, 0.5, 0.75, 1, 1.5, 2.25, 3, 4.5, 6]

export const BORDER_STYLES: { id: BorderStyleId; label: string; css: string }[] = [
  { id: 'solid', label: 'Solid', css: 'solid' },
  { id: 'dashed', label: 'Dashed', css: 'dashed' },
  { id: 'dotted', label: 'Dotted', css: 'dotted' },
  { id: 'double', label: 'Double', css: 'double' },
  { id: 'triple', label: 'Triple', css: 'double' },
  { id: 'wave', label: 'Wave', css: 'dashed' },
  { id: 'dashDot', label: 'Dash Dot', css: 'dashed' },
  { id: 'dotDash', label: 'Dot Dash', css: 'dotted' },
]

export const BORDER_COLORS = [
  '#000000', '#404040', '#7f7f7f', '#bfbfbf', '#ffffff', '#c00000',
  '#ff0000', '#ff7f27', '#ffc000', '#ffff00', '#92d050', '#00b050',
  '#00b0f0', '#0070c0', '#002060', '#7030a0', '#833c00', '#548235',
  '#2f5496', '#1f3864', '#d9e2f3', '#b4c6e7', '#8faadc', '#4472c4',
]

export const FILL_COLORS = [
  '#ffffff', '#f2f2f2', '#d9d9d9', '#bfbfbf', '#a6a6a6', '#808080',
  '#595959', '#262626', '#fff2cc', '#ffe699', '#ffd966', '#ffc000',
  '#fbe5d6', '#f8cbad', '#ed7d31', '#c55a11', '#e2f0d9', '#c6e0b4',
  '#a9d08e', '#70ad47', '#548235', '#d9e2f3', '#b4c6e7', '#8faadc',
  '#4472c4', '#2f5597', '#e4dfec', '#ccc0da', '#b4a7d6', '#8064a2',
]

export const SHADING_PATTERNS: { id: ShadingPatternId; label: string }[] = [
  { id: 'clear', label: 'Clear' },
  { id: 'solid', label: 'Solid' },
  { id: 'p5', label: '5%' },
  { id: 'p10', label: '10%' },
  { id: 'p20', label: '20%' },
  { id: 'p25', label: '25%' },
  { id: 'p30', label: '30%' },
  { id: 'p40', label: '40%' },
  { id: 'p50', label: '50%' },
  { id: 'p60', label: '60%' },
  { id: 'p70', label: '70%' },
  { id: 'p75', label: '75%' },
  { id: 'p80', label: '80%' },
  { id: 'p90', label: '90%' },
  { id: 'lightHorizontal', label: 'Light Horizontal' },
  { id: 'lightVertical', label: 'Light Vertical' },
  { id: 'lightDownward', label: 'Light Downward Diagonal' },
  { id: 'lightUpward', label: 'Light Upward Diagonal' },
  { id: 'darkHorizontal', label: 'Dark Horizontal' },
  { id: 'darkVertical', label: 'Dark Vertical' },
  { id: 'darkDownward', label: 'Dark Downward Diagonal' },
  { id: 'darkUpward', label: 'Dark Upward Diagonal' },
  { id: 'cross', label: 'Cross' },
  { id: 'diagCross', label: 'Diagonal Cross' },
]

export function defaultTextStyleState(): TextStyleState {
  return {
    fill: { mode: 'solid', color: '#000000', color2: '#4472c4', angle: 90, type: 'linear', transparency: 0, texture: 'parchment' },
    outline: { mode: 'none', color: '#2f5496', color2: '#c00000', angle: 90, width: 1, dash: 'solid', transparency: 0, compound: 'simple', cap: 'flat', join: 'miter' },
    shadow: null,
    reflection: null,
    glow: null,
    softEdges: null,
    threeDFormat: null,
    threeDRotation: null,
    border: null,
    shading: null,
    legacyShadow: null,
  }
}

export function borderStyleCss(id: BorderStyleId): string {
  return BORDER_STYLES.find((item) => item.id === id)?.css || 'solid'
}

export function borderValue(width: number, style: BorderStyleId, color: string, setting: BorderSetting = 'custom'): string {
  const css = setting === '3d' ? 'outset' : setting === 'shadow' ? 'solid' : borderStyleCss(style)
  return `${Math.max(0.25, width)}pt ${css} ${color}`
}

export function toHexColor(value: string, fallback = '#000000'): string {
  const text = String(value || '').trim()
  if (/^#[0-9a-f]{6}$/i.test(text)) return text.toLowerCase()
  if (/^#[0-9a-f]{3}$/i.test(text)) {
    return `#${text[1]}${text[1]}${text[2]}${text[2]}${text[3]}${text[3]}`.toLowerCase()
  }
  const match = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(text)
  if (match) {
    const hex = [match[1], match[2], match[3]]
      .map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0'))
      .join('')
    return `#${hex}`
  }
  return fallback
}

function alphaColor(color: string, transparency: number): string {
  const alpha = Math.max(0, Math.min(1, 1 - transparency / 100))
  const hex = color.replace('#', '').trim()
  if (/^[0-9a-f]{6}$/i.test(hex)) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${alpha.toFixed(2)})`
  }
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const r = Number.parseInt(hex[0] + hex[0], 16)
    const g = Number.parseInt(hex[1] + hex[1], 16)
    const b = Number.parseInt(hex[2] + hex[2], 16)
    return `rgba(${r},${g},${b},${alpha.toFixed(2)})`
  }
  return color
}

export function patternBackground(pattern: ShadingPatternId, color: string): string {
  const c = color
  const dot = (size: number, radius: number) =>
    `radial-gradient(${c} ${radius}px, transparent ${radius + 0.2}px); background-size: ${size}px ${size}px`
  switch (pattern) {
    case 'clear':
      return ''
    case 'solid':
      return ''
    case 'p5':
      return dot(9, 0.7)
    case 'p10':
      return dot(8, 0.85)
    case 'p20':
      return dot(6, 0.9)
    case 'p25':
      return dot(5.5, 0.95)
    case 'p30':
      return dot(5, 1)
    case 'p40':
      return dot(4.5, 1.1)
    case 'p50':
      return dot(4, 1.2)
    case 'p60':
      return dot(3.7, 1.35)
    case 'p70':
      return dot(3.4, 1.5)
    case 'p75':
      return dot(3.2, 1.6)
    case 'p80':
      return dot(3, 1.7)
    case 'p90':
      return dot(2.8, 1.8)
    case 'lightHorizontal':
      return `repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 5px)`
    case 'lightVertical':
      return `repeating-linear-gradient(90deg, ${c} 0 1px, transparent 1px 5px)`
    case 'lightDownward':
      return `repeating-linear-gradient(45deg, ${c} 0 1px, transparent 1px 5px)`
    case 'lightUpward':
      return `repeating-linear-gradient(-45deg, ${c} 0 1px, transparent 1px 5px)`
    case 'darkHorizontal':
      return `repeating-linear-gradient(0deg, ${c} 0 2px, transparent 2px 4px)`
    case 'darkVertical':
      return `repeating-linear-gradient(90deg, ${c} 0 2px, transparent 2px 4px)`
    case 'darkDownward':
      return `repeating-linear-gradient(45deg, ${c} 0 2px, transparent 2px 4px)`
    case 'darkUpward':
      return `repeating-linear-gradient(-45deg, ${c} 0 2px, transparent 2px 4px)`
    case 'cross':
      return `repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 5px), repeating-linear-gradient(90deg, ${c} 0 1px, transparent 1px 5px)`
    case 'diagCross':
      return `repeating-linear-gradient(45deg, ${c} 0 1px, transparent 1px 5px), repeating-linear-gradient(-45deg, ${c} 0 1px, transparent 1px 5px)`
    default:
      return ''
  }
}

export function shadingBackground(fill: string, pattern: ShadingPatternId, patternColor: string): string {
  if (pattern === 'solid') return `background-color: ${patternColor}`
  if (pattern === 'clear') return `background-color: ${fill}`
  const image = patternBackground(pattern, patternColor)
  return `background-color: ${fill}; background-image: ${image}`
}

export function paragraphShadingValue(fill: string, pattern: ShadingPatternId, patternColor: string): string {
  return shadingBackground(fill, pattern, patternColor).replace(/^background-color:\s*/, '')
}

export function paragraphBorderAttrs(options: BorderOptions): Record<string, unknown> {
  if (options.setting === 'none') {
    return { borderSides: null, borderColor: null, borderWidth: null }
  }
  const sides = options.setting === 'custom' ? options.sides : ['top', 'bottom', 'left', 'right']
  const css = options.setting === '3d' ? 'outset' : options.setting === 'shadow' ? 'solid' : borderStyleCss(options.style)
  const allSides = sides.length === 4
  const extras = allSides
    ? [`border-style: ${css}`, `padding: ${Math.max(0, options.offset ?? 1)}px`]
    : []
  if (allSides && options.setting === 'shadow') extras.push('box-shadow: 4px 4px 0 rgba(0,0,0,0.35)')
  return {
    borderSides: sides.join(','),
    borderColor: extras.length ? `${options.color}; ${extras.join('; ')}` : options.color,
    borderWidth: `${Math.max(0.25, options.width)}pt`,
  }
}

export function applyParagraphBorder(editor: Editor, options: BorderOptions) {
  updateSelectedBlocks(editor, paragraphBorderAttrs(options))
}

export function applyCellBorder(editor: Editor, options: BorderOptions) {
  if (!editor.isActive('table')) return
  if (options.setting === 'none') {
    setCellAttrs(editor, {
      cellBorderTop: null,
      cellBorderBottom: null,
      cellBorderLeft: null,
      cellBorderRight: null,
    })
    return
  }
  const sides = options.setting === 'custom' ? options.sides : ['top', 'bottom', 'left', 'right']
  const value = borderValue(options.width, options.style, options.color, options.setting)
  const attrs: Record<string, unknown> = {}
  for (const side of sides) {
    attrs[`cellBorder${side[0].toUpperCase()}${side.slice(1)}`] = value
  }
  setCellAttrs(editor, attrs)
}

export function applyParagraphShading(editor: Editor, fill: string, pattern: ShadingPatternId, patternColor: string) {
  updateSelectedBlocks(editor, { shading: paragraphShadingValue(fill, pattern, patternColor) })
}

export function applyCellShading(editor: Editor, fill: string, pattern: ShadingPatternId, patternColor: string) {
  if (!editor.isActive('table')) return
  setCellAttrs(editor, { backgroundColor: paragraphShadingValue(fill, pattern, patternColor) })
}

function encodeState(state: TextStyleState): string {
  try {
    return btoa(JSON.stringify(state))
  } catch {
    return ''
  }
}

function decodeState(value: string): TextStyleState | null {
  try {
    const parsed = JSON.parse(atob(value)) as Partial<TextStyleState>
    if (!parsed || typeof parsed !== 'object') return null
    return mergeState(parsed)
  } catch {
    return null
  }
}

function mergeState(parsed: Partial<TextStyleState>): TextStyleState {
  const base = defaultTextStyleState()
  return {
    ...base,
    ...parsed,
    fill: { ...base.fill, ...(parsed.fill || {}) },
    outline: { ...base.outline, ...(parsed.outline || {}) },
    shadow: parsed.shadow ?? null,
    reflection: parsed.reflection ?? null,
    glow: parsed.glow ?? null,
    softEdges: parsed.softEdges ?? null,
    threeDFormat: parsed.threeDFormat ?? null,
    threeDRotation: parsed.threeDRotation ?? null,
    border: parsed.border ?? null,
    shading: parsed.shading ?? null,
    legacyShadow: parsed.legacyShadow ?? null,
  }
}

function firstSegment(value: string): string {
  return value.split(';')[0].trim()
}

export function readTextStyleState(editor: Editor): TextStyleState {
  const attrs = editor.getAttributes('textStyle') || {}
  const rawShadow = typeof attrs.textShadow === 'string' ? attrs.textShadow : ''
  const encoded = /--te-state:\s*([A-Za-z0-9+/=]+)/.exec(rawShadow)
  if (encoded) {
    const state = decodeState(encoded[1])
    if (state) return state
  }
  const state = defaultTextStyleState()
  state.legacyShadow = rawShadow ? firstSegment(rawShadow) : null
  if (typeof attrs.color === 'string' && attrs.color && attrs.color !== 'transparent') {
    state.fill = { ...state.fill, mode: 'solid', color: attrs.color }
  }
  if (typeof attrs.textStroke === 'string' && attrs.textStroke) {
    const match = /^([\d.]+)px\s+(.+)$/.exec(attrs.textStroke)
    if (match) {
      state.outline = { ...state.outline, mode: 'solid', width: Number(match[1]), color: match[2] }
      state.fill = { ...state.fill, mode: 'none' }
    }
  }
  return state
}

function shadowCss(state: ShadowState): string {
  const rad = (state.angle * Math.PI) / 180
  const dx = Number((Math.cos(rad) * state.distance).toFixed(1))
  const dy = Number((Math.sin(rad) * state.distance).toFixed(1))
  const blur = Math.max(0, state.blur * (0.4 + state.size / 100))
  return `${dx}px ${dy}px ${blur.toFixed(1)}px ${alphaColor(state.color, state.transparency)}`
}

function glowCss(state: GlowState): string {
  return `0 0 ${Math.max(0.5, state.size)}px ${alphaColor(state.color, state.transparency)}`
}

function bevelShadows(state: ThreeDFormatState): string[] {
  const size = Math.max(0.5, state.depth)
  const light =
    state.lighting === 'warm'
      ? 'rgba(255,232,190,0.9)'
      : state.lighting === 'cool'
        ? 'rgba(190,224,255,0.9)'
        : 'rgba(255,255,255,0.85)'
  const dark =
    state.material === 'metal'
      ? 'rgba(0,0,0,0.65)'
      : state.material === 'plastic'
        ? 'rgba(0,0,0,0.45)'
        : 'rgba(0,0,0,0.35)'
  const top = state.topBevel !== 'none'
  const bottom = Boolean(state.bottomBevel && state.bottomBevel !== 'none')
  if (!top && !bottom) return []
  const shadows: string[] = []
  if (top) shadows.push(`${size}px ${size}px 0 ${dark}`, `${-size * 0.6}px ${-size * 0.6}px 0 ${light}`)
  if (bottom) shadows.push(`${-size * 0.4}px ${size * 0.7}px 0 ${dark}`, `${size * 0.4}px ${-size * 0.4}px 0 ${light}`)
  return shadows
}

function textureBackground(texture: string): string {
  switch (texture) {
    case 'canvas':
      return 'repeating-linear-gradient(0deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,0.35) 0 1px, transparent 1px 4px), linear-gradient(#c9b28a, #a88d61)'
    case 'marble':
      return 'radial-gradient(ellipse at 30% 20%, #f7f7f7 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, #d7d7d7 0%, transparent 60%), linear-gradient(120deg, #efefef, #bdbdbd)'
    case 'wood':
      return 'repeating-linear-gradient(90deg, #8a5a2b 0 3px, #a56f39 3px 7px, #7a4b20 7px 12px)'
    default:
      return 'radial-gradient(circle at 25% 25%, #fff8e7 0 2px, transparent 2.5px), radial-gradient(circle at 75% 70%, #f2e2bf 0 2px, transparent 2.5px), linear-gradient(120deg, #f6ecd4, #e5d2a8)'
  }
}

function fillDeclarations(state: TextStyleState): string[] {
  if (state.fill.mode === 'none' || state.fill.mode === 'solid') return []
  const c1 = alphaColor(state.fill.color, state.fill.transparency)
  const c2 = alphaColor(state.fill.color2, state.fill.transparency)
  const image =
    state.fill.mode === 'texture'
      ? textureBackground(state.fill.texture || 'parchment')
      : state.fill.type === 'radial'
        ? `radial-gradient(circle, ${c1} 0%, ${c2} 100%)`
        : state.fill.type === 'rectangular'
          ? `linear-gradient(90deg, ${c1} 0%, ${c2} 100%)`
          : state.fill.type === 'path'
            ? `radial-gradient(ellipse at center, ${c1} 0%, ${c2} 100%)`
            : `linear-gradient(${state.fill.angle}deg, ${c1} 0%, ${c2} 100%)`
  return [
    `background-image: ${image}`,
    '-webkit-background-clip: text',
    'background-clip: text',
    '-webkit-text-fill-color: transparent',
  ]
}

function borderDeclarations(state: TextStyleState): string[] {
  if (!state.border) return []
  const { border } = state
  const css = border.setting === '3d' ? 'outset' : border.setting === 'shadow' ? 'solid' : borderStyleCss(border.style)
  const sides = border.setting === 'custom' ? border.sides : ['top', 'bottom', 'left', 'right']
  const decls = sides.map((side) => `border-${side}: ${Math.max(0.25, border.width)}pt ${css} ${border.color}`)
  if (sides.length >= 4) decls.push('border-radius: 1px')
  decls.push(`padding: ${Math.max(0, border.offset ?? 1)}px`)
  if (border.setting === 'shadow') decls.push('box-shadow: 2px 2px 0 rgba(0,0,0,0.35)')
  return decls
}

function shadingDeclarations(state: TextStyleState): string[] {
  if (!state.shading) return []
  const { color, pattern, patternColor } = state.shading
  if (pattern === 'clear' || pattern === 'solid') {
    return [`background-color: ${pattern === 'solid' ? patternColor : color}`]
  }
  return [`background-color: ${color}`, `background-image: ${patternBackground(pattern, patternColor)}`]
}

function effectDeclarations(state: TextStyleState): string[] {
  const decls: string[] = []
  if (state.reflection) {
    decls.push('display: inline-block')
    decls.push(
      `-webkit-box-reflect: below ${Math.max(0, state.reflection.distance)}px linear-gradient(transparent, ${alphaColor('#000000', state.reflection.transparency)})`,
    )
  }
  if (state.softEdges) {
    decls.push(`filter: blur(${Math.max(0, state.softEdges.size / 2).toFixed(1)}px)`)
  }
  if (state.threeDRotation) {
    const { x, y, z, perspective } = state.threeDRotation
    decls.push('display: inline-block')
    decls.push(
      `transform: perspective(${Math.max(100, perspective)}px) rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`,
    )
  }
  return decls
}

function buildShadowBase(state: TextStyleState): string {
  const shadows: string[] = []
  if (state.legacyShadow && state.legacyShadow !== 'none') shadows.push(state.legacyShadow)
  if (state.shadow) shadows.push(shadowCss(state.shadow))
  if (state.glow) shadows.push(glowCss(state.glow))
  if (state.threeDFormat) shadows.push(...bevelShadows(state.threeDFormat))
  return shadows.length ? shadows.join(', ') : 'none'
}

export function writeTextStyleState(editor: Editor, state: TextStyleState, colorOverride?: string) {
  const decls = [
    ...borderDeclarations(state),
    ...shadingDeclarations(state),
    ...fillDeclarations(state),
    ...effectDeclarations(state),
  ]
  decls.push(`--te-state: ${encodeState(state)}`)
  const shadowValue = `${buildShadowBase(state)}; ${decls.join('; ')}`
  const color =
    colorOverride !== undefined
      ? colorOverride
      : state.fill.mode === 'solid'
        ? state.fill.color
        : 'transparent'
  let stroke: string | null = null
  if (state.outline.mode !== 'none' && state.outline.width > 0) {
    stroke = `${state.outline.width}px ${alphaColor(state.outline.color, state.outline.transparency)}`
  } else if (state.threeDFormat && state.threeDFormat.contour > 0) {
    stroke = `${state.threeDFormat.contour}px ${state.threeDFormat.contourColor}`
  }
  setTextStyle(editor, { color, textShadow: shadowValue, textStroke: stroke })
}

export function applyTextBorder(editor: Editor, border: TextBorderState | null) {
  const state = readTextStyleState(editor)
  state.border = border
  writeTextStyleState(editor, state)
}

export function applyTextShading(editor: Editor, shading: TextShadingState | null) {
  const state = readTextStyleState(editor)
  state.shading = shading
  writeTextStyleState(editor, state)
}

export const QUICK_EFFECTS = [
  { id: 'none', label: 'None' },
  { id: 'shadow', label: 'Shadow' },
  { id: 'glow', label: 'Glow' },
  { id: 'outline', label: 'Outline' },
  { id: 'outlineShadow', label: 'Outline and Shadow' },
] as const

export type QuickEffectId = (typeof QUICK_EFFECTS)[number]['id']

export function applyQuickTextEffect(editor: Editor, id: QuickEffectId) {
  const state = readTextStyleState(editor)
  state.legacyShadow = null
  state.shadow = null
  state.glow = null
  state.reflection = null
  state.softEdges = null
  state.threeDFormat = null
  state.threeDRotation = null
  state.outline = { ...state.outline, mode: 'none' }
  if (id === 'shadow' || id === 'outlineShadow') {
    state.shadow = {
      preset: 'offset',
      color: '#000000',
      transparency: 55,
      size: 60,
      blur: 3,
      angle: 45,
      distance: 2,
    }
  }
  if (id === 'glow') {
    state.glow = { preset: 'glow', color: '#4a9eff', size: 6, transparency: 10 }
  }
  if (id === 'outline' || id === 'outlineShadow') {
    state.outline = { ...state.outline, mode: 'solid', color: '#2f5496', width: 1, transparency: 0 }
  }
  writeTextStyleState(editor, state)
}

export function applyQuickFill(editor: Editor, color: string | null) {
  const state = readTextStyleState(editor)
  if (!color) {
    state.fill = { ...state.fill, mode: 'none' }
  } else {
    state.fill = { ...state.fill, mode: 'solid', color }
  }
  writeTextStyleState(editor, state)
}
