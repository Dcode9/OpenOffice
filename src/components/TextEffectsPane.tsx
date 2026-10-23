import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  readTextStyleState,
  toHexColor,
  writeTextStyleState,
  type GlowState,
  type ReflectionState,
  type ShadowState,
  type SoftEdgesState,
  type TextFillState,
  type TextOutlineState,
  type TextStyleState,
  type ThreeDFormatState,
  type ThreeDRotationState,
} from '../editor/textEffects'
import '../styles/home-advanced.css'

type Props = {
  editor: Editor
  onClose: () => void
  initialTab?: 'fill' | 'effects'
}

type PaneTab = 'fill' | 'effects'
type SectionId = 'shadow' | 'reflection' | 'glow' | 'soft' | 'threeD' | 'rotation'

const SHADOW_PRESETS: { id: string; label: string; build: () => ShadowState }[] = [
  { id: 'outer', label: 'Offset Diagonal Bottom Right', build: () => ({ preset: 'outer', color: '#000000', transparency: 55, size: 60, blur: 4, angle: 45, distance: 3 }) },
  { id: 'bottom', label: 'Offset Bottom', build: () => ({ preset: 'bottom', color: '#000000', transparency: 55, size: 60, blur: 4, angle: 90, distance: 3 }) },
  { id: 'top', label: 'Offset Top', build: () => ({ preset: 'top', color: '#000000', transparency: 55, size: 60, blur: 4, angle: 270, distance: 3 }) },
  { id: 'left', label: 'Offset Left', build: () => ({ preset: 'left', color: '#000000', transparency: 55, size: 60, blur: 4, angle: 180, distance: 3 }) },
  { id: 'right', label: 'Offset Right', build: () => ({ preset: 'right', color: '#000000', transparency: 55, size: 60, blur: 4, angle: 0, distance: 3 }) },
]

const REFLECTION_PRESETS: { id: string; label: string; build: () => ReflectionState }[] = [
  { id: 'tight', label: 'Tight Reflection', build: () => ({ preset: 'tight', transparency: 60, size: 90, blur: 1, distance: 0 }) },
  { id: 'half', label: 'Half Reflection', build: () => ({ preset: 'half', transparency: 50, size: 70, blur: 2, distance: 2 }) },
  { id: 'full', label: 'Full Reflection', build: () => ({ preset: 'full', transparency: 40, size: 100, blur: 3, distance: 4 }) },
]

const GLOW_PRESETS: { id: string; label: string; build: () => GlowState }[] = [
  { id: 'glow', label: 'Glow', build: () => ({ preset: 'glow', color: '#4a9eff', size: 6, transparency: 10 }) },
  { id: 'colorful', label: 'Colorful Glow', build: () => ({ preset: 'colorful', color: '#ff6b35', size: 10, transparency: 20 }) },
  { id: 'subtle', label: 'Subtle Glow', build: () => ({ preset: 'subtle', color: '#bfbfbf', size: 3, transparency: 0 }) },
]

const SOFT_PRESETS = [
  { id: '1', label: '1 pt', size: 1.33 },
  { id: '2.5', label: '2.5 pt', size: 3.33 },
  { id: '5', label: '5 pt', size: 6.67 },
  { id: '10', label: '10 pt', size: 13.33 },
  { id: '25', label: '25 pt', size: 33.33 },
  { id: '50', label: '50 pt', size: 66.67 },
]

const BEVELS = [
  { id: 'none', label: 'None' },
  { id: 'circle', label: 'Circle' },
  { id: 'relaxed', label: 'Relaxed Inset' },
  { id: 'slope', label: 'Slope' },
  { id: 'cross', label: 'Cross' },
  { id: 'cool', label: 'Cool Slant' },
  { id: 'angle', label: 'Angle' },
  { id: 'soft', label: 'Soft Round' },
]

const MATERIALS = [
  { id: 'matte', label: 'Standard - Matte' },
  { id: 'warm', label: 'Standard - Warm Matte' },
  { id: 'plastic', label: 'Standard - Plastic' },
  { id: 'metal', label: 'Standard - Metal' },
  { id: 'darkEdge', label: 'Special - Dark Edge' },
  { id: 'softEdge', label: 'Special - Soft Edge' },
  { id: 'flat', label: 'Special - Flat' },
  { id: 'wireframe', label: 'Special - Wireframe' },
  { id: 'clear', label: 'Translucent - Clear' },
  { id: 'powder', label: 'Translucent - Powder' },
  { id: 'subtle', label: 'Translucent - Subtle' },
  { id: 'blended', label: 'Translucent - Blended' },
]

