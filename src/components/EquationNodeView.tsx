import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react'
import {
  linearizeEquationElement,
  type EquationAttrs,
  type EquationJustification,
  type EquationOptions,
  type EquationViewHandle,
} from '../editor/equation'
import '../styles/equation.css'

function caretInside(element: HTMLElement, atStart = false) {
  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(atStart)
  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

function selectionInside(element: HTMLElement): Range | null {
  const selection = window.getSelection()
  if (!selection || !selection.rangeCount) return null
  const range = selection.getRangeAt(0)
  if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) return null
  return range
}

export default function EquationNodeView(props: NodeViewProps) {
  const { node, selected, editor, updateAttributes, extension, getPos } = props
  const rootRef = useRef<HTMLSpanElement>(null)
  const lastRangeRef = useRef<Range | null>(null)
  const lastHtmlRef = useRef('')
  const propsRef = useRef(props)
  const handleRef = useRef<EquationViewHandle | null>(null)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [justificationOpen, setJustificationOpen] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState('')

  propsRef.current = props

  const options = extension.options as Partial<EquationOptions>
  const display = (node.attrs.display as string) || 'professional'
  const inlineMode = node.attrs.inlineMode !== false
  const justification = (node.attrs.justification as EquationJustification) || 'center'
  const label = (node.attrs.label as string | null) || null
  const value =
    display === 'linear'
      ? ((node.attrs.latex as string) || '')
      : ((node.attrs.html as string) || '')

  const activate = () => {
    if (handleRef.current) options.onActivate?.(handleRef.current)
  }

  const rememberCaret = () => {
    const root = rootRef.current
    if (!root) return
    const range = selectionInside(root)
    if (range) lastRangeRef.current = range.cloneRange()
  }

  const commit = () => {
    const root = rootRef.current
    if (!root) return
    const currentDisplay = propsRef.current.node.attrs.display
    lastHtmlRef.current = root.innerHTML
    if (currentDisplay === 'linear') {
      propsRef.current.updateAttributes({ latex: root.textContent || '' })
    } else {
      propsRef.current.updateAttributes({
        html: root.innerHTML,
        latex: linearizeEquationElement(root),
      })
    }
  }

  const withProfessionalHTML = (values: Partial<EquationAttrs>): Partial<EquationAttrs> => {
    const current = propsRef.current.node.attrs
    if (values.display === 'professional' && current.display === 'linear') {
      return {
        ...values,
        html: options.toProfessional?.(String(current.latex || '')) || '',
      }
    }
    return values
  }

  const insertHTML = (html: string) => {
    const root = rootRef.current
    if (!root) return
    activate()
    root.focus()
    let range = selectionInside(root)
    if (!range && lastRangeRef.current && root.contains(lastRangeRef.current.startContainer)) {
      range = lastRangeRef.current
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    if (!range) {
      range = document.createRange()
      range.selectNodeContents(root)
      range.collapse(false)
    }
    range.deleteContents()
    const temporary = document.createElement('span')
    temporary.innerHTML = html
    const firstSlot = temporary.querySelector<HTMLElement>('.eq-slot')
    const fragment = document.createDocumentFragment()
    let lastNode: Node | null = null
    while (temporary.firstChild) lastNode = fragment.appendChild(temporary.firstChild)
    range.insertNode(fragment)
    if (firstSlot) {
      caretInside(firstSlot, true)
    } else if (lastNode) {
      const after = document.createRange()
      after.setStartAfter(lastNode)
      after.collapse(true)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(after)
    }
    const nextHtml = root.innerHTML
    lastHtmlRef.current = nextHtml
    propsRef.current.updateAttributes({
      display: 'professional',
      html: nextHtml,
      latex: linearizeEquationElement(root),
    })
  }

  const insertText = (text: string) => {
    const root = rootRef.current
    if (!root) return
    activate()
    root.focus()
    let range = selectionInside(root)
    if (!range && lastRangeRef.current && root.contains(lastRangeRef.current.startContainer)) {
      range = lastRangeRef.current
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
    if (!range) {
      range = document.createRange()
      range.selectNodeContents(root)
      range.collapse(false)
    }
    range.deleteContents()
    const textNode = document.createTextNode(text)
    range.insertNode(textNode)
    const after = document.createRange()
    after.setStartAfter(textNode)
    after.collapse(true)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(after)
    commit()
  }

  if (!handleRef.current) {
    handleRef.current = {
      insertHTML,
      insertText,
      focus: () => {
        const root = rootRef.current
        if (!root) return
        root.focus()
        caretInside(root, false)
        activate()
      },
      setAttrs: (patch) => propsRef.current.updateAttributes(withProfessionalHTML(patch)),
      getAttrs: () => propsRef.current.node.attrs as EquationAttrs,
      isAlive: () => Boolean(rootRef.current?.isConnected),
      getPos: () => {
        try {
          const position = propsRef.current.getPos()
          return typeof position === 'number' ? position : undefined
        } catch {
          return undefined
        }
      },
    }
  }

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (display === 'linear') {
      if (root.textContent !== value) root.textContent = value
      lastHtmlRef.current = root.innerHTML
      return
    }
    if (value === root.innerHTML || value === lastHtmlRef.current) return
    root.innerHTML = value || ''
    lastHtmlRef.current = value
  }, [value, display])

  useEffect(() => {
    return () => {
      const handle = handleRef.current
      if (handle) options.onDeactivate?.(handle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!menu) return
    const onDown = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (target?.closest('.equation-ctx') || target?.closest('.equation-save-backdrop')) return
      setMenu(null)
      setJustificationOpen(false)
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [menu])

  const patch = (values: Partial<EquationAttrs>) => {
    updateAttributes(withProfessionalHTML(values))
    setMenu(null)
    setJustificationOpen(false)
  }

  const chooseJustification = (value: EquationJustification) => {
    patch({ justification: value })
    const root = rootRef.current
    if (root) root.focus()
  }

  const openSave = () => {
    setSaveName(label || 'Custom Equation')
    setMenu(null)
    setJustificationOpen(false)
    setSaveOpen(true)
  }

  const confirmSave = () => {
    const name = saveName.trim() || 'Custom Equation'
    options.onSave?.({
      label: name,
      html: (node.attrs.html as string) || '',
      latex: (node.attrs.latex as string) || '',
    })
    setSaveOpen(false)
    updateAttributes({ label: name })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLSpanElement>) => {
    const root = rootRef.current
    if (!root) return
    if (event.key === 'Escape') {
      event.preventDefault()
      rememberCaret()
      const position = handleRef.current?.getPos()
      if (typeof position === 'number') {
        editor.chain().focus().setTextSelection(position + node.nodeSize).run()
      }
      setMenu(null)
      setJustificationOpen(false)
      options.onDeactivate?.(handleRef.current!)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      document.execCommand('insertLineBreak')
      commit()
      return
    }
    if (event.key === 'Tab') {
      const slots = Array.from(root.querySelectorAll<HTMLElement>('.eq-slot'))
      if (slots.length) {
        event.preventDefault()
        const selection = window.getSelection()
        let current: HTMLElement | null = null
        if (selection?.anchorNode) {
          const anchor =
            selection.anchorNode.nodeType === Node.TEXT_NODE
              ? selection.anchorNode.parentElement
              : (selection.anchorNode as HTMLElement)
          current = anchor?.closest<HTMLElement>('.eq-slot') || null
        }
        const index = current ? slots.indexOf(current) : -1
        const next = slots[(index + (event.shiftKey ? -1 : 1) + slots.length) % slots.length]
        caretInside(next, false)
        return
      }
    }
    if (event.key === 'Backspace' && root.textContent?.trim() === '' && !root.querySelector('.eq-slot')) {
      const position = handleRef.current?.getPos()
      if (typeof position === 'number') {
        event.preventDefault()
        editor.chain().focus().deleteRange({ from: position, to: position + node.nodeSize }).run()
      }
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLSpanElement>) => {
    event.preventDefault()
    const text = event.clipboardData.getData('text/plain')
    if (!text) return
    document.execCommand('insertText', false, text)
    commit()
  }

  const showSaveDialog =
    saveOpen &&
    createPortal(
      <div className="equation-save-backdrop" onMouseDown={() => setSaveOpen(false)}>
        <div className="equation-save-dialog" onMouseDown={(event) => event.stopPropagation()}>
          <div className="equation-save-title">Save as New Equation</div>
          <label className="equation-save-label" htmlFor={`eq-save-${node.attrs.label || 'new'}`}>
            Equation name
          </label>
          <input
            id={`eq-save-${node.attrs.label || 'new'}`}
            className="equation-save-input"
            value={saveName}
            autoFocus
            onChange={(event) => setSaveName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') confirmSave()
              if (event.key === 'Escape') setSaveOpen(false)
            }}
          />
          <div className="equation-save-actions">
            <button type="button" className="equation-dialog-btn" onClick={() => setSaveOpen(false)}>
              Cancel
            </button>
            <button type="button" className="equation-dialog-btn primary" onClick={confirmSave}>
              Save
            </button>
          </div>
        </div>
      </div>,
      document.body,
    )

  const contextMenu =
    menu &&
    createPortal(
      <div className="equation-ctx" style={{ left: menu.x, top: menu.y }} onMouseDown={(event) => event.stopPropagation()}>
        <button type="button" className="equation-ctx-item" onClick={openSave}>
          Save as New Equation…
        </button>
        <div className="equation-ctx-sep" />
        <button
          type="button"
          className={`equation-ctx-item${display === 'professional' ? ' active' : ''}`}
          onClick={() => patch({ display: 'professional' })}
        >
          Professional
        </button>
        <button
          type="button"
          className={`equation-ctx-item${display === 'linear' ? ' active' : ''}`}
          onClick={() => patch({ display: 'linear' })}
        >
          Linear
        </button>
        <button
          type="button"
          className="equation-ctx-item"
          disabled={inlineMode}
          onClick={() => patch({ inlineMode: true })}
        >
          Change to Inline
        </button>
        <div className="equation-ctx-sep" />
        <div
          className="equation-ctx-subwrap"
          onMouseEnter={() => setJustificationOpen(true)}
          onMouseLeave={() => setJustificationOpen(false)}
        >
          <button type="button" className="equation-ctx-item has-sub">
            Justification
            <span className="equation-ctx-arrow">▸</span>
          </button>
          {justificationOpen && (
            <div className="equation-ctx-sub">
              <button
                type="button"
                className={`equation-ctx-item${justification === 'left' ? ' active' : ''}`}
                onClick={() => chooseJustification('left')}
              >
                Left
              </button>
              <button
                type="button"
                className={`equation-ctx-item${justification === 'right' ? ' active' : ''}`}
                onClick={() => chooseJustification('right')}
              >
                Right
              </button>
              <button
                type="button"
                className={`equation-ctx-item${justification === 'center' ? ' active' : ''}`}
                onClick={() => chooseJustification('center')}
              >
                Centered
              </button>
              <button
                type="button"
                className={`equation-ctx-item${justification === 'group' ? ' active' : ''}`}
                onClick={() => chooseJustification('group')}
              >
                Centered as a Group
              </button>
            </div>
          )}
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      <NodeViewWrapper
        as="span"
        ref={rootRef}
        className={`equation-node${selected ? ' selected' : ''}`}
        data-equation="true"
        data-display={display}
        data-justification={justification}
        data-inline-mode={inlineMode ? 'true' : 'false'}
        data-label={label || undefined}
        role="math"
        aria-label={label || 'Equation'}
        contentEditable={editor.isEditable}
        suppressContentEditableWarning
        spellCheck={false}
        onFocus={activate}
        onBlur={rememberCaret}
        onMouseDown={activate}
        onKeyDown={handleKeyDown}
        onKeyUp={rememberCaret}
        onMouseUp={rememberCaret}
        onInput={() => {
          rememberCaret()
          commit()
        }}
        onPaste={handlePaste}
        onContextMenu={(event: ReactMouseEvent<HTMLSpanElement>) => {
          event.preventDefault()
          rememberCaret()
          activate()
          setMenu({ x: event.clientX, y: event.clientY })
          setJustificationOpen(false)
        }}
      />
      {contextMenu}
      {showSaveDialog}
    </>
  )
}
