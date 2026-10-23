import { useWord } from '../../context'
import { MenuItem, MenuLabel, MenuSep } from '../ribbon/ui'
import '../../styles/insert-advanced.css'

type HFLayout = 'blank' | 'plain' | 'columns' | 'banded' | 'rule' | 'grid' | 'large' | 'accent' | 'boxed' | 'side'

type HFDesign = {
  id: string
  name: string
  layout: HFLayout
  accent: string
  align: 'left' | 'center' | 'right'
  text: (title: string, page: number) => string
}

const HEADER_DESIGNS: HFDesign[] = [
  { id: 'blank', name: 'Blank', layout: 'blank', accent: '#2b579a', align: 'center', text: () => '' },
  { id: 'blank3', name: 'Blank (Three Columns)', layout: 'columns', accent: '#2b579a', align: 'center', text: (title) => `${title}          Section          Date` },
  { id: 'austin', name: 'Austin', layout: 'large', accent: '#2b579a', align: 'left', text: (title) => title },
  { id: 'banded', name: 'Banded', layout: 'banded', accent: '#4472c4', align: 'left', text: (title) => `${title}   |   Company` },
  { id: 'facet', name: 'Facet', layout: 'plain', accent: '#0f6cbd', align: 'right', text: (title) => title },
  { id: 'filigree', name: 'Filigree', layout: 'accent', accent: '#8a6d3b', align: 'center', text: (title) => `~ ${title} ~` },
  { id: 'grid', name: 'Grid', layout: 'grid', accent: '#44546a', align: 'center', text: (title) => `${title}        |        Page 1` },
  { id: 'integral', name: 'Integral', layout: 'large', accent: '#1f4e79', align: 'left', text: (title) => title.toUpperCase() },
  { id: 'ion', name: 'Ion', layout: 'rule', accent: '#44546a', align: 'left', text: (title) => `ION    ${title}` },
  { id: 'motion', name: 'Motion', layout: 'side', accent: '#c55a11', align: 'left', text: (title) => `${title}   •` },
  { id: 'retrospect', name: 'Retrospect', layout: 'banded', accent: '#7030a0', align: 'center', text: () => 'RETROSPECT' },
  { id: 'semaphore', name: 'Semaphore', layout: 'columns', accent: '#c00000', align: 'center', text: (title) => `SEMAPHORE      ${title}      CONFIDENTIAL` },
  { id: 'sideline', name: 'Sideline', layout: 'side', accent: '#2e74b5', align: 'right', text: (title) => title },
  { id: 'slice', name: 'Slice', layout: 'boxed', accent: '#548235', align: 'left', text: (title) => `${title} / Report` },
  { id: 'viewmaster', name: 'ViewMaster', layout: 'rule', accent: '#bf9000', align: 'center', text: (title) => `VIEWMASTER · ${title}` },
  { id: 'whisp', name: 'Whisp', layout: 'accent', accent: '#5b9bd5', align: 'right', text: (title) => title },
]

const FOOTER_DESIGNS: HFDesign[] = [
  { id: 'blank', name: 'Blank', layout: 'blank', accent: '#2b579a', align: 'center', text: () => '' },
  { id: 'blank3', name: 'Blank (Three Columns)', layout: 'columns', accent: '#2b579a', align: 'center', text: (title) => `${title}          Page 1          Confidential` },
  { id: 'austin', name: 'Austin', layout: 'large', accent: '#2b579a', align: 'center', text: () => 'Austin | 1' },
  { id: 'banded', name: 'Banded', layout: 'banded', accent: '#4472c4', align: 'left', text: (title) => `${title}   |   Page 1` },
  { id: 'facet', name: 'Facet', layout: 'rule', accent: '#0f6cbd', align: 'right', text: () => 'Page 1' },
  { id: 'filigree', name: 'Filigree', layout: 'accent', accent: '#8a6d3b', align: 'center', text: (title) => `~ ${title} ~   1` },
  { id: 'grid', name: 'Grid', layout: 'grid', accent: '#44546a', align: 'center', text: (title) => `${title}        |        Page 1` },
  { id: 'integral', name: 'Integral', layout: 'large', accent: '#1f4e79', align: 'left', text: () => 'INTEGRAL   •   1' },
  { id: 'ion', name: 'Ion', layout: 'boxed', accent: '#44546a', align: 'center', text: (title) => `ION   ${title}   1` },
  { id: 'motion', name: 'Motion', layout: 'side', accent: '#c55a11', align: 'left', text: () => 'MOTION   1' },
  { id: 'retrospect', name: 'Retrospect', layout: 'banded', accent: '#7030a0', align: 'center', text: () => 'RETROSPECT   1' },
  { id: 'semaphore', name: 'Semaphore', layout: 'columns', accent: '#c00000', align: 'center', text: (title) => `${title}      Semaphore      Page 1` },
  { id: 'sideline', name: 'Sideline', layout: 'side', accent: '#2e74b5', align: 'right', text: (title) => `${title}   1` },
  { id: 'slice', name: 'Slice', layout: 'boxed', accent: '#548235', align: 'left', text: () => 'Slice | 1' },
  { id: 'viewmaster', name: 'ViewMaster', layout: 'rule', accent: '#bf9000', align: 'center', text: (title) => `VIEWMASTER · ${title} · 1` },
  { id: 'whisp', name: 'Whisp', layout: 'accent', accent: '#5b9bd5', align: 'right', text: () => 'Whisp  1' },
]

