import { mergeAttributes, Node as TiptapNode } from '@tiptap/core'
import { ReactNodeViewRenderer, type Editor } from '@tiptap/react'
import EquationNodeView from '../components/EquationNodeView'

export type EquationDisplay = 'professional' | 'linear'
export type EquationJustification = 'left' | 'right' | 'center' | 'group'

export type EquationAttrs = {
  html: string
  latex: string
  display: EquationDisplay
  justification: EquationJustification
  inlineMode: boolean
  label: string | null
}

export type EquationTemplate = {
  id?: string
  label?: string
  html: string
  latex?: string
}

export type EquationInput = string | EquationTemplate

export type EquationViewHandle = {
  insertHTML: (html: string) => void
  insertText: (text: string) => void
  focus: () => void
  setAttrs: (patch: Partial<EquationAttrs>) => void
  getAttrs: () => EquationAttrs
  isAlive: () => boolean
  getPos: () => number | undefined
}

export type EquationOptions = {
  onActivate: (handle: EquationViewHandle | null) => void
  onDeactivate: (handle: EquationViewHandle) => void
  onSave: (equation: { label: string; html: string; latex: string }) => void
  toProfessional: (latex: string) => string
}

export type SavedEquation = {
  id: string
  label: string
  html: string
  latex: string
  createdAt: number
}

const SAVED_EQUATIONS_KEY = 'openoffice.savedEquations'

let activeEquation: EquationViewHandle | null = null

function notifyActive(active: boolean) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('equation-active', { detail: { active } }))
}

export function setActiveEquation(handle: EquationViewHandle | null) {
  if (handle && !handle.isAlive()) return
  activeEquation = handle
  notifyActive(Boolean(handle))
}

export function getActiveEquation() {
  return activeEquation
}

export function clearActiveEquation() {
  if (!activeEquation) return
  activeEquation = null
  notifyActive(false)
}

