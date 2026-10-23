import { useState } from 'react'
import type { ReactNode } from 'react'
import {
  BookMarked,
  BookOpen,
  Captions,
  FileText,
  Hash,
  Library,
  ListOrdered,
  NotebookText,
  Quote,
  Superscript,
} from 'lucide-react'
import { useWord } from '../../context'
import { BigButton, MenuItem, MenuLabel, MenuSep, Popover, RibbonGroup, RibbonStack, SmallButton } from './ui'
import {
  addAuthorityEntry,
  addIndexEntry,
  applyTocLevel,
  CITATION_STYLES,
  collectCrossRefTargets,
  collectTermPages,
  convertCitationsToStatic,
  createNote,
  emptySource,
  hasToc,
  insertBibliography,
  insertCaption,
  insertCitation,
  insertCrossRef,
  insertIndex,
  insertNoteReference,
  insertTableOfAuthorities,
  insertTableOfFigures,
  insertToc,
  loadReferenceStore,
  makeSourceTag,
  mergeIndexPages,
  navigateNote,
  pageAtSelection,
  rebuildNotes,
  removeToc,
  renumberNotes,
  restyleCitations,
  rewriteNoteLinks,
  saveReferenceStore,
  selectedText,
  sourceSummary,
  syncCitationsAndBibliography,
  syncNoteTexts,
  updateBibliographies,
  updateIndex,
  updateTableOfAuthorities,
  updateTableOfFigures,
  updateToc,
  MARKERS,
} from '../../lib/references'
import type {
  CaptionInput,
  CitationStyleId,
  CrossRefTarget,
  CrossRefType,
  IndexConfig,
  NoteKind,
  NoteRecord,
  NoteSettings,
  ReferenceStore,
  Source,
  TocConfig,
  TocDesignId,
  TofConfig,
  ToaConfig,
} from '../../lib/references'
import { CustomTocDialog, TocGallery, UpdateTocDialog } from '../references/TOCDialog'
import { NoteSettingsDialog, ShowNotesDialog } from '../references/NotesDialogs'
import { InsertCitationDialog } from '../references/CitationDialogs'
import { PlaceholderDialog, SourceDialog } from '../references/SourceDialog'
import { SourceManager } from '../references/SourceManager'
import {
  CrossReferenceDialog,
  InsertCaptionDialog,
  TableOfFiguresDialog,
} from '../references/CaptionDialogs'
import { InsertIndexDialog, MarkIndexEntryDialog } from '../references/IndexDialogs'
import type { IndexEntryInput } from '../references/IndexDialogs'
import { MarkCitationDialog, TableOfAuthoritiesDialog } from '../references/AuthoritiesDialogs'

