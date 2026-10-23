import { Extension, Node, mergeAttributes } from '@tiptap/core'

const BREAK_LABELS: Record<string, string> = {
  column: 'Column Break',
  textWrapping: 'Text Wrapping Break',
  sectionNext: 'Section Break (Next Page)',
  sectionContinuous: 'Section Break (Continuous)',
  sectionEven: 'Section Break (Even Page)',
  sectionOdd: 'Section Break (Odd Page)',
}

export const LayoutBreak = Node.create({
  name: 'layoutBreak',
  group: 'block',
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      kind: {
        default: 'sectionContinuous',
        parseHTML: (element) => element.getAttribute('data-layout-break') || 'sectionContinuous',
        renderHTML: (attributes) => ({ 'data-layout-break': attributes.kind }),
      },
    }
  },
  parseHTML() {
    return [{ tag: 'div[data-layout-break]' }]
  },
  renderHTML({ HTMLAttributes, node }) {
    const kind = String(node.attrs.kind || 'sectionContinuous')
    const label = BREAK_LABELS[kind] || 'Section Break'
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        class: `layout-break layout-break-${kind}`,
        'data-label': label,
      }),
    ]
  },
})

export const LayoutArrange = Extension.create({
  name: 'layoutArrange',
  addGlobalAttributes() {
    return [
      {
        types: ['image'],
        attributes: {
          layoutStyle: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-layout-style') || null,
            renderHTML: (attributes) => {
              if (!attributes.layoutStyle) return {}
              return { 'data-layout-style': attributes.layoutStyle, style: attributes.layoutStyle }
            },
          },
          layoutZ: {
            default: 0,
            parseHTML: (element) => Number(element.getAttribute('data-layout-z') || 0),
            renderHTML: (attributes) =>
              attributes.layoutZ ? { 'data-layout-z': String(attributes.layoutZ), style: `z-index: ${attributes.layoutZ}` } : {},
          },
          layoutRotate: {
            default: 0,
            parseHTML: (element) => Number(element.getAttribute('data-layout-rotate') || 0),
            renderHTML: (attributes) =>
              attributes.layoutRotate
                ? { 'data-layout-rotate': String(attributes.layoutRotate), style: `--layout-rotate: ${attributes.layoutRotate}deg` }
                : {},
          },
          layoutFlipH: {
            default: false,
            parseHTML: (element) => element.getAttribute('data-layout-flip-h') === 'true',
            renderHTML: (attributes) =>
              attributes.layoutFlipH ? { 'data-layout-flip-h': 'true', style: '--layout-flip-x: -1' } : {},
          },
          layoutFlipV: {
            default: false,
            parseHTML: (element) => element.getAttribute('data-layout-flip-v') === 'true',
            renderHTML: (attributes) =>
              attributes.layoutFlipV ? { 'data-layout-flip-v': 'true', style: '--layout-flip-y: -1' } : {},
          },
          layoutGroup: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-layout-group') || null,
            renderHTML: (attributes) =>
              attributes.layoutGroup ? { 'data-layout-group': attributes.layoutGroup } : {},
          },
          layoutHidden: {
            default: false,
            parseHTML: (element) => element.getAttribute('data-layout-hidden') === 'true',
            renderHTML: (attributes) =>
              attributes.layoutHidden
                ? { 'data-layout-hidden': 'true', style: 'visibility: hidden' }
                : {},
          },
        },
      },
      {
        types: ['paragraph', 'heading'],
        attributes: {
          suppressLineNumbers: {
            default: false,
            parseHTML: (element) => element.getAttribute('data-suppress-line-numbers') === 'true',
            renderHTML: (attributes) =>
              attributes.suppressLineNumbers ? { 'data-suppress-line-numbers': 'true' } : {},
          },
        },
      },
    ]
  },
})