export function loadSavedEquations(): SavedEquation[] {
  try {
    const raw = localStorage.getItem(SAVED_EQUATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCustomEquation(equation: { label: string; html: string; latex: string }) {
  try {
    const saved = loadSavedEquations()
    const key = `${equation.label}|${equation.html}`
    const existing = saved.find((entry) => `${entry.label}|${entry.html}` === key)
    const record: SavedEquation = {
      id: existing?.id || (globalThis.crypto?.randomUUID?.() ?? `eq-${Date.now()}`),
      label: equation.label,
      html: equation.html,
      latex: equation.latex,
      createdAt: Date.now(),
    }
    const next = [record, ...saved.filter((entry) => entry.id !== record.id)].slice(0, 30)
    localStorage.setItem(SAVED_EQUATIONS_KEY, JSON.stringify(next))
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('equation-saved'))
    return record
  } catch {
    return null
  }
}

const GREEK: Record<string, string> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  varepsilon: 'ϵ',
  zeta: 'ζ',
  eta: 'η',
  theta: 'θ',
  vartheta: 'ϑ',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  mu: 'μ',
  nu: 'ν',
  xi: 'ξ',
  omicron: 'ο',
  pi: 'π',
  rho: 'ρ',
  sigma: 'σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  varphi: 'ϕ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω',
  Gamma: 'Γ',
  Delta: 'Δ',
  Theta: 'Θ',
  Lambda: 'Λ',
  Xi: 'Ξ',
  Pi: 'Π',
  Sigma: 'Σ',
  Phi: 'Φ',
  Psi: 'Ψ',
  Omega: 'Ω',
}

const LATEX_SYMBOLS: Record<string, string> = {
  cdot: '·',
  times: '×',
  div: '÷',
  pm: '±',
  mp: '∓',
  le: '≤',
  leq: '≤',
  ge: '≥',
  geq: '≥',
  ne: '≠',
  neq: '≠',
  approx: '≈',
  equiv: '≡',
  infty: '∞',
  partial: '∂',
  nabla: '∇',
  propto: '∝',
  to: '→',
  rightarrow: '→',
  leftarrow: '←',
  leftrightarrow: '↔',
  Rightarrow: '⇒',
  Leftarrow: '⇐',
  Leftrightarrow: '⇔',
  sum: '∑',
  prod: '∏',
  coprod: '∐',
  int: '∫',
  iint: '∬',
  iiint: '∭',
  oint: '∮',
  therefore: '∴',
  because: '∵',
  angle: '∠',
  perp: '⊥',
  parallel: '∥',
  cup: '∪',
  cap: '∩',
  subset: '⊂',
  supset: '⊃',
  in: '∈',
  notin: '∉',
  emptyset: '∅',
}

const LARGE_OPERATORS: Record<string, string> = {
  sum: '∑',
  prod: '∏',
  coprod: '∐',
  bigcup: '⋃',
  bigcap: '⋂',
  bigvee: '⋁',
  bigwedge: '⋀',
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const LARGE_OPERATOR_COMMANDS: Record<string, string> = {
  '∑': '\\sum',
  '∏': '\\prod',
  '∐': '\\coprod',
  '⋃': '\\bigcup',
  '⋂': '\\bigcap',
  '⋁': '\\bigvee',
}

const INTEGRAL_COMMANDS: Record<string, string> = {
  '∫': '\\int',
  '∬': '\\iint',
  '∭': '\\iiint',
  '∮': '\\oint',
}

export function linearizeEquationElement(root: HTMLElement): string {
  const read = (node: Node | null): string => {
    if (!node) return ''
    if (node.nodeType === 3) return node.textContent || ''
    if (!(node instanceof HTMLElement)) return ''
    if (node.classList.contains('eq-slot')) {
      let inner = ''
      node.childNodes.forEach((child) => {
        inner += read(child)
      })
      return inner || '□'
    }
    if (node.classList.contains('eq-frac')) {
      const num = node.querySelector('.eq-num')
      const den = node.querySelector('.eq-den')
      return `\\frac{${read(num)}}{${read(den)}}`
    }
    if (node.classList.contains('eq-sup') || node.classList.contains('eq-sub')) {
      let inner = ''
      node.childNodes.forEach((child) => {
        inner += read(child)
      })
      return `${node.classList.contains('eq-sup') ? '^' : '_'}{${inner}}`
    }
    if (node.classList.contains('eq-rad')) {
      const degree = node.querySelector('.eq-rad-deg')
      const body = node.querySelector('.eq-radicand')
      return `\\sqrt${degree ? `[${read(degree)}]` : ''}{${read(body)}}`
    }
    if (node.classList.contains('eq-lop')) {
      const symbol = node.querySelector('.eq-lop-sym')?.textContent || ''
      const sub = node.querySelector('.eq-lop-sub')
      const sup = node.querySelector('.eq-lop-sup')
      const command = LARGE_OPERATOR_COMMANDS[symbol] || symbol
      return `${command}${sub ? `_{${read(sub)}}` : ''}${sup ? `^{${read(sup)}}` : ''}`
    }
    if (node.classList.contains('eq-int')) {
      const symbol = node.querySelector('.eq-int-sym')?.textContent || '∫'
      const sub = node.querySelector('.eq-int-sub')
      const sup = node.querySelector('.eq-int-sup')
      const command = INTEGRAL_COMMANDS[symbol] || '\\int'
      return `${command}${sub ? `_{${read(sub)}}` : ''}${sup ? `^{${read(sup)}}` : ''}`
    }
    if (node.tagName === 'BR') return '\n'
    let output = ''
    node.childNodes.forEach((child) => {
      output += read(child)
    })
    return output
  }
  return read(root).replace(/\s+/g, ' ').trim()
}

export function linearizeEquationHtml(html: string): string {
  if (typeof document === 'undefined' || !html) return stripHtml(html)
  const holder = document.createElement('div')
  holder.innerHTML = html
  return linearizeEquationElement(holder) || stripHtml(html)
}

function wrapLatexChar(char: string) {
  if (/[A-Za-z]/.test(char)) return `<span class="eq-var">${escapeHtml(char)}</span>`
  return escapeHtml(char)
}

export function latexToHtml(source: string) {
  const src = source.replace(/\r/g, '')
  let i = 0

  const skipSpaces = () => {
    while (i < src.length && /\s/.test(src[i])) i += 1
  }

  const parseArg = (): string => {
    skipSpaces()
    if (src[i] === '{') {
      i += 1
      return parseGroup()
    }
    if (i >= src.length) return ''
    const char = src[i]
    if (char === '\\') return parseCommand()
    i += 1
    return wrapLatexChar(char)
  }

  const parseRawGroup = (): string => {
    let out = ''
    while (i < src.length && src[i] !== '}') {
      if (src[i] === '\\') {
        out += parseCommand()
      } else if (src[i] === '{') {
        i += 1
        out += parseGroup()
      } else if (src[i] === '^' || src[i] === '_') {
        const marker = src[i]
        i += 1
        const arg = parseArg()
        out += marker === '^' ? `<span class="eq-sup">${arg}</span>` : `<span class="eq-sub">${arg}</span>`
      } else {
        out += wrapLatexChar(src[i])
        i += 1
      }
    }
    return out
  }

  const parseGroup = (): string => {
    const out = parseRawGroup()
    if (src[i] === '}') i += 1
    return out
  }

  const parseLimits = () => {
    let sub = ''
    let sup = ''
    for (;;) {
      skipSpaces()
      if (src[i] === '_') {
        i += 1
        sub = parseArg()
      } else if (src[i] === '^') {
        i += 1
        sup = parseArg()
      } else {
        break
      }
    }
    return { sub, sup }
  }

  const parseCommand = (): string => {
    if (src[i] !== '\\') return ''
    i += 1
    let name = ''
    while (i < src.length && /[A-Za-z]/.test(src[i])) {
      name += src[i]
      i += 1
    }
    if (!name) {
      const char = src[i] ?? ''
      i += 1
      return escapeHtml(char)
    }
    if (name === 'frac' || name === 'dfrac' || name === 'tfrac') {
      const numerator = parseArg()
      const denominator = parseArg()
      const small = name === 'tfrac' ? ' eq-small' : ''
      return `<span class="eq-frac${small}"><span class="eq-num">${numerator}</span><span class="eq-den">${denominator}</span></span>`
    }
    if (name === 'sqrt') {
      let degree = ''
      skipSpaces()
      if (src[i] === '[') {
        i += 1
        while (i < src.length && src[i] !== ']') {
          degree += wrapLatexChar(src[i])
          i += 1
        }
        if (src[i] === ']') i += 1
      }
      const body = parseArg()
      return `<span class="eq-rad">${degree ? `<span class="eq-rad-deg">${degree}</span>` : ''}<span class="eq-rad-sym">√</span><span class="eq-radicand">${body}</span></span>`
    }
    if (LARGE_OPERATORS[name]) {
      const { sub, sup } = parseLimits()
      return `<span class="eq-lop">${sup ? `<span class="eq-lop-sup">${sup}</span>` : ''}<span class="eq-lop-sym">${LARGE_OPERATORS[name]}</span>${sub ? `<span class="eq-lop-sub">${sub}</span>` : ''}</span>`
    }
    if (name === 'int' || name === 'iint' || name === 'iiint' || name === 'oint') {
      const { sub, sup } = parseLimits()
      const symbol = LATEX_SYMBOLS[name]
      return `<span class="eq-int">${sup ? `<span class="eq-int-sup">${sup}</span>` : ''}<span class="eq-int-sym">${symbol}</span>${sub ? `<span class="eq-int-sub">${sub}</span>` : ''}</span>`
    }
    if (name === 'left' || name === 'right') {
      skipSpaces()
      const delimiter = src[i] ?? ''
      i += 1
      const map: Record<string, string> = {
        '(': '(',
        ')': ')',
        '[': '[',
        ']': ']',
        '\\{': '{',
        '\\}': '}',
        '|': '|',
        '.': '',
      }
      return escapeHtml(map[delimiter] ?? delimiter)
    }
    if (name === 'text' || name === 'mathrm' || name === 'operatorname') {
      return parseArg()
    }
    if (name === 'binom') {
      const top = parseArg()
      const bottom = parseArg()
      return `<span class="eq-bracket"><span class="eq-bracket-open">(</span><span class="eq-bracket-body"><span class="eq-frac eq-small"><span class="eq-num">${top}</span><span class="eq-den">${bottom}</span></span></span><span class="eq-bracket-close">)</span></span>`
    }
    if (GREEK[name]) return GREEK[name]
    if (LATEX_SYMBOLS[name]) return LATEX_SYMBOLS[name]
    return escapeHtml(name)
  }

  let output = ''
  while (i < src.length) {
    if (src[i] === '\\') {
      output += parseCommand()
    } else if (src[i] === '{') {
      i += 1
      output += parseGroup()
    } else if (src[i] === '^' || src[i] === '_') {
      const marker = src[i]
      i += 1
      const arg = parseArg()
      output += marker === '^' ? `<span class="eq-sup">${arg}</span>` : `<span class="eq-sub">${arg}</span>`
    } else {
      output += wrapLatexChar(src[i])
      i += 1
    }
  }
  return output
}

function normalizeEquation(input: EquationInput, label?: string): { html: string; latex: string; label: string | null } {
  if (typeof input === 'object' && input) {
    const html = input.html ?? ''
    return {
      html,
      latex: input.latex ?? linearizeEquationHtml(html),
      label: input.label ?? label ?? null,
    }
  }
  const text = String(input ?? '').trim()
  if (!text) {
    return {
      html: '',
      latex: '',
      label: label ?? null,
    }
  }
  if (text.startsWith('<')) {
    return { html: text, latex: linearizeEquationHtml(text), label: label ?? null }
  }
  if (/\\[A-Za-z]+/.test(text)) {
    return { html: latexToHtml(text), latex: text, label: label ?? null }
  }
  return {
    html: text
      .split('')
      .map((char) => (/[A-Za-z]/.test(char) ? `<span class="eq-var">${escapeHtml(char)}</span>` : escapeHtml(char)))
      .join(''),
    latex: text,
    label: label ?? null,
  }
}

function focusEquationAt(editor: Editor, position: number, attempts = 0) {
  if (typeof window === 'undefined') return
  window.requestAnimationFrame(() => {
    try {
      const dom = editor.view.nodeDOM(position) as HTMLElement | null
      const editable = '[contenteditable]:not([contenteditable="false"])'
      const target = dom?.matches(editable)
        ? dom
        : (dom?.querySelector(editable) as HTMLElement | null)
      if (!target) {
        if (attempts < 3) focusEquationAt(editor, position, attempts + 1)
        return
      }
      target.focus()
      const selection = window.getSelection()
      if (!selection?.anchorNode || !target.contains(selection.anchorNode)) {
        const range = document.createRange()
        const slot = target.querySelector<HTMLElement>('.eq-slot')
        if (slot) range.setStart(slot, 0)
        else range.selectNodeContents(target)
        range.collapse(true)
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    } catch {
      /* the view can be replaced during the same frame */
    }
  })
}

export function insertEquation(
  editor: Editor,
  input: EquationInput,
  label?: string,
  options: { inlineMode?: boolean; justification?: EquationJustification } = {},
) {
  const nodeType = editor.schema.nodes.equation
  if (!nodeType) return
  const normalized = normalizeEquation(input, label)
  const node = nodeType.create({
    html: normalized.html,
    latex: normalized.latex,
    display: 'professional',
    justification: options.justification ?? 'center',
    inlineMode: options.inlineMode ?? true,
    label: normalized.label,
  })
  const { from, to } = editor.state.selection
  editor.chain().focus().insertContentAt({ from, to }, node).run()
  const insertedAt = Math.max(0, editor.state.selection.from - node.nodeSize)
  focusEquationAt(editor, insertedAt)
}

export function insertEquationStructure(editor: Editor, template: EquationInput, label?: string) {
  const normalized = normalizeEquation(template, label)
  const active = activeEquation
  if (active?.isAlive()) {
    active.insertHTML(normalized.html)
    return
  }
  insertEquation(
    editor,
    { html: normalized.html, latex: normalized.latex, label: normalized.label ?? label },
    undefined,
    { inlineMode: false },
  )
}

export function insertEquationSymbol(editor: Editor, symbol: string) {
  const active = activeEquation
  if (active?.isAlive()) {
    active.insertText(symbol)
    return
  }
  insertEquation(editor, escapeHtml(symbol), 'Equation', { inlineMode: true })
}

export function updateActiveEquation(editor: Editor, patch: Partial<EquationAttrs>) {
  const active = activeEquation
  if (active?.isAlive()) {
    active.setAttrs(patch)
    return true
  }
  if (editor.isActive('equation')) {
    const current = editor.getAttributes('equation') as Partial<EquationAttrs>
    const next =
      patch.display === 'professional' && current.display === 'linear'
        ? { ...patch, html: latexToHtml(current.latex || '') }
        : patch
    editor.chain().focus().updateAttributes('equation', next).run()
    return true
  }
  return false
}

export function convertActiveEquation(editor: Editor, display: EquationDisplay) {
  return updateActiveEquation(editor, { display })
}

export function changeActiveEquationToInline(editor: Editor) {
  return updateActiveEquation(editor, { inlineMode: true })
}

export function justifyActiveEquation(editor: Editor, justification: EquationJustification) {
  return updateActiveEquation(editor, { justification })
}

export const Equation = TiptapNode.create<EquationOptions>({
  name: 'equation',
  inline: true,
  group: 'inline',
  atom: true,
  selectable: true,
  draggable: false,

  addOptions() {
    return {
      onActivate: (handle) => setActiveEquation(handle),
      onDeactivate: (handle) => {
        if (activeEquation === handle) setActiveEquation(null)
      },
      onSave: (equation) => {
        saveCustomEquation(equation)
      },
      toProfessional: (latex) => latexToHtml(latex),
    }
  },

  addAttributes() {
    return {
      html: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-html') || '',
        renderHTML: (attributes) => ({ 'data-html': attributes.html || '' }),
      },
      latex: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-latex') || '',
        renderHTML: (attributes) => ({ 'data-latex': attributes.latex || '' }),
      },
      display: {
        default: 'professional',
        parseHTML: (element) => (element.getAttribute('data-display') === 'linear' ? 'linear' : 'professional'),
        renderHTML: (attributes) => ({ 'data-display': attributes.display || 'professional' }),
      },
      justification: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-justification') || 'center',
        renderHTML: (attributes) => ({ 'data-justification': attributes.justification || 'center' }),
      },
      inlineMode: {
        default: true,
        parseHTML: (element) => element.getAttribute('data-inline-mode') !== 'false',
        renderHTML: (attributes) => ({ 'data-inline-mode': attributes.inlineMode ? 'true' : 'false' }),
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label') || null,
        renderHTML: (attributes) => (attributes.label ? { 'data-label': attributes.label } : {}),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-equation]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-equation': 'true',
        class: 'equation-node',
      }),
      node.attrs.latex || stripHtml(node.attrs.html || ''),
    ]
  },

  addNodeView() {
    return ReactNodeViewRenderer(EquationNodeView, {
      stopEvent: () => true,
    })
  },
})
