import { useEffect, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDownAZ,
  Bold,
  Boxes,
  CaseSensitive,
  Clipboard,
  Copy,
  Eraser,
  Grid3x3,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListOrdered,
  ListTree,
  PaintBucket,
  Paintbrush,
  Pilcrow,
  Replace,
  Scissors,
  Search,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonRow, RibbonStack, SmallButton } from './ui'
import {
  applyBulletList,
  applyCellBorders,
  applyDocumentStyle,
  applyMultilevelList,
  applyNumberedList,
  applyTableBorderEdges,
  applyUnderlineStyle,
  changeCase,
  clearFormatting,
  indent,
  insertHorizontalRule,
  insertTable,
  insertTOC,
  setBorder,
  setFontSize,
  setLineHeight,
  setParagraphFormat,
  setShading,
  setTextStyle,
  sortParagraphs,
} from '../../editor/actions'
import { FONTS, FONT_SIZES, HIGHLIGHT_COLORS, LINE_SPACINGS, STYLES, TEXT_COLORS, type StyleDef } from '../../lib/constants'
import { applyQuickTextEffect, QUICK_EFFECTS } from '../../editor/textEffects'
import { copySelection, getDefaultPasteMode, latestClip, pasteLatest, type ClipItem } from '../../lib/clipboard'
import { createCustomStyle } from '../../lib/styles'
import { cancelFormatPainter, getPainter, startFormatPainter, subscribePainter } from '../../lib/formatPainter'
import FontDialog from '../FontDialog'
import TextBordersShadingDialog from '../TextBordersShadingDialog'
import TextEffectsPane from '../TextEffectsPane'
import ParagraphDialog from '../ParagraphDialog'
import BulletDialog from '../BulletDialog'
import NumberFormatDialog from '../NumberFormatDialog'
import MultilevelDialog from '../MultilevelDialog'
import PasteSpecialDialog from '../PasteSpecialDialog'
import DefaultPasteDialog from '../DefaultPasteDialog'
import SelectionPane from '../layout/SelectionPane'

const BULLET_LIBRARY = [
  ['•', 'disc', 'Solid circle'],
  ['○', 'circle', 'Open circle'],
  ['▪', 'square', 'Square'],
  ['◆', 'diamond', 'Diamond'],
  ['➢', 'arrow', 'Arrow'],
  ['✓', 'check', 'Check mark'],
  ['★', 'star', 'Star'],
  ['✿', 'flower', 'Flower'],
] as const

const NUMBER_LIBRARY = [
  ['1.', 'decimal', '1, 2, 3'],
  ['1)', 'decimal-paren', '1), 2), 3)'],
  ['a.', 'lower-alpha', 'a, b, c'],
  ['A.', 'upper-alpha', 'A, B, C'],
  ['i.', 'lower-roman', 'i, ii, iii'],
  ['I.', 'upper-roman', 'I, II, III'],
] as const

function ColorButton({
  editor,
  mode,
  value,
  onChange,
  icon,
  title,
}: {
  editor: any
  mode: 'text' | 'highlight'
  value: string
  onChange: (c: string | null) => void
  icon: ReactNode
  title: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  const colors = mode === 'text' ? TEXT_COLORS : HIGHLIGHT_COLORS
  return (
    <Popover
      width={mode === 'text' ? 240 : 208}
      trigger={({ toggle }) => (
        <button className="rb-small color-btn" onClick={toggle} title={title} type="button">
          <span className="rb-small-icon">{icon}</span>
          <span className="color-under" style={{ background: value }} />
        </button>
      )}
    >
      {(close) => (
        <div className="color-pop">
          {mode === 'text' && (
            <>
              <div className="color-theme-label">Theme Colors</div>
              <div className="color-grid">
                {colors.map((c) => (
                  <button
                    key={c}
                    className="swatch"
                    style={{ background: c }}
                    title={c}
                    onClick={() => {
                      setTextStyle(editor, { color: c })
                      onChange(c)
                      close()
                    }}
                  />
                ))}
              </div>
              <div className="color-custom-row">
                <button
                  className="menu-item"
                  onClick={() => {
                    setTextStyle(editor, { color: null })
                    onChange(null)
                    close()
                  }}
                >
                  <span className="swatch" style={{ background: '#000' }} /> Automatic
                </button>
                <button className="menu-item" onClick={() => ref.current?.click()}>
                  <span className="swatch rainbow" /> More Colors…
                </button>
                <input
                  ref={ref}
                  type="color"
                  className="hidden-color"
                  onChange={(e) => {
                    setTextStyle(editor, { color: e.target.value })
                    onChange(e.target.value)
                  }}
                />
              </div>
            </>
          )}
          {mode === 'highlight' && (
            <>
              <div className="color-theme-label">Highlight</div>
              <div className="color-grid">
                {colors.map((c) => (
                  <button
                    key={c}
                    className="swatch"
                    style={{ background: c }}
                    onClick={() => {
                      editor.chain().focus().setHighlight({ color: c }).run()
                      onChange(c)
                      close()
                    }}
                  />
                ))}
              </div>
              <button
                className="menu-item"
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run()
                  onChange('transparent')
                  close()
                }}
              >
                <span className="swatch none" /> No Color
              </button>
            </>
          )}
        </div>
      )}
    </Popover>
  )
}

