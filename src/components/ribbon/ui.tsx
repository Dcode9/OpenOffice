import React, { useEffect, useRef, useState } from 'react'

export function RibbonGroup({
  label,
  children,
  className,
  launcher,
}: {
  label: string
  children: React.ReactNode
  className?: string
  launcher?: { title: string; onClick: () => void }
}) {
  return (
    <div className={`ribbon-group${className ? ` ${className}` : ''}`}>
      <div className="ribbon-group-body">{children}</div>
      {launcher && (
        <button className="ribbon-launcher" title={launcher.title} type="button" onClick={launcher.onClick}>
          <span />
        </button>
      )}
      <div className="ribbon-group-label">{label}</div>
    </div>
  )
}

export function RibbonRow({ children }: { children: React.ReactNode }) {
  return <div className="ribbon-rows">{children}</div>
}

export function RibbonStack({ children }: { children: React.ReactNode }) {
  return <div className="ribbon-stack">{children}</div>
}

export function BigButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  title,
  caret,
  onCaret,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  caret?: boolean
  onCaret?: (e: React.MouseEvent) => void
}) {
  return (
    <button
      className={`rb-big${active ? ' active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      type="button"
    >
      <span className="rb-big-icon">{icon}</span>
      <span className="rb-big-label">{label}</span>
      {caret && (
        <span
          className="rb-caret"
          onClick={(e) => {
            e.stopPropagation()
            onCaret?.(e)
          }}
        />
      )}
    </button>
  )
}

export function SmallButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  title,
  wide,
  caret,
  onCaret,
}: {
  icon?: React.ReactNode
  label?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
  title?: string
  wide?: boolean
  caret?: boolean
  onCaret?: (e: React.MouseEvent) => void
}) {
  return (
    <button
      className={`rb-small${active ? ' active' : ''}${wide ? ' wide' : ''}`}
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      type="button"
    >
      {icon && <span className="rb-small-icon">{icon}</span>}
      {label && <span className="rb-small-label">{label}</span>}
      {caret && (
        <span
          className="rb-caret inline"
          onClick={(e) => {
            e.stopPropagation()
            onCaret?.(e)
          }}
        />
      )}
    </button>
  )
}

export function Popover({
  trigger,
  children,
  align = 'left',
  width,
  open,
  onOpenChange,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => React.ReactNode
  children: React.ReactNode | ((close: () => void) => React.ReactNode)
  align?: 'left' | 'right'
  width?: number
  open?: boolean
  onOpenChange?: (v: boolean) => void
}) {
  const [innerOpen, setInnerOpen] = useState(false)
  const isOpen = open ?? innerOpen
  const setOpen = (v: boolean) => {
    setInnerOpen(v)
    onOpenChange?.(v)
  }
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Element)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [isOpen])

  const close = () => setOpen(false)

  return (
    <div className="popover-wrap" ref={ref}>
      {trigger({ open: isOpen, toggle: () => setOpen(!isOpen) })}
      {isOpen && (
        <div className={`popover align-${align}`} style={width ? { width } : undefined}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      )}
    </div>
  )
}

export function MenuItem({
  icon,
  label,
  shortcut,
  onClick,
  active,
  disabled,
}: {
  icon?: React.ReactNode
  label: string
  shortcut?: string
  onClick?: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button className={`menu-item${active ? ' active' : ''}`} onClick={onClick} disabled={disabled} type="button">
      <span className="menu-item-icon">{icon}</span>
      <span className="menu-item-label">{label}</span>
      {shortcut && <span className="menu-item-shortcut">{shortcut}</span>}
    </button>
  )
}

export function MenuSep() {
  return <div className="menu-sep" />
}

export function MenuLabel({ children }: { children: React.ReactNode }) {
  return <div className="menu-label">{children}</div>
}
