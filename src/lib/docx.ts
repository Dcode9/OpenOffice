import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  LevelFormat,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx'
import mammoth from 'mammoth'

type Mark = { type: string; attrs?: Record<string, any> }
type Node = {
  type: string
  attrs?: Record<string, any>
  content?: Node[]
  marks?: Mark[]
  text?: string
}

const HEADING: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
  4: HeadingLevel.HEADING_4,
  5: HeadingLevel.HEADING_5,
  6: HeadingLevel.HEADING_6,
}

const ALIGN: Record<string, (typeof AlignmentType)[keyof typeof AlignmentType]> = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT,
  justify: AlignmentType.JUSTIFIED,
}

function hex(color?: string | null): string | undefined {
  if (!color) return undefined
  return color.replace('#', '').toUpperCase()
}

function marksToRun(node: Node): TextRun {
  const marks = node.marks || []
  const get = (t: string) => marks.find((m) => m.type === t)
  const ts = get('textStyle')?.attrs || {}
  const hl = get('highlight')?.attrs?.color
  return new TextRun({
    text: node.text ?? '',
    bold: !!get('bold'),
    italics: !!get('italic'),
    underline: get('underline') ? {} : undefined,
    strike: !!get('strike'),
    subScript: !!get('subscript'),
    superScript: !!get('superscript'),
    color: hex(ts.color),
    font: ts.fontFamily || undefined,
    size: ts.fontSize ? Math.round(Number(ts.fontSize) * 2) : undefined,
    highlight: hl ? (hex(hl) as any) : undefined,
  })
}

function inlineToRuns(nodes: Node[] = []): any[] {
  const runs: any[] = []
  for (const n of nodes) {
    if (n.type === 'hardBreak') {
      runs.push(new TextRun({ break: 1 }))
      continue
    }
    if (n.type === 'text') {
      const link = (n.marks || []).find((m) => m.type === 'link')
      if (link) {
        runs.push(
          new ExternalHyperlink({
            link: link.attrs?.href || '#',
            children: [marksToRun(n)],
          }),
        )
      } else {
        runs.push(marksToRun(n))
      }
    } else if (n.content) {
      runs.push(...inlineToRuns(n.content))
    }
  }
  return runs
}

async function nodeToDocx(node: Node): Promise<any> {
  const attrs = node.attrs || {}
  switch (node.type) {
    case 'paragraph':
      return new Paragraph({
        children: inlineToRuns(node.content),
        alignment: attrs.textAlign ? ALIGN[attrs.textAlign] : undefined,
        heading: attrs.textStyle === 'Title' ? HeadingLevel.TITLE : undefined,
        spacing: attrs.lineHeight ? { line: Math.round(Number(attrs.lineHeight) * 240) } : undefined,
        indent: attrs.indent ? { left: attrs.indent * 720 } : undefined,
      })
    case 'heading':
      return new Paragraph({
        children: inlineToRuns(node.content),
        heading: HEADING[attrs.level || 1],
        alignment: attrs.textAlign ? ALIGN[attrs.textAlign] : undefined,
        indent: attrs.indent ? { left: attrs.indent * 720 } : undefined,
      })
    case 'bulletList':
    case 'orderedList': {
      const ordered = node.type === 'orderedList'
      const items: any[] = (node.content || []).map(
        (li) =>
          new Paragraph({
            children: inlineToRuns((li.content || []).flatMap((p) => p.content || [])),
            numbering: { reference: ordered ? 'num' : 'bul', level: 0 },
          }),
      )
      return items
    }
    case 'blockquote':
      return (node.content || []).map(
        (p) => new Paragraph({ children: inlineToRuns(p.content), indent: { left: 720 }, style: 'Quote' }),
      )
    case 'codeBlock':
      return new Paragraph({
        children: [new TextRun({ text: (node.content || []).map((c) => c.text || '').join(''), font: 'Consolas', size: 20 })],
      })
    case 'horizontalRule':
      return new Paragraph({
        border: { bottom: { color: '999999', size: 6, style: BorderStyle.SINGLE, space: 1 } },
      })
    case 'pageBreak':
      return new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true })
    case 'image': {
      const runs = await imageToRun(attrs.src)
      return new Paragraph({ children: runs as any[], alignment: AlignmentType.CENTER })
    }
    case 'table': {
      const rows = (node.content || []).map(
        (row) =>
          new TableRow({
            children: (row.content || []).map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: inlineToRuns((cell.content || []).flatMap((p) => p.content || [])),
                    }),
                  ],
                }),
            ),
          }),
      )
      return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE } })
    }
    default:
      if (node.content) return new Paragraph({ children: inlineToRuns(node.content) })
      return undefined
  }
}

async function imageToRun(src?: string) {
  if (!src) return []
  try {
    let data: Uint8Array
    let type: 'png' | 'jpg' | 'gif' | 'bmp' = 'png'
    if (src.startsWith('data:')) {
      const [meta, b64] = src.split(',')
      const mime = /:(.*?);/.exec(meta)?.[1] || 'image/png'
      type = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('gif') ? 'gif' : 'png'
      data = base64ToBytes(b64)
    } else {
      const res = await fetch(src)
      data = new Uint8Array(await res.arrayBuffer())
    }
    return [new ImageRun({ data, transformation: { width: 480, height: 320 }, type })]
  } catch {
    return []
  }
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

export async function exportDocx(json: any, title = 'Document1'): Promise<Blob> {
  const children: any[] = []
  for (const node of json.content || []) {
    const out = await nodeToDocx(node)
    if (Array.isArray(out)) children.push(...out)
    else if (out) children.push(out)
  }
  const doc = new Document({
    title,
    styles: {
      default: { document: { run: { font: 'Calibri', size: 22 } } },
    },
    numbering: {
      config: [
        {
          reference: 'bul',
          levels: [
            { level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.BULLET, text: '\u25CB', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ],
        },
        {
          reference: 'num',
          levels: [
            { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
            { level: 1, format: LevelFormat.LOWER_LETTER, text: '%2.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        children: children.length ? children : [new Paragraph('')],
      },
    ],
  })
  return Packer.toBlob(doc)
}

export async function importDocx(file: File): Promise<{ html: string; messages: string[] }> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  return {
    html: result.value || '<p></p>',
    messages: result.messages.map((m) => m.message),
  }
}