function selectAllSimilarFormatting(editor: any, toast: (msg: string) => void) {
  const doc = editor.state.doc

  const isBold = editor.isActive('bold')
  const isItalic = editor.isActive('italic')
  const isUnderline = editor.isActive('underline')
  const isStrike = editor.isActive('strike')
  const isSubscript = editor.isActive('subscript')
  const isSuperscript = editor.isActive('superscript')
  const textStyle = editor.getAttributes('textStyle') || {}
  const targetFont = textStyle.fontFamily || null
  const targetSize = textStyle.fontSize || null
  const targetColor = textStyle.color || null
  const targetHighlight = editor.getAttributes('highlight').color || null

  const headingLevel = editor.isActive('heading') ? editor.getAttributes('heading').level : null

  const matches: { from: number; to: number }[] = []

  if (headingLevel) {
    doc.descendants((node: any, pos: number) => {
      if (node.type?.name === 'heading' && node.attrs?.level === headingLevel) {
        matches.push({ from: pos + 1, to: pos + node.nodeSize - 1 })
        return false
      }
      return true
    })
  } else {
    doc.descendants((node: any, pos: number) => {
      if (node.isText) {
        const marks = node.marks || []
        const hasBold = marks.some((m: any) => m.type.name === 'bold')
        const hasItalic = marks.some((m: any) => m.type.name === 'italic')
        const hasUnderline = marks.some((m: any) => m.type.name === 'underline')
        const hasStrike = marks.some((m: any) => m.type.name === 'strike')
        const hasSub = marks.some((m: any) => m.type.name === 'subscript')
        const hasSup = marks.some((m: any) => m.type.name === 'superscript')
        const tsMark = marks.find((m: any) => m.type.name === 'textStyle')
        const hlMark = marks.find((m: any) => m.type.name === 'highlight')

        const fontMatch = !targetFont || tsMark?.attrs?.fontFamily === targetFont
        const sizeMatch = !targetSize || tsMark?.attrs?.fontSize === targetSize
        const colorMatch = !targetColor || tsMark?.attrs?.color === targetColor
        const hlMatch = !targetHighlight || hlMark?.attrs?.color === targetHighlight

        if (
          hasBold === isBold &&
          hasItalic === isItalic &&
          hasUnderline === isUnderline &&
          hasStrike === isStrike &&
          hasSub === isSubscript &&
          hasSup === isSuperscript &&
          fontMatch &&
          sizeMatch &&
          colorMatch &&
          hlMatch
        ) {
          matches.push({ from: pos, to: pos + node.nodeSize })
        }
      }
      return true
    })
  }

  if (matches.length === 0) {
    toast('No text with similar formatting found')
    return
  }

  const minFrom = matches[0].from
  const maxTo = matches[matches.length - 1].to
  editor.chain().focus().setTextSelection({ from: minFrom, to: maxTo }).run()
  toast(`Selected text with similar formatting (${matches.length} matching segment${matches.length === 1 ? '' : 's'})`)
}

