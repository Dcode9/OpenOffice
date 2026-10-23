# Spec 02 — Insert Tab (Microsoft Word clone)

**Source:** `research/videos/0Y5ai_u5etI.mp4` ("Microsoft Word Insert Tab and Ribbon in Depth", 30:22).
The referenced `.en.srt` did not exist in the repo (only the MP4 was downloaded; YouTube subtitle fetch failed with HTTP 429). I generated `research/videos/0Y5ai_u5etI.en.srt` locally with faster-whisper (`small.en`) from the MP4 audio, so quoted wording is machine-transcribed and timestamps are approximate (±1 s). UI labels below were cross-checked against Microsoft support and Word ribbon references.

**Version shown:** Microsoft 365 Word for Windows (Filigree cover page, Icons, 3D Models, Reuse Files, modern Screenshot). Some galleries are build/theme dependent; membership counts are noted where Microsoft varies them.

**Scope:** Exact ribbon order/labels/sizes, every gallery/popover/dialog, insertion behavior, contextual tabs, shortcuts, and gaps vs. the current app.

---

## 1. Exact Insert ribbon layout (left → right)

Groups in order:

`Pages` · `Tables` · `Illustrations` · `Reuse Files` · `Add-ins` · `Media` · `Links` · `Comments` · `Header & Footer` · `Text` · `Symbols`

Notes:
- "Big" = 3-line large ribbon button. "Small" = one-line button. "Split" = main click plus separate caret. "Stack" = two or more small buttons stacked vertically in one ribbon column.
- On narrow windows Word collapses later groups into an overflow menu; the logical order above does not change.
- `Reuse Files` and `Add-ins` are visible in the source build (Reuse Files demonstrated at 14:53). Add-ins may be hidden by policy/tenant.
- There is **no "Contents"/Table of Contents group on Insert** in Word. TOC lives on **References → Table of Contents**.

| Group | Control | Size | Affordance | Direct action / opens |
|---|---|---|---|---|
| Pages | **Cover Page** | Big | Caret (dropdown) | Opens cover-page gallery; last item removes current cover page |
| Pages | **Blank Page** | Big | Direct | Inserts one complete blank page at cursor |
| Pages | **Page Break** | Big | Direct | Inserts a manual page break at cursor (Ctrl+Enter) |
| Tables | **Table** | Big | Caret + hover grid picker | 10×8 hover grid, live in-document preview; menu below grid |
| Illustrations | **Pictures** | Big | Caret | Menu: This Device…, Stock Images…, Online Pictures… |
| Illustrations | **Shapes** | Big | Caret | Shape gallery (Recently Used + 8 categories) |
| Illustrations | **Icons** | Big | Direct | Searchable monochrome icon library dialog/pane |
| Illustrations | **3D Models** | Big | Caret | Menu: This Device…, Stock 3D Models… |
| Illustrations | **SmartArt** | Big | Direct | "Choose a SmartArt Graphic" dialog |
| Illustrations | **Chart** | Big | Direct | "Insert Chart" dialog |
| Illustrations | **Screenshot** | Big | Caret | Available-window thumbnails + Screen Clipping |
| Reuse Files | **Reuse Files** | Big | Direct | Opens Reuse Files task pane (recent docs, search, Open/Insert Link) |
| Add-ins | **Get Add-ins** | Small | Direct | Office Add-ins store dialog |
| Add-ins | **My Add-ins** | Small | Caret | Installed add-ins gallery; "See My Add-ins" |
| Media | **Online Video** | Big | Direct | "Insert Video"/online video address dialog |
| Links | **Link** | Big | Split + caret | Main: Insert Hyperlink dialog (Ctrl+K). Caret: Recent Items, Search for Files…, Insert Link… |
| Links | **Bookmark** | Small | Direct | Bookmark dialog |
| Links | **Cross-reference** | Small | Direct | Cross-reference dialog |
| Comments | **Comment** | Big | Direct | Creates a threaded comment at selection (Ctrl+Alt+M) |
| Header & Footer | **Header** | Big | Caret | Header gallery + More/Edit/Remove/Save |
| Header & Footer | **Footer** | Big | Caret | Footer gallery + More/Edit/Remove/Save |
| Header & Footer | **Page Number** | Big | Caret | Top of Page, Bottom of Page, Page Margins, Current Position, Format Page Numbers…, Remove Page Numbers |
| Text | **Text Box** | Big | Caret | Built-in gallery, Draw Text Box, More from Office.com, Save Selection |
| Text | **Quick Parts** | Big | Caret | AutoText, Document Property, Field…, Building Blocks Organizer…, Save Selection… |
| Text | **WordArt** | Big | Caret | 15-style WordArt gallery |
| Text | **Drop Cap** | Big | Caret | None, Dropped, In Margin, Drop Cap Options… |
| Text | **Signature Line** | Big | Split + caret | Microsoft Office Signature Line… ; Add Signature Service… |
| Text | **Date & Time** | Big | Direct | Date and Time dialog |
| Text | **Object** | Big | Split + caret | Object… dialog; Text from File… |
| Symbols | **Equation** | Big | Split | Main: insert equation placeholder + Equation tab. Caret: built-in equations, Insert New Equation, Save Selection |
| Symbols | **Symbol** | Big | Caret | Recently used/common symbol grid + More Symbols… |

---

## 2. Full contents of every dropdown, popover, and gallery

### 2.1 Cover Page (Pages)

Gallery is a scrollable thumbnail grid (typically 4 columns), grouped as a "Built-in" gallery. Names in current Microsoft 365 builds:

1. Alphabet
2. Austin
3. Banded
4. Contrast
5. Cubicles
6. Facet
7. Filigree
8. Grid
9. Integral
10. Ion (Light)
11. Ion (Dark)
12. Motion
13. Retrospect
14. Semaphore
15. Sideline
16. Slice (Light)
17. Slice (Dark)
18. The Denim
19. Whisp
20. Wood Type

Some builds also expose `Element` and `ViewMaster`; older Word galleries used `Annual`, `Austere`, `Conservative`, `Exposure`, `Mod`, `Pinstripes`, `Puzzle`, `Stacks`, `Tiles`, `Transcend`. Treat gallery membership as data-driven; the source video shows 9–13 visible at once and selects **Filigree**.

