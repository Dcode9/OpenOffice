import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  insertEquation,
  insertEquationStructure,
  loadSavedEquations,
  type EquationTemplate,
} from '../editor/equation'
import '../styles/equation.css'

const slot = (placeholder = '□') => `<span class="eq-slot" data-ph="${placeholder}"></span>`
const variable = (value: string) => `<span class="eq-var">${value}</span>`
const sup = (value: string) => `<span class="eq-sup">${value}</span>`
const sub = (value: string) => `<span class="eq-sub">${value}</span>`
const frac = (numerator: string, denominator: string, extra = '') =>
  `<span class="eq-frac${extra}"><span class="eq-num">${numerator}</span><span class="eq-den">${denominator}</span></span>`
const bracket = (body: string, open = '(', close = ')') =>
  `<span class="eq-bracket"><span class="eq-bracket-open">${open}</span><span class="eq-bracket-body">${body}</span><span class="eq-bracket-close">${close}</span></span>`
const matrix = (rows: number, cols: number, open = '(', close = ')', fill?: string[]) => {
  const cells: string[] = []
  for (let index = 0; index < rows * cols; index += 1) {
    const content = fill?.[index]
    cells.push(
      content === undefined
        ? `<span class="eq-matrix-cell">${slot()}</span>`
        : `<span class="eq-matrix-cell">${content}</span>`,
    )
  }
  return `<span class="eq-matrix"><span class="eq-matrix-open">${open}</span><span class="eq-matrix-grid" style="--eq-cols:${cols}">${cells.join(
    '',
  )}</span><span class="eq-matrix-close">${close}</span></span>`
}

export const EQUATION_GALLERY: EquationTemplate[] = [
  {
    id: 'area-circle',
    label: 'Area of Circle',
    html: `${variable('A')} = ${variable('π')}${variable('r')}${sup('2')}`,
    latex: 'A = \\pi r^2',
  },
  {
    id: 'binomial',
    label: 'Binomial Theorem',
    html: `${bracket(`${variable('x')} + ${variable('a')}`)}${sup('n')} = <span class="eq-lop"><span class="eq-lop-sup">${variable(
      'n',
    )}</span><span class="eq-lop-sym">∑</span><span class="eq-lop-sub">${variable('k')}=0</span></span><span class="eq-bracket"><span class="eq-bracket-open">(</span><span class="eq-bracket-body">${frac(
      variable('n'),
      variable('k'),
      ' eq-small',
    )}</span><span class="eq-bracket-close">)</span></span>${variable('x')}${sup('k')}${variable('a')}${sup(
      `${variable('n')}−${variable('k')}`,
    )}`,
    latex: '(x+a)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^k a^{n-k}',
  },
  {
    id: 'expansion-sum',
    label: 'Expansion of a Sum',
    html: `${bracket(`${variable('a')} + ${variable('b')}`)}${sup('n')} = <span class="eq-lop"><span class="eq-lop-sup">${variable(
      'n',
    )}</span><span class="eq-lop-sym">∑</span><span class="eq-lop-sub">${variable('k')}=0</span></span><span class="eq-bracket"><span class="eq-bracket-open">(</span><span class="eq-bracket-body">${frac(
      variable('n'),
      variable('k'),
      ' eq-small',
    )}</span><span class="eq-bracket-close">)</span></span>${variable('a')}${sup(
      `${variable('n')}−${variable('k')}`,
    )}${variable('b')}${sup('k')}`,
    latex: '(a+b)^n = \\sum_{k=0}^{n} \\binom{n}{k} a^{n-k} b^k',
  },
  {
    id: 'fourier',
    label: 'Fourier Series',
    html: `${variable('f')}${bracket(variable('x'))} = ${frac(variable('a'), '2')} + <span class="eq-lop"><span class="eq-lop-sup">∞</span><span class="eq-lop-sym">∑</span><span class="eq-lop-sub">${variable(
      'n',
    )}=1</span></span>${bracket(
      `${variable('a')}${sub(variable('n'))} cos ${variable('n')}${variable('x')} + ${variable('b')}${sub(
        variable('n'),
      )} sin ${variable('n')}${variable('x')}`,
    )}`,
    latex: 'f(x) = \\frac{a_0}{2} + \\sum_{n=1}^{\\infty} (a_n \\cos nx + b_n \\sin nx)',
  },
  {
    id: 'pythagorean',
    label: 'Pythagorean Theorem',
    html: `${variable('a')}${sup('2')} + ${variable('b')}${sup('2')} = ${variable('c')}${sup('2')}`,
    latex: 'a^2 + b^2 = c^2',
  },
  {
    id: 'quadratic',
    label: 'Quadratic Formula',
    html: `${variable('x')} = ${frac(
      `−${variable('b')} ± <span class="eq-rad"><span class="eq-rad-sym">√</span><span class="eq-radicand">${variable(
        'b',
      )}${sup('2')} − 4${variable('a')}${variable('c')}</span></span>`,
      `2${variable('a')}`,
    )}`,
    latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
  },
  {
    id: 'taylor',
    label: 'Taylor Expansion',
    html: `${variable('f')}${bracket(variable('x'))} = <span class="eq-lop"><span class="eq-lop-sup">∞</span><span class="eq-lop-sym">∑</span><span class="eq-lop-sub">${variable(
      'n',
    )}=0</span></span>${frac(
      `${variable('f')}${sup(`(${variable('n')})`)}${bracket(variable('a'))}`,
      `${variable('n')}!`,
      ' eq-small',
    )}${bracket(`${variable('x')} − ${variable('a')}`)}${sup(variable('n'))}`,
    latex: 'f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n',
  },
  {
    id: 'trig-1',
    label: 'Trig Identities 1',
    html: `${variable('sin')}${sup('2')}${variable('θ')} + ${variable('cos')}${sup('2')}${variable(
      'θ',
    )} = 1`,
    latex: '\\sin^2\\theta + \\cos^2\\theta = 1',
  },
  {
    id: 'trig-2',
    label: 'Trig Identities 2',
    html: `1 + ${variable('tan')}${sup('2')}${variable('θ')} = ${variable('sec')}${sup('2')}${variable(
      'θ',
    )}`,
    latex: '1 + \\tan^2\\theta = \\sec^2\\theta',
  },
]

