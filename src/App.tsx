import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditor } from '@tiptap/react'
import { buildExtensions } from './editor/extensions'
import { WordContext, type PageSetup, type ReviewPaneOrientation, type ViewMode } from './context'
import { exportDocx, importDocx } from './lib/docx'
import TitleBar from './components/TitleBar'
import Ribbon from './components/Ribbon'
import PageCanvas from './components/PageCanvas'
import StatusBar from './components/StatusBar'
import FindReplace from './components/FindReplace'
import NavigationPane from './components/NavigationPane'
import OfficeClipboardPane from './components/OfficeClipboardPane'
import StylesPane from './components/StylesPane'
import Backstage from './components/Backstage'
import ShortcutsDialog from './components/ShortcutsDialog'
import CommentsPane from './components/review/CommentsPane'
import ReviewingPane from './components/review/ReviewingPane'
import { captureDomSelection } from './lib/clipboard'
import { applyFormatPainter, cancelFormatPainter, getPainter } from './lib/formatPainter'
import { createComment, resetComments } from './editor/comments'
import { setTrackingConfig, type MarkupMode } from './editor/review'

const SAMPLE = `
<p class="sample-title">Welcome to OpenOffice</p>
<p class="sample-sub">A Word-compatible editor for the web</p>
<p>This document behaves like Microsoft Word: use the <strong>Ribbon</strong> above to format text, insert tables and pictures, and lay out pages. Everything here works — try it.</p>
<p class="sample-h">Getting started</p>
<p>Select some text and apply a <strong>Style</strong> from the Home tab, or make it <em>italic</em>, <u>underlined</u>, <s>struck through</s>, or add a <span style="color:#c00000">c</span><span style="color:#ed7d31">o</span><span style="color:#70ad47">l</span><span style="color:#2b579a">o</span><span style="color:#7030a0">r</span>. You can also use <mark data-color="#ffff00" style="background-color:#ffff00">highlighting</mark>, super/subscripts like E = mc<sup>2</sup> and H<sub>2</sub>O, and change fonts and sizes from the Font group.</p>
<ul><li>Bulleted and numbered lists</li><li>Tables, images, and links</li><li>Page layout, margins, orientation, and columns</li></ul>
<p class="sample-h">Save your work</p>
<p>Open the <strong>File</strong> tab to create, open, save, and print documents. Saving writes a real <code>.docx</code> file you can open in Microsoft Word.</p>
<p class="sample-quote">"The best way to predict the future is to invent it." — Alan Kay</p>
<p>Press Ctrl+F to find and replace, or Ctrl+S to save.</p>
`

const DEFAULT_PAGE: PageSetup = {
  sizeKey: 'letter',
  orientation: 'portrait',
  margins: { top: 96, right: 96, bottom: 96, left: 96 },
  columns: 1,
  pageColor: '#ffffff',
  watermark: null,
}

