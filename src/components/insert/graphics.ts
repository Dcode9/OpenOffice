export type ShapeDef = {
  id: string
  name: string
  category: string
  kind: 'shape' | 'hline' | 'canvas'
  svg: (w?: number, h?: number) => string
}

const FILL = '#5b9bd5'
const STROKE = '#41719c'
const ACCENT = '#2b579a'

function esc(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function wrap(w: number, h: number, body: string, view = '0 0 100 70') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${view}"><g fill="${FILL}" stroke="${STROKE}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`
}

function shape(id: string, name: string, category: string, body: string, kind: ShapeDef['kind'] = 'shape'): ShapeDef {
  return { id, name, category, kind, svg: (w = 220, h = 154) => wrap(w, h, body) }
}

function line(id: string, name: string, body: string): ShapeDef {
  return { id, name, category: 'Lines', kind: 'shape', svg: (w = 220, h = 154) => wrap(w, h, `<g fill="none" stroke="${STROKE}" stroke-width="3">${body}</g>`) }
}

export const SHAPE_CATEGORIES: { id: string; name: string; shapes: ShapeDef[] }[] = [
  {
    id: 'lines',
    name: 'Lines',
    shapes: [
      line('line', 'Line', '<line x1="8" y1="60" x2="92" y2="12"/>'),
      line('arrow', 'Arrow', '<line x1="8" y1="60" x2="88" y2="14"/><path d="M92 10 L78 14 L84 26 Z" fill="#41719c"/>'),
      line('double-arrow', 'Double Arrow', '<line x1="12" y1="58" x2="88" y2="12"/><path d="M8 62 L22 58 L16 46 Z" fill="#41719c"/><path d="M92 8 L78 12 L84 24 Z" fill="#41719c"/>'),
      line('elbow', 'Elbow Connector', '<path d="M10 58 H55 V14 H90"/>'),
      line('curved', 'Curved Connector', '<path d="M10 58 C40 58 32 12 90 12"/>'),
      line('curve-arrow', 'Curved Arrow', '<path d="M10 58 C40 58 34 16 82 16"/><path d="M90 12 L74 14 L80 28 Z" fill="#41719c"/>'),
      shape('hline', 'Horizontal Line', 'Lines', '', 'hline'),
    ],
  },
  {
    id: 'rectangles',
    name: 'Rectangles',
    shapes: [
      shape('rect', 'Rectangle', 'Rectangles', '<rect x="14" y="14" width="72" height="42" rx="1"/>'),
      shape('round-rect', 'Rounded Rectangle', 'Rectangles', '<rect x="14" y="14" width="72" height="42" rx="9"/>'),
      shape('snip-same', 'Snip Same Side Corner', 'Rectangles', '<path d="M24 14 H86 V56 H24 L14 46 V24 Z"/>'),
      shape('snip-top', 'Snip Top Corners', 'Rectangles', '<path d="M24 14 H76 L86 24 V56 H14 V24 Z"/>'),
      shape('snip-diag', 'Snip Diagonal Corner', 'Rectangles', '<path d="M24 14 H86 V46 L76 56 H14 V24 Z"/>'),
      shape('snip-both', 'Snip Top and Bottom', 'Rectangles', '<path d="M24 14 H76 L86 24 V46 L76 56 H24 L14 46 V24 Z"/>'),
    ],
  },
  {
    id: 'basic',
    name: 'Basic Shapes',
    shapes: [
      shape('oval', 'Oval', 'Basic Shapes', '<ellipse cx="50" cy="35" rx="36" ry="23"/>'),
      shape('triangle', 'Isosceles Triangle', 'Basic Shapes', '<path d="M50 10 L88 60 H12 Z"/>'),
      shape('right-triangle', 'Right Triangle', 'Basic Shapes', '<path d="M14 60 V12 L86 60 Z"/>'),
      shape('diamond', 'Diamond', 'Basic Shapes', '<path d="M50 8 L88 35 L50 62 L12 35 Z"/>'),
      shape('pentagon', 'Pentagon', 'Basic Shapes', '<path d="M50 8 L89 36 L74 62 H26 L11 36 Z"/>'),
      shape('hexagon', 'Hexagon', 'Basic Shapes', '<path d="M28 12 H72 L89 35 L72 58 H28 L11 35 Z"/>'),
      shape('octagon', 'Octagon', 'Basic Shapes', '<path d="M30 12 H70 L88 30 V40 L70 58 H30 L12 40 V30 Z"/>'),
      shape('parallelogram', 'Parallelogram', 'Basic Shapes', '<path d="M26 14 H90 L74 56 H10 Z"/>'),
      shape('trapezoid', 'Trapezoid', 'Basic Shapes', '<path d="M26 14 H74 L90 56 H10 Z"/>'),
      shape('cross', 'Cross', 'Basic Shapes', '<path d="M38 12 H62 V28 H78 V52 H62 V62 H38 V52 H22 V28 H38 Z"/>'),
      shape('cylinder', 'Cylinder', 'Basic Shapes', '<path d="M18 20 C18 11 82 11 82 20 V50 C82 59 18 59 18 50 Z"/><ellipse cx="50" cy="20" rx="32" ry="9"/>'),
      shape('cube', 'Cube', 'Basic Shapes', '<path d="M28 24 L66 24 L86 14 L48 14 Z"/><path d="M28 24 V52 L48 62 V34 Z" fill="#4a87bf"/><path d="M48 34 L86 34 V14 L66 24 V52 Z" fill="#7fb3dc"/>'),
      shape('donut', 'Donut', 'Basic Shapes', '<path fill-rule="evenodd" d="M50 10 A25 25 0 1 0 50 60 A25 25 0 1 0 50 10 Z M50 24 A11 11 0 1 1 50 46 A11 11 0 1 1 50 24 Z"/>'),
      shape('teardrop', 'Teardrop', 'Basic Shapes', '<path d="M50 8 C52 26 86 32 86 46 A36 22 0 1 1 14 46 C14 32 48 26 50 8 Z"/>'),
      shape('heart', 'Heart', 'Basic Shapes', '<path d="M50 60 C20 40 10 30 18 20 C26 10 42 16 50 26 C58 16 74 10 82 20 C90 30 80 40 50 60 Z"/>'),
    ],
  },
  {
    id: 'arrows',
    name: 'Block Arrows',
    shapes: [
      shape('arrow-right', 'Right Arrow', 'Block Arrows', '<path d="M10 26 H55 V12 L90 35 L55 58 V44 H10 Z"/>'),
      shape('arrow-left', 'Left Arrow', 'Block Arrows', '<path d="M90 26 H45 V12 L10 35 L45 58 V44 H90 Z"/>'),
      shape('arrow-up', 'Up Arrow', 'Block Arrows', '<path d="M35 60 V32 H20 L50 8 L80 32 H65 V60 Z"/>'),
      shape('arrow-down', 'Down Arrow', 'Block Arrows', '<path d="M35 10 V38 H20 L50 62 L80 38 H65 V10 Z"/>'),
      shape('arrow-lr', 'Left-Right Arrow', 'Block Arrows', '<path d="M10 35 L26 18 V28 H74 V18 L90 35 L74 52 V42 H26 V52 Z"/>'),
      shape('arrow-quad', 'Quad Arrow', 'Block Arrows', '<path d="M38 28 H26 V16 L12 22 L26 8 V18 H38 V8 H50 L56 2 L62 8 H74 V18 H86 L100 22 L86 16 V28 H74 V38 H86 L100 46 L86 42 H74 V52 H62 L56 62 L50 52 H38 V42 H26 V52 L12 46 L26 42 H38 Z" transform="translate(-6 -2) scale(0.92)"/>'),
      shape('arrow-bent', 'Bent Arrow', 'Block Arrows', '<path d="M12 56 H52 V30 H40 L60 10 L80 30 H68 V62 H12 Z"/>'),
      shape('arrow-uturn', 'U-Turn Arrow', 'Block Arrows', '<path d="M18 14 H58 A22 22 0 0 1 58 58 H40 V48 H58 A12 12 0 0 0 58 24 H18 V36 L2 19 L18 2 Z"/>'),
      shape('arrow-circular', 'Circular Arrow', 'Block Arrows', '<path d="M82 22 A34 24 0 1 0 86 45 L74 45 A23 15 0 1 1 70 24 L82 34 Z"/><path d="M78 12 L94 20 L78 30 Z"/>'),
      shape('arrow-notched', 'Notched Right Arrow', 'Block Arrows', '<path d="M10 26 H52 L42 12 L90 35 L42 58 L52 44 H10 Z"/>'),
      shape('arrow-striped', 'Striped Right Arrow', 'Block Arrows', '<path d="M8 24 H18 V12 L28 18 L38 12 L48 18 L58 12 V24 H62 L92 35 L62 46 V58 L52 52 L42 58 L32 52 L22 58 L18 52 V46 H8 Z"/>'),
      shape('chevron', 'Chevron', 'Block Arrows', '<path d="M14 14 H54 L86 35 L54 56 H14 L46 35 Z"/>'),
    ],
  },
  {
    id: 'equation',
    name: 'Equation Shapes',
    shapes: [
      shape('eq-plus', 'Plus', 'Equation Shapes', '<path d="M38 12 H62 V30 H80 V50 H62 V62 H38 V50 H20 V30 H38 Z"/>'),
      shape('eq-minus', 'Minus', 'Equation Shapes', '<rect x="16" y="31" width="68" height="10" rx="2"/>'),
      shape('eq-multiply', 'Multiply', 'Equation Shapes', '<path d="M24 16 L50 35 L76 16 L84 24 L60 35 L84 46 L76 54 L50 35 L24 54 L16 46 L40 35 L16 24 Z"/>'),
      shape('eq-divide', 'Divide', 'Equation Shapes', '<rect x="16" y="31" width="68" height="10" rx="2"/><circle cx="50" cy="17" r="6"/><circle cx="50" cy="55" r="6"/>'),
      shape('eq-equal', 'Equal', 'Equation Shapes', '<rect x="18" y="24" width="64" height="8" rx="2"/><rect x="18" y="40" width="64" height="8" rx="2"/>'),
      shape('eq-notequal', 'Not Equal', 'Equation Shapes', '<rect x="18" y="24" width="64" height="8" rx="2"/><rect x="18" y="40" width="64" height="8" rx="2"/><path d="M68 12 L34 60" stroke-width="4"/>'),
    ],
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    shapes: [
      shape('fc-process', 'Process', 'Flowchart', '<rect x="12" y="18" width="76" height="34"/>'),
      shape('fc-decision', 'Decision', 'Flowchart', '<path d="M50 8 L88 35 L50 62 L12 35 Z"/>'),
      shape('fc-data', 'Data', 'Flowchart', '<path d="M24 18 H88 L76 52 H12 Z"/>'),
      shape('fc-document', 'Document', 'Flowchart', '<path d="M14 14 H86 V48 C74 40 62 56 50 50 C38 44 28 58 14 52 Z"/>'),
      shape('fc-terminator', 'Terminator', 'Flowchart', '<rect x="12" y="18" width="76" height="34" rx="16"/>'),
      shape('fc-preparation', 'Preparation', 'Flowchart', '<path d="M26 18 H74 L88 35 L74 52 H26 L12 35 Z"/>'),
      shape('fc-manual', 'Manual Input', 'Flowchart', '<path d="M14 26 L86 14 V52 H14 Z"/>'),
      shape('fc-database', 'Database', 'Flowchart', '<path d="M18 22 C18 13 82 13 82 22 V48 C82 57 18 57 18 48 Z"/><ellipse cx="50" cy="22" rx="32" ry="8"/>'),
      shape('fc-connector', 'Connector', 'Flowchart', '<circle cx="50" cy="35" r="20"/>'),
      shape('fc-delay', 'Delay', 'Flowchart', '<path d="M14 18 H62 A17 17 0 0 1 62 52 H14 Z"/>'),
      shape('fc-display', 'Display', 'Flowchart', '<path d="M18 18 H54 L88 35 L54 52 H18 L30 35 Z"/>'),
    ],
  },
  {
    id: 'stars',
    name: 'Stars and Banners',
    shapes: [
      shape('star4', '4-Point Star', 'Stars and Banners', '<path d="M50 6 L58 28 L82 35 L58 42 L50 64 L42 42 L18 35 L42 28 Z"/>'),
      shape('star5', '5-Point Star', 'Stars and Banners', '<path d="M50 6 L60 27 L84 29 L66 45 L72 66 L50 54 L28 66 L34 45 L16 29 L40 27 Z"/>'),
      shape('star6', '6-Point Star', 'Stars and Banners', '<path d="M50 6 L60 22 L78 18 L72 36 L88 47 L69 51 L68 64 L50 54 L32 64 L31 51 L12 47 L28 36 L22 18 L40 22 Z"/>'),
      shape('star8', '8-Point Star', 'Stars and Banners', '<path d="M50 4 L57 24 L75 15 L67 33 L88 35 L70 45 L82 60 L62 55 L58 68 L50 51 L42 68 L38 55 L18 60 L30 45 L12 35 L33 33 L25 15 L43 24 Z"/>'),
      shape('explosion1', 'Explosion 1', 'Stars and Banners', '<path d="M50 4 L58 22 L74 9 L70 28 L90 22 L76 37 L92 47 L71 47 L78 66 L58 55 L50 68 L42 55 L22 66 L29 47 L8 47 L24 37 L10 22 L30 28 L26 9 L42 22 Z"/>'),
      shape('explosion2', 'Explosion 2', 'Stars and Banners', '<path d="M50 5 L60 20 L78 12 L72 30 L92 30 L78 43 L90 57 L70 53 L66 68 L52 56 L38 68 L34 53 L14 57 L26 43 L12 30 L32 30 L26 12 L44 20 Z"/>'),
      shape('banner', 'Banner', 'Stars and Banners', '<path d="M10 22 H26 V14 H74 V22 H90 V48 H74 V56 H26 V48 H10 Z"/>'),
      shape('ribbon', 'Ribbon', 'Stars and Banners', '<path d="M10 20 H90 V42 H64 L54 52 L44 42 H10 Z"/><path d="M10 48 H30 L22 64 L10 58 Z"/><path d="M90 48 H70 L78 64 L90 58 Z"/>'),
      shape('wave', 'Wave', 'Stars and Banners', '<path d="M8 24 C24 12 40 36 56 24 C72 12 88 36 92 28 V46 C76 58 60 34 44 46 C28 58 12 34 8 42 Z"/>'),
      shape('scroll-h', 'Horizontal Scroll', 'Stars and Banners', '<path d="M22 12 H78 A10 10 0 1 0 78 58 H22 A10 10 0 1 0 22 12 Z"/>'),
    ],
  },
  {
    id: 'callouts',
    name: 'Callouts',
    shapes: [
      shape('callout-rect', 'Rectangular Callout', 'Callouts', '<path d="M12 10 H88 V48 H44 L26 60 L28 48 H12 Z"/>'),
      shape('callout-round', 'Rounded Rectangular Callout', 'Callouts', '<path d="M22 10 H78 A10 10 0 0 1 88 20 V38 A10 10 0 0 1 78 48 H44 L26 60 L28 48 H22 A10 10 0 0 1 12 38 V20 A10 10 0 0 1 22 10 Z"/>'),
      shape('callout-oval', 'Oval Callout', 'Callouts', '<path d="M50 8 C28 8 12 18 12 32 C12 42 21 50 34 54 L28 64 L46 57 C48 57 50 57 52 57 C74 57 88 48 88 32 C88 18 72 8 50 8 Z"/>'),
      shape('callout-cloud', 'Cloud Callout', 'Callouts', '<path d="M24 44 C14 44 8 38 10 30 C8 22 16 16 24 18 C26 8 40 6 46 14 C54 8 66 12 68 22 C78 20 84 28 82 36 C90 40 86 50 76 50 C72 58 56 58 52 50 C40 56 30 52 24 44 Z"/>'),
      shape('callout-line', 'Line Callout', 'Callouts', '<rect x="20" y="8" width="68" height="32"/><path d="M20 40 L8 60 L38 40" fill="none" stroke-width="2"/>'),
      shape('callout-accent', 'Line Callout Accent', 'Callouts', '<rect x="20" y="8" width="68" height="32"/><path d="M20 40 L8 60 L38 40" fill="none" stroke-width="2"/><circle cx="36" cy="40" r="3"/>'),
    ],
  },
  {
    id: 'canvas',
    name: 'Drawing Canvas',
    shapes: [
      shape('drawing-canvas', 'New Drawing Canvas', 'Drawing Canvas', '<rect x="8" y="8" width="84" height="54" fill="#ffffff" stroke="#9a9a9a" stroke-dasharray="3 3"/><path d="M8 20 H92 M20 8 V62" stroke="#e2e2e2" stroke-width="1"/><path d="M36 46 L46 32 L54 42 L62 26 L74 46" fill="none" stroke="#5b9bd5" stroke-width="2"/>', 'canvas'),
    ],
  },
]

export const ALL_SHAPES = SHAPE_CATEGORIES.flatMap((c) => c.shapes)

export function shapeById(id: string) {
  return ALL_SHAPES.find((s) => s.id === id)
}

export function categoryOf(id: string) {
  return ALL_SHAPES.find((s) => s.id === id)?.category || ''
}

type SceneVariant = {
  id: string
  name: string
  from: string
  to: string
  accent: string
  motif: 'mountains' | 'city' | 'waves' | 'abstract' | 'forest' | 'sunset' | 'desert' | 'bokeh'
}

const STOCK_VARIANTS: SceneVariant[] = [
  { id: 'mountains', name: 'Mountain Sunrise', from: '#8ec5fc', to: '#f7c8d8', accent: '#2b579a', motif: 'mountains' },
  { id: 'city', name: 'City at Dusk', from: '#1c2b4a', to: '#5e7fa8', accent: '#f4b942', motif: 'city' },
  { id: 'waves', name: 'Ocean Waves', from: '#b7f8db', to: '#3b8ec9', accent: '#0f5f91', motif: 'waves' },
  { id: 'abstract', name: 'Abstract Geometry', from: '#f6d365', to: '#fda085', accent: '#7030a0', motif: 'abstract' },
  { id: 'forest', name: 'Misty Forest', from: '#d7f0e0', to: '#7aa974', accent: '#2f5d3a', motif: 'forest' },
  { id: 'sunset', name: 'Sunset Ridge', from: '#ffb75e', to: '#ed8f03', accent: '#8a3b00', motif: 'sunset' },
  { id: 'desert', name: 'Desert Dunes', from: '#f8d49a', to: '#d99954', accent: '#7a4a1e', motif: 'desert' },
  { id: 'bokeh', name: 'Soft Bokeh', from: '#c2e9fb', to: '#a1c4fd', accent: '#3867a6', motif: 'bokeh' },
]

function motifMarkup(motif: SceneVariant['motif'], accent: string) {
  switch (motif) {
    case 'mountains':
      return `<path d="M0 190 L90 95 L145 145 L205 70 L300 200 Z" fill="#34495e" opacity=".78"/><path d="M120 200 L200 120 L260 165 L320 105 V200 Z" fill="#22313f" opacity=".88"/><circle cx="268" cy="46" r="20" fill="#fff3c4"/>`
    case 'city':
      return `<g fill="#101b2d" opacity=".9"><rect x="8" y="110" width="36" height="90"/><rect x="50" y="80" width="42" height="120"/><rect x="98" y="128" width="30" height="72"/><rect x="134" y="64" width="46" height="136"/><rect x="186" y="104" width="38" height="96"/><rect x="230" y="86" width="44" height="114"/><rect x="280" y="126" width="34" height="74"/></g><g fill="#ffd166"><rect x="58" y="94" width="8" height="8"/><rect x="74" y="94" width="8" height="8"/><rect x="146" y="78" width="8" height="8"/><rect x="162" y="78" width="8" height="8"/><rect x="240" y="100" width="8" height="8"/></g>`
    case 'waves':
      return `<path d="M0 130 C45 100 75 160 120 130 C165 100 195 160 240 130 C285 100 315 160 360 130 V200 H0 Z" fill="#2f86b8" opacity=".7"/><path d="M0 160 C45 130 75 190 120 160 C165 130 195 190 240 160 C285 130 315 190 360 160 V200 H0 Z" fill="#1d6692" opacity=".7"/>`
    case 'abstract':
      return `<circle cx="90" cy="80" r="52" fill="#ffffff" opacity=".55"/><rect x="160" y="40" width="80" height="80" rx="12" fill="#7030a0" opacity=".55" transform="rotate(18 200 80)"/><path d="M250 30 L320 140 H190 Z" fill="#2b579a" opacity=".5"/><circle cx="60" cy="160" r="26" fill="#0f6cbd" opacity=".55"/>`
    case 'forest':
      return `<g fill="#3f6b46" opacity=".85"><path d="M30 200 L58 88 L86 200 Z"/><path d="M88 200 L118 64 L148 200 Z"/><path d="M150 200 L182 96 L214 200 Z"/><path d="M214 200 L246 76 L278 200 Z"/><path d="M278 200 L310 104 L342 200 Z"/></g><rect x="0" y="178" width="360" height="22" fill="#2f5d3a" opacity=".8"/>`
    case 'sunset':
      return `<circle cx="180" cy="120" r="44" fill="#fff1b8"/><path d="M0 150 L70 118 L130 150 L190 112 L250 150 L310 120 L360 148 V200 H0 Z" fill="#7a3d12" opacity=".8"/><path d="M0 176 L90 144 L170 178 L250 146 L330 176 L360 164 V200 H0 Z" fill="#4d2609" opacity=".8"/>`
    case 'desert':
      return `<path d="M0 150 C80 108 130 172 210 142 C270 120 320 142 360 130 V200 H0 Z" fill="#c7853f"/><path d="M0 178 C90 148 160 196 240 168 C300 148 330 170 360 164 V200 H0 Z" fill="#9c5d26"/>`
    default:
      return `<g fill="#ffffff"><circle cx="60" cy="62" r="22" opacity=".55"/><circle cx="130" cy="110" r="30" opacity=".3"/><circle cx="230" cy="54" r="18" opacity=".5"/><circle cx="290" cy="132" r="26" opacity=".28"/><circle cx="190" cy="160" r="14" opacity=".4"/></g>`
  }
}

export function stockSvg(variant: SceneVariant, w = 360, h = 200) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 360 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${variant.from}"/><stop offset="1" stop-color="${variant.to}"/></linearGradient></defs><rect width="360" height="200" fill="url(#g)"/>${motifMarkup(variant.motif, variant.accent)}</svg>`
}