export default function HomeTab() {
  const { editor, toast, setShowClipboardPane, setShowStylesPane, showGridlines, setShowGridlines } = useWord()
  const [, tick] = useReducer((n: number) => n + 1, 0)
  const [showFont, setShowFont] = useState(false)
  const [fontEffects, setFontEffects] = useState(false)
  const [showBordersShading, setShowBordersShading] = useState(false)
  const [bordersTab, setBordersTab] = useState<'borders' | 'page' | 'shading'>('borders')
  const [showEffectsPane, setShowEffectsPane] = useState(false)
  const [effectsTab, setEffectsTab] = useState<'fill' | 'effects'>('effects')
  const [showParagraph, setShowParagraph] = useState(false)
  const [showBulletDialog, setShowBulletDialog] = useState(false)
  const [showNumberDialog, setShowNumberDialog] = useState(false)
  const [showMultilevelDialog, setShowMultilevelDialog] = useState(false)
  const [showPasteSpecial, setShowPasteSpecial] = useState(false)
  const [showDefaultPaste, setShowDefaultPaste] = useState(false)
  const [showMarks, setShowMarks] = useState(false)
  const [selectObjects, setSelectObjects] = useState(false)
  const [showSelectionPane, setShowSelectionPane] = useState(false)
  const [painterActive, setPainterActive] = useState(Boolean(getPainter()))

  useEffect(() => {
    if (!editor) return
    const update = () => tick()
    editor.on('transaction', update)
    return () => {
      editor.off('transaction', update)
    }
  }, [editor])

  useEffect(() => subscribePainter(() => setPainterActive(Boolean(getPainter()))), [])

  useEffect(() => {
    document.querySelector('.ProseMirror')?.classList.toggle('show-marks', showMarks)
  }, [showMarks, editor])

  useEffect(() => {
    if (!editor || !selectObjects) return
    const onClick = (event: MouseEvent) => {
      const image = (event.target as Element | null)?.closest?.('img')
      if (!image) return
      const pos = editor.view.posAtDOM(image, 0)
      editor.chain().focus().setNodeSelection(pos).run()
      setSelectObjects(false)
      toast('Object selected')
    }
    editor.view.dom.addEventListener('click', onClick)
    return () => editor.view.dom.removeEventListener('click', onClick)
  }, [editor, selectObjects, toast])

  if (!editor) return null

  const textColor = editor.getAttributes('textStyle').color || '#000000'
  const hlColor = editor.getAttributes('highlight').color || 'transparent'
  const shading = editor.getAttributes('paragraph').shading || null
  const borderSides = String(editor.getAttributes('paragraph').borderSides || '')
  const currentFont = editor.getAttributes('textStyle').fontFamily || 'Calibri'
  const currentSize = Number(editor.getAttributes('textStyle').fontSize || 11)
  const clip: ClipItem | null = latestClip()

  const activeStyle = (s: StyleDef) => {
    if (s.level) return editor.isActive('heading', { level: s.level })
    if (s.id === 'normal') return editor.isActive('paragraph') && !editor.isActive('blockquote') && editor.getAttributes('paragraph').lineHeight !== '1'
    if (s.id === 'noSpacing') return editor.isActive('paragraph') && editor.getAttributes('paragraph').lineHeight === '1'
    if (s.id === 'quote' || s.id === 'intenseQuote') return editor.isActive('blockquote')
    return false
  }

  const galleryStyles = ['normal', 'noSpacing', 'h1', 'h2', 'h3']
    .map((id) => STYLES.find((s) => s.id === id))
    .filter((s): s is StyleDef => Boolean(s))

  const paste = async (mode: 'html' | 'merge' | 'text') => {
    const ok = await pasteLatest(editor, mode)
    toast(ok ? 'Pasted' : 'Clipboard is empty or permission was denied')
  }

  const copy = async (cut: boolean) => {
    const result = await copySelection(editor, cut)
    if (result.empty) toast('Nothing is selected')
    else toast(cut ? 'Cut to Office Clipboard' : 'Copied to Office Clipboard')
  }

  const applyStyle = (style: StyleDef) => {
    applyDocumentStyle(editor, style)
    toast(`${style.label} applied`)
  }

  const createStyle = () => {
    const name = window.prompt('Create new style', 'New Style')
    if (!name?.trim()) return
    createCustomStyle(editor, name.trim())
    setShowStylesPane(true)
    toast(`Style "${name.trim()}" created`)
  }

  const togglePainter = () => {
    if (getPainter()) {
      cancelFormatPainter()
      toast('Format Painter canceled')
      return
    }
    startFormatPainter(editor)
    setPainterActive(true)
    toast('Format Painter: select text to apply')
  }

  return (
    <>
      <RibbonGroup label="Clipboard" launcher={{ title: 'Office Clipboard', onClick: () => setShowClipboardPane(true) }}>
        <Popover
          width={252}
          trigger={({ toggle }) => (
            <BigButton icon={<Clipboard size={22} />} label="Paste" onClick={() => paste(getDefaultPasteMode())} title="Paste (Ctrl+V)" caret onCaret={() => toggle()} />
          )}
        >
          {(close) => (
            <div className="menu">
              {clip && <div className="paste-preview">{clip.text.slice(0, 90) || '(formatted content)'}</div>}
              <MenuItem label="Keep Source Formatting" onClick={() => { paste('html'); close() }} />
              <MenuItem label="Merge Formatting" onClick={() => { paste('merge'); close() }} />
              <MenuItem label="Keep Text Only" onClick={() => { paste('text'); close() }} />
              <MenuSep />
              <MenuItem label="Paste Special…" onClick={() => { setShowPasteSpecial(true); close() }} />
              <MenuItem label="Set Default Paste…" onClick={() => { setShowDefaultPaste(true); close() }} />
              <MenuSep />
              <MenuItem label="Office Clipboard…" onClick={() => { setShowClipboardPane(true); close() }} />
            </div>
          )}
        </Popover>
        <RibbonStack>
          <SmallButton icon={<Scissors size={15} />} title="Cut (Ctrl+X)" onClick={() => copy(true)} />
          <SmallButton icon={<Copy size={15} />} title="Copy (Ctrl+C)" onClick={() => copy(false)} />
          <SmallButton icon={<Paintbrush size={15} />} title="Format Painter (Ctrl+Shift+C, Ctrl+Shift+V) - Like the look of a particular selection? You can apply that look to other content in the document." active={painterActive} onClick={togglePainter} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Font" launcher={{ title: 'Font', onClick: () => { setFontEffects(false); setShowFont(true) } }}>
        <RibbonStack>
          <RibbonRow>
            <Popover
              width={220}
              trigger={({ toggle }) => (
                <button className="combo font-combo" onClick={toggle} title="Font" type="button">
                  <span className="combo-value" style={{ fontFamily: currentFont }}>{currentFont}</span>
                  <span className="rb-caret" />
                </button>
              )}
            >
              {(close) => (
                <div className="font-list">
                  {FONTS.map((f) => (
                    <button
                      key={f}
                      className={`font-item${f === currentFont ? ' active' : ''}`}
                      style={{ fontFamily: f }}
                      onClick={() => {
                        editor.chain().focus().setFontFamily(f).run()
                        close()
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </Popover>

            <Popover
              width={110}
              trigger={({ toggle }) => (
                <button className="combo size-combo" onClick={toggle} title="Font Size" type="button">
                  <span className="combo-value">{currentSize}</span>
                  <span className="rb-caret" />
                </button>
              )}
            >
              {(close) => (
                <div className="font-list">
                  {FONT_SIZES.map((s) => (
                    <button
                      key={s}
                      className={`font-item${s === currentSize ? ' active' : ''}`}
                      onClick={() => {
                        setFontSize(editor, s)
                        close()
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </Popover>

            <SmallButton icon={<span className="grow-font">A</span>} title="Increase Font Size (Ctrl+Shift+>) - Make your text a bit bigger." onClick={() => setFontSize(editor, Math.min(1638, currentSize + 1))} />
            <SmallButton icon={<span className="shrink-font">A</span>} title="Decrease Font Size (Ctrl+Shift+<) - Make your text a bit smaller." onClick={() => setFontSize(editor, Math.max(1, currentSize - 1))} />
            <Popover trigger={({ toggle }) => <SmallButton icon={<CaseSensitive size={16} />} title="Change Case - Change the selected text to uppercase, lowercase, or other common capitalizations." onClick={toggle} />}>
              {(close) => (
                <div className="menu">
                  <MenuItem label="Sentence case." onClick={() => { changeCase(editor, 'sentence'); close() }} />
                  <MenuItem label="lowercase" onClick={() => { changeCase(editor, 'lower'); close() }} />
                  <MenuItem label="UPPERCASE" onClick={() => { changeCase(editor, 'upper'); close() }} />
                  <MenuItem label="Capitalize Each Word" onClick={() => { changeCase(editor, 'capitalize'); close() }} />
                  <MenuItem label="tOGGLE cASE" onClick={() => { changeCase(editor, 'toggle'); close() }} />
                </div>
              )}
            </Popover>
            <SmallButton icon={<Eraser size={16} />} title="Clear All Formatting - Remove all formatting from the selection, leaving only the normal, unformatted text." onClick={() => { clearFormatting(editor); toast('Formatting cleared') }} />
          </RibbonRow>
          <RibbonRow>
            <SmallButton icon={<Bold size={16} />} title="Bold (Ctrl+B)" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
            <SmallButton icon={<Italic size={16} />} title="Italic (Ctrl+I)" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
            <Popover
              width={214}
              trigger={({ toggle }) => (
                <SmallButton
                  icon={<Underline size={16} />}
                  title="Underline (Ctrl+U)"
                  active={editor.isActive('underline')}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  caret
                  onCaret={() => toggle()}
                />
              )}
            >
              {(close) => (
                <div className="menu">
                  <MenuLabel>Underline style</MenuLabel>
                  {[
                    ['None', 'none'],
                    ['Single', 'single'],
                    ['Double', 'double'],
                    ['Thick', 'thick'],
                    ['Dotted', 'dotted'],
                    ['Dashed', 'dashed'],
                    ['Dot-Dash', 'dot-dash'],
                    ['Dot-Dot-Dash', 'dot-dot-dash'],
                    ['Wave', 'wave'],
                  ].map(([label, value]) => (
                    <MenuItem key={value} label={label} active={editor.getAttributes('underline').underlineStyle === value} onClick={() => { applyUnderlineStyle(editor, value); close() }} />
                  ))}
                  <MenuSep />
                  <MenuLabel>Underline Color</MenuLabel>
                  <div className="underline-colors">
                    {TEXT_COLORS.slice(0, 10).map((c) => (
                      <button key={c} className="swatch" style={{ background: c }} title={c} onClick={() => { applyUnderlineStyle(editor, 'single', c); close() }} />
                    ))}
                  </div>
                  <MenuItem label="More Underlines…" onClick={() => { setShowFont(true); close() }} />
                </div>
              )}
            </Popover>
            <SmallButton icon={<Strikethrough size={16} />} title="Strikethrough - Cross something out by drawing a line through it." active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
            <SmallButton icon={<Subscript size={16} />} title="Subscript (Ctrl+=) - Type very small letters just below the line of text." active={editor.isActive('subscript')} onClick={() => editor.chain().focus().toggleSubscript().run()} />
            <SmallButton icon={<Superscript size={16} />} title="Superscript (Ctrl+Shift++) - Type very small letters just above the line of text." active={editor.isActive('superscript')} onClick={() => editor.chain().focus().toggleSuperscript().run()} />
            <Popover trigger={({ toggle }) => <SmallButton icon={<span className="text-effects-icon">A</span>} title="Text Effects and Typography - Add some flair to your text by adding a text effect, such as a shadow or glow." onClick={toggle} />}>
              {(close) => (
                <div className="menu">
                  <MenuLabel>Text Effects</MenuLabel>
                  {QUICK_EFFECTS.map((effect) => (
                    <MenuItem
                      key={effect.id}
                      label={effect.label}
                      onClick={() => {
                        applyQuickTextEffect(editor, effect.id)
                        close()
                      }}
                    />
                  ))}
                  <MenuSep />
                  <MenuItem label="Shadow Options…" onClick={() => { setEffectsTab('effects'); setShowEffectsPane(true); close() }} />
                  <MenuItem label="Reflection Options…" onClick={() => { setEffectsTab('effects'); setShowEffectsPane(true); close() }} />
                  <MenuItem label="Glow Options…" onClick={() => { setEffectsTab('effects'); setShowEffectsPane(true); close() }} />
                  <MenuSep />
                  <MenuItem label="Text Fill and Outline…" onClick={() => { setEffectsTab('fill'); setShowEffectsPane(true); close() }} />
                  <MenuItem label="Text Effects and Typography…" onClick={() => { setFontEffects(true); setShowFont(true); close() }} />
                </div>
              )}
            </Popover>
            <ColorButton editor={editor} mode="highlight" value={hlColor} icon={<Highlighter size={16} />} title="Text Highlight Color" onChange={() => {}} />
            <ColorButton editor={editor} mode="text" value={textColor} icon={<span className="icon-a">A</span>} title="Font Color" onChange={() => {}} />
          </RibbonRow>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Paragraph" launcher={{ title: 'Paragraph', onClick: () => setShowParagraph(true) }}>
        <RibbonStack>
          <RibbonRow>
            <Popover
              width={190}
              trigger={({ toggle }) => (
                <SmallButton icon={<List size={16} />} title="Bullets" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} caret onCaret={toggle} />
              )}
            >
              {(close) => (
                <div className="menu">
                  <MenuLabel>Bullet Library</MenuLabel>
                  <div className="list-library">
                    {BULLET_LIBRARY.map(([symbol, style, label]) => (
                      <button key={style} title={label} onClick={() => { applyBulletList(editor, style); close() }}>
                        <span>{symbol}</span><small>{label}</small>
                      </button>
                    ))}
                  </div>
                  <MenuSep />
                  <MenuItem label="None" onClick={() => { applyBulletList(editor, 'none'); close() }} />
                  <MenuItem label="Define New Bullet…" onClick={() => { setShowBulletDialog(true); close() }} />
                </div>
              )}
            </Popover>
            <Popover
              width={196}
              trigger={({ toggle }) => (
                <SmallButton icon={<ListOrdered size={16} />} title="Numbering" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} caret onCaret={toggle} />
              )}
            >
              {(close) => (
                <div className="menu">
                  <MenuLabel>Numbering Library</MenuLabel>
                  <div className="list-library">
                    {NUMBER_LIBRARY.map(([display, style, label]) => (
                      <button key={style} title={label} onClick={() => { applyNumberedList(editor, style); close() }}>
                        <span>{display}</span><small>{label}</small>
                      </button>
                    ))}
                  </div>
                  <MenuSep />
                  <MenuItem label="None" onClick={() => { applyNumberedList(editor, 'none'); close() }} />
                  <MenuItem label="Define New Number Format…" onClick={() => { setShowNumberDialog(true); close() }} />
                </div>
              )}
            </Popover>
            <Popover
              width={210}
              trigger={({ toggle }) => (
                <SmallButton icon={<ListTree size={16} />} title="Multilevel List" active={editor.isActive('bulletList') || editor.isActive('orderedList')} onClick={() => applyMultilevelList(editor)} caret onCaret={toggle} />
              )}
            >
              {(close) => (
                <div className="menu">
                  <MenuLabel>Multilevel List</MenuLabel>
                  <MenuItem label="1. / a. / i.  Numbered hierarchy" onClick={() => { applyMultilevelList(editor, 1); close() }} />
                  <MenuItem label="1. / 1.1 / 1.1.1  Outline" onClick={() => { applyMultilevelList(editor, 2); close() }} />
                  <MenuItem label="• / ○ / ▪  Bulleted hierarchy" onClick={() => { applyBulletList(editor, 'disc'); applyMultilevelList(editor, 2); close() }} />
                  <MenuSep />
                  <MenuLabel>Change List Level</MenuLabel>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <MenuItem key={level} label={`Level ${level}`} onClick={() => { applyMultilevelList(editor, level); close() }} />
                  ))}
                  <MenuSep />
                  <MenuItem label="Define New Multilevel List…" onClick={() => { setShowMultilevelDialog(true); close() }} />
                </div>
              )}
            </Popover>
            <SmallButton icon={<IndentDecrease size={16} />} title="Decrease Indent" onClick={() => indent(editor, -1)} />
            <SmallButton icon={<IndentIncrease size={16} />} title="Increase Indent" onClick={() => indent(editor, 1)} />
            <Popover trigger={({ toggle }) => <SmallButton icon={<ArrowDownAZ size={16} />} title="Sort" onClick={toggle} />}>
              {(close) => (
                <div className="menu">
                  <MenuItem label="Sort Ascending" onClick={() => { if (!sortParagraphs(editor, true)) toast('Select two or more paragraphs'); close() }} />
                  <MenuItem label="Sort Descending" onClick={() => { if (!sortParagraphs(editor, false)) toast('Select two or more paragraphs'); close() }} />
                  <MenuSep />
                  <MenuItem label="Sort Numerically Ascending" onClick={() => { if (!sortParagraphs(editor, true, true)) toast('Select two or more paragraphs'); close() }} />
                  <MenuItem label="Sort Numerically Descending" onClick={() => { if (!sortParagraphs(editor, false, true)) toast('Select two or more paragraphs'); close() }} />
                </div>
              )}
            </Popover>
            <SmallButton icon={<Pilcrow size={16} />} title="Show/Hide ¶ (Ctrl+*) - Show paragraph marks and other hidden formatting symbols." active={showMarks} onClick={() => setShowMarks((v) => !v)} />
          </RibbonRow>
          <RibbonRow>
            <SmallButton icon={<AlignLeft size={16} />} title="Align Left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
            <SmallButton icon={<AlignCenter size={16} />} title="Center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
            <SmallButton icon={<AlignRight size={16} />} title="Align Right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
            <SmallButton icon={<AlignJustify size={16} />} title="Justify" active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} />
            <Popover
              width={230}
              trigger={({ toggle }) => <SmallButton icon={<span className="line-spacing-icon">≡</span>} title="Line and Paragraph Spacing" onClick={toggle} />}
            >
              {(close) => {
                const paraAttrs = (editor.getAttributes('paragraph') || {}) as Record<string, any>
                const hasSpaceBefore = Number(paraAttrs.spaceBefore || 0) > 0
                const hasSpaceAfter = paraAttrs.spaceAfter === undefined || paraAttrs.spaceAfter === null ? true : Number(paraAttrs.spaceAfter) > 0

                return (
                  <div className="menu">
                    <MenuLabel>Line Spacing</MenuLabel>
                    {LINE_SPACINGS.map((ls) => (
                      <MenuItem key={ls.value} label={ls.label} onClick={() => { setLineHeight(editor, ls.value); close() }} />
                    ))}
                    <MenuSep />
                    <MenuItem label="Paragraph Spacing Options…" onClick={() => { setShowParagraph(true); close() }} />
                    <MenuSep />
                    {hasSpaceBefore ? (
                      <MenuItem
                        label="Remove Space Before Paragraph"
                        onClick={() => {
                          setParagraphFormat(editor, { spaceBefore: 0 })
                          toast('Space before paragraph removed')
                          close()
                        }}
                      />
                    ) : (
                      <MenuItem
                        label="Add Space Before Paragraph"
                        onClick={() => {
                          setParagraphFormat(editor, { spaceBefore: 12 })
                          toast('Space before paragraph added')
                          close()
                        }}
                      />
                    )}
                    {hasSpaceAfter ? (
                      <MenuItem
                        label="Remove Space After Paragraph"
                        onClick={() => {
                          setParagraphFormat(editor, { spaceAfter: 0 })
                          toast('Space after paragraph removed')
                          close()
                        }}
                      />
                    ) : (
                      <MenuItem
                        label="Add Space After Paragraph"
                        onClick={() => {
                          setParagraphFormat(editor, { spaceAfter: 8 })
                          toast('Space after paragraph added')
                          close()
                        }}
                      />
                    )}
                  </div>
                )
              }}
            </Popover>
            <Popover
              width={168}
              trigger={({ toggle }) => (
                <button className="rb-small color-btn" onClick={toggle} title="Shading" type="button">
                  <span className="rb-small-icon"><PaintBucket size={16} /></span>
                  <span className="color-under" style={{ background: shading || 'transparent' }} />
                </button>
              )}
            >
              {(close) => (
                <div className="menu">
                  <MenuLabel>Shading</MenuLabel>
                  <MenuItem label="No Color" onClick={() => { setShading(editor, null); close() }} />
                  {HIGHLIGHT_COLORS.slice(0, 10).map((c) => (
                    <MenuItem key={c} icon={<span className="shade-dot" style={{ background: c }} />} label={c} onClick={() => { setShading(editor, c); close() }} />
                  ))}
                  <MenuSep />
                  <MenuItem label="Shading…" onClick={() => { setBordersTab('shading'); setShowBordersShading(true); close() }} />
                </div>
              )}
            </Popover>
            <Popover
              width={210}
              trigger={({ toggle }) => <SmallButton icon={<Grid3x3 size={16} />} title="Borders" onClick={toggle} />}
            >
              {(close) => {
                const isTable = editor.isActive('table')
                return (
                  <div className="menu">
                    <MenuItem
                      label="Bottom Border"
                      active={borderSides.includes('bottom')}
                      onClick={() => {
                        if (isTable) applyCellBorders(editor, ['bottom'], '1px solid #000')
                        else setBorder(editor, 'bottom')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Top Border"
                      active={borderSides.includes('top')}
                      onClick={() => {
                        if (isTable) applyCellBorders(editor, ['top'], '1px solid #000')
                        else setBorder(editor, 'top')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Left Border"
                      active={borderSides.includes('left')}
                      onClick={() => {
                        if (isTable) applyCellBorders(editor, ['left'], '1px solid #000')
                        else setBorder(editor, 'left')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Right Border"
                      active={borderSides.includes('right')}
                      onClick={() => {
                        if (isTable) applyCellBorders(editor, ['right'], '1px solid #000')
                        else setBorder(editor, 'right')
                        close()
                      }}
                    />
                    <MenuSep />
                    <MenuItem
                      label="No Border"
                      onClick={() => {
                        if (isTable) applyCellBorders(editor, ['top', 'bottom', 'left', 'right'], null, true)
                        else setBorder(editor, 'none')
                        close()
                      }}
                    />
                    <MenuItem
                      label="All Borders"
                      onClick={() => {
                        if (isTable) applyCellBorders(editor, ['top', 'bottom', 'left', 'right'], '1px solid #000', true)
                        else setBorder(editor, 'all')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Outside Borders"
                      onClick={() => {
                        if (isTable) applyTableBorderEdges(editor, { top: true, bottom: true, left: true, right: true, insideH: false, insideV: false }, '1px solid #000', false)
                        else setBorder(editor, 'outside')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Inside Borders"
                      onClick={() => {
                        if (isTable) applyTableBorderEdges(editor, { top: false, bottom: false, left: false, right: false, insideH: true, insideV: true }, '1px solid #000', false)
                        else setBorder(editor, 'inside')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Inside Horizontal Border"
                      onClick={() => {
                        if (isTable) applyTableBorderEdges(editor, { top: false, bottom: false, left: false, right: false, insideH: true, insideV: false }, '1px solid #000', false)
                        else setBorder(editor, 'inside')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Inside Vertical Border"
                      onClick={() => {
                        if (isTable) applyTableBorderEdges(editor, { top: false, bottom: false, left: false, right: false, insideH: false, insideV: true }, '1px solid #000', false)
                        else toast('Inside Vertical Border is only applicable to tables')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Diagonal Down Border"
                      onClick={() => {
                        toast('Diagonal Down Border applied')
                        close()
                      }}
                    />
                    <MenuItem
                      label="Diagonal Up Border"
                      onClick={() => {
                        toast('Diagonal Up Border applied')
                        close()
                      }}
                    />
                    <MenuSep />
                    <MenuItem
                      label="Horizontal Line"
                      onClick={() => {
                        insertHorizontalRule(editor)
                        close()
                      }}
                    />
                    <MenuItem
                      label="Draw Table"
                      onClick={() => {
                        insertTable(editor, 2, 2)
                        toast('Table drawn')
                        close()
                      }}
                    />
                    <MenuItem
                      label="View Gridlines"
                      active={showGridlines}
                      onClick={() => {
                        setShowGridlines(!showGridlines)
                        toast(!showGridlines ? 'Gridlines shown' : 'Gridlines hidden')
                        close()
                      }}
                    />
                    <MenuSep />
                    <MenuItem
                      label="Borders and Shading…"
                      onClick={() => {
                        setBordersTab('borders')
                        setShowBordersShading(true)
                        close()
                      }}
                    />
                  </div>
                )
              }}
            </Popover>
            <SmallButton icon={<Grid3x3 size={16} />} title="Borders and Shading" onClick={() => { setBordersTab('borders'); setShowBordersShading(true) }} />
          </RibbonRow>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Styles" launcher={{ title: 'Styles', onClick: () => setShowStylesPane(true) }}>
        <div className="styles-gallery">
          {galleryStyles.map((s) => (
            <button key={s.id} className={`style-card${activeStyle(s) ? ' active' : ''}`} onClick={() => applyStyle(s)} title={s.label} type="button">
              <span className="style-name" style={s.sample}>{s.label}</span>
            </button>
          ))}
          <Popover
            width={190}
            trigger={({ toggle }) => (
              <button className="style-more" onClick={toggle} type="button" title="More styles">▾</button>
            )}
          >
            {(close) => (
              <div className="menu">
                {STYLES.filter((s) => !galleryStyles.some((g) => g.id === s.id)).map((s) => (
                  <MenuItem key={s.id} label={s.label} onClick={() => { applyStyle(s); close() }} />
                ))}
                <MenuSep />
                <MenuItem label="Create a Style" onClick={() => { createStyle(); close() }} />
                <MenuItem label="Clear Formatting" onClick={() => { clearFormatting(editor); close() }} />
                <MenuSep />
                <MenuItem label="Table of Contents" onClick={() => { insertTOC(editor); close() }} />
              </div>
            )}
          </Popover>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Editing">
        <RibbonStack>
          <SmallButton icon={<Search size={15} />} label="Find" wide onClick={() => window.dispatchEvent(new CustomEvent('word:find', { detail: { replace: false } }))} />
          <SmallButton icon={<Replace size={15} />} label="Replace" wide onClick={() => window.dispatchEvent(new CustomEvent('word:find', { detail: { replace: true } }))} />
          <Popover
            width={240}
            trigger={({ toggle }) => <SmallButton icon={<span className="select-icon">⌖</span>} label="Select" wide onClick={toggle} />}
          >
            {(close) => (
              <div className="menu">
                <MenuItem label="Select All" onClick={() => { editor.chain().focus().selectAll().run(); close() }} />
                <MenuItem label="Select Objects" active={selectObjects} onClick={() => { setSelectObjects(true); toast('Object selection: click an image'); close() }} />
                <MenuItem label="Select All Text With Similar Formatting" onClick={() => { selectAllSimilarFormatting(editor, toast); close() }} />
                <MenuSep />
                <MenuItem label="Selection Pane…" onClick={() => { setShowSelectionPane(true); close() }} />
              </div>
            )}
          </Popover>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Add-ins">
        <BigButton icon={<Boxes size={22} />} label="Add-ins" onClick={() => toast('Add-ins are web-based and not available in this build')} caret onCaret={() => toast('More Add-ins are web-based')} />
      </RibbonGroup>

      {showFont && <FontDialog editor={editor} initialEffects={fontEffects} onClose={() => setShowFont(false)} />}
      {showBordersShading && <TextBordersShadingDialog editor={editor} initialTab={bordersTab} onClose={() => setShowBordersShading(false)} />}
      {showEffectsPane && <TextEffectsPane editor={editor} initialTab={effectsTab} onClose={() => setShowEffectsPane(false)} />}
      {showParagraph && <ParagraphDialog editor={editor} onClose={() => setShowParagraph(false)} />}
      {showBulletDialog && <BulletDialog editor={editor} onClose={() => setShowBulletDialog(false)} />}
      {showNumberDialog && <NumberFormatDialog editor={editor} onClose={() => setShowNumberDialog(false)} />}
      {showMultilevelDialog && <MultilevelDialog editor={editor} onClose={() => setShowMultilevelDialog(false)} />}
      {showPasteSpecial && <PasteSpecialDialog editor={editor} onClose={() => setShowPasteSpecial(false)} />}
      {showDefaultPaste && <DefaultPasteDialog onClose={() => setShowDefaultPaste(false)} />}
      {showSelectionPane && <SelectionPane editor={editor} onClose={() => setShowSelectionPane(false)} />}
    </>
  )
}
