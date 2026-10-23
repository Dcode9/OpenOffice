import type { CSSProperties } from 'react'
import type { Editor } from '@tiptap/react'
import { insertTextBox, styledRun } from '../../editor/insertActions'
import { MenuLabel } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

type BoxDesign = {
  id: string
  name: string
  content: string
  shading?: string
  borderSides: string
  borderColor: string
  borderWidth: string
  align?: string
  preview: CSSProperties
}

const author = styledRun('— Author Name', { size: 11, color: '#7f7f7f', italic: true })

const DESIGNS: BoxDesign[] = [
  {
    id: 'simple',
    name: 'Simple Text Box',
    content: 'Type your text here',
    borderSides: 'top,bottom,left,right',
    borderColor: '#8a8a8a',
    borderWidth: '1px',
    preview: { border: '1px solid #8a8a8a', background: '#fff' },
  },
  {
    id: 'simple-quote',
    name: 'Simple Quote',
    content: styledRun('“Type your quote here.”', { size: 14, italic: true, color: '#404040' }),
    borderSides: 'left',
    borderColor: '#2b579a',
    borderWidth: '4px',
    preview: { borderLeft: '4px solid #2b579a', background: '#fff', fontStyle: 'italic' },
  },
  {
    id: 'austin-quote',
    name: 'Austin Quote',
    content: `${styledRun('“Design is intelligence made visible.”', { size: 16, italic: true, color: '#1f3864' })}<br>${author}`,
    borderSides: 'top,bottom',
    borderColor: '#2b579a',
    borderWidth: '2px',
    align: 'center',
    preview: { borderTop: '2px solid #2b579a', borderBottom: '2px solid #2b579a', background: '#fff', fontStyle: 'italic' },
  },
  {
    id: 'austin-sidebar',
    name: 'Austin Sidebar',
    content: styledRun('Sidebar heading', { size: 15, bold: true, color: '#1f3864' }) + '<br>' + styledRun('Add supporting details here.', { size: 11, color: '#595959' }),
    shading: '#eef3fa',
    borderSides: 'left',
    borderColor: '#2b579a',
    borderWidth: '5px',
    preview: { borderLeft: '5px solid #2b579a', background: '#eef3fa' },
  },
  {
    id: 'banded-quote',
    name: 'Banded Quote',
    content: styledRun('“Great things are done by a series of small things brought together.”', { size: 14, italic: true, color: '#ffffff' }) + '<br>' + styledRun('— Vincent van Gogh', { size: 11, color: '#dbe5f1' }),
    shading: '#4472c4',
    borderSides: 'top,bottom,left,right',
    borderColor: '#4472c4',
    borderWidth: '1px',
    preview: { background: '#4472c4', color: '#fff' },
  },
  {
    id: 'banded-sidebar',
    name: 'Banded Sidebar',
    content: styledRun('Banded Sidebar', { size: 14, bold: true, color: '#1f4e79' }) + '<br>' + styledRun('Use this panel for notes, tips, or references.', { size: 11, color: '#404040' }),
    shading: '#dce6f2',
    borderSides: 'top,bottom',
    borderColor: '#2e74b5',
    borderWidth: '2px',
    preview: { background: '#dce6f2', borderTop: '2px solid #2e74b5', borderBottom: '2px solid #2e74b5' },
  },
  {
    id: 'facet-sidebar',
    name: 'Facet Sidebar',
    content: styledRun('Facet', { size: 15, bold: true, color: '#0f6cbd' }) + '<br>' + styledRun('A clean sidebar for key information.', { size: 11, color: '#4d4d4d' }),
    shading: '#f2f7fc',
    borderSides: 'left,right',
    borderColor: '#0f6cbd',
    borderWidth: '3px',
    preview: { background: '#f2f7fc', borderLeft: '3px solid #0f6cbd', borderRight: '3px solid #0f6cbd' },
  },
  {
    id: 'grid-sidebar',
    name: 'Grid Sidebar',
    content: styledRun('Grid Sidebar', { size: 14, bold: true, color: '#44546a' }) + '<br>' + styledRun('Structured content in a bordered panel.', { size: 11, color: '#595959' }),
    borderSides: 'top,bottom,left,right',
    borderColor: '#8496b0',
    borderWidth: '1px',
    preview: { border: '1px solid #8496b0', background: '#fff' },
  },
  {
    id: 'integral-sidebar',
    name: 'Integral Sidebar',
    content: styledRun('Integral', { size: 15, bold: true, color: '#1f4e79' }) + '<br>' + styledRun('A strong typographic panel for callouts.', { size: 11, color: '#404040' }),
    shading: '#e9eef5',
    borderSides: 'top,bottom',
    borderColor: '#1f4e79',
    borderWidth: '5px',
    preview: { background: '#e9eef5', borderTop: '5px solid #1f4e79', borderBottom: '5px solid #1f4e79' },
  },
  {
    id: 'motion-sidebar',
    name: 'Motion Sidebar',
    content: styledRun('Motion', { size: 15, bold: true, color: '#c55a11' }) + '<br>' + styledRun('Add a quick note or highlight.', { size: 11, color: '#595959' }),
    shading: '#fdf1e8',
    borderSides: 'left',
    borderColor: '#c55a11',
    borderWidth: '6px',
    preview: { background: '#fdf1e8', borderLeft: '6px solid #c55a11' },
  },
  {
    id: 'slice-sidebar',
    name: 'Slice Sidebar',
    content: styledRun('Slice', { size: 14, bold: true, color: '#ffffff', }) + '<br>' + styledRun('Colored heading with a clear body.', { size: 11, color: '#ffffff' }),
    shading: '#548235',
    borderSides: 'top,bottom,left,right',
    borderColor: '#548235',
    borderWidth: '1px',
    preview: { background: '#548235', color: '#fff' },
  },
  {
    id: 'viewmaster',
    name: 'ViewMaster',
    content: styledRun('ViewMaster', { size: 14, bold: true, color: '#bf9000' }) + '<br>' + styledRun('Present key facts in a compact box.', { size: 11, color: '#404040' }),
    borderSides: 'top,bottom,left,right',
    borderColor: '#bf9000',
    borderWidth: '3px',
    preview: { border: '3px double #bf9000', background: '#fffdf4' },
  },
  {
    id: 'whisp',
    name: 'Whisp',
    content: styledRun('Whisp', { size: 14, bold: true, color: '#5b9bd5' }) + '<br>' + styledRun('Subtle callout for supporting text.', { size: 11, color: '#595959' }),
    shading: '#f4f9fd',
    borderSides: 'bottom',
    borderColor: '#5b9bd5',
    borderWidth: '2px',
    preview: { background: '#f4f9fd', borderBottom: '2px solid #5b9bd5' },
  },
]

export function TextBoxGallery({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const insert = (design: BoxDesign) => {
    insertTextBox(editor, {
      content: design.content,
      shading: design.shading,
      borderSides: design.borderSides,
      borderColor: design.borderColor,
      borderWidth: design.borderWidth,
      align: design.align,
    })
    onInserted(`Text box inserted: ${design.name}`)
    onClose()
  }

  return (
    <div className="ins-textbox-gallery">
      <MenuLabel>Built-In Text Boxes</MenuLabel>
      <div className="ins-textbox-grid">
        {DESIGNS.map((design) => (
          <button key={design.id} type="button" className="ins-textbox-card" onClick={() => insert(design)} title={design.name}>
            <span className="ins-textbox-preview" style={design.preview}>
              <span className="ins-textbox-title">{design.name}</span>
              <span className="ins-textbox-lines"><span /><span /><span /></span>
            </span>
            <span className="ins-textbox-name">{design.name}</span>
          </button>
        ))}
      </div>
      <div className="ins-hint">Each design is inserted as an editable, styled text block at the cursor.</div>
    </div>
  )
}
