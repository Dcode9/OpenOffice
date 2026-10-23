import Table from '@tiptap/extension-table'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'

const boolAttr = (name: string, dataName: string, defaultValue: boolean) => ({
  default: defaultValue,
  parseHTML: (element: HTMLElement) => element.getAttribute(dataName) === 'true',
  renderHTML: (attributes: Record<string, unknown>) =>
    attributes[name] ? { [dataName]: 'true' } : {},
})

export const StyledTable = Table.extend({
  addNodeView() {
    return ({ node }: { node: any }) =>
      new StyledTableView(node, (this as any).options.cellMinWidth || 25)
  },
  addAttributes() {
    return {
      ...this.parent?.(),
      tableStyle: {
        default: 'grid',
        parseHTML: (element) => element.getAttribute('data-table-style') || 'grid',
        renderHTML: (attributes) =>
          attributes.tableStyle ? { 'data-table-style': attributes.tableStyle } : {},
      },
      tableAccent: {
        default: '#4472C4',
        parseHTML: (element) => element.getAttribute('data-table-accent') || '#4472C4',
        renderHTML: (attributes) => ({
          'data-table-accent': attributes.tableAccent || '#4472C4',
          style: `--table-accent: ${attributes.tableAccent || '#4472C4'}`,
        }),
      },
      tableIntensity: {
        default: 'medium',
        parseHTML: (element) => element.getAttribute('data-table-intensity') || 'medium',
        renderHTML: (attributes) => ({
          'data-table-intensity': attributes.tableIntensity || 'medium',
        }),
      },
      tableWidth: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-table-width') || null,
        renderHTML: (attributes) =>
          attributes.tableWidth
            ? {
                'data-table-width': attributes.tableWidth,
                style:
                  attributes.tableWidth === 'auto'
                    ? 'width: auto'
                    : `width: ${attributes.tableWidth}`,
              }
            : {},
      },
      tableAlign: {
        default: 'left',
        parseHTML: (element) => element.getAttribute('data-table-align') || 'left',
        renderHTML: (attributes) => {
          const align = attributes.tableAlign || 'left'
          return {
            'data-table-align': align,
            style: `margin-left: ${align === 'center' ? 'auto' : align === 'right' ? 'auto' : '0'}; margin-right: ${
              align === 'center' ? 'auto' : align === 'right' ? '0' : 'auto'
            }`,
          }
        },
      },
      headerRow: boolAttr('headerRow', 'data-header-row', true),
      totalRow: boolAttr('totalRow', 'data-total-row', false),
      bandedRows: boolAttr('bandedRows', 'data-banded-rows', true),
      firstColumn: boolAttr('firstColumn', 'data-first-column', false),
      lastColumn: boolAttr('lastColumn', 'data-last-column', false),
      bandedColumns: boolAttr('bandedColumns', 'data-banded-columns', false),
      tableGridlines: boolAttr('tableGridlines', 'data-table-gridlines', true),
      tableFont: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-table-font') || null,
        renderHTML: (attributes) =>
          attributes.tableFont
            ? { 'data-table-font': attributes.tableFont, style: `font-family: ${attributes.tableFont}` }
            : {},
      },
      tableFontSize: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-table-font-size') || null,
        renderHTML: (attributes) =>
          attributes.tableFontSize
            ? {
                'data-table-font-size': attributes.tableFontSize,
                style: `font-size: ${attributes.tableFontSize}pt`,
              }
            : {},
      },
    }
  },
})

const CELL_ATTRS = {
  backgroundColor: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-shading') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.backgroundColor
        ? {
            'data-cell-shading': attributes.backgroundColor,
            style: `background-color: ${attributes.backgroundColor}`,
          }
        : {},
  },
  cellBorderTop: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-border-top') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellBorderTop
        ? {
            'data-cell-border-top': attributes.cellBorderTop,
            style: `border-top: ${attributes.cellBorderTop}`,
          }
        : {},
  },
  cellBorderBottom: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-border-bottom') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellBorderBottom
        ? {
            'data-cell-border-bottom': attributes.cellBorderBottom,
            style: `border-bottom: ${attributes.cellBorderBottom}`,
          }
        : {},
  },
  cellBorderLeft: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-border-left') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellBorderLeft
        ? {
            'data-cell-border-left': attributes.cellBorderLeft,
            style: `border-left: ${attributes.cellBorderLeft}`,
          }
        : {},
  },
  cellBorderRight: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-border-right') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellBorderRight
        ? {
            'data-cell-border-right': attributes.cellBorderRight,
            style: `border-right: ${attributes.cellBorderRight}`,
          }
        : {},
  },
  cellVerticalAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-vertical-align') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellVerticalAlign
        ? {
            'data-cell-vertical-align': attributes.cellVerticalAlign,
            style: `vertical-align: ${attributes.cellVerticalAlign}`,
          }
        : {},
  },
  cellTextAlign: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-text-align') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellTextAlign
        ? {
            'data-cell-text-align': attributes.cellTextAlign,
            style: `text-align: ${attributes.cellTextAlign}`,
          }
        : {},
  },
  cellTextDirection: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-text-direction') || null,
    renderHTML: (attributes: Record<string, unknown>) => {
      if (!attributes.cellTextDirection) return {}
      const vertical =
        attributes.cellTextDirection === 'btlr' || attributes.cellTextDirection === 'tbrl'
      return {
        'data-cell-text-direction': attributes.cellTextDirection,
        style: vertical ? 'writing-mode: vertical-rl' : 'writing-mode: horizontal-tb',
      }
    },
  },
  cellRowHeight: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-row-height') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellRowHeight
        ? {
            'data-cell-row-height': attributes.cellRowHeight,
            style: `height: ${attributes.cellRowHeight}pt`,
          }
        : {},
  },
  cellPadding: {
    default: null,
    parseHTML: (element: HTMLElement) => element.getAttribute('data-cell-padding') || null,
    renderHTML: (attributes: Record<string, unknown>) =>
      attributes.cellPadding
        ? {
            'data-cell-padding': attributes.cellPadding,
            style: `padding: ${attributes.cellPadding}pt`,
          }
        : {},
  },
}