function BigMenu({
  icon,
  label,
  width = 220,
  children,
}: {
  icon: ReactNode
  label: string
  width?: number
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => (
        <button className="rb-big" onClick={toggle} type="button" title={label}>
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
  width = 190,
  caret = true,
  children,
}: {
  icon?: ReactNode
  label: string
  width?: number
  caret?: boolean
  children: (close: () => void) => ReactNode
}) {
  return (
    <Popover
      width={width}
      trigger={({ toggle }) => <SmallButton icon={icon} label={label} wide caret={caret} onClick={toggle} onCaret={toggle} />}
    >
      {children}
    </Popover>
  )
}

type Dialog =
  | { kind: 'toc-custom'; mode: 'insert' | 'update' }
  | { kind: 'toc-update' }
  | { kind: 'note-settings' }
  | { kind: 'notes' }
  | { kind: 'citation' }
  | { kind: 'source-new' }
  | { kind: 'placeholder' }
  | { kind: 'source-manager' }
  | { kind: 'caption' }
  | { kind: 'tof'; mode: 'insert' | 'update' }
  | { kind: 'xref' }
  | { kind: 'index-mark' }
  | { kind: 'index-insert' }
  | { kind: 'toa-mark' }
  | { kind: 'toa-insert' }

export default function ReferencesTab() {
  const { editor, toast } = useWord()
  const [store, setStore] = useState<ReferenceStore>(loadReferenceStore)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  if (!editor) return null

  const commit = (next: ReferenceStore) => {
    saveReferenceStore(next)
    setStore(next)
  }

  const applyToc = (config: TocConfig, manual = false) => {
    commit({ ...store, toc: config })
    if (manual) {
      if (hasToc(editor)) removeToc(editor)
      insertToc(editor, config, true)
    } else if (hasToc(editor)) {
      updateToc(editor, config)
    } else {
      insertToc(editor, config)
    }
    toast('Table of contents inserted')
    setDialog(null)
  }

  const updateTocNow = (pageOnly: boolean) => {
    const ok = updateToc(editor, store.toc)
    toast(ok ? (pageOnly ? 'Page numbers updated' : 'Table of contents updated') : 'No table of contents found')
    setDialog(null)
  }

  const setLevel = (level: number | null) => {
    const ok = applyTocLevel(editor, level)
    toast(ok ? (level ? `Level ${level} applied to the table of contents` : 'Excluded from the table of contents') : 'Select a paragraph first')
  }

  const insertNote = (kind: NoteKind) => {
    const synced = syncNoteTexts(editor, store)
    const note = createNote(kind, '')
    const next: ReferenceStore = kind === 'footnote'
      ? { ...synced, footnotes: [...synced.footnotes, note] }
      : { ...synced, endnotes: [...synced.endnotes, note] }
    commit(next)
    insertNoteReference(editor, kind, note.id)
    renumberNotes(editor, next)
    rebuildNotes(editor, next)
    const prefix = kind === 'footnote' ? MARKERS.footnoteNote : MARKERS.endnoteNote
    let target = -1
    editor.state.doc.descendants((node, pos) => {
      if (!node.isText) return true
      for (const mark of node.marks) {
        if (mark.type.name !== 'link') continue
        if (String(mark.attrs.href || '') === `${prefix}${note.id}`) {
          target = editor.state.doc.resolve(pos).end(1)
          return false
        }
      }
      return true
    })
    if (target >= 0) editor.chain().focus().setTextSelection(target).scrollIntoView().run()
    toast(`${kind === 'footnote' ? 'Footnote' : 'Endnote'} inserted`)
  }

  const saveNoteSettings = (settings: NoteSettings) => {
    const next = { ...syncNoteTexts(editor, store), noteSettings: settings }
    commit(next)
    renumberNotes(editor, next)
    rebuildNotes(editor, next)
    toast('Note settings applied')
    setDialog(null)
  }

  const convertNotes = (mode: 'fn-to-en' | 'en-to-fn' | 'swap') => {
    const base = syncNoteTexts(editor, store)
    let next = { ...base }
    if (mode === 'fn-to-en') {
      next = {
        ...next,
        endnotes: [...base.endnotes, ...base.footnotes.map((note) => ({ ...note, kind: 'endnote' as const }))],
        footnotes: [],
      }
      rewriteNoteLinks(editor, MARKERS.footnote, MARKERS.endnote)
    } else if (mode === 'en-to-fn') {
      next = {
        ...next,
        footnotes: [...base.footnotes, ...base.endnotes.map((note) => ({ ...note, kind: 'footnote' as const }))],
        endnotes: [],
      }
      rewriteNoteLinks(editor, MARKERS.endnote, MARKERS.footnote)
    } else {
      next = {
        ...next,
        footnotes: base.endnotes.map((note) => ({ ...note, kind: 'footnote' as const })),
        endnotes: base.footnotes.map((note) => ({ ...note, kind: 'endnote' as const })),
      }
      rewriteNoteLinks(editor, MARKERS.footnote, '#swap-note-')
      rewriteNoteLinks(editor, MARKERS.endnote, MARKERS.footnote)
      rewriteNoteLinks(editor, '#swap-note-', MARKERS.endnote)
    }
    commit(next)
    renumberNotes(editor, next)
    rebuildNotes(editor, next)
    toast('Notes converted')
    setDialog(null)
  }

  const openNotes = () => {
    commit(syncNoteTexts(editor, store))
    setDialog({ kind: 'notes' })
  }

  const saveNotes = (footnotes: NoteRecord[], endnotes: NoteRecord[]) => {
    const next = { ...store, footnotes, endnotes }
    commit(next)
    renumberNotes(editor, next)
    rebuildNotes(editor, next)
    toast('Notes updated')
    setDialog(null)
  }

  const insertCitationNow = (source: Source, locator = '') => {
    insertCitation(editor, store, source, locator)
    toast('Citation inserted')
    setDialog(null)
  }

  const addSourceAndCite = (source: Source) => {
    const tags = store.sources.map((item) => item.tag)
    const resolved = { ...source, tag: tags.includes(source.tag) ? makeSourceTag(source, tags) : source.tag }
    const next = { ...store, sources: [...store.sources, resolved] }
    commit(next)
    insertCitation(editor, next, resolved)
    toast('Source added and citation inserted')
    setDialog(null)
  }

  const addPlaceholderAndCite = (name: string) => {
    const source: Source = { ...emptySource(), title: name, tag: name, placeholder: true }
    const next = { ...store, sources: [...store.sources, source] }
    commit(next)
    insertCitation(editor, next, source)
    toast('Placeholder citation inserted')
    setDialog(null)
  }

  const closeSourceManager = () => {
    const latest = loadReferenceStore()
    restyleCitations(editor, latest)
    updateBibliographies(editor, latest)
    setStore(latest)
    setDialog(null)
  }

  const changeStyle = (style: CitationStyleId) => {
    const next = { ...store, citationStyle: style }
    commit(next)
    restyleCitations(editor, next)
    updateBibliographies(editor, next)
    toast(`Citation style: ${style}`)
  }

  const insertBib = () => {
    insertBibliography(editor, store)
    toast('Bibliography inserted')
  }

  const updateBib = () => {
    syncCitationsAndBibliography(editor, store)
    toast('Citations and bibliography updated')
  }

  const staticBib = () => {
    convertCitationsToStatic(editor)
    toast('Citations converted to static text')
  }

  const insertCaptionNow = (input: CaptionInput) => {
    const customLabels = store.customLabels.includes(input.label)
      ? store.customLabels
      : [...store.customLabels, input.label]
    commit({ ...store, customLabels })
    insertCaption(editor, input)
    toast('Caption inserted')
    setDialog(null)
  }

  const insertTofNow = (config: TofConfig) => {
    const customLabels = store.customLabels.includes(config.label)
      ? store.customLabels
      : [...store.customLabels, config.label]
    commit({ ...store, tof: config, customLabels })
    insertTableOfFigures(editor, config)
    toast('Table of figures inserted')
    setDialog(null)
  }

  const updateTofNow = (config: TofConfig, pageOnly: boolean) => {
    commit({ ...store, tof: config })
    const ok = updateTableOfFigures(editor, config)
    toast(ok ? (pageOnly ? 'Table page numbers updated' : 'Table of figures updated') : 'No table of figures found')
    setDialog(null)
  }

  const insertCrossRefNow = (target: CrossRefTarget, mode: string, hyperlink: boolean, aboveBelow: boolean) => {
    insertCrossRef(editor, target, mode, hyperlink, aboveBelow)
    toast('Cross-reference inserted')
    setDialog(null)
  }

  const markIndexEntry = (data: IndexEntryInput, markAll: boolean) => {
    const page = pageAtSelection(editor)
    let next = addIndexEntry(store, data, page)
    if (markAll) {
      for (const item of collectTermPages(editor, data.main)) {
        next = mergeIndexPages(next, data.main, data.sub, [item])
      }
    }
    commit(next)
    toast(markAll ? 'All index entries marked' : 'Index entry marked')
    setDialog(null)
  }

  const insertIndexNow = (config: IndexConfig) => {
    const next = { ...store, index: config }
    commit(next)
    insertIndex(editor, next, config)
    toast('Index inserted')
    setDialog(null)
  }

  const updateIndexNow = () => {
    const ok = updateIndex(editor, store, store.index)
    toast(ok ? 'Index updated' : 'No index found')
  }

  const markCitation = (data: { selectedText: string; category: string; short: string; long: string }) => {
    commit(addAuthorityEntry(store, data, pageAtSelection(editor)))
    toast('Citation marked')
    setDialog(null)
  }

  const insertToaNow = (config: ToaConfig) => {
    const next = { ...store, toa: config }
    commit(next)
    insertTableOfAuthorities(editor, next, config)
    toast('Table of authorities inserted')
    setDialog(null)
  }

  const updateToaNow = () => {
    const ok = updateTableOfAuthorities(editor, store, store.toa)
    toast(ok ? 'Table of authorities updated' : 'No table of authorities found')
  }

  const getTargets = (type: CrossRefType) => collectCrossRefTargets(editor, store, type)

  return (
    <>
      <RibbonGroup label="Table of Contents">
        <Popover
          width={570}
          trigger={({ toggle }) => (
            <button className="rb-big" onClick={toggle} type="button" title="Table of Contents">
              <span className="rb-big-icon"><Hash size={22} /></span>
              <span className="rb-big-label">Table of Contents</span>
              <span className="rb-caret" />
            </button>
          )}
        >
          {(close) => (
            <TocGallery
              onPick={(design: TocDesignId) => {
                const manual = design === 'manual'
                applyToc({ ...store.toc, design }, manual)
                close()
              }}
              onCustom={() => {
                setDialog({ kind: 'toc-custom', mode: 'insert' })
                close()
              }}
              onRemove={() => {
                toast(removeToc(editor) ? 'Table of contents removed' : 'No table of contents found')
                close()
              }}
            />
          )}
        </Popover>
        <RibbonStack>
          <SmallMenu label="Add Text" width={250}>
            {(close) => (
              <div className="menu">
                <MenuItem
                  label="Do Not Show in Table of Contents"
                  onClick={() => {
                    setLevel(null)
                    close()
                  }}
                />
                <MenuSep />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => (
                  <MenuItem
                    key={level}
                    label={`Level ${level}`}
                    active={store.toc.levels >= level}
                    onClick={() => {
                      setLevel(level)
                      close()
                    }}
                  />
                ))}
              </div>
            )}
          </SmallMenu>
          <SmallMenu label="Update Table" width={250}>
            {(close) => (
              <div className="menu">
                <MenuItem
                  label="Update Table…"
                  onClick={() => {
                    setDialog({ kind: 'toc-update' })
                    close()
                  }}
                />
                <MenuSep />
                <MenuItem
                  label="Update page numbers only"
                  onClick={() => {
                    updateTocNow(true)
                    close()
                  }}
                />
                <MenuItem
                  label="Update entire table"
                  onClick={() => {
                    updateTocNow(false)
                    close()
                  }}
                />
              </div>
            )}
          </SmallMenu>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup
        label="Footnotes"
        launcher={{ title: 'Footnote and Endnote', onClick: () => setDialog({ kind: 'note-settings' }) }}
      >
        <BigButton icon={<Superscript size={22} />} label="Insert Footnote" onClick={() => insertNote('footnote')} />
        <BigButton icon={<Superscript size={22} />} label="Insert Endnote" onClick={() => insertNote('endnote')} />
        <RibbonStack>
          <SmallMenu icon={<NotebookText size={15} />} label="Next Footnote" width={220}>
            {(close) => (
              <div className="menu">
                <MenuItem
                  label="Next Footnote"
                  onClick={() => {
                    toast(navigateNote(editor, 'footnote', 1) ? 'Next footnote' : 'No footnotes found')
                    close()
                  }}
                />
                <MenuItem
                  label="Previous Footnote"
                  onClick={() => {
                    toast(navigateNote(editor, 'footnote', -1) ? 'Previous footnote' : 'No footnotes found')
                    close()
                  }}
                />
                <MenuSep />
                <MenuItem
                  label="Next Endnote"
                  onClick={() => {
                    toast(navigateNote(editor, 'endnote', 1) ? 'Next endnote' : 'No endnotes found')
                    close()
                  }}
                />
                <MenuItem
                  label="Previous Endnote"
                  onClick={() => {
                    toast(navigateNote(editor, 'endnote', -1) ? 'Previous endnote' : 'No endnotes found')
                    close()
                  }}
                />
              </div>
            )}
          </SmallMenu>
          <SmallButton icon={<FileText size={15} />} label="Show Notes" wide onClick={openNotes} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Citations & Bibliography">
        <BigMenu icon={<Quote size={22} />} label="Insert Citation" width={300}>
          {(close) => (
            <div className="menu">
              <MenuItem
                label="Add New Source…"
                onClick={() => {
                  setDialog({ kind: 'source-new' })
                  close()
                }}
              />
              <MenuItem
                label="Add New Placeholder…"
                onClick={() => {
                  setDialog({ kind: 'placeholder' })
                  close()
                }}
              />
              <MenuItem
                label="Insert Citation…"
                onClick={() => {
                  setDialog({ kind: 'citation' })
                  close()
                }}
              />
              <MenuSep />
              <MenuLabel>Current List</MenuLabel>
              {store.sources.length ? (
                store.sources.map((source) => (
                  <MenuItem
                    key={source.id}
                    label={source.placeholder ? `${source.title} (placeholder)` : sourceSummary(source)}
                    onClick={() => {
                      insertCitationNow(source)
                      close()
                    }}
                  />
                ))
              ) : (
                <MenuItem label="No sources in current list" disabled />
              )}
              <MenuSep />
              <MenuItem
                label="Manage Sources…"
                onClick={() => {
                  setDialog({ kind: 'source-manager' })
                  close()
                }}
              />
            </div>
          )}
        </BigMenu>
        <RibbonStack>
          <SmallButton label="Manage Sources" wide onClick={() => setDialog({ kind: 'source-manager' })} />
          <Popover
            width={210}
            trigger={({ toggle }) => (
              <button className="combo citation-style" onClick={toggle} type="button" title="Citation style">
                <span className="combo-label">Style: {store.citationStyle}</span>
                <span className="rb-caret" />
              </button>
            )}
          >
            {(close) => (
              <div className="menu">
                {CITATION_STYLES.map((style) => (
                  <MenuItem
                    key={style.id}
                    label={style.label}
                    active={store.citationStyle === style.id}
                    onClick={() => {
                      changeStyle(style.id)
                      close()
                    }}
                  />
                ))}
              </div>
            )}
          </Popover>
          <SmallMenu label="Bibliography" icon={<Library size={15} />} width={260}>
            {(close) => (
              <div className="menu">
                <MenuItem label="Insert Bibliography" onClick={() => { insertBib(); close() }} />
                <MenuItem label="Update Citations and Bibliography" onClick={() => { updateBib(); close() }} />
                <MenuSep />
                <MenuItem label="Convert to Static Text" onClick={() => { staticBib(); close() }} />
              </div>
            )}
          </SmallMenu>
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Captions">
        <BigButton icon={<Captions size={22} />} label="Insert Caption…" onClick={() => setDialog({ kind: 'caption' })} />
        <BigButton icon={<BookOpen size={22} />} label="Insert Table of Figures" onClick={() => setDialog({ kind: 'tof', mode: 'insert' })} />
        <RibbonStack>
          <SmallButton label="Update Table" wide onClick={() => setDialog({ kind: 'tof', mode: 'update' })} />
          <SmallButton label="Cross-reference" wide onClick={() => setDialog({ kind: 'xref' })} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Index">
        <BigButton icon={<BookMarked size={22} />} label="Mark Entry" onClick={() => setDialog({ kind: 'index-mark' })} />
        <BigButton icon={<ListOrdered size={22} />} label="Insert Index" onClick={() => setDialog({ kind: 'index-insert' })} />
        <RibbonStack>
          <SmallButton label="Update Index" wide onClick={updateIndexNow} />
        </RibbonStack>
      </RibbonGroup>

      <RibbonGroup label="Table of Authorities">
        <BigButton icon={<BookMarked size={22} />} label="Mark Citation" onClick={() => setDialog({ kind: 'toa-mark' })} />
        <BigButton icon={<BookOpen size={22} />} label="Insert Table of Authorities" onClick={() => setDialog({ kind: 'toa-insert' })} />
        <RibbonStack>
          <SmallButton label="Update Table" wide onClick={updateToaNow} />
        </RibbonStack>
      </RibbonGroup>

      {dialog?.kind === 'toc-custom' && (
        <CustomTocDialog
          config={store.toc}
          mode={dialog.mode}
          onSave={(config) => applyToc(config)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'toc-update' && <UpdateTocDialog onUpdate={updateTocNow} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'note-settings' && (
        <NoteSettingsDialog
          settings={store.noteSettings}
          onSave={saveNoteSettings}
          onConvert={convertNotes}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'notes' && (
        <ShowNotesDialog
          footnotes={store.footnotes}
          endnotes={store.endnotes}
          settings={store.noteSettings}
          onSave={saveNotes}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'citation' && (
        <InsertCitationDialog
          store={store}
          onChangeStore={commit}
          onInsert={insertCitationNow}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'source-new' && (
        <SourceDialog
          existingTags={store.sources.map((source) => source.tag)}
          onSave={addSourceAndCite}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'placeholder' && (
        <PlaceholderDialog onSave={addPlaceholderAndCite} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'source-manager' && (
        <SourceManager store={store} onCommit={commit} onClose={closeSourceManager} />
      )}
      {dialog?.kind === 'caption' && (
        <InsertCaptionDialog
          customLabels={store.customLabels}
          onInsert={insertCaptionNow}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'tof' && (
        <TableOfFiguresDialog
          config={store.tof}
          customLabels={store.customLabels}
          mode={dialog.mode}
          onSave={(config, pageOnly) =>
            dialog.mode === 'insert' ? insertTofNow(config) : updateTofNow(config, pageOnly)
          }
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'xref' && (
        <CrossReferenceDialog getTargets={getTargets} onInsert={insertCrossRefNow} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'index-mark' && (
        <MarkIndexEntryDialog initialTerm={selectedText(editor)} onSubmit={markIndexEntry} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'index-insert' && (
        <InsertIndexDialog config={store.index} onSave={insertIndexNow} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'toa-mark' && (
        <MarkCitationDialog
          selectedText={selectedText(editor)}
          onSubmit={markCitation}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === 'toa-insert' && (
        <TableOfAuthoritiesDialog config={store.toa} onSave={insertToaNow} onClose={() => setDialog(null)} />
      )}
    </>
  )
}