export default function App() {
  const [activeTab, setActiveTab] = useState('Home')
  const [docTitle, setDocTitle] = useState('Document1')
  const [zoom, setZoom] = useState(1)
  const [showRuler, setShowRuler] = useState(true)
  const [showNav, setShowNav] = useState(false)
  const [showClipboardPane, setShowClipboardPane] = useState(false)
  const [showStylesPane, setShowStylesPane] = useState(false)
  const [showGridlines, setShowGridlines] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('print')
  const [trackChanges, setTrackChanges] = useState(false)
  const [markupMode, setMarkupMode] = useState<MarkupMode>('simple')
  const [showInsertions, setShowInsertions] = useState(true)
  const [showDeletions, setShowDeletions] = useState(true)
  const [showFormatting, setShowFormatting] = useState(true)
  const [showCommentsPane, setShowCommentsPane] = useState(false)
  const [reviewingPane, setReviewingPane] = useState(false)
  const [reviewingOrientation, setReviewingOrientation] = useState<ReviewPaneOrientation>('vertical')
  const [proofingLanguage, setProofingLanguage] = useState('English (United States)')
  const [theme, setTheme] = useState('office')
  const [page, setPage] = useState<PageSetup>(DEFAULT_PAGE)
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [showHeader, setShowHeader] = useState(false)
  const [showFooter, setShowFooter] = useState(false)
  const [showPageNumbers, setShowPageNumbers] = useState(false)
  const [pageBorders, setPageBorders] = useState(false)
  const [paragraphBefore, setParagraphBefore] = useState(0)
  const [paragraphAfter, setParagraphAfter] = useState(8)
  const [toastMsg, setToastMsg] = useState('')
  const [showFind, setShowFind] = useState(false)
  const [findReplace, setFindReplace] = useState(false)
  const [showBackstage, setShowBackstage] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const toastTimer = useRef<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: buildExtensions(),
    content: SAMPLE,
    autofocus: 'start',
    editorProps: {
      attributes: { class: 'word-doc', spellcheck: 'true' },
    },
    onUpdate: ({ editor }) => {
      try {
        localStorage.setItem('openoffice:content', JSON.stringify(editor.getJSON()))
      } catch {
        /* ignore */
      }
    },
  })

  useEffect(() => {
    if (!editor) return
    try {
      const saved = localStorage.getItem('openoffice:content')
      if (saved) editor.commands.setContent(JSON.parse(saved))
      const savedPage = localStorage.getItem('openoffice:page')
      if (savedPage) setPage(JSON.parse(savedPage))
    } catch {
      /* ignore */
    }
  }, [editor])

  useEffect(() => {
    localStorage.setItem('openoffice:page', JSON.stringify(page))
  }, [page])

  useEffect(() => {
    setTrackingConfig({ enabled: trackChanges })
  }, [trackChanges])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('openoffice:review:ui')
      if (!raw) return
      const saved = JSON.parse(raw) as Record<string, unknown>
      if (saved.markupMode === 'simple' || saved.markupMode === 'all' || saved.markupMode === 'no' || saved.markupMode === 'original') {
        setMarkupMode(saved.markupMode)
      }
      if (typeof saved.showInsertions === 'boolean') setShowInsertions(saved.showInsertions)
      if (typeof saved.showDeletions === 'boolean') setShowDeletions(saved.showDeletions)
      if (typeof saved.showFormatting === 'boolean') setShowFormatting(saved.showFormatting)
      if (typeof saved.showCommentsPane === 'boolean') setShowCommentsPane(saved.showCommentsPane)
      if (typeof saved.reviewingPane === 'boolean') setReviewingPane(saved.reviewingPane)
      if (saved.reviewingOrientation === 'vertical' || saved.reviewingOrientation === 'horizontal') {
        setReviewingOrientation(saved.reviewingOrientation)
      }
      if (typeof saved.proofingLanguage === 'string') setProofingLanguage(saved.proofingLanguage)
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        'openoffice:review:ui',
        JSON.stringify({
          markupMode,
          showInsertions,
          showDeletions,
          showFormatting,
          showCommentsPane,
          reviewingPane,
          reviewingOrientation,
          proofingLanguage,
        }),
      )
    } catch {
      /* ignore */
    }
  }, [
    markupMode,
    showInsertions,
    showDeletions,
    showFormatting,
    showCommentsPane,
    reviewingPane,
    reviewingOrientation,
    proofingLanguage,
  ])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--doc-para-before', `${paragraphBefore}pt`)
    root.style.setProperty('--doc-para-after', `${paragraphAfter}pt`)
  }, [paragraphBefore, paragraphAfter])

  useEffect(() => {
    const onCopy = (event: ClipboardEvent) => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) return
      if (!selection.anchorNode?.parentElement?.closest('.word-doc')) return
      const holder = document.createElement('div')
      holder.appendChild(selection.getRangeAt(0).cloneContents())
      captureDomSelection(holder.innerHTML, selection.toString())
      if (event.type === 'cut') {
        window.setTimeout(() => {
          const after = window.getSelection()
          if (after && !after.isCollapsed) document.execCommand('delete')
        }, 0)
      }
    }
    document.addEventListener('copy', onCopy)
    document.addEventListener('cut', onCopy)
    return () => {
      document.removeEventListener('copy', onCopy)
      document.removeEventListener('cut', onCopy)
    }
  }, [])

  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToastMsg(''), 2600)
  }, [])

  useEffect(() => {
    const onMouseUp = (event: MouseEvent) => {
      if (!editor || !getPainter()) return
      if (!(event.target as Element | null)?.closest?.('.word-doc')) return
      if (applyFormatPainter(editor)) toast('Formatting applied')
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && getPainter()) {
        cancelFormatPainter()
        toast('Format Painter canceled')
      }
    }
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('keydown', onKey)
    }
  }, [editor, toast])

  const newDoc = useCallback(() => {
    resetComments(editor)
    editor?.commands.setContent('<p></p>')
    setDocTitle('Document1')
    toast('New document created')
  }, [editor, toast])

  const openDoc = useCallback(() => fileRef.current?.click(), [])

  const openDocx = useCallback(
    async (file: File) => {
      if (!editor) return
      try {
        const { html } = await importDocx(file)
        editor.commands.setContent(html)
        setDocTitle(file.name.replace(/\.docx$/i, ''))
        toast(`Opened ${file.name}`)
      } catch (e) {
        toast('Could not open that file')
      }
    },
    [editor, toast],
  )

  const saveBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name.endsWith('.docx') ? name : `${name}.docx`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  const saveDocx = useCallback(() => {
    if (!editor) return
    exportDocx(editor.getJSON(), docTitle)
      .then((blob) => {
        saveBlob(blob, docTitle)
        toast(`Saved ${docTitle}.docx`)
      })
      .catch(() => toast('Save failed'))
  }, [editor, docTitle, toast])

  const saveAsDocx = useCallback(() => {
    if (!editor) return
    const name = window.prompt('Save as:', docTitle) || docTitle
    setDocTitle(name)
    exportDocx(editor.getJSON(), name)
      .then((blob) => {
        saveBlob(blob, name)
        toast(`Saved ${name}.docx`)
      })
      .catch(() => toast('Save failed'))
  }, [editor, docTitle, toast])

  useEffect(() => {
    if (import.meta.env.DEV) (window as any).__editor = editor
  }, [editor])

  const printDoc = useCallback(() => window.print(), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      if (!mod) return
      const k = e.key.toLowerCase()
      if (e.altKey && k === 'm') {
        e.preventDefault()
        if (editor) {
          createComment(editor)
          setActiveTab('Review')
          setShowCommentsPane(true)
          toast('Comment added')
        }
        return
      }
      if (e.shiftKey && k === 'e') {
        e.preventDefault()
        setTrackChanges((current) => {
          const next = !current
          toast(next ? 'Track Changes turned on' : 'Track Changes turned off')
          return next
        })
        return
      }
      if (e.altKey) return
      if (k === 's') {
        e.preventDefault()
        saveDocx()
      } else if (k === 'f') {
        e.preventDefault()
        setFindReplace(false)
        setShowFind(true)
      } else if (k === 'p') {
        e.preventDefault()
        printDoc()
      } else if (k === 'o') {
        e.preventDefault()
        openDoc()
      } else if (k === 'n') {
        e.preventDefault()
        newDoc()
      }
    }
    const onFind = (event: Event) => {
      setFindReplace(Boolean((event as CustomEvent).detail?.replace))
      setShowFind(true)
    }
    const onShortcuts = () => setShowShortcuts(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('word:find', onFind)
    window.addEventListener('word:shortcuts', onShortcuts)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('word:find', onFind)
      window.removeEventListener('word:shortcuts', onShortcuts)
    }
  }, [saveDocx, printDoc, openDoc, newDoc, editor, toast])

  const value = useMemo(
    () => ({
      editor,
      docTitle,
      setDocTitle,
      activeTab,
      setActiveTab,
      zoom,
      setZoom,
      showRuler,
      setShowRuler,
      showNav,
      setShowNav,
      showClipboardPane,
      setShowClipboardPane,
      showStylesPane,
      setShowStylesPane,
      showGridlines,
      setShowGridlines,
      viewMode,
      setViewMode,
      trackChanges,
      setTrackChanges,
      markupMode,
      setMarkupMode,
      showInsertions,
      setShowInsertions,
      showDeletions,
      setShowDeletions,
      showFormatting,
      setShowFormatting,
      showCommentsPane,
      setShowCommentsPane,
      reviewingPane,
      setReviewingPane,
      reviewingOrientation,
      setReviewingOrientation,
      proofingLanguage,
      setProofingLanguage,
      theme,
      setTheme,
      page,
      setPage,
      headerText,
      setHeaderText,
      footerText,
      setFooterText,
      showHeader,
      setShowHeader,
      showFooter,
      setShowFooter,
      showPageNumbers,
      setShowPageNumbers,
      pageBorders,
      setPageBorders,
      paragraphBefore,
      paragraphAfter,
      setParagraphBefore,
      setParagraphAfter,
      toast,
      newDoc,
      openDoc,
      openDocx,
      saveDocx,
      saveAsDocx,
      printDoc,
      wordCount: {
        words: editor?.storage.characterCount.words() ?? 0,
        characters: editor?.storage.characterCount.characters() ?? 0,
        paragraphs: editor?.state.doc.childCount ?? 0,
      },
    }),
    [
      editor, docTitle, activeTab, zoom, showRuler, showNav, showClipboardPane, showStylesPane, showGridlines, viewMode, trackChanges,
      markupMode, showInsertions, showDeletions, showFormatting, showCommentsPane, reviewingPane, reviewingOrientation, proofingLanguage,
      theme, page, headerText, footerText, showHeader, showFooter, showPageNumbers, pageBorders,
      paragraphBefore, paragraphAfter, toast, newDoc, openDoc, openDocx, saveDocx, saveAsDocx, printDoc,
    ],
  )

  return (
    <WordContext.Provider value={value}>
      <div
        className={`word-app markup-${markupMode}${showInsertions ? '' : ' hide-insertions'}${
          showDeletions ? '' : ' hide-deletions'
        }${showFormatting ? '' : ' hide-formatting'}`}
      >
        <TitleBar />
        <Ribbon onFile={() => setShowBackstage(true)} />
        <div className="workarea">
          {showNav && <NavigationPane onClose={() => setShowNav(false)} />}
          {showClipboardPane && <OfficeClipboardPane onClose={() => setShowClipboardPane(false)} />}
          {showStylesPane && <StylesPane onClose={() => setShowStylesPane(false)} />}
          {reviewingPane && <ReviewingPane />}
          <PageCanvas />
          {showCommentsPane && <CommentsPane />}
        </div>
        <StatusBar />

        {showFind && <FindReplace initialReplace={findReplace} onClose={() => setShowFind(false)} />}
        {showBackstage && <Backstage onClose={() => setShowBackstage(false)} />}
        {showShortcuts && <ShortcutsDialog onClose={() => setShowShortcuts(false)} />}
        {toastMsg && <div className="toast">{toastMsg}</div>}

        <input
          ref={fileRef}
          type="file"
          accept=".docx"
          className="hidden-input"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) openDocx(f)
            e.target.value = ''
          }}
        />
      </div>
    </WordContext.Provider>
  )
}

