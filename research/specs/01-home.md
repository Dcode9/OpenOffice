# Microsoft Word Home Tab - Exhaustive UI Specification

Status: research complete  
Target: Microsoft Word for Microsoft 365 (Windows desktop ribbon)  
Primary reference: `research/videos/Uriqg5T8Uzo.en.srt` ("Home tab in depth")  
Secondary reference: `research/videos/2MCmnr2L50o.en.srt` (complete Word course)

This document describes the Home tab as it appears in the reference video, with exact left-to-right order, control types, dropdown contents, dialog contents, and behavior. It is a build target, not a description of the current app.

---

## 1. Exact left-to-right ribbon layout

### 1.1 Global ribbon frame

The application title bar and Quick Access Toolbar sit above the ribbon. The ribbon tab row, left to right, is:

`File | Home | Insert | Draw | Design | Layout | References | Mailings | Review | View | Help`

- `Home` is selected.
- The right side of the tab row contains `Comments`, `Editing` (markup mode), `Share`, and the ribbon collapse chevron. These are outside the Home tab itself.
- Group names appear at the bottom of each group, separated by thin vertical dividers.
- Each group body has a fixed height of roughly two control rows. Controls must not wrap to a third row.
- Dialog launchers are small square buttons with a southeast arrow in the group's bottom-right corner.

### 1.2 Home tab group order

Full-width desktop target, left to right:

1. `Clipboard`
2. `Font`
3. `Paragraph`
4. `Styles`
5. `Editing`
6. `Voice`
7. `Sensitivity`
8. `Editor`
9. `Add-ins`

Notes:

