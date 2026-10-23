import { Extension, Node, mergeAttributes } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import FontFamily from '@tiptap/extension-font-family'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TableRow from '@tiptap/extension-table-row'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import { StyledTable, StyledTableHeader, StyledTableCell } from './tableExtensions'
import { Equation } from './equation'
import { CommentMark } from './comments'
import { DeletionMark, InsertionMark, TrackChanges } from './review'
import { LayoutArrange, LayoutBreak } from '../components/layout/layoutExtensions'

const BULLET_SYMBOLS: Record<string, string> = {
  disc: '•',
  circle: '○',
  square: '▪',
  diamond: '◆',
  arrow: '➢',
  check: '✓',
  flower: '✿',
  star: '★',
}

export const StyledBulletList = BulletList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      bulletStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-bullet-style') || null,
        renderHTML: (attributes) =>
          attributes.bulletStyle ? { 'data-bullet-style': attributes.bulletStyle } : {},
      },
      bulletSymbol: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-bullet-symbol') || null,
        renderHTML: (attributes) =>
          attributes.bulletSymbol ? { 'data-bullet-symbol': attributes.bulletSymbol } : {},
      },
      bulletFont: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-bullet-font') || null,
        renderHTML: (attributes) =>
          attributes.bulletFont ? { 'data-bullet-font': attributes.bulletFont } : {},
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const symbol = HTMLAttributes.bulletSymbol || BULLET_SYMBOLS[HTMLAttributes.bulletStyle]
    const styles: string[] = []
    if (symbol) styles.push(`--bullet-symbol: "${symbol}"`)
    if (HTMLAttributes.bulletFont) styles.push(`--bullet-font: ${HTMLAttributes.bulletFont}`)
    return [
      'ul',
      mergeAttributes(HTMLAttributes, styles.length ? { style: styles.join('; ') } : {}),
      0,
    ]
  },
})

const NUMBER_SUFFIX: Record<string, string> = {
  'decimal-paren': ')',
  'alpha-paren': ')',
  'roman-paren': ')',
}

export const StyledOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      numberStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-number-style') || null,
        renderHTML: (attributes) =>
          attributes.numberStyle ? { 'data-number-style': attributes.numberStyle } : {},
      },
    }
  },
  renderHTML({ HTMLAttributes }) {
    const suffix = NUMBER_SUFFIX[HTMLAttributes.numberStyle]
    return [
      'ol',
      mergeAttributes(HTMLAttributes, suffix ? { style: `--number-suffix: "${suffix}"` } : {}),
      0,
    ]
  },
})

const UNDERLINE_STYLES: Record<string, string> = {
  single: 'underline',
  double: 'underline double',
  thick: 'underline 2.5px',
  dotted: 'underline dotted',
  dashed: 'underline dashed',
  'dot-dash': 'underline dashed',
  'dot-dot-dash': 'underline dotted',
  wave: 'underline wavy',
}

export const StyledUnderline = Underline.extend({
  addAttributes() {
    return {
      underlineStyle: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-underline-style') || null,
        renderHTML: (attributes) =>
          attributes.underlineStyle ? { 'data-underline-style': attributes.underlineStyle } : {},
      },
      underlineColor: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-underline-color') || null,
        renderHTML: (attributes) =>
          attributes.underlineColor ? { 'data-underline-color': attributes.underlineColor } : {},
      },
    }
  },
  parseHTML() {
    return [{ tag: 'u' }, { tag: 'span[data-underline-style]' }]
  },
  renderHTML({ HTMLAttributes }) {
    const decoration = UNDERLINE_STYLES[HTMLAttributes['data-underline-style']] || 'underline'
    const color = HTMLAttributes['data-underline-color']
      ? `; text-decoration-color: ${HTMLAttributes['data-underline-color']}`
      : ''
    return ['span', mergeAttributes(HTMLAttributes, { style: `text-decoration: ${decoration}${color}` }), 0]
  },
})

export const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize?.replace('px', '') || null,
            renderHTML: (attributes) =>
              attributes.fontSize ? { style: `font-size: ${attributes.fontSize}px` } : {},
          },
        },
      },
    ]
  },
})

export const LineHeight = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element) => element.style.lineHeight || null,
            renderHTML: (attributes) =>
              attributes.lineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {},
          },
        },
      },
    ]
  },
})

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,
  parseHTML() {
    return [{ tag: 'div[data-page-break]' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-page-break': 'true', class: 'page-break' })]
  },
})