Bottom commands:
- **More Cover Pages from Office.com** (source video explicitly shows this button)
- **Remove Current Cover Page** (only meaningful when a cover page exists; video shows it replacing the gallery after insertion)
- **Save Selection to Cover Page Gallery…** (appears when cover-page content is selected / in customize workflows)

**Behavior:** inserts a cover-page building block as a new first page; existing content moves down. Placeholders are content controls (Title, Subtitle, Author, Date, Company, Abstract depending on design). Theme fonts/colors drive styling. The gallery entry is replaced by "Remove Current Cover Page" once inserted. Selecting another design swaps the current cover page. Contextual tab: none.

### 2.2 Table (Tables)

**Hover grid:** 10 columns × 8 rows maximum. Hovering highlights cells, shows live table preview in the document, and displays `"<cols> x <rows> Table"` (columns first, rows second), e.g. `3 x 5 Table`. Leaving the grid resets the label to "Insert Table".

Menu below the grid:
- **Insert Table…**
- **Draw Table**
- **Convert Text to Table…**
- **Excel Spreadsheet**
- **Quick Tables ▸**

**Insert Table… dialog:**
- Table size: **Number of columns** (default 5), **Number of rows** (default 2)
- AutoFit behavior: **Fixed column width** (default, with value), **AutoFit to contents**, **AutoFit to window**
- **Remember dimensions for new tables** checkbox
- OK / Cancel

**Draw Table:** pointer becomes a pencil. Drag an outer rectangle, then drag horizontal/vertical lines and cell boxes. Esc ends drawing. Contextual **Table Design** and **Layout** tabs appear.

**Convert Text to Table… dialog:**
- Table size: columns/rows (pre-filled from selected text)
- AutoFit behavior (same three choices)
- **Separate text at:** Paragraphs / Tabs / Commas / Other (with character field)
- OK / Cancel

**Excel Spreadsheet:** inserts an embedded Excel worksheet object with its own grid, formula bar, and sheet tabs. Clicking outside returns to Word; double-click edits in Excel.

**Quick Tables submenu (built-in):**
- Double Table 1
- Calendar 1
- Calendar 2
- Calendar 3
- Calendar 4
- Matrix
- Tabular List 1
- With Subheads 1
- With Subheads 2

(Some builds expose additional Calendar/Tabular List variants. These are formatted table building blocks, fully editable.)

**Behavior:** inserted table defaults to the document's table style, header row enabled from the grid path, auto width, cursor in first cell. Contextual **Table Design** and **Layout** tabs.

### 2.3 Pictures (Illustrations)

Dropdown:
- **This Device…** — opens the Insert Picture file dialog (file types: bmp, gif, jpg/jpeg, png, tif/tiff, svg, emf, wmf, webp in modern builds)
- **Stock Images…** — Microsoft 365 stock/royalty-free library (requires signed-in subscription); search, category filters, licensing note, Insert
- **Online Pictures…** — image search (Bing) dialog; search box, filter/license dropdown, results grid, Insert

**Behavior:** picture inserts inline by default (`In Line with Text`), at the cursor. Selecting it shows the **Picture Format** contextual tab (Remove Background, Corrections, Color, Artistic Effects, Transparency, Picture Effects, Picture Layout, Align, Group, Rotate, Crop, Wrap Text, Position, Size). Video demonstrates Remove Background, crop/resize with Shift for aspect ratio, and Wrap Text → In Front of Text.

### 2.4 Shapes (Illustrations)

Gallery structure (scrollable, collapsible categories; ~170 shapes):

- **Recently Used Shapes** (initially empty)
- **Lines** — Line, Line Arrow, Double Arrow, Elbow Connector, Elbow Connector Arrow, Curved Connector, Curved Connector Arrow
- **Rectangles** — Rectangle, Rounded Rectangle, Snip Same Side Corner Rectangle, Snip Top Corner Rectangle, Snip Diagonal Corner Rectangle, Snip Single Corner Rectangle
- **Basic Shapes** — Oval, Isosceles Triangle, Right Triangle, Parallelogram, Trapezoid, Diamond, Regular Pentagon, Hexagon, Heptagon, Octagon, Decagon, Dodecagon, Pie, Chord, Teardrop, Frame, Half Frame, Corner, L-Shape, Diagonal Stripe, Cross, Plaque, Cylinder, Can, Cube, Bevel, Donut, No Symbol, Block Arc, Folded Corner, Smiley Face, Heart, Lightning Bolt, Sun, Moon, Cloud, Arc, Double Bracket, Double Brace, Left/Right Bracket, Left/Right Brace, Bracket Pair, Brace Pair
- **Block Arrows** — Right/Left/Up/Down Arrow, Left-Right Arrow, Up-Down Arrow, Quad Arrow, Left-Right-Up Arrow, Bent Arrow, U-Turn Arrow, Left-Up Arrow, Bent-Up Arrow, Curved Right/Left/Up/Down Arrow, Striped Right Arrow, Notched Right Arrow, Pentagon, Chevron, Right Arrow Callout, Down Ribbon, etc.
- **Equation Shapes** — Plus, Minus, Multiply, Divide, Equal, Not Equal, Approximately Equal, Congruent/Identical (build-dependent)
- **Flowchart** — Process, Alternate Process, Decision, Data, Predefined Process, Internal Storage, Document, Multidocument, Terminator, Preparation, Manual Input, Manual Operation, Connector, Off-page Connector, Card, Punched Tape, Summing Junction, Or, Collate, Sort, Extract, Merge, Stored Data, Delay, Sequential Access Storage, Magnetic Disk, Direct Access Storage, Display
- **Stars and Banners** — Explosion 1, Explosion 2, 4-Point Star, 5-Point Star, 8-Point Star, 16-Point Star, 24-Point Star, 32-Point Star, Up Ribbon, Down Ribbon, Curved Up Ribbon, Curved Down Ribbon, Vertical Scroll, Horizontal Scroll, Wave, Double Wave, Left-Right Ribbon
- **Callouts** — Rectangular Callout, Rounded Rectangular Callout, Oval Callout, Cloud Callout, Line Callout 1–4, Accent Callout 1–4, Border and Accent Callout 1–4

**Behavior:** choose shape → crosshair → click or drag on page. Inserts a floating drawing object in front of text by default. Contextual **Shape Format** tab with Shape Styles, Shape Fill, Shape Outline, Shape Effects, WordArt Styles, Arrange, Size. Video demonstrates line/arrow insertion, outline weight, block arrows, equation shapes, flowcharts, callouts, and moving/resizing.

