import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  ALargeSmall,
  BarChart3,
  BookOpen,
  Box,
  FileText,
  Hash,
  Image as ImageIcon,
  Link2,
  MessageSquare,
  Minus,
  Omega,
  PanelBottom,
  PanelTop,
  Puzzle,
  Shapes as ShapesIcon,
  Sigma,
  Table as TableIcon,
  TextCursorInput,
  Type,
  Video,
  Workflow,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import { applyLink, insertImageFromFile, insertPageBreak, insertTable, insertText } from '../../editor/actions'
import { createComment } from '../../editor/comments'
import type { Editor } from '@tiptap/react'
import { ShapesGallery } from '../insert/ShapesGallery'
import { StockImagesDialog } from '../insert/PicturesGallery'
import { IconsMenuTrigger } from '../insert/IconsGallery'
import { ChartDialog, ModelsMenu, ScreenshotTrigger, SmartArtDialog } from '../insert/IllustrationMenus'
import { FooterGallery, HeaderGallery } from '../insert/HeaderFooterGalleries'
import { PageNumberGallery } from '../insert/PageNumber'
import { TextBoxGallery } from '../insert/TextBoxGallery'
import { QuickPartsMenu } from '../insert/QuickParts'
import { WordArtGallery } from '../insert/WordArtGallery'
import { DateTimeMenu, HorizontalLineButton, ObjectMenu, SignatureLineMenu } from '../insert/TextExtras'
import { SymbolsGallery } from '../insert/SymbolsGallery'
import { EquationGallery } from '../EquationGallery'