export const Indent = Extension.create({
  name: 'indent',
  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => Number(element.dataset.indent || 0),
            renderHTML: (attributes) =>
              attributes.indent
                ? {
                    'data-indent': attributes.indent,
                    style: `margin-left: ${attributes.indent * 0.5}in; margin-right: ${
                      attributes.indent * 0.5
                    }in`,
                  }
                : {},
          },
          indentLeft: {
            default: null,
            parseHTML: (element) => element.dataset.indentLeft || null,
            renderHTML: (attributes) =>
              attributes.indentLeft
                ? { 'data-indent-left': attributes.indentLeft, style: `margin-left: ${attributes.indentLeft}in` }
                : {},
          },
          indentRight: {
            default: null,
            parseHTML: (element) => element.dataset.indentRight || null,
            renderHTML: (attributes) =>
              attributes.indentRight
                ? { 'data-indent-right': attributes.indentRight, style: `margin-right: ${attributes.indentRight}in` }
                : {},
          },
          firstLine: {
            default: null,
            parseHTML: (element) => element.dataset.firstLine || null,
            renderHTML: (attributes) =>
              attributes.firstLine
                ? { 'data-first-line': attributes.firstLine, style: `text-indent: ${attributes.firstLine}in` }
                : {},
          },
        },
      },
    ]
  },
})

export const ParagraphFormat = Extension.create({
  name: 'paragraphFormat',
  addOptions() {
    return { types: ['paragraph', 'heading'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          borderSides: {
            default: null,
            parseHTML: (element) => element.dataset.borderSides || null,
            renderHTML: (attributes) => {
              if (!attributes.borderSides) return {}
              const color = attributes.borderColor || '#000000'
              const width = attributes.borderWidth || '1px'
              const sides = String(attributes.borderSides).split(',')
              const style = sides.map((s) => `border-${s}: ${width} solid ${color}`).join('; ')
              return { 'data-border-sides': attributes.borderSides, style }
            },
          },
          borderColor: {
            default: null,
            parseHTML: (element) => element.dataset.borderColor || null,
            renderHTML: (attributes) => (attributes.borderColor ? { 'data-border-color': attributes.borderColor } : {}),
          },
          borderWidth: {
            default: null,
            parseHTML: (element) => element.dataset.borderWidth || null,
            renderHTML: (attributes) => (attributes.borderWidth ? { 'data-border-width': attributes.borderWidth } : {}),
          },
          shading: {
            default: null,
            parseHTML: (element) => element.dataset.shading || null,
            renderHTML: (attributes) =>
              attributes.shading
                ? { 'data-shading': attributes.shading, style: `background-color: ${attributes.shading}` }
                : {},
          },
          spaceBefore: {
            default: null,
            parseHTML: (element) => element.dataset.spaceBefore || null,
            renderHTML: (attributes) =>
              attributes.spaceBefore
                ? { 'data-space-before': attributes.spaceBefore, style: `margin-top: ${attributes.spaceBefore}pt` }
                : {},
          },
          spaceAfter: {
            default: null,
            parseHTML: (element) => element.dataset.spaceAfter || null,
            renderHTML: (attributes) =>
              attributes.spaceAfter
                ? { 'data-space-after': attributes.spaceAfter, style: `margin-bottom: ${attributes.spaceAfter}pt` }
                : {},
          },
          keepNext: {
            default: false,
            parseHTML: (element) => element.dataset.keepNext === 'true',
            renderHTML: (attributes) => (attributes.keepNext ? { 'data-keep-next': 'true', style: 'break-after: avoid' } : {}),
          },
          pageBreakBefore: {
            default: false,
            parseHTML: (element) => element.dataset.pageBreakBefore === 'true',
            renderHTML: (attributes) =>
              attributes.pageBreakBefore ? { 'data-page-break-before': 'true', style: 'break-before: page' } : {},
          },
        },
      },
    ]
  },
})