### 2.5 Icons (Illustrations)

- Opens a dialog/pane with a **search box** (video searches "music" and picks a headset) and a scrollable grid of monochrome SVG icons.
- Icons are black/gray, recolorable after insertion via **Graphics Format** contextual tab (Graphics Fill, Graphics Outline, Graphics Styles).
- Multi-select is supported in modern builds; **Insert** button commits.
- Category filters vary by build; search is the reliable navigation shown in the video.
- Inserted as a floating graphic; default wrap In Line with Text. Video changes wrap to In Front of Text.

### 2.6 3D Models (Illustrations)

Dropdown:
- **This Device…** — file picker for .glb/.fbx/.3mf/.obj/.ply/.stl (as supported)
- **Stock 3D Models…** — Microsoft online 3D library; search, categories, preview, Insert

**Behavior:** inserts a 3D object. Selecting it shows the **3D Model** contextual tab with Views (preset orientations), Align, Size, Pan & Zoom, and Reset. A central handle rotates the model in 3D (video rotates a drum kit). Video notes 3D Models is not present in every Word version.

### 2.7 SmartArt (Illustrations)

**"Choose a SmartArt Graphic" dialog:**
- Left rail types: **All**, **List**, **Process**, **Cycle**, **Hierarchy**, **Relationship**, **Matrix**, **Pyramid**, **Picture**, **Office.com**, **Other** (Other only with custom layouts)
- Center: layout thumbnails with names (e.g. Basic Block List, Basic Process, Basic Cycle, Organization Chart, Basic Radial, Basic Matrix, Basic Pyramid, Picture Accent List)
- Right: larger preview + description of when to use the layout
- OK / Cancel

**Behavior:** inserts the chosen diagram with a text pane; each shape has editable text. Selecting it shows **SmartArt Design** (Layouts, Change Colors, SmartArt Styles, Reset, Text Pane) and **Format** tabs. Video uses a Cycle layout and types "Step one… Step two…".

### 2.8 Chart (Illustrations)

**"Insert Chart" dialog:** 17 chart types in the left rail:
**Column, Line, Pie, Bar, Area, X Y (Scatter), Map, Stock, Surface, Radar, Treemap, Sunburst, Histogram, Box & Whisker, Waterfall, Funnel, Combo.**
Center shows subtype thumbnails for the selected type (2-D/3-D, clustered/stacked/100%, markers, etc.); hover enlarges preview. OK / Cancel.

**Behavior:** on OK, Word inserts the chart and opens an embedded Excel worksheet with sample categories/series. Editing cells updates the chart live; close the Excel window to finish. Contextual **Chart Design** (Chart Layouts, Chart Styles, Change Colors, Switch Row/Column, Select Data, Change Chart Type) and **Format** tabs. Video edits "Sales" to "subgenres", changes quarter labels, resizes by corner handle, and uses Wrap Text/Position.

### 2.9 Screenshot (Illustrations)

Dropdown:
- **Available Windows** — thumbnail of every open window, plus a "Whole screen" style entry where available
- **Screen Clipping** — dims the desktop, cursor becomes a crosshair; drag a rectangle to capture

**Behavior:** clicking a window thumbnail inserts a static screenshot of that window inline. Screen Clipping inserts only the dragged region. The screenshot is a picture: **Picture Format** tab appears; Shift-drag preserves aspect ratio (video demonstrates warping without Shift). Printing prints the image, not a live window.

### 2.10 Reuse Files

Opens a task pane on the right:
- Search box ("Search for files or people")
- List of recently used Word documents / cloud files with thumbnails
- Selecting a file offers **Open** or **Insert Link**
- X closes the pane

**Behavior:** Open launches the file; Insert Link inserts a hyperlink to that file at the cursor. No contextual tab.

### 2.11 Add-ins

- **Get Add-ins** — opens the Office Add-ins store dialog (search, categories, ratings, Add).
- **My Add-ins** — caret listing installed add-ins, "See My Add-ins", and admin-managed add-ins. Inserting an add-in can add its own ribbon tab or pane (e.g. Wikipedia).

### 2.12 Online Video (Media)

**Insert Video / Online Video dialog:**
- **Online video address** text field
- Preview area that resolves a valid URL
- Insert / Cancel
- Provider note: Word accepts links from supported providers (YouTube, Vimeo, SlideShare, Dailymotion, Facebook and others depending on build; the video shows a provider list and uses YouTube)

**Behavior:** inserts a playable online-video object with a poster/thumbnail at the cursor. Playback requires an internet connection; the video prints as a thumbnail only. Selecting it exposes video playback/format controls.

### 2.13 Link (Links)

Caret menu:
- **Recent Items** — list of recently used documents; clicking inserts a hyperlink to that file
- **Search for Files…** — file picker to link to a file
- **Insert Link…** — opens the Insert Hyperlink dialog (same as main button / Ctrl+K)

**Insert Hyperlink dialog:**
- Left "Link to:" options:
  - **Existing File or Web Page**
  - **Place in This Document** (headings/bookmarks tree)
  - **Create New Document**
  - **E-mail Address**
- **Text to display** (pre-filled from selection)
- **ScreenTip…** button
- Address field (URL, file path, `mailto:`, `#bookmark`)
- Browsing panes: Recent Files, Browsed Pages, Current Folder (depending on link type)
- OK / Cancel

**Behavior:** with text selected the selection becomes the link; with no selection the address is inserted as linked text. Video uses it to link a YouTube channel and to link to a bookmark. Ctrl+Click follows the link in Word. Links are stored as a `link` mark; no contextual tab (mini toolbar/right-click Edit Link).

### 2.14 Bookmark

**Bookmark dialog:**
- **Bookmark name** field (spaces not allowed; video shows the name collapsing to one token — Word uses underscore or removes spaces)
- **Sort by:** Name / Location
- Bookmark list with location reference
- **Add**, **Delete**, **Go To**
- **Cancel**

**Behavior:** inserts an invisible bookmark at the current selection/cursor. Bookmarks then appear under Link → Place in This Document. Video bookmarks "evolution of new wave", sorts by Location, then links to it.

### 2.15 Cross-reference

