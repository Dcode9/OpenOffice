import { useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Camera, Monitor } from 'lucide-react'
import { insertSvg } from '../../editor/insertActions'
import { MenuItem, MenuLabel, MenuSep, Popover } from '../ribbon/ui'
import { InsertModal, DialogButton, FieldRow } from './Modal'
import {
  AVAILABLE_WINDOWS,
  CHART_TYPES,
  DEFAULT_CHART_SERIES,
  SMART_ART_ITEMS,
  chartSvg,
  desktopSvg,
  modelSvg,
  smartArtSvg,
  windowThumbSvg,
  type ChartKind,
  type ChartSeries,
  type ModelKind,
  type SmartArtKind,
} from './graphics'
import '../../styles/insert-advanced.css'

const MODEL_ITEMS: { kind: ModelKind; name: string; note: string }[] = [
  { kind: 'cube', name: 'Isometric Cube', note: 'Basic solid' },
  { kind: 'sphere', name: 'Glossy Sphere', note: 'Smooth surface' },
  { kind: 'torus', name: 'Torus Ring', note: 'Rounded form' },
  { kind: 'pyramid', name: 'Pyramid', note: 'Four sides' },
]

export function ModelsMenu({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const insertModel = (kind: ModelKind, name: string) => {
    insertSvg(editor, modelSvg(kind, 440, 318), `3D Model: ${name}`)
    onInserted(`3D model inserted: ${name}`)
    onClose()
  }

  return (
    <div className="ins-models">
      <div className="menu">
        <MenuItem label="This Device…" onClick={() => fileRef.current?.click()} />
        <MenuItem label="Stock 3D Models…" onClick={() => insertModel('cube', 'Stock 3D Cube')} />
        <MenuSep />
        <MenuLabel>Stock 3D Models</MenuLabel>
      </div>
      <div className="ins-model-grid">
        {MODEL_ITEMS.map((item) => (
          <button key={item.kind} type="button" className="ins-model-card" onClick={() => insertModel(item.kind, item.name)}>
            <span className="ins-model-preview" dangerouslySetInnerHTML={{ __html: modelSvg(item.kind, 128, 92) }} />
            <span className="ins-model-name">{item.name}</span>
            <span className="ins-model-note">{item.note}</span>
          </button>
        ))}
      </div>
      <div className="ins-hint">3D models are inserted as placeholder objects that can be moved, copied, and resized.</div>
      <input
        ref={fileRef}
        type="file"
        accept=".glb,.gltf,.obj,.3mf"
        className="hidden-input"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            insertSvg(editor, modelSvg('cube', 440, 318), `3D Model: ${file.name}`)
            onInserted(`3D model inserted from ${file.name}`)
            onClose()
          }
          event.target.value = ''
        }}
      />
    </div>
  )
}