export const StyledTableHeader = TableHeader.extend({
  addAttributes() {
    return { ...this.parent?.(), ...CELL_ATTRS }
  },
})

export const StyledTableCell = TableCell.extend({
  addAttributes() {
    return { ...this.parent?.(), ...CELL_ATTRS }
  },
})

type TableAttrs = Record<string, any>

function getColStyle(minWidth: number, width?: number) {
  return width
    ? ['width', `${Math.max(width, minWidth)}px`]
    : ['min-width', `${minWidth}px`]
}

function syncColumns(node: any, colgroup: HTMLTableColElement, table: HTMLTableElement, cellMinWidth: number) {
  let totalWidth = 0
  let fixedWidth = true
  let next = colgroup.firstChild
  const row = node.firstChild
  if (row) {
    for (let i = 0; i < row.childCount; i += 1) {
      const cell = row.child(i)
      const colspan = cell.attrs.colspan || 1
      const colwidth = cell.attrs.colwidth
      for (let j = 0; j < colspan; j += 1) {
        const width = colwidth && colwidth[j]
        totalWidth += width || cellMinWidth
        if (!width) fixedWidth = false
        const [key, value] = getColStyle(cellMinWidth, width)
        if (!next) {
          const element = document.createElement('col')
          element.style.setProperty(key, value)
          colgroup.appendChild(element)
        } else {
          const element = next as HTMLElement
          if (element.style.width !== (width ? `${width}px` : '')) {
            element.style.removeProperty(width ? 'min-width' : 'width')
            element.style.setProperty(key, value)
          }
          next = next.nextSibling
        }
      }
    }
  }
  while (next) {
    const after = next.nextSibling
    next.parentNode?.removeChild(next)
    next = after
  }
  table.style.width = fixedWidth ? `${totalWidth}px` : ''
  table.style.minWidth = fixedWidth ? '' : `${totalWidth}px`
}

function applyTableAttributes(table: HTMLTableElement, attrs: TableAttrs) {
  const setData = (name: string, value: unknown) => {
    if (value === null || value === undefined || value === false) table.removeAttribute(name)
    else table.setAttribute(name, String(value))
  }
  setData('data-table-style', attrs.tableStyle || 'grid')
  setData('data-table-accent', attrs.tableAccent || '#4472C4')
  setData('data-table-intensity', attrs.tableIntensity || 'medium')
  setData('data-table-align', attrs.tableAlign || 'left')
  setData('data-header-row', attrs.headerRow ? 'true' : 'false')
  setData('data-total-row', attrs.totalRow ? 'true' : 'false')
  setData('data-banded-rows', attrs.bandedRows ? 'true' : 'false')
  setData('data-first-column', attrs.firstColumn ? 'true' : 'false')
  setData('data-last-column', attrs.lastColumn ? 'true' : 'false')
  setData('data-banded-columns', attrs.bandedColumns ? 'true' : 'false')
  setData('data-table-gridlines', attrs.tableGridlines === false ? 'false' : 'true')
  setData('data-table-width', attrs.tableWidth || null)
  setData('data-table-font', attrs.tableFont || null)
  setData('data-table-font-size', attrs.tableFontSize || null)
  table.style.setProperty('--table-accent', attrs.tableAccent || '#4472C4')
  table.style.fontFamily = attrs.tableFont || ''
  table.style.fontSize = attrs.tableFontSize ? `${attrs.tableFontSize}pt` : ''
  const align = attrs.tableAlign || 'left'
  table.style.marginLeft = align === 'center' ? 'auto' : align === 'right' ? 'auto' : '0'
  table.style.marginRight = align === 'center' ? 'auto' : align === 'right' ? '0' : 'auto'
  if (attrs.tableWidth) {
    table.style.width = attrs.tableWidth === 'auto' ? 'auto' : String(attrs.tableWidth)
  }
}

class StyledTableView {
  node: any
  cellMinWidth: number
  dom: HTMLDivElement
  table: HTMLTableElement
  colgroup: HTMLTableColElement
  contentDOM: HTMLTableSectionElement

  constructor(node: any, cellMinWidth: number) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper'
    this.table = document.createElement('table')
    this.dom.appendChild(this.table)
    this.colgroup = document.createElement('colgroup')
    this.table.appendChild(this.colgroup)
    this.contentDOM = document.createElement('tbody')
    this.table.appendChild(this.contentDOM)
    syncColumns(node, this.colgroup, this.table, this.cellMinWidth)
    applyTableAttributes(this.table, node.attrs)
  }

  update(node: any) {
    if (node.type !== this.node.type) return false
    this.node = node
    syncColumns(node, this.colgroup, this.table, this.cellMinWidth)
    applyTableAttributes(this.table, node.attrs)
    return true
  }

  ignoreMutation(mutation: any) {
    return (
      mutation.type === 'attributes' &&
      (mutation.target === this.table || this.colgroup.contains(mutation.target))
    )
  }
}
