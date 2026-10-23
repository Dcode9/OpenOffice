import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import '../../styles/references-advanced.css'

const modalStack: symbol[] = []

export function RefModal({
  title,
  subtitle,
  width = 560,
  onClose,
  footer,
  children,
}: {
  title: string
  subtitle?: string
  width?: number
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  const idRef = useRef(Symbol('refs-modal'))

  useEffect(() => {
    const id = idRef.current
    modalStack.push(id)
    return () => {
      const index = modalStack.lastIndexOf(id)
      if (index >= 0) modalStack.splice(index, 1)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && modalStack[modalStack.length - 1] === idRef.current) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="refs-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="refs-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="refs-head">
          <div>
            <div className="refs-title">{title}</div>
            {subtitle && <div className="refs-subtitle">{subtitle}</div>}
          </div>
          <button className="refs-icon-btn" type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="refs-body">{children}</div>
        {footer && <div className="refs-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function RefButton({
  children,
  onClick,
  variant = 'secondary',
  disabled,
  small,
  title,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  small?: boolean
  title?: string
}) {
  return (
    <button
      className={`refs-btn${variant !== 'secondary' ? ` ${variant}` : ''}${small ? ' small' : ''}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </button>
  )
}

export function RefField({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`refs-field${wide ? ' wide-control' : ''}`}>
      <span>{label}</span>
      <span>{children}</span>
    </label>
  )
}

export function RefCheck({
  checked,
  onChange,
  children,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  children: ReactNode
}) {
  return (
    <label className="refs-check">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {children}
    </label>
  )
}

export function RefSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="refs-section">
      <div className="refs-section-title">{title}</div>
      {children}
    </div>
  )
}
