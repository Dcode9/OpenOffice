# Layout and Design Tabs — UI and Behavior Specification

Status: research complete; implementation spec
Target: Microsoft Word for Microsoft 365 / Word 2024 ribbon, US English, inches
Primary evidence: `research/videos/YJjYHRIiDzQ.en.srt` (Layout) and `research/videos/fL1hd6NlPsM.en.srt` (Design)
App audited: `src/components/ribbon/LayoutTab.tsx`, `src/components/ribbon/DesignTab.tsx`, `src/context.ts`, `src/lib/constants.ts`, `src/components/PageCanvas.tsx`, `src/components/Ruler.tsx`, `src/editor/extensions.ts`, `src/editor/actions.ts`, `src/lib/docx.ts`, `src/styles/word.css`

Evidence notation: `[L hh:mm:ss]` = Layout video; `[D hh:mm:ss]` = Design video. Timestamps refer to the frame table in §9. Statements not directly visible in the videos are marked **[standard Word UI]** and are based on Word's shipping dialogs and Microsoft documentation.

---

## 0. Scope, assumptions, and confidence

### 0.1 What this document specifies

1. Exact left-to-right ribbon order for both tabs, including group boundaries, control types, menu launchers, and dialog launchers.
2. Full contents of every dropdown, gallery, menu, and popover needed to reproduce the tab.
3. Field-by-field contents, options, and defaults for Page Setup, Watermark, Borders and Shading, Columns, Line Numbers, Hyphenation, Paragraph, Fill Effects, and theme customization dialogs.
4. Units, apply-to scoping, live-preview behavior, and reflow/print consequences.
5. A gap analysis against the current app, with severity.
6. A 30-row frame-capture table.

### 0.2 Version assumptions

- Ribbon is the Word 2013+ single-row ribbon with tabs `File Home Insert Draw Design Layout References Mailings Review View Help` (some builds omit Draw/Mailings depending on license).
- Default document is Letter, portrait, 1" margins, one column, 11–12 pt body text, single-section.
- Theme/style-set/effect names are version-dependent. Word 2013–2019, Word 2021/2024, and Microsoft 365 do not expose identical galleries. The videos show a theme named **Gallery** and a style set the narrator calls **Basic/Elegant**. Those names are treated as observed examples, not universal constants.
- Paper-size lists depend on the selected printer driver and locale. The list in §2.5 is the common US/Office list.
- Word can display measurements in inches, centimeters, millimeters, points, or picas. This spec uses inches and points because the videos and target app use US English.

### 0.3 Confidence markers

| Area | Confidence | Notes |
|---|---|---|
| Ribbon group order and control order | High | Visible in both videos and stable across Word 2013–365 |
| Margin preset values, page sizes, dialog fields | High | Standard Word values |
| Line Numbers / Hyphenation / Columns dialog contents | High | Standard Word dialogs; not every field is opened in the video |
| Theme/style-set/effect gallery names | Medium | Version-dependent; only Gallery and a Basic/Elegant style set are named in the video |
| Exact responsive breakpoints of the ribbon | Low | Depends on window width, DPI, and Word build; do not pixel-copy |
| Watermark preset list | Medium | Core six presets are stable; some builds add/remove variants and the Office.com command |

---

## 1. Measurement, units, and scope model

### 1.1 Unit conversions

Word stores page geometry in twentieths of a point (twips) internally and displays it in the user's chosen measurement unit.

| Unit | Inches | Points | Pixels @ 96 DPI | Twips |
|---|---:|---:|---:|---:|
| 1 inch | 1 | 72 | 96 | 1440 |
| 1 point | 1/72 | 1 | 4/3 | 20 |
| 1 centimeter | 0.393701 | 28.3465 | 37.7953 | 566.929 |
| 1 millimeter | 0.0393701 | 2.83465 | 3.77953 | 56.6929 |
| 1 pica | 1/6 | 12 | 16 | 240 |

Practical conversions used by the app:

```
px = inches * 96
px = points * 96 / 72
px = cm * 96 / 2.54
twips = inches * 1440
twips = points * 20
```

The current app stores margins and page dimensions in CSS pixels at 96 DPI. Word UI stores/display inches. All new UI should expose inches (or the user's chosen unit) and convert at the model boundary.

### 1.2 Display precision and units

| Measurement | Word display | Typical editing step | Notes |
|---|---|---|---|
| Margins, gutter, header/footer distance, indent | inches to 0.01" (e.g. 1.25") | 0.1" spinner | Typing arbitrary values allowed; negative indents allowed |
| Paper width/height | inches to 0.01" | 0.1" | Custom size becomes "Custom" |
| Column width/spacing | inches to 0.01" | 0.1" | Equal-width lock changes widths together |
| Paragraph spacing before/after | points, integer (e.g. 8 pt) | 6 pt spinner | `Auto` is available only in the Paragraph dialog |
| Line spacing | multiple to 0.01 (1.08) or points for At least/Exactly | 0.01 / 1 pt | Single/1.5/Double/At least/Exactly/Multiple |
| Font size | points, 0.5 pt steps in the size box | 1 pt spinner; typing 0.5 allowed | Theme fonts can be any installed size |
| Border width | fixed point list, 0.25–6 pt | list selection | Art borders ignore width |
| Watermark font size | points or `Auto` | list/typing | Auto scales to page |
| Hyphenation zone | inches, 0.25" default | 0.01" | Larger zone = fewer hyphens |
| Line-number count/start | integers | 1 | `Count by` creates intervals |

Word's unit display is controlled by **File > Options > Advanced > Display > Show measurements in units of** (Inches, Centimeters, Millimeters, Points, Picas). Changing it changes display only; it does not convert the document. The app has no such preference.

### 1.3 Apply-to scopes

Word layout is section-based. A document has at least one section; section breaks store page size, orientation, margins, gutter, columns, line numbering, headers/footers, and page borders. Every Layout command resolves to one of these scopes:

| Scope | Meaning | Where it appears |
|---|---|---|
| Whole document | Every section | Page Setup, Columns, Line Numbers |
| This section | Only the section containing the insertion point | Page Setup, Borders and Shading |
| This point forward | Current section from cursor to its end; Word inserts/uses a section break as needed | Page Setup, Columns |
| Selected sections | Sections touched by a multi-section selection | Page Setup |
| Selected text | Text selection instead of whole paragraphs/section | Page Setup Margins/Paper, Columns |
| This section – First page only | Page border on first page of section | Page Borders |
| This section – All except first page | Page border on subsequent pages | Page Borders |

The current app has no section model, so any command that promises "This section" or "This point forward" is unimplementable until sections exist. See §6.3.

### 1.4 Live preview and commit semantics

Word galleries (Themes, Style Set, Colors, Fonts, Paragraph Spacing, Effects, Margins, Size, Columns, Watermark presets) apply a **temporary live preview** on hover:

- Hovering a gallery tile previews the result in the document without changing document state.
- Moving the pointer off the gallery, pressing `Esc`, or clicking outside reverts the preview.
- Clicking commits the choice; the gallery closes.
- Dialog-based changes preview in the dialog's own Preview pane; most apply to the document only on **OK**. Page Setup's preview pane updates immediately.
- Ribbon numeric fields commit on `Enter` or on blur; arrow spinners commit immediately. `Esc` restores the previous value.

The current app has click-only application, no hover preview, and several controls that only show a toast (§6).

---

## 2. Layout tab

### 2.1 Exact ribbon order

Layout has exactly **three groups**, left to right:

```
┌─ Page Setup ───────────────────────────────────────────────┐ ┌─ Paragraph ──────────────┐ ┌─ Arrange ──────────────────────────────┐
│ Margins │ Orientation │ Size │ Columns │ Breaks │           │ │ Indent      Spacing      │ │ Position │ Wrap Text │ Bring Forward │ ... │
│         │             │      │         │        │ Line      │ │ Left: 0"    Before: 0 pt │ │ Send Backward │ Selection Pane │ ...  │
│         │             │      │         │        │ Numbers   │ │ Right: 0"   After: 8 pt  │ │ Align │ Group │ Rotate             │
│         │             │      │         │        │ Hyphenation│ │                         │ │                                        │
│                                                         [launcher]                    [launcher]                                       │
└────────────────────────────────────────────────────────────┘ └──────────────────────────┘ └────────────────────────────────────────┘
```

