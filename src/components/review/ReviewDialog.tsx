import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import '../../styles/review-advanced.css'

export function ReviewDialog({
  title,
  subtitle,
  width = 520,
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
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="rv-modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="rv-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="rv-modal-head">
          <div>
            <div className="rv-modal-title">{title}</div>
            {subtitle && <div className="rv-modal-subtitle">{subtitle}</div>}
          </div>
          <button className="rv-icon-btn" type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="rv-modal-body">{children}</div>
        {footer && <div className="rv-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function ReviewButton({
  children,
  onClick,
  variant = 'secondary',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}) {
  return (
    <button className={`rv-btn rv-btn-${variant}`} type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function ReviewField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="rv-field">
      <span className="rv-field-label">{label}</span>
      <span className="rv-field-control">{children}</span>
    </label>
  )
}