**Cross-reference dialog:**
- **Reference type:** Heading, Bookmark, Footnote, Endnote, Figure, Table, Equation, Numbered item
- **Insert reference to:** Heading text, Page number, Heading number, Above/Below, Number, Number (full context), etc. (options depend on type)
- **Insert as hyperlink** checkbox
- **Include above/below** checkbox (where applicable)
- **Separate numbers with:** hyphen / period / colon / em dash / en dash
- **For which item:** list of matching items
- **Insert**, **Close**

**Behavior:** inserts a REF field that displays the referenced number/text (video cross-references "Simple Minds" and the numeral `2` appears). Fields update with F9 / print preview. No contextual tab.

### 2.16 Comment (Comments)

Clicking **Comment**:
- Opens a comment card in the right margin anchored to the selection (or current paragraph)
- Card contains author avatar/name, timestamp, text box, **Post** and **Cancel** buttons
- Ctrl+Enter posts; Esc cancels
- Posted comments support **Reply**, **Resolve**, **Delete thread**, @mentions, and a **Comments** pane
- Contextual tab: none; the Review tab is where comment navigation/display lives (Show Comments, Next/Previous, Delete)

### 2.17 Header (Header & Footer)

Gallery (scrollable, ~20 built-ins):
1. Blank
2. Blank (Three Columns)
3. Austin
4. Banded
5. Facet (Even Page)
6. Facet (Odd Page)
7. Filigree
8. Grid
9. Integral
10. Ion (Dark)
11. Ion (Light)
12. Motion (Even Page)
13. Motion (Odd Page)
14. Retrospect
15. Semaphore
16. Sideline
17. Slice 1
18. Slice 2
19. ViewMaster
20. Whisp

Commands below the gallery:
- **More Headers from Office.com**
- **Edit Header**
- **Remove Header**
- **Save Selection to Header Gallery…**

**Behavior:** inserts into the header area of the current section, dims body text, and activates the contextual **Header & Footer** tab. Designs contain content controls (Document Title, Author, Date, Page Number fields) and theme styling. "Blank" is the default. Video selects **Whisp**, which provides author name and date placeholders. Header edits apply to all pages in the section unless Different First Page/Odd & Even is enabled.

### 2.18 Footer (Header & Footer)

Gallery (~20 built-ins, same design family as headers, footer layouts):
1. Blank
2. Blank (Three Columns)
3. Austin
4. Banded
5. Facet (Even Page)
6. Facet (Odd Page)
7. Filigree
8. Grid
9. Integral
10. Ion (Dark)
11. Ion (Light)
12. Motion (Even Page)
13. Motion (Odd Page)
14. Retrospect
15. Semaphore
16. Sideline
17. Slice
18. ViewMaster (Horizontal)
19. ViewMaster (Vertical)
20. Whisp

Commands below:
- **More Footers from Office.com**
- **Edit Footer**
- **Remove Footer**
- **Save Selection to Footer Gallery…**

**Behavior:** identical to Header but in the bottom margin; page-number fields are common. Video notes it works "very much the same way".

### 2.19 Page Number (Header & Footer)

Caret menu:
- **Top of Page ▸**
- **Bottom of Page ▸**
- **Page Margins ▸**
- **Current Position ▸**
- **Format Page Numbers…**
- **Remove Page Numbers**

Each of the first four opens a scrollable gallery of position/style thumbnails. Families (names shared across positions, with left/center/right variants):
- **Plain Number 1 / 2 / 3**
- **Accent Bar 1 / 2 / 3 / 4**
- **Page Number 1 / 2 / 3**
- **Page X of Y 1 / 2 / 3**
- **Brackets 1 / 2**
- **Tabs 1 / 2 / 3**
- **Thick Line 1 / 2**
- **Vertical Line 1 / 2**
- **Circle 1 / 2**
- **Bold Number 1 / 2**
- **Accent Bar, Left & Right** (Page Margins)
- **Vertical, Left & Right** (Page Margins)
- **Border, Left & Right** (Page Margins)
- **Plain Number** / **Accent Bar** / **Page X of Y** (Current Position)

**Format Page Numbers… dialog:**
- **Number format:** `1, 2, 3`; `01, 02, 03`; `i, ii, iii`; `I, II, III`; `a, b, c`; `A, B, C`; and locale variants
- **Include chapter number** checkbox → **Chapter starts with style**, **Use separator** (hyphen, period, colon, em dash, en dash)
- **Page numbering:** Continue from previous section / **Start at** (numeric, default 1)
- OK / Cancel

**Behavior:** inserts a PAGE field (and NUMPAGES for "Page X of Y") into the header/footer at the chosen alignment/position. "Remove Page Numbers" deletes the fields. Video demonstrates Top/Bottom/Margins/Current Position, the "Page 1" style, and changing the starting number to 2. No separate contextual tab beyond Header & Footer.

### 2.20 Text Box (Text)

Caret menu:
- **Built-in** gallery (36 entries, scrollable; 6 layout families × 6 design themes). Exact known entries include:
  - Simple Text Box
  - Simple Quote
  - Banded Quote (video uses this)
  - Abstract Quote
  - Sidebar (Vertical)
  - Fancy Quote
  - Austin Sidebar
  - Banded Sidebar
  - Filigree Sidebar
  - Whisp Quote
  - Alphabet Sidebar
  - Motion Quote
  - Retrospect Quote
  - Slice Quote
  - Ion Sidebar
  - Facet Quote
  - Grid Quote
  - Integral Quote
  - Semaphore Quote
  - Sideline Quote
  - The Denim Quote
  - Wood Type Quote
- **Draw Text Box**
- **More Text Boxes from Office.com…** (video explicitly mentions this)
- **Save Selection to Text Box Gallery…**

**Behavior:** built-ins insert a floating text-box shape positioned per the thumbnail, with theme fills/borders and a placeholder content control; click and type replaces the placeholder. Boxes can be dragged/resized and wrapped. **Draw Text Box** changes the cursor to a crosshair; drag to define size. Contextual **Shape Format** tab (Shape Styles, Fill, Outline, Effects, WordArt Styles, Text Direction, Align, Wrap Text, Position, Size). Video shows Banded Quote plus a hand-drawn box.

### 2.21 Quick Parts (Text)

