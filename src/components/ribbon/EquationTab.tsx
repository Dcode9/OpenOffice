import { useState } from 'react'
import { ChevronDown, PenLine, Sigma } from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonRow, RibbonStack, SmallButton } from './ui'
import { EquationGallery, StructureMenu, STRUCTURE_GROUPS, SYMBOL_CATEGORIES } from '../EquationGallery'
import {
  changeActiveEquationToInline,
  convertActiveEquation,
  insertEquationStructure,
  insertEquationSymbol,
  justifyActiveEquation,
  updateActiveEquation,
} from '../../editor/equation'
import type { EquationAttrs } from '../../editor/equation'
import '../../styles/equation.css'

export default function EquationTab() {
  const { editor, toast } = useWord()
  const [category, setCategory] = useState(SYMBOL_CATEGORIES[0].id)
  const activeCategory = SYMBOL_CATEGORIES.find((entry) => entry.id === category) ?? SYMBOL_CATEGORIES[0]
  const visibleSymbols = activeCategory.symbols.slice(0, 26)

  if (!editor) return null

  const applyConversion = (patch: Partial<EquationAttrs>, message: string) => {
    const changed = updateActiveEquation(editor, patch)
    toast(changed ? message : 'Click inside an equation first')
  }

  const convertDisplay = (display: 'professional' | 'linear') => {
    const changed = convertActiveEquation(editor, display)
    toast(changed ? `Converted to ${display === 'linear' ? 'Linear' : 'Professional'}` : 'Click inside an equation first')
  }

  return (
    <>
      <RibbonGroup label="Tools">
        <RibbonRow>
          <Popover
            width={600}
            trigger={({ toggle }) => (
              <BigButton
                icon={<Sigma size={22} />}
                label="Equation"
                onClick={() => toggle()}
                caret
                onCaret={() => toggle()}
                title="Equation Gallery"
              />
            )}
          >
            {(close) => (
              <EquationGallery
                editor={editor}
                compact
                onPick={() => close()}
                onNewEquation={() => close()}
              />
            )}
          </Popover>
          <SmallButton
            icon={<PenLine size={15} />}
            label="Ink Equation"
            onClick={() => toast('Ink Equation requires a pen or touch input device')}
          />
        </RibbonRow>
      </RibbonGroup>

      <RibbonGroup label="Conversions">
        <RibbonStack>
          <RibbonRow>
            <SmallButton label="Unicode" onClick={() => applyConversion({ display: 'professional' }, 'Converted to UnicodeMath')} />
            <SmallButton label="LaTeX" onClick={() => applyConversion({ display: 'linear' }, 'Showing LaTeX input')} />
          </RibbonRow>
          <Popover
            align="left"
            width={226}
            trigger={({ toggle }) => <SmallButton label="Convert" caret onClick={toggle} wide />}
          >
            {(close) => (
              <div className="menu">
                <MenuItem label="Professional" onClick={() => { convertDisplay('professional'); close() }} />
                <MenuItem label="Linear" onClick={() => { convertDisplay('linear'); close() }} />
                <MenuSep />
                <MenuItem
                  label="Change to Inline"
                  onClick={() => {
                    const changed = changeActiveEquationToInline(editor)
                    toast(changed ? 'Changed to inline equation' : 'Click inside an equation first')
                    close()
                  }}
                />
                <MenuSep />
                <MenuLabel>Justification</MenuLabel>
                <MenuItem
                  label="Left"
                  onClick={() => {
                    const changed = justifyActiveEquation(editor, 'left')
                    toast(changed ? 'Equation justified left' : 'Click inside an equation first')
                    close()
                  }}
                />
                <MenuItem
                  label="Right"
                  onClick={() => {
                    const changed = justifyActiveEquation(editor, 'right')
                    toast(changed ? 'Equation justified right' : 'Click inside an equation first')
                    close()
                  }}
                />
                <MenuItem
                  label="Centered"
                  onClick={() => {
                    const changed = justifyActiveEquation(editor, 'center')
                    toast(changed ? 'Equation centered' : 'Click inside an equation first')
                    close()
                  }}
                />
                <MenuItem
                  label="Centered as a Group"
                  onClick={() => {
                    const changed = justifyActiveEquation(editor, 'group')
                    toast(changed ? 'Equation centered as a group' : 'Click inside an equation first')
                    close()
                  }}
                />
              </div>
            )}
          </Popover>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Symbols">
        <div className="equation-symbols">
          <div className="equation-symbol-grid">
            {visibleSymbols.map((symbol) => (
              <button
                type="button"
                className="equation-symbol-cell"
                key={`${activeCategory.id}-${symbol}`}
                title={activeCategory.label}
                onClick={() => insertEquationSymbol(editor, symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>
          <Popover
            align="right"
            width={230}
            trigger={({ toggle }) => (
              <button type="button" className="equation-symbol-more" title="Symbol categories" onClick={toggle}>
                <ChevronDown size={15} />
              </button>
            )}
          >
            {(close) => (
              <div className="menu">
                <MenuLabel>Symbol Categories</MenuLabel>
                {SYMBOL_CATEGORIES.map((entry) => (
                  <MenuItem
                    key={entry.id}
                    label={entry.label}
                    active={entry.id === activeCategory.id}
                    onClick={() => {
                      setCategory(entry.id)
                      close()
                    }}
                  />
                ))}
              </div>
            )}
          </Popover>
        </div>
      </RibbonGroup>

      <RibbonGroup label="Structures" className="equation-structures-group">
        <div className="equation-structures">
          {STRUCTURE_GROUPS.map((group) => (
            <Popover
              key={group.id}
              width={group.width ?? 320}
              align="left"
              trigger={({ toggle }) => (
                <BigButton
                  icon={<span className="eq-ribbon-glyph" dangerouslySetInnerHTML={{ __html: group.icon }} />}
                  label={group.label}
                  onClick={() => insertEquationStructure(editor, group.defaultTemplate.html, group.defaultTemplate.label)}
                  caret
                  onCaret={() => toggle()}
                  title={`${group.label} structures`}
                />
              )}
            >
              {(close) => <StructureMenu group={group} editor={editor} onPick={() => close()} />}
            </Popover>
          ))}
        </div>
      </RibbonGroup>
    </>
  )
}