function DesignPreview({ design, position }: { design: HFDesign; position: 'header' | 'footer' }) {
  const lines = (
    <span className={`ins-hf-lines${design.layout === 'columns' ? ' columns' : ''}`}>
      <span style={{ background: design.accent }} />
      <span style={{ background: design.accent }} />
      <span style={{ background: design.accent }} />
    </span>
  )
  const textLine = (
    <span className="ins-hf-text" style={{ color: design.accent, justifyContent: design.align }}>
      {design.layout === 'blank' ? '' : design.layout === 'large' ? 'Document Title' : 'Document'}
    </span>
  )
  return (
    <span className={`ins-hf-preview ${position}`}>
      <span className="ins-hf-sheet">
        <span className={`ins-hf-bar ${design.layout}`}>
          {design.layout === 'blank' && <span className="ins-hf-blank" />}
          {design.layout === 'columns' && lines}
          {design.layout === 'banded' && <span className="ins-hf-band" style={{ background: design.accent }} />}
          {(design.layout === 'grid' || design.layout === 'boxed') && <span className="ins-hf-gridlines" style={{ borderColor: design.accent }} />}
          {design.layout !== 'columns' && design.layout !== 'blank' && design.layout !== 'banded' && design.layout !== 'grid' && textLine}
          {design.layout === 'accent' && <span className="ins-hf-accent" style={{ background: design.accent }} />}
          {design.layout === 'side' && <span className="ins-hf-side" style={{ background: design.accent }} />}
          {design.layout === 'rule' && <span className="ins-hf-rule" style={{ background: design.accent }} />}
          {(design.layout === 'grid' || design.layout === 'boxed') && textLine}
        </span>
        <span className="ins-hf-body">
          <span />
          <span />
          <span />
        </span>
      </span>
    </span>
  )
}

function Gallery({
  title,
  designs,
  position,
  onClose,
}: {
  title: string
  designs: HFDesign[]
  position: 'header' | 'footer'
  onClose: () => void
}) {
  const { docTitle, setHeaderText, setFooterText, setShowHeader, setShowFooter, toast } = useWord()

  const apply = (design: HFDesign) => {
    const text = design.text(docTitle, 1)
    if (position === 'header') {
      setHeaderText(text)
      setShowHeader(true)
    } else {
      setFooterText(text)
      setShowFooter(true)
    }
    toast(`${design.name} ${position} applied`)
    onClose()
  }

  return (
    <div className="ins-hf-gallery">
      <MenuLabel>{title}</MenuLabel>
      <MenuItem
        label={`Edit ${position === 'header' ? 'Header' : 'Footer'}`}
        onClick={() => {
          if (position === 'header') setShowHeader(true)
          else setShowFooter(true)
          onClose()
        }}
      />
      <MenuSep />
      <div className="ins-hf-grid">
        {designs.map((design) => (
          <button key={design.id} type="button" className="ins-hf-card" onClick={() => apply(design)} title={`${design.name} ${position}`}>
            <DesignPreview design={design} position={position} />
            <span className="ins-hf-name">{design.name}</span>
          </button>
        ))}
      </div>
      <MenuSep />
      <MenuItem
        label={`Remove ${position === 'header' ? 'Header' : 'Footer'}`}
        onClick={() => {
          if (position === 'header') {
            setShowHeader(false)
            setHeaderText('')
          } else {
            setShowFooter(false)
            setFooterText('')
          }
          toast(`${position === 'header' ? 'Header' : 'Footer'} removed`)
          onClose()
        }}
      />
    </div>
  )
}

export function HeaderGallery({ onClose }: { onClose: () => void }) {
  return <Gallery title="Header Gallery" designs={HEADER_DESIGNS} position="header" onClose={onClose} />
}

export function FooterGallery({ onClose }: { onClose: () => void }) {
  return <Gallery title="Footer Gallery" designs={FOOTER_DESIGNS} position="footer" onClose={onClose} />
}

export { HEADER_DESIGNS, FOOTER_DESIGNS }
