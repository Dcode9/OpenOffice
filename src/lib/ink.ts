import { useSyncExternalStore } from 'react'

export type PenKind = 'pen' | 'pencil' | 'highlighter' | 'effects'
export type InkTool = 'select' | 'lasso' | 'eraser'
export type EraserMode = 'stroke' | 'small' | 'medium' | 'large'
export type InkBackground = 'none' | 'ruled' | 'grid'

export type PenDef = {
  id: string
  name: string
  color: string
  size: number
  kind: PenKind
}

export type InkPoint = {
  x: number
  y: number
  p: number
}

export type InkStroke = {
  id: string
  penId: string
  kind: PenKind
  color: string
  size: number
  points: InkPoint[]
}

export type CanvasRegion = {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export type RulerState = {
  visible: boolean
  x: number
  y: number
  angle: number
}

export type InkState = {
  docKey: string
  pens: PenDef[]
  tool: string
  activePenId: string
  eraserMode: EraserMode
  touchOnly: boolean
  hidden: boolean
  background: InkBackground
  ruler: RulerState
  strokes: InkStroke[]
  selection: string[]
  canvases: CanvasRegion[]
  undo: InkStroke[][]
  redo: InkStroke[][]
  replayNonce: number
}

export const DEFAULT_PENS: PenDef[] = [
  { id: 'black', name: 'Black', color: '#111111', size: 0.5, kind: 'pen' },
  { id: 'red', name: 'Red', color: '#c00000', size: 0.5, kind: 'pen' },
  { id: 'galaxy', name: 'Galaxy Glitter', color: '#6d5bd0', size: 0.5, kind: 'effects' },
  { id: 'gold', name: 'Gold Highlighter', color: '#f0c24b', size: 4, kind: 'highlighter' },
]

export const INK_COLORS = [
  '#111111',
  '#ffffff',
  '#c00000',
  '#ed7d31',
  '#f0c24b',
  '#70ad47',
  '#2f5597',
  '#2b579a',
  '#7030a0',
  '#e0218a',
  '#375623',
  '#833c00',
]

const INK_PENS_KEY = 'openoffice:ink:pens'
const inkKey = (docKey: string) => `openoffice:ink:${docKey}`

type StoredInk = Pick<InkState, 'strokes' | 'canvases' | 'background'>

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignore storage failures */
  }
}

function loadPens(): PenDef[] {
  const saved = readJson<PenDef[]>(INK_PENS_KEY)
  if (!Array.isArray(saved) || saved.length === 0) return DEFAULT_PENS
  const valid = saved.filter(
    (p) => p && typeof p.id === 'string' && typeof p.color === 'string' && typeof p.size === 'number',
  )
  return valid.length ? valid : DEFAULT_PENS
}

function readInk(docKey: string): StoredInk {
  const saved = readJson<StoredInk>(inkKey(docKey))
  if (!saved) return { strokes: [], canvases: [], background: 'none' }
  return {
    strokes: Array.isArray(saved.strokes) ? saved.strokes.filter((s) => s && Array.isArray(s.points)) : [],
    canvases: Array.isArray(saved.canvases) ? saved.canvases : [],
    background: saved.background === 'ruled' || saved.background === 'grid' ? saved.background : 'none',
  }
}

