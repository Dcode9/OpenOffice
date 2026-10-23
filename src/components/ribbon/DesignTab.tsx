import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlignJustify,
  Check,
  ChevronDown,
  ChevronUp,
  PaintBucket,
  Palette,
  Sparkles,
  Square,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import { TEXT_COLORS, THEMES } from '../../lib/constants'

const STYLE_SETS = ['Standard', 'Modern', 'Classic', 'Simple', 'Word 2003', 'Casual', 'Black & White', 'Elegant', 'Formal', 'Manuscript', 'Traditional', 'Fancy', 'Basic']

function StyleSetPreview({ name }: { name: string }) {
  return (
    <button className="style-set-card" title={`Style set: ${name}`} type="button">
      <span className="ss-title">TITLE</span>
      <span className="ss-heading">Heading 1</span>
      <span className="ss-line" />
      <span className="ss-line short" />
      <span className="ss-line" />
    </button>
  )
}

function BigMenu({
  icon,
  label,
  width = 220,
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
    setParagraphBefore,
    setParagraphAfter,
    toast,
  } = useWord()
  const [defaultStyle, setDefaultStyle] = useState(true)
  if (!editor) return null

  const applyTheme = (id: string) => {
    setTheme(id)
    const t = THEMES.find((x) => x.id === id)!
    const root = document.documentElement
    root.style.setProperty('--word-body-font', t.bodyFont)
    root.style.setProperty('--word-heading-font', t.headingFont)
    root.style.setProperty('--word-accent', t.accent)
  }

  const applyFonts = (heading: string, body: string, label: string) => {
    const root = document.documentElement
    root.style.setProperty('--word-heading-font', heading)
    root.style.setProperty('--word-body-font', body)
    editor.chain().focus().selectAll().setFontFamily(body).run()
    editor.commands.setTextSelection(editor.state.selection.to)
    toast(`Fonts: ${label}`)
  }

  return (
    <>
      <RibbonGroup label="Document Formatting">
        <Popover
          width={320}
          trigger={({ toggle }) => (
            <button className="rb-big" onClick={toggle} type="button" title="Themes">
              <span className="rb-big-icon"><Palette size={22} /></span>
              <span className="rb-big-label">Themes</span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <div className="theme-grid">
              {THEMES.map((t) => (
                <button key={t.id} className={`theme-card${theme === t.id ? ' active' : ''}`} onClick={() => { applyTheme(t.id); close() }}>
                  <div className="theme-swatch" style={{ background: t.accent }} />
                  <div className="theme-sample" style={{ fontFamily: t.headingFont }}>Aa</div>
                  <div className="theme-name" style={{ fontFamily: t.bodyFont }}>{t.label}</div>
                </button>
              ))}
            </div>
          )}
        </Popover>

        <div className="style-set-gallery">
          {STYLE_SETS.map((s) => (
            <StyleSetPreview key={s} name={s} />
          ))}
          <div className="style-set-scroll">
            <ChevronUp size={9} />
            <ChevronDown size={9} />
          </div>
        </div>

        <BigMenu icon={<Palette size={22} />} label="Colors" width={240}>
          {(close) => (
            <div className="theme-grid">
              {[
                { label: 'Office', accent: '#2b579a' },
                { label: 'Blue Warm', accent: '#1f6feb' },
                { label: 'Blue Green', accent: '#1f7a6b' },
                { label: 'Green', accent: '#4f7f3f' },
                { label: 'Gold', accent: '#b58a2b' },
                { label: 'Red', accent: '#c0392b' },
                { label: 'Purple', accent: '#6b4fa0' },
                { label: 'Grayscale', accent: '#5a5a5a' },
              ].map((t) => (
                <button key={t.label} className="theme-card" onClick={() => {
                  document.documentElement.style.setProperty('--word-accent', t.accent)
                  toast(`Color set: ${t.label}`)
                  close()
                }}>
                  <div className="theme-swatch" style={{ background: t.accent }} />
                  <div className="theme-name">{t.label}</div>
                </button>
              ))}
            </div>
          )}
        </BigMenu>

        <BigMenu icon={<span className="ds-font-a">A</span>} label="Fonts" width={250}>
          {(close) => (
            <div className="menu">
              {[
                ['Calibri Light', 'Calibri', 'Calibri'],
                ['Aptos Display', 'Aptos', 'Aptos'],
                ['Georgia', 'Calibri', 'Georgia'],
                ['Times New Roman', 'Arial', 'Times New Roman'],
                ['Segoe UI Light', 'Segoe UI', 'Segoe UI'],
              ].map(([h, b, label]) => (
                <MenuItem key={label} label={`${label} (${h} / ${b})`} onClick={() => { applyFonts(h, b, label); close() }} />
              ))}
            </div>
          )}
        </BigMenu>

        <RibbonStack>
          <Popover
            width={200}
            trigger={({ toggle }) => <SmallButton icon={<AlignJustify size={15} />} label="Paragraph Spacing" wide onClick={toggle} />}
          >
            {(close) => (
              <div className="menu">
                <MenuItem label="No Paragraph Space" onClick={() => { setParagraphBefore(0); setParagraphAfter(0); close() }} />
                <MenuItem label="Compact" onClick={() => { setParagraphBefore(0); setParagraphAfter(4); close() }} />
                <MenuItem label="Open" onClick={() => { setParagraphBefore(0); setParagraphAfter(8); close() }} />
                <MenuItem label="Relaxed" onClick={() => { setParagraphBefore(6); setParagraphAfter(12); close() }} />
                <MenuItem label="Double" onClick={() => { setParagraphBefore(0); setParagraphAfter(16); close() }} />
              </div>
            )}
          </Popover>
          <Popover
            width={200}
            trigger={({ toggle }) => <SmallButton icon={<Sparkles size={15} />} label="Effects" wide onClick={toggle} />}
          >
            {(close) => (
              <div className="menu">
                <MenuLabel>Text Effects</MenuLabel>
                {['None', 'Shadow', 'Reflection', 'Glow', 'Outline'].map((e) => (
                  <MenuItem key={e} label={e} onClick={() => { toast(`Text effect: ${e}`); close() }} />
                ))}
              </div>
            )}
          </Popover>
          <SmallButton
            icon={<span className={`default-check${defaultStyle ? ' on' : ''}`}>{defaultStyle ? <Check size={12} /> : null}</span>}
            label="Set as Default"
            wide
            onClick={() => { setDefaultStyle(!defaultStyle); toast(defaultStyle ? 'No longer default' : 'Set as default') }}
          />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Page Background" className="design-bg">
        <Popover
          width={230}
          trigger={({ toggle }) => <BigButton icon={<PaintBucket size={22} />} label="Watermark" caret onClick={toggle} onCaret={toggle} />}
        >
          {(close) => (
            <div className="menu">
              <MenuItem label="No Watermark" onClick={() => { setPage({ ...page, watermark: null }); close() }} />
              <MenuItem label="DRAFT" onClick={() => { setPage({ ...page, watermark: 'DRAFT' }); close() }} />
              <MenuItem label="CONFIDENTIAL" onClick={() => { setPage({ ...page, watermark: 'CONFIDENTIAL' }); close() }} />
              <MenuItem label="DO NOT COPY" onClick={() => { setPage({ ...page, watermark: 'DO NOT COPY' }); close() }} />
              <MenuSep />
              <MenuItem label="Custom Watermark…" onClick={() => {
                const text = window.prompt('Watermark text:', page.watermark || 'DRAFT')
                if (text !== null) setPage({ ...page, watermark: text || null })
                close()
              }} />
            </div>
          )}
        </Popover>

        <Popover
          width={240}
          trigger={({ toggle }) => <BigButton icon={<PaintBucket size={22} />} label="Page Color" caret onClick={toggle} onCaret={toggle} />}
        >
          {(close) => (
            <div className="color-pop">
              <div className="color-theme-label">Page Color</div>
              <div className="color-grid">
                <button className="swatch none" title="No Color" onClick={() => { setPage({ ...page, pageColor: '#ffffff' }); close() }} />
                {TEXT_COLORS.map((c) => (
                  <button key={c} className="swatch" style={{ background: c }} onClick={() => { setPage({ ...page, pageColor: c }); close() }} />
                ))}
              </div>
            </div>
          )}
        </Popover>

        <Popover
          width={190}
          trigger={({ toggle }) => <BigButton icon={<Square size={22} />} label="Page Borders" caret active={pageBorders} onClick={toggle} onCaret={toggle} />}
        >
          {(close) => (
            <div className="menu">
              <MenuItem label="Box" onClick={() => { setPageBorders(true); close() }} />
              <MenuItem label="Shadow" onClick={() => { setPageBorders(true); close() }} />
              <MenuItem label="3-D" onClick={() => { setPageBorders(true); close() }} />
              <MenuSep />
              <MenuItem label="None" onClick={() => { setPageBorders(false); close() }} />
              <MenuItem label="Page Borders…" onClick={() => { toast('Page Borders'); close() }} />
            </div>
          )}
        </Popover>
      </RibbonGroup>
    </>
  )
}