function TablePicker({ onPick }: { onPick: (r: number, c: number) => void }) {
  const [hover, setHover] = useState({ r: 0, c: 0 })
  const [open, setOpen] = useState(false)
  const rows = 8
  const cols = 10
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      width={260}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title="Table">
          <span className="rb-big-icon"><TableIcon size={22} /></span>
          <span className="rb-big-label">Table</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {(close) => (
        <div className="table-picker">
          <div className="tp-grid" onMouseLeave={() => setHover({ r: 0, c: 0 })}>
            {Array.from({ length: rows }).map((_, r) => (
              <div className="tp-row" key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <div
                    key={c}
                    className={`tp-cell${r < hover.r && c < hover.c ? ' on' : ''}`}
                    onMouseEnter={() => setHover({ r: r + 1, c: c + 1 })}
                    onClick={() => {
                      onPick(r + 1, c + 1)
                      close()
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="tp-label">{hover.r && hover.c ? `${hover.c} x ${hover.r} Table` : 'Insert Table'}</div>
          <div className="menu">
            <MenuSep />
            <MenuItem label="Insert Table…" onClick={() => { onPick(3, 3); close() }} />
            <MenuItem label="Draw Table" onClick={() => { onPick(4, 4); close() }} />
            <MenuItem label="Convert Text to Table" onClick={() => { onPick(2, 3); close() }} />
            <MenuItem label="Excel Spreadsheet" onClick={() => { onPick(3, 3); close() }} />
          </div>
        </div>
      )}
    </Popover>
  )
}

function BigMenu({
  icon,
  label,
  title,
  width = 210,
  children,
}: {
  icon: ReactNode
  label: string
  title?: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={title || label}>
          <span className="rb-big-icon">{icon}</span>
          <span className="rb-big-label">{label}</span>
          <span className="rb-caret" />
        </button>
      )}
    >
      {children}
    </Popover>
  )
}

function SmallMenu({
  icon,
  label,
  width = 210,
  children,
}: {
  icon?: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => <SmallButton icon={icon} label={label} wide onClick={toggle} />}
    >
      {children}
    </Popover>
  )
}

export default function InsertTab() {
  const { editor, toast, setShowCommentsPane } = useWord()
  const imgRef = useRef<HTMLInputElement>(null)
  const [showStock, setShowStock] = useState(false)
  const [showSmartArt, setShowSmartArt] = useState(false)
  const [showChart, setShowChart] = useState(false)
  if (!editor) return null

  const linkActive = editor.isActive('link')

  const insertCover = (variant: string) =>
    insertText(
      editor,
      `<p class="cover-title">${variant}</p><p class="cover-sub">Subtitle</p><p class="cover-meta">Author Name</p><p class="cover-meta">${new Date().toLocaleDateString()}</p><hr data-cover>`,
    )

  const editLink = () => {
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Address:', prev)
    if (url !== null) applyLink(editor, url)
  }

  const addPictureUrl = (close: () => void) => {
    const url = window.prompt('Insert picture from the web (URL):', 'https://')
    if (url && url !== 'https://') {
      editor.chain().focus().setImage({ src: url }).run()
      toast('Picture inserted')
    }
    close()
  }

  return (
    <>
      <RibbonGroup label="Pages">
        <BigMenu icon={<BookOpen size={22} />} label="Cover Page">
          {(close) => (
            <div className="menu">
              <MenuItem label="Automatic Cover 1" onClick={() => { insertCover('Title'); close() }} />
              <MenuItem label="Automatic Cover 2" onClick={() => { insertCover('Document Title'); close() }} />
              <MenuItem label="Retro Cover" onClick={() => { insertCover('Report Title'); close() }} />
              <MenuSep />
              <MenuItem label="Remove Current Cover Page" onClick={() => { toast('Cover page removed'); close() }} />
            </div>
          )}
        </BigMenu>
        <RibbonStack>
          <SmallButton icon={<FileText size={15} />} label="Blank Page" wide onClick={() => insertPageBreak(editor)} />
          <SmallButton icon={<Minus size={15} />} label="Page Break" wide onClick={() => insertPageBreak(editor)} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Tables">
        <TablePicker onPick={(r, c) => insertTable(editor, r, c)} />
      </RibbonGroup>

      <RibbonGroup label="Illustrations">
        <BigMenu icon={<ImageIcon size={22} />} label="Pictures">
          {(close) => (
            <div className="menu">
              <MenuItem label="This Device…" onClick={() => { imgRef.current?.click(); close() }} />
              <MenuItem label="Stock Images…" onClick={() => { setShowStock(true); close() }} />
              <MenuItem label="Online Pictures…" onClick={() => addPictureUrl(close)} />
            </div>
          )}
        </BigMenu>
        <input
          ref={imgRef}
          type="file"
          accept="image/*"
          className="hidden-input"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) insertImageFromFile(editor, f, () => toast('Picture inserted'))
            e.target.value = ''
          }}
        />
        <BigMenu icon={<ShapesIcon size={22} />} label="Shapes" width={585}>
          {(close) => <ShapesGallery editor={editor} onInserted={toast} onClose={close} />}
        </BigMenu>
        <IconsMenuTrigger editor={editor} onInserted={toast} />
        <BigMenu icon={<Box size={22} />} label="3D Models" width={380}>
          {(close) => <ModelsMenu editor={editor} onInserted={toast} onClose={close} />}
        </BigMenu>
        <BigButton icon={<Workflow size={22} />} label="SmartArt" onClick={() => setShowSmartArt(true)} />
        <BigButton icon={<BarChart3 size={22} />} label="Chart" onClick={() => setShowChart(true)} />
        <ScreenshotTrigger editor={editor} onInserted={toast} />
      </RibbonGroup>

      <RibbonGroup label="Add-ins">
        <RibbonStack>
          <SmallButton icon={<Puzzle size={15} />} label="Get Add-ins" wide onClick={() => toast('Office Add-ins store')} />
          <SmallButton icon={<Box size={15} />} label="My Add-ins" wide onClick={() => toast('My Add-ins')} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Media">
        <BigButton
          icon={<Video size={22} />}
          label="Online Videos…"
          onClick={() => {
            const url = window.prompt('Insert video from the web (URL):', 'https://')
            if (url && url !== 'https://') {
              insertText(editor, `<p><a href="${url}">Video: ${url}</a></p>`)
              toast('Online video inserted')
            }
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Links">
        <BigButton icon={<Link2 size={22} />} label="Link" active={linkActive} onClick={editLink} caret onCaret={editLink} />
        <RibbonStack>
          <SmallButton icon={<Hash size={15} />} label="Bookmark" wide onClick={() => {
            const name = window.prompt('Bookmark name:')
            if (name) {
              insertText(editor, `<a id="${name}"></a>`)
              toast(`Bookmark "${name}" added`)
            }
          }} />
          <SmallMenu icon={<FileText size={15} />} label="Cross-reference">
            {(close) => (
              <div className="menu">
                <MenuItem label="Insert Cross-reference…" onClick={() => { toast('Cross-reference'); close() }} />
              </div>
            )}
          </SmallMenu>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Comments">
        <BigButton
          icon={<MessageSquare size={22} />}
          label="Comment"
          onClick={() => {
            setShowCommentsPane(true)
            createComment(editor)
          }}
        />
      </RibbonGroup>

      <RibbonGroup label="Header & Footer">
        <BigMenu icon={<PanelTop size={22} />} label="Header" width={470}>
          {(close) => <HeaderGallery onClose={close} />}
        </BigMenu>
        <BigMenu icon={<PanelBottom size={22} />} label="Footer" width={470}>
          {(close) => <FooterGallery onClose={close} />}
        </BigMenu>
        <BigMenu icon={<Hash size={22} />} label="Page Number" width={430}>
          {(close) => <PageNumberGallery onClose={close} />}
        </BigMenu>
      </RibbonGroup>

      <RibbonGroup label="Text">
        <BigMenu icon={<TextCursorInput size={22} />} label="Text Box" width={450}>
          {(close) => <TextBoxGallery editor={editor} onInserted={toast} onClose={close} />}
        </BigMenu>
        <RibbonStack>
          <SmallMenu icon={<Puzzle size={15} />} label="Quick Parts" width={330}>
            {(close) => <QuickPartsMenu editor={editor} onInserted={toast} onClose={close} />}
          </SmallMenu>
          <SmallMenu icon={<Type size={15} />} label="WordArt" width={470}>
            {(close) => <WordArtGallery editor={editor} onInserted={toast} onClose={close} />}
          </SmallMenu>
          <SmallMenu icon={<ALargeSmall size={15} />} label="Drop Cap">
            {(close) => (
              <div className="menu">
                <MenuItem label="None" onClick={() => { toast('Drop cap removed'); close() }} />
                <MenuItem label="Dropped" onClick={() => { toast('Dropped drop cap'); close() }} />
                <MenuItem label="In Margin" onClick={() => { toast('Drop cap in margin'); close() }} />
                <MenuItem label="Drop Cap Options…" onClick={() => { toast('Drop Cap Options'); close() }} />
              </div>
            )}
          </SmallMenu>
        </RibbonStack>
        <RibbonStack>
          <SignatureLineMenu editor={editor} onInserted={toast} />
          <DateTimeMenu editor={editor} onInserted={toast} />
          <ObjectMenu editor={editor} onInserted={toast} />
          <HorizontalLineButton editor={editor} onInserted={toast} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Symbols">
        <RibbonStack>
          <BigMenu icon={<Sigma size={22} />} label="Equation" width={440}>
            {(close) => (
              <div className="equation-gallery-pop">
                <EquationGallery
                  editor={editor}
                  onPick={() => {
                    toast('Equation inserted')
                    close()
                  }}
                />
              </div>
            )}
          </BigMenu>
          <SmallMenu icon={<Omega size={15} />} label="Symbol" width={460}>
            {(close) => <SymbolsGallery editor={editor} onInserted={toast} onClose={close} />}
          </SmallMenu>
        </RibbonStack>
      </RibbonGroup>

      {showStock && (
        <StockImagesDialog editor={editor} onInserted={toast} onClose={() => setShowStock(false)} />
      )}
      {showSmartArt && (
        <SmartArtDialog editor={editor} onInserted={toast} onClose={() => setShowSmartArt(false)} />
      )}
      {showChart && (
        <ChartDialog editor={editor} onInserted={toast} onClose={() => setShowChart(false)} />
      )}
    </>
  )
}
