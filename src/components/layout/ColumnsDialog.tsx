import { useMemo, useState } from 'react'
import type { PageSetup } from '../../context'
import { PAGE_SIZES } from '../../lib/constants'
import { getColumnGap, layoutSnapshot, type ColumnConfig, type ColumnPreset, type ColumnWidth } from './layoutStore'
import '../../styles/layout-advanced.css'

type Props = {
  page: PageSetup
  hasSelection: boolean
  onClose: () => void
  onApply: (config: ColumnConfig) => void
}

const PRESETS: { key: ColumnPreset; label: string }[] = [
  { key: 'one', label: 'One' },
  { key: 'two', label: 'Two' },
  { key: 'three', label: 'Three' },
  { key: 'left', label: 'Left' },
  { key: 'right', label: 'Right' },
]

function usableWidth(page: PageSetup) {
  const size = PAGE_SIZES[page.sizeKey] || PAGE_SIZES.letter
  const landscape = page.orientation === 'landscape'
  const width = (landscape ? size.h : size.w) - page.margins.left - page.margins.right
  return Math.max(1, width / 96)
}

function widthsFor(preset: ColumnPreset, count: number, usable: number): ColumnWidth[] {
  const gap = 0.5
  if (preset === 'left') {
    return [
      { width: Math.round(((usable - gap) * 0.33) * 100) / 100, spacing: gap },
      { width: Math.round(((usable - gap) * 0.67) * 100) / 100, spacing: gap },
    ]
  }
  if (preset === 'right') {
    return [
      { width: Math.round(((usable - gap) * 0.67) * 100) / 100, spacing: gap },
      { width: Math.round(((usable - gap) * 0.33) * 100) / 100, spacing: gap },
    ]
  }
  const safeCount = Math.max(1, count)
  const width = Math.round(((usable - gap * (safeCount - 1)) / safeCount) * 100) / 100
  return Array.from({ length: safeCount }, () => ({ width: Math.max(0.1, width), spacing: gap }))
}

function presetForCount(count: number): ColumnPreset {
  if (count === 1) return 'one'
  if (count === 2) return 'two'
  if (count === 3) return 'three'
  return 'custom'
}

