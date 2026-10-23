import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlignJustify,
  Check,
  PaintBucket,
  Palette,
  Sparkles,
  Square,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import {
  ThemeGallery,
  StyleSetGallery,
  MoreStyleSets,
  ColorMenu,
  FontsMenu,
  EffectsMenu,
  SpacingMenu,
  PageColorMenu,
  WatermarkGallery,
} from '../design/Galleries'
import PageBordersDialog from '../design/PageBordersDialog'
import WatermarkDialog from '../design/WatermarkDialog'
import { MoreColorsDialog, CustomizeColorsDialog, FillEffectsDialog } from '../design/ColorDialogs'
import {
  CustomizeFontsDialog,
  ParagraphSpacingDialog,
  SetDefaultDialog,
  NameDialog,
} from '../design/ThemeDialogs'
import {
  THEMES,
  COLOR_SETS,
  FONT_PAIRS,
  STYLE_SETS,
  EFFECTS,
  DEFAULT_WATERMARK,
  DEFAULT_PAGE_BORDER,
} from '../design/data'
import type {
  ColorSet,
  FontPair,
  PageBorderConfig,
  ThemeDefinition,
  WatermarkStyle,
} from '../design/types'
import {
  applyDesignTheme,
  applyFonts,
  applyColors,
  applyStyleSet,
  applyEffects,
  applyParagraphSpacing,
  applyWatermark,
  applyPageBorder,
} from '../design/apply'
import { loadDesign, saveDesign, saveDesignDefaults } from '../design/storage'

function BigMenu({
  icon,
  label,
  width = 240,
  children,
}: {
  icon: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={label}>
          <span className="rb-big-icon">{icon}</span>
          <span className="rb-big-label">{label}</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {children}
    </Popover>
  )
}