| # | Group | Control | Control type | Opens | Default state |
|---:|---|---|---|---|---|
| 1 | Page Setup | Margins | Menu button with caret and page thumbnail icon | Margins gallery | Normal (1" all) |
| 2 | Page Setup | Orientation | Menu button with caret and page icon | Portrait / Landscape menu | Portrait |
| 3 | Page Setup | Size | Menu button with caret and page icon | Paper-size list + More Paper Sizes… | Letter 8.5 × 11" |
| 4 | Page Setup | Columns | Menu button with caret and column icon | One/Two/Three/Left/Right + More Columns… | One |
| 5 | Page Setup | Breaks | Menu button with caret and break icon | Page/Column/Text Wrapping/section breaks | — |
| 6 | Page Setup | Line Numbers | Menu button with caret and numbered-lines icon | Line-number modes + options | None |
| 7 | Page Setup | Hyphenation | Menu button with caret and hyphen icon | None/Automatic/Manual + options | None |
| 8 | Page Setup | Dialog Box Launcher | Small diagonal-arrow launcher, bottom-right of group | Page Setup dialog | — |
| 9 | Paragraph | Indent Left | Numeric field, label `Left:` | — | 0" |
| 10 | Paragraph | Indent Right | Numeric field, label `Right:` | — | 0" |
| 11 | Paragraph | Spacing Before | Numeric field, label `Before:` | — | 0 pt |
| 12 | Paragraph | Spacing After | Numeric field, label `After:` | — | 8 pt (Normal style) |
| 13 | Paragraph | Dialog Box Launcher | Small diagonal-arrow launcher | Paragraph dialog | — |
| 14 | Arrange | Position | Menu button with caret | Position gallery | In Line with Text |
| 15 | Arrange | Wrap Text | Menu button with caret | Wrap Text menu | In Line with Text |
| 16 | Arrange | Bring Forward | Split button: main click brings forward one layer; caret opens menu | Bring Forward menu | — |
| 17 | Arrange | Send Backward | Split button: main click sends backward one layer; caret opens menu | Send Backward menu | — |
| 18 | Arrange | Selection Pane | Toggle button | Selection task pane | Off |
| 19 | Arrange | Align | Menu button with caret | Align menu + grid options | — |
| 20 | Arrange | Group | Menu button with caret | Group/Ungroup/Regroup | — |
| 21 | Arrange | Rotate | Menu button with caret | Rotate/flip menu | — |

Notes:

- The app currently has **nine groups** (`Margins`, `Orientation`, `Size`, `Columns`, `Breaks`, `Indent`, `Spacing`, `Line Spacing`, `Arrange`) rather than Word's three. Word nests Margins through Hyphenation inside Page Setup and the four numeric fields inside Paragraph.
- Word has **no Line Spacing group in Layout**. Line spacing is controlled from Home > Line and Paragraph Spacing or from the Paragraph dialog. The app's extra group is nonstandard.
- The Page Setup and Paragraph launchers sit at the bottom-right of their groups and must remain visible even when the group is collapsed.
- At narrow window widths Word drops labels and stacks controls; the Arrange group may collapse into a single **Arrange** menu. Do not model this as arbitrary overflow: the tabs must remain three groups with accessible launchers. Exact breakpoints are version/DPI-dependent and are not specified.

### 2.2 Margins

#### 2.2.1 Margins gallery

Clicking **Margins** opens a gallery of page thumbnails. Each item shows a miniature page with the printable area shaded blue; the current preset is highlighted/checked. The label sits to the right of the thumbnail. The gallery is ordered as below, with **Custom Margins…** separated at the bottom by a divider.

| Order | Preset | Top | Bottom | Left | Right | App px (96 DPI) |
|---:|---|---:|---:|---:|---:|---|
| 1 | Normal | 1" | 1" | 1" | 1" | 96 / 96 / 96 / 96 |
| 2 | Narrow | 0.5" | 0.5" | 0.5" | 0.5" | 48 / 48 / 48 / 48 |
| 3 | Moderate | 1" | 1" | 0.75" | 0.75" | 96 / 96 / 72 / 72 |
| 4 | Wide | 1" | 1" | 2" | 2" | 96 / 96 / 192 / 192 |
| 5 | Mirrored | 1" | 1" | Inside 1.25" | Outside 1" | 96 / 96 / 120 / 96 |
| 6 | Office 2003 Default | 1" | 1" | 1.25" | 1.25" | 96 / 96 / 120 / 120 |
| 7 | Custom Margins… | — | — | — | — | Opens Page Setup > Margins |

Details:

- **Mirrored** changes the page model to mirror margins. The field labels become **Inside** and **Outside**, not Left/Right. Inside = 1.25", Outside = 1". The current app stores `left: 120, right: 96` but keeps a normal (non-mirrored) page model, so even pages are not mirrored.
- Word's Margins gallery does not show a numeric summary; only the thumbnail and preset name are visible. The Page Setup dialog shows numbers.
- The gallery's active check must compare all four values (and mirror state), not only top/left/right. The app currently omits bottom from the comparison.
- Choosing a preset applies to the whole document by default. If the document has multiple sections and the insertion point is in one section, Word applies to that section; the gallery itself has no apply-to control.
- Hovering a preset gives a live page preview; the document reflows immediately on click.
- Dragging the gray margin boundaries on the horizontal/vertical ruler is an alternate way to change margins. The current app's ruler is **display-only** (`Ruler.tsx` renders tick marks and boundary divs with no pointer handlers), so the app's "use the rulers to drag margins" toast is false guidance.

#### 2.2.2 Custom Margins

`Custom Margins…` opens **Page Setup** on the **Margins** tab (§2.3.1). It must not show a toast.

### 2.3 Page Setup dialog

The Page Setup dialog is the single source of truth for page geometry. It has three tabs: **Margins**, **Paper**, **Layout**.

Common chrome:

- Title: `Page Setup`
- Tabs across the top: `Margins | Paper | Layout`
- Preview panel on the right side of all tabs: a miniature first page and, when `Multiple pages` is not Normal, a two-page spread. The preview updates immediately as fields change.
- Bottom buttons: `OK` (default), `Cancel`, `Set As Default…`
- The Paper tab adds `Print Options…` at bottom-left.
- `Apply to` is present on every tab; its option list is context-sensitive.
- `Set As Default…` asks for confirmation and saves the current page setup to the attached template (normally `Normal.dotm`) so new documents inherit it. It does not retroactively change other open documents.

#### 2.3.1 Margins tab

| Field | Control | Default | Options / range | Notes |
|---|---|---|---|---|
| Top | Numeric + spinner | 1" | ≥ 0; can exceed page with warning | Inches/cm per user unit |
| Bottom | Numeric + spinner | 1" | ≥ 0 | |
| Left | Numeric + spinner | 1" | ≥ 0 | Becomes **Inside** when mirrored |
| Right | Numeric + spinner | 1" | ≥ 0 | Becomes **Outside** when mirrored |
| Gutter | Numeric + spinner | 0" | ≥ 0 | Extra binding space added to the inside/left edge |
| Gutter position | Dropdown | Left | `Left`, `Top` | `Top` is typically used for landscape/top-bound documents |
| Orientation | Radio pair with page icons | Portrait | `Portrait`, `Landscape` | Mirrors the Orientation ribbon menu |
| Multiple pages | Dropdown | Normal | `Normal`, `Mirror margins`, `2 pages per sheet`, `Book fold` | Changes preview and enables `Sheets per booklet` for Book fold |
| Sheets per booklet | Dropdown | Auto/1 | 1, 2, 4, 8, 16, 32 | Visible only for `Book fold`; controls booklet imposition |
| Apply to | Dropdown | Whole document | Whole document; This section; This point forward; Selected sections; Selected text | Options appear only when applicable |
| Preview | Live page thumbnail | — | — | Shows margin/gutter shading and facing pages when mirrored/2-up |

Behavior notes:

- With **Mirror margins**, Left/Right labels change to **Inside/Outside** and the preview shows a facing-page spread. Odd pages use Outside on the right; even pages use Outside on the left. Margins alternate on every page.
- **2 pages per sheet** prints two logical pages on one physical sheet. Header/footer and page numbering remain per logical page. Page size is not halved in the Size list; the preview shows the imposition.
- **Book fold** configures a booklet: landscape sheet, two pages per sheet, and `Sheets per booklet`. Word may change orientation automatically.
- **Gutter position: Top** adds the gutter to the top edge; with mirrored margins the gutter normally goes to the inside edge, so Word may constrain or reinterpret the control. Validate against Word for mirror + top gutter before implementing.
- Margin values are independent of orientation: switching portrait/landscape does not swap Top/Bottom with Left/Right. Content reflows into the new printable width.
- Word warns when margins are larger than the page or when the header/footer distance plus content leaves no body area. It does not silently clamp them.

#### 2.3.2 Paper tab

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Paper size | Dropdown | Letter | Common sizes + `Custom` | The ribbon's `More Paper Sizes…` opens this tab; the list is printer-dependent |
| Width | Numeric | 8.5" | 0.1"–22" (Word limit; printer may be smaller) | Editing makes Paper size `Custom` |
| Height | Numeric | 11" | 0.1"–22" | |
| Orientation | Radio pair | Portrait | Portrait / Landscape | Shared with Margins tab |
| Paper source – First page | Dropdown | Automatically Select / printer default | Printer trays | Printer-driver dependent |
| Paper source – Other pages | Dropdown | Automatically Select / printer default | Printer trays | |
| Apply to | Dropdown | Whole document | Same scope list as Margins | |
| Preview | Live page thumbnail | — | — | Shows dimensions and orientation |
| Print Options… | Button | — | Opens Word Options > Display > Printing options | Not a page-geometry setting |
| Set As Default… | Button | — | Confirmation | Saves to template |
| OK / Cancel | Buttons | OK default | — | |

#### 2.3.3 Layout tab

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Section start | Dropdown | New page | `New page`, `Continuous`, `Even page`, `Odd page`, `New column` | `New column` is used for sections inside multi-column layouts |
| Different odd and even | Checkbox | Off | On/Off | Creates separate odd/even headers and footers for the section |
| Different first page | Checkbox | Off | On/Off | Creates a first-page header/footer; affects page-border apply-to options |
| Header | Numeric | 0.5" | ≥ 0 | Distance from the top edge of the paper to the header |
| Footer | Numeric | 0.5" | ≥ 0 | Distance from the bottom edge of the paper to the footer |
| Vertical alignment | Dropdown | Top | `Top`, `Center`, `Bottom`, `Justified` | Aligns body text between the top and bottom margins; `Justified` distributes paragraphs |
| Line Numbers… | Button | — | Opens Line Numbers dialog | Current setting summarized on the button/tooltip |
| Borders… | Button | — | Opens Borders and Shading > Page Border | Page border is a section property |
| Apply to | Dropdown | Whole document | Whole document; This section; This point forward; Selected sections; Selected text | |
| Preview | Live page thumbnail | — | — | Shows section start, header/footer zones, border |
| Set As Default… | Button | — | Confirmation | |

Behavior notes:

- Section start applies at the beginning of the section containing the cursor. Changing it can move the section to the next/previous page.
- Header/Footer distances are measured from the paper edge, not from the margin. A 0.5" header with a 1" top margin leaves 0.5" between header and body; increasing the header distance can push body text down.
- `Different first page` and `Different odd and even` create additional header/footer stories. They also enable `This section – First page only` and `This section – All except first page` in the Page Border dialog.
- `Vertical alignment: Justified` only has a visible effect when the section's text does not fill the page; it stretches paragraphs vertically between margins.

### 2.4 Orientation

- Ribbon control: a menu button (not a toggle). The button displays the current page orientation icon and the label `Orientation`, with a caret. Clicking it opens a two-item menu with page thumbnails:
  - `Portrait`
  - `Landscape`
- The active orientation has a check/highlight.
- Clicking an item rotates the page: width and height swap visually. Margins keep their numeric values but their physical edges move with the rotation (top remains the top edge of the rotated page).
- Headers/footers stay at the top/bottom of the rotated page; gutter position may need to change (Word does not force it).
- Applies to the whole document/section per Word's current selection scope. The ribbon menu has no apply-to control.
- Hovering a menu item gives a live preview in Word. The app currently toggles orientation on button click and has separate Portrait/Landscape small buttons, which is not the Word control shape.

### 2.5 Size

- Ribbon control: menu button with a page icon, label `Size`, and caret.
- Menu is a single-column list. Each row shows the paper name and dimensions; a check marks the current size. A divider separates **More Paper Sizes…** at the bottom.
- Common US/Office order and dimensions:

| Order | Name | Dimensions (in) | Dimensions (mm) | App px (96 DPI) |
|---:|---|---|---|---|
| 1 | Letter | 8.5 × 11 | 215.9 × 279.4 | 816 × 1056 |
| 2 | Legal | 8.5 × 14 | 215.9 × 355.6 | 816 × 1344 |
| 3 | Tabloid | 11 × 17 | 279.4 × 431.8 | 1056 × 1632 |
| 4 | Ledger | 17 × 11 | 431.8 × 279.4 | 1632 × 1056 |
| 5 | Statement | 5.5 × 8.5 | 139.7 × 215.9 | 528 × 816 |
| 6 | Executive | 7.25 × 10.5 | 184.15 × 266.7 | 696 × 1008 |
| 7 | A3 | 11.69 × 16.54 | 297 × 420 | 1123 × 1587 |
| 8 | A4 | 8.27 × 11.69 | 210 × 297 | 794 × 1123 |
| 9 | A5 | 5.83 × 8.27 | 148 × 210 | 559 × 794 |
| 10 | A6 | 4.13 × 5.83 | 105 × 148 | 397 × 559 |
| 11 | B4 (JIS) | 10.12 × 14.33 | 257 × 364 | 971 × 1376 |
| 12 | B5 (JIS) | 7.17 × 10.12 | 182 × 257 | 688 × 971 |
| 13 | 16K | 7.24 × 10.24 | 184 × 260 | 695 × 983 |
| 14 | Envelope #10 | 4.125 × 9.5 | 104.8 × 241.3 | 396 × 912 |
| 15 | Envelope DL | 4.33 × 8.66 | 110 × 220 | 416 × 832 |
| 16 | Envelope C5 | 6.38 × 9.02 | 162 × 229 | 612 × 866 |
| 17 | Envelope B5 | 6.93 × 9.84 | 176 × 250 | 665 × 945 |
| 18 | Envelope Monarch | 3.875 × 7.5 | 98.4 × 190.5 | 372 × 720 |
| 19 | Envelope 6¾ | 3.625 × 6.5 | 92.1 × 165.1 | 348 × 624 |
| 20 | Envelope 9 | 3.875 × 8.875 | 98.4 × 225.4 | 372 × 852 |
| 21 | More Paper Sizes… | — | — | Opens Page Setup > Paper |

Notes:

- The list is filtered by the active printer's supported sizes in real Word; a web implementation should use the full common list and a custom size fallback.
- Selecting a size changes page dimensions but does **not** scale existing text, tables, or images. Content reflows; it is not "fit to page."
- `More Paper Sizes…` opens Page Setup on the Paper tab, where Width/Height and orientation can be set and the paper source chosen.
- A custom width/height makes the Paper size field read `Custom` (or `Custom size`). The app needs a numeric custom-size path, not just six presets.
- The app currently lists Letter, Legal, A4, A3, A5, Tabloid only, mixes inch and cm labels, and has no custom size or More Paper Sizes path.

### 2.6 Columns

#### 2.6.1 Columns gallery

Clicking **Columns** opens a gallery of page thumbnails. Each thumbnail shows the page divided into shaded columns.

| Order | Preset | Result |
|---:|---|---|
| 1 | One | Single full-width column |
| 2 | Two | Two equal columns |
| 3 | Three | Three equal columns |
| 4 | Left | Narrow left column + wide right column |
| 5 | Right | Wide left column + narrow right column |
| 6 | More Columns… | Opens the Columns dialog |

- Current preset is checked.
- Presets are page-level thumbnails, not icons of vertical bars.
- The app currently offers One/Two/Three/Four in the quick menu. `Four` is not in Word's quick gallery (four columns are reachable through More Columns), and Left/Right are missing.
- Hover gives live preview; click applies.

#### 2.6.2 More Columns dialog

Title: `Columns`

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Presets | Row of five page thumbnails | One | One, Two, Three, Left, Right | Clicking a preset fills the fields |
| Number of columns | Numeric | 1 | 1–45 (Word practical maximum) | Overrides preset |
| Width and spacing | Table with rows `1..N`, columns `Width`, `Spacing` | Equal widths, 0.5" spacing | ≥ 0.1" | Each column has its own width/spacing when `Equal column width` is off |
| Equal column width | Checkbox | Checked | On/Off | When checked, editing one width/spacing updates all; off allows asymmetric columns |
| Line between | Checkbox | Off | On/Off | Draws a vertical rule between columns |
| Preview | Live page thumbnail | — | — | Shows widths, spacing, rule |
| Apply to | Dropdown | Whole document | `Whole document`, `This point forward`, `Selected text` (when text is selected) | `This point forward` may insert a section break |
| OK / Cancel | Buttons | OK | — | |

Behavior notes:

- Default spacing in Word is 0.5". The app uses a CSS `column-gap: 0.4in`, which is not Word's default.
- `Left` and `Right` presets create unequal columns; the exact widths depend on the printable width. They are not simply "column count 2."
- Column layout applies to the section. Text flows from the bottom of one column to the top of the next. A column break forces the next content to the next column.
- `Line between` is a vertical line centered in the spacing; it is not a paragraph border.
- Columns interact with line numbers (numbers restart per column/page depending on line-number mode), footnotes (Word balances columns at the end of a section), and section breaks.
- The app applies `columnCount` to the whole `.doc-body` and cannot scope columns to a section or a point forward.

### 2.7 Breaks

Clicking **Breaks** opens a menu with grouped items and separators:

| Group | Item | Shortcut | Behavior |
|---|---|---|---|
| Page Breaks | Page | Ctrl+Enter | Ends the current page; following content starts at the top of the next page |
| Column Breaks | Column | Ctrl+Shift+Enter | Ends the current column; following content starts at the top of the next column (in a one-column layout this moves to the next page) |
| Section Breaks | Next Page | — | Starts a new section on the next page; new section inherits page setup but can be changed independently |
| Section Breaks | Continuous | — | Starts a new section on the same page; used to change columns, margins, or orientation mid-page without a page break |
| Section Breaks | Even Page | — | Starts a new section on the next even-numbered page; inserts a blank page if needed |
| Section Breaks | Odd Page | — | Starts a new section on the next odd-numbered page; inserts a blank page if needed |
| Text Wrapping | Text Wrapping | — | Separates text from a floating object so text can wrap around it; not a page/section break |

Notes:

- In the menu these are separated by thin rules; `Page`, `Column`, and `Text Wrapping` are single items, while the four section breaks form a labeled subgroup. Word's exact use of headers vs. separators varies by version; preserve the grouping.
- A page break is a character-level break inside a paragraph in Word's model (`w:br type="page"`), not a standalone block. It does not create a new section and does not carry page setup.
- A section break stores a copy of the previous section's properties; changing margins/orientation after the break affects only the new section.
- `Text Wrapping` is enabled when a floating object is selected/adjacent; it inserts a wrap break rather than moving content to another page.
- The app currently ignores the menu entirely: clicking `Breaks` immediately inserts a `pageBreak` node. It has no column/section/text-wrapping breaks and no actual pagination; the node renders as a 24 px dashed line labeled "Page Break" (`word.css:1235-1253`).

### 2.8 Line Numbers

#### 2.8.1 Line Numbers menu

| Order | Item | Behavior |
|---:|---|---|
| 1 | None | Turns line numbering off for the scope |
| 2 | Continuous | Numbers every line sequentially through the document/section |
| 3 | Restart Each Page | Resets to the start number on each page |
| 4 | Restart Each Section | Resets at each section |
| 5 | Suppress for Current Paragraph | Excludes the paragraph at the cursor from numbering (paragraph property) |
| 6 | Line Numbering Options… | Opens the Line Numbers dialog |

- The current mode is checked. If line numbering is off, `None` is checked and the suppress item is disabled/irrelevant.
- The menu applies to the whole document by default; the dialog exposes section-level apply-to.

#### 2.8.2 Line Numbers dialog

Title: `Line Numbers`

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Add line numbering | Checkbox | Unchecked | On/Off | Master switch; disables other fields when off |
| Start at | Numeric | 1 | ≥ 0 | First number printed |
| From text | Numeric + `Auto` checkbox | Auto | 0"–? | Distance from the left margin/text to the number; `Auto` uses Word's automatic offset |
| Count by | Numeric | 1 | 1–100 | Prints a number every N lines (e.g. 2 numbers every other line) |
| Numbering | Radio group | Continuous | Continuous; Restart each page; Restart each section | Mirrors menu modes |
| Apply to | Dropdown | Whole document | Whole document; Selected sections | Available only with a multi-section selection |
| OK / Cancel | Buttons | OK | — | |

Behavior notes:

- Line numbers print in the left margin, outside the text area, and are visible in Print Layout. They do not appear in Web Layout/Read Mode.
- Headers, footers, footnotes, endnotes, text boxes, frames, and table content are not numbered. A table may count as one line for numbering purposes; verify against Word before implementing.
- If `Count by` is 2, Word prints a number at every second line. Verify whether the printed sequence is 1, 2, 3 (renumbered) or 1, 3, 5 (original line positions) against a live document before locking the algorithm.
- `Suppress for Current Paragraph` sets a paragraph-level exception and is preserved when numbering restarts.
- Very large documents can exceed three digits; Word does not truncate but may overlap the text if `From text` is too small.
- The app has no Line Numbers control, dialog, model field, or rendering.

### 2.9 Hyphenation

#### 2.9.1 Hyphenation menu

| Order | Item | Behavior |
|---:|---|---|
| 1 | None | Turns automatic hyphenation off; does not remove existing manual hyphens |
| 2 | Automatic | Word hyphenates words at line ends using the document language dictionary |
| 3 | Manual | Walks the document and asks the user to accept/reject each suggested hyphen |
| 4 | Hyphenation Options… | Opens the Hyphenation dialog |

- Current mode is checked.
- `Manual` opens the **Manual Hyphenation** dialog immediately (or after a "Hyphenate the document?" prompt, depending on version).

#### 2.9.2 Manual Hyphenation dialog

Title: `Manual Hyphenation`

| Field | Control | Behavior |
|---|---|---|
| Word | Static text with a suggested break marked | Shows the word and the proposed hyphen position, e.g. `hy-phen-ation` |
| Hyphenate at | Editable text/numeric position | Lets the user move the break point |
| Yes | Button | Accepts the hyphen and advances to the next word |
| No | Button | Skips the word and advances |
| Cancel | Button | Stops the manual pass |

Word may first ask whether to hyphenate from the cursor to the end of the document or the whole document; the exact prompt is version-dependent.

#### 2.9.3 Hyphenation Options dialog

Title: `Hyphenation`

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Automatically hyphenate document | Checkbox | Unchecked | On/Off | Enables automatic hyphenation globally |
| Hyphenate words in CAPS | Checkbox | Unchecked | On/Off | Off avoids hyphenating acronyms/headings |
| Hyphenation zone | Numeric | 0.25" | ≥ 0 | Maximum gap between the end of a word and the right margin before Word hyphenates; larger zone = fewer hyphens |
| Limit consecutive hyphens to | Numeric with `No limit` | No limit | 1–? or No limit | Limits hyphenated line endings in a row |
| OK / Cancel | Buttons | OK | — | |

Behavior notes:

- Automatic hyphenation is language-dependent. Words in a language without a hyphenation dictionary are not hyphenated.
- Hyphenation reflows text and therefore changes line/page breaks and line numbering.
- Manual hyphenation inserts optional hyphens (nonprinting unless the line breaks there); they remain if automatic hyphenation is later disabled.
- The hyphenation zone is a property of the document/section, not the paragraph.
- The app has no hyphenation control, dictionary, optional-hyphen model, or reflow logic.

### 2.10 Paragraph group

#### 2.10.1 Indent fields

| Field | Unit | Default | Step | Range | Behavior |
|---|---|---:|---:|---|---|
| Left | in/cm | 0" | 0.1" | negative allowed (into margin) | Indents the paragraph's left edge relative to the left margin |
| Right | in/cm | 0" | 0.1" | negative allowed | Indents the paragraph's right edge relative to the right margin |

- Fields show the current paragraph's values. With a mixed selection, Word shows a blank field (or an indeterminate state).
- `Enter` commits and moves focus; `Tab` moves between fields; `Esc` restores.
- Left/Right apply to all paragraphs touched by the selection, including paragraphs partially selected.
- Do **not** reuse one value for both sides. The app's `Indent` extension renders `margin-left` and `margin-right` from the same `indent` attribute (`extensions.ts:87-98`), so the "Left" field actually indents both sides. The "Right" field is a toast-only no-op (`LayoutTab.tsx:115-118`).
- Negative indents are legal in Word; the app clamps to `min={0}` and `Math.max(0, ...)`.

#### 2.10.2 Spacing fields

| Field | Unit | Default | Step | Behavior |
|---|---|---:|---:|---|
| Before | pt | 0 pt | 6 pt | Space above each selected paragraph |
| After | pt | 8 pt (Normal style) | 6 pt | Space below each selected paragraph |

- `Auto` is not available in the ribbon fields; it is available in the Paragraph dialog. Word shows `Auto` below 0 in the Paragraph dialog's spacing fields.
- Values are per paragraph, not global. A mixed selection shows blank/indeterminate.
- The app stores one global `paragraphBefore` / `paragraphAfter` value and applies it to every `p` via CSS variables (`App.tsx:53-54, 96-97`; `word.css:1146,1182`). Selecting one paragraph and changing spacing changes the whole document, which is not Word behavior.

#### 2.10.3 Paragraph dialog launcher

The launcher at the bottom-right of the Paragraph group opens the **Paragraph** dialog. This is the full formatting dialog, with two tabs.

**Indents and Spacing tab**

| Field | Control | Default (Normal) | Options | Notes |
|---|---|---|---|---|
| Alignment | Dropdown | Left | Left, Centered, Right, Justified | Same as Home alignment |
| Outline level | Dropdown | Body Text | Body Text, Level 1–9 | Affects navigation/TOC, not visual indentation by itself |
| Left | Numeric | 0" | negative allowed | Paragraph indent |
| Right | Numeric | 0" | negative allowed | |
| Special | Dropdown | None | None, First line, Hanging | |
| By | Numeric | 0.5" when Special is First line/Hanging | ≥ 0 | Hanging indent amount |
| Mirror indents | Checkbox | Off | On/Off | Swaps left/right indents on even pages; used with mirrored margins |
| Before | Numeric | 0 pt | Auto, ≥ 0 | |
| After | Numeric | 8 pt | Auto, ≥ 0 | |
| Line spacing | Dropdown | Multiple 1.08 (modern Normal) or Single | Single, 1.5 lines, Double, At least, Exactly, Multiple | |
| At | Numeric | 12 pt for At least/Exactly; 1.08 for Multiple | Depends | Enabled only for At least/Exactly/Multiple |
| Don't add space between paragraphs of the same style | Checkbox | Off | On/Off | Suppresses before/after between same-style paragraphs (common in lists) |
| Snap to grid when document grid is defined | Checkbox | Off/varies | On/Off | Aligns the paragraph to the document grid; only meaningful when a grid is defined |
| Preview | Live sample | — | — | Shows indents/spacing |
| Tabs… | Button | — | Opens Tabs dialog | Tab stops, alignment, leader |
| Set as Default | Button | — | Confirmation | Applies to Normal style/template |
| OK / Cancel | Buttons | OK | — | |

**Line and Page Breaks tab**

| Field | Control | Default | Notes |
|---|---|---|---|
| Widow/Orphan control | Checkbox | On | Prevents a single line at the top/bottom of a page |
| Keep with next | Checkbox | Off | Keeps the paragraph with the following paragraph |
| Keep lines together | Checkbox | Off | Prevents the paragraph from splitting across pages |
| Page break before | Checkbox | Off | Starts the paragraph on a new page |
| Suppress line numbers | Checkbox | Off | Excludes the paragraph from line numbering |
| Don't hyphenate | Checkbox | Off | Excludes the paragraph from automatic hyphenation |
| Textbox: Convert auto | Checkbox | Off | Version/feature-dependent; converts a text box to a frame |
| OK / Cancel | Buttons | OK | — |

Notes:

- The Paragraph dialog is the only place to set `Auto` spacing, first-line/hanging indents, mirror indents, pagination controls, and line spacing in points/multiples.
- Word's Layout tab is a shortcut surface; the dialog remains the complete editor.
- The app has no Paragraph dialog and no per-paragraph spacing/indent-right/pagination model.

### 2.11 Arrange group

Arrange operates on **floating objects** (pictures, shapes, text boxes, charts, tables with text wrapping). When no object is selected, Word disables almost all Arrange controls. The app's controls are always enabled and only show toasts.

#### 2.11.1 Position

Gallery of ten items:

| Order | Item | Behavior |
|---:|---|---|
| 1 | In Line with Text | Removes floating positioning; object behaves like a character in the paragraph |
| 2 | Position in Top Left with Square Text Wrapping | Floats to top-left of the text column/page with square wrap |
| 3 | Position in Top Center with Square Text Wrapping | |
| 4 | Position in Top Right with Square Text Wrapping | |
| 5 | Position in Middle Left with Square Text Wrapping | |
| 6 | Position in Middle Center with Square Text Wrapping | |
| 7 | Position in Middle Right with Square Text Wrapping | |
| 8 | Position in Bottom Left with Square Text Wrapping | |
| 9 | Position in Bottom Right with Square Text Wrapping | |
| 10 | More Layout Options… | Opens Layout dialog > Position tab |

- The nine position tiles are laid out as a 3×3 grid; `In Line with Text` is a wider item above/below the grid.
- Each tile has a small object/page diagram showing the anchor position.
- `More Layout Options…` opens the **Layout** dialog:
  - **Position tab**: Horizontal (`Alignment` or absolute position; relative to Margin/Page/Column/Character/Line; `Move with text`; `Lock anchor`), Vertical (Alignment/absolute; relative to Margin/Page/Paragraph/Line; `Move with text`; `Lock anchor`), `Allow overlap`, `Layout in table cell`.
  - **Text Wrapping tab**: wrapping style (In line with text, Square, Tight, Through, Top and bottom, Behind text, In front of text), wrap text (Both sides, Left only, Right only, Largest only), distance from text (Top, Bottom, Left, Right).
  - **Size tab**: height/width, rotation, scale, lock aspect ratio, relative to original size, reset.
- Changing Position from inline to floating creates an anchor; a floating object can overlap text/other objects and is stored in a drawing layer.

#### 2.11.2 Wrap Text

| Order | Item | Behavior |
|---:|---|---|
| 1 | In Line with Text | Object is inline; no text wrap |
| 2 | Square | Text wraps around the object's rectangular bounding box |
| 3 | Tight | Text follows the object's contour |
| 4 | Through | Text fills open areas inside the object's contour |
| 5 | Top and Bottom | No text on the sides; text stops above and resumes below |
| 6 | Behind Text | Object floats behind text; no wrap |
| 7 | In Front of Text | Object floats in front of text; no wrap |
| 8 | Edit Wrap Points | Shows draggable red wrap handles to customize the contour |
| 9 | More Layout Options… | Opens Layout dialog > Text Wrapping tab |

- Square/Tight/Through enable the `Distance from text` fields.
- `Edit Wrap Points` is only meaningful with Tight/Through and a non-rectangular object.
- `Behind Text` and `In Front of Text` are stacking modes as well as wrap modes; they interact with Bring/Send commands.

#### 2.11.3 Bring Forward / Send Backward

**Bring Forward** split button:

| Item | Behavior |
|---|---|
| Bring Forward | Moves the object one step toward the front of the stacking order |
| Bring to Front | Moves the object to the top of the object stack |
| Bring in Front of Text | Moves a floating object in front of body text but behind other floating objects (wrapped objects only) |

**Send Backward** split button:

| Item | Behavior |
|---|---|
| Send Backward | Moves the object one step toward the back |
| Send to Back | Moves the object to the bottom of the object stack |
| Send Behind Text | Moves a floating object behind body text but in front of other background objects (wrapped objects only) |

- Main button click performs the one-step command; caret opens the menu.
- The commands are disabled when no floating object is selected, and "in front of/behind text" items are disabled for inline objects.
- Stacking order is global per page/drawing layer, not per paragraph.

#### 2.11.4 Selection Pane

- Toggle button that opens a task pane on the right.
- Lists every floating object on the current page(s), topmost first (top of list = front of stack).
- Each row has:
  - Object name (editable by double-click or a rename command, version-dependent)
  - Show/hide eye toggle
  - Selection highlight when the object is selected
- Clicking a row selects the object; `Ctrl+click`/`Shift+click` multi-selects (version-dependent).
- Useful for selecting objects hidden behind text or other objects.
- The pane does not list inline images; those are selected in the text.
- The app has no object layer, object names, z-order, or task pane.

#### 2.11.5 Align

| Order | Item | Behavior |
|---:|---|---|
| 1 | Align Left | Aligns selected objects' left edges |
| 2 | Align Center | Aligns centers horizontally |
| 3 | Align Right | Aligns right edges |
| 4 | Align Top | Aligns top edges |
| 5 | Align Middle | Aligns centers vertically |
| 6 | Align Bottom | Aligns bottom edges |
| 7 | Distribute Horizontally | Equal horizontal spacing between 3+ objects |
| 8 | Distribute Vertically | Equal vertical spacing between 3+ objects |
| 9 | Align to Page | Relative target = page edges/center |
| 10 | Align to Margin | Relative target = text margins |
| 11 | Align Selected Objects | Relative target = bounding box of the selected objects |
| 12 | View Gridlines | Toggles drawing gridlines |
| 13 | Grid Settings… | Opens Grid and Guides dialog |

- Exactly one of `Align to Page`, `Align to Margin`, `Align Selected Objects` is checked. Word changes the default based on selection (multiple selected objects often auto-select `Align Selected Objects`); do not hard-code one without testing.
- `Distribute` requires at least three objects and is disabled otherwise.
- `View Gridlines` is a view toggle, not a document property.
- **Grid Settings…** (Grid and Guides) includes:
  - `Snap objects to grid`
  - `Snap objects to other objects`
  - `Grid settings`: Horizontal spacing (default 0.13"), Vertical spacing (0.13"), Horizontal origin (0"), Vertical origin (0")
  - `Gridlines`: `Display gridlines on screen`, `Horizontal every` (1), `Vertical every` (1)
  - `Use page margins` / `Use margins` (version-dependent)
  - OK/Cancel

#### 2.11.6 Group

| Item | Behavior |
|---|---|
| Group | Groups 2+ selected objects into one object; selection/formatting/moving applies to the group |
| Ungroup | Dissolves the selected group back into its child objects |
| Regroup | Re-forms the most recently ungrouped set |

- `Group` is disabled with fewer than two objects selected.
- Groups can be nested. A group behaves as a single object for Position/Wrap/Size; child objects retain relative positions.
- Ungrouping restores child z-order; regroup restores the previous grouping.
- The app has no group model.

#### 2.11.7 Rotate

| Item | Behavior |
|---|---|
| Rotate Right 90° | Rotates the object 90° clockwise |
| Rotate Left 90° | Rotates 90° counterclockwise |
| Flip Vertical | Mirrors top/bottom |
| Flip Horizontal | Mirrors left/right |
| More Rotation Options… | Opens Layout dialog > Size tab with Rotation in degrees |

- Rotation applies to floating objects and pictures; inline objects need to be converted to floating first.
- The Size tab's rotation field accepts arbitrary degrees (including negative), and rotation can be combined with flips.
- A rotation handle appears above a selected object for free rotation (Shift constrains to 15° increments).
- Rotating a group rotates all children around the group center.
- The app's Rotate button only toasts.

### 2.12 Layout keyboard and ruler behaviors

| Interaction | Behavior |
|---|---|
| Ctrl+Enter | Insert page break |
| Ctrl+Shift+Enter | Insert column break |
| Alt+Ctrl+Shift+S | Open Styles pane (not Layout, but relevant to Design) |
| Drag horizontal ruler margin boundary | Adjust left/right margin (Word); app ruler is display-only |
| Drag vertical ruler margin boundary | Adjust top/bottom margin (Word) |
| Drag indent markers on ruler | Adjust first-line/hanging/left/right indents (Word) |
| Double-click ruler margin | Open Page Setup > Margins (Word) |
| Alt while dragging ruler | Show precise measurements (Word) |
| Esc | Close gallery/dialog without applying; revert live preview |

The app's `Ruler.tsx` renders ticks and static margin boundary divs only. There are no drag handlers or indent markers.

---

## 3. Design tab

### 3.1 Exact ribbon order

Design has exactly **two groups**, left to right:

```
┌─ Document Formatting ───────────────────────────────────────────────────────┐ ┌─ Page Background ─────────────────────────┐
│ Themes │ Style Set │ Colors │ Fonts │ Paragraph Spacing │ Effects │ Set as Default │ │ Watermark │ Page Color │ Page Borders │
└─────────────────────────────────────────────────────────────────────────────┘ └───────────────────────────────────────────┘
```

| # | Group | Control | Control type | Opens | Default state |
|---:|---|---|---|---|---|
| 1 | Document Formatting | Themes | Large menu button with palette icon, label, caret | Theme gallery + footer actions | Office (or the document's attached theme) |
| 2 | Document Formatting | Style Set | Large menu button with `Aa`/type icon, label, caret | Style Set gallery | Current/default style set |
| 3 | Document Formatting | Colors | Large menu button with color icon, label, caret | Theme color-set gallery | Office/current theme colors |
| 4 | Document Formatting | Fonts | Large menu button with font icon, label, caret | Theme font-pair gallery | Office/current theme fonts |
| 5 | Document Formatting | Paragraph Spacing | Large menu button with spacing icon, label, caret | Preset menu + Custom Paragraph Spacing… | Default (current style set) |
| 6 | Document Formatting | Effects | Large menu button with effects icon, label, caret | Theme effects gallery | Office/current theme effects |
| 7 | Document Formatting | Set as Default | Small/large button with checkmark, label `Set as Default` | Confirmation Yes/No | — |
| 8 | Page Background | Watermark | Large menu button with droplet/page icon, caret | Watermark gallery | No watermark |
| 9 | Page Background | Page Color | Large menu button with paint-bucket/droplet icon, caret | Color palette | No Color |
| 10 | Page Background | Page Borders | Large button with page/border icon | Borders and Shading > Page Border | None |

Notes:

- Word groups **Colors, Fonts, Paragraph Spacing, Effects** inside Document Formatting. The app splits Document Formatting into two duplicate groups and places Effects after Page Background, which breaks group semantics and ribbon width.
- `Set as Default` is the last item in Document Formatting, after Effects, separated by a divider. It is not a gallery.
- `Themes` is the first and most prominent control; changing it cascades to Style Set, Colors, Fonts, Paragraph Spacing, and Effects.
- The app's Design tab has no Colors, Fonts, Paragraph Spacing, or Set as Default control at all.
- The app's Effects menu is actually **Text Effects** (None/Shadow/Reflection/Glow/Outline), which belongs to Home > Text Effects or Shape Format > Text Effects, not Design > Effects. Design > Effects is a theme effect-set gallery for shapes/objects.

### 3.2 Themes

#### 3.2.1 Gallery

- Large button + caret opens a gallery of theme tiles, typically 3–4 columns depending on width.
- Each tile contains:
  - A miniature document/page preview with a title in the theme heading font, body lines in the theme body font, and a row of theme accent color chips.
  - The theme name below the preview.
- The current theme has a highlighted border/check.
- Hovering a tile applies a **live preview to the entire document**: fonts, theme colors, effects, and style-dependent formatting update. Leaving the gallery/releasing hover reverts. Clicking commits.
- The gallery scrolls if there are more themes than fit.

Common theme names across Word 2013–365 include (version-dependent, not exhaustive):

`Office`, `Gallery`, `Aptos`, `Apex`, `Aspect`, `Berlin`, `Celestial`, `Circuit`, `Civic`, `Concourse`, `Damask`, `Depth`, `Dividend`, `Droplet`, `Equity`, `Facet`, `Feathered`, `Flow`, `Foundry`, `Frame`, `Integral`, `Ion`, `Ion Boardroom`, `Main Event`, `Median`, `Mesh`, `Metro`, `Metropolitan`, `Module`, `Mosaic`, `Opulent`, `Organic`, `Oriel`, `Origin`, `Oslo`, `Paper`, `Parallax`, `Quotable`, `Retrospect`, `Savon`, `Slice`, `Slate`, `Solstice`, `Technic`, `Tranquil`, `Trek`, `Urban`, `Vapor Trail`, `Verve`, `View`, `Wisp`, `Wood Type`.

The video observes the **Gallery** theme being applied `[D 00:01:20]`. Word 365's default is usually **Office**; modern builds add Aptos-era themes. Do not treat "Gallery" as the default.

#### 3.2.2 Theme gallery footer actions

At the bottom of the gallery, separated by a rule:

| Order | Item | Behavior |
|---:|---|---|
| 1 | Reset to Theme from Template | Restores the theme stored in the attached document template (often Office) |
| 2 | Browse for Themes… | File picker for a saved theme (`.thmx`) or theme-bearing Office file; applies it |
| 3 | Save Current Theme… | Saves the current fonts/colors/effects as a `.thmx` theme file |
| 4 | More Themes on Microsoft Office Online | Legacy/version-dependent; opens Office.com theme downloads. May be absent in modern 365 |

- `Save Current Theme…` opens a Save As dialog with file type `Office Theme (*.thmx)`.
- `Browse for Themes…` applies the theme immediately; the gallery shows the new theme as current/custom.
- `Reset to Theme from Template` is not the same as selecting Office; it reads the attached template.

#### 3.2.3 What a theme changes

A Word theme bundles:

1. **Theme fonts**: Heading font and Body font.
2. **Theme colors**: 12 slots (Text/Background Dark 1, Light 1, Dark 2, Light 2, Accent 1–6, Hyperlink, Followed Hyperlink).
3. **Theme effects**: shape line/fill/shadow/bevel/glow presets.

Changing a theme updates styles that reference theme fonts/colors and shape styles that reference theme effects. **Direct formatting is preserved**: if the user explicitly set Arial on a run, changing the theme does not override that run. This is the opposite of the app's behavior, which selects all text and applies the new body font directly (`DesignTab.tsx:16-26`), destroying direct font formatting.

### 3.3 Style Set

#### 3.3.1 Gallery

- Large menu button with `Aa`/type icon, label `Style Set`, caret.
- Opens a **horizontal gallery** of style-set tiles; each tile is a miniature page showing `AaBbCcDd` in the set's title/heading/body styles, with a small color accent.
- The current set is checked/highlighted.
- Hover gives a live preview of the whole document using that set's style definitions.
- A right-edge **More** button/caret opens a dropdown containing all sets plus footer actions (the video shows the right-side button revealing more sets `[D 00:03:29]`).

#### 3.3.2 Style Set names

The gallery is version-dependent. Word 2013–2019 sets include:

`Default` (current/base), `Standard`, `Basic (Elegant)`, `Basic (Simple)`, `Basic (Smart)`, `Basic (Traditional)`, `Casual`, `Classic`, `Contemporary`, `Elegant`, `Fancy`, `Formal`, `Manuscript`, `Modern`, `Newsletter`, `Original`, `Simple`, `Traditional`, `Word 2003`, `Word 2010`, `Word 2013`, `Word 2016`.

The video's narrator refers to a **Basic/Elegant** style set `[D 00:02:58–00:03:30]`. The current app offers only `Standard`, `Modern`, `Classic`, `Simple`, `Word 2003`, `Casual`, and all are toasts.

#### 3.3.3 Footer actions

| Order | Item | Behavior |
|---:|---|---|
| 1 | Reset to Default Style Set | Restores the style definitions from the current theme/template |
| 2 | Save as New Style Set… | Saves the current style definitions as a reusable style set (Save As; file type is version-dependent, often a template) |

- Style sets change style definitions (fonts, sizes, colors, spacing, heading treatments), not theme color/font slots directly.
- A style set applied on top of a theme can be reset by choosing the theme again or `Reset to Default Style Set`.
- The app's Style Set buttons only toast; no style definitions are stored or applied.
- Narrator caveat: at `[D 00:06:23]` the narrator says "we have a basic or elegant paragraph spacing selected." Those are style-set names, not entries in the Paragraph Spacing menu. Treat this as narration error, not UI evidence.

### 3.4 Colors

#### 3.4.1 Colors gallery

- Large menu button with a color/palette icon, label `Colors`, caret.
- Opens a gallery of **theme color sets**, typically 4 columns. Each tile shows a 6-chip color strip (theme colors) and the set name.
- Current color set is checked.
- Hover gives a live preview of theme colors across styles, tables, charts, and shapes.
- Bottom footer: `Customize Colors…`.

Common color-set names track the theme names (Office, Gallery, Aptos, Berlin, Celestial, Circuit, Damask, Depth, Dividend, Droplet, Facet, Feathered, Frame, Integral, Ion, Ion Boardroom, Main Event, Mesh, Metropolitan, Mosaic, Opulent, Organic, Oslo, Paper, Parallax, Quotable, Retrospect, Savon, Slice, Slate, Solstice, Tranquil, Vapor Trail, Verve, View, Wisp, Wood Type). Version-dependent.

#### 3.4.2 Color picker used by Customize Colors

Clicking a color slot opens Word's standard color picker:

- **Theme Colors** grid: 10 columns × 6 rows.
  - Column headers/base swatches: `Text/Background - Dark 1`, `Text/Background - Light 1`, `Text/Background - Dark 2`, `Text/Background - Light 2`, `Accent 1`, `Accent 2`, `Accent 3`, `Accent 4`, `Accent 5`, `Accent 6`.
  - Each column has 6 tints/shades; tooltips read like `Accent 1, Lighter 80%`, `Accent 1, Darker 50%`.
- **Standard Colors**: a single row of 10 fixed swatches (dark red, red, orange, yellow, light green, green, light blue, blue, dark blue, purple).
- **No Color** (where applicable; not for theme color slots, which require a color).
- **More Colors…**: opens the Colors dialog with:
  - `Standard` tab: hexagonal color wheel + a row of custom/recent colors.
  - `Custom` tab: color model `RGB` or `HSL`, numeric R/G/B or H/S/L fields, `Hex` field, preview old/new, OK/Cancel.
- Transparency is not part of the text/fill color picker; it is a separate shape/page-background option.

The app has only `TEXT_COLORS` (30 hard-coded swatches) and no theme grid, Standard Colors row, More Colors dialog, or Customize Colors dialog.

#### 3.4.3 Create New Theme Colors dialog

Title: `Create New Theme Colors`

| Field | Control | Default | Notes |
|---|---|---|---|
| Theme colors | 12 slot buttons | Current theme colors | Slots: Text/Background Dark 1, Light 1, Dark 2, Light 2, Accent 1–6, Hyperlink, Followed Hyperlink |
| Preview | Live sample | — | Shows sample text, hyperlink, and color chips |
| Name | Text input | `Custom 1` or current custom name | Used in the Colors gallery |
| Reset | Button | — | Restores the current theme's colors |
| Save | Button | — | Saves the custom color set to the document theme |
| Cancel | Button | — | Discards changes |

- Clicking a slot opens the standard color picker (§3.4.2).
- Text/Background Light 1 and Dark 1 control page/background and default text; Accent 1–6 feed accents; Hyperlink and Followed Hyperlink control link colors.
- Saving a custom color set updates theme colors but not the theme fonts/effects.

### 3.5 Fonts

#### 3.5.1 Fonts picker

- Large menu button with a font/type icon, label `Fonts`, caret.
- Opens a scrollable **list** of theme font pairs (most Word builds use a list, not a grid). Each row shows the theme font-pair name (e.g. `Office`, `Calibri`, `Cambria`, `Georgia`, `Arial`, `Times New Roman`, `Garamond`) with a heading/body sample.
- Current pair is checked.
- Hover gives a live preview of body/heading fonts across the document.
- Footer: `Customize Fonts…`.

The pair is named after the theme, not necessarily after the fonts (e.g. `Office` may map to Aptos Display/Aptos or Calibri Light/Calibri depending on version).

#### 3.5.2 Create New Theme Fonts dialog

Title: `Create New Theme Fonts`

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Heading font | Dropdown | Current heading font | All installed fonts + theme fonts | Used by heading styles that reference `+Headings` |
| Body font | Dropdown | Current body font | All installed fonts + theme fonts | Used by body styles that reference `+Body` |
| Preview | Live sample | — | — | Shows heading/body text |
| Name | Text input | `Custom 1` or current custom name | Free text | Used in the Fonts gallery |
| Save | Button | — | — | Saves the custom font pair |
| Reset | Button | — | — | Restores current theme fonts |
| Cancel | Button | — | — | Discards |

- Theme fonts are referenced by styles; changing the theme font updates those styles. Directly formatted runs keep their explicit font.
- The app stores only `bodyFont`/`headingFont` in `THEMES` and applies the body font directly to all text; it cannot represent theme-font references or preserve direct formatting.

### 3.6 Paragraph Spacing

#### 3.6.1 Paragraph Spacing menu

| Order | Preset | Before | After | Line spacing |
|---:|---|---:|---:|---|
| 1 | Default | Current style set values | Current style set values | Current style set |
| 2 | No Paragraph Space | 0 pt | 0 pt | 1.0 |
| 3 | Compact | 0 pt | 4 pt | 1.0 |
| 4 | Tight | 0 pt | 6 pt | 1.15 |
| 5 | Open | 0 pt | 10 pt | 1.15 |
| 6 | Relaxed | 0 pt | 6 pt | 1.5 |
| 7 | Double | 0 pt | 8 pt | 2.0 |
| 8 | Custom Paragraph Spacing… | — | — | Opens Manage Styles > Set Defaults |

- The menu is a vertical list with a small preview icon per item. The current selection is checked.
- `Default` may be labeled with the current style set's name in some versions.
- Hover gives a live preview of the document.
- Presets change the document's style set spacing (Normal and related styles), not the spacing of only the selected paragraph.

#### 3.6.2 Custom Paragraph Spacing

`Custom Paragraph Spacing…` opens **Manage Styles** with the **Set Defaults** tab selected (not the Paragraph dialog):

| Field | Control | Default | Notes |
|---|---|---|---|
| Default font | Font dropdown | Current theme body font | Sets the default font for the document/template |
| Font size | Numeric/dropdown | 11 pt (or current) | |
| Paragraph spacing – Line spacing | Dropdown | Multiple 1.08 / current | Single, 1.5, Double, At least, Exactly, Multiple |
| Paragraph spacing – Before | Numeric | 0 pt | |
| Paragraph spacing – After | Numeric | 8 pt | |
| Set as default | Radio group | `New documents based on this template` | `Only in this document` or `New documents based on this template` |
| Preview | Sample | — | |
| OK / Cancel | Buttons | OK | |

- The dialog title is `Manage Styles`; the tab is `Set Defaults`.
- Setting defaults affects Normal style and new documents, not just the current selection.
- The app has no Paragraph Spacing menu or dialog; it has global CSS variables only.

### 3.7 Effects

- Large menu button with an effects/shape icon, label `Effects`, caret.
- Opens a gallery of **theme effect sets**. Each tile shows a shape (often a circle/rounded square) rendered with that set's shadow, bevel, glow, and line treatment, plus the set name.
- Current effect set is checked.
- Hovering a tile previews the effect on shapes/objects in the document. Effects do not change plain text or paragraph formatting.
- Clicking applies the effect set to shape styles that reference theme effects.

Common effect-set names mirror theme names: Office, Apex, Aspect, Civic, Concourse, Equity, Flow, Foundry, Median, Metro, Module, Opulent, Oriel, Origin, Paper, Solstice, Technic, Trek, Urban, Verve (plus modern theme names). Version-dependent.

The app's Effects menu contains `None`, `Shadow`, `Reflection`, `Glow`, `Outline` and labels them `Text Effects`. That is a different Word feature (Home > Text Effects / Shape Format > Text Effects). It does not change shape theme effects and only toasts.

### 3.8 Set as Default

- Button at the far right of Document Formatting, with a checkmark/document icon and label `Set as Default`.
- Clicking it asks for confirmation (Yes/No) to use the current theme, style set, colors, fonts, paragraph spacing, and effects as the default for **new documents** based on the current template.
- It does not modify the current document's appearance (that appearance is already applied); it writes the defaults to the attached template (usually `Normal.dotm`).
- The app has no Set as Default control or persistence for theme/style settings.

### 3.9 Watermark

#### 3.9.1 Watermark gallery

Clicking **Watermark** opens a gallery of page thumbnails. The gallery typically contains:

1. A grid of preset text watermarks, each shown as a page thumbnail. Most presets exist in both **Diagonal** and **Horizontal** orientations:
   - `DRAFT`
   - `CONFIDENTIAL`
   - `DO NOT COPY`
   - `SAMPLE`
   - `ASAP`
   - `URGENT`
2. `Custom Watermark…`
3. `More Watermarks from Office.com` (legacy/version-dependent; may be absent in modern 365)
4. `Remove Watermark` (enabled when a watermark exists)
5. `Save Selection to Watermark Gallery` (when text is selected; version-dependent)

Notes:

- The current watermark (if any) is checked/highlighted.
- The app's menu has `No Watermark` instead of Word's `Remove Watermark`; the label and presence differ. Word's gallery does not normally show a "No Watermark" tile.
- The app offers only DRAFT, CONFIDENTIAL, DO NOT COPY, all diagonal/fixed; no horizontal variants, SAMPLE, ASAP, URGENT, Office.com, or remove command (it uses `No Watermark`).
- Hovering a preset gives a live preview in Word.

#### 3.9.2 Printed Watermark dialog

Title: `Printed Watermark`

| Section | Field | Control | Default | Options/notes |
|---|---|---|---|---|
| Top | No watermark | Radio | Selected when no watermark | Removes the watermark on OK |
| Top | Picture watermark | Radio | — | Enables picture fields |
| Picture | Select Picture… | Button | — | File picker (PNG/JPEG/GIF/BMP/TIFF; version-dependent) |
| Picture | Scale | Dropdown | Auto | `Auto`, `50%`, `100%`, `150%`, `200%`, `500%` (list may vary) |
| Picture | Washout | Checkbox | Checked | Fades the picture so text remains readable |
| Top | Text watermark | Radio | Selected when a text watermark exists | Enables text fields |
| Text | Language | Dropdown | Document language (e.g. English (United States)) | Affects font fallback/typography |
| Text | Text | Text input | `CONFIDENTIAL` (or current watermark text) | Free text; usually a single line |
| Text | Font | Dropdown | Calibri (or current) | All installed fonts |
| Text | Size | Dropdown/numeric | Auto | `Auto` or point size |
| Text | Color | Dropdown | Silver/gray (or current) | Theme/standard/More Colors |
| Text | Semitransparent | Checkbox | Checked | Makes text translucent |
| Text | Layout | Radio | Diagonal | `Diagonal` or `Horizontal` |
| Bottom | Apply / OK | Button | OK | Applies to the section and closes |
| Bottom | Cancel | Button | — | Discards |

Behavior notes:

- A watermark is stored in the section's header story, behind body text, and repeats on every page of the section by default. It is visible in Print Layout and print, not in Web Layout/Read Mode.
- To edit/select a watermark, the user opens the header (or uses the gallery/dialog); clicking it in the body does not select it.
- Watermarks can differ per section if headers are unlinked. `Remove Watermark` removes it from the current section; linked sections follow.
- Picture watermarks scale relative to the image's original size; `Washout` applies a transparency/grayscale effect. There is no rotation control in the dialog (pictures are not angled by the dialog).
- Text watermarks are diagonal by default, semitransparent, and centered on the page. Word does not expose position/offset in this dialog.
- The app renders a single fixed `div.watermark`: 90 px, bold, `rgba(180,180,180,0.35)`, rotated -45°, letter-spacing 6 px, centered on the one page (`word.css:1118-1131`). It has no dialog, picture, font, color, size, scale, angle, washout, or per-section behavior.

### 3.10 Page Color

#### 3.10.1 Page Color palette

- Large menu button with a paint-bucket/droplet icon, label `Page Color`, caret.
- Opens the standard color picker:
  - `No Color` (restores the theme/page background, usually white)
  - Theme Colors grid (10 × 6)
  - Standard Colors row (10)
  - `More Colors…` (Standard/Custom dialog)
  - `Fill Effects…` (Gradient/Texture/Pattern/Picture)
- Applies to **all pages** in the document (page background is a document-level setting in Word, not a section property). It does not have an apply-to control.
- Page color is a screen/print background. Word does not print it by default; printing requires **File > Options > Display > Print background colors and images**. A page color can make text unreadable; Word does not auto-adjust text color.
- `No Color` is semantically different from white: it removes the background so the theme/page default shows.

The app uses 30 hard-coded swatches, no theme grid/Standard Colors split, no More Colors, no Fill Effects, and sets `pageColor: '#ffffff'` for `No Color` rather than a null/no-color state (`DesignTab.tsx:101-111`).

#### 3.10.2 Fill Effects dialog

Title: `Fill Effects`; four tabs.

**Gradient tab**

| Field | Control | Default | Options |
|---|---|---|---|
| Colors | Radio | One color | `One color`, `Two colors`, `Preset` |
| Color 1 | Color dropdown | Current | Enabled for One/Two colors |
| Color 2 | Color dropdown | White/current | Enabled for Two colors |
| Dark/Light | Slider | Middle | For One color; controls tint/shade of the single color |
| Transparency | Two numeric/sliders | 0% / 0% | From/To transparency |
| Shade style | Dropdown/list | Horizontal | Horizontal, Vertical, Diagonal down, Diagonal up, From corner, From center |
| Variants | 4 thumbnails | First | Selects direction/variant |
| Preset | Dropdown | — | Enabled for `Preset` (e.g. Early Sunset, Daybreak) |

**Texture tab**

- Grid of texture swatches (paper, canvas, marble, wood, water, etc.).
- `Other Texture…` opens a file picker for an image texture.
- Selected texture is tiled across the page.

**Pattern tab**

| Field | Control | Default | Options |
|---|---|---|---|
| Foreground | Color dropdown | Black | Theme/standard/More Colors |
| Background | Color dropdown | White | Theme/standard/More Colors |
| Pattern | Grid of pattern swatches | First | 48-ish patterns (lines, dots, checks, diagonals) |

**Picture tab**

- `Select Picture…` opens a file picker.
- The picture is tiled/filled across the page; there is no scale/offset control here.
- OK/Cancel apply/discard.

### 3.11 Page Borders (Borders and Shading > Page Border)

Clicking **Page Borders** opens the **Borders and Shading** dialog with the **Page Border** tab selected. The app toggles a boolean outline instead (`DesignTab.tsx:114-119`).

#### 3.11.1 Dialog chrome

- Title: `Borders and Shading`
- Tabs: `Borders | Page Border | Shading`
- Page Border tab controls (left to right, top to bottom):
  - **Setting**: None, Box, Shadow, 3-D, Custom
  - **Style**: scrollable line-style list
  - **Color**: dropdown (Automatic + theme/standard/More Colors)
  - **Width**: dropdown (0.25–6 pt, style-dependent)
  - **Art**: dropdown of decorative borders (enabled when Setting is Box/Shadow/3-D/Custom and rules allow)
  - **Preview**: page thumbnail with four clickable side buttons
  - **Apply to**: Whole document; This section; This section – First page only; This section – All except first page
  - **Options…**: Page Border Options dialog
  - **Horizontal Line…**: inserts a horizontal line at the cursor (closes dialog); legacy/web-oriented
  - **OK / Cancel**

#### 3.11.2 Page Border tab field reference

| Field | Control | Default | Options | Notes |
|---|---|---|---|---|
| Setting | Radio/icon list | None (when no border) | None, Box, Shadow, 3-D, Custom | Box applies all four sides; Custom allows per-side |
| Style | List | Single, 0.5 pt | Word's full border style list | Selecting a style sets the line appearance; width may auto-adjust |
| Color | Dropdown | Automatic (black) | Automatic, theme colors, standard colors, More Colors | Art borders ignore color |
| Width | Dropdown | 0.5 pt | 0.25, 0.5, 0.75, 1, 1.5, 2.25, 3, 4.5, 6 pt | Available widths vary by style; art borders disable width |
| Art | Dropdown | None | Decorative art list | ~20+ styles (apples, bats, bears, birthday, candy, confetti, coral, eggs, flowers, football, garland, holiday, ice cream, leaves, map, music, palms, pumpkins, stars, trees, vines); version-dependent |
| Preview | Page diagram | — | Four side buttons | Clicking a side toggles that border on/off; with Box/Shadow, clicking a side can switch to Custom |
| Apply to | Dropdown | Whole document | Whole document; This section; This section – First page only; This section – All except first page | First-page options require a section |
| Options… | Button | — | Opens Page Border Options | |
| Horizontal Line… | Button | — | Inserts a horizontal line at cursor | Not a page border; legacy |
| OK / Cancel | Buttons | OK | — | |

Border style list (Word's standard set; labels vary slightly by version):

`None`, `Single`, `1½ pt`, `2¼ pt`, `3 pt`, `4½ pt`, `6 pt`, `Double`, `Thin Thick`, `Thick Thin`, `Thin Thick Thin`, `Thick Thin Thick`, `Dotted`, `Dashed`, `Dash Small Gap`, `Dash Dot`, `Dash Dot Dot`, `Triple`, `Wave`, `Double Wave`, `Dash Dot Stroked`, `Dash Dot Dot Stroked`.

#### 3.11.3 Page Border Options dialog

| Field | Control | Default | Notes |
|---|---|---|---|
| Margin – Top | Numeric | 24 pt | Distance from the measuring reference to the border |
| Margin – Bottom | Numeric | 24 pt | |
| Margin – Left | Numeric | 24 pt | |
| Margin – Right | Numeric | 24 pt | |
| Measure from | Dropdown | Edge of page | `Edge of page` or `Text` |
| Always display in front | Checkbox | Checked | Border draws above text/objects; unchecking lets text overlap |
| Surround header | Checkbox | Checked | Border encloses the header area |
| Surround footer | Checkbox | Checked | Border encloses the footer area |
| Align paragraph borders and table edges with page border | Checkbox | Unchecked/disabled | Enabled only when paragraph/table borders exist |
| OK / Cancel | Buttons | OK | |

Behavior notes:

- A page border is a **section property** and repeats on each page according to `Apply to`. It is not a paragraph border.
- `Box`/`Shadow`/`3-D` apply all four sides; `Custom` lets each side be toggled independently in the preview. `None` removes the border.
- Art borders replace line styles and scale to the page; width/color may be disabled.
- The border distance is measured from the page edge (default 24 pt = 1/3") or from text. Word warns if the border is outside the printable area or overlaps text.
- `Always display in front` keeps the border above body content; with it off, text can cover the border.
- Different first-page border settings are section-scoped; linking headers does not automatically link borders.
- The app's "page border" is a single CSS `outline: 1px solid #2b579a; outline-offset: 8px` (`word.css:1067-1070`) with no dialog, style/color/width/art, sides, apply-to, or header/footer behavior. CSS outlines may not print in all browsers.

---

## 4. Design cascade and behavior model

Word's design system is layered. Implementations that treat themes as a font swap will diverge visibly.

```
Document defaults (template / Manage Styles > Set Defaults)
  └─ Theme (fonts + colors + effects)
       └─ Style Set (style definitions that reference theme fonts/colors)
            └─ Styles (Normal, Heading 1, Title, etc.)
                 └─ Direct formatting (bold, font, color, spacing applied to a run/paragraph)
```

Rules:

1. **Direct formatting wins** over styles; a theme change must not overwrite explicit fonts/colors/spacing.
2. Theme fonts are references: a heading style using `+Headings` updates when the theme's heading font changes; a run with an explicit font does not.
3. Theme colors are references: a shape/table style using `Accent 1` updates; a shape with an explicit RGB fill does not.
4. Style sets change style definitions, not theme slots. Applying a theme can change the available style set; applying a style set does not change theme colors/fonts.
5. Paragraph Spacing presets modify style-set spacing; `Custom Paragraph Spacing…` changes document defaults (Normal/template), not a single paragraph.
6. Effects apply to shapes/objects that use theme effects; they do not restyle text runs.
7. `Set as Default` persists the current design layer as the template default for new documents.
8. Page background (watermark, color, borders) is independent of themes; changing a theme does not remove a watermark, page color, or page border.

The current app's model has no theme colors, no style definitions, no theme effect sets, and no template/default layer. `theme` is a string; `THEMES` has only `bodyFont`, `headingFont`, and `accent`; and applying a theme directly sets fonts on all text.

---

## 5. Units, scope, reflow, and print matrix

| Setting | Unit | Scope | Reflows text? | Prints? | App status |
|---|---|---|---|---|---|
| Margins | in/cm | Section | Yes | Yes | px values, whole doc |
| Gutter | in/cm | Section | Yes | Yes | Missing |
| Orientation | — | Section | Yes (width/height swap) | Yes | Toggle exists |
| Paper size | in/cm | Section | Yes | Yes | 6 presets only |
| Columns | count/in | Section | Yes | Yes | Global CSS columns |
| Page break | — | Position | Yes (new page) | Yes | Visual node only |
| Column break | — | Position | Yes (new column) | Yes | Missing |
| Section break | — | Position | Yes | Yes | Missing |
| Line numbers | integer/in | Section | No (adds margin numbers) | Yes | Missing |
| Hyphenation | on/off/in | Document/section | Yes | Yes | Missing |
| Indent left/right | in/cm | Paragraph | Yes | Yes | Left sets both sides; right no-op |
| Spacing before/after | pt | Paragraph/style | Yes | Yes | Global CSS |
| Line spacing | multiple/pt | Paragraph/style | Yes | Yes | Per paragraph, extra group |
| Theme fonts | font names | Document | Yes | Yes | Direct font replacement |
| Theme colors | RGB slots | Document | No (recolors) | Yes | Missing |
| Style set | style defs | Document | Yes | Yes | Toast only |
| Paragraph spacing presets | pt/multiple | Document/styles | Yes | Yes | Missing |
| Effects | effect set | Document/objects | No | Yes | Text effects only |
| Watermark | text/image | Section/header | No | Yes | Fixed text overlay |
| Page color | RGB/gradient/etc. | Document | No | Optional (off by default) | 30 swatches |
| Page borders | pt/art | Section | No (border area) | Yes | Boolean outline |

Additional behavioral rules:

- **Page count is not a layout setting.** Changing margins/orientation/size/columns/fonts/spacing/hyphenation changes pagination; changing watermark/page color/border/theme colors does not.
- **Header/footer distance** is measured from the paper edge, not the margin. If header distance + header height exceeds the top margin, Word pushes body text down.
- **Gutter** is added to the binding edge; with mirrored margins it alternates sides. It is not a margin preset.
- **Page color** prints only when Word Options > Display > `Print background colors and images` is enabled (or the printer/driver handles it); on-screen color always shows.
- **Page borders** are vector/art objects rendered by Word, not CSS outlines; they should appear in print/PDF export.
- **Watermarks** live in the header layer; they should not intercept clicks or text selection.
- **Theme changes** recolor/resize existing content via styles; they should not destroy direct formatting.
- **Units** affect display only; stored geometry must remain exact and convert without cumulative rounding.

---

## 6. Current implementation audit

### 6.1 Layout tab

`src/components/ribbon/LayoutTab.tsx`

| Area | Current implementation | Consequence |
|---|---|---|
| Group structure | Nine groups: Margins, Orientation, Size, Columns, Breaks, Indent, Spacing, Line Spacing, Arrange | Ribbon no longer reads like Word; group labels are wrong; extra Line Spacing group |
| Margins | Five presets from `MARGIN_PRESETS`; no Office 2003 Default; no gutter; `Custom Margins…` toast | Cannot set exact margins, gutter, mirror, or page setup |
| Margin active check | Compares top/left/right only | A preset can appear active when bottom differs |
| Orientation | Big button toggles; two small buttons | Word uses a portrait/landscape menu; accidental toggles are easy |
| Size | Six presets from `PAGE_SIZES`; no More Paper Sizes/custom | Missing Statement, Executive, envelopes, B-series, custom |
| Columns | One/Two/Three/Four; no Left/Right, More Columns, spacing, line, apply-to | Four is not a Word quick-menu item; asymmetric/dialog behavior missing |
| Breaks | Button immediately inserts a `pageBreak` node | No menu, no column/section/text-wrapping breaks |
| Line Numbers | Absent | Entire feature missing |
| Hyphenation | Absent | Entire feature missing |
| Indent | Left field edits `indent`; Right field toasts | Left indents both sides (extension bug); right is a no-op; units are 0.5" steps |
| Spacing | Global `paragraphBefore`/`paragraphAfter` | Whole-document spacing, not per paragraph |
| Paragraph dialog | No launcher | Full paragraph formatting unreachable |
| Arrange | Rotate/Position/Wrap Text big buttons; all toast | No object selection, no real commands, wrong order, no Bring/Send/Selection Pane/Align/Group |
| Page Setup | No dialog | Core layout surface missing |
| Ruler | Static display | "Drag margins" toast is false |

### 6.2 Design tab

`src/components/ribbon/DesignTab.tsx`

| Area | Current implementation | Consequence |
|---|---|---|
| Group structure | Document Formatting (twice), Page Background, Effects | Duplicate groups; Effects is in the wrong group; missing four Document Formatting controls |
| Themes | 8 themes; 3 CSS variables; `selectAll().setFontFamily(bodyFont)` | Destroys direct font formatting; no theme colors/effects; no gallery footer actions; no hover preview |
| Style Set | Six labels; each toasts | No style definitions applied; no gallery thumbnails; no save/reset |
| Colors | Absent | No theme color sets or Customize Colors |
| Fonts | Absent | No heading/body pair control |
| Paragraph Spacing | Absent | No presets or Manage Styles defaults |
| Effects | Text Effects (None/Shadow/Reflection/Glow/Outline); toasts | Wrong feature; does not affect shapes; no theme effect sets |
| Set as Default | Absent | Cannot persist design defaults |
| Watermark | Four text presets + `window.prompt`; fixed CSS | No dialog, picture, size, color, angle, washout, remove semantics, per-section support |
| Page Color | 30 swatches; `No Color` sets white | No theme/standard split, More Colors, Fill Effects, no-color state |
| Page Borders | Boolean toggles a CSS outline | No Borders and Shading dialog, style/width/color/art/apply-to |
| Live preview | None | Word's defining gallery behavior is absent |

### 6.3 State and model

`src/context.ts`:

```ts
type PageSetup = {
  sizeKey: string
  orientation: 'portrait' | 'landscape'
  margins: { top: number; right: number; bottom: number; left: number }
  columns: number
  pageColor: string
  watermark: string | null
}
```

Missing fields needed by this spec:

- `gutter`, `gutterPosition`
- `mirrorMargins`, `multiplePages` (`normal`/`mirror`/`2 pages per sheet`/`book fold`), `sheetsPerBooklet`
- `paperWidth`, `paperHeight`, `paperSourceFirst`, `paperSourceOther`
- `headerDistance`, `footerDistance`, `differentFirstPage`, `differentOddEven`, `verticalAlignment`
- section array with page setup per section and break type
- `lineNumbers: { enabled, mode, startAt, fromText, countBy }`
- `hyphenation: { mode, auto, caps, zone, maxConsecutive }`
- paragraph-level `indentLeft`, `indentRight`, `spacingBefore`, `spacingAfter`, `lineSpacing`, pagination flags
- `theme: { fonts, colors, effects, styleSet }`, `customColorSets`, `customFontSets`
- `pageBorders: { setting, style, color, width, art, sides, applyTo, options }`
- `watermark: { kind, text, font, size, color, semitransparent, layout, picture, scale, washout } | null`
- `pageColor: { kind, color, gradient, texture, pattern, picture } | null`

The app also lacks a section array; `page` is a single object. Without sections, `Apply to`, mirrored margins on facing pages, per-section headers/borders, and column changes at a point forward cannot be implemented correctly.

### 6.4 Rendering

`src/components/PageCanvas.tsx` + `src/styles/word.css`:

- **Single sheet**: one `.page-wrap` with `width` and `minHeight`; content growth increases its height instead of creating pages. There are no page gaps, repeated headers/footers, or page numbers beyond a hard-coded `1`.
- **Margins**: px padding; header/footer zones are absolute 40 px bars; when shown, body top/bottom padding becomes 40 px, ignoring the configured margin and header/footer distance.
- **Columns**: `columnCount` on `.doc-body`; `column-gap: 0.4in`; no line between, no asymmetric widths, no section scope, no column break. CSS columns do not paginate across Word pages.
- **Page break**: a 24 px dashed marker inside the single sheet, not a page division.
- **Watermark**: one absolute text div, fixed 90 px/-45°/gray, no header layer.
- **Page color**: background on `.page-wrap` only; the surrounding canvas stays gray.
- **Page borders**: CSS outline, 1 px blue, 8 px offset; no side/style/width/art control; may not print.
- **Print**: the browser print path is not guaranteed to match Word's page geometry, backgrounds, or borders.

### 6.5 DOCX export/import and persistence

`src/lib/docx.ts`:

- `exportDocx` hard-codes section page margins to 1440 twips (1") on all sides and default font Calibri 11; it ignores `page.sizeKey`, `orientation`, actual margins, gutter, columns, page color, watermark, page borders, theme, style set, paragraph spacing, and design settings.
- `importDocx` uses mammoth → HTML, which does not preserve section properties, headers/footers, watermarks, page borders, themes, or exact page setup.
- `pageBreak` exports as `pageBreakBefore` on an empty paragraph, which is a reasonable approximation but not a faithful Word break.
- Paragraph indent exports only `left: indent * 720` (0.5" per step); right indent is absent.
- There is no export path for line numbers, hyphenation, columns, page borders, or watermark, so a user's on-screen layout is lost in the `.docx`.
- Persistence: content and `page` are saved to localStorage; `theme`, `paragraphBefore/After`, `pageBorders`, header/footer text/visibility, and other design state are not persisted. Reloading resets them.

---

## 7. Gap analysis

Severity: **P0** = core feature absent/incorrect and blocks faithful layout; **P1** = important Word control missing or behavior wrong; **P2** = fidelity/polish.

### 7.1 Layout gaps

| # | Gap | Current | Required | Severity |
|---:|---|---|---|---|
| L1 | Page Setup dialog | Absent; Custom Margins toast | Three-tab dialog with all fields/defaults in §2.3 | P0 |
| L2 | Margin presets | Five; mirrored incomplete; no Office 2003; px only | Six presets + accurate mirror/inside/outside + inches | P0 |
| L3 | Gutter / multiple pages | Absent | Gutter + Left/Top + Normal/Mirror/2-up/Book fold | P0 |
| L4 | Section model | None | Sections with per-section page setup and apply-to | P0 |
| L5 | Orientation | Toggle + two small buttons | Portrait/Landscape menu with previews | P1 |
| L6 | Size | Six presets, no custom | Full paper list + custom width/height + More Paper Sizes | P1 |
| L7 | Columns quick gallery | One/Two/Three/Four | One/Two/Three/Left/Right/More Columns | P0 |
| L8 | Columns dialog | Absent | Presets, count, width/spacing, equal width, line between, apply-to | P1 |
| L9 | Column break | Absent | Break menu + column-break behavior | P1 |
| L10 | Breaks menu | Immediate page-break node | Page/Column/Text Wrapping/Next/Continuous/Even/Odd | P0 |
| L11 | Real pagination | One growing sheet | Paged layout with page gaps and repeated headers/footers | P0 |
| L12 | Line Numbers | Absent | Menu + dialog + render + paragraph suppression | P1 |
| L13 | Hyphenation | Absent | Modes + options + manual pass + reflow | P1 |
| L14 | Indent right | Toast no-op | Per-paragraph right indent | P1 |
| L15 | Indent left | Sets both sides; 0.5" steps | Per-paragraph left indent, 0.1" steps, negative allowed | P1 |
| L16 | Paragraph spacing | Global CSS | Per-paragraph before/after including Auto | P1 |
| L17 | Paragraph dialog | Absent | Indents/Spacing + Line and Page Breaks tabs | P1 |
| L18 | Extra Line Spacing group | Present in Layout | Remove; line spacing belongs on Home/Paragraph dialog | P2 |
| L19 | Arrange controls | Toast stubs | Position/Wrap/Bring/Send/Selection Pane/Align/Group/Rotate with object model | P1 (P0 if floating objects are in scope) |
| L20 | Arrange order | Rotate, Position, Wrap Text only | Position, Wrap Text, Bring, Send, Selection Pane, Align, Group, Rotate | P1 |
| L21 | Ruler | Display-only | Draggable margins/indents + double-click Page Setup | P2 |

### 7.2 Design gaps

| # | Gap | Current | Required | Severity |
|---:|---|---|---|---|
| D1 | Group structure | Two Document Formatting groups, Effects outside | Two groups: Document Formatting (Themes…Set as Default) and Page Background | P1 |
| D2 | Theme gallery | 8 simple cards, click-only | Full gallery with previews, check state, hover live preview, footer actions | P1 |
| D3 | Theme cascade | Body font forced on all text | Theme fonts/colors/effects references; preserve direct formatting | P0 |
| D4 | Theme colors | Absent | 12-slot palette, theme color sets, Customize Colors | P1 |
| D5 | Theme fonts | Absent as a pair control | Fonts gallery + Create New Theme Fonts | P1 |
| D6 | Style sets | Toast labels | Style-definition sets with gallery, preview, reset/save | P1 |
| D7 | Paragraph Spacing | Absent | Seven presets + Custom (Manage Styles > Set Defaults) | P1 |
| D8 | Effects | Text Effects toasts | Theme effect-set gallery for shapes | P2 |
| D9 | Set as Default | Absent | Persist design defaults to template/new docs | P2 |
| D10 | Watermark dialog | `window.prompt`, fixed CSS | Printed Watermark dialog + picture/text + scale/washout/angle/remove | P1 |
| D11 | Watermark presets | 3 fixed text items | Six phrases × diagonal/horizontal + Remove + Office.com | P2 |
| D12 | Page Color | 30 swatches, no Fill Effects | Theme/standard palette, More Colors, Fill Effects, true No Color | P1 |
| D13 | Page Borders | Boolean outline | Borders and Shading > Page Border with style/width/color/art/apply-to/options | P1 |
| D14 | Live preview | None | Hover preview for themes/styles/colors/fonts/spacing/effects/backgrounds | P2 |

### 7.3 Cross-cutting gaps

| # | Gap | Current | Required | Severity |
|---:|---|---|---|---|
| X1 | Units | px labels, mixed cm/in | Inches (or user-selected unit) with exact conversions | P1 |
| X2 | DOCX export | Fixed 1" margins, Calibri 11, no design | Emit sections/page setup/columns/theme/watermark/borders | P0 |
| X3 | DOCX import | Mammoth HTML only | Preserve section/page setup where possible | P1 |
| X4 | Persistence | Page + content only | Persist theme/design/spacing/borders/header/footer | P1 |
| X5 | Dialog infrastructure | Popover + prompt only | Modal dialog component with tabs, preview, OK/Cancel/Apply | P1 |
| X6 | Print fidelity | CSS single sheet | Paginated print/PDF matching Word geometry | P1 |
| X7 | Object model | No floating objects/groups/z-order | Anchor/position/wrap/group/selection pane | P1 |
| X8 | Header/footer model | Two inputs, fixed 40 px, page number "1" | Per-section stories, distances, first/even-odd, fields | P1 |

---

## 8. Implementation guidance (non-binding)

This section is a suggested shape for the work, not a prescribed rewrite.

### 8.1 Data model

Introduce a section-aware page model. A minimal version:

```ts
type MeasurementUnit = 'in' | 'cm' | 'mm' | 'pt' | 'pc'

type Margins = { top: number; right: number; bottom: number; left: number }

type PageSetup = {
  width: number          // inches
  height: number         // inches
  orientation: 'portrait' | 'landscape'
  margins: Margins       // inches
  gutter: number         // inches
  gutterPosition: 'left' | 'top'
  mirrorMargins: boolean
  multiplePages: 'normal' | 'mirror' | 'two-up' | 'book-fold'
  sheetsPerBooklet?: number
  headerDistance: number // inches
  footerDistance: number // inches
  verticalAlignment: 'top' | 'center' | 'bottom' | 'justified'
  columns: ColumnSetup
  lineNumbers: LineNumberSetup
  borders: PageBorderSetup | null
}

type Section = {
  id: string
  start: 'new-page' | 'continuous' | 'even-page' | 'odd-page' | 'new-column'
  page: PageSetup
  headers: HeaderFooterStories
  watermark: WatermarkSetup | null
}
```

Keep values in inches at the model boundary; convert to px/twips at render/export. Do not store margins as px if the UI must show inches.

### 8.2 Dialog architecture

- Add a reusable modal with tabs, scrollable body, preview rail, and `OK / Cancel / Apply` (Page Setup uses `OK / Cancel / Set As Default…`).
- Galleries need a shared hover-preview controller: snapshot the current style/page state on hover, apply a temporary preview, restore on leave/Esc, commit on click.
- Numeric fields need unit-aware parsing (`1.25"`, `3.17 cm`, `72 pt`) and step behavior (0.1" indents, 6 pt spacing).

### 8.3 Rendering

- Replace the single growing sheet with a paginated document model. A CSS-columns hack cannot reproduce Word's pages, headers, footers, borders, and line numbers.
- Render watermarks in a header layer with pointer-events none, not as a body overlay.
- Render page borders as a dedicated page-decoration layer so they can be styled per side and printed.
- Use `@page`/print CSS or a PDF renderer for print fidelity; the current browser print path will not match Word.

### 8.4 DOCX

- Export sections with `w:sectPr`: page size, orientation, margins, gutter, columns, header/footer references, line numbering, page borders, vertical alignment.
- Export theme parts (`theme1.xml`) for fonts/colors/effects, and style definitions for the style set.
- Export watermarks as header shapes/text, page color as document background, and page borders as section properties.
- Import at least page size/orientation/margins/sections; mammoth alone cannot do this.

---

## 9. Frame capture table

Thirty frames covering the controls and dialogs needed for a visual reference. Timestamps are approximate SRT cue times; capture the frame at or just after the cue, when the UI is fully open. Because the SRT captions roll/repeat, a timestamp may land on a repeated line; adjust by ±1–2 seconds as needed.

### 9.1 Layout video (`YJjYHRIiDzQ`)

| hh:mm:ss | What UI to capture |
|---|---|
| 00:00:26 | Layout tab selected; full ribbon from Margins through Arrange; three group boundaries visible |
| 00:00:32 | Margins gallery open; all preset thumbnails and Custom Margins visible |
| 00:01:29 | Page Setup > Margins tab with Top/Bottom/Left/Right, Gutter, Gutter position, Orientation, Multiple pages, Apply to, preview |
| 00:03:18 | Orientation menu open with Portrait and Landscape page thumbnails and current check |
| 00:03:46 | Size menu open (full paper-size list + More Paper Sizes); then Page Setup > Paper tab at 00:04:03 |
| 00:04:26 | Columns gallery open with One/Two/Three/Left/Right/More Columns thumbnails |
| 00:04:58 | More Columns dialog: presets, Number of columns, Width and spacing table, Equal column width, Line between, Preview, Apply to |
| 00:06:08 | Breaks menu open; Page, Column, Text Wrapping, and the four section breaks grouped |
| 00:06:42 | Line Numbers menu open; None/Continuous/Restart Each Page/Restart Each Section/Suppress/Options |
| 00:07:52 | Line Numbers dialog: Add line numbering, Start at, From text/Auto, Count by, Numbering radios, Apply to; then Page Setup > Layout tab at 00:09:32 |
| 00:08:10 | Hyphenation menu open; None/Automatic/Manual/Hyphenation Options |
| 00:09:24 | Hyphenation Options dialog: Automatically hyphenate, Hyphenate words in CAPS, Hyphenation zone 0.25", Limit consecutive hyphens |
| 00:10:04 | Paragraph group with Left/Right indent and Before/After spacing fields; values and units visible |
| 00:11:16 | Paragraph dialog > Indents and Spacing tab; then Line and Page Breaks tab |
| 00:12:12 | Wrap Text menu open with all seven wrap modes, Edit Wrap Points, More Layout Options |
| 00:13:43 | Position gallery open with In Line with Text, 3×3 position tiles, More Layout Options |
| 00:15:14 | Selection Pane open with object rows/eye toggles; Bring Forward/Send Backward menus visible |
| 00:16:13 | Align menu open with six align, two distribute, Align to Page/Margin/Selected Objects, gridlines, Grid Settings |
| 00:18:16 | Group menu open (Group/Ungroup/Regroup) and a selected group's bounding box; Rotate menu at 00:19:07 |

### 9.2 Design video (`fL1hd6NlPsM`)

| hh:mm:ss | What UI to capture |
|---|---|
| 00:00:46 | Design tab selected; full ribbon showing Document Formatting (Themes through Set as Default) and Page Background (Watermark/Page Color/Page Borders) |
| 00:00:50 | Themes gallery open with page-preview tiles, current check, and footer actions (Reset/Browse/Save); hover a tile for live preview; footer actions close-up at 00:01:56 |
| 00:02:58 | Style Set gallery open with AaBbCcDd tiles, current check, and right-edge More button |
| 00:03:58 | Colors gallery open with 6-chip theme color sets and Customize Colors…; Create New Theme Colors dialog at 00:04:51 |
| 00:05:23 | Fonts gallery open with heading/body font pairs and Customize Fonts…; Create New Theme Fonts dialog at 00:05:57 |
| 00:06:19 | Paragraph Spacing menu open with Default/No Paragraph Space/Compact/Tight/Open/Relaxed/Double/Custom |
| 00:07:33 | Custom Paragraph Spacing: Manage Styles > Set Defaults tab with line spacing/before/after and Set as default radios |
| 00:08:05 | Effects gallery open with shape effect-set tiles and current check; selected shape previewing an effect |
| 00:10:23 | Watermark gallery open with DRAFT/CONFIDENTIAL/DO NOT COPY/SAMPLE/ASAP/URGENT diagonal and horizontal variants, Custom, More, Remove; Printed Watermark dialog at 00:10:56 |
| 00:12:11 | Page Color palette open with No Color, theme grid, Standard Colors, More Colors, Fill Effects; Colors dialog at 00:12:42 and Fill Effects tabs at 00:13:10 |
| 00:13:30 | Borders and Shading > Page Border tab with Setting/Style/Color/Width/Art/Preview/Apply to/Options/Horizontal Line |

---

## 10. Top 10 gaps

1. **No paginated/section engine.** The document is one growing sheet (`PageCanvas.tsx:50-58`), so breaks, columns, line numbers, page borders, and "apply to this section" cannot behave like Word.
2. **No Page Setup dialog or real page model.** Margins are 96-DPI px, there is no gutter, mirror, multiple-pages, paper source, header/footer distance, or vertical alignment; `Custom Margins…` is a toast.
3. **Arrange is a stub.** There is no floating-object/group/z-order model; Position, Wrap Text, Rotate only toast, and Bring/Send/Selection Pane/Align/Group are absent.
4. **The design model is missing.** No theme colors/fonts/effects, no style definitions, no paragraph-spacing presets, no Set as Default; applying a theme force-sets fonts on all text and destroys direct formatting.
5. **Page Borders is a boolean CSS outline.** No Borders and Shading dialog, style/color/width/art, per-side control, apply-to, options, or reliable printing.
6. **Watermark is a `window.prompt` plus fixed CSS.** No Printed Watermark dialog, picture watermark, scale/washout, font/color/size, Horizontal layout, remove semantics, or per-section placement.
7. **Line Numbers and Hyphenation are entirely absent.** No ribbon controls, dialogs, model fields, manual hyphenation, or rendering.
8. **Breaks and Columns are incomplete.** Breaks inserts only a visual page-break node; Columns offers 1–4 counts with no Left/Right presets, More Columns dialog, spacing/line-between controls, column break, or section scoping.
9. **Paragraph/layout state is global, not per paragraph.** Right indent is a no-op, left indent also indents the right side, spacing is a global CSS variable, and the Paragraph dialog is unreachable.
10. **DOCX export/import does not preserve layout or design.** Export hard-codes 1" margins and Calibri 11 and omits size/orientation/columns/theme/watermark/borders; import loses section properties entirely.

---

## 11. Open questions and version caveats

1. **Theme/style-set/effect names**: Only "Gallery" (theme) and "Basic/Elegant" (style set) are named in the video. The lists in §3 are cross-version examples. Lock the target Word build before treating any name as canonical.
2. **Watermark presets**: The six phrases are stable, but the exact set of diagonal/horizontal variants, the Office.com command, and "Save Selection to Watermark Gallery" vary by build.
3. **Line-number "Count by" semantics**: Whether Word renumbers the printed sequence (1, 2) or prints original line positions (1, 3) when counting by 2 needs verification against a live document before implementation.
4. **Mirror + top gutter**: Word may constrain gutter position when Mirror margins/Book fold is active. Verify in the target build.
5. **Responsive ribbon breakpoints**: Not specified; depends on window width/DPI. Preserve group semantics and launchers rather than pixel-copying a screenshot.
6. **Paper sizes**: The list is printer-dependent; a web app should include the common set plus custom width/height.
7. **Vertical alignment "Justified"**: Only visible when the section's text does not fill the page; exact paragraph distribution behavior should be tested against Word.
8. **Page Border art list**: The number and names of art borders vary by Office build and installed language packs.
9. **Effects gallery**: Word 365's newer theme set may add effects not present in Word 2013/2019; do not treat the listed names as exhaustive.
10. **Video narration**: The presenter occasionally conflates style sets with paragraph spacing (`[D 00:06:23]`) and demonstrates controls in a personal order rather than ribbon order. Ribbon order in §2.1/§3.1 comes from the UI, not the narration sequence.

---

## 12. Sources

Primary:

- `research/videos/YJjYHRIiDzQ.en.srt` — Layout tab walkthrough (cleaned transcript: `%TEMP%\opencode\layout.txt`).
- `research/videos/fL1hd6NlPsM.en.srt` — Design tab walkthrough (cleaned transcript: `%TEMP%\opencode\design.txt`).
- Current app source, read-only audit: `src/components/ribbon/LayoutTab.tsx`, `src/components/ribbon/DesignTab.tsx`, `src/context.ts`, `src/lib/constants.ts`, `src/components/PageCanvas.tsx`, `src/components/Ruler.tsx`, `src/editor/extensions.ts`, `src/editor/actions.ts`, `src/lib/docx.ts`, `src/styles/word.css`, `src/App.tsx`.

Secondary (standard Word behavior; titles rather than URLs because Word's support URLs change):

- Microsoft Support: "Change margins in Word"
- Microsoft Support: "Set page setup options"
- Microsoft Support: "Use section breaks to change the layout or formatting"
- Microsoft Support: "Change the line spacing in Word"
- Microsoft Support: "Adjust indents and spacing in Word"
- Microsoft Support: "Turn on and adjust hyphenation in Word"
- Microsoft Support: "Wrap text around a picture in Word"
- Microsoft Support: "Add a border to a page"
- Microsoft Support: "Insert a watermark"
- Microsoft Support: "Change the page background color"
- Microsoft Support: "Customize or create new styles"
- Microsoft Support: "Change the default font or text color"
- Microsoft Support: "Change the look and feel of your document with themes"
- Microsoft Press / Office training material on theme paragraph-spacing presets.

Captured evidence frames: `research/frames` (when populated, name files by the `hh:mm:ss` keys above).