export default function ColumnsDialog({ page, hasSelection, onClose, onApply }: Props) {
  const stored = layoutSnapshot().columns
  const usable = usableWidth(page)
  const initialCount = Math.max(1, stored.count || page.columns || 1)
  const [preset, setPreset] = useState<ColumnPreset>(stored.preset || presetForCount(initialCount))
  const [count, setCount] = useState(initialCount)
  const [equalWidth, setEqualWidth] = useState(stored.equalWidth)
  const [lineBetween, setLineBetween] = useState(stored.lineBetween)
  const [applyTo, setApplyTo] = useState(stored.applyTo)
  const initialWidths = stored.widths.length === initialCount ? stored.widths : widthsFor(presetForCount(initialCount), initialCount, usable)
  const [widths, setWidths] = useState<ColumnWidth[]>(initialWidths.map((item) => ({ ...item })))

  const choosePreset = (key: ColumnPreset) => {
    const nextCount = key === 'one' ? 1 : key === 'three' ? 3 : 2
    setPreset(key)
    setCount(nextCount)
    setWidths(widthsFor(key, nextCount, usable))
  }

  const changeCount = (value: number) => {
    const next = Math.max(1, Math.min(45, Math.floor(value) || 1))
    setCount(next)
    setPreset(presetForCount(next))
    setWidths((current) => {
      if (current.length === next) return current
      return widthsFor(presetForCount(next), next, usable)
    })
  }

  const updateWidth = (index: number, patch: Partial<ColumnWidth>) => {
    setWidths((current) =>
      current.map((item, itemIndex) => {
        if (equalWidth) return { ...item, ...(patch.width !== undefined ? { width: patch.width } : {}), ...(patch.spacing !== undefined ? { spacing: patch.spacing } : {}) }
        return itemIndex === index ? { ...item, ...patch } : item
      }),
    )
  }

  const gap = useMemo(() => getColumnGap(widths), [widths])
  const totalWidth = widths.reduce((sum, item) => sum + item.width, 0) + Math.max(0, widths.length - 1) * gap
  const ratio = totalWidth > 0 ? usable / totalWidth : 1

  const apply = () => {
    onApply({
      preset,
      count: Math.max(1, count),
      gapIn: gap,
      lineBetween,
      equalWidth,
      widths: widths.map((item) => ({ ...item })),
      applyTo,
    })
  }

  return (
    <div className="dialog-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="word-dialog columns-dialog" role="dialog" aria-modal="true" aria-label="Columns">
        <div className="dialog-title">Columns</div>
        <div className="dialog-body">
          <div className="columns-dialog-top">
            <div className="columns-dialog-main">
              <div className="dialog-subtitle">Presets</div>
              <div className="columns-preset-row">
                {PRESETS.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    className={`columns-preset${preset === item.key ? ' active' : ''}`}
                    onClick={() => choosePreset(item.key)}
                    title={item.label}
                  >
                    <span className="columns-preset-page">
                      {Array.from({ length: item.key === 'one' ? 1 : item.key === 'three' ? 3 : 2 }).map((_, index) => (
                        <span key={index} className={`columns-preset-col c${index}`} />
                      ))}
                    </span>
                    <span className="columns-preset-label">{item.label}</span>
                  </button>
                ))}
              </div>

              <div className="dialog-grid columns-grid">
                <label>Number of columns:</label>
                <input type="number" min={1} max={45} value={count} onChange={(event) => changeCount(Number(event.target.value))} />
                <label>Apply to:</label>
                <select value={applyTo} onChange={(event) => setApplyTo(event.target.value)}>
                  <option value="whole">Whole document</option>
                  <option value="forward">This point forward</option>
                  <option value="selected" disabled={!hasSelection}>Selected text</option>
                </select>
              </div>

              <div className="columns-table-wrap">
                <div className="columns-table-head">
                  <span />
                  <span>Width</span>
                  <span>Spacing</span>
                </div>
                {widths.map((item, index) => (
                  <div className="columns-table-row" key={index}>
                    <span className="columns-row-label">Column {index + 1}:</span>
                    <div className="columns-number">
                      <input
                        type="number"
                        min={0.1}
                        step={0.05}
                        value={item.width}
                        onChange={(event) => updateWidth(index, { width: Math.max(0.1, Number(event.target.value) || 0.1) })}
                      />
                      <span>"</span>
                    </div>
                    <div className="columns-number">
                      <input
                        type="number"
                        min={0.1}
                        step={0.05}
                        value={item.spacing}
                        onChange={(event) => updateWidth(index, { spacing: Math.max(0.1, Number(event.target.value) || 0.1) })}
                      />
                      <span>"</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="columns-checks">
                <label className="check-row">
                  <input type="checkbox" checked={equalWidth} onChange={(event) => setEqualWidth(event.target.checked)} />
                  Equal column width
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={lineBetween} onChange={(event) => setLineBetween(event.target.checked)} />
                  Line between
                </label>
              </div>
            </div>

            <div className="columns-preview-wrap">
              <div className="dialog-field-label">Preview</div>
              <div className="columns-preview-page">
                <div className="columns-preview-inner">
                  {widths.map((item, index) => (
                    <div
                      key={index}
                      className="columns-preview-col"
                      style={{
                        flex: `${item.width * ratio} 1 0`,
                        marginRight: index < widths.length - 1 ? `${Math.max(2, gap * 96 * ratio * 0.55)}px` : 0,
                        borderRight: lineBetween && index < widths.length - 1 ? '1px solid #8a8a8a' : 'none',
                      }}
                    >
                      <span /><span /><span className="short" /><span /><span className="short" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="lpp-caption">{count} column{count === 1 ? '' : 's'} · {gap.toFixed(2)}" spacing</div>
            </div>
          </div>
        </div>
        <div className="dialog-actions">
          <button className="dialog-btn primary" type="button" onClick={apply}>OK</button>
          <button className="dialog-btn" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}