- Word builds vary. `Voice`, `Sensitivity`, and `Editor` are present in the reference video and in Microsoft 365 builds; they can be absent or disabled by license, tenant policy, or build.
- Third-party add-in groups (for example, the reference capture's `AI Perfect Assistant`) can appear after `Add-ins`. They are not part of the Word Home tab and are excluded from this specification.
- At narrow widths, Word collapses whole groups into a single button with a dropdown rather than allowing horizontal scrolling. The table below describes the full-width state.

### 1.3 Clipboard group

Group width: roughly one big button plus one stack of three small buttons.  
Group label: `Clipboard`  
Dialog launcher: yes, bottom-right; opens the Office Clipboard task pane.

| Position | Control | Type | Visible label / tooltip | Notes |
|---|---|---|---|---|
| Left, full height | Paste | Big split button | `Paste`; tooltip `Paste (Ctrl+V)` | Top/main area pastes using the current default. Bottom caret opens Paste Options. Icon: clipboard with paper. |
| Right, row 1 | Cut | Small button with icon and label | `Cut`; tooltip `Cut (Ctrl+X)` | Scissors icon. Disabled when there is no selection. |
| Right, row 2 | Copy | Small button with icon and label | `Copy`; tooltip `Copy (Ctrl+C)` | Two-sheet icon. Disabled when there is no selection. |
| Right, row 3 | Format Painter | Small button with icon and label | `Format Painter`; tooltip includes `Ctrl+Shift+C` / `Ctrl+Shift+V` | Paintbrush icon. Single click paints once; double-click locks the painter until Escape or another click. |
| Bottom-right | Clipboard launcher | Dialog launcher | `Office Clipboard` | Opens the Clipboard task pane. |

The Paste button must be a true split button: clicking the icon/label pastes immediately; clicking only the caret opens the menu. The caret must not trigger a paste.

### 1.4 Font group

Group width: roughly 300-340 px at 100% scaling.  
Group label: `Font`  
Dialog launcher: yes, bottom-right; opens the Font dialog on the `Font` tab.

#### Row 1

| Position | Control | Type | Visible label / tooltip | Notes |
|---|---|---|---|---|
| 1 | Font | Editable combo box | Current font name; tooltip `Font (Ctrl+Shift+F)` | Width roughly 140 px. Shows theme fonts, recent fonts, and all fonts. Text is previewed in its own typeface. |
| 2 | Font Size | Editable combo box | Current size; tooltip `Font Size (Ctrl+Shift+P)` | Width roughly 45-55 px. Accepts typed point sizes. |
| 3 | Grow Font | Icon button | Tooltip `Grow Font (Ctrl+Shift+>)` | `A` with an up arrow. Increases to the next size step, not always +1. |
| 4 | Shrink Font | Icon button | Tooltip `Shrink Font (Ctrl+Shift+<)` | `A` with a down arrow. Decreases to the previous size step, not always -1. |
| 5 | Text Effects and Typography | Dropdown button | `Text Effects and Typography` | Glowing `A` icon. Opens a gallery plus the effects/typography menu. |

#### Row 2

| Position | Control | Type | Visible label / tooltip | Notes |
|---|---|---|---|---|
| 1 | Bold | Toggle icon button | `Bold (Ctrl+B)` | `B`. Active/shaded when the selection is bold. |
| 2 | Italic | Toggle icon button | `Italic (Ctrl+I)` | `I`. Active/shaded when italic. |
| 3 | Underline | Split icon button | `Underline (Ctrl+U)` | `U` plus caret. Main area toggles single underline; caret opens underline styles/color. |
| 4 | Strikethrough | Toggle icon button | `Strikethrough` | `abc` with a line through it. Ribbon applies single strikethrough only. |
| 5 | Subscript | Toggle icon button | `Subscript (Ctrl+=)` | `x2` with lowered 2. Mutually exclusive with superscript. |
| 6 | Superscript | Toggle icon button | `Superscript (Ctrl+Shift+=)` | `x2` with raised 2. Mutually exclusive with subscript. |
| 7 | Font Color | Split icon button | `Font Color` | `A` with a colored underline plus caret. Main area applies the last-used color; caret opens the palette. |
| 8 | Text Highlight Color | Split icon button | `Text Highlight Color` | Highlighter icon with a colored underline plus caret. Main area applies the last-used highlight; caret opens the palette. |
| 9 | Change Case | Dropdown button | `Change Case (Shift+F3)` | `Aa` icon. Opens the case menu. |
| 10 | Clear All Formatting | Icon button | `Clear All Formatting` | Eraser icon. Applies Normal style and clears direct formatting. |

The Font group must show actual point sizes in the size box, never pixels. Font size is a character property stored in points.

### 1.5 Paragraph group

Group width: roughly 340-370 px at 100% scaling.  
Group label: `Paragraph`  
Dialog launcher: yes, bottom-right; opens the Paragraph dialog on the `Indents and Spacing` tab.

#### Row 1

| Position | Control | Type | Visible label / tooltip | Notes |
|---|---|---|---|---|
| 1 | Bullets | Split icon button | `Bullets` | Bullet-list icon plus caret. Main area toggles the last-used bullet; caret opens the Bullets menu. |
| 2 | Numbering | Split icon button | `Numbering` | Numbered-list icon plus caret. Main area toggles the last-used number format; caret opens the Numbering menu. |
| 3 | Multilevel List | Split icon button | `Multilevel List` | Outline-list icon plus caret. Main area applies the current multilevel list; caret opens the List Library. |
| 4 | Sort | Icon button | `Sort` | `A` over `Z` with a down arrow. Opens the Sort Text dialog. |
| 5 | Show/Hide Paragraph Marks | Toggle icon button | `Show/Hide ¶ (Ctrl+Shift+8)` | Pilcrow icon. Active when formatting marks are visible. |
| 6 | Shading | Split icon button | `Shading` | Paint-bucket icon plus caret. Main area applies the last-used shading; caret opens the shading palette. |
| 7 | Borders | Split icon button | `Borders` | Window/border icon plus caret. Main area applies the last-used border setting; caret opens the Borders menu. |

#### Row 2

| Position | Control | Type | Visible label / tooltip | Notes |
|---|---|---|---|---|
| 1 | Decrease Indent | Icon button | `Decrease Indent (Ctrl+Shift+M)` | Outdent icon. Removes one indent level or one tab stop. |
| 2 | Increase Indent | Icon button | `Increase Indent (Ctrl+M)` | Indent icon. Adds one indent level or one tab stop. |
| 3 | Align Left | Toggle icon button | `Align Left (Ctrl+L)` | Four horizontal lines flush left. Default alignment. |
| 4 | Center | Toggle icon button | `Center (Ctrl+E)` | Four centered lines. |
| 5 | Align Right | Toggle icon button | `Align Right (Ctrl+R)` | Four lines flush right. |
| 6 | Justify | Toggle icon button | `Justify (Ctrl+J)` | Four lines flush both edges. |
| 7 | Line and Paragraph Spacing | Dropdown button | `Line and Paragraph Spacing` | Horizontal lines with up/down arrow plus caret. Opens the spacing menu. |

Only one of Align Left / Center / Align Right / Justify is active at a time for a simple paragraph selection. The four alignment buttons must be adjacent and in the order Left, Center, Right, Justify; they must not be split into separate stacks around the line-spacing button.

If an East Asian language is enabled, Word can insert two text-direction buttons after Justify. They are conditional and not part of the default English layout.

### 1.6 Styles group

Group label: `Styles`  
Dialog launcher: yes, bottom-right; opens the Styles task pane.

Layout:

- A single horizontal Quick Styles gallery fills the group body.
- Style cards show a formatted sample (`AaBbCc` or similar) above the style name. The card itself is a live preview of the style.
- Visible full-width cards include, at minimum: `Normal`, `No Spacing`, `Heading 1`, `Heading 2`, `Heading 3`, `Title`, `Subtitle`, `Subtle Emphasis`, `Emphasis`, `Intense Emphasis`, `Strong`, `Quote`, `Intense Quote`, `Subtle Reference`, `Intense Reference`, `Book Title`, `List Paragraph`. Actual set and order depend on the document template.
- The currently applied style is outlined/shaded.
- A `More` chevron / expand arrow sits at the right edge of the gallery. It opens the expanded gallery and the style commands.
- The gallery uses horizontal scrolling or page arrows when there are more styles than fit.
- Hovering a style previews it on the document where Live Preview is enabled.

There is no `Change Styles` dropdown in modern Word; that moved to the Design tab.

### 1.7 Editing group

Group label: `Editing`  
Dialog launcher: none.

Three stacked buttons, top to bottom:

| Position | Control | Type | Visible label / tooltip | Notes |
|---|---|---|---|---|
| Row 1 | Find | Button with icon and label | `Find (Ctrl+F)` | Magnifier icon. Opens the Navigation pane with focus in the search box. |
| Row 2 | Replace | Button with icon and label | `Replace (Ctrl+H)` | Replace icon. Opens the Find and Replace dialog on the Replace tab. |
| Row 3 | Select | Dropdown button with icon and label | `Select` | Selection icon plus caret. Opens the Select menu. |

The three controls are compact, not large buttons. `Find` should not open a generic search popover in the top-right; Word opens the Navigation pane on the left.

### 1.8 Voice group

Group label: `Voice`

One split button:

- Main/top area: microphone icon plus `Dictate`. Starts dictation immediately.
- Bottom caret: opens the Dictate menu with `Dictate` and `Transcribe` (and build-dependent language/settings items).

The button can be absent when dictation is unavailable. The group must not show placeholder buttons that do nothing.

### 1.9 Sensitivity group

Group label: `Sensitivity`

One button:

- Shield/label icon plus `Sensitivity`.
- Clicking opens a hierarchical menu of labels published to the signed-in user, for example `Personal`, `Public`, `General`, `Confidential`, `Highly Confidential`, with sublabels such as `Confidential \ All Employees`.
- The currently applied label is checked/selected. Label descriptions appear as tooltips.
- The menu can include `Learn more` / help.
- If no labels are configured or the user is not signed in, the button is disabled/greyed.

Label names are tenant-defined and must not be hardcoded in the UI.

### 1.10 Editor group

Group label: `Editor`

One button:

- Editor/check icon plus `Editor`.
- Clicking opens the Editor pane docked at the right.
- No dropdown.
- The pane can show an Editor Score and categories such as spelling, grammar, clarity, conciseness, vocabulary, formality, similarity, and document stats.

### 1.11 Add-ins group

Group label: `Add-ins`

One button:

- Add-ins/puzzle icon plus `Add-ins`.
- Opens the Office Add-ins dialog with `My Add-ins`, store/popular add-ins, and `Get Add-ins`/store search.
- Installed third-party add-ins can add their own groups to the right of this group; those are not part of the Word specification.

### 1.12 Responsive behavior

Word does not horizontally scroll the Home tab. At narrower widths it collapses groups in priority order:

1. Styles gallery shrinks and then collapses to a single `Styles` button with dropdown.
2. Groups become single buttons with dropdowns (for example, `Font`, `Paragraph`, `Clipboard`).
3. Labels disappear before icons.
4. Tiny groups such as `Editor` and `Add-ins` may collapse to icons.
5. The ribbon can be collapsed entirely with the chevron, leaving only tab names.

The target should preserve group order and never wrap controls onto a third row.

---

## 2. Dropdown, popover, and gallery contents

### 2.1 Paste split button

Main click: paste using the current default paste behavior.

Caret menu:

1. `Keep Source Formatting (K)`
2. `Merge Formatting (M)`
3. `Picture` (available when the clipboard contains suitable content; also labelled `Paste as Picture` in some builds)
4. `Keep Text Only (T)`
5. separator
6. `Paste Special...`
7. `Set Default Paste...`

Contextual variants can appear above the standard choices, for example `Link & Keep Source Formatting`, `Use Destination Theme`, `Keep Source Formatting & Link Data`, or table-specific paste options. The base four choices must always be present when applicable.

Behavior:

- `Keep Source Formatting` preserves fonts, sizes, colors, and paragraph formatting from the source.
- `Merge Formatting` adopts the destination formatting but keeps emphasis such as bold/italic.
- `Keep Text Only` strips all source formatting and uses the destination formatting.
- `Picture` rasterizes the clipboard content.
- Paste options also appear in the small `Paste Options` smart tag immediately after a Ctrl+V paste.

#### Paste Special dialog

Title: `Paste Special`

Contents:

- `Source:` static text describing the source application/content.
- `As:` list box with contextual formats, typically:
  - Microsoft Word Document Object
  - Formatted Text (RTF)
  - Unformatted Text
  - HTML Format
  - Unformatted Unicode Text
  - Picture (Enhanced Metafile)
  - Bitmap
  - Device Independent Bitmap
  - Windows Metafile
  - Other OLE/format-specific entries as applicable
- `Paste` radio button.
- `Paste link` radio button, disabled when linking is not supported.
- `Display as icon` checkbox.
- `Result` / description area showing what will be inserted.
- `OK` and `Cancel`.

#### Set Default Paste

Opens Word Options > Advanced > `Cut, copy, and paste` with:

- `Pasting within the same document`
- `Pasting between documents`
- `Pasting between documents when style definitions conflict`
- `Pasting from other programs`
- `Insert/paste pictures as`
- `Keep bullets and numbers when pasting text with Keep Text Only option`
- `Show Paste Options button when content is pasted`
- `Use smart cut and paste`
- `Settings...` for smart cut and paste

### 2.2 Office Clipboard task pane

Title: `Clipboard`

Header controls:

- `Options` dropdown.
- `Clear All`.

Body:

- Item counter such as `3 of 24`.
- Up to 24 clipboard items, newest at the top.
- Each item shows a source icon, a text/image preview, and a dropdown containing `Paste` and `Delete`.
- Clicking an item pastes it at the insertion point.
- `Paste All` button.
- `Clear All` clears both the Office Clipboard and the Windows system clipboard.

`Options` menu:

- `Show Office Clipboard Automatically`
- `Show Office Clipboard When Ctrl+C Pressed Twice`
- `Collect Without Showing Office Clipboard`
- `Show Office Clipboard Icon on Taskbar`
- `Show Status Near Taskbar When Copying`

Behavior:

- The Office Clipboard holds 24 items; the Windows system clipboard holds one.
- Copying from any Office program while an Office app is open adds to the Office Clipboard.
- Ctrl+V pastes from the system clipboard, not from a selected Office Clipboard item.
- Closing all Office programs clears the Office Clipboard.

### 2.3 Font list dropdown

The font combo is editable and opens a list with, in order:

1. Current font name in the edit box.
2. `Theme Fonts` section:
   - `(Headings)` theme heading font.
   - `(Body)` theme body font.
3. `Recently Used Fonts` section.
4. `All Fonts` alphabetical list.
5. Optional `Fonts`/`More Fonts...` entry if the build supports it.

Each font name is rendered in its own typeface. Typing in the combo autocompletes/filters to the first matching font. Enter applies; Escape closes without applying. Hover can preview on selected text where Live Preview is enabled.

### 2.4 Font Size dropdown

Editable combo. Dropdown values:

`8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72`

Behavior:

- Accepts any typed point size from 1 to 1638.
- Enter applies; Up/Down arrows step through valid values.
- Unit is points (pt), not pixels.
- Mixed sizes show blank or indeterminate.
- Grow/shrink move to the next/previous size in the size sequence; below 12 pt Word uses 1 pt steps. Minimum is 1 pt.

### 2.5 Underline split button

Caret menu:

1. `Underline` (`Ctrl+U`) - toggles single underline.
2. `Double Underline` (`Ctrl+Shift+D`).
3. `Underline Color` submenu:
   - `Automatic`
   - Theme Colors
   - Standard Colors
   - `More Colors...`
4. `More Underlines...` - opens the Font dialog on the `Font` tab with the underline style list focused.

Main click toggles the current underline style. The selected underline style persists for the session and across documents.

### 2.6 Text Effects and Typography

Clicking the button opens a gallery of preformatted effect combinations plus a menu. Gallery items preview live on hover and apply on click. Menu structure:

- `Outline`
  - `No Outline`
  - Outline presets (theme-colored outlines, weights)
  - `More Outline Colors...`
  - `Weight`
  - `Dashes`
- `Shadow`
  - `No Shadow`
  - Outer, Inner, Perspective shadow galleries
  - `Shadow Options...`
  - `More Shadow Colors...`
- `Reflection`
  - `No Reflection`
  - Reflection variations
  - `Reflection Options...`
- `Glow`
  - `No Glow`
  - Glow variations
  - `More Glow Colors...`
  - `Glow Options...`
- `Number Styles`
  - `Default`
  - `Lining`
  - `Old-style`
- `Ligatures`
  - `None`
  - `Standard Only`
  - `Standard and Contextual`
  - `Historical and Discretionary`
  - `All`
- `Stylistic Sets`
  - `Default`
  - Set numbers supported by the font (1-20)
- `Use Contextual Alternates` (checkable where exposed)

Clicking the main button must not apply an arbitrary effect; it opens the gallery/menu. The full advanced controls live in the Font dialog's `Advanced` tab.

### 2.7 Text Highlight Color

Main click applies the last-used highlight color. Caret opens:

- `No Color`
- `Yellow`
- `Bright Green`
- `Turquoise`
- `Pink`
- `Blue`
- `Red`
- `Dark Blue`
- `Teal`
- `Green`
- `Violet`
- `Dark Red`
- `Dark Yellow`
- `Gray-50%`
- `Gray-25%`
- `Black`

Selecting a color both applies it and makes it the new main-button color. Highlighting is character-level and is not part of a style. In Word, Clear All Formatting does not remove highlighting.

### 2.8 Font Color

Main click applies the last-used font color. Caret opens:

- `Automatic`
- `Theme Colors` heading
  - 10 columns x 5 rows of theme swatches:
    - White, Background 1
    - Black, Text 1
    - Dark Blue, Text 2
    - Accent 1-6
    - Hyperlink / Followed Hyperlink where applicable
    - Lighter/darker 80%, 60%, 40%, 25% variants
- `Standard Colors` heading
  - `Dark Red`
  - `Red`
  - `Orange`
  - `Yellow`
  - `Light Green`
  - `Green`
  - `Light Blue`
  - `Blue`
  - `Dark Blue`
  - `Purple`
- `More Colors...`
- `Gradient`

`More Colors...` opens the Colors dialog:

- `Standard` tab: hexagon palette and transparency.
- `Custom` tab: color model, numeric values, hex value, preview, `OK`, `Cancel`.

### 2.9 Change Case

Menu labels exactly:

1. `Sentence case.`
2. `lowercase`
3. `UPPERCASE`
4. `Capitalize Each Word`
5. `tOGGLE cASE`

No `Small Caps` and no `All Caps` here; those are Font dialog effects. Case changes must preserve all character formatting (bold, italic, color, size, highlights) and must not merge or drop paragraphs.

### 2.10 Bullets menu

1. `Recently Used Bullets` (gallery of recent bullet choices)
2. `Bullet Library` (built-in bullet symbols, fonts, and picture bullets)
3. `Change List Level` submenu: levels 1-9
4. `Define New Bullet...`
5. `None`

`Define New Bullet` dialog:

- `Symbol...`
- `Picture...`
- `Font...`
- `Alignment`: `Left`, `Centered`, `Right`
- Preview
- `OK`, `Cancel`

Bullet behavior:

- Main button toggles bullets using the last-used bullet.
- Enter creates the next bullet; Enter on an empty bullet ends the list and removes that bullet.
- Applying bullets creates a hanging indent so wrapped lines align under the text, not under the bullet.
- The list-level change applies to the current paragraph(s) without leaving the list.

### 2.11 Numbering menu

1. `Recently Used Numbering`
2. `Numbering Library` (1., 1), (1), a., A., i., I., etc.)
3. `Change List Level` submenu: levels 1-9
4. `Define New Number Format...`
5. `Set Numbering Value...`
6. `None`

