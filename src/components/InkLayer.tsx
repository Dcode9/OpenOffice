import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useWord } from '../context'
import {
  addStroke,
  removeCanvas,
  bindDocument,
  commitErase,
  deleteSelection,
  outlinePath,
  pointInPolygon,
  setRuler,
  setSelection,
  setStrokesPreview,
  strokeBounds,
  strokeHit,
  strokeWidthPx,
  updateCanvas,
  useInkState,
  type CanvasRegion,
  type InkPoint,
  type InkStroke,
  type PenDef,
} from '../lib/ink'
import '../styles/draw.css'

type Props = {
  pageW: number
  pageH: number
}

const TOOL_SPECIAL = new Set(['select', 'lasso', 'eraser'])

function isPenTool(tool: string) {
  return !TOOL_SPECIAL.has(tool)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function pressureOf(event: PointerEvent) {
  if (event.pointerType === 'pen' && event.pressure > 0) return event.pressure
  if (event.pressure > 0 && event.pressure < 1) return event.pressure
  return 0.5
}

function draftStroke(pen: PenDef, point: InkPoint): InkStroke {
  return {
    id: `stroke-${Date.now().toString(36)}-${Math.floor(Math.random() * 100000)}`,
    penId: pen.id,
    kind: pen.kind,
    color: pen.color,
    size: pen.size,
    points: [point],
  }
}

function runsForErase(stroke: InkStroke, point: InkPoint, radius: number, pageW: number, pageH: number) {
  const runs: InkPoint[][] = []
  let current: InkPoint[] = []
  for (const item of stroke.points) {
    const distance = Math.hypot((item.x - point.x) * pageW, (item.y - point.y) * pageH)
    if (distance <= radius) {
      if (current.length > 1) runs.push(current)
      current = []
    } else {
      current.push(item)
    }
  }
  if (current.length > 1) runs.push(current)
  if (!runs.length) return []
  return runs.map((points, index) => ({
    ...stroke,
    id: runs.length === 1 ? stroke.id : `${stroke.id}-${index}-${Date.now().toString(36)}`,
    points,
  }))
}

function eraseAt(
  strokes: InkStroke[],
  point: InkPoint,
  mode: string,
  pageW: number,
  pageH: number,
) {
  const radius = mode === 'small' ? 8 : mode === 'medium' ? 18 : mode === 'large' ? 32 : 12
  if (mode === 'stroke') {
    const next = strokes.filter((stroke) => !strokeHit(stroke, point.x, point.y, radius, pageW, pageH))
    return { strokes: next, changed: next.length !== strokes.length }
  }
  let changed = false
  const next: InkStroke[] = []
  for (const stroke of strokes) {
    const parts = runsForErase(stroke, point, radius, pageW, pageH)
    if (parts.length === 1 && parts[0] === stroke) {
      next.push(stroke)
      continue
    }
    if (parts.length !== 1 || parts[0]?.id !== stroke.id) changed = true
    next.push(...parts)
  }
  return { strokes: next, changed }
}

function replaySlice(strokes: InkStroke[], progress: number) {
  const total = strokes.reduce((count, stroke) => count + stroke.points.length, 0)
  let budget = total * progress
  const visible: InkStroke[] = []
  for (const stroke of strokes) {
    if (budget <= 0) break
    if (budget >= stroke.points.length) {
      visible.push(stroke)
      budget -= stroke.points.length
    } else {
      const count = Math.max(2, Math.floor(budget))
      visible.push({ ...stroke, points: stroke.points.slice(0, count) })
      budget = 0
    }
  }
  return visible
}

export default function InkLayer({ pageW, pageH }: Props) {
  const { activeTab, docTitle } = useWord()
  const ink = useInkState()
  const active = activeTab === 'Draw'
  const tool = ink.tool
  const drawing = active && isPenTool(tool)
  const erasing = active && tool === 'eraser'
  const lassoing = active && tool === 'lasso'
  const selecting = active && tool === 'select'
  const interactive = drawing || erasing || lassoing
  const layerRef = useRef<HTMLDivElement>(null)
  const [draft, setDraft] = useState<InkStroke | null>(null)
  const draftRef = useRef<InkStroke | null>(null)
  const [lasso, setLasso] = useState<InkPoint[]>([])
  const lassoRef = useRef<InkPoint[]>([])
  const eraseRef = useRef<{ previous: InkStroke[]; working: InkStroke[]; changed: boolean; last: InkPoint | null } | null>(null)
  const [replay, setReplay] = useState<{ nonce: number; progress: number } | null>(null)
  const lastReplay = useRef(ink.replayNonce)
  const pointerRef = useRef<number | null>(null)
  const [cursor, setCursor] = useState<InkPoint | null>(null)
  const rulerDrag = useRef<{ mode: 'move' | 'rotate'; clientX: number; clientY: number; x: number; y: number } | null>(null)
  const canvasDrag = useRef<{
    id: string
    mode: 'move' | 'resize'
    clientX: number
    clientY: number
    x: number
    y: number
    w: number
    h: number
  } | null>(null)

  useEffect(() => {
    bindDocument(docTitle)
  }, [docTitle])

  useEffect(() => {
    if (ink.replayNonce === lastReplay.current) return
    lastReplay.current = ink.replayNonce
    if (!ink.strokes.length) return
    const totalPoints = ink.strokes.reduce((count, stroke) => count + stroke.points.length, 0)
    const duration = Math.min(4800, Math.max(1100, totalPoints * 9))
    const started = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      setReplay({ nonce: ink.replayNonce, progress })
      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        window.setTimeout(() => setReplay(null), 650)
      }
    }
    setReplay({ nonce: ink.replayNonce, progress: 0 })
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [ink.replayNonce, ink.strokes])

  useEffect(() => {
    if (!selecting) return
    const onDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (!target) return
      if (target.closest('[data-ink-stroke]') || target.closest('.ink-selection-bar')) return
      if (ink.selection.length) setSelection([])
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [selecting, ink.selection.length])

  useEffect(() => {
    if (!active || !ink.selection.length) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, [contenteditable="true"]')) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault()
        deleteSelection()
      } else if (event.key === 'Escape') {
        setSelection([])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, ink.selection.length])

  useEffect(() => {
    if (!interactive) setCursor(null)
  }, [interactive])

  const rectOf = () => layerRef.current?.getBoundingClientRect() ?? null

  const snap = (point: InkPoint): InkPoint => {
    const ruler = ink.ruler
    if (!ruler.visible) return point
    const rect = rectOf()
    if (!rect) return point
    const px = point.x * rect.width
    const py = point.y * rect.height
    const cx = ruler.x * rect.width
    const cy = ruler.y * rect.height
    const dx = Math.cos(ruler.angle)
    const dy = Math.sin(ruler.angle)
    const half = rect.width * 0.44
    const projected = clamp((px - cx) * dx + (py - cy) * dy, -half, half)
    const sx = cx + dx * projected
    const sy = cy + dy * projected
    if (Math.hypot(px - sx, py - sy) <= 30) {
      return { x: clamp(sx / rect.width, 0, 1), y: clamp(sy / rect.height, 0, 1), p: point.p }
    }
    return point
  }

  const pointFromEvent = (clientX: number, clientY: number, pressure: number): InkPoint | null => {
    const rect = rectOf()
    if (!rect) return null
    return snap({
      x: clamp((clientX - rect.left) / rect.width, 0, 1),
      y: clamp((clientY - rect.top) / rect.height, 0, 1),
      p: pressure,
    })
  }

  const startPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!active || ink.hidden) return
    if (ink.touchOnly && event.pointerType === 'mouse') return
    const target = event.target as Element
    if (target.closest('.ink-ruler, .ink-canvas, .ink-selection-bar, button')) return
    if (tool === 'select') return
    const point = pointFromEvent(event.clientX, event.clientY, pressureOf(event.nativeEvent))
    if (!point) return
    event.preventDefault()
    ;(document.activeElement as HTMLElement | null)?.blur?.()
    layerRef.current?.setPointerCapture(event.pointerId)
    pointerRef.current = event.pointerId
    if (tool === 'lasso') {
      lassoRef.current = [point]
      setLasso([point])
      return
    }
    if (tool === 'eraser') {
      const result = eraseAt(ink.strokes, point, ink.eraserMode, pageW, pageH)
      eraseRef.current = { previous: ink.strokes, working: result.strokes, changed: result.changed, last: point }
      if (result.changed) setStrokesPreview(result.strokes)
      return
    }
    const pen = ink.pens.find((item) => item.id === tool)
    if (!pen) return
    const stroke = draftStroke(pen, point)
    draftRef.current = stroke
    setDraft(stroke)
  }

  const movePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (erasing) {
      const point = pointFromEvent(event.clientX, event.clientY, 0.5)
      if (point) setCursor(point)
    }
    if (!pointerRef.current || pointerRef.current !== event.pointerId) return
    if (draftRef.current) {
      const native = event.nativeEvent
      const samples = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [native]
      let points = draftRef.current.points
      const rect = rectOf()
      if (!rect) return
      let appended = false
      for (const sample of samples) {
        const point = pointFromEvent(sample.clientX, sample.clientY, pressureOf(sample))
        if (!point) continue
        const last = points[points.length - 1]
        if (last && Math.hypot((point.x - last.x) * rect.width, (point.y - last.y) * rect.height) < 0.7) continue
        points = [...points, point]
        appended = true
      }
      if (appended) {
        const next = { ...draftRef.current, points }
        draftRef.current = next
        setDraft(next)
      }
      return
    }
    if (lassoRef.current.length) {
      const point = pointFromEvent(event.clientX, event.clientY, 0.5)
      if (!point) return
      const last = lassoRef.current[lassoRef.current.length - 1]
      const rect = rectOf()
      if (last && rect && Math.hypot((point.x - last.x) * rect.width, (point.y - last.y) * rect.height) < 2.2) return
      lassoRef.current = [...lassoRef.current, point]
      setLasso(lassoRef.current)
      return
    }
    const erase = eraseRef.current
    if (erase) {
      const point = pointFromEvent(event.clientX, event.clientY, 0.5)
      if (!point) return
      const radius = ink.eraserMode === 'small' ? 8 : ink.eraserMode === 'medium' ? 18 : ink.eraserMode === 'large' ? 32 : 12
      let working = erase.working
      let changed = erase.changed
      const last = erase.last ?? point
      const distance = Math.hypot((point.x - last.x) * pageW, (point.y - last.y) * pageH)
      const steps = Math.max(1, Math.ceil(distance / Math.max(1, radius * 0.6)))
      for (let step = 0; step <= steps; step += 1) {
        const t = steps === 0 ? 0 : step / steps
        const sample = { x: last.x + (point.x - last.x) * t, y: last.y + (point.y - last.y) * t, p: 0.5 }
        const result = eraseAt(working, sample, ink.eraserMode, pageW, pageH)
        working = result.strokes
        changed = changed || result.changed
      }
      erase.working = working
      erase.changed = changed
      erase.last = point
      if (changed) setStrokesPreview(working)
    }
  }

  const endPointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerRef.current !== null) {
      try {
        layerRef.current?.releasePointerCapture(pointerRef.current)
      } catch {
        /* ignore */
      }
    }
    pointerRef.current = null
    if (draftRef.current) {
      const stroke = draftRef.current
      draftRef.current = null
      setDraft(null)
      if (stroke.points.length) addStroke(stroke)
      return
    }
    if (lassoRef.current.length) {
      const polygon = lassoRef.current
      lassoRef.current = []
      setLasso([])
      if (polygon.length >= 3) {
        const ids = ink.strokes
          .filter((stroke) => stroke.points.some((point) => pointInPolygon(point.x, point.y, polygon)))
          .map((stroke) => stroke.id)
        setSelection(ids)
      } else {
        setSelection([])
      }
      return
    }
    const erase = eraseRef.current
    eraseRef.current = null
    if (erase && erase.changed) commitErase(erase.working, erase.previous)
  }

  const onStrokePointerDown = (stroke: InkStroke, event: ReactPointerEvent<SVGElement>) => {
    if (!selecting || ink.hidden) return
    event.stopPropagation()
    event.preventDefault()
    const multi = event.ctrlKey || event.metaKey || event.shiftKey
    if (multi) {
      setSelection(
        ink.selection.includes(stroke.id)
          ? ink.selection.filter((id) => id !== stroke.id)
          : [...ink.selection, stroke.id],
      )
    } else {
      setSelection([stroke.id])
    }
  }

  const startRulerDrag = (event: ReactPointerEvent<HTMLDivElement>, mode: 'move' | 'rotate') => {
    if (!active) return
    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    rulerDrag.current = { mode, clientX: event.clientX, clientY: event.clientY, x: ink.ruler.x, y: ink.ruler.y }
  }

  const moveRuler = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = rulerDrag.current
    const rect = rectOf()
    if (!drag || !rect) return
    if (drag.mode === 'move') {
      const x = clamp(drag.x + (event.clientX - drag.clientX) / rect.width, 0.06, 0.94)
      const y = clamp(drag.y + (event.clientY - drag.clientY) / rect.height, 0.06, 0.94)
      setRuler({ x, y })
    } else {
      const cx = ink.ruler.x * rect.width + rect.left
      const cy = ink.ruler.y * rect.height + rect.top
      setRuler({ angle: Math.atan2(event.clientY - cy, event.clientX - cx) })
    }
  }

  const endRulerDrag = () => {
    rulerDrag.current = null
  }

  const startCanvasDrag = (event: ReactPointerEvent<HTMLElement>, canvas: CanvasRegion, mode: 'move' | 'resize') => {
    if (!active) return
    event.stopPropagation()
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    canvasDrag.current = {
      id: canvas.id,
      mode,
      clientX: event.clientX,
      clientY: event.clientY,
      x: canvas.x,
      y: canvas.y,
      w: canvas.w,
      h: canvas.h,
    }
  }

  const moveCanvas = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = canvasDrag.current
    const rect = rectOf()
    if (!drag || !rect) return
    const dx = (event.clientX - drag.clientX) / rect.width
    const dy = (event.clientY - drag.clientY) / rect.height
    if (drag.mode === 'move') {
      updateCanvas(drag.id, {
        x: clamp(drag.x + dx, 0, Math.max(0, 1 - drag.w)),
        y: clamp(drag.y + dy, 0, Math.max(0, 1 - drag.h)),
      })
    } else {
      updateCanvas(drag.id, {
        w: clamp(drag.w + dx, 0.16, 1 - drag.x),
        h: clamp(drag.h + dy, 0.12, 1 - drag.y),
      })
    }
  }

  const endCanvasDrag = () => {
    canvasDrag.current = null
  }

  const W = 1000
  const H = 1000 * (pageH / pageW)
  const visibleStrokes = replay ? replaySlice(ink.strokes, replay.progress) : ink.strokes
  const showStrokes = !ink.hidden || Boolean(replay)
  const selectionStrokes = ink.strokes.filter((stroke) => ink.selection.includes(stroke.id))
  const selectionBounds = strokeBounds(selectionStrokes)
  const lassoPath = lasso.length
    ? `${lasso.map((point, index) => `${index === 0 ? 'M' : 'L'} ${(point.x * W).toFixed(2)} ${(point.y * H).toFixed(2)}`).join(' ')} Z`
    : ''
  const eraserSize = ink.eraserMode === 'small' ? 16 : ink.eraserMode === 'medium' ? 36 : ink.eraserMode === 'large' ? 64 : 24
  const toolRuler = ink.ruler

  return (
    <>
      <div className={`ink-paper ${ink.background}`} />
      <div
        ref={layerRef}
        className={`ink-layer${interactive ? ' interactive' : ''}${selecting ? ' selecting' : ''}${ink.hidden ? ' hidden' : ''}${active ? ' active' : ''}`}
        onPointerDown={startPointer}
        onPointerMove={movePointer}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onPointerLeave={() => setCursor(null)}
      >
        {ink.canvases.map((canvas) => (
          <div
            key={canvas.id}
            className="ink-canvas"
            style={{
              left: `${canvas.x * 100}%`,
              top: `${canvas.y * 100}%`,
              width: `${canvas.w * 100}%`,
              height: `${canvas.h * 100}%`,
            }}
          >
            <div
              className="ink-canvas-head"
              onPointerDown={(event) => startCanvasDrag(event, canvas, 'move')}
              onPointerMove={moveCanvas}
              onPointerUp={endCanvasDrag}
              onPointerCancel={endCanvasDrag}
            >
              <span>Drawing Canvas</span>
              <button
                type="button"
                className="ink-canvas-remove"
                title="Remove canvas"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => removeCanvas(canvas.id)}
              >
                ×
              </button>
            </div>
            <div
              className="ink-canvas-resize"
              title="Resize canvas"
              onPointerDown={(event) => startCanvasDrag(event, canvas, 'resize')}
              onPointerMove={moveCanvas}
              onPointerUp={endCanvasDrag}
              onPointerCancel={endCanvasDrag}
            />
          </div>
        ))}

        <svg
          className="ink-svg"
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="ink-galaxy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="45%" stopColor="#2563eb" />
              <stop offset="72%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <filter id="ink-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="1.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {showStrokes &&
            visibleStrokes.map((stroke) => {
              const path = outlinePath(stroke, pageW, pageH)
              const width = strokeWidthPx(stroke.size, stroke.kind) * (W / pageW)
              const point = stroke.points[0]
              const effects = stroke.kind === 'effects'
              const fill = effects ? 'url(#ink-galaxy)' : stroke.color
              const common = {
                fill,
                opacity: stroke.kind === 'highlighter' ? 0.36 : stroke.kind === 'pencil' ? 0.88 : 1,
                style: stroke.kind === 'highlighter' ? { mixBlendMode: 'multiply' as const } : undefined,
                filter: effects ? 'url(#ink-glow)' : undefined,
                'data-ink-stroke': stroke.id,
              }
              if (stroke.points.length === 1 && point) {
                return (
                  <circle
                    key={stroke.id}
                    cx={point.x * W}
                    cy={point.y * H}
                    r={Math.max(0.8, width / 2)}
                    {...common}
                    onPointerDown={(event) => onStrokePointerDown(stroke, event)}
                    className="ink-stroke"
                  />
                )
              }
              return (
                <path
                  key={stroke.id}
                  d={path}
                  {...common}
                  className="ink-stroke"
                  onPointerDown={(event) => onStrokePointerDown(stroke, event)}
                />
              )
            })}
          {lassoPath && <path d={lassoPath} className="ink-lasso" />}
          {showStrokes && selectionBounds && (
            <rect
              x={(selectionBounds.minX * W - 4).toFixed(2)}
              y={(selectionBounds.minY * H - 4).toFixed(2)}
              width={(selectionBounds.w * W + 8).toFixed(2)}
              height={(selectionBounds.h * H + 8).toFixed(2)}
              className="ink-selection-box"
            />
          )}
        </svg>

        {ink.ruler.visible && (
          <div
            className={`ink-ruler${active ? ' active' : ''}`}
            style={{
              left: `${toolRuler.x * 100}%`,
              top: `${toolRuler.y * 100}%`,
              transform: `translate(-50%, -50%) rotate(${toolRuler.angle}rad)`,
            }}
            onPointerDown={(event) => startRulerDrag(event, 'move')}
            onPointerMove={moveRuler}
            onPointerUp={endRulerDrag}
            onPointerCancel={endRulerDrag}
          >
            <span className="ink-ruler-line" />
            <div
              className="ink-ruler-rotate"
              title="Rotate ruler"
              onPointerDown={(event) => startRulerDrag(event, 'rotate')}
            >
              ↻
            </div>
          </div>
        )}

        {active && ink.selection.length > 0 && selectionBounds && (
          <div
            className="ink-selection-bar"
            style={{
              left: `${((selectionBounds.minX + selectionBounds.maxX) / 2) * 100}%`,
              top: `${selectionBounds.maxY * 100}%`,
            }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <span>{ink.selection.length} selected</span>
            <button type="button" onClick={deleteSelection} title="Delete selected ink">
              Delete
            </button>
            <button type="button" onClick={() => setSelection([])} title="Clear selection">
              ×
            </button>
          </div>
        )}

        {erasing && cursor && (
          <div
            className="ink-eraser-cursor"
            style={{ left: `${cursor.x * 100}%`, top: `${cursor.y * 100}%`, width: eraserSize, height: eraserSize }}
          />
        )}
      </div>
    </>
  )
}

