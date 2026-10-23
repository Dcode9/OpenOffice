# 06 — Draw Tab (Microsoft Word)

Research/spec for the Draw tab of a Microsoft Word clone. **This document does not modify app source.**

---

## Sources & method

| Source | Status | Use |
|---|---|---|
| `research/videos/K-9C1t30Yr4.en.srt` | **Missing** | — |
| `research/videos/K-9C1t30Yr4.mp4` | Present (996 s, 640×360, 25 fps) | Primary: frame-by-frame visual analysis |
| yt-dlp metadata | Present | Title: *"Microsoft Word Tutorial \| MS Word draw tab complete tutorial"* (E.C.C Education, 2024-09-22, 996 s) |
| `research/videos/L4TPfHitbKI.en.srt` | Present | *"Using the Draw tab"* (GCFGlobal, 118 s) — mostly PowerPoint/Excel, used for gallery/dialog cross-checks |
| Microsoft Support — *Draw and write with ink in Office* | Fetched | Authoritative control names/behaviour |
| Microsoft Support — *Edit your document with natural gestures* | Fetched | Lasso, Format Ink, handles, Ink Editor |
| addbalance.com *Ribbons of Microsoft Word* | Fetched | Word 2024 ribbon changes (Ruler, Format Background) |

Because the primary transcript is absent, timestamps below are from direct frame sampling of the MP4 and are accurate to roughly ±1 s. Where a behaviour is standard Word but not shown on camera, it is explicitly marked **(not shown in video)**.

Two different Draw-tab generations appear across the sources and must not be conflated:

- **Word 2024/365 (primary, `K-9C1t30Yr4`)** — groups: Drawing Tools, Stencils, Edit, Convert, Insert, Replay, Help.
- **Word 2019–2022 (variant, `L4TPfHitbKI`)** — groups: Pens, Convert (Ink Editor / Ink to Shape / Ink to Math), Replay. This build includes **Add Pen** and **Ink Editor**.
- **PowerPoint (variant, `L4TPfHitbKI`)** — has **Ink to Text** and an **Effects** row in the pen flyout.

The current app should target the **2024 Word 365 layout**, with the older controls documented as optional/legacy.

---

## 1. Exact Draw ribbon layout (left → right)

### 1.1 Tab strip

```
File  Home  Insert  Draw  Design  Layout  References  Mailings  Review  View  Developer  Help
```

- `Draw` is the 4th tab, between **Insert** and **Design**.
- Active tab: dark blue underline (accent) directly beneath the label.
- Right end of the tab strip (app chrome, not Draw-specific): **Comments**, **Editing**, **Share**, ribbon-collapse chevron.
- The current app omits **Developer**; otherwise the tab order matches.

### 1.2 Group map

| # | Group label | Controls (left → right) | Size |
|---|---|---|---|
| 1 | **Drawing Tools** | Select, Lasso Select, Eraser (caret), Pen 1, Pen 2, Pen 3, Highlighter, Ink-effects Pen | All large, icon-only swatches; eraser/pens have a caret |
| 2 | **Stencils** | Ruler | Large, icon + "Ruler" |
| 3 | **Edit** | Format Background (caret) | Large, icon + two-line label |
| 4 | **Convert** | Ink to Shape, Ink to Math | Large, icon + two-line label |
| 5 | **Insert** | Drawing Canvas | Large, icon + two-line label |
| 6 | **Replay** | Ink Replay | Large, icon + two-line label |
| 7 | **Help** | Ink Help | Large, circled-? icon + two-line label |

Separator lines sit between every group. Group labels are centered, 10.5 px, muted grey, on a second baseline under the buttons. Ribbon height ≈ 94 px (current app already uses this).

### 1.3 Control-by-control

#### Drawing Tools

Order observed at `00:00:45`:

1. **Select** — arrow cursor icon, no text label, no caret.
   - Default mode. Switches from inking to object selection.
   - Selects ink, shapes, pictures, and text; can select objects behind text.
2. **Lasso Select** — dashed loop with a small cursor at the lower-right, no text label.
   - Draws a freeform marquee; only **ink** objects inside are selected (never text/shapes/pictures).
3. **Eraser** — marker-shaped swatch with a cream/yellow cap, black body, **pink/purple eraser tip**, plus a **caret** at bottom-right.
   - Clicking the body activates the last eraser type; the caret opens the eraser flyout.
4. **Pen 1 — Black Pen** — black cap/body, black tip. Tooltip: `Pen: Black, 0.35 mm` (also observed at `0.5 mm`).
5. **Pen 2 — Gold Pen** — gold cap/body, gold tip. Tooltip: `Pen: Gold, 3.5 mm`.
6. **Highlighter** — wide flat yellow tip; translucent. Tooltip: `Highlighter: Yellow, 6 mm. Snap to Text: Off`.
7. **Ink-effects Pen** — blue body/tip with a small **sparkle cluster** at the lower-left, indicating an ink effect (e.g. galaxy/lava/rainbow). This swatch exists in the 2024 build.