`Define New Number Format` dialog:

- `Number style` dropdown
- `Font...`
- `Format` field (number followed by punctuation)
- `Alignment`: `Left`, `Centered`, `Right`
- Preview
- `OK`, `Cancel`

`Set Numbering Value` dialog:

- `Start new list` / `Continue previous list`
- `Set value to` numeric field
- Preview of the resulting number
- `OK`, `Cancel`

### 2.12 Multilevel List menu

1. `Current List` / `List Library` thumbnail gallery (1/1.1/1.1.1, I/A/1, bullet/number mixes)
2. `Change List Level` submenu: levels 1-9
3. `Define New Multilevel List...`
4. `Define New List Style...`
5. `None`

`Define New Multilevel List` dialog:

- `Click level to modify` list of levels 1-9.
- `Number style for this level`.
- `Font...`.
- `Enter formatting for number`.
- `Previous level number` / `Include level number from`.
- `Restart list after` option.
- `Position`: Number alignment, Aligned at, Text indent at, Add tab stop at.
- `Link level to style`.
- `Legal style numbering`.
- Preview.
- `OK`, `Cancel`.

Main multilevel button applies the current list style. It must not toggle a flat bullet list.

### 2.13 Sort

Clicking `Sort` opens `Sort Text` (outside a table) or `Sort` (inside a table).