export default function DesignTab() {
  const {
    editor,
    theme,
    setTheme,
    page,
    setPage,
    pageBorders,
    setPageBorders,
    paragraphBefore,
    paragraphAfter,
    setParagraphBefore,
    setParagraphAfter,
    toast,
  } = useWord()

  const [stored] = useState(() => loadDesign(theme || 'office'))
  const [styleSetId, setStyleSetId] = useState(stored.styleSetId || 'default')
  const [colorSetId, setColorSetId] = useState(stored.colorSetId || theme || 'office')
  const [fontPairId, setFontPairId] = useState(stored.fontPairId || theme || 'office')
  const [effectId, setEffectId] = useState(stored.effectSetId || 'office')
  const [paragraphPresetId, setParagraphPresetId] = useState(stored.paragraphPreset || 'default')
  const [watermarkStyle, setWatermarkStyle] = useState<WatermarkStyle>(stored.watermark || DEFAULT_WATERMARK)
  const [pageBorderConfig, setPageBorderConfig] = useState<PageBorderConfig>(stored.pageBorder || DEFAULT_PAGE_BORDER)
  const [customColorSets, setCustomColorSets] = useState<ColorSet[]>(stored.customColorSets || [])
  const [customFontPairs, setCustomFontPairs] = useState<FontPair[]>(stored.customFontPairs || [])
  const [customThemes, setCustomThemes] = useState<ThemeDefinition[]>(stored.customThemes || [])
  const [isDefault, setIsDefault] = useState(false)

  // Dialog toggles
  const [showWatermarkDialog, setShowWatermarkDialog] = useState(false)
  const [showPageBordersDialog, setShowPageBordersDialog] = useState(false)
  const [showMoreColorsDialog, setShowMoreColorsDialog] = useState(false)
  const [showCustomizeColorsDialog, setShowCustomizeColorsDialog] = useState(false)
  const [showFillEffectsDialog, setShowFillEffectsDialog] = useState(false)
  const [showCustomizeFontsDialog, setShowCustomizeFontsDialog] = useState(false)
  const [showSpacingDialog, setShowSpacingDialog] = useState(false)
  const [showSetDefaultDialog, setShowSetDefaultDialog] = useState(false)
  const [showSaveThemeDialog, setShowSaveThemeDialog] = useState(false)
  const [showSaveStyleSetDialog, setShowSaveStyleSetDialog] = useState(false)
  const [showMoreStyleSets, setShowMoreStyleSets] = useState(false)

  const allThemes = useMemo(() => [...THEMES, ...customThemes], [customThemes])
  const allColorSets = useMemo(() => [...COLOR_SETS, ...customColorSets], [customColorSets])
  const allFontPairs = useMemo(() => [...FONT_PAIRS, ...customFontPairs], [customFontPairs])

  const currentTheme = useMemo(
    () => allThemes.find((t) => t.id === theme) || THEMES[0],
    [allThemes, theme],
  )
  const currentStyleSet = useMemo(
    () => STYLE_SETS.find((s) => s.id === styleSetId) || STYLE_SETS[0],
    [styleSetId],
  )
  const currentColorSet = useMemo(
    () => allColorSets.find((c) => c.id === colorSetId) || COLOR_SETS[0],
    [allColorSets, colorSetId],
  )
  const currentFontPair = useMemo(
    () => allFontPairs.find((f) => f.id === fontPairId) || FONT_PAIRS[0],
    [allFontPairs, fontPairId],
  )
  const currentEffect = useMemo(
    () => EFFECTS.find((e) => e.id === effectId) || EFFECTS[0],
    [effectId],
  )

  // Persist design state
  useEffect(() => {
    saveDesign({
      themeId: currentTheme.id,
      styleSetId,
      colorSetId,
      fontPairId,
      effectSetId: effectId,
      paragraphPreset: paragraphPresetId,
      paragraphBefore,
      paragraphAfter,
      lineHeight: 1.08,
      watermark: watermarkStyle,
      pageBorder: pageBorderConfig,
      customColorSets,
      customFontPairs,
      customThemes,
    })
  }, [
    currentTheme.id,
    styleSetId,
    colorSetId,
    fontPairId,
    effectId,
    paragraphPresetId,
    paragraphBefore,
    paragraphAfter,
    watermarkStyle,
    pageBorderConfig,
    customColorSets,
    customFontPairs,
    customThemes,
  ])

  if (!editor) return null

  const applySelectedTheme = (t: ThemeDefinition) => {
    setTheme(t.id)
    const font = allFontPairs.find((f) => f.id === t.id) || currentFontPair
    const color = allColorSets.find((c) => c.id === t.id) || currentColorSet
    const effect = EFFECTS.find((e) => e.id === t.effectId) || currentEffect
    setFontPairId(font.id)
    setColorSetId(color.id)
    setEffectId(effect.id)
    applyDesignTheme(t, font, color, currentStyleSet, effect)
    const root = document.documentElement
    root.style.setProperty('--word-body-font', t.bodyFont)
    root.style.setProperty('--word-heading-font', t.headingFont)
    root.style.setProperty('--word-accent', t.accent)
    toast(`Theme: ${t.label}`)
  }

  const previewTheme = (t: ThemeDefinition | null) => {
    if (t) {
      const font = allFontPairs.find((f) => f.id === t.id) || currentFontPair
      const color = allColorSets.find((c) => c.id === t.id) || currentColorSet
      const effect = EFFECTS.find((e) => e.id === t.effectId) || currentEffect
      applyDesignTheme(t, font, color, currentStyleSet, effect)
    } else {
      applyDesignTheme(currentTheme, currentFontPair, currentColorSet, currentStyleSet, currentEffect)
    }
  }

  return (
    <>
      <RibbonGroup label="Document Formatting">
        <Popover
          width={420}
          trigger={({ toggle }) => (
            <button className="rb-big" onClick={toggle} type="button" title="Themes">
              <span className="rb-big-icon"><Palette size={22} /></span>
              <span className="rb-big-label">Themes</span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <ThemeGallery
              current={currentTheme.id}
              themes={allThemes}
              onApply={(t) => {
                applySelectedTheme(t)
                close()
              }}
              onPreview={previewTheme}
              onReset={() => {
                const def = THEMES[0]
                applySelectedTheme(def)
                toast('Reset to default Office theme')
                close()
              }}
              onBrowse={() => {
                toast('Browse for themes: select a theme definition (.thmx)')
                close()
              }}
              onSave={() => {
                close()
                setShowSaveThemeDialog(true)
              }}
            />
          )}
        </Popover>

        <StyleSetGallery
          current={styleSetId}
          onApply={(set) => {
            setStyleSetId(set.id)
            applyStyleSet(set)
            toast(`Style set: ${set.label}`)
          }}
          onPreview={(set) => {
            if (set) applyStyleSet(set)
            else applyStyleSet(currentStyleSet)
          }}
          onMore={() => setShowMoreStyleSets(true)}
        />

        <BigMenu icon={<Palette size={22} />} label="Colors" width={260}>
          {(close) => (
            <ColorMenu
              current={colorSetId}
              sets={allColorSets}
              onApply={(set) => {
                setColorSetId(set.id)
                applyColors(set)
                document.documentElement.style.setProperty('--word-accent', set.colors[4])
                toast(`Color set: ${set.label}`)
                close()
              }}
              onPreview={(set) => {
                if (set) {
                  applyColors(set)
                  document.documentElement.style.setProperty('--word-accent', set.colors[4])
                } else {
                  applyColors(currentColorSet)
                  document.documentElement.style.setProperty('--word-accent', currentColorSet.colors[4])
                }
              }}
              onCustomize={() => {
                close()
                setShowCustomizeColorsDialog(true)
              }}
            />
          )}
        </BigMenu>

        <BigMenu icon={<span className="ds-font-a">A</span>} label="Fonts" width={280}>
          {(close) => (
            <FontsMenu
              current={fontPairId}
              pairs={allFontPairs}
              onApply={(pair) => {
                setFontPairId(pair.id)
                applyFonts(pair)
                const root = document.documentElement
                root.style.setProperty('--word-heading-font', pair.headingFont)
                root.style.setProperty('--word-body-font', pair.bodyFont)
                editor.chain().focus().selectAll().setFontFamily(pair.bodyFont).run()
                editor.commands.setTextSelection(editor.state.selection.to)
                toast(`Fonts: ${pair.label}`)
                close()
              }}
              onPreview={(pair) => {
                if (pair) applyFonts(pair)
                else applyFonts(currentFontPair)
              }}
              onCustomize={() => {
                close()
                setShowCustomizeFontsDialog(true)
              }}
            />
          )}
        </BigMenu>

        <RibbonStack>
          <Popover
            width={240}
            trigger={({ toggle }) => (
              <SmallButton icon={<AlignJustify size={15} />} label="Paragraph Spacing" wide onClick={toggle} />
            )}
          >
            {(close) => (
              <SpacingMenu
                current={paragraphPresetId}
                onApply={(preset) => {
                  setParagraphPresetId(preset.id)
                  setParagraphBefore(preset.before)
                  setParagraphAfter(preset.after)
                  applyParagraphSpacing(preset.before, preset.after, preset.lineHeight)
                  toast(`Paragraph Spacing: ${preset.label}`)
                  close()
                }}
                onDefault={() => {
                  setParagraphPresetId('default')
                  setParagraphBefore(0)
                  setParagraphAfter(8)
                  applyParagraphSpacing(0, 8, 1.08)
                  toast('Paragraph Spacing: Default')
                  close()
                }}
                onCustom={() => {
                  close()
                  setShowSpacingDialog(true)
                }}
              />
            )}
          </Popover>

          <Popover
            width={260}
            trigger={({ toggle }) => (
              <SmallButton icon={<Sparkles size={15} />} label="Effects" wide onClick={toggle} />
            )}
          >
            {(close) => (
              <EffectsMenu
                current={effectId}
                onApply={(effect) => {
                  setEffectId(effect.id)
                  applyEffects(effect)
                  toast(`Effects: ${effect.label}`)
                  close()
                }}
              />
            )}
          </Popover>

          <SmallButton
            icon={<span className={`default-check${isDefault ? ' on' : ''}`}>{isDefault ? <Check size={12} /> : null}</span>}
            label="Set as Default"
            wide
            onClick={() => setShowSetDefaultDialog(true)}
          />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Page Background" className="design-bg">
        <Popover
          width={330}
          trigger={({ toggle }) => (
            <BigButton icon={<PaintBucket size={22} />} label="Watermark" caret onClick={toggle} onCaret={toggle} />
          )}
        >
          {(close) => (
            <WatermarkGallery
              currentText={watermarkStyle.kind === 'text' ? watermarkStyle.text : null}
              currentLayout={watermarkStyle.layout}
              hasWatermark={watermarkStyle.kind !== 'none' || Boolean(page.watermark)}
              onPreset={(text, layout) => {
                const updated: WatermarkStyle = {
                  ...watermarkStyle,
                  kind: 'text',
                  text,
                  layout,
                  size: 90,
                  color: '#b4b4b4',
                  semitransparent: true,
                  font: 'Calibri',
                }
                setWatermarkStyle(updated)
                setPage({ ...page, watermark: text })
                applyWatermark(updated)
                toast(`Watermark: ${text}`)
                close()
              }}
              onCustom={() => {
                close()
                setShowWatermarkDialog(true)
              }}
              onRemove={() => {
                const updated: WatermarkStyle = { ...watermarkStyle, kind: 'none', text: '' }
                setWatermarkStyle(updated)
                setPage({ ...page, watermark: null })
                applyWatermark(null)
                toast('Watermark removed')
                close()
              }}
            />
          )}
        </Popover>

        <Popover
          width={260}
          trigger={({ toggle }) => (
            <BigButton icon={<PaintBucket size={22} />} label="Page Color" caret onClick={toggle} onCaret={toggle} />
          )}
        >
          {(close) => (
            <PageColorMenu
              colors={currentColorSet.colors}
              onPick={(c) => {
                setPage({ ...page, pageColor: c })
                toast(`Page color: ${c}`)
                close()
              }}
              onNoColor={() => {
                setPage({ ...page, pageColor: '#ffffff' })
                toast('Page color removed')
                close()
              }}
              onMore={() => {
                close()
                setShowMoreColorsDialog(true)
              }}
              onFill={() => {
                close()
                setShowFillEffectsDialog(true)
              }}
            />
          )}
        </Popover>

        <Popover
          width={190}
          trigger={({ toggle }) => (
            <BigButton
              icon={<Square size={22} />}
              label="Page Borders"
              caret
              active={pageBorders}
              onClick={() => setShowPageBordersDialog(true)}
              onCaret={toggle}
            />
          )}
        >
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Box"
                onClick={() => {
                  const cfg: PageBorderConfig = {
                    ...pageBorderConfig,
                    setting: 'box',
                    style: 'solid',
                    sides: { top: true, right: true, bottom: true, left: true },
                  }
                  setPageBorderConfig(cfg)
                  setPageBorders(true)
                  applyPageBorder(cfg)
                  close()
                  toast('Page border: Box')
                }}
              />
              <MenuItem
                label="Shadow"
                onClick={() => {
                  const cfg: PageBorderConfig = {
                    ...pageBorderConfig,
                    setting: 'shadow',
                    sides: { top: true, right: true, bottom: true, left: true },
                    shadow: '6px 6px 0 rgba(0,0,0,0.4)',
                  }
                  setPageBorderConfig(cfg)
                  setPageBorders(true)
                  applyPageBorder(cfg)
                  close()
                  toast('Page border: Shadow')
                }}
              />
              <MenuItem
                label="3-D"
                onClick={() => {
                  const cfg: PageBorderConfig = {
                    ...pageBorderConfig,
                    setting: '3d',
                    sides: { top: true, right: true, bottom: true, left: true },
                  }
                  setPageBorderConfig(cfg)
                  setPageBorders(true)
                  applyPageBorder(cfg)
                  close()
                  toast('Page border: 3-D')
                }}
              />
              <MenuSep />
              <MenuItem
                label="None"
                onClick={() => {
                  const cfg: PageBorderConfig = { ...pageBorderConfig, setting: 'none' }
                  setPageBorderConfig(cfg)
                  setPageBorders(false)
                  applyPageBorder(null)
                  close()
                  toast('Page border removed')
                }}
              />
              <MenuItem
                label="Page Borders…"
                onClick={() => {
                  close()
                  setShowPageBordersDialog(true)
                }}
              />
            </div>
          )}
        </Popover>
      </RibbonGroup>

      {/* Dialogs */}
      {showWatermarkDialog && (
        <WatermarkDialog
          initial={watermarkStyle}
          onApply={(style) => {
            setWatermarkStyle(style)
            if (style.kind === 'none') {
              setPage({ ...page, watermark: null })
              applyWatermark(null)
            } else if (style.kind === 'picture') {
              setPage({ ...page, watermark: ' ' })
              applyWatermark(style)
            } else {
              setPage({ ...page, watermark: style.text })
              applyWatermark(style)
            }
            setShowWatermarkDialog(false)
            toast('Watermark updated')
          }}
          onClose={() => setShowWatermarkDialog(false)}
        />
      )}

      {showPageBordersDialog && (
        <PageBordersDialog
          initial={pageBorderConfig}
          onApply={(cfg) => {
            setPageBorderConfig(cfg)
            setPageBorders(cfg.setting !== 'none')
            applyPageBorder(cfg)
            setShowPageBordersDialog(false)
            toast(`Page borders: ${cfg.setting}`)
          }}
          onClose={() => setShowPageBordersDialog(false)}
        />
      )}

      {showMoreColorsDialog && (
        <MoreColorsDialog
          initial={page.pageColor || '#ffffff'}
          onApply={(c) => {
            setPage({ ...page, pageColor: c })
            setShowMoreColorsDialog(false)
            toast(`Page color: ${c}`)
          }}
          onClose={() => setShowMoreColorsDialog(false)}
        />
      )}

      {showCustomizeColorsDialog && (
        <CustomizeColorsDialog
          initial={currentColorSet}
          fallback={currentTheme.colors}
          onSave={(newSet) => {
            setCustomColorSets((prev) => [...prev, newSet])
            setColorSetId(newSet.id)
            applyColors(newSet)
            document.documentElement.style.setProperty('--word-accent', newSet.colors[4])
            setShowCustomizeColorsDialog(false)
            toast(`Created color set: ${newSet.label}`)
          }}
          onClose={() => setShowCustomizeColorsDialog(false)}
        />
      )}

      {showFillEffectsDialog && (
        <FillEffectsDialog
          initial={page.pageColor || '#ffffff'}
          onApply={(fill) => {
            setPage({ ...page, pageColor: fill })
            setShowFillEffectsDialog(false)
            toast('Page fill applied')
          }}
          onClose={() => setShowFillEffectsDialog(false)}
        />
      )}

      {showCustomizeFontsDialog && (
        <CustomizeFontsDialog
          initial={currentFontPair}
          onSave={(newPair) => {
            setCustomFontPairs((prev) => [...prev, newPair])
            setFontPairId(newPair.id)
            applyFonts(newPair)
            const root = document.documentElement
            root.style.setProperty('--word-heading-font', newPair.headingFont)
            root.style.setProperty('--word-body-font', newPair.bodyFont)
            setShowCustomizeFontsDialog(false)
            toast(`Created fonts: ${newPair.label}`)
          }}
          onClose={() => setShowCustomizeFontsDialog(false)}
        />
      )}

      {showSpacingDialog && (
        <ParagraphSpacingDialog
          initial={{
            before: paragraphBefore,
            after: paragraphAfter,
            lineHeight: 1.08,
            font: currentFontPair.bodyFont,
            size: 11,
          }}
          onApply={(values) => {
            setParagraphBefore(values.before)
            setParagraphAfter(values.after)
            applyParagraphSpacing(values.before, values.after, values.lineHeight)
            setShowSpacingDialog(false)
            toast(`Custom paragraph spacing: ${values.before}pt / ${values.after}pt`)
          }}
          onClose={() => setShowSpacingDialog(false)}
        />
      )}

      {showSetDefaultDialog && (
        <SetDefaultDialog
          theme={currentTheme.label}
          style={currentStyleSet.label}
          colors={currentColorSet.label}
          fonts={currentFontPair.label}
          effects={currentEffect.label}
          onConfirm={(updateNormal) => {
            saveDesignDefaults({
              themeId: currentTheme.id,
              styleSetId: currentStyleSet.id,
              colorSetId: currentColorSet.id,
              fontPairId: currentFontPair.id,
              effectSetId: currentEffect.id,
              paragraphPreset: paragraphPresetId,
              paragraphBefore,
              paragraphAfter,
              lineHeight: 1.08,
              watermark: watermarkStyle,
              pageBorder: pageBorderConfig,
              customColorSets,
              customFontPairs,
              customThemes,
            })
            setIsDefault(true)
            setShowSetDefaultDialog(false)
            toast(updateNormal ? 'Default design saved and Normal template updated' : 'Default design saved')
          }}
          onClose={() => setShowSetDefaultDialog(false)}
        />
      )}

      {showSaveThemeDialog && (
        <NameDialog
          title="Save Current Theme"
          label="Theme name"
          initial="My Custom Theme"
          onSave={(name) => {
            const newTheme: ThemeDefinition = {
              id: `custom-theme-${Date.now()}`,
              label: name,
              headingFont: currentFontPair.headingFont,
              bodyFont: currentFontPair.bodyFont,
              accent: currentColorSet.colors[4],
              colors: currentColorSet.colors,
              effectId: currentEffect.id,
            }
            setCustomThemes((prev) => [...prev, newTheme])
            setTheme(newTheme.id)
            setShowSaveThemeDialog(false)
            toast(`Theme "${name}" saved`)
          }}
          onClose={() => setShowSaveThemeDialog(false)}
        />
      )}

      {showSaveStyleSetDialog && (
        <NameDialog
          title="Save as a New Style Set"
          label="Style set name"
          initial="My Style Set"
          onSave={(name) => {
            setShowSaveStyleSetDialog(false)
            toast(`Style set "${name}" saved`)
          }}
          onClose={() => setShowSaveStyleSetDialog(false)}
        />
      )}

      {showMoreStyleSets && (
        <div
          className="dialog-backdrop"
          onMouseDown={(e) => e.target === e.currentTarget && setShowMoreStyleSets(false)}
        >
          <div className="word-dialog ds-dialog" style={{ width: 340 }} role="dialog" aria-modal="true" aria-label="Style Sets">
            <div className="dialog-title">Style Sets</div>
            <div className="dialog-body" style={{ maxHeight: 380, overflowY: 'auto' }}>
              <MoreStyleSets
                current={styleSetId}
                onApply={(set) => {
                  setStyleSetId(set.id)
                  applyStyleSet(set)
                  setShowMoreStyleSets(false)
                  toast(`Style set: ${set.label}`)
                }}
                onReset={() => {
                  const def = STYLE_SETS[0]
                  setStyleSetId(def.id)
                  applyStyleSet(def)
                  setShowMoreStyleSets(false)
                  toast('Reset to default style set')
                }}
                onSave={() => {
                  setShowMoreStyleSets(false)
                  setShowSaveStyleSetDialog(true)
                }}
              />
            </div>
            <div className="dialog-actions">
              <button type="button" className="dialog-btn" onClick={() => setShowMoreStyleSets(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