const LIGHTING = [
  { id: 'normal', label: 'Neutral' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'special', label: 'Special' },
]

const TEXTURES = [
  { id: 'parchment', label: 'Parchment' },
  { id: 'canvas', label: 'Canvas' },
  { id: 'marble', label: 'Marble' },
  { id: 'wood', label: 'Wood' },
]

const OUTLINE_DASHES = [
  { id: 'solid', label: 'Solid' },
  { id: 'dot', label: 'Round Dot' },
  { id: 'squareDot', label: 'Square Dot' },
  { id: 'dash', label: 'Dash' },
  { id: 'dashDot', label: 'Dash Dot' },
  { id: 'longDash', label: 'Long Dash' },
]

const ROTATION_PRESETS = [
  { id: 'none', label: 'No Rotation', x: 0, y: 0, z: 0 },
  { id: 'subtle', label: 'Subtle', x: 10, y: 10, z: 0 },
  { id: 'isometric', label: 'Isometric', x: 35, y: -35, z: 0 },
  { id: 'tilt', label: 'Tilt', x: 35, y: 0, z: 0 },
  { id: 'perspective', label: 'Perspective', x: 20, y: 25, z: 0 },
]

function cloneState(state: TextStyleState): TextStyleState {
  return JSON.parse(JSON.stringify(state)) as TextStyleState
}

function defaultShadow(): ShadowState {
  return SHADOW_PRESETS[0].build()
}

function defaultReflection(): ReflectionState {
  return REFLECTION_PRESETS[0].build()
}

function defaultGlow(): GlowState {
  return GLOW_PRESETS[0].build()
}

function defaultSoft(): SoftEdgesState {
  return { preset: '2.5', size: 3.33 }
}

function defaultThreeD(): ThreeDFormatState {
  return {
    preset: 'circle',
    topBevel: 'circle',
    bottomBevel: 'none',
    width: 6,
    height: 6,
    depth: 2,
    depthColor: '#7f7f7f',
    contour: 0,
    contourColor: '#000000',
    material: 'matte',
    lighting: 'normal',
    angle: 45,
  }
}

function defaultRotation(): ThreeDRotationState {
  return { preset: 'subtle', x: 10, y: 10, z: 0, perspective: 800 }
}

function Chevron({ open }: { open: boolean }) {
  return <span className="tep-chevron">{open ? '▾' : '▸'}</span>
}

function Section({
  id,
  title,
  open,
  onToggle,
  onReset,
  children,
}: {
  id: SectionId
  title: string
  open: boolean
  onToggle: (id: SectionId) => void
  onReset?: () => void
  children: React.ReactNode
}) {
  return (
    <div className="tep-section">
      <button type="button" className="tep-section-head" onClick={() => onToggle(id)}>
        <Chevron open={open} />
        <span>{title}</span>
      </button>
      {open && (
        <div className="tep-section-body">
          {children}
          {onReset && <button type="button" className="tep-reset" onClick={onReset}>Reset</button>}
        </div>
      )}
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
}) {
  return (
    <div className="tep-slider">
      <span className="tep-slider-label">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      <input type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
      {suffix && <span className="tep-suffix">{suffix}</span>}
    </div>
  )
}