Sort Text dialog:

- `Sort by` dropdown.
- `Type`: `Text`, `Number`, `Date`.
- `Ascending` / `Descending`.
- `Then by` rows with the same controls.
- `Options...`
- `OK`, `Cancel`.

Options dialog:

- `Separate fields at`: `Tabs`, `Commas`, `Other` (with character field).
- `Sort column only`.
- `Case sensitive`.
- `Sort fields` vs `Sort whole paragraphs` depending context.
- `OK`, `Cancel`.

Inside a table, the dialog adds:

- `Header row` checkbox.
- `Sort by` columns by header name.
- `Then by` columns.

### 2.14 Line and Paragraph Spacing menu

Exact order:

1. `1.0`
2. `1.15`
3. `1.5`
4. `2.0`
5. `2.5`
6. `3.0`
7. separator
8. `Line Spacing Options...`
9. `Add Space Before Paragraph` or `Remove Space Before Paragraph`
10. `Add Space After Paragraph` or `Remove Space After Paragraph`

The add/remove labels are state-dependent. `Line Spacing Options...` opens the Paragraph dialog on `Indents and Spacing`.

### 2.15 Shading menu

- `Theme Colors`
- `Standard Colors`
- `No Color`
- `More Colors...`

Clicking a swatch applies shading to the selected text, or to the current paragraph when there is no text selection. The main button applies the last-used shading.

### 2.16 Borders menu

1. `Bottom Border`
2. `Top Border`
3. `Left Border`
4. `Right Border`
5. `No Border`
6. `All Borders`
7. `Outside Borders`
8. `Inside Borders`
9. `Inside Horizontal Border`
10. `Inside Vertical Border`
11. `Diagonal Down Border`
12. `Diagonal Up Border`
13. `Horizontal Line`
14. `Draw Table`
15. `View Gridlines`
16. `Borders and Shading...`

The main button applies the last-used border. The icon can change to reflect the last-used setting.

`Borders and Shading` dialog tabs:

- `Borders`
  - `Setting`: None, Box, Shadow, 3-D, Custom
  - `Style`
  - `Color`
  - `Width`
  - `Preview` with individual edge toggles
  - `Apply to`: Paragraph, Text, Table, Cell
  - `Options...`
  - `Horizontal Line...`
  - `OK`, `Cancel`
- `Page Border`
  - Same border controls plus `Art`, `Width`, `Apply to`: Whole document, This section, This section - first page only, This section - all but first page only
  - `Options...`
- `Shading`
  - `Fill`
  - `Style`
  - `Color`
  - `Preview`
  - `Apply to`

### 2.17 Styles gallery and More menu

Gallery:
- Horizontal cards with formatted previews and names.
- Current style outlined.
- Hover previews where Live Preview is enabled.
- Scroll arrows / expand chevron at the right.

`More` / expanded gallery commands:

- `Create a Style`
- `Clear Formatting`
- `Save Selection as a New Quick Style...`
- `Apply Styles...`
- `Manage Styles...`
- Style list / gallery for additional styles
- Sometimes `Rename...`, `Remove from Quick Style Gallery`, `Add to Quick Style Gallery`, and `Modify...` on right-click.

Dialog launcher:
- Opens the `Styles` task pane.
- Pane contents: style list with previews, `Options...`, `New Style`, `Style Inspector`, `Manage Styles`, and list filtering (`Recommended`, `In Use`, `In Current Document`, `All Styles`).

Right-click a style card:
- `Update <Style> to Match Selection`
- `Modify...`
- `Select All <n> Instance(s)`
- `Rename...`
- `Remove from Quick Style Gallery`
- `Add to Quick Style Gallery`
- `Delete...`

### 2.18 Find and Replace

`Find` opens the Navigation pane at the left with:

- Search box.
- `Results`, `Headings`, `Pages` tabs (build-dependent).
- Result snippets with highlighting.
- `Search for` / options: `Match case`, `Match whole word`, `Use wildcards`, `Sounds like`, `Find all word forms`, `Format`, `Special`.
- `Advanced Find...` / `Go To...` access.
- `Close` button.

`Replace` opens the Find and Replace dialog on the `Replace` tab:

- `Find what`
- `Replace with`
- `More >>` / `<< Less`
- `Search`: `All`, `Down`, `Up`
- `Match case`
- `Match whole word`
- `Use wildcards`
- `Sounds like`
- `Find all word forms`
- `Format`
- `Special`
- `No Formatting`
- `Replace`
- `Replace All`
- `Find Next`
- `Go To` tab
- `Find` tab
- `Cancel`
- Status message such as `Word made 23 replacements.`

### 2.19 Select menu

1. `Select All` (`Ctrl+A`)
2. `Select Objects`
3. `Select All Text with Similar Formatting`
4. `Selection Pane...` where available

`Select Objects` changes the pointer to a selection arrow and selects non-text objects. `Select All Text with Similar Formatting` selects text matching the current formatting/style.

### 2.20 Voice menu

`Dictate` main click starts dictation. Caret menu:

- `Dictate`
- `Transcribe`
- separator
- `Language` / `Spoken language` submenu
- `Settings` / `Dictation Settings`
- `Help` where available

Dictation toolbar appears while active and includes microphone on/off, settings, language, auto-punctuation, and close.

`Transcribe` opens the Transcribe pane:

