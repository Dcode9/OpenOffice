import { useState } from 'react'

export default function ZoomDialog({
  initialZoom,
  onApply,
  onClose,
  onFitWidth,
  onFitPage,
}: {
  initialZoom: number
  onApply: (zoom: number) => void
  onClose: () => void
  onFitWidth: () => void
  onFitPage: () => void
}) {
  const [selectedRadio, setSelectedRadio] = useState<'200' | '100' | '75' | 'width' | 'page' | 'percent'>(() => {
    const p = Math.round(initialZoom * 100)
    if (p === 200) return '200'
    if (p === 100) return '100'
    if (p === 75) return '75'
    return 'percent'
  })
  const [percent, setPercent] = useState<number>(Math.round(initialZoom * 100))

  const handleRadio = (val: '200' | '100' | '75' | 'width' | 'page' | 'percent') => {
    setSelectedRadio(val)
    if (val === '200') setPercent(200)
    else if (val === '100') setPercent(100)
    else if (val === '75') setPercent(75)
  }

  const handlePercentChange = (val: number) => {
    const clamped = Math.max(10, Math.min(500, val))
    setPercent(clamped)
    setSelectedRadio('percent')
  }

  const submit = () => {
    if (selectedRadio === 'width') {
      onFitWidth()
    } else if (selectedRadio === 'page') {
      onFitPage()
    } else {
      onApply(percent / 100)
    }
    onClose()
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="word-dialog ds-dialog" style={{ width: 440 }} role="dialog" aria-modal="true" aria-label="Zoom">
        <div className="dialog-title">Zoom</div>
        <div className="dialog-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <div>
              <div className="dialog-subtitle" style={{ fontWeight: 600, marginBottom: 8 }}>Zoom to</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label className="ds-check-row">
                  <input
                    type="radio"
                    name="zoom-radio"
                    checked={selectedRadio === '200'}
                    onChange={() => handleRadio('200')}
                  />
                  200%
                </label>
                <label className="ds-check-row">
                  <input
                    type="radio"
                    name="zoom-radio"
                    checked={selectedRadio === '100'}
                    onChange={() => handleRadio('100')}
                  />
                  100%
                </label>
                <label className="ds-check-row">
                  <input
                    type="radio"
                    name="zoom-radio"
                    checked={selectedRadio === '75'}
                    onChange={() => handleRadio('75')}
                  />
                  75%
                </label>
                <label className="ds-check-row">
                  <input
                    type="radio"
                    name="zoom-radio"
                    checked={selectedRadio === 'width'}
                    onChange={() => handleRadio('width')}
                  />
                  Page width
                </label>
                <label className="ds-check-row">
                  <input
                    type="radio"
                    name="zoom-radio"
                    checked={selectedRadio === 'page'}
                    onChange={() => handleRadio('page')}
                  />
                  Whole page
                </label>
              </div>

              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <label style={{ fontSize: 13, fontWeight: 500 }}>Percent:</label>
                <input
                  type="number"
                  min={10}
                  max={500}
                  value={percent}
                  onChange={(e) => handlePercentChange(Number(e.target.value))}
                  style={{ width: 68, padding: '3px 6px', fontSize: 13 }}
                />
                <span style={{ fontSize: 13 }}>%</span>
              </div>
            </div>

            <div>
              <div className="dialog-subtitle" style={{ fontWeight: 600, marginBottom: 8 }}>Preview</div>
              <div
                style={{
                  height: 160,
                  border: '1px solid var(--ribbon-border, #c8c6c4)',
                  borderRadius: 4,
                  background: 'var(--hover, #f8f8f8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  padding: 8,
                }}
              >
                <div
                  style={{
                    width: 70,
                    height: 90,
                    background: '#ffffff',
                    border: '1px solid #c8c6c4',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: 6,
                    gap: 3,
                    transform: `scale(${Math.max(0.5, Math.min(1.8, percent / 100))})`,
                    transition: 'transform 0.15s ease',
                  }}
                >
                  <div style={{ height: 4, width: '60%', background: '#2b579a', borderRadius: 1 }} />
                  <div style={{ height: 2, width: '100%', background: '#cccccc', borderRadius: 1 }} />
                  <div style={{ height: 2, width: '90%', background: '#cccccc', borderRadius: 1 }} />
                  <div style={{ height: 2, width: '75%', background: '#cccccc', borderRadius: 1 }} />
                  <div style={{ height: 2, width: '100%', background: '#cccccc', borderRadius: 1 }} />
                  <div style={{ height: 2, width: '85%', background: '#cccccc', borderRadius: 1 }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--ink-muted, #605e5c)' }}>
                {percent}%
              </div>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn primary" onClick={submit}>
            OK
          </button>
          <button type="button" className="dialog-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
