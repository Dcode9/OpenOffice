import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  AppWindow,
  BookOpen,
  Check,
  Columns3,
  Focus,
  Glasses,
  List,
  ListTree,
  Maximize2,
  Monitor,
  Moon,
  PanelLeft,
  Printer,
  Rows3,
  Split,
  Terminal,
  ZoomIn,
} from 'lucide-react'
import { useWord } from '../../context'
import { PAGE_SIZES } from '../../lib/constants'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import ZoomDialog from '../ZoomDialog'

function BigMenu({
  icon,
  label,
  width = 200,
  children,
}: {
  icon: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={label}>
          <span className="rb-big-icon">{icon}</span>
          <span className="rb-big-label">{label}</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {children}
    </Popover>
  )
}

function CheckRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button className={`rb-small wide view-check-row${active ? ' active' : ''}`} onClick={onClick} type="button" title={label}>
      <span className={`view-check${active ? ' on' : ''}`}>{active ? <Check size={11} /> : null}</span>
      <span className="rb-small-label">{label}</span>
    </button>
  )
}

export default function ViewTab() {
  const {
    zoom,
    setZoom,
    showRuler,
    setShowRuler,
    showNav,
    setShowNav,
    showGridlines,
    setShowGridlines,
    viewMode,
    setViewMode,
    page,
    toast,
  } = useWord()

  const [movement, setMovement] = useState<'vertical' | 'side'>('vertical')
  const [darkMode, setDarkMode] = useState(true)
  const [windows, setWindows] = useState(1)
  const [activeWindowIndex, setActiveWindowIndex] = useState(0)
  const [sideBySide, setSideBySide] = useState(false)
  const [sync, setSync] = useState(false)
  const [split, setSplit] = useState(false)
  const [showZoomDialog, setShowZoomDialog] = useState(false)
  const [macros] = useState<string[]>([])

  const pageSize = PAGE_SIZES[page.sizeKey] || PAGE_SIZES.letter
  const landscape = page.orientation === 'landscape'
  const pageW = landscape ? pageSize.h : pageSize.w
  const pageH = landscape ? pageSize.w : pageSize.h

  const fitPageWidth = () => {
    const canvas = document.querySelector('.canvas') as HTMLElement | null
    if (!canvas) return
    const avail = canvas.clientWidth - 80
    setZoom(Math.max(0.25, Math.min(3, avail / pageW)))
  }

  const fitOnePage = () => {
    const canvas = document.querySelector('.canvas') as HTMLElement | null
    if (!canvas) return
    const availW = canvas.clientWidth - 80
    const availH = canvas.clientHeight - 48
    setZoom(Math.max(0.25, Math.min(3, Math.min(availW / pageW, availH / pageH))))
  }

  return (
    <>
      <RibbonGroup label="Views">
        <BigButton
          icon={<BookOpen size={22} />}
          label="Read Mode"
          active={viewMode === 'read'}
          onClick={() => setViewMode(viewMode === 'read' ? 'print' : 'read')}
        />
        <BigButton
          icon={<Printer size={22} />}
          label="Print Layout"
          active={viewMode === 'print'}
          onClick={() => setViewMode('print')}
        />
        <BigButton
          icon={<Monitor size={22} />}
          label="Web Layout"
          active={viewMode === 'web'}
          onClick={() => setViewMode('web')}
        />
        <RibbonStack>
          <SmallButton
            icon={<ListTree size={15} />}
            label="Outline"
            wide
            onClick={() => {
              setShowNav(true)
              toast('Outline View: Headings outline opened in Navigation Pane')
            }}
          />
          <SmallButton
            icon={<List size={15} />}
            label="Draft"
            wide
            onClick={() => {
              setViewMode('print')
              toast('Draft view')
            }}
          />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Immersive">
        <BigButton icon={<Focus size={22} />} label="Focus" onClick={() => toast('Focus mode')} />
        <BigButton
          icon={<Glasses size={22} />}
          label="Immersive Reader"
          onClick={() => {
            setViewMode('read')
            toast('Immersive Reader')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Dark Mode">
        <BigButton
          icon={<Moon size={22} />}
          label="Switch Modes"
          active={darkMode}
          onClick={() => {
            setDarkMode(!darkMode)
            toast(darkMode ? 'Switched to Light Mode' : 'Switched to Dark Mode')
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Page Movement">
        <RibbonStack>
          <SmallButton
            icon={<Rows3 size={15} />}
            label="Vertical"
            wide
            active={movement === 'vertical'}
            onClick={() => {
              setMovement('vertical')
              toast('Vertical page movement')
            }}
          />
          <SmallButton
            icon={<Columns3 size={15} />}
            label="Side to Side"
            wide
            active={movement === 'side'}
            onClick={() => {
              setMovement('side')
              toast('Side to Side page movement')
            }}
          />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Show">
        <RibbonStack>
          <CheckRow label="Ruler" active={showRuler} onClick={() => setShowRuler(!showRuler)} />
          <CheckRow label="View Gridlines" active={showGridlines} onClick={() => setShowGridlines(!showGridlines)} />
          <CheckRow label="Navigation Pane" active={showNav} onClick={() => setShowNav(!showNav)} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Zoom" launcher={{ title: 'Zoom', onClick: () => setShowZoomDialog(true) }}>
        <BigMenu icon={<ZoomIn size={22} />} label="Zoom" width={170}>
          {(close) => (
            <div className="menu">
              {[200, 150, 100, 75, 50].map((p) => (
                <MenuItem
                  key={p}
                  label={`${p}%`}
                  active={Math.round(zoom * 100) === p}
                  onClick={() => {
                    setZoom(p / 100)
                    close()
                  }}
                />
              ))}
              <MenuSep />
              <MenuItem
                label="Zoom…"
                onClick={() => {
                  close()
                  setShowZoomDialog(true)
                }}
              />
            </div>
          )}
        </BigMenu>
        <RibbonStack>
          <SmallButton label="100%" wide onClick={() => setZoom(1)} />
          <SmallButton label="One Page" wide onClick={fitOnePage} />
          <SmallButton label="Multiple Pages" wide onClick={() => { setZoom(0.6); toast('Multiple Pages: 60%') }} />
          <SmallButton label="Page Width" wide onClick={fitPageWidth} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Window">
        <BigButton
          icon={<AppWindow size={22} />}
          label="New Window"
          onClick={() => {
            setWindows((w) => w + 1)
            window.open(window.location.href, '_blank')
            toast('New Window opened')
          }}
        />
        <BigButton icon={<Maximize2 size={22} />} label="Arrange All" onClick={() => toast('Windows arranged')} />
        <BigButton
          icon={<Split size={22} />}
          label="Split"
          active={split}
          onClick={() => {
            const next = !split
            setSplit(next)
            toast(next ? 'Split view enabled' : 'Split removed')
          }}
        />
        <RibbonStack>
          <SmallButton
            icon={<PanelLeft size={15} />}
            label="View Side by Side"
            wide
            disabled={windows < 2}
            active={sideBySide}
            onClick={() => {
              setSideBySide(!sideBySide)
              toast(sideBySide ? 'Side by side off' : 'View Side by Side')
            }}
          />
          <SmallButton
            icon={<Rows3 size={15} />}
            label="Synchronous Scrolling"
            wide
            disabled={!sideBySide}
            active={sync}
            onClick={() => {
              setSync(!sync)
              toast(sync ? 'Synchronous scrolling off' : 'Synchronous Scrolling')
            }}
          />
          <SmallButton
            icon={<Maximize2 size={15} />}
            label="Reset Window Position"
            wide
            disabled={!sideBySide}
            onClick={() => toast('Window position reset')}
          />
          <Popover
            width={220}
            trigger={({ toggle }) => (
              <SmallButton icon={<AppWindow size={15} />} label="Switch Windows" wide caret onClick={toggle} onCaret={toggle} />
            )}
          >
            {(close) => (
              <div className="menu">
                <MenuLabel>Switch Windows</MenuLabel>
                {Array.from({ length: windows }, (_, i) => (
                  <MenuItem
                    key={i}
                    label={`Document1 - Word${i ? ` : ${i + 1}` : ''}`}
                    active={i === activeWindowIndex}
                    onClick={() => {
                      setActiveWindowIndex(i)
                      toast(`Switched to Window ${i + 1}`)
                      close()
                    }}
                  />
                ))}
              </div>
            )}
          </Popover>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Macros">
        <BigMenu icon={<Terminal size={22} />} label="Macros" width={220}>
          {(close) => (
            <div className="menu">
              {macros.length === 0 ? (
                <MenuItem label="No macros available" disabled />
              ) : (
                macros.map((m) => <MenuItem key={m} label={m} onClick={close} />)
              )}
              <MenuSep />
              <MenuItem label="Macros…" onClick={() => { toast('Macros dialog'); close() }} />
            </div>
          )}
        </BigMenu>
      </RibbonGroup>

      {/* Zoom Dialog */}
      {showZoomDialog && (
        <ZoomDialog
          initialZoom={zoom}
          onApply={(level) => {
            setZoom(level)
            toast(`Zoom: ${Math.round(level * 100)}%`)
          }}
          onFitWidth={fitPageWidth}
          onFitPage={fitOnePage}
          onClose={() => setShowZoomDialog(false)}
        />
      )}
    </>
  )
}
