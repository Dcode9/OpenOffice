import { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import {
  Check,
  FileUp,
  Image as ImageIcon,
  PaintBucket,
  RotateCcw,
  Save,
  Settings2,
} from 'lucide-react'
import {
  COLOR_SETS,
  EFFECTS,
  FONT_PAIRS,
  PARAGRAPH_PRESETS,
  STANDARD_COLORS,
  STYLE_SETS,
  THEME_COLOR_LABELS,
  THEME_COLOR_LEVELS,
  colorColumns,
  type PageBorderArt,
} from './data'
import type {
  ColorSet,
  EffectDefinition,
  FontPair,
  ParagraphPreset,
  StyleSetDefinition,
  ThemeDefinition,
  ThemePalette,
} from './types'

type CustomVars = CSSProperties & Record<string, string | number>

export function ThemeGallery({
  current,
  themes,
  onApply,
  onPreview,
  onReset,
  onBrowse,
  onSave,
}: {
  current: string
  themes: ThemeDefinition[]
  onApply: (theme: ThemeDefinition) => void
  onPreview: (theme: ThemeDefinition | null) => void
  onReset: () => void
  onBrowse: () => void
  onSave: () => void
}) {
  return (
    <div className="ds-theme-popover">
      <div className="ds-theme-scroll">
        <div className="ds-theme-grid">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`ds-theme-card${current === theme.id ? ' active' : ''}`}
              onMouseEnter={() => onPreview(theme)}
              onMouseLeave={() => onPreview(null)}
              onFocus={() => onPreview(theme)}
              onBlur={() => onPreview(null)}
              onClick={() => {
                onPreview(null)
                onApply(theme)
              }}
              title={theme.label}
            >
              <span className="ds-theme-page">
                <span className="ds-theme-page-title" style={{ fontFamily: theme.headingFont }}>
                  Title
                </span>
                <span className="ds-theme-page-line" />
                <span className="ds-theme-page-line short" />
                <span className="ds-theme-page-line" />
                <span className="ds-theme-page-chips">
                  {theme.colors.slice(4, 10).map((color) => (
                    <span key={color} style={{ background: color }} />
                  ))}
                </span>
              </span>
              <span className="ds-theme-label">{theme.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="ds-theme-footer">
        <button type="button" className="ds-gallery-action" onClick={onReset}>
          <RotateCcw size={14} /> Reset to Theme from Template
        </button>
        <button type="button" className="ds-gallery-action" onClick={onBrowse}>
          <FileUp size={14} /> Browse for Themes…
        </button>
        <button type="button" className="ds-gallery-action" onClick={onSave}>
          <Save size={14} /> Save Current Theme…
        </button>
      </div>
    </div>
  )
}

export function StyleSetGallery({
  current,
  onApply,
  onPreview,
  onMore,
}: {
  current: string
  onApply: (set: StyleSetDefinition) => void
  onPreview: (set: StyleSetDefinition | null) => void
  onMore: () => void
}) {
  const visible = STYLE_SETS.slice(0, 14)
  return (
    <div className="ds-style-gallery">
      {visible.map((set) => (
        <button
          key={set.id}
          type="button"
          className={`ds-style-card${current === set.id ? ' active' : ''}`}
          title={`Style set: ${set.label}`}
          onMouseEnter={() => onPreview(set)}
          onMouseLeave={() => onPreview(null)}
          onClick={() => {
            onPreview(null)
            onApply(set)
          }}
        >
          <span
            className="ds-style-title"
            style={
              {
                '--preview-title': set.title.color === 'text' ? '#222' : '#2f5496',
                '--preview-spacing': `${set.title.spacing}px`,
                '--preview-transform': set.title.transform,
                fontStyle: set.title.italic ? 'italic' : 'normal',
                fontWeight: set.title.weight,
              } as CustomVars
            }
          >
            TITLE
          </span>
          <span
            className="ds-style-heading"
            style={
              {
                '--preview-heading': set.heading.color === 'text' ? '#333' : '#2f5496',
                '--preview-weight': set.heading.weight,
                '--preview-style': set.heading.italic ? 'italic' : 'normal',
              } as CustomVars
            }
          >
            Heading 1
          </span>
          <span className="ds-style-line" />
          <span className="ds-style-line short" />
          <span className="ds-style-line" />
        </button>
      ))}
      <button type="button" className="ds-style-more" title="More style sets" onClick={onMore}>
        <Settings2 size={11} />
      </button>
    </div>
  )
}

export function MoreStyleSets({
  current,
  onApply,
  onReset,
  onSave,
}: {
  current: string
  onApply: (set: StyleSetDefinition) => void
  onReset: () => void
  onSave: () => void
}) {
  return (
    <div className="ds-spacing-menu">
      <div className="ds-spacing-header">Style Set</div>
      {STYLE_SETS.map((set) => (
        <button
          type="button"
          key={set.id}
          className={`ds-spacing-row${current === set.id ? ' active' : ''}`}
          onClick={() => onApply(set)}
        >
          <span>{set.label}</span>
          {current === set.id && <span className="ds-spacing-check"><Check size={12} /></span>}
        </button>
      ))}
      <div className="ds-color-command separated" onClick={onReset} role="button" tabIndex={0}>
        Reset to the Default Style Set
      </div>
      <div className="ds-color-command" onClick={onSave} role="button" tabIndex={0}>
        Save as a New Style Set…
      </div>
    </div>
  )
}

export function ColorMenu({
  current,
  sets,
  onApply,
  onPreview,
  onCustomize,
}: {
  current: string
  sets: ColorSet[]
  onApply: (set: ColorSet) => void
  onPreview: (set: ColorSet | null) => void
  onCustomize: () => void
}) {
  return (
    <div>
      <div className="ds-color-list">
        {sets.map((set) => (
          <button
            type="button"
            key={set.id}
            className={`ds-color-row${current === set.id ? ' active' : ''}`}
            onMouseEnter={() => onPreview(set)}
            onMouseLeave={() => onPreview(null)}
            onClick={() => {
              onPreview(null)
              onApply(set)
            }}
          >
            <span className="ds-color-chips">
              {set.colors.map((color) => (
                <span key={color} style={{ background: color }} />
              ))}
            </span>
            <span className="ds-color-name">{set.label}</span>
            {current === set.id && <span className="ds-color-check"><Check size={13} /></span>}
          </button>
        ))}
      </div>
      <div className="ds-color-footer">
        <button type="button" className="ds-gallery-action" onClick={onCustomize}>
          <PaintBucket size={14} /> Customize Colors…
        </button>
      </div>
    </div>
  )
}

export function FontsMenu({
  current,
  pairs,
  onApply,
  onPreview,
  onCustomize,
}: {
  current: string
  pairs: FontPair[]
  onApply: (pair: FontPair) => void
  onPreview: (pair: FontPair | null) => void
  onCustomize: () => void
}) {
  return (
    <div>
      <div className="ds-font-list">
        {pairs.map((pair) => (
          <button
            type="button"
            key={pair.id}
            className={`ds-font-row${current === pair.id ? ' active' : ''}`}
            onMouseEnter={() => onPreview(pair)}
            onMouseLeave={() => onPreview(null)}
            onClick={() => {
              onPreview(null)
              onApply(pair)
            }}
          >
            <span className="ds-font-samples">
              <span className="ds-font-sample-heading" style={{ fontFamily: pair.headingFont }}>
                Heading
              </span>
              <span className="ds-font-sample-body" style={{ fontFamily: pair.bodyFont }}>
                The quick brown fox jumps over the lazy dog.
              </span>
              <span className="ds-font-sample-label">{pair.label}</span>
            </span>
            {current === pair.id && <span className="ds-font-check"><Check size={13} /></span>}
          </button>
        ))}
      </div>
      <div className="ds-font-footer">
        <button type="button" className="ds-gallery-action" onClick={onCustomize}>
          <Settings2 size={14} /> Customize Fonts…
        </button>
      </div>
    </div>
  )
}

export function EffectsMenu({
  current,
  onApply,
}: {
  current: string
  onApply: (effect: EffectDefinition) => void
}) {
  return (
    <div className="ds-effect-grid">
      {EFFECTS.map((effect) => (
        <button
          type="button"
          key={effect.id}
          className={`ds-effect-card${current === effect.id ? ' active' : ''}`}
          onClick={() => onApply(effect)}
          title={effect.label}
        >
          <span
            className="ds-effect-art"
            style={
              {
                '--fx-shadow': effect.shadow,
                '--fx-filter': effect.filter,
                '--fx-outline': effect.outline,
              } as CustomVars
            }
          />
          <span className="ds-effect-name">{effect.label}</span>
        </button>
      ))}
    </div>
  )
}

function SpacingPreview({ preset }: { preset: ParagraphPreset['preview'] }) {
  const gap = preset === 'none' ? 0 : preset === 'compact' ? 1 : preset === 'tight' ? 2 : preset === 'open' ? 3 : preset === 'relaxed' ? 5 : 7
  return (
    <span className="ds-spacing-preview" style={{ '--sp-gap': `${gap}px` } as CustomVars}>
      <span />
      <span />
      <span />
    </span>
  )
}

export function SpacingMenu({
  current,
  onApply,
  onCustom,
  onDefault,
}: {
  current: string
  onApply: (preset: ParagraphPreset) => void
  onCustom: () => void
  onDefault: () => void
}) {
  return (
    <div className="ds-spacing-menu">
      <div className="ds-spacing-header">Paragraph Spacing</div>
      <button
        type="button"
        className={`ds-spacing-row${current === 'default' ? ' active' : ''}`}
        onClick={onDefault}
      >
        <SpacingPreview preset="open" />
        <span>Default</span>
        {current === 'default' && <span className="ds-spacing-check"><Check size={12} /></span>}
      </button>
      {PARAGRAPH_PRESETS.map((preset) => (
        <button
          type="button"
          key={preset.id}
          className={`ds-spacing-row${current === preset.id ? ' active' : ''}`}
          onClick={() => onApply(preset)}
        >
          <SpacingPreview preset={preset.preview} />
          <span>{preset.label}</span>
          {current === preset.id && <span className="ds-spacing-check"><Check size={12} /></span>}
        </button>
      ))}
      <div className="ds-color-command separated" onClick={onCustom} role="button" tabIndex={0}>
        Custom Paragraph Spacing…
      </div>
    </div>
  )
}

export function pageColorGrid(colors: ThemePalette) {
  const columns = colorColumns(colors)
  const cells: { color: string; title: string }[] = []
  for (let level = 0; level < columns[0].length; level += 1) {
    columns.forEach((column, index) => {
      const suffix = THEME_COLOR_LEVELS[level]
      cells.push({
        color: column[level],
        title: `${THEME_COLOR_LABELS[index]}${suffix ? `, ${suffix}` : ''}`,
      })
    })
  }
  return cells
}

export function PageColorMenu({
  colors,
  onPick,
  onNoColor,
  onMore,
  onFill,
}: {
  colors: ThemePalette
  onPick: (color: string) => void
  onNoColor: () => void
  onMore: () => void
  onFill: () => void
}) {
  const cells = useMemo(() => pageColorGrid(colors), [colors])
  return (
    <div className="ds-pagecolor">
      <div className="ds-color-heading">Theme Colors</div>
      <div className="ds-theme-color-grid">
        {cells.map((cell) => (
          <button
            type="button"
            key={cell.title}
            style={{ background: cell.color }}
            title={cell.title}
            onClick={() => onPick(cell.color)}
          />
        ))}
      </div>
      <div className="ds-color-heading">Standard Colors</div>
      <div className="ds-standard-grid">
        {STANDARD_COLORS.map((color) => (
          <button
            type="button"
            key={color}
            style={{ background: color }}
            title={color}
            onClick={() => onPick(color)}
          />
        ))}
      </div>
      <button type="button" className="ds-no-color separated" onClick={onNoColor}>
        <span className="ds-no-color-swatch" /> No Color
      </button>
      <button type="button" className="ds-color-command" onClick={onMore}>
        More Colors…
      </button>
      <button type="button" className="ds-color-command" onClick={onFill}>
        Fill Effects…
      </button>
    </div>
  )
}

export function WatermarkGallery({
  currentText,
  currentLayout,
  hasWatermark,
  onPreset,
  onCustom,
  onRemove,
}: {
  currentText: string | null
  currentLayout: 'diagonal' | 'horizontal'
  hasWatermark: boolean
  onPreset: (text: string, layout: 'diagonal' | 'horizontal') => void
  onCustom: () => void
  onRemove: () => void
}) {
  const groups: { label: string; items: { text: string; name: string }[] }[] = [
    {
      label: 'Confidential',
      items: [
        { text: 'CONFIDENTIAL', name: 'CONFIDENTIAL 1' },
        { text: 'CONFIDENTIAL', name: 'CONFIDENTIAL 2' },
        { text: 'DO NOT COPY', name: 'DO NOT COPY 1' },
        { text: 'DO NOT COPY', name: 'DO NOT COPY 2' },
      ],
    },
    {
      label: 'Disclaimers',
      items: [
        { text: 'DRAFT', name: 'DRAFT 1' },
        { text: 'DRAFT', name: 'DRAFT 2' },
        { text: 'SAMPLE', name: 'SAMPLE 1' },
        { text: 'SAMPLE', name: 'SAMPLE 2' },
      ],
    },
    {
      label: 'Urgent',
      items: [
        { text: 'ASAP', name: 'ASAP 1' },
        { text: 'ASAP', name: 'ASAP 2' },
        { text: 'URGENT', name: 'URGENT 1' },
        { text: 'URGENT', name: 'URGENT 2' },
      ],
    },
  ]
  return (
    <div className="ds-wm-gallery">
      <div className="ds-wm-scroll">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="ds-wm-section">{group.label}</div>
            <div className="ds-wm-grid">
              {group.items.map((item, index) => {
                const layout: 'diagonal' | 'horizontal' = index % 2 === 0 ? 'diagonal' : 'horizontal'
                const active = hasWatermark && currentText === item.text && currentLayout === layout
                return (
                  <button
                    type="button"
                    key={item.name}
                    className={`ds-wm-card${active ? ' active' : ''}`}
                    onClick={() => onPreset(item.text, layout)}
                  >
                    <span className="ds-wm-page">
                      <span
                        style={{
                          transform: `rotate(${layout === 'diagonal' ? '-45deg' : '0deg'})`,
                          fontSize: item.text.length > 10 ? '9px' : '12px',
                        }}
                      >
                        {item.text}
                      </span>
                    </span>
                    <span className="ds-wm-name">{item.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="ds-wm-footer">
        <button type="button" className="ds-gallery-action" disabled>
          <ImageIcon size={14} /> More Watermarks from Office.com
        </button>
        <button type="button" className="ds-gallery-action" onClick={onCustom}>
          <Settings2 size={14} /> Custom Watermark…
        </button>
        <button type="button" className="ds-gallery-action" disabled={!hasWatermark} onClick={onRemove}>
          <span aria-hidden="true">×</span> Remove Watermark
        </button>
      </div>
    </div>
  )
}

export function artPreview(art: PageBorderArt): ReactNode {
  return <span className="ds-art-preview" style={{ backgroundImage: art.image || undefined }} />
}