export type SymbolCategory = {
  id: string
  label: string
  symbols: string[]
}

export const SYMBOL_CATEGORIES: SymbolCategory[] = [
  {
    id: 'basic',
    label: 'Basic Math',
    symbols: ['±', '∞', '=', '≠', '~', '×', '÷', '!', '∝', '<', '>', '≪', '≫', '≤', '≥', '+', '∓', '≈', '≡', '∨', '∧', '∴', '∵', '∅', '°', '%'],
  },
  {
    id: 'greek',
    label: 'Greek Letters',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ'],
  },
  {
    id: 'letter-like',
    label: 'Letter-Like Symbols',
    symbols: ['ℂ', 'ℊ', 'ℋ', 'ℐ', 'ℒ', 'ℓ', 'ℳ', 'ℛ', 'ℯ', 'ℱ', 'ℬ', 'ℰ', 'ℌ', 'ℑ', 'ℜ', 'ℨ', 'ℵ', 'ℶ', 'ℷ', 'ℸ', '℘', '℮', '℁', '℅', '№', '™'],
  },
  {
    id: 'operators',
    label: 'Operators',
    symbols: ['∑', '∏', '∐', '∫', '∬', '∭', '∮', '∯', '∰', '∂', '∇', '√', '∛', '∜', '⋂', '⋃', '⋁', '⋀', '⊕', '⊗', '⊙', '⊥', '∥', '∠', '∡', '∢'],
  },
  {
    id: 'arrows',
    label: 'Arrows',
    symbols: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '↦', '⟶', '⟵', '⟷', '↗', '↘', '↙', '↖', '⇗', '⇘', '⇙', '⇖', '↪', '↩'],
  },
  {
    id: 'negated',
    label: 'Negated Relations',
    symbols: ['≠', '≮', '≯', '≰', '≱', '≲', '≳', '≴', '≵', '≶', '≷', '≸', '≹', '⪇', '⪈', '⊀', '⊁', '⊄', '⊅', '⊈', '⊉', '⊊', '⊋', '∉', '∌', '≢'],
  },
  {
    id: 'scripts',
    label: 'Scripts',
    symbols: ['ℰ', 'ℱ', '𝒢', 'ℋ', 'ℐ', '𝒥', '𝒦', 'ℒ', 'ℳ', '𝒩', '𝒪', '𝒫', '𝒬', 'ℛ', '𝒮', '𝒯', '𝒰', '𝒱', '𝒲', '𝒳', '𝒴', '𝒵', 'ℬ', 'ℭ', 'ℌ', 'ℑ'],
  },
  {
    id: 'geometry',
    label: 'Geometry',
    symbols: ['∠', '∡', '∢', '⊥', '∥', '∦', '⊙', '△', '□', '▱', '⌐', '⌒', '≅', '≈', '∽', '∟', '⊿', '◯', '◻', '◼', '⬠', '⬡', '⏥', '⌓', '⌔', '◠'],
  },
]