export const STOCK_IMAGES = STOCK_VARIANTS.map((v) => ({
  id: v.id,
  name: v.name,
  thumb: stockSvg(v, 180, 100),
  full: stockSvg(v, 640, 356),
}))

export function windowThumbSvg(title: string, accent: string, w = 340, h = 210) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 340 210"><rect width="340" height="210" rx="8" fill="#f4f4f4" stroke="#b9b9b9"/><rect width="340" height="26" rx="8" fill="${accent}"/><rect y="18" width="340" height="8" fill="${accent}"/><circle cx="16" cy="13" r="4" fill="#fff" opacity=".7"/><circle cx="30" cy="13" r="4" fill="#fff" opacity=".5"/><circle cx="44" cy="13" r="4" fill="#fff" opacity=".35"/><text x="170" y="18" font-family="Segoe UI, sans-serif" font-size="11" fill="#fff" text-anchor="middle">${esc(title)}</text><rect x="18" y="42" width="304" height="150" rx="4" fill="#ffffff" stroke="#d7d7d7"/><rect x="34" y="58" width="116" height="9" rx="4" fill="${accent}" opacity=".75"/><rect x="34" y="78" width="250" height="6" rx="3" fill="#d9d9d9"/><rect x="34" y="92" width="226" height="6" rx="3" fill="#d9d9d9"/><rect x="34" y="106" width="242" height="6" rx="3" fill="#e5e5e5"/><rect x="34" y="132" width="76" height="44" rx="4" fill="${accent}" opacity=".18"/><rect x="122" y="132" width="76" height="44" rx="4" fill="${accent}" opacity=".12"/><rect x="210" y="132" width="76" height="44" rx="4" fill="${accent}" opacity=".08"/></svg>`
}

