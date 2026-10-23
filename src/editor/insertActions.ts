import type { Editor } from '@tiptap/react'

export function svgDataUri(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export function insertSvg(editor: Editor, svg: string, alt = '') {
  editor.chain().focus().setImage({ src: svgDataUri(svg), alt }).run()
}

export function insertSvgThenParagraph(editor: Editor, svg: string, alt = '') {
  const src = svgDataUri(svg)
  editor.chain().focus().insertContent(`<img src="${src}" alt="${escapeAttr(alt)}"><p></p>`).run()
}

export function insertImageSrc(editor: Editor, src: string, alt = '') {
  editor.chain().focus().setImage({ src, alt }).run()
}

export function insertHtml(editor: Editor, html: string) {
  editor.chain().focus().insertContent(html).run()
}

export function escapeAttr(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

type BlockAttrs = {
  align?: string
  font?: string
  size?: number
  color?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  background?: string
  borderSides?: string
  borderColor?: string
  borderWidth?: string
  shading?: string
  indentLeft?: string
  indentRight?: string
  spaceBefore?: string
  spaceAfter?: string
  lineHeight?: string
  allCaps?: boolean
  smallCaps?: boolean
  letterSpacing?: string
  shadow?: string
  stroke?: string
}

export function styledRun(text: string, attrs: BlockAttrs = {}) {
  const styles: string[] = []
  if (attrs.font) styles.push(`font-family: ${attrs.font}`)
  if (attrs.size) styles.push(`font-size: ${attrs.size}px`)
  if (attrs.color) styles.push(`color: ${attrs.color}`)
  if (attrs.background) styles.push(`background-color: ${attrs.background}`)
  if (attrs.allCaps) styles.push('text-transform: uppercase')
  if (attrs.smallCaps) styles.push('font-variant: small-caps')
  if (attrs.letterSpacing) styles.push(`letter-spacing: ${attrs.letterSpacing}`)
  if (attrs.shadow) styles.push(`text-shadow: ${attrs.shadow}`)
  if (attrs.stroke) styles.push(`-webkit-text-stroke: ${attrs.stroke}`)
  if (attrs.bold) styles.push('font-weight: 700')
  if (attrs.italic) styles.push('font-style: italic')
  if (attrs.underline) styles.push('text-decoration: underline')
  let html = escapeAttr(text)
  if (attrs.bold) html = `<strong>${html}</strong>`
  if (attrs.italic) html = `<em>${html}</em>`
  if (attrs.underline) html = `<u>${html}</u>`
  const data: string[] = []
  if (attrs.allCaps) data.push('data-all-caps="true"')
  if (attrs.smallCaps) data.push('data-small-caps="true"')
  if (attrs.shadow) data.push(`data-text-shadow="${escapeAttr(attrs.shadow)}"`)
  if (attrs.stroke) data.push(`data-text-stroke="${escapeAttr(attrs.stroke)}"`)
  if (attrs.letterSpacing) data.push(`data-letter-spacing="${escapeAttr(attrs.letterSpacing.replace('pt', ''))}"`)
  return `<span style="${styles.join('; ')}" ${data.join(' ')}>${html}</span>`
}

export function paragraphHtml(content: string, attrs: BlockAttrs = {}) {
  const styles: string[] = []
  const data: string[] = []
  if (attrs.align) styles.push(`text-align: ${attrs.align}`)
  if (attrs.lineHeight) styles.push(`line-height: ${attrs.lineHeight}`)
  if (attrs.spaceBefore) data.push(`data-space-before="${attrs.spaceBefore}"`)
  if (attrs.spaceAfter) data.push(`data-space-after="${attrs.spaceAfter}"`)
  if (attrs.borderSides) {
    data.push(`data-border-sides="${attrs.borderSides}"`)
    data.push(`data-border-color="${attrs.borderColor || '#000000'}"`)
    data.push(`data-border-width="${attrs.borderWidth || '1px'}"`)
    for (const side of attrs.borderSides.split(',')) {
      styles.push(`border-${side}: ${attrs.borderWidth || '1px'} solid ${attrs.borderColor || '#000000'}`)
    }
  }
  if (attrs.shading) {
    data.push(`data-shading="${attrs.shading}"`)
    styles.push(`background-color: ${attrs.shading}`)
  }
  if (attrs.indentLeft) {
    data.push(`data-indent-left="${attrs.indentLeft}"`)
    styles.push(`margin-left: ${attrs.indentLeft}in`)
  }
  if (attrs.indentRight) {
    data.push(`data-indent-right="${attrs.indentRight}"`)
    styles.push(`margin-right: ${attrs.indentRight}in`)
  }
  return `<p style="${styles.join('; ')}" ${data.join(' ')}>${content}</p>`
}

export function insertStyledParagraph(editor: Editor, content: string, attrs: BlockAttrs = {}) {
  insertHtml(editor, `${paragraphHtml(content, attrs)}<p></p>`)
}

export function insertTextBox(
  editor: Editor,
  design: {
    content: string
    shading?: string
    borderSides?: string
    borderColor?: string
    borderWidth?: string
    align?: string
    spaceBefore?: string
    spaceAfter?: string
  },
) {
  insertHtml(
    editor,
    `${paragraphHtml(design.content, {
      shading: design.shading,
      borderSides: design.borderSides || 'top,bottom,left,right',
      borderColor: design.borderColor || '#8a8a8a',
      borderWidth: design.borderWidth || '1px',
      align: design.align,
      spaceBefore: design.spaceBefore || '8pt',
      spaceAfter: design.spaceAfter || '8pt',
    })}<p></p>`,
  )
}