- `Start recording`
- `Upload audio`
- Supported formats: `.wav`, `.mp4`, `.m4a`, `.mp3`
- Speaker separation, timestamps, edit transcript, rename speakers
- `Add all to document` / insert selected sections
- `Save transcript`
- Monthly minute limit (reference video shows 300 minutes/month)

### 2.21 Sensitivity menu

Dynamic hierarchical list of tenant labels. Typical unconfigured defaults:

- `Personal`
- `Public`
- `General`
- `General \ Anyone (unrestricted)`
- `General \ All Employees (unrestricted)`
- `Confidential`
- `Confidential \ Anyone (unrestricted)`
- `Confidential \ All Employees`
- `Confidential \ Trusted People`
- `Highly Confidential`
- `Highly Confidential \ All Employees`
- `Highly Confidential \ Specific People`

Each item can have a color bar, description tooltip, and encryption indicator. The selected label is checked. Removing a label may require a justification depending on policy.

### 2.22 Editor pane

- Header: `Editor` with close button.
- Editor Score (for example `93%`).
- Categories:
  - `Spelling`
  - `Grammar`
  - `Clarity`
  - `Conciseness`
  - `Vocabulary`
  - `Formality`
  - `Similarity`
- Each issue shows the offending text, an explanation, and actions such as `Accept`, `Ignore`, `Ignore All`, `Don't check for this issue`.
- Writing style selector: `Formal`, `Casual`, `Professional` (build-dependent).
- `Document stats`: words, words per sentence, sentences per paragraph, readability, etc.
- `Check for similarity to online sources` where available.

### 2.23 Add-ins dialog

- `My Add-ins`
- `Office Add-ins` / store
- `Admin Managed` where applicable
- Search box
- Popular add-ins
- `Get Add-ins` / `Store`
- Add-in details, `Add`, `Remove`
- `Cancel` / close

---

## 3. Font and Paragraph dialogs

### 3.1 Font dialog

Opened by:
- Font group dialog launcher.
- `Ctrl+D`.
- `More Underlines...`.
- `Ctrl+Shift+F` focuses the font name in the dialog/ribbon.

Title: `Font`  
Tabs: `Font`, `Advanced`

#### Font tab

Groups and controls, top to bottom:

1. `Font:`
   - Editable dropdown listing theme fonts, recent fonts, and all fonts.
   - Previewed in each font's own typeface.
2. `Font style:`
   - `Regular`
   - `Italic`
   - `Bold`
   - `Bold Italic`
3. `Size:`
   - Editable list: 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72, plus typed values 1-1638.
4. `Font color:`
   - `Automatic`
   - Theme Colors
   - Standard Colors
   - `More Colors...`
5. `Underline style:`
   - `(none)`
   - `Single`
   - `Words only`
   - `Double`
   - `Thick`
   - `Dotted`
   - `Dotted Heavy`
   - `Dash`
   - `Dashed Heavy`
   - `Long Dash`
   - `Long Dash Heavy`
   - `Dot Dash`
   - `Dash Dot Heavy`
   - `Dot Dot Dash`
   - `Dash Dot Dot Heavy`
   - `Wave`
   - `Wavy Heavy`
   - `Wavy Double`
   - `Wavy Dash`
   - Exact list/order can vary slightly by Word build; all of these or their localized equivalents should be supported.
6. `Underline color:`
   - `Automatic`
   - Theme Colors
   - Standard Colors
   - `More Colors...`
7. `Effects` checkboxes:
   - `Strikethrough`
   - `Double strikethrough`
   - `Superscript`
   - `Subscript`
   - `Small caps`
   - `All caps`
   - `Hidden`
   - Older Word versions also exposed `Shadow`, `Outline`, `Emboss`, and `Engrave`; modern Word uses Text Effects for these.
8. `Preview`
   - Live sample using the current settings and the selected text where possible.
   - The preview box is not editable.
9. Buttons:
   - `Set As Default`
   - `Text Effects...`
   - `OK`
   - `Cancel`

Behavior:

- Superscript and subscript are mutually exclusive.
- Small caps renders lowercase letters as small capitals; All caps renders all letters as capitals without changing the underlying text.
- Hidden text is only visible when `Show/Hide ¶` is on.
- `Set As Default` prompts: set the default font for all new documents based on the Normal template. `Yes` / `No`.
- `Text Effects...` opens the text-effects formatting controls (outline, shadow, reflection, glow, etc.).
- `OK` applies to the current selection or to the insertion point for future typing.
- `Cancel` discards all changes.
- Mixed selections show blank/indeterminate fields. Changing one field applies only that property.

#### Advanced tab

Groups:

1. `Character Spacing`
   - `Scale:` editable percentage, 1%-600%, default 100%.
   - `Spacing:` `Normal`, `Expanded`, `Condensed`; `By:` points.
   - `Position:` `Normal`, `Raised`, `Lowered`; `By:` points.
   - `Kerning for fonts:` checkbox; `Points and above:` numeric field.
2. `OpenType Features`
   - `Ligatures:` `None`, `Standard Only`, `Standard and Contextual`, `Historical and Discretionary`, `All`.
   - `Number spacing:` `Default`, `Proportional`, `Tabular`.
   - `Number forms:` `Default`, `Lining`, `Old-style`.
   - `Stylistic sets:` `Default`, set numbers supported by the font (typically 1-20).
   - `Use contextual alternates` checkbox.
3. `Preview`
   - Live sample.
4. Buttons:
   - `Set as Default`
   - `OK`
   - `Cancel`

Units and validation:

- `Scale` is a percentage.
- `Spacing`, `Position`, and `Kerning` use points.
- Invalid or out-of-range values revert to the previous value; fields must not accept NaN/blank as applied values.
- Changing `Spacing` to Normal disables `By`; changing `Position` to Normal disables `By`.

### 3.2 Paragraph dialog

Opened by:
- Paragraph group dialog launcher.
- `Line Spacing Options...` from the line-spacing menu.
- Right-click > `Paragraph...`.
- Keyboard/menu command where available.

Title: `Paragraph`  
Tabs: `Indents and Spacing`, `Line and Page Breaks`

#### Indents and Spacing tab

1. `General`
   - `Alignment:` `Left`, `Centered`, `Right`, `Justified`.
   - `Outline level:` `Body Text`, `Level 1` through `Level 9`.
2. `Indentation`
   - `Left:` numeric field with unit and spin buttons.
   - `Right:` numeric field with unit and spin buttons.
   - `Special:` `(none)`, `First line`, `Hanging`.
   - `By:` numeric field, enabled for First line/Hanging.
   - `Mirror indents` checkbox. When checked, Left/Right become Inside/Outside for facing pages.
   - `Automatically adjust right indent when document grid is defined` checkbox (where grid is enabled).
3. `Spacing`
   - `Before:` numeric field in points.
   - `After:` numeric field in points.
   - `Line spacing:` `Single`, `1.5 lines`, `Double`, `At least`, `Exactly`, `Multiple`.
   - `At:` numeric field, enabled for At least/Exactly/Multiple. For Multiple, the value is a multiplier; for At least/Exactly, points.
   - `Don't add space between paragraphs of the same style` checkbox.
   - `Snap to grid when document grid is defined` checkbox.
4. `Preview`
   - Sample paragraph showing alignment, indent, and spacing.