export const AVAILABLE_WINDOWS = [
  { id: 'word', title: 'Document1 - Word', accent: '#185abd' },
  { id: 'browser', title: 'Microsoft Edge', accent: '#0f6cbd' },
  { id: 'explorer', title: 'File Explorer', accent: '#c9a227' },
]

export function desktopSvg(w = 760, h = 470) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 760 470"><defs><linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f2a4a"/><stop offset=".55" stop-color="#1e5a8a"/><stop offset="1" stop-color="#77b6d6"/></linearGradient></defs><rect width="760" height="470" fill="url(#wall)"/><path d="M0 330 C150 260 320 380 470 300 C600 230 690 300 760 270 V470 H0 Z" fill="#0b1d33" opacity=".6"/><g><rect x="60" y="80" width="380" height="250" rx="10" fill="#f7f7f7" stroke="#b5c7d8"/><rect x="60" y="80" width="380" height="30" rx="10" fill="#185abd"/><rect x="60" y="100" width="380" height="10" fill="#185abd"/><circle cx="78" cy="95" r="5" fill="#fff" opacity=".75"/><circle cx="96" cy="95" r="5" fill="#fff" opacity=".55"/><rect x="80" y="130" width="150" height="10" rx="5" fill="#185abd" opacity=".8"/><rect x="80" y="152" width="330" height="7" rx="4" fill="#dce3ea"/><rect x="80" y="168" width="300" height="7" rx="4" fill="#dce3ea"/><rect x="80" y="184" width="320" height="7" rx="4" fill="#e7edf2"/><rect x="80" y="214" width="96" height="76" rx="6" fill="#185abd" opacity=".16"/><rect x="188" y="214" width="96" height="76" rx="6" fill="#185abd" opacity=".11"/><rect x="296" y="214" width="96" height="76" rx="6" fill="#185abd" opacity=".07"/></g><g transform="translate(430 210)"><rect width="270" height="180" rx="10" fill="#2b2b2b" stroke="#4a4a4a"/><rect width="270" height="28" rx="10" fill="#3a3a3a"/><rect y="18" width="270" height="10" fill="#3a3a3a"/><rect x="16" y="44" width="70" height="8" rx="4" fill="#4a9eff"/><rect x="16" y="64" width="230" height="7" rx="4" fill="#5a5a5a"/><rect x="16" y="80" width="210" height="7" rx="4" fill="#5a5a5a"/><rect x="16" y="96" width="222" height="7" rx="4" fill="#4f4f4f"/><rect x="16" y="126" width="104" height="34" rx="5" fill="#4a9eff" opacity=".25"/><rect x="130" y="126" width="104" height="34" rx="5" fill="#4a9eff" opacity=".15"/></g><rect x="0" y="440" width="760" height="30" fill="#06111f" opacity=".8"/><g fill="#ffffff" opacity=".8"><circle cx="30" cy="456" r="7"/><rect x="52" y="450" width="54" height="12" rx="3"/><rect x="118" y="450" width="54" height="12" rx="3"/><rect x="184" y="450" width="54" height="12" rx="3"/></g><g fill="#ffffff" opacity=".55"><rect x="640" y="450" width="80" height="11" rx="3"/></g></svg>`
}

export type ModelKind = 'cube' | 'torus' | 'sphere' | 'pyramid'

export function modelSvg(kind: ModelKind, w = 360, h = 260) {
  const label = kind.charAt(0).toUpperCase() + kind.slice(1)
  const body: Record<ModelKind, string> = {
    cube: `<g transform="translate(180 128)"><path d="M-70 -18 L0 -58 L70 -18 L70 50 L0 90 L-70 50 Z" fill="#c9def3" stroke="#5b8bb8"/><path d="M-70 -18 L0 22 L70 -18 L0 -58 Z" fill="#eaf3fc" stroke="#5b8bb8"/><path d="M0 22 V90" stroke="#5b8bb8"/><path d="M-70 -18 V50 L0 90" fill="#a9c8e6" stroke="#5b8bb8"/></g>`,
    torus: `<g transform="translate(180 128)"><ellipse cx="0" cy="0" rx="78" ry="54" fill="#d8e8f8" stroke="#5b8bb8" stroke-width="2"/><ellipse cx="0" cy="0" rx="36" ry="22" fill="#ffffff" stroke="#5b8bb8" stroke-width="2"/><path d="M-72 0 C-72 -30 -40 -50 0 -50 C40 -50 72 -30 72 0" fill="none" stroke="#94b9dc" stroke-width="6" opacity=".7"/></g>`,
    sphere: `<g transform="translate(180 128)"><circle r="78" fill="#e5eef8" stroke="#5b8bb8" stroke-width="2"/><ellipse cx="0" cy="0" rx="78" ry="26" fill="none" stroke="#a9c8e6" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="26" ry="78" fill="none" stroke="#a9c8e6" stroke-width="1.5"/><path d="M-38 -46 A58 58 0 0 1 30 -58" fill="none" stroke="#ffffff" stroke-width="10" stroke-linecap="round" opacity=".9"/></g>`,
    pyramid: `<g transform="translate(180 128)"><path d="M0 -76 L86 62 H-86 Z" fill="#d8e8f8" stroke="#5b8bb8"/><path d="M0 -76 V62" stroke="#5b8bb8"/><path d="M0 -76 L86 62 L0 62 Z" fill="#b6d0e8" stroke="#5b8bb8"/></g>`,
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 360 260"><rect width="360" height="260" rx="12" fill="#f7fbff" stroke="#d9e4ef"/>${body[kind]}<text x="180" y="218" font-family="Segoe UI, sans-serif" font-size="13" fill="#5b6b7c" text-anchor="middle">3D Model · ${label}</text><text x="180" y="238" font-family="Segoe UI, sans-serif" font-size="9" fill="#9aa8b6" text-anchor="middle">Double-click to edit in 3D</text></svg>`
}