export default function TextEffectsPane({ editor, onClose, initialTab = 'effects' }: Props) {
  const [tab, setTab] = useState<PaneTab>(initialTab)
  const [state, setState] = useState<TextStyleState>(() => readTextStyleState(editor))
  const [open, setOpen] = useState<Record<SectionId, boolean>>({
    shadow: true,
    reflection: true,
    glow: true,
    soft: false,
    threeD: false,
    rotation: false,
  })
  const applying = useRef(false)

  useEffect(() => {
    const sync = () => {
      if (applying.current) return
      setState(readTextStyleState(editor))
    }
    editor.on('transaction', sync)
    editor.on('selectionUpdate', sync)
    return () => {
      editor.off('transaction', sync)
      editor.off('selectionUpdate', sync)
    }
  }, [editor])

  const apply = (next: TextStyleState) => {
    const cloned = cloneState(next)
    applying.current = true
    writeTextStyleState(editor, cloned)
    applying.current = false
    setState(cloned)
  }

  const patch = (part: Partial<TextStyleState>) => apply({ ...state, ...part })
  const patchFill = (part: Partial<TextFillState>) => patch({ fill: { ...state.fill, ...part } })
  const patchOutline = (part: Partial<TextOutlineState>) => patch({ outline: { ...state.outline, ...part } })
  const toggleSection = (id: SectionId) => setOpen((prev) => ({ ...prev, [id]: !prev[id] }))

  const fillColor = state.fill.color
  const outlineColor = state.outline.color
  const shadow = state.shadow
  const reflection = state.reflection
  const glow = state.glow
  const soft = state.softEdges
  const threeD = state.threeDFormat
  const rotation = state.threeDRotation

  return (
    <aside className="tep-pane" aria-label="Format Text Effects">
      <div className="tep-header">
        <span>Format Text Effects</span>
        <button type="button" className="tep-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="tep-tabs">
        <button type="button" className={tab === 'fill' ? 'active' : ''} onClick={() => setTab('fill')}>Text Fill &amp; Outline</button>
        <button type="button" className={tab === 'effects' ? 'active' : ''} onClick={() => setTab('effects')}>Text Effects</button>
      </div>

      <div className="tep-body">
        {tab === 'fill' ? (
          <>
            <div className="tep-heading">Text Fill</div>
            <label className="tep-radio"><input type="radio" checked={state.fill.mode === 'none'} onChange={() => patchFill({ mode: 'none' })} />No fill</label>
            <label className="tep-radio"><input type="radio" checked={state.fill.mode === 'solid'} onChange={() => patchFill({ mode: 'solid' })} />Solid fill</label>
            {state.fill.mode === 'solid' && (
              <div className="tep-indent">
                <div className="tep-row">
                  <span>Color</span>
                  <input type="color" value={toHexColor(fillColor)} onChange={(event) => patchFill({ color: event.target.value })} />
                </div>
                <Slider label="Transparency" value={state.fill.transparency} min={0} max={100} suffix="%" onChange={(value) => patchFill({ transparency: value })} />
              </div>
            )}
            <label className="tep-radio"><input type="radio" checked={state.fill.mode === 'gradient'} onChange={() => patchFill({ mode: 'gradient' })} />Gradient fill</label>
            {state.fill.mode === 'gradient' && (
              <div className="tep-indent">
                <div className="tep-row">
                  <span>Color 1</span>
                  <input type="color" value={toHexColor(fillColor)} onChange={(event) => patchFill({ color: event.target.value })} />
                </div>
                <div className="tep-row">
                  <span>Color 2</span>
                  <input type="color" value={toHexColor(state.fill.color2)} onChange={(event) => patchFill({ color2: event.target.value })} />
                </div>
                <div className="tep-row">
                  <span>Type</span>
                  <select value={state.fill.type} onChange={(event) => patchFill({ type: event.target.value as TextFillState['type'] })}>
                    <option value="linear">Linear</option>
                    <option value="radial">Radial</option>
                    <option value="rectangular">Rectangular</option>
                    <option value="path">Path</option>
                  </select>
                </div>
                {state.fill.type === 'linear' && (
                  <Slider label="Angle" value={state.fill.angle} min={0} max={360} suffix="°" onChange={(value) => patchFill({ angle: value })} />
                )}
                <Slider label="Transparency" value={state.fill.transparency} min={0} max={100} suffix="%" onChange={(value) => patchFill({ transparency: value })} />
              </div>
            )}
            <label className="tep-radio"><input type="radio" checked={state.fill.mode === 'texture'} onChange={() => patchFill({ mode: 'texture' })} />Picture or texture fill</label>
            {state.fill.mode === 'texture' && (
              <div className="tep-indent">
                <div className="tep-row">
                  <span>Texture</span>
                  <select value={state.fill.texture || 'parchment'} onChange={(event) => patchFill({ texture: event.target.value })}>
                    {TEXTURES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </div>
                <Slider label="Transparency" value={state.fill.transparency} min={0} max={100} suffix="%" onChange={(value) => patchFill({ transparency: value })} />
              </div>
            )}

            <div className="tep-heading">Text Outline</div>
            <label className="tep-radio"><input type="radio" checked={state.outline.mode === 'none'} onChange={() => patchOutline({ mode: 'none' })} />No line</label>
            <label className="tep-radio"><input type="radio" checked={state.outline.mode === 'solid'} onChange={() => patchOutline({ mode: 'solid' })} />Solid line</label>
            <label className="tep-radio"><input type="radio" checked={state.outline.mode === 'gradient'} onChange={() => patchOutline({ mode: 'gradient' })} />Gradient line</label>
            {state.outline.mode !== 'none' && (
              <div className="tep-indent">
                <div className="tep-row">
                  <span>Color 1</span>
                  <input type="color" value={toHexColor(outlineColor)} onChange={(event) => patchOutline({ color: event.target.value })} />
                </div>
                {state.outline.mode === 'gradient' && (
                  <>
                    <div className="tep-row">
                      <span>Color 2</span>
                      <input type="color" value={toHexColor(state.outline.color2)} onChange={(event) => patchOutline({ color2: event.target.value })} />
                    </div>
                    <Slider label="Angle" value={state.outline.angle} min={0} max={360} suffix="°" onChange={(value) => patchOutline({ angle: value })} />
                  </>
                )}
                <Slider label="Width" value={state.outline.width} min={0.25} max={6} step={0.25} suffix="pt" onChange={(value) => patchOutline({ width: value })} />
                <Slider label="Transparency" value={state.outline.transparency} min={0} max={100} suffix="%" onChange={(value) => patchOutline({ transparency: value })} />
                <div className="tep-row">
                  <span>Dash type</span>
                  <select value={state.outline.dash} onChange={(event) => patchOutline({ dash: event.target.value })}>
                    {OUTLINE_DASHES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                  </select>
                </div>
                <div className="tep-row">
                  <span>Compound type</span>
                  <select value={state.outline.compound} onChange={(event) => patchOutline({ compound: event.target.value })}>
                    <option value="simple">Simple</option>
                    <option value="double">Double</option>
                    <option value="thickThin">Thick Thin</option>
                    <option value="thinThick">Thin Thick</option>
                    <option value="triple">Triple</option>
                  </select>
                </div>
                <div className="tep-row">
                  <span>Cap type</span>
                  <select value={state.outline.cap} onChange={(event) => patchOutline({ cap: event.target.value })}>
                    <option value="flat">Flat</option>
                    <option value="round">Round</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                <div className="tep-row">
                  <span>Join type</span>
                  <select value={state.outline.join} onChange={(event) => patchOutline({ join: event.target.value })}>
                    <option value="miter">Miter</option>
                    <option value="round">Round</option>
                    <option value="bevel">Bevel</option>
                  </select>
                </div>
              </div>
            )}
            <div className="tep-note">Dash, compound, cap and join options are stored with the text; browsers render the nearest supported outline.</div>
          </>
        ) : (
          <>
            <Section id="shadow" title="Shadow" open={open.shadow} onToggle={toggleSection} onReset={() => patch({ shadow: null })}>
              <div className="tep-row">
                <span>Presets</span>
                <select
                  value={shadow?.preset || 'none'}
                  onChange={(event) => {
                    if (event.target.value === 'none') patch({ shadow: null })
                    else {
                      const preset = SHADOW_PRESETS.find((item) => item.id === event.target.value)
                      patch({ shadow: preset ? preset.build() : defaultShadow() })
                    }
                  }}
                >
                  <option value="none">No Shadow</option>
                  {SHADOW_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              {shadow && (
                <div className="tep-indent">
                  <div className="tep-row">
                    <span>Color</span>
                    <input type="color" value={toHexColor(shadow.color)} onChange={(event) => patch({ shadow: { ...shadow, color: event.target.value } })} />
                  </div>
                  <Slider label="Transparency" value={shadow.transparency} min={0} max={100} suffix="%" onChange={(value) => patch({ shadow: { ...shadow, transparency: value } })} />
                  <Slider label="Size" value={shadow.size} min={0} max={150} suffix="%" onChange={(value) => patch({ shadow: { ...shadow, size: value } })} />
                  <Slider label="Blur" value={shadow.blur} min={0} max={20} suffix="pt" onChange={(value) => patch({ shadow: { ...shadow, blur: value } })} />
                  <Slider label="Angle" value={shadow.angle} min={0} max={360} suffix="°" onChange={(value) => patch({ shadow: { ...shadow, angle: value } })} />
                  <Slider label="Distance" value={shadow.distance} min={0} max={20} suffix="pt" onChange={(value) => patch({ shadow: { ...shadow, distance: value } })} />
                </div>
              )}
            </Section>

            <Section id="reflection" title="Reflection" open={open.reflection} onToggle={toggleSection} onReset={() => patch({ reflection: null })}>
              <div className="tep-row">
                <span>Presets</span>
                <select
                  value={reflection?.preset || 'none'}
                  onChange={(event) => {
                    if (event.target.value === 'none') patch({ reflection: null })
                    else {
                      const preset = REFLECTION_PRESETS.find((item) => item.id === event.target.value)
                      patch({ reflection: preset ? preset.build() : defaultReflection() })
                    }
                  }}
                >
                  <option value="none">No Reflection</option>
                  {REFLECTION_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              {reflection && (
                <div className="tep-indent">
                  <Slider label="Transparency" value={reflection.transparency} min={0} max={100} suffix="%" onChange={(value) => patch({ reflection: { ...reflection, transparency: value } })} />
                  <Slider label="Size" value={reflection.size} min={0} max={100} suffix="%" onChange={(value) => patch({ reflection: { ...reflection, size: value } })} />
                  <Slider label="Blur" value={reflection.blur} min={0} max={20} suffix="pt" onChange={(value) => patch({ reflection: { ...reflection, blur: value } })} />
                  <Slider label="Distance" value={reflection.distance} min={0} max={20} suffix="pt" onChange={(value) => patch({ reflection: { ...reflection, distance: value } })} />
                </div>
              )}
            </Section>

            <Section id="glow" title="Glow" open={open.glow} onToggle={toggleSection} onReset={() => patch({ glow: null })}>
              <div className="tep-row">
                <span>Presets</span>
                <select
                  value={glow?.preset || 'none'}
                  onChange={(event) => {
                    if (event.target.value === 'none') patch({ glow: null })
                    else {
                      const preset = GLOW_PRESETS.find((item) => item.id === event.target.value)
                      patch({ glow: preset ? preset.build() : defaultGlow() })
                    }
                  }}
                >
                  <option value="none">No Glow</option>
                  {GLOW_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              {glow && (
                <div className="tep-indent">
                  <div className="tep-row">
                    <span>Color</span>
                    <input type="color" value={toHexColor(glow.color)} onChange={(event) => patch({ glow: { ...glow, color: event.target.value } })} />
                  </div>
                  <Slider label="Size" value={glow.size} min={0} max={30} suffix="pt" onChange={(value) => patch({ glow: { ...glow, size: value } })} />
                  <Slider label="Transparency" value={glow.transparency} min={0} max={100} suffix="%" onChange={(value) => patch({ glow: { ...glow, transparency: value } })} />
                </div>
              )}
            </Section>

            <Section id="soft" title="Soft Edges" open={open.soft} onToggle={toggleSection} onReset={() => patch({ softEdges: null })}>
              <div className="tep-row">
                <span>Presets</span>
                <select
                  value={soft?.preset || 'none'}
                  onChange={(event) => {
                    if (event.target.value === 'none') patch({ softEdges: null })
                    else {
                      const preset = SOFT_PRESETS.find((item) => item.id === event.target.value)
                      patch({ softEdges: { preset: event.target.value, size: preset?.size || 3.33 } })
                    }
                  }}
                >
                  <option value="none">No Soft Edges</option>
                  {SOFT_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              {soft && <Slider label="Size" value={soft.size} min={0} max={100} step={0.5} suffix="px" onChange={(value) => patch({ softEdges: { ...soft, preset: 'custom', size: value } })} />}
            </Section>

            <Section id="threeD" title="3-D Format" open={open.threeD} onToggle={toggleSection} onReset={() => patch({ threeDFormat: null })}>
              <div className="tep-row">
                <span>Presets</span>
                <select
                  value={threeD?.preset || 'none'}
                  onChange={(event) => {
                    if (event.target.value === 'none') patch({ threeDFormat: null })
                    else patch({ threeDFormat: { ...(threeD || defaultThreeD()), preset: event.target.value } })
                  }}
                >
                  <option value="none">No 3-D Format</option>
                  <option value="circle">Circle</option>
                  <option value="relaxed">Relaxed Inset</option>
                  <option value="slope">Slope</option>
                  <option value="cross">Cross</option>
                  <option value="cool">Cool Slant</option>
                  <option value="angle">Angle</option>
                </select>
              </div>
              {threeD && (
                <div className="tep-indent">
                  <div className="tep-row">
                    <span>Top bevel</span>
                    <select value={threeD.topBevel} onChange={(event) => patch({ threeDFormat: { ...threeD, topBevel: event.target.value } })}>
                      {BEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="tep-row">
                    <span>Bottom bevel</span>
                    <select value={threeD.bottomBevel || 'none'} onChange={(event) => patch({ threeDFormat: { ...threeD, bottomBevel: event.target.value } })}>
                      {BEVELS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <Slider label="Width" value={threeD.width} min={0} max={30} suffix="pt" onChange={(value) => patch({ threeDFormat: { ...threeD, width: value } })} />
                  <Slider label="Height" value={threeD.height} min={0} max={30} suffix="pt" onChange={(value) => patch({ threeDFormat: { ...threeD, height: value } })} />
                  <Slider label="Depth" value={threeD.depth} min={0} max={20} step={0.5} suffix="pt" onChange={(value) => patch({ threeDFormat: { ...threeD, depth: value } })} />
                  <div className="tep-row">
                    <span>Depth color</span>
                    <input type="color" value={toHexColor(threeD.depthColor)} onChange={(event) => patch({ threeDFormat: { ...threeD, depthColor: event.target.value } })} />
                  </div>
                  <Slider label="Contour" value={threeD.contour} min={0} max={10} step={0.25} suffix="pt" onChange={(value) => patch({ threeDFormat: { ...threeD, contour: value } })} />
                  <div className="tep-row">
                    <span>Contour color</span>
                    <input type="color" value={toHexColor(threeD.contourColor)} onChange={(event) => patch({ threeDFormat: { ...threeD, contourColor: event.target.value } })} />
                  </div>
                  <div className="tep-row">
                    <span>Material</span>
                    <select value={threeD.material} onChange={(event) => patch({ threeDFormat: { ...threeD, material: event.target.value } })}>
                      {MATERIALS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <div className="tep-row">
                    <span>Lighting</span>
                    <select value={threeD.lighting} onChange={(event) => patch({ threeDFormat: { ...threeD, lighting: event.target.value } })}>
                      {LIGHTING.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                    </select>
                  </div>
                  <Slider label="Angle" value={threeD.angle} min={0} max={360} suffix="°" onChange={(value) => patch({ threeDFormat: { ...threeD, angle: value } })} />
                </div>
              )}
            </Section>

            <Section id="rotation" title="3-D Rotation" open={open.rotation} onToggle={toggleSection} onReset={() => patch({ threeDRotation: null })}>
              <div className="tep-row">
                <span>Presets</span>
                <select
                  value={rotation?.preset || 'none'}
                  onChange={(event) => {
                    if (event.target.value === 'none') patch({ threeDRotation: null })
                    else {
                      const preset = ROTATION_PRESETS.find((item) => item.id === event.target.value)
                      patch({ threeDRotation: { ...(rotation || defaultRotation()), preset: event.target.value, x: preset?.x || 0, y: preset?.y || 0, z: preset?.z || 0 } })
                    }
                  }}
                >
                  <option value="none">No Rotation</option>
                  {ROTATION_PRESETS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </div>
              {rotation && (
                <div className="tep-indent">
                  <Slider label="X rotation" value={rotation.x} min={-90} max={90} suffix="°" onChange={(value) => patch({ threeDRotation: { ...rotation, preset: 'custom', x: value } })} />
                  <Slider label="Y rotation" value={rotation.y} min={-90} max={90} suffix="°" onChange={(value) => patch({ threeDRotation: { ...rotation, preset: 'custom', y: value } })} />
                  <Slider label="Z rotation" value={rotation.z} min={-90} max={90} suffix="°" onChange={(value) => patch({ threeDRotation: { ...rotation, preset: 'custom', z: value } })} />
                  <Slider label="Perspective" value={rotation.perspective} min={100} max={2000} step={50} onChange={(value) => patch({ threeDRotation: { ...rotation, perspective: value } })} />
                </div>
              )}
            </Section>

            <button type="button" className="tep-reset-all" onClick={() => apply({ ...readTextStyleState(editor), shadow: null, reflection: null, glow: null, softEdges: null, threeDFormat: null, threeDRotation: null, legacyShadow: null, outline: { ...state.outline, mode: 'none' } })}>
              Reset Text Effects
            </button>
          </>
        )}
      </div>
    </aside>
  )
}