5. Buttons:
   - `Tabs...`
   - `Set as Default`
   - `OK`
   - `Cancel`

Behavior:

- `Alignment` applies to whole paragraphs.
- `Outline level` is independent of heading style but is normally set by heading styles.
- `Special: First line` indents only the first line; `Hanging` outdents the first line and indents the rest.
- `Don't add space...` suppresses Before/After between consecutive paragraphs of the same style.
- `Set as Default` applies to the current document/template's Normal style after confirmation.
- Mixed selections show blank/indeterminate fields; changing a field applies it to the whole selection.

#### Line and Page Breaks tab

1. `Pagination`
   - `Widow/Orphan control` (on by default).
   - `Keep with next`.
   - `Keep lines together`.
   - `Page break before`.
2. `Formatting exceptions`
   - `Suppress line numbers`.
   - `Don't hyphenate`.
3. Buttons:
   - `Tabs...`
   - `Set as Default`
   - `OK`
   - `Cancel`

Behavior:

- `Widow/Orphan control` prevents a single line of a paragraph at the top/bottom of a page.
- `Keep with next` keeps the paragraph on the same page as the following paragraph, commonly used for headings.
- `Keep lines together` prevents a paragraph from splitting across pages.
- `Page break before` forces the paragraph to start a new page; it has no effect on the first paragraph of a document.
- `Suppress line numbers` excludes the paragraph from line numbering.
- `Don't hyphenate` disables automatic hyphenation for the paragraph.

#### Tabs dialog

Opened by `Tabs...` from either Paragraph tab.

- `Tab stop position:` numeric field.
- `Default tab stops:` numeric field.
- `Alignment`: `Left`, `Center`, `Right`, `Decimal`, `Bar`.
- `Leader`: `1 None`, `2 ....`, `3 ----`, `4 ____`.
- `Set`, `Clear`, `Clear All`.
- Tab stop list.
- `OK`, `Cancel`.

### 3.3 Borders and Shading dialog

Opened from `Borders` > `Borders and Shading...`.

Tabs:

- `Borders`
- `Page Border`
- `Shading`

Borders tab:

- `Setting`: `None`, `Box`, `Shadow`, `3-D`, `Custom`.
- `Style` list.
- `Color`.
- `Width`.
- `Preview` with edge toggle buttons.
- `Apply to`: `Paragraph`, `Text`, `Table`, `Cell`.
- `Options...`.
- `Horizontal Line...`.
- `OK`, `Cancel`.

Page Border tab:

- Same plus `Art`, `Width`, `Apply to` page scope.
- `Options...`.
- `OK`, `Cancel`.

Shading tab:

- `Fill`.
- `Style`.
- `Color`.
- `Preview`.
- `Apply to`.
- `OK`, `Cancel`.

---

## 4. Behavior notes, state, and keyboard shortcuts

### 4.1 Selection and application rules

- Character formatting (font, size, bold, italic, underline, color, highlight, effects) applies to the current selection. With a collapsed selection, it sets the format for text typed next.
- Paragraph formatting (alignment, indents, spacing, lists, borders, shading) applies to every paragraph touched by the selection. With a collapsed selection, it applies to the current paragraph.
- Toggle buttons show active/shaded state when the entire selection has the property. A mixed selection shows an indeterminate state where supported.
- The font name and size boxes show blank/indeterminate for mixed values.
- Buttons disabled by context (Cut/Copy with no selection, Paste with an empty clipboard, etc.) must be visibly disabled, not toast-only placeholders.
- Applying a style replaces paragraph style formatting but generally preserves direct character formatting unless the style defines it.
- Clear All Formatting removes direct character and paragraph formatting and applies Normal; it does not remove text highlighting in Word.

### 4.2 Dropdown and split-button rules

- Main area and caret are separate hit targets. Main area applies/toggles; caret opens the menu.
- Menus close on selection, Escape, or click outside.
- The last-used color, highlight, underline style, border, and shading persist for the session.
- Dynamic menus (`Recently Used...`) are populated from actual recent use; when empty, show the library/defaults.
- Galleries preview on hover and commit on click. Leaving without a click restores the original formatting.
- A menu opened from a ribbon button should anchor under that button and stay within the viewport.
- Keyboard: Enter/Space opens; Up/Down moves; Left/Right opens/collapses submenus; Escape closes one level at a time.

### 4.3 Clipboard behavior

- Cut/Copy put content on both the system clipboard and, when an Office app is open, the Office Clipboard.
- Paste without a caret choice uses the default paste setting.
- Paste Options smart tag appears after paste and offers the same choices as the Paste menu.
- Format Painter copies character and paragraph formatting, not content. Single-click paints once; double-click paints until Escape.
- Pasting into a list can continue numbering depending on paste options/settings.
- Pasting text only removes emphasis formatting as well as font/color/size.

### 4.4 List behavior

- Toggling bullets/numbers on a paragraph adds a hanging indent.
- Enter creates the next list item.
- Enter on an empty list item ends the list and removes that item.
- Tab/Shift+Tab demote/promote list levels when the caret is in a list.
- Change List Level changes the level without leaving the list.
- Restart/continue numbering is available from the Numbering menu or right-click.
- Multilevel lists maintain independent counters per level.

### 4.5 Style behavior

- Clicking a style applies it to the current paragraph(s) or to the selected text for character styles.
- Heading styles carry outline levels and populate the Navigation pane.
- `Normal` resets paragraph style but does not clear direct character formatting.
- `No Spacing` removes paragraph spacing but keeps the Normal font defaults.
- Updating a style changes all text using that style; direct formatting overrides remain.
- The Styles pane can show Recommended, In Use, In Current Document, or All styles.

### 4.6 Find/Replace behavior

- Find opens a non-modal Navigation pane; the document remains editable.
- Search highlights are temporary and disappear when the pane closes.
- Match case, whole word, wildcards, sounds like, and all word forms are search options.
- Replace can replace one occurrence or all; Replace All reports the count and can be undone as one action.
- Go To supports Page, Section, Line, Bookmark, Comment, Footnote, Endnote, Field, Table, Graphic, Equation, Object, Heading.
- `Ctrl+F`, `Ctrl+H`, `Ctrl+G` focus Find, Replace, and Go To respectively.

### 4.7 Keyboard shortcuts

