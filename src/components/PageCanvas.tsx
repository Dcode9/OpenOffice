import { useState } from 'react'
import { EditorContent } from '@tiptap/react'
import { useWord } from '../context'
import { PAGE_SIZES } from '../lib/constants'
import Ruler from './Ruler'
import InkLayer from './InkLayer'

export default function PageCanvas() {
  const {
    editor,
    page,
    zoom,
    showRuler,
    showGridlines,
    viewMode,
    headerText,
    footerText,
    showHeader,
    showFooter,
    showPageNumbers,
    pageBorders,
    setHeaderText,
    setFooterText,
  } = useWord()

  const [hideWhiteSpace, setHideWhiteSpace] = useState(false)

  if (!editor) return null

  const size = PAGE_SIZES[page.sizeKey] || PAGE_SIZES.letter
  const landscape = page.orientation === 'landscape'
  const pageW = landscape ? size.h : size.w
  const pageH = landscape ? size.w : size.h
  const { top, right, bottom, left } = page.margins
  const web = viewMode === 'web'

  if (viewMode === 'read') {
    return (
      <div className="canvas read-mode">
        <div className="read-sheet">
          <EditorContent editor={editor} className="doc-editor" />
        </div>
      </div>
    )
  }

  return (
    <div className={`canvas${web ? ' web-mode' : ''}`}>
      {showRuler && !web && (
        <div className="ruler-strip" style={{ width: pageW, zoom }}>
          <Ruler pageW={pageW} left={left} right={right} zoom={zoom} />
        </div>
      )}
      <div className="pages-scroll">
        <div
          className={`page-wrap${pageBorders ? ' bordered' : ''}${showGridlines ? ' gridlines' : ''}${hideWhiteSpace ? ' compact' : ''}`}
          style={{
            width: web ? '100%' : pageW,
            minHeight: web ? 'auto' : hideWhiteSpace ? 'auto' : pageH,
            background: page.pageColor,
            zoom,
          }}
        >
          {!web && (
            <div
              className="top-margin-whitespace"
              title={hideWhiteSpace ? 'Double-click to show white space' : 'Double-click to hide white space'}
              onDoubleClick={() => setHideWhiteSpace((v) => !v)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: hideWhiteSpace ? 20 : (showHeader ? 40 : top),
                cursor: 'pointer',
                zIndex: 5,
              }}
            />
          )}
          {showHeader && !hideWhiteSpace && (
            <div className="hf-zone hf-header" style={{ paddingLeft: left, paddingRight: right, zIndex: 6 }}>
              <input
                className="hf-input"
                value={headerText}
                placeholder="Header"
                onChange={(e) => setHeaderText(e.target.value)}
              />
            </div>
          )}
          <div
            className={`doc-body${page.columns > 1 ? ' cols' : ''}`}
            style={{
              paddingTop: web ? 32 : hideWhiteSpace ? 16 : (showHeader ? 40 : top),
              paddingRight: web ? 40 : right,
              paddingBottom: web ? 64 : hideWhiteSpace ? 16 : (showFooter ? 40 : bottom),
              paddingLeft: web ? 40 : left,
              columnCount: page.columns,
            }}
          >
            <EditorContent editor={editor} className="doc-editor" />
          </div>
          {showFooter && !hideWhiteSpace && (
            <div className="hf-zone hf-footer" style={{ paddingLeft: left, paddingRight: right, zIndex: 6 }}>
              <input
                className="hf-input"
                value={footerText}
                placeholder="Footer"
                onChange={(e) => setFooterText(e.target.value)}
              />
              {showPageNumbers && <span className="page-num">1</span>}
            </div>
          )}
          <InkLayer pageW={pageW} pageH={pageH} />
          {page.watermark && <div className="watermark">{page.watermark}</div>}
        </div>
      </div>
    </div>
  )
}
