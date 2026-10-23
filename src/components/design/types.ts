export type ThemePalette = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
]

export type ThemeDefinition = {
  id: string
  label: string
  bodyFont: string
  headingFont: string
  accent: string
  colors: ThemePalette
  effectId: string
}

export type ColorSet = {
  id: string
  label: string
  colors: ThemePalette
  custom?: boolean
}

export type FontPair = {
  id: string
  label: string
  headingFont: string
  bodyFont: string
  custom?: boolean
}

export type ColorToken = 'accent' | 'text' | 'dark' | 'muted'

export type TextStyleDefinition = {
  size: number
  weight: number
  italic: boolean
  transform: 'none' | 'uppercase' | 'small-caps'
  spacing: number
  color: ColorToken
  border: boolean
}

export type StyleSetDefinition = {
  id: string
  label: string
  title: TextStyleDefinition
  heading: TextStyleDefinition
  h1Size: number
  h2Size: number
  h3Size: number
  lineHeight: number
  before: number
  after: number
}

export type EffectDefinition = {
  id: string
  label: string
  shadow: string
  filter: string
  outline: string
  radius: string
}

export type ParagraphPreset = {
  id: string
  label: string
  before: number
  after: number
  lineHeight: number
  preview: 'none' | 'compact' | 'tight' | 'open' | 'relaxed' | 'double'
}

export type WatermarkStyle = {
  kind: 'text' | 'picture' | 'none'
  text: string
  font: string
  size: number
  color: string
  semitransparent: boolean
  layout: 'diagonal' | 'horizontal'
  image: string
  scale: number
  washout: boolean
}

export type PageBorderSide = 'top' | 'bottom' | 'left' | 'right'

export type PageBorderSetting = 'none' | 'box' | 'shadow' | '3d' | 'custom'

export type PageBorderConfig = {
  setting: PageBorderSetting
  style: string
  color: string
  width: number
  art: string
  inset: number
  sides: Record<PageBorderSide, boolean>
  shadow: string
}

export type StoredDesign = {
  themeId: string
  styleSetId: string
  colorSetId: string
  fontPairId: string
  effectSetId: string
  paragraphPreset: string
  paragraphBefore: number
  paragraphAfter: number
  lineHeight: number
  watermark: WatermarkStyle
  pageBorder: PageBorderConfig
  customColorSets: ColorSet[]
  customFontPairs: FontPair[]
  customThemes: ThemeDefinition[]
}