type StructureItem = EquationTemplate
type StructureSection = { label?: string; items: StructureItem[] }

export type StructureGroupDef = {
  id: string
  label: string
  icon: string
  width?: number
  defaultTemplate: StructureItem
  sections: StructureSection[]
}

const scriptTemplate = (kind: 'sup' | 'sub' | 'prescript') => {
  if (kind === 'sup') {
    return `<span class="eq-script"><span class="eq-base eq-slot" data-ph="□"></span><span class="eq-sup eq-slot" data-ph="□"></span></span>`
  }
  if (kind === 'sub') {
    return `<span class="eq-script"><span class="eq-base eq-slot" data-ph="□"></span><span class="eq-sub eq-slot" data-ph="□"></span></span>`
  }
  return `<span class="eq-prescript"><span class="eq-sub eq-slot" data-ph="□"></span><span class="eq-sup eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="□"></span>`
}

const integralTemplate = (symbol: string, definite: boolean, contour = false) => {
  if (!definite) {
    return `<span class="eq-int"><span class="eq-int-sym">${symbol}</span><span class="eq-int-body eq-slot" data-ph="□"></span></span>`
  }
  return `<span class="eq-int"><span class="eq-int-sup eq-slot" data-ph="□"></span><span class="eq-int-sym">${symbol}</span><span class="eq-int-sub eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="${contour ? '□' : 'd'}${contour ? '' : '□'}"></span>`
}