Every pen/highlighter swatch has a **caret** at its bottom-right that opens the **pen options flyout**. There are no text labels under individual pens — the group label is the only text.

> The default set is user-customisable and Word remembers changes. Across the video the gallery changes from `[Eraser, Black, Gold, Yellow Highlighter, Blue Effects]` to `[Black, Red, Green, Blue, Eraser]`, so implement the gallery as dynamic data, not a hard-coded five.

#### Stencils

- **Ruler** — diagonal ruler icon, label `Ruler`.
  - Toggles a translucent on-screen ruler stencil (not document content, does not print).
  - Drag to reposition; a circular knob at the ruler's centre rotates it; a degree bubble shows the current angle (`0°`, `7°`, `31°`, `45°` observed).
  - Ink drawn along the ruler edge snaps to a straight line.

#### Edit

- **Format Background** — page/paper icon, two-line label `Format` / `Background`, caret.
  - Opens a gallery (see §2.10). Word 2024 addition. Tooltip implies page-level change but it applies to the **whole document**.

#### Convert

- **Ink to Shape** — neon/teal outline of a circle and square, two-line label `Ink to` / `Shape`.
  - Converts freehand ink into a standard Office shape (line, rectangle, triangle, oval/circle, arrow, etc.).
- **Ink to Math** — teal `π` with a curved pen stroke, two-line label `Ink to` / `Math`.
  - Opens the **Math Input Control** dialog (see §2.7).

#### Insert

- **Drawing Canvas** — picture frame with a green `+` and squiggle, two-line label `Drawing` / `Canvas`.
  - Inserts a resizable drawing frame into the document; ink drawn inside is grouped with the canvas and can be moved/scaled as one object.

#### Replay

- **Ink Replay** — circular replay arrow with a green play triangle, two-line label `Ink` / `Replay`.
  - Replays all visible ink strokes in the order they were drawn.

#### Help

- **Ink Help** — circled `?` in teal, two-line label `Ink` / `Help`.
  - Opens the ink help pane.

### 1.4 Ribbon states

- **Select** is active by default. The current tool shows a grey pressed background and a border (visible on Lasso at `00:07:10` and on the active pen).
- Cursor changes:
  - Select → arrow.
  - Lasso → crosshair / lasso cursor.
  - Pen/highlighter → pen glyph.
  - Eraser → eraser glyph.
- Hovering a pen/highlighter shows a tooltip of the form:
  - `Pen: <Color>, <n> mm`
  - `Highlighter: <Color>, <n> mm. Snap to Text: Off`
- Clicking a pen body activates it immediately ("click on it and you're ready to start drawing"). Clicking the caret opens options without changing the tool.
- Clicking away from an open flyout closes it and resumes drawing.
- `Esc` exits inking/lasso and returns to Select (Microsoft: "Press the escape button (Esc) or Stop Inking to remove the cross symbol").
- Newer builds may show a **Stop Inking** / **Close** group instead of Esc; the 2024 video does not.

### 1.5 Legacy / variant layouts

**Word 2019–2022 (`L4TPfHitbKI`, ~00:01:00):**

```
Pens: [Highlighter] [Black Pen] [Red Pen] [Blue Pen] [Add Pen +]
Convert: [Ink Editor] [Ink to Shape] [Ink to Math]
Replay: [Ink Replay]
```

- **Add Pen** (`+` with a small pen) creates a new pen preset.
- **Ink Editor** enables gesture editing of text.
- Group is called **Pens**, not Drawing Tools; **no Ruler**, **no Format Background**, **no Drawing Canvas**.

**PowerPoint (`L4TPfHitbKI`, ~00:00:38):**

```
Drawing Tools: [Select] [Eraser] [Lasso Select] [pens] [Add Pen +]
Stencils: [Ruler]
Convert: [Ink to Shape] [Ink to Text] [Ink to Math]
Replay: [Ink Replay]
```

- PowerPoint adds **Ink to Text** (Word uses Ink Editor instead).
- PowerPoint's pen flyout adds an **Effects** row (rainbow, galaxy, lava, ocean, gold, silver, etc.).

---

## 2. Galleries and tools

### 2.1 Pen / highlighter gallery (the tool strip)

- A horizontal strip of ink-tool swatches, each rendered as a coloured marker/pen tip so the colour and tool type are visible at a glance.
- **Eraser** uses a pink/purple tip.
- **Highlighter** uses a wide, flat, translucent tip.
- **Pen** uses a fine conical tip.
- **Ink-effects pen** carries a sparkle badge.
- The active swatch has a grey pressed background and a thin border.
- Each swatch has a **caret** (▾) that opens the options flyout.
- The list is dynamic: users can add/replace pens (legacy **Add Pen**), and Word persists the custom set.
- Widths: each swatch ≈ 22–26 px in the ribbon; the group occupies ~165 px at 100 % zoom.