export function SmartArtDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [selected, setSelected] = useState<SmartArtKind>('organization')

  return (
    <InsertModal
      title="Choose a SmartArt Graphic"
      subtitle="Pick a layout, then edit the placeholder text in your document"
      width={720}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              const item = SMART_ART_ITEMS.find((entry) => entry.kind === selected) || SMART_ART_ITEMS[0]
              insertSvg(editor, smartArtSvg(selected, 640, 342), `SmartArt: ${item.name}`)
              onInserted(`SmartArt inserted: ${item.name}`)
              onClose()
            }}
          >
            OK
          </DialogButton>
        </>
      }
    >
      <div className="ins-smartart">
        <div className="ins-smartart-list">
          {SMART_ART_ITEMS.map((item) => (
            <button
              key={item.kind}
              type="button"
              className={`ins-smartart-item${selected === item.kind ? ' active' : ''}`}
              onClick={() => setSelected(item.kind)}
            >
              <span className="ins-smartart-thumb" dangerouslySetInnerHTML={{ __html: smartArtSvg(item.kind, 176, 94) }} />
              <span>
                <span className="ins-smartart-name">{item.name}</span>
                <span className="ins-smartart-desc">{item.description}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="ins-smartart-preview">
          <div className="ins-smartart-preview-head">Preview</div>
          <div dangerouslySetInnerHTML={{ __html: smartArtSvg(selected, 420, 224) }} />
          <p>The graphic is inserted as a SmartArt picture object with a simple organization or cycle layout.</p>
        </div>
      </div>
    </InsertModal>
  )
}

export function ChartDialog({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [kind, setKind] = useState<ChartKind>('column')
  const [title, setTitle] = useState('Sales by Quarter')
  const [series, setSeries] = useState<ChartSeries[]>(DEFAULT_CHART_SERIES)

  const updateSeries = (index: number, patch: Partial<ChartSeries>) => {
    setSeries((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)))
  }

  return (
    <InsertModal
      title="Insert Chart"
      subtitle="Choose a chart type and edit the sample data"
      width={780}
      onClose={onClose}
      footer={
        <>
          <DialogButton onClick={onClose}>Cancel</DialogButton>
          <DialogButton
            variant="primary"
            onClick={() => {
              insertSvg(editor, chartSvg(kind, title || 'Chart', series, 620, 352), `Chart: ${title || 'Chart'}`)
              onInserted(`Chart inserted: ${title || 'Chart'}`)
              onClose()
            }}
          >
            OK
          </DialogButton>
        </>
      }
    >
      <div className="ins-chart">
        <div className="ins-chart-types">
          {CHART_TYPES.map((item) => (
            <button
              key={item.kind}
              type="button"
              className={`ins-chart-type${kind === item.kind ? ' active' : ''}`}
              onClick={() => setKind(item.kind)}
            >
              <span className="ins-chart-type-art" dangerouslySetInnerHTML={{ __html: chartSvg(item.kind, 'Preview', series, 180, 118) }} />
              {item.name}
            </button>
          ))}
        </div>
        <div className="ins-chart-preview" dangerouslySetInnerHTML={{ __html: chartSvg(kind, title || 'Chart', series, 520, 296) }} />
      </div>
      <div className="ins-chart-data">
        <FieldRow label="Chart title">
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </FieldRow>
        <div className="ins-series-table">
          <div className="ins-series-head">
            <span>Category</span>
            <span>Value</span>
          </div>
          {series.map((item, index) => (
            <div className="ins-series-row" key={index}>
              <input value={item.label} onChange={(event) => updateSeries(index, { label: event.target.value })} />
              <input
                type="number"
                value={item.value}
                min={0}
                onChange={(event) => updateSeries(index, { value: Number(event.target.value) || 0 })}
              />
            </div>
          ))}
        </div>
      </div>
    </InsertModal>
  )
}

export function ScreenshotMenu({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [clipping, setClipping] = useState(false)

  const insertWindow = (title: string, accent: string) => {
    insertSvg(editor, windowThumbSvg(title, accent, 520, 321), `Screenshot: ${title}`)
    onInserted(`Screenshot inserted: ${title}`)
    onClose()
  }

  return (
    <div className="ins-screenshot">
      <MenuLabel>Available Windows</MenuLabel>
      <div className="ins-window-grid">
        {AVAILABLE_WINDOWS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="ins-window-card"
            onClick={() => insertWindow(item.title, item.accent)}
            title={`Insert ${item.title}`}
          >
            <span className="ins-window-thumb" dangerouslySetInnerHTML={{ __html: windowThumbSvg(item.title, item.accent, 260, 160) }} />
            <span className="ins-window-name">{item.title}</span>
          </button>
        ))}
      </div>
      <MenuSep />
      <div className="menu">
        <MenuItem label="Screen Clipping" onClick={() => setClipping(true)} />
      </div>
      {clipping && (
        <InsertModal
          title="Screen Clipping"
          subtitle="Preview of the area that will be captured"
          width={620}
          onClose={() => setClipping(false)}
          footer={
            <>
              <DialogButton onClick={() => setClipping(false)}>Cancel</DialogButton>
              <DialogButton
                variant="primary"
                onClick={() => {
                  insertSvg(editor, desktopSvg(760, 470), 'Screen clipping')
                  onInserted('Screen clipping inserted')
                  onClose()
                }}
              >
                Insert
              </DialogButton>
            </>
          }
        >
          <div className="ins-clip-preview" dangerouslySetInnerHTML={{ __html: desktopSvg(560, 346) }} />
          <div className="ins-clip-note">
            <Monitor size={14} /> A generated desktop preview is used to simulate screen clipping.
          </div>
        </InsertModal>
      )}
    </div>
  )
}

export function ScreenshotTrigger({ editor, onInserted }: { editor: Editor; onInserted: (message: string) => void }) {
  return (
    <Popover
      width={340}
      trigger={({ toggle }) => (
        <button className="rb-big" type="button" onClick={toggle} title="Screenshot">
          <span className="rb-big-icon"><Camera size={22} /></span>
          <span className="rb-big-label">Screenshot</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {(close) => <ScreenshotMenu editor={editor} onInserted={onInserted} onClose={close} />}
    </Popover>
  )
}