export const TextEffects = Extension.create({
  name: 'textEffects',
  addOptions() {
    return { types: ['textStyle'] }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textShadow: {
            default: null,
            parseHTML: (element) => element.dataset.textShadow || null,
            renderHTML: (attributes) =>
              attributes.textShadow ? { 'data-text-shadow': attributes.textShadow, style: `text-shadow: ${attributes.textShadow}` } : {},
          },
          textStroke: {
            default: null,
            parseHTML: (element) => element.dataset.textStroke || null,
            renderHTML: (attributes) =>
              attributes.textStroke ? { 'data-text-stroke': attributes.textStroke, style: `-webkit-text-stroke: ${attributes.textStroke}` } : {},
          },
          smallCaps: {
            default: false,
            parseHTML: (element) => element.dataset.smallCaps === 'true',
            renderHTML: (attributes) =>
              attributes.smallCaps ? { 'data-small-caps': 'true', style: 'font-variant: small-caps' } : {},
          },
          allCaps: {
            default: false,
            parseHTML: (element) => element.dataset.allCaps === 'true',
            renderHTML: (attributes) =>
              attributes.allCaps ? { 'data-all-caps': 'true', style: 'text-transform: uppercase' } : {},
          },
          ligatures: {
            default: null,
            parseHTML: (element) => element.dataset.ligatures || null,
            renderHTML: (attributes) =>
              attributes.ligatures
                ? { 'data-ligatures': attributes.ligatures, style: `font-variant-ligatures: ${attributes.ligatures}` }
                : {},
          },
          letterSpacing: {
            default: null,
            parseHTML: (element) => element.dataset.letterSpacing || null,
            renderHTML: (attributes) =>
              attributes.letterSpacing
                ? { 'data-letter-spacing': attributes.letterSpacing, style: `letter-spacing: ${attributes.letterSpacing}pt` }
                : {},
          },
          characterScale: {
            default: null,
            parseHTML: (element) => element.dataset.characterScale || null,
            renderHTML: (attributes) => {
              if (!attributes.characterScale) return {}
              const scale = Number(attributes.characterScale)
              const stretch = scale < 90 ? 'condensed' : scale < 100 ? 'semi-condensed' : scale > 110 ? 'expanded' : scale > 100 ? 'semi-expanded' : 'normal'
              return { 'data-character-scale': attributes.characterScale, style: `font-stretch: ${stretch}` }
            },
          },
          charPosition: {
            default: null,
            parseHTML: (element) => element.dataset.charPosition || null,
            renderHTML: (attributes) => {
              if (!attributes.charPosition || attributes.charPosition === 'normal') return {}
              const by = Number(attributes.positionBy || 3)
              return {
                'data-char-position': attributes.charPosition,
                style: `position: relative; top: ${attributes.charPosition === 'raised' ? -by : by}px; font-size: 0.67em`,
              }
            },
          },
          kerning: {
            default: null,
            parseHTML: (element) => element.dataset.kerning || null,
            renderHTML: (attributes) =>
              attributes.kerning
                ? { 'data-kerning': attributes.kerning, style: `font-kerning: ${attributes.kerning === 'none' ? 'none' : 'normal'}` }
                : {},
          },
          numberSpacing: {
            default: null,
            parseHTML: (element) => element.dataset.numberSpacing || null,
            renderHTML: (attributes) =>
              attributes.numberSpacing
                ? { 'data-number-spacing': attributes.numberSpacing, style: `font-variant-numeric: ${attributes.numberSpacing}-nums` }
                : {},
          },
          numberForm: {
            default: null,
            parseHTML: (element) => element.dataset.numberForm || null,
            renderHTML: (attributes) =>
              attributes.numberForm
                ? { 'data-number-form': attributes.numberForm, style: `font-variant-numeric: ${attributes.numberForm}-nums` }
                : {},
          },
          stylisticSet: {
            default: null,
            parseHTML: (element) => element.dataset.stylisticSet || null,
            renderHTML: (attributes) =>
              attributes.stylisticSet
                ? { 'data-stylistic-set': attributes.stylisticSet, style: `font-feature-settings: "ss0${String(attributes.stylisticSet).replace('ss', '')}" 1` }
                : {},
          },
          contextualAlternates: {
            default: null,
            parseHTML: (element) => element.dataset.contextualAlternates || null,
            renderHTML: (attributes) =>
              attributes.contextualAlternates !== null && attributes.contextualAlternates !== undefined
                ? {
                    'data-contextual-alternates': attributes.contextualAlternates,
                    style: `font-feature-settings: "calt" ${attributes.contextualAlternates === 'off' ? 0 : 1}`,
                  }
                : {},
          },
        },
      },
    ]
  },
})

export function buildExtensions(placeholder = 'Start typing your document') {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3, 4, 5, 6] },
      horizontalRule: {},
      codeBlock: {},
      bulletList: false,
      orderedList: false,
      listItem: false,
    }),
    ListItem,
    StyledBulletList,
    StyledOrderedList,
    StyledUnderline,
    CommentMark,
    InsertionMark,
    DeletionMark,
    TrackChanges,
    TextStyle,
    Color,
    FontFamily.configure({ types: ['textStyle'] }),
    FontSize,
    TextEffects,
    ParagraphFormat,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Subscript,
    Superscript,
    LineHeight,
    Indent,
    PageBreak,
    LayoutBreak,
    LayoutArrange,
    Equation,
    StyledTable.configure({ resizable: true, lastColumnResizable: true }),
    TableRow,
    StyledTableHeader,
    StyledTableCell,
    Image.configure({ inline: false, allowBase64: true }),
    Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    CharacterCount,
    Placeholder.configure({ placeholder }),
  ]
}
