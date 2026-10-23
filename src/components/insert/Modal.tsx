import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { X } from 'lucide-react'
import '../../styles/insert-advanced.css'

export function InsertModal({
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
    <div className="ins-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ins-modal" style={{ width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ins-modal-head">
          <div>
            <div className="ins-modal-title">{title}</div>
            {subtitle && <div className="ins-modal-subtitle">{subtitle}</div>}
          </div>
          <button className="ins-icon-btn" type="button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="ins-modal-body">{children}</div>
        {footer && <div className="ins-modal-foot">{footer}</div>}
      </div>
    </div>
  )
}

export function DialogButton({
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
    <button className={`ins-btn ins-btn-${variant}`} type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ins-field">
      <span className="ins-field-label">{label}</span>
      <span className="ins-field-control">{children}</span>
    </label>
  )
}

export function CategoryTabs({
  categories,
  active,
  onChange,
}: {
  categories: { id: string; name: string }[]
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="ins-categories">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`ins-category${active === category.id ? ' active' : ''}`}
          onClick={() => onChange(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}
