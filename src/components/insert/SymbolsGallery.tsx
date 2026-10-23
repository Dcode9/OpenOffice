import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import { insertHtml, styledRun } from '../../editor/insertActions'
import '../../styles/insert-advanced.css'

const SYMBOL_CATEGORIES: { id: string; name: string; symbols: string[] }[] = [
  {
    id: 'basic',
    name: 'Basic Math',
    symbols: ['±', '×', '÷', '≠', '≈', '∞', '√', '∑', '∏', '∫', '∂', '∆', '∇', '∈', '∉', '∅', '∩', '∪', '⊂', '⊃', '⊆', '⊇', '∧', '∨', '¬', '∀', '∃', '∴', '∵', '∝', '≡', '≅', '≜', '≝', '∠', '⊥', '∥', '∘', '⊕', '⊗', '⊙', '∓', '∔', '∛', '∜', '∣', '∤', '≀'],
  },
  {
    id: 'greek',
    name: 'Greek Letters',
    symbols: ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Γ', 'Δ', 'Θ', 'Λ', 'Ξ', 'Π', 'Σ', 'Φ', 'Ψ', 'Ω', 'ϑ', 'ϕ', 'ϖ', 'ϰ', 'ϱ', 'ϵ', 'ϴ', 'Ϲ', 'Ϻ', 'ϻ', 'ϐ', 'ϑ', 'ϒ', 'ϓ', 'ϔ'],
  },
  {
    id: 'letters',
    name: 'Letter-Like Symbols',
    symbols: ['ℵ', 'ℏ', 'ℓ', '℘', 'ℜ', 'ℑ', 'ℂ', 'ℕ', 'ℚ', 'ℝ', 'ℤ', 'ℇ', 'ℊ', 'ℋ', 'ℐ', 'ℒ', 'ℳ', 'ℛ', 'ℯ', 'ℱ', 'ℬ', 'ℰ', 'ℭ', 'ℌ', 'ℨ', '℁', '℅', '℆', '℔', '℥', '℧', '℩', 'Å', 'ℬ', 'ℭ', '℮', 'Ⅎ', 'ℳ', 'ℴ', 'ℵ', 'ℶ', 'ℷ', 'ℸ', '⅁', '⅂', '⅃', '⅄', 'ⅅ', 'ⅆ'],
  },
  {
    id: 'operators',
    name: 'Operators',
    symbols: ['+', '−', '∗', '∕', '∖', '∙', '⋅', '∘', '•', '⊕', '⊖', '⊗', '⊘', '⊙', '⊚', '⊛', '⊝', '⊞', '⊟', '⊠', '⊡', '⋄', '⋆', '⋇', '⋈', '⋉', '⋊', '⋋', '⋌', '⋍', '⋎', '⋏', '⋒', '⋓', '⋔', '⋕', '⋖', '⋗', '⋘', '⋙', '⋚', '⋛', '⋜', '⋝', '⋞', '⋟', '⋠', '⋡'],
  },
  {
    id: 'arrows',
    name: 'Arrows',
    symbols: ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '↖', '↗', '↘', '↙', '⇖', '⇗', '⇘', '⇙', '⟵', '⟶', '⟷', '⟹', '⟸', '⟺', '↺', '↻', '⟲', '⟳', '⇄', '⇆', '⇋', '⇌', '↩', '↪', '↫', '↬', '↭', '↮', '↯', '↰', '↱', '↲', '↳', '↴', '↵', '↶'],
  },
  {
    id: 'negated',
    name: 'Negated Relations',
    symbols: ['≠', '≮', '≯', '≰', '≱', '≲', '≳', '≴', '≵', '≶', '≷', '≸', '≹', '≺', '≻', '≼', '≽', '≾', '≿', '⊀', '⊁', '⊄', '⊅', '⊈', '⊉', '⊊', '⊋', '∉', '∌', '∦', '∤', '∦', '≁', '≄', '≇', '≉', '≊', '≋', '≌', '≍', '≎', '≏', '≐', '≑', '≒', '≓'],
  },
  {
    id: 'scripts',
    name: 'Scripts',
    symbols: ['𝒜', 'ℬ', '𝒞', '𝒟', 'ℰ', 'ℱ', '𝒢', 'ℋ', 'ℐ', '𝒥', '𝒦', 'ℒ', 'ℳ', '𝒩', '𝒪', '𝒫', '𝒬', 'ℛ', '𝒮', '𝒯', '𝒰', '𝒱', '𝒲', '𝒳', '𝒴', '𝒵', '𝓐', '𝓑', '𝓒', '𝓓', '𝓔', '𝓕', '𝓖', '𝓗', '𝓘', '𝓙', '𝓚', '𝓛', '𝓜', '𝓝', '𝓞', '𝓟', '𝓠', '𝓡', '𝓢', '𝓣', '𝓤', '𝓥'],
  },
  {
    id: 'geometry',
    name: 'Geometry',
    symbols: ['∠', '∡', '∢', '⊾', '⊿', '⊕', '⊖', '⊗', '⊙', '⊥', '∥', '∦', '⋕', '⌒', '◯', '△', '▽', '□', '◇', '○', '●', '■', '▲', '▼', '▭', '▱', '⌀', '⌖', '⌜', '⌝', '⌞', '⌟', '⌐', '¬', '⌙', '⌅', '⌆', '⌇', '⌈', '⌉', '⌊', '⌋', '⟨', '⟩', '⟪', '⟫', '⦃', '⦄'],
  },
]

export function SymbolsGallery({
  editor,
  onInserted,
  onClose,
}: {
  editor: Editor
  onInserted: (message: string) => void
  onClose: () => void
}) {
  const [category, setCategory] = useState('basic')
  const selected = SYMBOL_CATEGORIES.find((item) => item.id === category) || SYMBOL_CATEGORIES[0]

  return (
    <div className="ins-symbols">
      <div className="ins-symbols-head">
        <span>Symbol</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {SYMBOL_CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </div>
      <div className="ins-symbol-grid">
        {selected.symbols.map((symbol, index) => (
          <button
            key={`${symbol}-${index}`}
            type="button"
            className="ins-symbol-cell"
            title={symbol}
            onClick={() => {
              insertHtml(editor, styledRun(symbol, { size: 12 }))
              onInserted(`Symbol inserted: ${symbol}`)
              onClose()
            }}
          >
            {symbol}
          </button>
        ))}
      </div>
      <div className="ins-symbols-foot">
        <span>{selected.symbols.length} symbols</span>
        <span>{selected.name}</span>
      </div>
    </div>
  )
}
