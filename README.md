<img src="assets/icon.svg" width="64" height="64" alt="">

# OpenOffice

A Word-compatible document editor for the web. It is built to **behave and feel like
Microsoft Word** — the Ribbon, styles, page layout, and document model — so files move
both ways with `.docx`.

> This is a clean-room, Word-*compatible* app. It is not Microsoft Word and shares none of
> its source code. "Works like Word" is the goal, delivered feature by feature.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build      # production build to dist/
npm run typecheck  # tsc --noEmit
npm run preview    # serve the production build
```

Headless smoke/functional checks (drive real Chrome):

```bash
node scripts/smoke.mjs    # mounts app, screenshots, reports console errors
node scripts/verify.mjs   # style/table/find tests + real .docx round-trip
```

## Tech

- **React 19 + Vite + TypeScript**
- **TipTap / ProseMirror** — the document engine (marks, nodes, history, tables, schema)
- **docx** — real OOXML `.docx` writer
- **mammoth** — `.docx` reader (Word → HTML)
- **lucide-react** — Ribbon iconography

The editor is a single continuous sheet with page geometry, margins, ruler, zoom, columns
and print layout. Autosave keeps the document in `localStorage`.

## What works today

### File
- New, Open `.docx`, Save, Save As, Export `.docx`, Print / Print-to-PDF
- Real `.docx` round-trip (verified: valid `PK` OOXML archive, imports back)

### Home
- Clipboard: Cut, Copy, Paste, Format Painter
- Font: family, size, grow/shrink, **B** **I** _U_ ~~S~~, sub/superscript, text color
  (theme + custom), highlight color, change case, clear formatting
- Paragraph: bullets, numbering, multilevel, indent, line spacing, alignment
- Styles gallery (Normal, headings, Title, Quote…) with live active state
- Editing: Find & Replace (match case / whole word, next/prev, replace all)

### Insert
- Cover page, blank page, page break
- Table (8×10 grid picker), Pictures, Online Videos, Shapes, Icons, 3D Models,
  SmartArt, Chart, Screenshot
- Get Add-ins / My Add-ins
- Links, Header, Footer, Page Number
- Text box, Date & Time, Horizontal line, Symbol, Equation, Table of Contents

### Design
- Themes (Office, Aptos, Standard, Facet…), Style sets, Watermark, Page color, Page borders

### Layout
- Margins presets, Orientation, Page size (Letter/Legal/A4/A3/A5/Tabloid),
  Columns, Breaks, Indent, Paragraph spacing, Line spacing

### References / Review / View / Mailings / Draw / Help
- References: Table of Contents, footnotes/endnotes, citations, captions, index, authorities
- Review: Spelling & Grammar, Thesaurus, Word Count, Read Aloud, Accessibility, Translate,
  comments, tracking with markup view, accept/reject, compare, protect, hide ink
- View: Read / Print / Web layout, Outline / Draft, Focus, Immersive Reader, Dark Mode,
  Ruler / **View Gridlines** / Navigation pane, zoom presets, window arrangement
- Mailings: envelopes, labels, start mail merge, recipient list, merge fields, preview
  (always-visible First/Previous/Next/Last), finish & merge
- Draw: ink tools surface
- Help: help, training, feedback

### Chrome
- Word-blue title bar with Quick Access Toolbar, document name, search, account
- Ribbon with 11 tabs, collapsible, groups with large/small controls, dropdowns, and
  group dialog launchers
- Ruler with margin markers, zoom slider, live word/character/paragraph counts
- Backstage **File** view with Home, New, Open, Add-ins, Info, Save As, Print, Share,
  Export, Account, Options; toasts; keyboard shortcuts (Ctrl+S/F/P/O/N, Ctrl+B/I/U)

### Authoritative UI catalog
Ribbon anatomy, labels, and visibility are checked against the locally installed
Microsoft Word through invisible COM automation:

```powershell
pwsh scripts/word-catalog.ps1 -Limit 2000
python scripts/build-word-catalog.py
python scripts/word-top-controls.py
node scripts/dump-app-ribbon.mjs
python scripts/compare-word-app.py
```

Raw artifacts live in `research/word-ui/` (`word-controls.json`, `word-catalog.jsonl`,
`ribbon-tree.json`, `word-top-controls.json`, `app-ribbon.json`).

## Known gaps (roadmap toward full parity)

- True multi-page pagination (currently one continuous sheet with page-break markers)
- Contextual tabs (Table Design/Layout, Picture Format, Header & Footer, Drawing) not yet
- Group dialog launchers are rendered, but Font/Paragraph/Page Setup/Footnote dialogs are
  still toast stubs
- Document map / headers-footers are on-screen chrome, not yet in the OOXML export
- Comments are surfaced but not yet threaded objects; Track Changes is a mode, not a diff
- No VBA macros, mail-merge data sources, equations editor, or co-authoring

Contributions and issues are welcome.
