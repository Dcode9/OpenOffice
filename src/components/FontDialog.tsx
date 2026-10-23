import { useMemo, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { applyUnderlineStyle, setFontSize, setTextStyle } from '../editor/actions'
import { readTextStyleState, toHexColor, writeTextStyleState } from '../editor/textEffects'
import { FONTS, FONT_SIZES } from '../lib/constants'
import '../styles/home-advanced.css'

type Props = { editor: Editor; onClose: () => void; onApplied?: () => void; initialEffects?: boolean }

const EFFECTS = [
  { id: 'none', label: 'None', shadow: null, stroke: null },
  { id: 'shadow', label: 'Shadow', shadow: '2px 2px 2px rgba(0,0,0,0.45)', stroke: null },
  { id: 'glow', label: 'Glow', shadow: '0 0 6px rgba(74,158,255,0.9)', stroke: null },
  { id: 'outline', label: 'Outline', shadow: null, stroke: '1px #2f5496' },
  { id: 'outlineShadow', label: 'Outline + Shadow', shadow: '2px 2px 2px rgba(0,0,0,0.4)', stroke: '1px #2f5496' },
]

export default function FontDialog({ editor, onClose, onApplied, initialEffects = false }: Props) {
  const textStyle = editor.getAttributes('textStyle') || {}
  const [font, setFont] = useState(textStyle.fontFamily || 'Calibri')
  const [size, setSize] = useState(String(Number(textStyle.fontSize || 11)))
  const [bold, setBold] = useState(editor.isActive('bold'))
  const [italic, setItalic] = useState(editor.isActive('italic'))
  const [underline, setUnderline] = useState(editor.isActive('underline'))
  const underlineAttrs = editor.getAttributes('underline') || {}
  const [underlineStyle, setUnderlineStyle] = useState(underlineAttrs.underlineStyle || (editor.isActive('underline') ? 'single' : 'none'))
  const [underlineColor, setUnderlineColor] = useState(toHexColor(underlineAttrs.underlineColor || '#000000'))
  const [strike, setStrike] = useState(editor.isActive('strike'))
  const [sub, setSub] = useState(editor.isActive('subscript'))
  const [sup, setSup] = useState(editor.isActive('superscript'))
  const [smallCaps, setSmallCaps] = useState(Boolean(textStyle.smallCaps))
  const [allCaps, setAllCaps] = useState(Boolean(textStyle.allCaps))
  const [color, setColor] = useState(toHexColor(textStyle.color || '#000000'))
  const [effect, setEffect] = useState(() => {
    const current = readTextStyleState(editor)
    if (current.shadow && current.outline.mode === 'solid') return 'outlineShadow'
    if (current.shadow) return 'shadow'
    if (current.glow) return 'glow'
    if (current.outline.mode === 'solid') return 'outline'
    return 'none'
  })
  const [tab, setTab] = useState<'font' | 'effects' | 'advanced'>(initialEffects ? 'effects' : 'font')
  const [ligatures, setLigatures] = useState(textStyle.ligatures || 'normal')
  const [spacingMode, setSpacingMode] = useState<'normal' | 'expanded' | 'condensed'>('normal')
  const [spacingBy, setSpacingBy] = useState(String(Math.abs(Number(textStyle.letterSpacing || 0)) || 0.5))
  const [characterScale, setCharacterScale] = useState(String(textStyle.characterScale || 100))
  const [charPosition, setCharPosition] = useState(textStyle.charPosition || 'normal')
  const [positionBy, setPositionBy] = useState(String(textStyle.positionBy || 3))
  const [kerning, setKerning] = useState(textStyle.kerning !== 'none')
  const [kerningSize, setKerningSize] = useState(() => {
    const raw = String(textStyle.kerning || '')
    const value = Number(raw.split(':')[1])
    return Number.isFinite(value) && value > 0 ? String(value) : '12'
  })
  const [numberSpacing, setNumberSpacing] = useState(textStyle.numberSpacing || 'proportional')
  const [numberForm, setNumberForm] = useState(textStyle.numberForm || 'lining')
  const [stylisticSet, setStylisticSet] = useState(textStyle.stylisticSet || 'none')
  const [contextualAlternates, setContextualAlternates] = useState(textStyle.contextualAlternates || 'on')

  const preview = useMemo(
    () => ({
      fontFamily: font,
      fontSize: `${Math.min(48, Math.max(10, Number(size) || 11))}px`,
      fontWeight: bold ? 700 : 400,
      fontStyle: italic ? 'italic' : 'normal',
      textDecoration: underline ? 'underline' : strike ? 'line-through' : 'none',
      color,
      fontVariant: smallCaps ? 'small-caps' : 'normal',
      textTransform: allCaps ? 'uppercase' : 'none',
      verticalAlign: sup ? 'super' : sub ? 'sub' : 'baseline',
      fontVariantLigatures: ligatures,
      fontVariantNumeric: `${numberSpacing}-nums ${numberForm}-nums`,
      letterSpacing: spacingMode === 'normal' ? undefined : `${spacingMode === 'condensed' ? '-' : ''}${spacingBy}pt`,
      fontStretch: Number(characterScale) < 90 ? 'condensed' : Number(characterScale) < 100 ? 'semi-condensed' : Number(characterScale) > 110 ? 'expanded' : Number(characterScale) > 100 ? 'semi-expanded' : 'normal',
      position: charPosition === 'normal' ? undefined : ('relative' as const),
      top: charPosition === 'normal' ? undefined : `${charPosition === 'raised' ? -Number(positionBy) : Number(positionBy)}px`,
      fontKerning: (kerning ? 'normal' : 'none') as 'normal' | 'none',
      textShadow: EFFECTS.find((item) => item.id === effect)?.shadow || undefined,
      WebkitTextStroke: EFFECTS.find((item) => item.id === effect)?.stroke || undefined,
    }),
    [font, size, bold, italic, underline, strike, sub, sup, smallCaps, allCaps, color, effect, ligatures, numberSpacing, numberForm, spacingMode, spacingBy, characterScale, charPosition, positionBy, kerning],
  )

  const apply = () => {
    if (bold !== editor.isActive('bold')) editor.chain().focus().toggleBold().run()
    if (italic !== editor.isActive('italic')) editor.chain().focus().toggleItalic().run()
    applyUnderlineStyle(editor, underlineStyle, underlineColor)
    if (strike !== editor.isActive('strike')) editor.chain().focus().toggleStrike().run()
    if (sub !== editor.isActive('subscript')) editor.chain().focus().toggleSubscript().run()
    if (sup !== editor.isActive('superscript')) editor.chain().focus().toggleSuperscript().run()
    editor.chain().focus().setFontFamily(font).run()
    setFontSize(editor, size)
    const effectsState = readTextStyleState(editor)
    effectsState.legacyShadow = null
    effectsState.fill = { ...effectsState.fill, mode: 'solid', color }
    effectsState.outline = { ...effectsState.outline, mode: 'none' }
    effectsState.shadow = null
    effectsState.glow = null
    effectsState.reflection = null
    effectsState.softEdges = null
    effectsState.threeDFormat = null
    effectsState.threeDRotation = null
    if (effect === 'shadow' || effect === 'outlineShadow') {
      effectsState.shadow = { preset: 'offset', color: '#000000', transparency: 55, size: 60, blur: 3, angle: 45, distance: 2 }
    }
    if (effect === 'glow') {
      effectsState.glow = { preset: 'glow', color: '#4a9eff', size: 6, transparency: 10 }
    }
    if (effect === 'outline' || effect === 'outlineShadow') {
      effectsState.outline = { ...effectsState.outline, mode: 'solid', color: '#2f5496', width: 1, transparency: 0 }
    }
    writeTextStyleState(editor, effectsState, color)
    setTextStyle(editor, {
      smallCaps,
      allCaps,
      ligatures,
      letterSpacing:
        spacingMode === 'normal'
          ? null
          : `${spacingMode === 'condensed' ? '-' : ''}${Math.abs(Number(spacingBy) || 0)}`,
      characterScale: String(Number(characterScale) || 100),
      charPosition,
      positionBy: String(Math.abs(Number(positionBy) || 3)),
      kerning: kerning ? `normal:${Math.abs(Number(kerningSize) || 12)}` : 'none',
      numberSpacing,
      numberForm,
      stylisticSet: stylisticSet === 'none' ? null : stylisticSet,
      contextualAlternates,
    })
    onApplied?.()
  }

  const styleValue = bold && italic ? 'Bold Italic' : bold ? 'Bold' : italic ? 'Italic' : 'Regular'

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog font-dialog" role="dialog" aria-modal="true" aria-label="Font">
        <div className="dialog-title">Font</div>
        <div className="dialog-body">
          <div className="dialog-tabs">
            <button className={`dialog-tab${tab === 'font' ? ' active' : ''}`} onClick={() => setTab('font')}>Font</button>
            <button className={`dialog-tab${tab === 'effects' ? ' active' : ''}`} onClick={() => setTab('effects')}>Text Effects</button>
            <button className={`dialog-tab${tab === 'advanced' ? ' active' : ''}`} onClick={() => setTab('advanced')}>Advanced</button>
          </div>
          <div className="dialog-grid">
            <label>Font:</label>
            <select value={font} onChange={(e) => setFont(e.target.value)}>
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <label>Font style:</label>
            <select value={styleValue} onChange={(e) => {
              const v = e.target.value
              setBold(v.includes('Bold'))
              setItalic(v.includes('Italic'))
            }}>
              <option>Regular</option>
              <option>Italic</option>
              <option>Bold</option>
              <option>Bold Italic</option>
            </select>
            <label>Size:</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label>Font color:</label>
            <div className="dialog-color-row">
              <input type="color" value={toHexColor(color)} onChange={(e) => setColor(e.target.value)} />
              <span>{color}</span>
            </div>
            <label>Underline:</label>
            <select value={underlineStyle} onChange={(e) => { setUnderlineStyle(e.target.value); setUnderline(e.target.value !== 'none') }}>
              <option value="none">None</option>
              <option value="single">Single</option>
              <option value="double">Double</option>
              <option value="thick">Thick</option>
              <option value="dotted">Dotted</option>
              <option value="dashed">Dashed</option>
              <option value="dot-dash">Dot-Dash</option>
              <option value="dot-dot-dash">Dot-Dot-Dash</option>
              <option value="wave">Wave</option>
            </select>
            <label>Underline color:</label>
            <div className="dialog-color-row">
              <input type="color" value={toHexColor(underlineColor)} onChange={(e) => setUnderlineColor(e.target.value)} />
              <span>{underlineColor}</span>
            </div>
          </div>

          <div className="dialog-section">
            <label className="check-row"><input type="checkbox" checked={strike} onChange={(e) => setStrike(e.target.checked)} /> Strikethrough</label>
            <label className="check-row"><input type="checkbox" checked={sub} onChange={(e) => { setSub(e.target.checked); if (e.target.checked) setSup(false) }} /> Subscript</label>
            <label className="check-row"><input type="checkbox" checked={sup} onChange={(e) => { setSup(e.target.checked); if (e.target.checked) setSub(false) }} /> Superscript</label>
            <label className="check-row"><input type="checkbox" checked={smallCaps} onChange={(e) => setSmallCaps(e.target.checked)} /> Small caps</label>
            <label className="check-row"><input type="checkbox" checked={allCaps} onChange={(e) => setAllCaps(e.target.checked)} /> All caps</label>
            <label className="check-row">Ligatures:
              <select value={ligatures} onChange={(e) => setLigatures(e.target.value)}>
                <option value="none">None</option>
                <option value="normal">Standard Only</option>
                <option value="common-ligatures">Standard and Contextual</option>
                <option value="historical-ligatures">Historical and Discretionary</option>
                <option value="contextual">Contextual</option>
                <option value="discretionary-ligatures">Discretionary</option>
                <option value="all">All</option>
              </select>
            </label>
          </div>

          {tab === 'effects' && (
            <div className="dialog-section effect-grid">
              {EFFECTS.map((item) => (
                <button key={item.id} className={`effect-choice${effect === item.id ? ' active' : ''}`} onClick={() => setEffect(item.id)}>
                  <span style={{ textShadow: item.shadow || undefined, WebkitTextStroke: item.stroke || undefined }}>Aa</span>
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {tab === 'advanced' && (
            <div className="dialog-section advanced-grid">
              <div className="dialog-field-label">Character Spacing</div>
              <div className="dialog-row">
                <label>Spacing:</label>
                <select value={spacingMode} onChange={(e) => setSpacingMode(e.target.value as typeof spacingMode)}>
                  <option value="normal">Normal</option>
                  <option value="expanded">Expanded</option>
                  <option value="condensed">Condensed</option>
                </select>
                <label>By:</label>
                <input className="dialog-input short" type="number" step="0.1" value={spacingBy} onChange={(e) => setSpacingBy(e.target.value)} disabled={spacingMode === 'normal'} />
                <span>pt</span>
              </div>
              <div className="dialog-row">
                <label>Scale:</label>
                <input className="dialog-input short" type="number" min={1} max={600} value={characterScale} onChange={(e) => setCharacterScale(e.target.value)} />
                <span>%</span>
              </div>
              <div className="dialog-row">
                <label>Position:</label>
                <select value={charPosition} onChange={(e) => setCharPosition(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="raised">Raised</option>
                  <option value="lowered">Lowered</option>
                </select>
                <label>By:</label>
                <input className="dialog-input short" type="number" step="0.5" value={positionBy} onChange={(e) => setPositionBy(e.target.value)} disabled={charPosition === 'normal'} />
                <span>pt</span>
              </div>
              <div className="dialog-row">
                <label className="check-row"><input type="checkbox" checked={kerning} onChange={(e) => setKerning(e.target.checked)} /> Kerning for fonts</label>
                <label>Points and above:</label>
                <input className="dialog-input short" type="number" min={1} max={1638} value={kerningSize} onChange={(e) => setKerningSize(e.target.value)} disabled={!kerning} />
              </div>
              <div className="dialog-field-label">OpenType Features</div>
              <div className="dialog-row">
                <label>Ligatures:</label>
                <select value={ligatures} onChange={(e) => setLigatures(e.target.value)}>
                  <option value="none">None</option>
                  <option value="normal">Standard Only</option>
                  <option value="common-ligatures">Standard and Contextual</option>
                  <option value="historical-ligatures">Historical and Discretionary</option>
                  <option value="contextual">Contextual</option>
                  <option value="discretionary-ligatures">Discretionary</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div className="dialog-row">
                <label>Number spacing:</label>
                <select value={numberSpacing} onChange={(e) => setNumberSpacing(e.target.value)}>
                  <option value="proportional">Proportional</option>
                  <option value="tabular">Tabular</option>
                </select>
              </div>
              <div className="dialog-row">
                <label>Number form:</label>
                <select value={numberForm} onChange={(e) => setNumberForm(e.target.value)}>
                  <option value="lining">Lining</option>
                  <option value="oldstyle">Old-style</option>
                </select>
              </div>
              <div className="dialog-row">
                <label>Stylistic set:</label>
                <select value={stylisticSet} onChange={(e) => setStylisticSet(e.target.value)}>
                  <option value="none">None</option>
                  {Array.from({ length: 20 }, (_, index) => index + 1).map((set) => (
                    <option key={set} value={String(set)}>Set {set}</option>
                  ))}
                </select>
              </div>
              <label className="check-row"><input type="checkbox" checked={contextualAlternates === 'on'} onChange={(e) => setContextualAlternates(e.target.checked ? 'on' : 'off')} /> Use contextual alternates</label>
            </div>
          )}

          <div className="font-preview">
            <div className="dialog-field-label">Preview</div>
            <div className="font-preview-box" style={preview}>AaBbCc 123</div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" onClick={() => { apply(); onClose() }}>OK</button>
          <button className="dialog-btn" onClick={onClose}>Cancel</button>
          <button className="dialog-btn" onClick={apply}>Apply</button>
        </div>
      </div>
    </div>
  )
}