export const STRUCTURE_GROUPS: StructureGroupDef[] = [
  {
    id: 'fraction',
    label: 'Fraction',
    icon: '<span class="eq-icon-frac"><span>a</span><span>b</span></span>',
    width: 330,
    defaultTemplate: { label: 'Stacked Fraction', html: frac(slot(), slot()) },
    sections: [
      {
        label: 'Fractions',
        items: [
          { label: 'Stacked', html: frac(slot(), slot()) },
          { label: 'Skewed', html: frac(slot(), slot(), ' eq-skew') },
          { label: 'Linear', html: `<span class="eq-frac-linear">${slot()}/${slot()}</span>` },
          { label: 'Small Fraction', html: frac(slot(), slot(), ' eq-small') },
        ],
      },
      {
        label: 'Common Fractions',
        items: [
          { label: 'dy/dx', html: frac(`${variable('d')}${variable('y')}`, `${variable('d')}${variable('x')}`) },
          {
            label: 'Δy/Δx',
            html: frac(`${variable('Δ')}${variable('y')}`, `${variable('Δ')}${variable('x')}`),
          },
          { label: 'π/2', html: frac('π', '2') },
        ],
      },
    ],
  },
  {
    id: 'script',
    label: 'Script',
    icon: '<span class="eq-icon-script">e<sup>x</sup></span>',
    width: 310,
    defaultTemplate: { label: 'Superscript', html: scriptTemplate('sup') },
    sections: [
      {
        label: 'Scripts',
        items: [
          { label: 'Superscript', html: scriptTemplate('sup') },
          { label: 'Subscript', html: scriptTemplate('sub') },
          { label: 'Left Sub/Superscript', html: scriptTemplate('prescript') },
        ],
      },
    ],
  },
  {
    id: 'radical',
    label: 'Radical',
    icon: '<span class="eq-icon-radical">√x</span>',
    width: 330,
    defaultTemplate: {
      label: 'Square Root',
      html: `<span class="eq-rad"><span class="eq-rad-sym">√</span><span class="eq-radicand eq-slot" data-ph="□"></span></span>`,
    },
    sections: [
      {
        label: 'Radicals',
        items: [
          {
            label: 'Square Root',
            html: `<span class="eq-rad"><span class="eq-rad-sym">√</span><span class="eq-radicand eq-slot" data-ph="□"></span></span>`,
          },
          {
            label: 'Radical with Degree',
            html: `<span class="eq-rad"><span class="eq-rad-deg eq-slot" data-ph="n"></span><span class="eq-rad-sym">√</span><span class="eq-radicand eq-slot" data-ph="□"></span></span>`,
          },
          {
            label: 'Square Root with Degree',
            html: `<span class="eq-rad"><span class="eq-rad-deg eq-slot" data-ph="3"></span><span class="eq-rad-sym">√</span><span class="eq-radicand eq-slot" data-ph="□"></span></span>`,
          },
        ],
      },
      {
        label: 'Common Radicals',
        items: [
          {
            label: '√2',
            html: `<span class="eq-rad"><span class="eq-rad-sym">√</span><span class="eq-radicand">2</span></span>`,
          },
          {
            label: '√x',
            html: `<span class="eq-rad"><span class="eq-rad-sym">√</span><span class="eq-radicand">${variable('x')}</span></span>`,
          },
          {
            label: 'nth root of x',
            html: `<span class="eq-rad"><span class="eq-rad-deg">${variable('n')}</span><span class="eq-rad-sym">√</span><span class="eq-radicand">${variable('x')}</span></span>`,
          },
        ],
      },
    ],
  },
  {
    id: 'integral',
    label: 'Integral',
    icon: '<span class="eq-icon-integral">∫</span>',
    width: 340,
    defaultTemplate: { label: 'Simple Integral', html: integralTemplate('∫', false) },
    sections: [
      {
        label: 'Integrals',
        items: [
          { label: 'Simple', html: integralTemplate('∫', false) },
          { label: 'Definite', html: integralTemplate('∫', true) },
          { label: 'Double', html: integralTemplate('∬', true) },
          { label: 'Triple', html: integralTemplate('∭', true) },
        ],
      },
      {
        label: 'Contour Integrals',
        items: [
          { label: 'Contour', html: integralTemplate('∮', true, true) },
          { label: 'Contour with Limits', html: integralTemplate('∮', true, true) },
        ],
      },
      {
        label: 'Differentials',
        items: [
          { label: 'dx', html: `${variable('d')}${variable('x')}` },
          { label: 'dy', html: `${variable('d')}${variable('y')}` },
          { label: 'Δx', html: `${variable('Δ')}${variable('x')}` },
        ],
      },
    ],
  },
  {
    id: 'large-operator',
    label: 'Large Operator',
    icon: '<span class="eq-icon-largeop">∑</span>',
    width: 330,
    defaultTemplate: {
      label: 'Summation',
      html: `<span class="eq-lop"><span class="eq-lop-sup eq-slot" data-ph="□"></span><span class="eq-lop-sym">∑</span><span class="eq-lop-sub eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="□"></span>`,
    },
    sections: [
      {
        label: 'Large Operators',
        items: [
          {
            label: 'Summation',
            html: `<span class="eq-lop"><span class="eq-lop-sup eq-slot" data-ph="□"></span><span class="eq-lop-sym">∑</span><span class="eq-lop-sub eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="□"></span>`,
          },
          {
            label: 'Product',
            html: `<span class="eq-lop"><span class="eq-lop-sup eq-slot" data-ph="□"></span><span class="eq-lop-sym">∏</span><span class="eq-lop-sub eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="□"></span>`,
          },
          {
            label: 'Union',
            html: `<span class="eq-lop"><span class="eq-lop-sup eq-slot" data-ph="□"></span><span class="eq-lop-sym">⋃</span><span class="eq-lop-sub eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="□"></span>`,
          },
          {
            label: 'Intersection',
            html: `<span class="eq-lop"><span class="eq-lop-sup eq-slot" data-ph="□"></span><span class="eq-lop-sym">⋂</span><span class="eq-lop-sub eq-slot" data-ph="□"></span></span><span class="eq-slot" data-ph="□"></span>`,
          },
        ],
      },
    ],
  },
  {
    id: 'bracket',
    label: 'Bracket',
    icon: '<span class="eq-icon-bracket">{ }</span>',
    width: 340,
    defaultTemplate: { label: 'Parentheses', html: bracket(slot()) },
    sections: [
      {
        label: 'Brackets',
        items: [
          { label: 'Parentheses', html: bracket(slot()) },
          { label: 'Brackets', html: bracket(slot(), '[', ']') },
          { label: 'Braces', html: bracket(slot(), '{', '}') },
          { label: 'Angle Brackets', html: bracket(slot(), '⟨', '⟩') },
        ],
      },
      {
        label: 'Cases',
        items: [
          {
            label: 'Cases',
            html: `<span class="eq-cases"><span class="eq-cases-brace">{</span><span class="eq-cases-rows"><span class="eq-case-row"><span class="eq-slot" data-ph="□"></span><span class="eq-slot" data-ph="if □"></span></span><span class="eq-case-row"><span class="eq-slot" data-ph="□"></span><span class="eq-slot" data-ph="if □"></span></span></span></span>`,
          },
          {
            label: 'Bracket with Separator',
            html: `<span class="eq-bracket"><span class="eq-bracket-open">(</span><span class="eq-bracket-body eq-slot" data-ph="□ | □"></span><span class="eq-bracket-close">)</span></span>`,
          },
        ],
      },
      {
        label: 'Single Brackets',
        items: [
          { label: 'Left Parenthesis', html: '(' },
          { label: 'Right Parenthesis', html: ')' },
          { label: 'Left Bracket', html: '[' },
          { label: 'Right Bracket', html: ']' },
        ],
      },
    ],
  },
  {
    id: 'function',
    label: 'Function',
    icon: '<span class="eq-icon-function">sin</span>',
    width: 330,
    defaultTemplate: { label: 'Sine', html: `<span class="eq-func"><span class="eq-func-name">sin</span>${slot()}</span>` },
    sections: [
      {
        label: 'Functions',
        items: [
          { label: 'Sine', html: `<span class="eq-func"><span class="eq-func-name">sin</span>${slot()}</span>` },
          { label: 'Cosine', html: `<span class="eq-func"><span class="eq-func-name">cos</span>${slot()}</span>` },
          { label: 'Tangent', html: `<span class="eq-func"><span class="eq-func-name">tan</span>${slot()}</span>` },
          { label: 'Secant', html: `<span class="eq-func"><span class="eq-func-name">sec</span>${slot()}</span>` },
          { label: 'Cosecant', html: `<span class="eq-func"><span class="eq-func-name">csc</span>${slot()}</span>` },
          { label: 'Cotangent', html: `<span class="eq-func"><span class="eq-func-name">cot</span>${slot()}</span>` },
        ],
      },
      {
        label: 'Inverse Functions',
        items: [
          {
            label: 'Inverse Sine',
            html: `<span class="eq-func"><span class="eq-func-name">sin${sup('−1')}</span>${slot()}</span>`,
          },
          {
            label: 'Inverse Cosine',
            html: `<span class="eq-func"><span class="eq-func-name">cos${sup('−1')}</span>${slot()}</span>`,
          },
          {
            label: 'Inverse Tangent',
            html: `<span class="eq-func"><span class="eq-func-name">tan${sup('−1')}</span>${slot()}</span>`,
          },
        ],
      },
      {
        label: 'Hyperbolic Functions',
        items: [
          { label: 'Hyperbolic Sine', html: `<span class="eq-func"><span class="eq-func-name">sinh</span>${slot()}</span>` },
          { label: 'Hyperbolic Cosine', html: `<span class="eq-func"><span class="eq-func-name">cosh</span>${slot()}</span>` },
          { label: 'Hyperbolic Tangent', html: `<span class="eq-func"><span class="eq-func-name">tanh</span>${slot()}</span>` },
        ],
      },
    ],
  },
  {
    id: 'accent',
    label: 'Accent',
    icon: '<span class="eq-icon-accent">â</span>',
    width: 330,
    defaultTemplate: {
      label: 'Hat',
      html: `<span class="eq-accent" data-accent="hat"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>`,
    },
    sections: [
      {
        label: 'Accents',
        items: [
          { label: 'Hat', html: `<span class="eq-accent" data-accent="hat"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Check', html: `<span class="eq-accent" data-accent="check"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Tilde', html: `<span class="eq-accent" data-accent="tilde"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Acute', html: `<span class="eq-accent" data-accent="acute"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Grave', html: `<span class="eq-accent" data-accent="grave"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Dot', html: `<span class="eq-accent" data-accent="dot"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Prime', html: `<span class="eq-accent" data-accent="prime"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
          { label: 'Bar', html: `<span class="eq-accent" data-accent="bar"><span class="eq-accent-base eq-slot" data-ph="□"></span></span>` },
        ],
      },
    ],
  },
  {
    id: 'limit',
    label: 'Limit and Log',
    icon: '<span class="eq-icon-limit">lim</span>',
    width: 300,
    defaultTemplate: {
      label: 'Limit',
      html: `<span class="eq-lim"><span class="eq-lim-name">lim</span><span class="eq-lim-sub eq-slot" data-ph="x→0"></span></span><span class="eq-slot" data-ph="□"></span>`,
    },
    sections: [
      {
        label: 'Limits',
        items: [
          {
            label: 'Limit',
            html: `<span class="eq-lim"><span class="eq-lim-name">lim</span><span class="eq-lim-sub eq-slot" data-ph="x→0"></span></span><span class="eq-slot" data-ph="□"></span>`,
          },
          {
            label: 'Limit at Infinity',
            html: `<span class="eq-lim"><span class="eq-lim-name">lim</span><span class="eq-lim-sub">${variable('x')}→∞</span></span><span class="eq-slot" data-ph="□"></span>`,
          },
        ],
      },
      {
        label: 'Logarithms',
        items: [
          { label: 'Log', html: `<span class="eq-func"><span class="eq-func-name">log</span>${slot()}</span>` },
          { label: 'Natural Log', html: `<span class="eq-func"><span class="eq-func-name">ln</span>${slot()}</span>` },
          { label: 'Maximum', html: `<span class="eq-func"><span class="eq-func-name">max</span>${slot()}</span>` },
          { label: 'Minimum', html: `<span class="eq-func"><span class="eq-func-name">min</span>${slot()}</span>` },
        ],
      },
    ],
  },
  {
    id: 'operator',
    label: 'Operator',
    icon: '<span class="eq-icon-operator">±</span>',
    width: 330,
    defaultTemplate: { label: 'Less Than or Equal', html: `${slot()} ≤ ${slot()}` },
    sections: [
      {
        label: 'Basic Operators',
        items: [
          { label: 'Less Than or Equal', html: `${slot()} ≤ ${slot()}` },
          { label: 'Greater Than or Equal', html: `${slot()} ≥ ${slot()}` },
          { label: 'Not Equal', html: `${slot()} ≠ ${slot()}` },
          { label: 'Approximately', html: `${slot()} ≈ ${slot()}` },
          { label: 'Plus or Minus', html: `${slot()} ± ${slot()}` },
          { label: 'Multiply', html: `${slot()} × ${slot()}` },
          { label: 'Divide', html: `${slot()} ÷ ${slot()}` },
          { label: 'Proportional To', html: `${slot()} ∝ ${slot()}` },
        ],
      },
      {
        label: 'Operator Structures',
        items: [
          { label: 'Definition', html: `${slot()} ≜ ${slot()}` },
          { label: 'Congruence', html: `${slot()} ≡ ${slot()}` },
          { label: 'Element Of', html: `${slot()} ∈ ${slot()}` },
          { label: 'Not Element Of', html: `${slot()} ∉ ${slot()}` },
        ],
      },
      {
        label: 'Common Operator Structures',
        items: [
          { label: 'Composition', html: `${slot()} ∘ ${slot()}` },
          { label: 'Direct Sum', html: `${slot()} ⊕ ${slot()}` },
        ],
      },
    ],
  },
  {
    id: 'matrix',
    label: 'Matrix',
    icon: '<span class="eq-icon-matrix">[ ]</span>',
    width: 340,
    defaultTemplate: { label: '2×2 Matrix', html: matrix(2, 2) },
    sections: [
      {
        label: 'Empty Matrices',
        items: [
          { label: '1×2 Matrix', html: matrix(1, 2) },
          { label: '2×1 Matrix', html: matrix(2, 1) },
          { label: '2×2 Matrix', html: matrix(2, 2) },
          { label: '2×3 Matrix', html: matrix(2, 3) },
          { label: '3×2 Matrix', html: matrix(3, 2) },
          { label: '3×3 Matrix', html: matrix(3, 3) },
        ],
      },
      {
        label: 'Identity Matrices',
        items: [
          { label: 'Identity 2×2', html: matrix(2, 2, '(', ')', ['1', '0', '0', '1']) },
          { label: 'Identity 3×3', html: matrix(3, 3, '(', ')', ['1', '0', '0', '0', '1', '0', '0', '0', '1']) },
        ],
      },
      {
        label: 'Bracketed and Sparse Matrices',
        items: [
          { label: 'Bracketed 2×2', html: matrix(2, 2, '[', ']') },
          { label: 'Bracketed 3×3', html: matrix(3, 3, '[', ']') },
          {
            label: 'Sparse 2×2',
            html: matrix(2, 2, '(', ')', [slot(), '0', '0', slot()]),
          },
        ],
      },
    ],
  },
]

export function EquationPreview({ html, className = '' }: { html: string; className?: string }) {
  return <span className={`equation-render ${className}`.trim()} dangerouslySetInnerHTML={{ __html: html }} />
}

export type EquationGalleryProps = {
  editor?: Editor | null
  onPick?: (equation: EquationTemplate) => void
  onNewEquation?: () => void
  compact?: boolean
  showSaved?: boolean
}

export function EquationGallery({
  editor,
  onPick,
  onNewEquation,
  compact = false,
  showSaved = true,
}: EquationGalleryProps) {
  const [saved, setSaved] = useState(() => loadSavedEquations())

  useEffect(() => {
    const refresh = () => setSaved(loadSavedEquations())
    window.addEventListener('equation-saved', refresh)
    return () => window.removeEventListener('equation-saved', refresh)
  }, [])

  const choose = (equation: EquationTemplate) => {
    if (editor) {
      insertEquation(editor, equation, equation.label, { inlineMode: false })
    }
    onPick?.(equation)
  }

  const insertNew = () => {
    if (editor) {
      insertEquation(editor, '', 'New Equation', {
        inlineMode: false,
      })
    }
    if (onNewEquation) onNewEquation()
    else onPick?.({ label: 'Insert New Equation', html: '' })
  }

  return (
    <div className={`equation-gallery${compact ? ' compact' : ''}`}>
      <div className="equation-gallery-grid">
        {EQUATION_GALLERY.map((equation) => (
          <button
            type="button"
            className="equation-gallery-card"
            key={equation.id}
            onClick={() => choose(equation)}
            title={equation.label}
          >
            <span className="equation-gallery-preview">
              <EquationPreview html={equation.html} />
            </span>
            <span className="equation-gallery-label">{equation.label}</span>
          </button>
        ))}
        <button type="button" className="equation-gallery-card new" onClick={insertNew}>
          <span className="equation-gallery-preview new-preview">
            <span className="equation-gallery-plus">+</span>
          </span>
          <span className="equation-gallery-label">Insert New Equation</span>
        </button>
      </div>
      {showSaved && saved.length > 0 && (
        <div className="equation-gallery-saved">
          <div className="equation-gallery-heading">Saved Equations</div>
          <div className="equation-gallery-grid">
            {saved.map((equation) => (
              <button
                type="button"
                className="equation-gallery-card"
                key={equation.id}
                onClick={() => choose(equation)}
                title={equation.label}
              >
                <span className="equation-gallery-preview">
                  <EquationPreview html={equation.html} />
                </span>
                <span className="equation-gallery-label">{equation.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function StructureMenu({
  group,
  editor,
  onPick,
}: {
  group: StructureGroupDef
  editor?: Editor | null
  onPick?: (item: EquationTemplate) => void
}) {
  const choose = (item: EquationTemplate) => {
    if (editor) insertEquationStructure(editor, item.html, item.label)
    onPick?.(item)
  }
  return (
    <div className="equation-structure-menu" style={{ width: group.width ?? 320 }}>
      {group.sections.map((section, sectionIndex) => (
        <div className="equation-structure-section" key={`${group.id}-${sectionIndex}`}>
          {section.label && <div className="equation-structure-heading">{section.label}</div>}
          <div className="equation-structure-grid">
            {section.items.map((item, itemIndex) => (
              <button
                type="button"
                className="equation-structure-card"
                key={`${group.id}-${sectionIndex}-${itemIndex}`}
                onClick={() => choose(item)}
                title={item.label}
              >
                <span className="equation-structure-preview">
                  <EquationPreview html={item.html} />
                </span>
                <span className="equation-structure-caption">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