### 2.2 Pen options flyout

Observed at `00:04:15` (highlighter) and `00:06:05` (pen). Layout, top → bottom:

1. **Current-stroke preview** — a full-width horizontal bar painted with the current colour, thickness and texture (e.g. a thick red bar).
2. **`Thickness`** header.
   - A horizontal preset row: hairline dash, then dots of increasing diameter, then a **`+`** at the right.
   - Observed presets: `0.25 mm` (hairline line), `0.35 mm`, `0.5 mm`, `1 mm`, `2 mm`, `3.5 mm`, `6 mm` (the dot count/labels vary by tool).
   - The selected preset is ringed.
   - `+` opens a custom width entry.
3. **`Recent Colors`** header.
   - A row of recently used swatches, including textured/metallic swatches (solid red, textured gold, black, textured silver observed).
4. **`Colors`** header.
   - A grid of theme colours followed by standard colours:
     - Row 1: yellow/gold, orange, pink/magenta, red, dark red, …
     - Row 2: purple, magenta, maroon, blue, …
     - Row 3: teal, cyan, green, light green, …
     - Row 4: black, dark grey, grey, light grey, white, …
   - Approximately **7 theme columns** per row in the 2024 Word build (the flyout is narrow; PowerPoint's is wider with 10 columns).
   - Swatches are square, ~16 px, with a thin outline; hover shows the colour name.
5. **`More Colors…`** at the bottom, with a small palette icon.
   - Opens the standard **Colors** dialog (see §2.3).
6. **Effects** row — present in PowerPoint builds only (rainbow, galaxy, lava, ocean, gold, silver). The Word 2024 flyout observed does **not** show Effects, even though an effects pen swatch appears in the strip.
7. **`Add Pen`** / pen settings — legacy Word build only.

Behaviour:

- Hovering a swatch **live-previews** the colour on the document (standard Office behaviour; not clearly demonstrated in the video).
- Selecting a swatch applies immediately and keeps the flyout open for thickness changes.
- Clicking outside closes the flyout and returns to drawing.
- Thickness differences are visible in the current-stroke preview bar at the top.

### 2.3 “More Colors” dialog

Observed at `00:04:35`:

- Title: **Colors**.
- Tabs: **Standard** | **Custom**.
- **Standard** tab: a hexagonal HSV colour wheel, a vertical brightness/value slider to its right, a large preview split into **New** / **Current**, and `OK` / `Cancel`.
- **Custom** tab: numeric colour model fields (RGB/HSL/Hex) plus the same preview.
- Modal; `Esc`/`Cancel` leaves the pen colour unchanged.

### 2.4 Eraser flyout

Observed at `00:04:50`:

```
Thickness   — · • ● +        (preset row, selected dot ringed)
Types
  [stroke eraser icon]  Eraser
  [point eraser icon]   Point Eraser
```

- **Eraser** — stroke eraser: touching a stroke deletes the **entire stroke**. Dragging across several strokes deletes them all.
- **Point Eraser** — erases only the part of the stroke under the pointer, splitting the stroke.
- **Thickness** — sets the eraser radius; the same preset dots + `+` as the pen flyout.
- Microsoft documentation states Word has **three** eraser options in current builds ("Select the down arrow on the Eraser button to pick the eraser you want"); a **Segment Eraser** may appear in newer versions.
- Some active pens (e.g. Surface Pen) have a physical eraser button that erases ink directly.
- Erasing is a normal undoable action.

### 2.5 Lasso Select

Observed at `00:07:10` (Lasso button pressed, dashed marquee around highlighted text/ink).

- Activate **Lasso Select** in Drawing Tools.
- Drag a freeform loop around ink.
- While dragging, a **faded dashed selection region** follows the pointer.
- On release, all ink strokes **fully or partially inside** the loop are selected; text, shapes and pictures are ignored.
- Selected ink shows the standard object selection chrome (§3.3).
- Selection can then be:
  - deleted (`Delete`),
  - moved (drag or arrow keys),
  - resized/rotated with handles,
  - recoloured via **Format Ink**,
  - wrapped/captioned/Alt-texted via the right-click menu.
- `Esc` clears the lasso and exits the mode.
- On pen-enabled devices the **pen barrel button** can invoke Lasso Select without visiting the ribbon (PowerPoint/Excel; standard Word behaves similarly).

### 2.6 Ink to Shape

Observed at `00:12:50`–`00:13:20`.

- Select **Ink to Shape** in Convert, then draw (or select existing ink and click the button — both flows exist).
- Word analyses the strokes and replaces them with the closest **standard Office shape**:
  - straight drag → line / arrow,
  - closed rough quadrilateral → rectangle,
  - three-sided closed stroke → triangle,
  - closed round stroke → oval/circle.
- The converted shape is a real shape object:
  - light grey/theme fill by default,
  - thin outline,
  - 8 resize handles + rotation handle,
  - **Layout Options** (text-wrap) flyout button at the upper-right,
  - contextual **Shape Format** tab appears in the ribbon.
- Original ink strokes are removed (replace, not duplicate).
- Conversion is one undo step; `Ctrl+Z` restores the freehand ink.
- No dialog is shown. If recognition fails, the ink is left unchanged.

### 2.7 Ink to Math

Observed at `00:14:05`–`00:15:00`.

Clicking **Ink to Math** opens the modal **Math Input Control**:

```
┌ Math Input Control ────────────────────────────── ✕ ┐
│  Preview here:  [ πγ²                           ]   │
│  ┌────────────────────────────────────────────┐    │
│  │  Write math here                            │    │
│  │  (yellow grid writing surface)              │    │
│  └────────────────────────────────────────────┘    │
│  [✎ Write] [◔ Erase] [↺ Select and Correct] [✕ Clear] │
│                                      [Insert] [Cancel] │
└────────────────────────────────────────────────────┘
```

- **Preview here** updates live as ink is recognised (`1/2 + 3/5`, `πγ²`, `(2x·3y)/x = 2` observed).
- **Write** — ink on the yellow grid.
- **Erase** — erase part of the handwriting.
- **Select and Correct** — select a recognised symbol and choose an alternative from a correction list.
- **Clear** — clears the writing surface and preview.
- **Insert** — inserts a native **equation object** at the cursor.
- **Cancel** / `Esc` — discards.
- On insert:
  - the equation is placed inline in the document,
  - the contextual **Equation** tab appears with `Tools` (Equation, Conversions), `Symbols` gallery, and `Structures` (Fraction, Script, Radical, Integral, Large Operator, Bracket, Function, Accent, Limit and Log, Operator, Matrix),
  - the equation can be edited by clicking it.
- Equations are text/OMath content, not ink, and survive `.docx` export.

### 2.8 Ink to Text / Ink Editor

Version-dependent, and **not demonstrated in the primary 2024 video**.

- **Word 2019–2022 (`L4TPfHitbKI`)** exposes **Ink Editor** in Convert. It is a gesture layer over text:
  - **Circle** a word/phrase → selects it.
  - **Strikethrough / scribble over** text → deletes it.
  - **Vertical line** between words → inserts a space.
  - **Curved line** joining two words → removes the space.
  - **Horizontal line** through a word → splits it / inserts a line break.
  - Selecting handwritten ink and choosing **Ink to Text** replaces the handwriting with typed text.
- **PowerPoint** exposes a direct **Ink to Text** button in Convert (confirmed at `L4TPfHitbKI` ~00:01:00), which converts selected ink to a text box.
- Word 2024's ribbon replaced the Ink Editor button; handwriting-to-text is available through the pen/ink context menu or older builds. Implement it as an optional Convert command with a clear text result.

### 2.9 Ruler

Observed at `00:09:30`–`00:10:30`.

- Click **Ruler** in Stencils to show a floating, translucent ruler over the page.
- Appearance: long grey bar with fine tick marks and numeric labels (inches in the video); semi-transparent so text is visible underneath.
- **Move**: drag the body.
- **Rotate**: drag the circular knob at the centre; a degree bubble shows the angle (`0°`, `7°`, `31°` observed). Rotation is continuous, not snapped.
- **Draw a straight line**: choose a pen, then drag along the ruler edge — the stroke is constrained to the edge.
- **Align objects**: position the ruler edge and drag objects against it (standard Office).
- **Hide**: click **Ruler** again.
- The ruler is a **stencil only**: it is not inserted into the document, is not saved as content, and does not print.
- The page's own horizontal/vertical **document ruler** (View > Ruler) is a separate feature and is unrelated.

### 2.10 Format Background

Observed at `00:00:48`.

Flyout contents, top → bottom:

```
Rule Lines
  [None] [lined 1] [lined 2] [lined 3] [lined 4] ...
Grid Lines
  [grid 1] [grid 2] [grid 3] [grid 4]     (tooltip e.g. "College Ruled")
[ ] Apply to Full Page
Page Color                            >
```

- **Rule Lines** — `None` plus several blue-ruled notebook styles (plain ruled, ruled with a margin line, narrow/wide ruling).
- **Grid Lines** — graph-paper styles (small grid, large grid, college-ruled variants). Hovering shows a name tooltip.
- **Apply to Full Page** — checkbox; when off, the background is limited to the text area/margins.
- **Page Color** — submenu with theme colours, standard colours, `More Colors…`, and `No Color`.
- Applies to the **whole document** (all pages), not just the current page. This is a Word 2024 addition and is distinct from Design > Page Color.
- Backgrounds are document formatting, not ink; they persist in the document but are not ink objects.

### 2.11 Drawing Canvas

Observed at `00:12:50`.

- Click **Drawing Canvas** in Insert.
- Inserts a bordered rectangular frame at the cursor:
  - empty canvas with 8 circular resize handles and a rotation handle,
  - a **Layout Options** (wrap) button at the upper-right,
  - the contextual **Shape Format** tab appears.
- Ink drawn inside is contained by the canvas; the canvas and its ink move/scale together.
- Useful for keeping annotations from reflowing with text, and for grouping a diagram.
- Canvas fill/outline can be formatted like a shape; it can be deleted as one object.
- Status bar shows `Move to where?` while dragging the canvas.
- The canvas is saved as a drawing object and prints.

### 2.12 Ink Replay

- Group: **Replay** → **Ink Replay**.
- Replays every visible ink stroke on the page in drawing order, animating the strokes.
- Click again to replay; `Esc` or clicking elsewhere stops.
- Only replays ink that is currently visible; hidden/deleted strokes are not replayed.
- No options dialog. (Standard Word behaviour; **not demonstrated** in the primary video.)
- PowerPoint's Ink Replay replays per slide; Word's replays the page/document.

### 2.13 Ink Help

- Group: **Help** → **Ink Help**.
- Opens a help pane with ink-specific topics/search (pen setup, gestures, ink to shape/math, troubleshooting).
- No dialog in the document canvas. (**Not demonstrated** in the video.)

---

## 3. How ink appears in the document

### 3.1 Rendering

- Ink is drawn directly over the page surface at the pointer location; it looks like real ink on paper.
- **Pen** — opaque, smooth vector stroke with slight pressure/velocity taper at the ends.
- **Highlighter** — translucent, flat, wide stroke; overlapping strokes darken; **multiply**-style blend so text remains readable underneath.
- **Pencil** — textured/grainy edge (legacy pen preset). In the primary video the "gold" tooltip says `Pen: Gold`, not pencil, but the older tutorial calls the third texture **Pencil**.
- **Ink effects** — textured/patterned fill (galaxy, lava, rainbow, gold, silver) depending on build.
- Strokes are anti-aliased and scaled with page zoom; they remain crisp when zoomed.
- Ink renders **above** text and page background but **below** floating UI (selection chrome, menus).

### 3.2 Anchoring / layout

- Each stroke (or stroke group) is an **ink object** anchored to the page, not inserted into the text stream.
- Ink does **not** reflow text; it floats over the page like a drawing object.
- Ink can be inline/anchored with a text anchor and text-wrap behaviour (`In tight`, `In front of text`, etc.), configured from the Layout Options / right-click menu.
- Ink is clipped to the page and moves with the page when zoomed/scrolled.
- Ink is included in printing and PDF export unless hidden.
- Ink objects appear in the Selection Pane as drawing objects.

### 3.3 Selection model and handles

Observed at `00:08:00` and `00:13:20`.

When ink (or a converted shape/canvas) is selected:

- A thin **bounding box** encloses the object(s).
- **8 resize handles**: circles at the four corners and four edge midpoints (circles for ink/canvas, squares for shapes in some builds).
- A **rotation handle** (circular arrow) floats above the top-centre handle.
- A **Layout Options** button (small wrap icon) floats at the upper-right.
- Dragging inside moves the object; dragging a handle resizes; dragging the rotation handle rotates (angle readout while rotating).
- Multi-select is possible with Lasso; the bounding box encloses all selected strokes.
- Arrow keys nudge the selection by 1 px (Shift+arrow = larger step) — standard Office.
- `Delete` / `Backspace` removes the selection.
- Clicking empty page space deselects.
- The contextual **Shape Format** tab replaces/joins Draw in the ribbon while an ink object is selected.

### 3.4 Context menu / Format Ink

Right-clicking selected ink shows (Microsoft-documented):

- **Format Ink** — opens a pane with:
  - **Fill** colour (solid/gradient/picture/none),
  - **Line** colour, width, transparency, dash,
  - **Transparency** slider,
  - **Line width**.
- **Caption** — insert a caption for the drawing.
- **Text Wrap** — inline/square/tight/behind/in front, edit wrap points.
- **Alt Text** — accessibility description.
- **Cut / Copy / Paste / Delete**.
- **Bring to Front / Send to Back** (ordering relative to text/shapes).

Changes apply live; the Format Ink pane is modeless and docks at the right.

### 3.5 Conversion results

| Command | Input | Result | Selection after |
|---|---|---|---|
| **Ink to Shape** | Freehand ink (selected or newly drawn) | Standard shape matching the strokes; theme fill + thin outline | Shape selected, 8 square handles + rotation + Layout Options; **Shape Format** tab |
| **Ink to Math** | Handwriting in Math Input Control | Inline OMath equation object | Equation selected/editable; **Equation** tab with Symbols/Structures |
| **Ink to Text / Ink Editor** | Handwriting or circled text | Typed text replacing the ink | Normal text caret/selection; no ink object remains |

Details:

- Conversion replaces the source ink (it does not leave a duplicate underneath).
- A converted shape is a **real shape**, so it can be filled, outlined, shadowed, and wrapped like any Office shape.
- An equation is **real text/math**, so it flows with the paragraph and survives export.
- Recognition is best-effort; on failure Word leaves the ink untouched and (in some builds) shows a brief message.
- Each conversion is a single undoable step.

### 3.6 Undo / redo

- `Ctrl+Z` undoes the last action **stroke by stroke**: each pen/highlighter stroke, each erase, each move/resize, and each conversion is its own history entry.
- `Ctrl+Y` (or `Ctrl+Shift+Z`) redoes.
- Undoing an **erase** restores the entire stroke (stroke eraser) or the erased segment (point eraser).
- Undoing **Ink to Shape/Math** restores the original freehand ink.
- Undo history is preserved while the document is open; it is not saved into `.docx`.
- **Ink Replay** is not an undo; it is a visual replay and does not change history.

### 3.7 Persistence / export

- Ink is saved in the `.docx` as drawing/ink content and reloads as ink (not flattened to an image) in Word.
- Ink prints and appears in PDF/print preview.
- Ink objects round-trip through Save/Open; their colour, thickness, opacity and position are preserved.
- Converting to shape/equation changes the stored type (shape/OMath), not ink.
- **Not shown in video:** exact OOXML representation. For the clone, a practical fallback is to store ink as an SVG/path object with stroke metadata, or as a PNG fallback plus editable path data.

### 3.8 Pointer / stylus support

- Works with mouse, touchscreen finger, and active/digital pen.
- Pen pressure and tilt can modulate stroke width/opacity (pen texture).
- The pen's **eraser end** erases without switching tools.
- The pen's **barrel button** can invoke Lasso Select (PowerPoint/Excel; Word standard).
- Palm rejection: a pen-enabled device suppresses touch while the pen is near (OS-level).
- Hovering with a pen shows a small ink cursor/preview in some builds.

---

## 4. Keyboard shortcuts

| Shortcut | Action | Confidence |
|---|---|---|
| `Esc` | Exit inking/Lasso; clear the crosshair; deselect | Microsoft-documented |
| `Delete` / `Backspace` | Delete selected ink | Standard Word |
| Arrow keys | Nudge selected ink 1 px | Standard Office |
| `Shift` + arrows | Nudge selected ink in larger steps | Standard Office |
| `Ctrl+Z` | Undo last stroke/erase/move/conversion | Standard Office |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo | Standard Office |
| `Ctrl+A` | Select all text (or all objects inside a Drawing Canvas) | Standard Office |
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy / cut / paste selected ink | Standard Office |
| `Enter` (Math Input Control) | Insert the recognised equation | Standard dialog behaviour |
| `Esc` (Math Input Control) | Cancel the dialog | Standard dialog behaviour |
| Pen eraser button | Erase ink | Device-dependent |
| Pen barrel button | Lasso Select | PowerPoint/Excel documented |

- There is **no default Word keyboard shortcut** to jump to the Draw tab or to pick a specific pen. (Ribbon key-tip navigation, e.g. `Alt` sequences, is not a Draw-specific shortcut.)
- The current app's global shortcuts (`Ctrl+S`, `Ctrl+F`, `Ctrl+P`, `Ctrl+O`, `Ctrl+N`) are unaffected.
- **Not demonstrated in the video:** the presenter uses the mouse only.

---

## 5. Gap analysis vs current app

### 5.1 Current implementation inventory

| File | What exists |
|---|---|
| `src/components/ribbon/DrawTab.tsx` (29 lines) | Three groups: **Tools** (Draw, Highlighter, Eraser), **Pens** (Pen, Pencil, Highlighter), **Convert** (Ink to Shape; stacked small Ink to Math, Ink to Text). All are `BigButton`/`SmallButton`. |
| Interaction | `onClick` either shows a toast (`"… — draw on the page (ink is preserved on screen)"`) or dispatches `window.dispatchEvent(new CustomEvent('word:highlight'))`. |
| `src/App.tsx` | No listener for `word:highlight`; no ink state; no canvas; no pointer handlers. |
| `src/components/PageCanvas.tsx` | Renders `EditorContent` on a page `<div>`; no overlay/SVG/canvas layer. |
| `src/styles/word.css` | Ribbon/button/popover styles only. `--ink` is a **text colour variable**, not ink drawing. No `.ink`, stroke, selection-handle, ruler-stencil, or canvas styles. |
| `package.json` | TipTap + docx + mammoth; no drawing/ink library (no perfect-freehand, tldraw, konva, fabric, etc.). |
| `src/components/Ribbon.tsx` | Draw tab is wired in the tab list and renders `<DrawTab />`. Tab list omits **Developer**. |

**Net:** the Draw tab is a visual placeholder. No ink is created, rendered, selected, erased, stored, or exported. The `word:highlight` event has **zero listeners**, so the Highlighter buttons are inert.

### 5.2 Gap table

| # | Word behaviour | Current app | Severity |
|---|---|---|---|
| 1 | Ribbon groups: Drawing Tools, Stencils, Edit, Convert, Insert, Replay, Help | 3 groups (Tools, Pens, Convert) with different names | High |
| 2 | Select + Lasso Select as separate tools | Missing entirely | High |
| 3 | Pen/highlighter swatch strip with colour/tip previews | 3 generic icons (`PenTool`, `Sparkles`) with text labels | High |
| 4 | Pen options flyout (Thickness, Recent Colors, Colors, More Colors) | No flyout, no colour/thickness state | High |
| 5 | Eraser with Thickness + Eraser/Point Eraser types | One button firing a toast | High |
| 6 | Ink rendering (pen/highlighter/pencil) on the page | None | Critical |
| 7 | Lasso selection + 8 handles + rotation + Layout Options | None | High |
| 8 | Format Ink pane / right-click menu | None | Medium |
| 9 | Ink to Shape (real shape result) | Toast only | High |
| 10 | Ink to Math (Math Input Control + OMath insert) | Toast only ("Ink to Math") | High |
| 11 | Ink to Text / Ink Editor | Small button, toast only ("Ink to Text") | High |
| 12 | Ruler stencil (move/rotate/degree bubble/straight-line constraint) | Missing; the page's View ruler is unrelated | Medium |
| 13 | Format Background gallery (Rule Lines, Grid Lines, Apply to Full Page, Page Color) | Missing (Design tab has a different page-colour control) | Medium |
| 14 | Drawing Canvas | Missing | Medium |
| 15 | Ink Replay | Missing | Low |
| 16 | Ink Help | Missing | Low |
| 17 | Undo/redo per stroke, erase, move, conversion | TipTap history covers text only | High |
| 18 | Ink persistence in `.docx` / localStorage | None | High |
| 19 | Pointer/stylus pressure, pen eraser, barrel lasso | None | Medium |
| 20 | `Esc` / `Delete` / arrow-key shortcuts for ink | None | Medium |
| 21 | Active-tool pressed state, cursor changes, tooltips | No state; static buttons | Medium |
| 22 | Dynamic, user-customisable pen set (Add Pen) | Hard-coded 3 pens | Low |
| 23 | Contextual Shape Format / Equation tabs | None | Medium |
| 24 | Developer tab in tab strip | Missing (minor) | Low |

### 5.3 Recommended implementation outline

1. **Model** — `InkStroke { id, tool: 'pen'|'pencil'|'highlighter', color, width, points[], pressure[], opacity, bbox, anchor }`; `InkObject` groups strokes; store in a Zustand/context slice with undo/redo.
2. **Render layer** — absolutely positioned `<svg>` over the page inside `PageCanvas`; smooth paths via Catmull-Rom/perfect-freehand; `mix-blend-mode: multiply` for highlighter; `pointer-events` toggled by tool.
3. **Input** — `pointerdown/move/up` with `setPointerCapture`, `pointerType`, `pressure`, `tiltX/Y`; coalesced events for smoothness.
4. **Rail** — replace `DrawTab.tsx` with 7 groups; pen strip driven by state; `Popover` for flyouts (reuse `src/components/ribbon/ui.tsx`).
5. **Tools** — Select (hit-test bboxes), Lasso (point-in-polygon), Eraser (stroke hit-test; point eraser splits paths), Ruler (rotatable overlay + line constraint).
6. **Convert** — Ink to Shape via a simple recogniser (Ramer–Douglas–Peucker + corner counting, or `ideal` heuristics); Ink to Math via a modal mirroring Math Input Control with a MathLive/KaTeX preview and `docx` OMath export; Ink to Text via handwriting recognition service or a stub with an editable text result.
7. **Chrome** — selection overlay with 8 handles + rotation + Layout Options; contextual "Shape Format" ribbon tab; Format Ink pane.
8. **Persistence** — serialize ink into the document JSON and into `.docx` (custom XML part or SVG fallback); hydrate on load.
9. **Shortcuts** — `Esc`, `Delete`, arrows, `Ctrl+Z/Y` scoped to the ink history.
10. **Accessibility** — Alt Text for ink objects, keyboard selection, visible focus.

---

## 6. Frame capture table

All timestamps are from `research/videos/K-9C1t30Yr4.mp4` (Word 365, 2024).

| hh:mm:ss | what UI to capture |
|---|---|
| 00:00:30 | Draw tab selected — full ribbon, all seven groups left→right |
| 00:00:45 | Drawing Tools close-up: Select, Lasso Select, Eraser + caret, pen/highlighter swatches; active black pen |
| 00:00:48 | Format Background flyout: Rule Lines, Grid Lines, Apply to Full Page, Page Color |
| 00:04:05 | Yellow highlights and thick red pen underlines over body text |
| 00:04:15 | Highlighter options flyout: stroke preview, Thickness presets, Recent Colors, Colors grid, More Colors |
| 00:04:35 | “Colors” dialog (Standard tab): colour wheel, brightness slider, New/Current, OK/Cancel |
| 00:04:50 | Eraser flyout: Thickness row, Types → Eraser, Point Eraser |
| 00:05:40 | Tooltip `Pen: Black, 0.5 mm` over the black pen swatch |
| 00:05:55 | Tooltip `Pen: Gold, 3.5 mm` over the gold pen swatch |
| 00:06:05 | Pen options flyout with full Colors grid and `More Colors…` |
| 00:06:25 | Tooltip `Highlighter: Yellow, 6 mm. Snap to Text: Off` |
| 00:07:10 | Lasso Select active: dashed freeform marquee around highlighted ink |
| 00:08:00 | Ink object selected: bounding box, circular handles, rotation handle, Shape Format tab |
| 00:09:30 | Ruler stencil drawn across page; straight ink line along its edge |
| 00:10:10 | Ruler horizontal with `0°` degree bubble and rotation knob |
| 00:10:30 | Ruler rotated (~7°) with degree bubble; angled straight line |
| 00:12:50 | Drawing Canvas inserted (empty frame, 8 circular handles) |
| 00:13:20 | Ink to Shape result: converted triangle + circle with handles, rotation, Layout Options |
| 00:14:05 | Math Input Control dialog: preview `πγ²`, yellow grid, Write/Erase/Select and Correct/Clear, Insert/Cancel |
| 00:15:00 | Equation inserted in document; contextual Equation tab (Symbols, Structures) |

**Supplementary frames from `L4TPfHitbKI.mp4`** (PowerPoint/legacy Word, for cross-reference only):

| hh:mm:ss | what UI to capture |
|---|---|
| 00:00:30 | PowerPoint Draw tab: Select, Eraser, Lasso, pens, Add Pen, Ruler, Ink to Shape/Text/Math, Ink Replay |
| 00:00:38 | Pen flyout with Thickness, Colors, **Effects** row (rainbow/galaxy/lava/ocean) and More Colors |
| 00:01:00 | Legacy Word Draw tab: Pens group with Add Pen, Ink Editor, Ink to Shape, Ink to Math, Ink Replay |
| 00:01:35 | Excel Math Input Control with live fraction preview `(2x·3y)/x = 2` |

---

## Appendix A — Observed defaults (Word 365, 2024)

| Tool | Colour | Thickness | Notes |
|---|---|---|---|
| Black Pen | `#000000` | 0.35 mm / 0.5 mm | Default active pen |
| Gold Pen | gold/amber (~`#C9A227`) | 3.5 mm | Tooltip says “Pen: Gold” (older tutorials call the texture **Pencil**) |
| Yellow Highlighter | `#FFFF00` | 6 mm | Translucent, `Snap to Text` |
| Blue Effects Pen | blue (~`#2B579A`) | ~1–2 mm | Sparkle badge → ink effect |
| Eraser | pink/purple tip | preset | Types: Eraser, Point Eraser |

- Pen tooltip format: `Pen: <Colour>, <n> mm`.
- Highlighter tooltip format: `Highlighter: <Colour>, <n> mm. Snap to Text: <On|Off>`.
- Default pen set is customisable and persisted per user.
- Ribbon accent: Word blue (`#2B579A` family); Draw icons are teal/grey line art with colour only in the pen tips.

## Appendix B — Acceptance checklist for the clone

- [ ] Draw tab appears between Insert and Design.
- [ ] Seven groups render in the exact order and with the exact labels.
- [ ] Select and Lasso are distinct, with correct cursors and active states.
- [ ] Pen strip shows real colour/tip previews and opens a flyout per pen.
- [ ] Thickness presets, Recent Colors, Colors, and More Colors all work.
- [ ] Eraser supports stroke and point modes plus a thickness setting.
- [ ] Ink draws smoothly with pointer pressure where available.
- [ ] Highlighter is translucent and does not hide text.
- [ ] Lasso selects only ink and shows 8 handles + rotation.
- [ ] Format Ink pane edits colour, transparency, and width.
- [ ] Ink to Shape produces a real, editable shape.
- [ ] Ink to Math opens a modal, previews, and inserts an editable equation.
- [ ] Ink to Text replaces handwriting with editable text.
- [ ] Ruler moves, rotates with a degree readout, and constrains lines.
- [ ] Format Background applies rule/grid lines and page colour.
- [ ] Drawing Canvas groups and scales its ink.
- [ ] Ink Replay animates strokes in order.
- [ ] Ink Help opens a help pane.
- [ ] Undo/redo works per stroke, erase, move, and conversion.
- [ ] Ink survives reload and `.docx` round-trip.
- [ ] `Esc`, `Delete`, arrows, `Ctrl+Z/Y` behave correctly.
- [ ] Tooltips and cursors match Word.
