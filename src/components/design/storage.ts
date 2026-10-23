import { DEFAULT_PAGE_BORDER, DEFAULT_WATERMARK } from './data'
import type { StoredDesign } from './types'

const KEY = 'openoffice:design'
const DEFAULTS_KEY = 'openoffice:design-defaults'

export function defaultDesign(themeId = 'office'): StoredDesign {
  return {
    themeId,
    styleSetId: 'default',
    colorSetId: themeId,
    fontPairId: themeId,
    effectSetId: 'office',
    paragraphPreset: 'default',
    paragraphBefore: 0,
    paragraphAfter: 8,
    lineHeight: 1.08,
    watermark: DEFAULT_WATERMARK,
    pageBorder: DEFAULT_PAGE_BORDER,
    customColorSets: [],
    customFontPairs: [],
    customThemes: [],
  }
}

function read(key: string): Partial<StoredDesign> | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const value = JSON.parse(raw)
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}

export function loadDesign(themeId: string): StoredDesign {
  const base = defaultDesign(themeId)
  const stored = read(DEFAULTS_KEY) ?? read(KEY)
  if (!stored) return base
  return {
    ...base,
    ...stored,
    themeId,
    watermark: { ...base.watermark, ...(stored.watermark || {}) },
    pageBorder: {
      ...base.pageBorder,
      ...(stored.pageBorder || {}),
      sides: { ...base.pageBorder.sides, ...(stored.pageBorder?.sides || {}) },
    },
    customColorSets: Array.isArray(stored.customColorSets) ? stored.customColorSets : [],
    customFontPairs: Array.isArray(stored.customFontPairs) ? stored.customFontPairs : [],
    customThemes: Array.isArray(stored.customThemes) ? stored.customThemes : [],
  }
}

export function saveDesign(value: StoredDesign) {
  try {
    localStorage.setItem(KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export function saveDesignDefaults(value: StoredDesign) {
  try {
    localStorage.setItem(DEFAULTS_KEY, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}
