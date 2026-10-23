import { createContext, useContext } from 'react'
import type { Editor } from '@tiptap/react'
import type { MarkupMode } from './editor/review'

export type ViewMode = 'print' | 'web' | 'read'
export type Orientation = 'portrait' | 'landscape'
export type ReviewPaneOrientation = 'vertical' | 'horizontal'

export type PageSetup = {
  sizeKey: string
  orientation: Orientation
  margins: { top: number; right: number; bottom: number; left: number }
  columns: number
  pageColor: string
  watermark: string | null
}

export type WordContextValue = {
  editor: Editor | null
  docTitle: string
  setDocTitle: (v: string) => void
  activeTab: string
  setActiveTab: (v: string) => void
  zoom: number
  setZoom: (v: number) => void
  showRuler: boolean
  setShowRuler: (v: boolean) => void
  showNav: boolean
  setShowNav: (v: boolean) => void
  showClipboardPane: boolean
  setShowClipboardPane: (v: boolean) => void
  showStylesPane: boolean
  setShowStylesPane: (v: boolean) => void
  showGridlines: boolean
  setShowGridlines: (v: boolean) => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  trackChanges: boolean
  setTrackChanges: (v: boolean) => void
  markupMode: MarkupMode
  setMarkupMode: (v: MarkupMode) => void
  showInsertions: boolean
  setShowInsertions: (v: boolean) => void
  showDeletions: boolean
  setShowDeletions: (v: boolean) => void
  showFormatting: boolean
  setShowFormatting: (v: boolean) => void
  showCommentsPane: boolean
  setShowCommentsPane: (v: boolean) => void
  reviewingPane: boolean
  setReviewingPane: (v: boolean) => void
  reviewingOrientation: ReviewPaneOrientation
  setReviewingOrientation: (v: ReviewPaneOrientation) => void
  proofingLanguage: string
  setProofingLanguage: (v: string) => void
  theme: string
  setTheme: (v: string) => void
  page: PageSetup
  setPage: (v: PageSetup) => void
  headerText: string
  setHeaderText: (v: string) => void
  footerText: string
  setFooterText: (v: string) => void
  showHeader: boolean
  setShowHeader: (v: boolean) => void
  showFooter: boolean
  setShowFooter: (v: boolean) => void
  showPageNumbers: boolean
  setShowPageNumbers: (v: boolean) => void
  pageBorders: boolean
  setPageBorders: (v: boolean) => void
  paragraphBefore: number
  paragraphAfter: number
  setParagraphBefore: (v: number) => void
  setParagraphAfter: (v: number) => void
  toast: (msg: string) => void
  newDoc: () => void
  openDoc: () => void
  openDocx: (file: File) => void
  saveDocx: () => void
  saveAsDocx: () => void
  printDoc: () => void
  wordCount: { words: number; characters: number; paragraphs: number }
}

export const WordContext = createContext<WordContextValue | null>(null)

export function useWord() {
  const ctx = useContext(WordContext)
  if (!ctx) throw new Error('useWord must be used within provider')
  return ctx
}
