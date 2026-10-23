import { HelpCircle, Keyboard, MessageSquare, LifeBuoy } from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, RibbonGroup } from './ui'

export default function HelpTab() {
  const { toast } = useWord()
  return (
    <>
      <RibbonGroup label="Help">
        <BigButton icon={<HelpCircle size={22} />} label="Help" onClick={() => toast('OpenOffice for the web — a Word-compatible editor')} />
        <BigButton icon={<LifeBuoy size={22} />} label="Contact Support" onClick={() => toast('Support')} />
      </RibbonGroup>
      <RibbonGroup label="Show Training">
        <BigButton icon={<Keyboard size={22} />} label="Keyboard Shortcuts" onClick={() => window.dispatchEvent(new CustomEvent('word:shortcuts'))} />
      </RibbonGroup>
      <RibbonGroup label="Feedback">
        <BigButton icon={<MessageSquare size={22} />} label="Feedback" onClick={() => toast('Thanks for your feedback!')} />
      </RibbonGroup>
    </>
  )
}