export type SmartArtKind = 'organization' | 'cycle' | 'process' | 'hierarchy' | 'relationship' | 'matrix'

const SMART_ART_COLORS = ['#2b579a', '#5b9bd5', '#9dc3e6', '#c9d9ee', '#4472c4', '#8faadc']

export function smartArtSvg(kind: SmartArtKind, w = 600, h = 320) {
  const box = (x: number, y: number, width: number, height: number, text: string, color: string, round = 4) =>
    `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${round}" fill="${color}"/><text x="${x + width / 2}" y="${y + height / 2 + 4}" font-family="Segoe UI, sans-serif" font-size="13" fill="#fff" text-anchor="middle">${esc(text)}</text>`
  const line = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#b4c4d6" stroke-width="2"/>`
  const titles: Record<SmartArtKind, string> = {
    organization: 'Organization Chart',
    cycle: 'Basic Cycle',
    process: 'Process',
    hierarchy: 'Hierarchy',
    relationship: 'Relationship',
    matrix: 'Matrix',
  }
  let body = ''
  if (kind === 'organization') {
    body = `${line(300, 94, 300, 130)}${line(300, 130, 150, 130)}${line(300, 130, 450, 130)}${line(150, 130, 150, 160)}${line(450, 130, 450, 160)}${line(300, 130, 300, 160)}${box(240, 54, 120, 40, 'CEO', SMART_ART_COLORS[0])}${box(90, 160, 120, 40, 'Finance', SMART_ART_COLORS[1])}${box(240, 160, 120, 40, 'Operations', SMART_ART_COLORS[2])}${box(390, 160, 120, 40, 'Marketing', SMART_ART_COLORS[4])}${line(150, 200, 150, 228)}${line(450, 200, 450, 228)}${box(94, 228, 112, 34, 'Team A', '#8faadc')}${box(394, 228, 112, 34, 'Team B', '#8faadc')}`
  } else if (kind === 'cycle') {
    body = `<circle cx="300" cy="160" r="92" fill="none" stroke="#c9d9ee" stroke-width="26"/><path d="M300 52 L326 76 L300 96 L274 76 Z" fill="${SMART_ART_COLORS[0]}"/>${box(238, 42, 124, 38, 'Plan', SMART_ART_COLORS[0], 19)}${box(424, 132, 124, 38, 'Do', SMART_ART_COLORS[1], 19)}${box(238, 238, 124, 38, 'Review', SMART_ART_COLORS[2], 19)}${box(50, 132, 124, 38, 'Improve', SMART_ART_COLORS[4], 19)}`
  } else if (kind === 'process') {
    body = `${box(40, 128, 120, 64, 'Step 1', SMART_ART_COLORS[0])}${box(180, 128, 120, 64, 'Step 2', SMART_ART_COLORS[1])}${box(320, 128, 120, 64, 'Step 3', SMART_ART_COLORS[2])}${box(460, 128, 120, 64, 'Step 4', SMART_ART_COLORS[4])}${`<path d="M160 160 H180 M300 160 H320 M440 160 H460" stroke="#b4c4d6" stroke-width="3"/>`}`
  } else if (kind === 'hierarchy') {
    body = `${box(240, 40, 120, 40, 'Level 1', SMART_ART_COLORS[0])}${line(300, 80, 300, 112)}${line(120, 112, 480, 112)}${line(120, 112, 120, 140)}${line(300, 112, 300, 140)}${line(480, 112, 480, 140)}${box(60, 140, 120, 40, 'Level 2', SMART_ART_COLORS[1])}${box(240, 140, 120, 40, 'Level 2', SMART_ART_COLORS[1])}${box(420, 140, 120, 40, 'Level 2', SMART_ART_COLORS[1])}${line(120, 180, 120, 208)}${line(300, 180, 300, 208)}${line(480, 180, 480, 208)}${box(60, 208, 120, 38, 'Level 3', SMART_ART_COLORS[2])}${box(240, 208, 120, 38, 'Level 3', SMART_ART_COLORS[2])}${box(420, 208, 120, 38, 'Level 3', SMART_ART_COLORS[2])}`
  } else if (kind === 'relationship') {
    body = `<circle cx="300" cy="160" r="58" fill="${SMART_ART_COLORS[0]}"/><text x="300" y="165" font-family="Segoe UI, sans-serif" font-size="13" fill="#fff" text-anchor="middle">Core</text><circle cx="150" cy="92" r="46" fill="${SMART_ART_COLORS[1]}"/><text x="150" y="97" font-family="Segoe UI, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Team</text><circle cx="450" cy="92" r="46" fill="${SMART_ART_COLORS[2]}"/><text x="450" y="97" font-family="Segoe UI, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Partner</text><circle cx="150" cy="236" r="46" fill="${SMART_ART_COLORS[4]}"/><text x="150" y="241" font-family="Segoe UI, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Client</text><circle cx="450" cy="236" r="46" fill="${SMART_ART_COLORS[2]}"/><text x="450" y="241" font-family="Segoe UI, sans-serif" font-size="12" fill="#fff" text-anchor="middle">Supplier</text><g stroke="#b4c4d6" stroke-width="2"><line x1="192" y1="120" x2="258" y2="142"/><line x1="408" y1="120" x2="342" y2="142"/><line x1="192" y1="208" x2="258" y2="178"/><line x1="408" y1="208" x2="342" y2="178"/></g>`
  } else {
    body = `${box(70, 62, 190, 82, 'Quadrant 1', SMART_ART_COLORS[0])}${box(340, 62, 190, 82, 'Quadrant 2', SMART_ART_COLORS[1])}${box(70, 184, 190, 82, 'Quadrant 3', SMART_ART_COLORS[2])}${box(340, 184, 190, 82, 'Quadrant 4', SMART_ART_COLORS[4])}`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 600 320"><rect width="600" height="320" rx="10" fill="#ffffff" stroke="#d9e4ef"/><text x="300" y="28" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600" fill="#44546a" text-anchor="middle">${titles[kind]}</text>${body}</svg>`
}

export const SMART_ART_ITEMS: { kind: SmartArtKind; name: string; description: string }[] = [
  { kind: 'organization', name: 'Organization Chart', description: 'Show reporting relationships' },
  { kind: 'cycle', name: 'Basic Cycle', description: 'Continuous process steps' },
  { kind: 'process', name: 'Process', description: 'Sequential steps in a workflow' },
  { kind: 'hierarchy', name: 'Hierarchy', description: 'Levels of an organization' },
  { kind: 'relationship', name: 'Relationship', description: 'Connections between people or groups' },
  { kind: 'matrix', name: 'Matrix', description: 'Parts of a whole in a grid' },
]

export type ChartKind = 'column' | 'bar' | 'line' | 'area' | 'pie'

export type ChartSeries = { label: string; value: number }

export function chartSvg(kind: ChartKind, title: string, series: ChartSeries[], w = 600, h = 340) {
  const palette = ['#2b579a', '#5b9bd5', '#9dc3e6', '#4472c4', '#8faadc']
  const max = Math.max(...series.map((s) => s.value), 1)
  const plotX = 70
  const plotY = 58
  const plotW = 470
  const plotH = 210
  let body = ''
  if (kind === 'pie') {
    const total = series.reduce((sum, item) => sum + item.value, 0) || 1
    let angle = -Math.PI / 2
    const cx = 300
    const cy = 168
    const r = 96
    body = series
      .map((item, index) => {
        const slice = (item.value / total) * Math.PI * 2
        const start = angle
        const end = angle + slice
        angle = end
        const large = slice > Math.PI ? 1 : 0
        const x1 = cx + r * Math.cos(start)
        const y1 = cy + r * Math.sin(start)
        const x2 = cx + r * Math.cos(end)
        const y2 = cy + r * Math.sin(end)
        return `<path d="M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z" fill="${palette[index % palette.length]}"/>`
      })
      .join('')
    body += series
      .map((item, index) => `<rect x="${430}" y="${96 + index * 22}" width="10" height="10" fill="${palette[index % palette.length]}"/><text x="${446}" y="${105 + index * 22}" font-family="Segoe UI, sans-serif" font-size="11" fill="#44546a">${esc(item.label)}</text>`)
      .join('')
  } else {
    const grid = [0, 0.25, 0.5, 0.75, 1]
      .map((t) => {
        const y = plotY + plotH - t * plotH
        return `<line x1="${plotX}" y1="${y}" x2="${plotX + plotW}" y2="${y}" stroke="#e2e8f0"/><text x="${plotX - 12}" y="${y + 4}" font-family="Segoe UI, sans-serif" font-size="10" fill="#8a97a8" text-anchor="end">${Math.round(max * t)}</text>`
      })
      .join('')
    const labels = series
      .map((item, index) => `<text x="${plotX + (plotW / series.length) * (index + 0.5)}" y="${plotY + plotH + 22}" font-family="Segoe UI, sans-serif" font-size="11" fill="#44546a" text-anchor="middle">${esc(item.label)}</text>`)
      .join('')
    if (kind === 'column' || kind === 'bar') {
      const slot = plotW / series.length
      const bars = series
        .map((item, index) => {
          if (kind === 'column') {
            const bh = (item.value / max) * plotH
            return `<rect x="${plotX + slot * index + slot * 0.18}" y="${plotY + plotH - bh}" width="${slot * 0.64}" height="${bh}" rx="2" fill="${palette[index % palette.length]}"/>`
          }
          const bh = plotH / series.length
          const bw = (item.value / max) * plotW
          return `<rect x="${plotX}" y="${plotY + bh * index + bh * 0.16}" width="${bw}" height="${bh * 0.68}" rx="2" fill="${palette[index % palette.length]}"/>`
        })
        .join('')
      body = `${grid}${bars}${labels}`
    } else {
      const points = series.map((item, index) => {
        const x = plotX + (plotW / series.length) * (index + 0.5)
        const y = plotY + plotH - (item.value / max) * plotH
        return { x, y, item }
      })
      const linePath = points.map((p, index) => `${index === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
      const areaPath = `${linePath} L${points[points.length - 1].x.toFixed(1)} ${plotY + plotH} L${points[0].x.toFixed(1)} ${plotY + plotH} Z`
      const dots = points.map((p, index) => `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#fff" stroke="${palette[index % palette.length]}" stroke-width="2"/>`).join('')
      body = `${grid}${kind === 'area' ? `<path d="${areaPath}" fill="${palette[0]}" opacity=".22"/>` : ''}<path d="${linePath}" fill="none" stroke="${palette[0]}" stroke-width="2.5"/>${dots}${labels}`
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 600 340"><rect width="600" height="340" rx="10" fill="#ffffff" stroke="#d9e4ef"/><text x="300" y="30" font-family="Segoe UI, sans-serif" font-size="15" font-weight="600" fill="#44546a" text-anchor="middle">${esc(title)}</text>${body}</svg>`
}

export const CHART_TYPES: { kind: ChartKind; name: string }[] = [
  { kind: 'column', name: 'Column' },
  { kind: 'bar', name: 'Bar' },
  { kind: 'line', name: 'Line' },
  { kind: 'area', name: 'Area' },
  { kind: 'pie', name: 'Pie' },
]

export const DEFAULT_CHART_SERIES: ChartSeries[] = [
  { label: 'Q1', value: 42 },
  { label: 'Q2', value: 68 },
  { label: 'Q3', value: 55 },
  { label: 'Q4', value: 84 },
]
