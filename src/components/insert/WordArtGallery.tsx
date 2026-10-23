import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Editor } from '@tiptap/react'
import { insertHtml, paragraphHtml, styledRun } from '../../editor/insertActions'
import { MenuLabel } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

type WordArtPreset = {
  id: string
  name: string
  style: CSSProperties
  attrs: {
    font?: string
    size?: number
    color?: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    allCaps?: boolean
    smallCaps?: boolean
    letterSpacing?: string
    shadow?: string
    stroke?: string
  }
}

const PRESETS: WordArtPreset[] = [
  {
    id: 'gradient',
    name: 'Gradient Fill – Blue',
    style: { fontFamily: 'Georgia', fontSize: 30, fontWeight: 700, color: '#2b579a', textShadow: '0 2px 0 #9dc3e6, 0 4px 8px rgba(43,87,154,.35)' },
    attrs: { font: 'Georgia', size: 40, color: '#2b579a', bold: true, shadow: '0 2px 0 #9dc3e6, 0 4px 9px rgba(43,87,154,.35)' },
  },
  {
    id: 'outline',
    name: 'Blue Outline',
    style: { fontFamily: 'Arial', fontSize: 30, fontWeight: 700, color: '#ffffff', WebkitTextStroke: '1.5px #2b579a', textShadow: '0 1px 2px rgba(0,0,0,.2)' },
    attrs: { font: 'Arial', size: 40, color: '#ffffff', bold: true, stroke: '1.5px #2b579a', shadow: '0 1px 2px rgba(0,0,0,.2)' },
  },
  {
    id: 'gold',
    name: 'Gold Glow',
    style: { fontFamily: 'Georgia', fontSize: 30, fontWeight: 700, color: '#bf9000', textShadow: '0 0 8px #ffe699, 0 2px 3px #7f6000' },
    attrs: { font: 'Georgia', size: 40, color: '#bf9000', bold: true, shadow: '0 0 9px #ffe699, 0 2px 3px #7f6000' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    style: { fontFamily: 'Trebuchet MS', fontSize: 30, fontWeight: 700, color: '#c55a11', textShadow: '2px 2px 0 #f4b183' },
    attrs: { font: 'Trebuchet MS', size: 40, color: '#c55a11', bold: true, shadow: '2px 2px 0 #f4b183' },
  },
  {
    id: 'neon',
    name: 'Neon Glow',
    style: { fontFamily: 'Segoe UI', fontSize: 30, fontWeight: 700, color: '#00b0f0', textShadow: '0 0 6px #00b0f0, 0 0 16px #0070c0' },
    attrs: { font: 'Segoe UI', size: 40, color: '#00b0f0', bold: true, shadow: '0 0 7px #00b0f0, 0 0 18px #0070c0' },
  },
  {
    id: 'emboss',
    name: 'Emboss',
    style: { fontFamily: 'Calibri', fontSize: 31, fontWeight: 700, color: '#d9d9d9', textShadow: '1px 1px 0 #ffffff, -1px -1px 0 #7f7f7f' },
    attrs: { font: 'Calibri', size: 42, color: '#d9d9d9', bold: true, shadow: '1px 1px 0 #ffffff, -1px -1px 0 #7f7f7f' },
  },
  {
    id: 'shadow',
    name: 'Deep Shadow',
    style: { fontFamily: 'Verdana', fontSize: 29, fontWeight: 700, color: '#404040', textShadow: '4px 4px 3px rgba(0,0,0,.35)' },
    attrs: { font: 'Verdana', size: 38, color: '#404040', bold: true, shadow: '4px 4px 3px rgba(0,0,0,.35)' },
  },
  {
    id: 'metallic',
    name: 'Metallic',
    style: { fontFamily: 'Arial Black', fontSize: 30, fontWeight: 700, color: '#595959', textShadow: '0 1px 0 #ffffff, 0 2px 0 #bfbfbf, 0 3px 4px rgba(0,0,0,.3)' },
    attrs: { font: 'Arial', size: 40, color: '#595959', bold: true, shadow: '0 1px 0 #ffffff, 0 2px 0 #bfbfbf, 0 3px 4px rgba(0,0,0,.3)' },
  },
  {
    id: 'retro',
    name: 'Retro Pop',
    style: { fontFamily: 'Impact', fontSize: 31, fontWeight: 700, color: '#7030a0', textShadow: '3px 3px 0 #ffc000' },
    attrs: { font: 'Impact', size: 42, color: '#7030a0', bold: true, shadow: '3px 3px 0 #ffc000' },
  },
  {
    id: 'elegant',
    name: 'Elegant Italic',
    style: { fontFamily: 'Georgia', fontSize: 30, fontStyle: 'italic', color: '#1f3864' },
    attrs: { font: 'Georgia', size: 40, color: '#1f3864', italic: true },
  },
  {
    id: 'impact',
    name: 'Bold Impact',
    style: { fontFamily: 'Impact', fontSize: 32, fontWeight: 700, color: '#c00000', textTransform: 'uppercase', letterSpacing: '1px' },
    attrs: { font: 'Impact', size: 44, color: '#c00000', bold: true, allCaps: true, letterSpacing: '1pt' },
  },
  {
    id: 'serif',
    name: 'Classic Serif',
    style: { fontFamily: 'Garamond', fontSize: 32, color: '#000000', letterSpacing: '2px' },
    attrs: { font: 'Garamond', size: 44, color: '#000000', letterSpacing: '2pt' },
  },
  {
    id: 'playful',
    name: 'Playful',
    style: { fontFamily: 'Comic Sans MS', fontSize: 29, fontWeight: 700, color: '#ed7d31', textShadow: '2px 3px 0 #ffe699' },
    attrs: { font: 'Comic Sans MS', size: 38, color: '#ed7d31', bold: true, shadow: '2px 3px 0 #ffe699' },
  },
  {
    id: 'refined',
    name: 'Refined Caps',
    style: { fontFamily: 'Times New Roman', fontSize: 28, color: '#2f5496', textTransform: 'uppercase', letterSpacing: '4px' },
    attrs: { font: 'Times New Roman', size: 36, color: '#2f5496', allCaps: true, letterSpacing: '4pt' },
  },
  {
    id: 'modern',
    name: 'Modern Light',
    style: { fontFamily: 'Segoe UI', fontSize: 28, color: '#44546a', textTransform: 'uppercase', letterSpacing: '6px' },
    attrs: { font: 'Segoe UI', size: 34, color: '#44546a', allCaps: true, letterSpacing: '6pt' },
  },
]

export function WordArtGallery({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [text, setText] = useState('Your Text Here')

  const insert = (preset: WordArtPreset) => {
    insertHtml(
      editor,
      `${paragraphHtml(styledRun(text || 'Your Text Here', preset.attrs), { align: 'center', spaceBefore: '6pt', spaceAfter: '6pt' })}<p></p>`,
    )
    onInserted(`WordArt inserted: ${preset.name}`)
    onClose()
  }

  return (
    <div className="ins-wordart">
      <MenuLabel>WordArt</MenuLabel>
      <label className="ins-wordart-input">
        <span>Your text</span>
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Your Text Here" />
      </label>
      <div className="ins-wordart-grid">
        {PRESETS.map((preset) => (
          <button key={preset.id} type="button" className="ins-wordart-card" onClick={() => insert(preset)} title={preset.name}>
            <span className="ins-wordart-sample" style={preset.style}>{text || 'Your Text Here'}</span>
            <span className="ins-wordart-name">{preset.name}</span>
          </button>
        ))}
      </div>
      <div className="ins-hint">WordArt is inserted as editable text, so you can keep typing or restyle it.</div>
    </div>
  )
}