let state: InkState = {
  docKey: '',
  pens: loadPens(),
  tool: 'select',
  activePenId: 'black',
  eraserMode: 'stroke',
  touchOnly: false,
  hidden: false,
  background: 'none',
  ruler: { visible: false, x: 0.5, y: 0.64, angle: 0 },
  strokes: [],
  selection: [],
  canvases: [],
  undo: [],
  redo: [],
  replayNonce: 0,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function setState(patch: Partial<InkState>) {
  state = { ...state, ...patch }
  emit()
}

function persist(next: InkState) {
  if (!next.docKey) return
  writeJson(inkKey(next.docKey), {
    strokes: next.strokes,
    canvases: next.canvases,
    background: next.background,
  } satisfies StoredInk)
}

function persistPens(pens: PenDef[]) {
  writeJson(INK_PENS_KEY, pens)
}

function liveSelection(ids: string[], strokes: InkStroke[]) {
  return ids.filter((id) => strokes.some((stroke) => stroke.id === id))
}

function applyStrokes(next: InkStroke[], previous?: InkStroke[]) {
  const base = previous ?? state.strokes
  const changed =
    next !== base &&
    (next.length !== base.length || next.some((stroke, index) => stroke !== base[index]))
  const undo = changed ? [...state.undo.slice(-49), base] : state.undo
  const redo = changed ? [] : state.redo
  state = { ...state, strokes: next, selection: liveSelection(state.selection, next), undo, redo }
  persist(state)
  emit()
}

export function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getInkState() {
  return state
}

export function useInkState() {
  return useSyncExternalStore(subscribe, getInkState, getInkState)
}

export function bindDocument(docKey: string) {
  if (!docKey || state.docKey === docKey) return
  persist(state)
  const loaded = readInk(docKey)
  state = {
    ...state,
    docKey,
    strokes: loaded.strokes,
    canvases: loaded.canvases,
    background: loaded.background,
    selection: [],
    undo: [],
    redo: [],
    replayNonce: 0,
  }
  emit()
}

export function setTool(tool: string) {
  const pen = state.pens.find((item) => item.id === tool)
  state = { ...state, tool, activePenId: pen ? pen.id : state.activePenId }
  emit()
}

export function choosePen(penId: string) {
  if (!state.pens.some((pen) => pen.id === penId)) return
  state = { ...state, tool: penId, activePenId: penId }
  emit()
}

export function setEraserMode(eraserMode: EraserMode) {
  state = { ...state, eraserMode, tool: 'eraser' }
  emit()
}

export function setTouchOnly(touchOnly: boolean) {
  setState({ touchOnly })
}

export function setBackground(background: InkBackground) {
  state = { ...state, background }
  persist(state)
  emit()
}

export function toggleHidden() {
  setState({ hidden: !state.hidden })
}

export function toggleRuler() {
  setState({ ruler: { ...state.ruler, visible: !state.ruler.visible } })
}

export function setRuler(patch: Partial<RulerState>) {
  setState({ ruler: { ...state.ruler, ...patch } })
}

export function setSelection(selection: string[]) {
  setState({ selection: liveSelection(selection, state.strokes) })
}

export function setStrokesPreview(strokes: InkStroke[]) {
  state = { ...state, strokes, selection: liveSelection(state.selection, strokes) }
  emit()
}

export function commitStrokes(strokes: InkStroke[], previous?: InkStroke[]) {
  applyStrokes(strokes, previous)
}

export function commitErase(strokes: InkStroke[], previous: InkStroke[]) {
  applyStrokes(strokes, previous)
}

export function addStroke(stroke: InkStroke) {
  applyStrokes([...state.strokes, stroke])
}

export function removeStrokes(ids: string[]) {
  if (!ids.length) return
  const next = state.strokes.filter((stroke) => !ids.includes(stroke.id))
  if (next.length === state.strokes.length) return
  applyStrokes(next)
}

export function deleteSelection() {
  removeStrokes(state.selection)
}

export function clearInk() {
  if (!state.strokes.length) return
  applyStrokes([])
}

export function undoInk() {
  const last = state.undo[state.undo.length - 1]
  if (!last) return
  state = {
    ...state,
    strokes: last,
    undo: state.undo.slice(0, -1),
    redo: [...state.redo.slice(-49), state.strokes],
    selection: [],
  }
  persist(state)
  emit()
}

export function redoInk() {
  const next = state.redo[state.redo.length - 1]
  if (!next) return
  state = {
    ...state,
    strokes: next,
    redo: state.redo.slice(0, -1),
    undo: [...state.undo.slice(-49), state.strokes],
    selection: [],
  }
  persist(state)
  emit()
}

export function startReplay() {
  setState({ replayNonce: state.replayNonce + 1 })
}

export function addCanvas() {
  const canvas: CanvasRegion = {
    id: `canvas-${Date.now().toString(36)}`,
    x: 0.15,
    y: 0.24,
    w: 0.7,
    h: 0.38,
  }
  state = { ...state, canvases: [...state.canvases, canvas] }
  persist(state)
  emit()
  return canvas.id
}

export function updateCanvas(id: string, patch: Partial<CanvasRegion>) {
  state = {
    ...state,
    canvases: state.canvases.map((canvas) => (canvas.id === id ? { ...canvas, ...patch } : canvas)),
  }
  persist(state)
  emit()
}

export function removeCanvas(id: string) {
  state = { ...state, canvases: state.canvases.filter((canvas) => canvas.id !== id) }
  persist(state)
  emit()
}

export function updatePen(id: string, patch: Partial<PenDef>) {
  const pens = state.pens.map((pen) => (pen.id === id ? { ...pen, ...patch } : pen))
  state = { ...state, pens }
  persistPens(pens)
  emit()
}

export function addPen(pen: Omit<PenDef, 'id'>) {
  const id = `pen-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
  const pens = [...state.pens, { ...pen, id }]
  state = { ...state, pens, tool: id, activePenId: id }
  persistPens(pens)
  emit()
  return id
}

export function removePen(id: string) {
  const pen = state.pens.find((item) => item.id === id)
  if (!pen || id === 'black') return
  const pens = state.pens.filter((item) => item.id !== id)
  state = {
    ...state,
    pens,
    tool: state.tool === id ? 'select' : state.tool,
    activePenId: state.activePenId === id ? (pens[0]?.id ?? 'black') : state.activePenId,
  }
  persistPens(pens)
  emit()
}

export function penById(id: string) {
  return state.pens.find((pen) => pen.id === id)
}

export function mmToPx(mm: number) {
  return mm * 3.7795275591
}

export function strokeWidthPx(size: number, kind: PenKind) {
  const factor = kind === 'highlighter' ? 1.45 : kind === 'pencil' ? 1.15 : 1.75
  return Math.max(1.2, mmToPx(size) * factor)
}

export type Bounds = { minX: number; minY: number; maxX: number; maxY: number; w: number; h: number }

export function strokeBounds(strokes: InkStroke[]): Bounds | null {
  let minX = 1
  let minY = 1
  let maxX = 0
  let maxY = 0
  let found = false
  for (const stroke of strokes) {
    for (const point of stroke.points) {
      found = true
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
  }
  if (!found) return null
  return { minX, minY, maxX, maxY, w: Math.max(maxX - minX, 0.0001), h: Math.max(maxY - minY, 0.0001) }
}

export function outlinePath(stroke: InkStroke, pageW: number, pageH: number) {
  const W = 1000
  const H = 1000 * (pageH / pageW)
  const base = strokeWidthPx(stroke.size, stroke.kind) * (W / pageW)
  const points = stroke.points.map((point) => ({
    x: point.x * W,
    y: point.y * H,
    w: base * (0.72 + 0.56 * Math.min(1, Math.max(0, point.p || 0.5))),
  }))
  if (points.length < 2) return ''
  const left: { x: number; y: number }[] = []
  const right: { x: number; y: number }[] = []
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index]
    const prev = points[Math.max(0, index - 1)]
    const next = points[Math.min(points.length - 1, index + 1)]
    let dx = next.x - prev.x
    let dy = next.y - prev.y
    const length = Math.hypot(dx, dy) || 1
    dx /= length
    dy /= length
    const half = current.w / 2
    left.push({ x: current.x - dy * half, y: current.y + dx * half })
    right.push({ x: current.x + dy * half, y: current.y - dx * half })
  }
  const fmt = (value: number) => value.toFixed(2)
  let path = `M ${fmt(left[0].x)} ${fmt(left[0].y)}`
  for (let index = 1; index < left.length; index += 1) {
    path += ` L ${fmt(left[index].x)} ${fmt(left[index].y)}`
  }
  for (let index = right.length - 1; index >= 0; index -= 1) {
    path += ` L ${fmt(right[index].x)} ${fmt(right[index].y)}`
  }
  return `${path} Z`
}

export function pointToSegmentDistance(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return Math.hypot(px - ax, py - ay)
  let t = ((px - ax) * dx + (py - ay) * dy) / lengthSq
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (ax + dx * t), py - (ay + dy * t))
}

export function strokeHit(stroke: InkStroke, x: number, y: number, radius: number, pageW: number, pageH: number) {
  if (!stroke.points.length) return false
  if (stroke.points.length === 1) {
    const point = stroke.points[0]
    return Math.hypot((point.x - x) * pageW, (point.y - y) * pageH) <= radius + strokeWidthPx(stroke.size, stroke.kind) / 2
  }
  for (let index = 1; index < stroke.points.length; index += 1) {
    const a = stroke.points[index - 1]
    const b = stroke.points[index]
    const distance = pointToSegmentDistance(x * pageW, y * pageH, a.x * pageW, a.y * pageH, b.x * pageW, b.y * pageH)
    if (distance <= radius + strokeWidthPx(stroke.size, stroke.kind) / 2) return true
  }
  return false
}

export function pointInPolygon(x: number, y: number, polygon: InkPoint[]) {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x
    const yi = polygon[i].y
    const xj = polygon[j].x
    const yj = polygon[j].y
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || 1e-9) + xi
    if (intersects) inside = !inside
  }
  return inside
}

export function shapeBoundsPx(strokes: InkStroke[], pageW: number, pageH: number) {
  const bounds = strokeBounds(strokes)
  if (!bounds) return null
  return { ...bounds, wPx: bounds.w * pageW, hPx: bounds.h * pageH }
}

export function inkToShapeDataUrl(strokes: InkStroke[], pageW: number, pageH: number) {
  const bounds = shapeBoundsPx(strokes, pageW, pageH)
  if (!bounds) return null
  const first = strokes[0]
  const last = strokes[strokes.length - 1]
  const start = first.points[0]
  const end = last.points[last.points.length - 1]
  if (!start || !end) return null
  const closure = Math.hypot((end.x - start.x) * pageW, (end.y - start.y) * pageH) / Math.max(1, Math.hypot(bounds.wPx, bounds.hPx))
  const ratio = bounds.wPx / Math.max(1, bounds.hPx)
  const pad = 8
  const width = Math.max(16, Math.round(bounds.wPx + pad * 2))
  const height = Math.max(16, Math.round(bounds.hPx + pad * 2))
  const weight = Math.max(2, strokeWidthPx(first.size, first.kind))
  const color = first.color
  const style = `fill="none" stroke="${color}" stroke-width="${weight.toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"`
  let figure = ''
  if (closure > 0.45) {
    if (ratio > 0.65 && ratio < 1.55) {
      figure = `<ellipse cx="${(width / 2).toFixed(2)}" cy="${(height / 2).toFixed(2)}" rx="${((width - pad * 2) / 2).toFixed(2)}" ry="${((height - pad * 2) / 2).toFixed(2)}" ${style}/>`
    } else {
      figure = `<rect x="${pad}" y="${pad}" width="${(width - pad * 2).toFixed(2)}" height="${(height - pad * 2).toFixed(2)}" ${style}/>`
    }
  } else if (Math.min(bounds.wPx, bounds.hPx) < Math.max(bounds.wPx, bounds.hPx) * 0.2) {
    const x1 = (start.x - bounds.minX) * pageW + pad
    const y1 = (start.y - bounds.minY) * pageH + pad
    const x2 = (end.x - bounds.minX) * pageW + pad
    const y2 = (end.y - bounds.minY) * pageH + pad
    figure = `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" ${style}/>`
  } else {
    figure = `<rect x="${pad}" y="${pad}" width="${(width - pad * 2).toFixed(2)}" height="${(height - pad * 2).toFixed(2)}" ${style}/>`
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="none"/>${figure}</svg>`
  return {
    src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
    width,
    height,
  }
}

function orientation(stroke: InkStroke, pageW: number, pageH: number) {
  const bounds = strokeBounds([stroke])
  if (!bounds) return 'dot'
  const wPx = bounds.w * pageW
  const hPx = bounds.h * pageH
  if (hPx < 4 && wPx < 4) return 'dot'
  if (wPx > hPx * 2) return 'horizontal'
  if (hPx > wPx * 2) return 'vertical'
  return 'round'
}

function overlaps(a: InkStroke, b: InkStroke, pageW: number, pageH: number) {
  const ba = strokeBounds([a])
  const bb = strokeBounds([b])
  if (!ba || !bb) return false
  return ba.minX * pageW <= bb.maxX * pageW && bb.minX * pageW <= ba.maxX * pageW && ba.minY * pageH <= bb.maxY * pageH && bb.minY * pageH <= ba.maxY * pageH
}

export function recognizeMath(strokes: InkStroke[], pageW: number, pageH: number) {
  if (!strokes.length) return null
  const oriented = strokes.map((stroke) => ({ stroke, kind: orientation(stroke, pageW, pageH) }))
  if (oriented.length === 1) {
    if (oriented[0].kind === 'horizontal') return '−'
    if (oriented[0].kind === 'round') return '0'
    if (oriented[0].kind === 'vertical') return '1'
  }
  if (oriented.length === 2) {
    const kinds = oriented.map((item) => item.kind)
    if (kinds.includes('horizontal') && kinds.includes('vertical') && overlaps(strokes[0], strokes[1], pageW, pageH)) return '+'
    if (kinds.every((kind) => kind === 'horizontal')) return '='
  }
  if (oriented.length === 3 && oriented.filter((item) => item.kind === 'horizontal').length >= 2) return '='
  return null
}