Caret menu:
- **AutoText ▸** — built-in AutoText entries plus user-saved ones (video inserts the user's name)
- **Document Property ▸** — Author, Title, Subject, Keywords, Comments, Category, Status, Company, Manager, Publish Date, Content Status, Revision Number
- **Field…** — Field dialog: Categories, Field names, Description, Field properties, Field codes, OK/Cancel
- **Building Blocks Organizer…** — table with Name, Gallery, Category, Template, Behavior; Insert / Edit Properties / Delete / Close
- **Save Selection to Quick Part Gallery…** — Create New Building Block dialog: Name, Gallery, Category, Description, Save in, Options (Insert content only / Insert content in its own paragraph / Insert content in its own page), OK/Cancel

**Behavior:** inserts a saved building block, a document-property field/content control, or any field code at the cursor. Video demonstrates AutoText name and Document Property → Author/Publish Date/Title. Document properties update if changed in File → Info.

### 2.22 WordArt (Text)

Gallery: 15 theme-driven styles in a 3×5 grid (preview uses a capital "A"):
- Gradient Fill variants (blue/accent 1, gray, gold, green, orange, purple, red)
- Solid Fill variants
- Outline-only variants
Each style uses the current theme colors and may include shadow/reflection.

**Behavior:** modern Word inserts a text box containing "Your text here" with the chosen WordArt style, text selected; typing replaces it (video types "OMD"). No "Edit WordArt Text" dialog in the source build. Contextual **Shape Format** tab with WordArt Styles, Text Fill, Text Outline, Text Effects, plus shape fill/outline/effects. Older Word versions show an Edit WordArt Text dialog; do not implement that unless targeting legacy.

### 2.23 Drop Cap (Text)

Menu:
- **None**
- **Dropped**
- **In Margin**
- **Drop Cap Options…**

**Drop Cap dialog:**
- **Position:** None / Dropped / In margin
- **Font:** dropdown (document fonts)
- **Lines to drop:** default **3** (video changes to 2)
- **Distance from text:** default **0"**
- OK / Cancel

**Behavior:** applies to the first character of the current paragraph. Dropped enlarges the letter and wraps lines 2+ to its right; In Margin places the letter in the left margin so body text stays one block. Stored as a frame; no contextual tab. Choosing None removes it.

### 2.24 Signature Line (Text)

Main button opens **Signature Setup** dialog:
- **Suggested signer**
- **Suggested signer's title**
- **Suggested signer's e-mail address**
- **Instructions to the signer** (multi-line)
- **Allow the signer to add comments in the Sign dialog** checkbox
- **Show sign date in signature line** checkbox (default checked)
- OK / Cancel

Caret:
- **Microsoft Office Signature Line…**
- **Add Signature Service…**

**Behavior:** inserts a signature-line object showing an X, the signer's name/title/email, instructions, and a date line. Right-click → Sign to apply a digital signature. No contextual tab.

### 2.25 Date & Time (Text)

**Date and Time dialog:**
- **Available formats** list (scrollable; locale-dependent). Typical en-US entries:
  - `M/d/yyyy`
  - `dddd, MMMM d, yyyy`
  - `MMMM d, yyyy`
  - `M/d/yy`
  - `d-MMM-yy`
  - `MMMM d`
  - `h:mm am/pm`
  - `h:mm:ss am/pm`
  - `h:mm`
  - `M/d/yyyy h:mm am/pm`
  - `M/d/yyyy h:mm:ss am/pm`
  - `MMMM d, yyyy h:mm am/pm`
  - `dddd, MMMM d, yyyy h:mm am/pm`
  - `d MMMM yyyy`
  - `yyyy-MM-dd`
- **Language:** dropdown (installed proofing languages)
- **Update automatically** checkbox → inserts a DATE field instead of static text
- **Set As Default** button
- OK / Cancel

**Behavior:** inserts at cursor as static text (default) or a field. Field shows gray shading on hover and updates on open/print/F9. Video notes different formats/layouts and skips insertion.

### 2.26 Object (Text)

Main button opens **Object** dialog with two tabs.

**Create New:**
- **Object type** list: Microsoft Excel Worksheet, Microsoft Graph Chart, Microsoft Word Document, Microsoft PowerPoint Slide, Microsoft Visio Drawing, Package, Paintbrush Picture, WordPad Document (installed OLE servers determine membership)
- **Display as icon** checkbox
- OK / Cancel

**Create from File:**
- **File name** field + **Browse…**
- **Link to file** checkbox
- **Display as icon** checkbox
- OK / Cancel

Caret command: **Text from File…** (inserts the contents of another file).

**Behavior:** inserts an embedded OLE object (editable in its source app by double-click) or a linked object. Video lists Graph chart, Excel worksheet, Word document, package, Paintbrush Picture, WordPad document; explains selecting a type, OK, producing/saving the object, then closing it. No contextual tab (object-specific tabs may appear in some cases).

### 2.27 Equation (Symbols)

Main click inserts an inline equation placeholder **"Type equation here."** with the caret inside and activates the **Equation** contextual tab.

Caret gallery:
- **Area of Circle**
- **Binomial Theorem**
- **Expansion of a Sum**
- **Fourier Series**
- **Pythagorean Theorem**
- **Quadratic Formula**
- **Trig Identity 1**
- **Trig Identity 2** (video explicitly selects this family)
- separator
- **Insert New Equation**
- **Save Selection to Equation Gallery…**

(Builds vary: some list only six built-ins; source video confirms Area of Circle, Binomial Theorem and Trig Identity 2.)

**Equation tab groups:** Tools (Equation gallery, Professional, Linear, Normal Text, Save as new equation), Symbols (palette + More), Structures (Fraction, Script, Radical, Integral, Large Operator, Bracket, Function, Accent, Limit and Log, Operator, Matrix). Video types `x = y² + 78`, converts Professional/Linear, and saves as a new equation.

### 2.28 Symbol (Symbols)

Dropdown is a 4×5 grid of common/recent symbols, followed by **More Symbols…**. Commands (per Word reference): Euro, Pound, Yen, Copyright, Registered, Trademark, Plus-Minus, Not Equal To, Less-Than or Equal To, Greater-Than or Equal To, Division, Multiplication, Infinity, Micro, Alpha, Beta, Pi, Ohm, Summation, Smiley Face.

**Symbol dialog:**
- Tabs: **Symbols** / **Special Characters**
- **Font:** dropdown (Normal Text, Segoe UI Symbol, Wingdings, Wingdings 2/3, Webdings, etc.)
- **Subset:** dropdown when the font has subsets
- Scrollable character grid
- **Recently used symbols** row
- **Character code** field + **from** dropdown
- **AutoCorrect…**, **Shortcut Key…**
- **Insert**, **Cancel**

**Special Characters tab:** list of dashes, spaces, quotes, section/paragraph marks, etc., with shortcut keys; same AutoCorrect/Shortcut Key/Insert buttons.

**Behavior:** single click inserts the symbol at the cursor in the current font/size; dialog double-click or Insert inserts and keeps the dialog open. Video uses More Symbols, searches Wingdings/Webdings, and inserts ©.

---

## 3. Insertion behavior, defaults, and contextual tabs (consolidated)

| Insert | Default result in document | Defaults | Contextual tab(s) created |
|---|---|---|---|
| Cover Page | New first page building block with content controls | Theme fonts/colors; selected design | None |
| Blank Page | One empty page at cursor (page break before + after) | Letter/A4 per section | None |
| Page Break | Manual page break at cursor | — | None |
| Table (grid) | Inline table with header row | Theme table style, AutoFit window, cursor first cell | Table Design, Layout |
| Insert Table dialog | Inline table | 5 columns × 2 rows, fixed width | Table Design, Layout |
| Draw Table | Freeform table | Pencil mode, 1 pt borders | Table Design, Layout |
| Excel Spreadsheet | Embedded worksheet object | 5×3-ish grid, Sheet1 | Excel object editing; Chart tabs if chart |
| Quick Table | Preformatted table | Per building block | Table Design, Layout |
| Pictures (device/stock/online) | Inline picture | In Line with Text, original size | Picture Format |
| Shapes | Floating autoshape | In front of text; theme fill/outline | Shape Format |
| Icons | Floating SVG graphic | In line with text, black fill | Graphics Format |
| 3D Models | Floating 3D object | In line, front view | 3D Model |
| SmartArt | Inline diagram + text pane | Basic layout, theme colors | SmartArt Design, Format |
| Chart | Inline chart + embedded Excel data | Column chart, sample data | Chart Design, Format |
| Screenshot | Inline bitmap | Full window or clipped region | Picture Format |
| Reuse Files link | Hyperlink to selected file | — | None |
| Online Video | Playable video object | Poster frame, inline | Video/Format (build-dependent) |
| Link | Hyperlink mark/field | Existing file/web page | None |
| Bookmark | Invisible bookmark | Name from selection | None |
| Cross-reference | REF field text | Insert as hyperlink off | None |
| Comment | Margin comment thread | Author = signed-in user, now | None (Review tab) |
| Header/Footer | Section header/footer with fields | Blank; linked to previous | Header & Footer |
| Page Number | PAGE/NUMPAGES field in header/footer | Plain Number, start at 1 | Header & Footer |
| Text Box | Floating text box with placeholder | Theme fill/outline, in front | Shape Format |
| Quick Part | Building block / field / property | Per entry | None |
| WordArt | Floating text box with WordArt style | "Your text here", theme style | Shape Format |
| Drop Cap | Framed large first letter | Dropped, 3 lines, 0" | None |
| Signature Line | Signature line object | Show sign date on | None |
| Date & Time | Static date text or DATE field | Short date, current language | None |
| Object | OLE object / icon / file contents | Create New, first type | Object-specific |
| Equation | Inline equation placeholder | Professional layout | Equation |
| Symbol | Character at cursor | Current font/size | None |

**Shared behaviors**
- Insertion always occurs at the current selection/cursor and inherits paragraph formatting where applicable.
- Undo (Ctrl+Z) reverses any insert as one step (cover page/table/chart may take one step each).
- Most dialogs are modal and remember their last-used settings for the session.
- Galleries support hover preview where noted (Table, Cover Page, Headers, Page Numbers, Text Box, WordArt).
- Fields (PAGE, NUMPAGES, DATE, REF, DOCPROPERTY) are gray-shaded on hover and update with F9 / print.

---

## 4. Keyboard shortcuts

Verified/standard Word shortcuts relevant to Insert:

| Shortcut | Action |
|---|---|
| `Ctrl+Enter` | Insert page break |
| `Ctrl+K` | Insert hyperlink (opens Insert Hyperlink) |
| `Ctrl+Alt+M` | Insert comment |
| `Alt+=` | Insert equation |
| `Ctrl+Shift+F5` | Open Bookmark dialog |
| `Alt+Shift+D` | Insert DATE field (auto-updating date) |
| `Alt+Shift+T` | Insert TIME field |
| `F9` | Update selected fields / cross-references |
| `Ctrl+F9` | Insert empty field braces `{ }` |
| `Ctrl+Click` | Follow hyperlink |
| `Tab` / `Shift+Tab` | Next / previous table cell |
| `Alt+Shift+Up/Down` | Move current table row up/down |
| `Ctrl+Alt+C` | Insert © (copyright) |
| `Ctrl+Alt+R` | Insert ® (registered) |
| `Ctrl+Alt+T` | Insert ™ (trademark) |
| `Ctrl+Alt+E` | Insert € (euro) |
| `Alt+N` | Open Insert tab (then use arrow keys / displayed KeyTips) |
| `Esc` | Close gallery/dialog; in header/footer, exit editing where applicable |
| `Ctrl+Z` | Undo last insertion |

No default shortcut: Cover Page, Blank Page, Table, Pictures, Shapes, Icons, 3D Models, SmartArt, Chart, Screenshot, Header, Footer, Page Number, Text Box, Quick Parts, WordArt, Drop Cap, Signature Line, Date & Time dialog, Object, Symbol dialog, Online Video, Cross-reference.

---

## 5. Gap analysis vs. current app

Current implementation reviewed:
- `src/components/ribbon/InsertTab.tsx`
- `src/editor/actions.ts`
- `src/editor/extensions.ts`
- `src/lib/constants.ts`
- `src/components/PageCanvas.tsx` (header/footer/page-number rendering)
- `src/App.tsx` (header/footer/page-number state)

| # | Control | Word behavior/spec | Current app | Gap / priority |
|---|---|---|---|---|
| 1 | Cover Page | 20-design gallery, insert at document start, content controls, remove/replace, Office.com, save-to-gallery | One hardcoded paragraph stack inserted at cursor (`cover-title`, `cover-sub`, `cover-meta`, `<hr>`) | **P0** — no gallery, no remove/replace, wrong insertion point, no content controls |
| 2 | Blank Page | Inserts a real blank page (break before + after) | Calls `insertPageBreak()` — identical to Page Break | **P0** — duplicate behavior; blank page not implemented |
| 3 | Page Break | One manual break at cursor | `pageBreak` node | **P1** — works; verify pagination/print behavior |
| 4 | Table | 10×8 hover grid, live preview, label "C x R Table"; menu: Insert Table…, Draw Table, Convert Text to Table…, Excel Spreadsheet, Quick Tables | 10×8 picker + label; menu items all call `insertTable` with arbitrary sizes (Insert Table 3×3, Draw 4×4, Convert 2×3, Excel 3×3) | **P0** — menu is fake; missing all dialogs and Quick Tables |
| 5 | Table insertion options | Columns/rows, fixed width/AutoFit contents/window, header row, table style | `insertTable(rows, cols)` with `withHeaderRow: true`, no dialog, no autofit | **P1** — add Insert Table dialog and AutoFit |
| 6 | Pictures | Split menu: This Device…, Stock Images…, Online Pictures… | Single hidden file input, label "Pictures" only | **P0** — missing split menu and both online sources; no stock search |
| 7 | Shapes | ~170 autoshapes, 8 categories, real vector shapes, Shape Format tab | 12 emoji/Unicode glyphs inserted as 36px text | **P0** — not shapes; no category gallery, no fill/outline/effects, no contextual tab |
| 8 | Icons | Searchable monochrome SVG library, Graphics Format tab | Missing entirely | **P0** |
| 9 | 3D Models | This Device / Stock 3D Models, rotate handle, 3D Model tab | Missing entirely | **P1** (P0 if parity target includes it) |
| 10 | SmartArt | Choose-a-SmartArt-Graphic dialog, 11 categories, editable diagram + text pane | Missing entirely | **P0** |
| 11 | Chart | 17 chart types, Insert Chart dialog, embedded Excel data, Chart Design/Format tabs | Missing entirely | **P0** |
| 12 | Screenshot | Window thumbnails + Screen Clipping, Picture Format tab | Missing entirely | **P0** (Screen Clipping is desktop-specific; window capture possible in Electron) |
| 13 | Reuse Files | Search/recent files pane, Open or Insert Link | Missing entirely | **P2** |
| 14 | Add-ins | Get Add-ins store, My Add-ins gallery | Missing entirely | **P2** |
| 15 | Online Video | Address dialog, provider support, playable object, print thumbnail | Missing entirely | **P2** |
| 16 | Link | Split button; Recent Items, Search for Files, Insert Link; full hyperlink dialog with Place in This Document/E-mail/Create New | `window.prompt('Address:')` + simple `applyLink`; no recent items, no bookmark targets, no dialog | **P0** — replace prompt with dialog; add link-to-place and email |
| 17 | Bookmark | Bookmark dialog with name/sort/add/delete/go-to; link targets | Toast: "Bookmarks: use headings in the Navigation pane" | **P0** — no bookmarks at all |
| 18 | Cross-reference | Full dialog, REF fields, update with F9 | Toast: "Cross-references coming soon" | **P0** — feature absent |
| 19 | Comment | Threaded margin comments, reply/resolve/delete, Comments pane | Toast: "Comments panel coming soon" | **P0** — no comment model/UI |
| 20 | Header | 20-design gallery, section header editing, content controls, contextual tab, Office.com, remove/save | Boolean `showHeader` + single text `<input>` overlay; no gallery, no fields, no section model | **P0** — display toggle, not a document header |
| 21 | Footer | Same as header | Boolean `showFooter` + `<input>` | **P0** |
| 22 | Page Number | Top/Bottom/Margins/Current Position galleries, Format Page Numbers dialog, PAGE fields, remove | Boolean `showPageNumbers`, renders hardcoded `1` only when footer visible | **P0** — no fields, positions, formats, or multi-page numbering |
| 23 | Text Box | 36 built-ins, Draw Text Box, Office.com, save; floating shape + Shape Format | One hardcoded `.text-box` div inserted in flow | **P0** — no gallery, no drawing, no floating/positioning |
| 24 | Quick Parts | AutoText, Document Property, Field, Building Blocks Organizer, Save Selection | Missing entirely | **P1** |
| 25 | WordArt | 15-style gallery, floating WordArt text box, Shape Format/WordArt Styles | Hardcoded Georgia/blue/shadow paragraph | **P0** — no gallery or editable style |
| 26 | Drop Cap | None/Dropped/In Margin + options (font, lines, distance) | Missing entirely | **P0** |
| 27 | Signature Line | Signature Setup dialog + signature object | Missing entirely | **P1** |
| 28 | Date & Time | Dialog with full locale format list, language, Update automatically (DATE field), Set As Default | Three hardcoded `toLocale*` strings inserted as plain text | **P1** — no field/update, no language, no full format list |
| 29 | Object | Create New / Create from File, OLE embed/link, Text from File | Missing entirely | **P2** |
| 30 | Equation | Equation editor, placeholder, 8 built-ins, Equation tab, save-to-gallery | Inserts fixed `E = mc²` paragraph; toast "edit inline" | **P0** — no equation model/editor |
| 31 | Symbol | 20-symbol recent grid + More Symbols dialog (Symbols/Special Characters, fonts, subsets, codes, shortcuts) | 64-character static `SYMBOLS` grid with no labels/dialog | **P1** — add More Symbols dialog, font/subset, special characters |
| 32 | Ribbon structure | Pages, Tables, Illustrations, Reuse Files, Add-ins, Media, Links, Comments, Header & Footer, Text, Symbols | Pages, Tables, Illustrations, Links, Header & Footer, Text, Comments, **Contents** | **P0** — extra Contents/TOC group (belongs in References), missing Reuse Files/Add-ins/Media, wrong group order |
| 33 | Button affordances | Split buttons/carets for Cover Page, Table, Pictures, Shapes, 3D, Screenshot, Link, Header, Footer, Page Number, Text Box, Quick Parts, WordArt, Drop Cap, Signature, Object, Equation, Symbol | Only Table, Shapes, Date & Time, Symbol have working popovers; others are direct clicks or toasts | **P1** — add carets/split menus and disabled/active states |
| 34 | Contextual tabs | Picture Format, Shape Format, Graphics Format, 3D Model, SmartArt Design/Format, Chart Design/Format, Table Design/Layout, Header & Footer, Equation | None | **P0/P1** — required for parity; at minimum Table/Link/Image context |
| 35 | Horizontal Line | Not on Insert ribbon (Home → Borders/Shading or legacy) | Extra "Horizontal Line" button in Text group | **P1** — remove from Insert or move to correct surface |
| 36 | Table of Contents | References → Table of Contents, not Insert | "Contents" group with "Table of Contents" button on Insert | **P1** — move to References, match gallery/dialog |

### Additional correctness issues
- `insertTOC` produces static styled paragraphs, not a TOC field, and never updates page numbers.
- `PageCanvas` renders a single page only; header/footer and page numbers do not repeat per page.
- Page number is hardcoded `1`; there is no page-offset or section-start support.
- `insertPageBreak` inserts an atom node but blank page semantics are absent.
- `applyLink` prefixes `https://` and supports `mailto:`/`#`, but there is no dialog, no target validation, and no "place in document".
- `SYMBOLS` includes smart quotes duplicated (`'`, `"`, `"`) and no font/subset metadata.
- Table picker menu inserts a table immediately; Word opens dialogs or enters draw mode.
- No image wrap/position controls; images insert inline only.
- No gallery hover previews anywhere; popovers are static grids.

---

## 6. Frame-capture timestamps

| Timestamp | What UI to capture |
|---|---|
| 00:00:41 | Insert tab selected; full ribbon showing Pages group and group boundaries |
| 00:00:50 | Cover Page dropdown gallery open (thumbnails, scrollbar) |
| 00:01:21 | Filigree cover page selected; gallery scrolled to show "More Cover Pages" and remove option |
| 00:02:01 | Reopened Cover Page menu showing current-page removal/change state |
| 00:02:29 | Blank Page clicked; document shows full blank page + cursor position |
| 00:03:18 | Page Break clicked; break marker and resumed text on next page |
| 00:04:17 | Table hover grid with live preview and "3 x 5 Table" label |
| 00:05:11 | Insert Table dialog (columns, rows, AutoFit options) |
| 00:05:38 | Draw Table mode; pencil cursor and drawn grid |
| 00:06:01 | Excel Spreadsheet inserted; embedded sheet grid |
| 00:06:23 | Quick Tables submenu (Calendar/Matrix/Subheads/Tabular List) |
| 00:06:39 | Convert Text to Table dialog and result |
| 00:07:09 | Pictures dropdown: This Device / Stock Images / Online Pictures |
| 00:07:26 | Online Pictures search dialog with results |
| 00:09:28 | Shapes gallery open showing Recently Used + categories |
| 00:10:27 | Shapes gallery scrolled to Block Arrows / Equation Shapes / Flowchart / Callouts |
| 00:10:43 | Icons search dialog ("music") with icon grid and Insert |
| 00:11:12 | 3D Models menu and inserted model with rotation handle |
| 00:11:50 | Choose a SmartArt Graphic dialog (Cycle category selected) |
| 00:12:45 | Insert Chart dialog (chart type rail + subtypes) and embedded Excel data |
| 00:13:53 | Screenshot dropdown with window thumbnails + Screen Clipping |
| 00:14:53 | Reuse Files task pane with recent files and Open/Insert Link |
| 00:15:24 | Online Video address dialog and inserted playable video |
| 00:16:42 | Link split-button caret menu (Recent Items / Search / Insert Link) |
| 00:17:38 | Insert Hyperlink dialog (Existing File/Place in Document/E-mail) |
| 00:18:29 | Bookmark dialog and Place in This Document bookmark list |
| 00:18:29 | Cross-reference dialog with Reference type/Insert reference to |
| 00:19:01 | Comment card in margin with Post/Delete thread |
| 00:19:24 | Header gallery open (Blank/Three Columns/Austin/Banded/Filigree/etc.) |
| 00:20:30 | Footer gallery open |
| 00:20:40 | Page Number menu + Top/Bottom/Margins/Current Position galleries |
| 00:21:16 | Format Page Numbers dialog (number format, start at) |
| 00:21:38 | Text Box gallery (Banded Quote etc.) and Draw Text Box cursor |
| 00:23:04 | Quick Parts menu (AutoText, Document Property, Field, Organizer) |
| 00:23:47 | WordArt 15-style gallery and inserted "OMD" |
| 00:24:09 | Drop Cap menu (None/Dropped/In Margin/Options) and In Margin result |
| 00:25:46 | Signature Setup dialog and inserted signature line |
| 00:26:25 | Date and Time dialog (format list, language, Update automatically) |
| 00:26:39 | Object dialog (Create New list / Create from File) |
| 00:27:22 | Equation tab + built-in equation gallery and typed equation |
| 00:28:56 | Symbol dropdown grid + More Symbols dialog (Symbols/Special Characters) |

---

## Top 10 gaps (summary)

1. **Cover Page** is a single hardcoded block, not a gallery; no insert-at-start, remove/replace, Office.com, or save-to-gallery.
2. **Blank Page duplicates Page Break**; it must create a true blank page, distinct from a single break.
3. **Illustrations group is ~70% missing**: no Icons, 3D Models, SmartArt, Chart, or Screenshot; Pictures lacks This Device/Stock/Online split; Shapes are emoji text, not vector shapes.
4. **Table dropdown is non-functional theater**: no Insert Table dialog, Draw Table, Convert Text to Table, Excel Spreadsheet, or Quick Tables; menu choices insert arbitrary tables.
5. **Header/Footer/Page Number are display toggles**, not document features: no galleries, contextual tab, fields, positions, formats, sections, or real multi-page numbering (number is hardcoded "1").
6. **Text group is largely absent**: no Quick Parts, Drop Cap, Signature Line, or Object; Text Box and WordArt are static approximations with no galleries or floating shapes.
7. **Equation and Symbol are stubs**: fixed `E = mc²`, no equation editor/gallery/Equation tab, and only a 64-character symbol grid with no More Symbols dialog, fonts, subsets, or special characters.
8. **Link uses `window.prompt`** instead of the Insert Hyperlink dialog; Bookmark and Cross-reference are toasts, so no anchors/REF fields exist.
9. **Comments are a toast**; there is no comment thread model, margin cards, replies, resolve, or Comments pane.
10. **Ribbon structure is wrong**: an extra Contents/TOC group sits on Insert (TOC belongs on References), while Reuse Files, Add-ins, and Media/Online Video are missing and several split-button/caret affordances are unmodeled.
