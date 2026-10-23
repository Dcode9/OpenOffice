import { useEffect, useReducer, useState } from 'react'
import { ChevronUp, ChevronDown, MessageSquare, PenLine, Share2 } from 'lucide-react'
import { useWord } from '../context'
import HomeTab from './ribbon/HomeTab'
import InsertTab from './ribbon/InsertTab'
import DrawTab from './ribbon/DrawTab'
import DesignTab from './ribbon/DesignTab'
import LayoutTab from './ribbon/LayoutTab'
import ReferencesTab from './ribbon/ReferencesTab'
import MailingsTab from './ribbon/MailingsTab'
import ReviewTab from './ribbon/ReviewTab'
import ViewTab from './ribbon/ViewTab'
import HelpTab from './ribbon/HelpTab'
import TableDesignTab from './ribbon/TableDesignTab'
import TableLayoutTab from './ribbon/TableLayoutTab'
import EquationTab from './ribbon/EquationTab'
import { clearActiveEquation } from '../editor/equation'

const TABS = ['File', 'Home', 'Insert', 'Draw', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View', 'Help']

export default function Ribbon({ onFile }: { onFile: () => void }) {
  const { activeTab, setActiveTab, viewMode, toast, editor } = useWord()
  const [collapsed, setCollapsed] = useState(false)
  const [equationActive, setEquationActive] = useState(false)
  const [, forceUpdate] = useReducer((value: number) => value + 1, 0)
  const inTable = Boolean(editor?.isActive('table'))

  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate()
    editor.on('transaction', update)
    editor.on('selectionUpdate', update)
    return () => {
      editor.off('transaction', update)
      editor.off('selectionUpdate', update)
    }
  }, [editor])

  useEffect(() => {
    if (!inTable && (activeTab === 'Table Design' || activeTab === 'Table Layout')) {
      setActiveTab('Home')
    }
  }, [inTable, activeTab, setActiveTab])

  useEffect(() => {
    if (!equationActive && activeTab === 'Equation') setActiveTab('Home')
  }, [equationActive, activeTab, setActiveTab])

  useEffect(() => {
    const onEquationActive = (event: Event) => {
      const detail = (event as CustomEvent<{ active?: boolean }>).detail
      const active = Boolean(detail?.active)
      setEquationActive(active)
      if (active) setActiveTab('Equation')
    }
    window.addEventListener('equation-active', onEquationActive)
    return () => window.removeEventListener('equation-active', onEquationActive)
  }, [setActiveTab])

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null
      if (target?.closest('.equation-node, .ribbon, .equation-ctx, .equation-save-backdrop')) return
      clearActiveEquation()
    }
    document.addEventListener('mousedown', onPointerDown, true)
    return () => document.removeEventListener('mousedown', onPointerDown, true)
  }, [])

  const share = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {})
    toast('Sharing link copied')
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeTab />
      case 'Insert':
        return <InsertTab />
      case 'Draw':
        return <DrawTab />
      case 'Design':
        return <DesignTab />
      case 'Layout':
        return <LayoutTab />
      case 'References':
        return <ReferencesTab />
      case 'Mailings':
        return <MailingsTab />
      case 'Review':
        return <ReviewTab />
      case 'View':
        return <ViewTab />
      case 'Help':
        return <HelpTab />
      case 'Table Design':
        return <TableDesignTab />
      case 'Table Layout':
        return <TableLayoutTab />
      case 'Equation':
        return <EquationTab />
      default:
        return null
    }
  }

  return (
    <div className="ribbon">
      <div className="ribbon-tabs">
        <div className="ribbon-tabs-list">
          {[
            ...TABS.slice(0, TABS.length - 1),
            ...(inTable ? ['Table Design', 'Table Layout'] : []),
            ...(equationActive ? ['Equation'] : []),
            'Help',
          ].map((t) => (
            <button
              key={t}
              className={`ribbon-tab${activeTab === t ? ' active' : ''}${t === 'File' ? ' file-tab' : ''}${t.startsWith('Table ') || t === 'Equation' ? ' contextual' : ''}`}
              onClick={() => (t === 'File' ? onFile() : setActiveTab(t))}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>
        <div className="ribbon-tabs-right">
          <button className="ribbon-action" onClick={() => setActiveTab('Review')} title="Comments">
            <MessageSquare size={15} />
            Comments
          </button>
          <button className="ribbon-action" onClick={() => toast('Editing: All Markup')} title="Editing">
            <PenLine size={15} />
            Editing
            <ChevronDown size={12} />
          </button>
          <button className="ribbon-share" onClick={share} title="Share">
            <Share2 size={14} />
            Share
            <ChevronDown size={12} />
          </button>
          <button className="ribbon-collapse" onClick={() => setCollapsed(!collapsed)} title="Collapse the Ribbon">
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
      {!collapsed && viewMode !== 'read' && <div className="ribbon-content">{renderTab()}</div>}
    </div>
  )
}