| Action | Shortcut |
|---|---|
| Cut / Copy / Paste | `Ctrl+X` / `Ctrl+C` / `Ctrl+V` |
| Paste Special | `Ctrl+Alt+V` |
| Copy formatting / Paste formatting | `Ctrl+Shift+C` / `Ctrl+Shift+V` |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` |
| Select all | `Ctrl+A` |
| Bold / Italic / Underline | `Ctrl+B` / `Ctrl+I` / `Ctrl+U` |
| Double underline | `Ctrl+Shift+D` |
| Subscript / Superscript | `Ctrl+=` / `Ctrl+Shift+=` |
| Grow font / Shrink font | `Ctrl+Shift+>` / `Ctrl+Shift+<` |
| Font dialog | `Ctrl+D` |
| Font name / Font size | `Ctrl+Shift+F` / `Ctrl+Shift+P` |
| Change case | `Shift+F3` |
| Clear character formatting | `Ctrl+Space` |
| Reset paragraph formatting | `Ctrl+Q` |
| Normal style | `Ctrl+Shift+N` |
| Heading 1 / 2 / 3 | `Ctrl+Alt+1` / `Ctrl+Alt+2` / `Ctrl+Alt+3` |
| Apply Styles | `Ctrl+Shift+S` |
| Align left / center / right / justify | `Ctrl+L` / `Ctrl+E` / `Ctrl+R` / `Ctrl+J` |
| Increase / decrease indent | `Ctrl+M` / `Ctrl+Shift+M` |
| Single / double / 1.5 line spacing | `Ctrl+1` / `Ctrl+2` / `Ctrl+5` |
| Add/remove 12 pt before paragraph | `Ctrl+0` |
| Show/hide formatting marks | `Ctrl+Shift+8` |
| Find / Replace / Go To | `Ctrl+F` / `Ctrl+H` / `Ctrl+G` |
| Close pane/dialog | `Esc` |
| Format Painter lock | double-click Format Painter; `Esc` to release |

### 4.8 State, accessibility, and edge cases

- Ribbon controls need accessible names and tooltips; icon-only buttons must expose the same label as their tooltip.
- Split buttons expose `Main action` and `Options` as separate accessible actions.
- Active toggles use `aria-pressed`; menus use appropriate menu roles.
- Focus returns to the invoking ribbon button when a dialog/menu closes.
- Menus must be keyboard navigable and must not trap focus.
- High-contrast and dark themes must preserve active-state contrast.
- At high DPI, icons and popovers scale without clipping.
- In read-only/protected mode, formatting commands disable but Find/Select and navigation remain available where Word allows.
- In IME composition, formatting shortcuts must not fire mid-composition.
- Empty document: Paste/Cut/Copy/Format Painter disabled; Find works; lists/styles apply to the current empty paragraph.
- Collapsed ribbon: tab click shows the ribbon temporarily; chevron pin/unpin state persists.
- Dialog changes are atomic: Cancel restores all values changed since opening.

---

## 5. Gap analysis: current app vs Word

### 5.1 Current implementation summary

The current Home tab (`src/components/ribbon/HomeTab.tsx`) contains only:

`Clipboard | Font | Paragraph | Styles | Editing`

It does not contain `Voice`, `Sensitivity`, `Editor`, or `Add-ins`.

Current data:
- `FONTS`: 20 hardcoded fonts (`src/lib/constants.ts`).
- `FONT_SIZES`: 16 hardcoded sizes.
- `TEXT_COLORS`: 30 hardcoded hex colors.
- `HIGHLIGHT_COLORS`: 16 hardcoded colors.
- `STYLES`: 10 approximate style cards.
- `LINE_SPACINGS`: 1.0, 1.15, 1.5, 2.0, 2.5, 3.0.

### 5.2 Group-by-group gaps

#### Clipboard

| Word target | Current | Gap / severity |
|---|---|---|
| Paste split button with real paste | Big `Paste` button only calls `toast('Use Ctrl+V to paste')` (`HomeTab.tsx:172`) | High: no actual command, no paste options |
| Paste Options menu, Paste Special, Set Default Paste | Caret only calls `toast('Paste options')` | High |
| Cut/Copy with state | `document.execCommand('cut'/'copy')` (`HomeTab.tsx:174-175`) | Medium: not integrated with editor/clipboard state |
| Format Painter copies formatting | Toast only (`HomeTab.tsx:176`) | High: feature is non-functional |
| Office Clipboard pane with 24 items | Missing | High |
| Dialog launcher | Missing | High |

#### Font

| Word target | Current | Gap / severity |
|---|---|---|
| Editable font combo with theme/recent/all fonts and previews | Read-only popover over 20 fonts (`HomeTab.tsx:183-209`) | High |
| Editable size combo in points, 1-1638 | Read-only popover over 16 values (`HomeTab.tsx:211-236`) | High |
| Point-based size storage and rendering | `setFontSize` stores `String(size)`; `FontSize` renders `${fontSize}px` (`src/editor/extensions.ts:17-33`); `currentSize = Number(...)` (`HomeTab.tsx:154`) | Critical: 11 pt becomes 11 px, and `11pt` becomes `NaN` |
| Grow/shrink by Word size steps | ±1 only (`HomeTab.tsx:238-239`) | Medium |
| Underline split with styles/color | Single toggle only (`HomeTab.tsx:244`) | High |
| Text Effects and Typography | Missing | High |
| Highlight split with named palette/No Color | Always opens a 16-swatch popover; no main-action split (`HomeTab.tsx:249`, `ColorButton`) | Medium |
| Font Color split with Theme/Standard/More/Gradient | Always opens 30 arbitrary swatches; labels them `Theme Colors` (`HomeTab.tsx:248`, `ColorButton`) | High |
| Change Case preserving formatting | Rebuilds text via `insertContentAt` (`src/editor/actions.ts:22-30`) | High: can drop marks, links, paragraph breaks |
| Clear All Formatting | `unsetAllMarks().clearNodes()` and computed type before clearing (`actions.ts:32-40`) | Medium: does not fully mirror Word/Normal reset |
| Font dialog + Ctrl+D | Missing | High |

#### Paragraph

| Word target | Current | Gap / severity |
|---|---|---|
| Bullets/Numbering split menus | Toggle-only buttons (`HomeTab.tsx:270-271`) | High |
| Multilevel List | Wrongly calls `toggleBulletList()` (`HomeTab.tsx:272`) | Critical |
| Change List Level / Define New / Set Value / None | Missing | High |
| Sort | Missing | High |
| Show/Hide ¶ | Missing | High |
| Shading | Missing | High |
| Borders + Borders and Shading | Missing | High |
| Decrease/Increase Indent | Custom indent attribute ±1 (`HomeTab.tsx:275-276`, `actions.ts:47-53`) | Medium: not list-aware/tab-stop aware |
| Alignment order/behavior | Left/Center and Right/Justify split into separate stacks, with line spacing between (`HomeTab.tsx:291-298`) | Medium |
| Line spacing menu | 6 multipliers only (`HomeTab.tsx:277-290`) | High: missing options/add-remove space |
| Paragraph dialog | Missing | High |
| Before/After spacing | `setParagraphSpacing` exists but no UI (`actions.ts:60`) | High |

#### Styles

| Word target | Current | Gap / severity |
|---|---|---|
| Full Quick Styles gallery | 10 styles with approximate sample cards (`constants.ts:47-58`) | High |
| Real style engine | Only maps heading/paragraph/blockquote (`HomeTab.tsx:156-167`) | High |
| Title/Subtitle/No Spacing active states | Title/Subtitle never active; No Spacing treated as Normal (`HomeTab.tsx:156-161`) | High |
| Quote vs Intense Quote | Both apply the same blockquote (`HomeTab.tsx:159-166`) | High |
| Normal vs No Spacing | Both apply plain paragraph (`HomeTab.tsx:166`) | High |
| More menu | Create a Style toast, Clear Formatting, Table of Contents (`HomeTab.tsx:311-327`) | High: wrong commands/placement |
| Styles pane/launcher | Missing | High |
| Save/Modify/Manage styles | Missing | High |

#### Editing

| Word target | Current | Gap / severity |
|---|---|---|
| Find opens Navigation pane left | Custom `FindReplace` panel in top-right (`HomeTab.tsx:332`, `FindReplace.tsx`) | High |
| Replace dialog with Replace All count | Same Find panel toggled (`HomeTab.tsx:334`) | High |
| Select dropdown | Direct `Select All` button (`HomeTab.tsx:335`) | High |
| Select Objects / Similar Formatting | Missing | High |
| Go To / Advanced Find | Missing | High |
| Search options | Only Match case and Match whole word (`FindReplace.tsx`) | Medium |

#### Voice / Sensitivity / Editor / Add-ins

| Word target | Current | Gap / severity |
|---|---|---|
| Voice > Dictate/Transcribe | Missing | Medium |
| Sensitivity labels | Missing | Medium |
| Editor pane | Missing | Medium |
| Add-ins dialog | Missing | Medium |

### 5.3 Critical defects to fix first

1. **Font size unit is wrong.** `FontSize` writes pixels. Word sizes are points. This makes every size wrong and can produce `NaN`.
2. **Multilevel List is a flat bullet toggle.** It does not create or apply a multilevel list.
3. **Change Case destroys inline structure.** `textBetween(..., ' ')` plus plain-text `insertContentAt` loses marks, links, and paragraph breaks.
4. **Format Painter and Paste are placeholders.** Both show toasts instead of performing the commands.
5. **No dialog launchers.** Font and Paragraph groups cannot open their dialogs, so a large part of Word's Home tab is unreachable.
6. **Paragraph formatting is incomplete.** No borders, shading, sort, show/hide, list definitions, or before/after spacing.
7. **Styles are cosmetic.** The app has style cards but no style model, so style behavior, active states, and the Styles pane cannot match Word.
8. **Editing is a custom popover, not Word's Find/Replace/Select model.** No Go To, Select Objects, or similar formatting.
9. **Paste/Clipboard is absent.** No paste options, Paste Special, clipboard history, or multi-item pane.
10. **Ribbon does not repackage for narrow widths.** Groups need Word-like collapse behavior rather than wrapping or clipping.

### 5.4 Top 10 gaps (priority order)

1. Font size unit/point handling and editable size box.
2. Font and Paragraph dialog launchers plus full dialogs.
3. Clipboard: real Paste split menu, Paste Special, Format Painter, Office Clipboard pane.
4. Paragraph group completeness: list menus, multilevel, Sort, Show/Hide, Shading, Borders, line-spacing options, Paragraph dialog.
5. Font group completeness: editable font/size, underline styles/color, Text Effects, true Theme/Standard colors, Font dialog.
6. Styles: real style engine, full gallery, correct active/apply behavior, Styles pane, More/Save/Manage commands.
7. Editing: Navigation pane Find, Replace dialog, Select dropdown, Go To/Advanced Find.
8. Change Case non-destructive transformation.
9. Voice, Sensitivity, Editor, Add-ins groups.
10. Word-like ribbon collapse/responsive behavior and accessible split-button/menu states.

### 5.5 Suggested implementation order

1. Fix font size storage/render to points and make size editable.
2. Add a shared dialog primitive and implement Font and Paragraph dialogs.
3. Replace placeholder Clipboard controls with real commands and menus.
4. Rebuild Paragraph group around real list/paragraph commands and add missing controls.
5. Expand Font group and add Text Effects.
6. Introduce a real style model and Styles pane.
7. Replace the custom Find panel with Word-style Find/Replace/Select.
8. Add Voice/Sensitivity/Editor/Add-ins surfaces.
9. Make Change Case mark-preserving.
10. Add responsive group collapse and accessibility polish.

---

## 6. Frame capture table

Use these video frames as visual references. Timestamps are `hh:mm:ss` from the primary Home-tab video. Capture the full Word window at native resolution, with the Home tab selected and a document containing formatted text, a list, and at least two paragraphs.

| Timestamp | What UI to capture |
|---|---|
| `00:00:56` | Full Home tab and all group labels left to right |
| `00:01:30` | Clipboard group: Paste, Cut, Copy, Format Painter, launcher |
| `00:03:29` | Paste Special dialog |
| `00:05:42` | Format Painter single-click vs double-click behavior |
| `00:08:17` | Office Clipboard task pane with multiple items |
| `00:10:12` | Font group, both rows, including font/size combos |
| `00:12:17` | Underline dropdown with styles and color |
| `00:14:05` | Text Effects and Typography gallery/menu |
| `00:15:51` | Font dialog, Font tab |
| `00:16:45` | Font dialog, Advanced tab |
| `00:17:36` | Paragraph group and Bullets dropdown |
| `00:18:24` | Numbering dropdown and Set Numbering Value |
| `00:23:12` | Line and Paragraph Spacing dropdown |
| `00:25:35` | Paragraph dialog, Indents and Spacing and Line and Page Breaks |
| `00:26:15` | Styles gallery and More menu |
| `00:30:15` | Editing > Select dropdown |
| `00:31:07` | Voice group and Dictate/Transcribe menu |
| `00:32:00` | Sensitivity menu |
| `00:32:34` | Editor pane |
| `00:34:56` | Add-ins dialog |

Additional optional captures: `00:20:41` indent controls; `00:21:07` Sort dialog; `00:23:49` Shading menu; `00:24:02` Borders menu; `00:30:58` Selection Pane.

---

## Appendix A - Sources

- Primary video: `research/videos/Uriqg5T8Uzo.en.srt` (Home tab in depth).
- Secondary video: `research/videos/2MCmnr2L50o.en.srt` (complete Word course).
- BetterSolutions Home tab reference: https://bettersolutions.com/word/ribbon/home-tab.htm
- AddBalance Home tab reference: https://www.addbalance.com/word/ribbonsHome.htm
- Microsoft Support, Adjust indents and spacing: https://support.microsoft.com/en-us/word/adjust-indents-and-spacing
- Microsoft Support, Line and page breaks: https://support.microsoft.com/en-us/word/line-and-page-breaks
- Microsoft Support, Change the spaces between text: https://support.microsoft.com/en-us/word/change-the-spaces-between-text-in-word
- Microsoft Support, Add or remove text effects: https://support.microsoft.com/en-us/word/add-or-remove-text-effects
- Microsoft Support, Apply sensitivity labels: https://support.microsoft.com/en-us/office/security-privacy/apply-sensitivity-labels-to-your-files
- Microsoft Support, Transcribe your recordings: https://support.microsoft.com/en-us/word/transcribe-your-recordings
- Office Watch, OpenType ligatures: https://office-watch.com/2022/opentype-ligatures-in-word/

## Appendix B - Assumptions

- Target is the Windows desktop ribbon at full width, not Word for the web or Mac.
- The video's build is treated as the reference for group order and feature presence. License-gated groups can be hidden but must not be replaced by fake controls.
- Localized labels are out of scope; this document uses English (United States) labels.
- The third-party `AI Perfect Assistant` group in `research/refs/home-top.png` is environment-specific and intentionally excluded.
