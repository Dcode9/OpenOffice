# 04 — References & Mailings: Research Spec

Status: research complete  
Scope: Microsoft Word **References** tab and **Mailings** tab (Word for Microsoft 365 / Word 2019+ Windows UI), intended as the build spec for the Word clone in `C:\Users\Dhairya Shah\.t3\projects\openoffice`.  
Primary video sources:

- `research/videos/uELfu0qaIJQ.en.srt` — “Microsoft Word References tab and ribbon in depth” (15:40)
- `research/videos/mFqCvTOpOL0.en.srt` — “Mail Merge from Excel to Microsoft Word” (15:00)

Secondary sources: Microsoft Support pages for table of contents, citations/bibliography, mail merge with Excel, and Word keyboard shortcuts (URLs in §8).

> **Transcript caveat.** The References SRT has a caption gap from **00:05:25 to 00:08:09** (no subtitle blocks). The video clearly continues through footnotes/endnotes and into citations during that gap; those details are reconstructed from the Word UI and Microsoft documentation and are marked “inferred” where relevant. The Mail Merge SRT is complete. The References transcript also says “spreadsheet” once at 00:04:07 where the video is showing a Word document; that is a transcription error.

---

## 1. Exact ribbon anatomy

### 1.1 References tab — groups and controls, left to right

Word for Microsoft 365 (Windows) shows six permanent groups. The legacy **Research** group may appear at the far right in Word 2016/2019; it was retired from current Microsoft 365 builds, so treat it as optional/legacy.

| # | Group label (bottom of group) | Control, left → right | Control type | Opens / behavior |
|---|---|---|---|---|
| 1 | **Table of Contents** | **Table of Contents** | Large button + dropdown caret | Dropdown gallery: Automatic Table 1, Automatic Table 2, Manual Table, **Custom Table of Contents…**, **Remove Table of Contents**. Clicking the button body inserts the last-used/default automatic TOC. |
| 1 | | **Add Text** | Small, wide button + dropdown | **Do Not Show in Table of Contents**, **Level 1** … **Level 9**. Applies `TC` field / TOC level to the selected text. |
| 1 | | **Update Table** | Small, wide button + dropdown | **Update Table…** → dialog with **Update page numbers only** / **Update entire table**. Some builds also expose those two choices directly in the dropdown. |
| 2 | **Footnotes** | **Insert Footnote** | Large button | Inserts next auto-numbered footnote reference at the cursor and moves the caret into the footnote at the bottom of the page. |
| 2 | | **Insert Endnote** | Large button | Inserts next auto-numbered endnote reference and moves the caret to the endnote area. |
| 2 | | **Next Footnote** | Small button + dropdown | **Next Footnote**, **Previous Footnote**, **Next Endnote**, **Previous Endnote**. |
| 2 | | **Show Notes** | Small button | Opens the notes pane and jumps to the current note (Print Layout) or shows notes in the note pane (Draft). |
| 2 | | *Group dialog launcher* | Small arrow, bottom-right of group | Opens **Footnote and Endnote** dialog (location, format, numbering, apply-to, convert). |
| 3 | **Citations & Bibliography** | **Insert Citation** | Large button + dropdown | **Add New Source…**, **Add New Placeholder…**, separator, then the list of sources already in the current document. |
| 3 | | **Style:** `APA` (combo) | Combo box/dropdown | Changes citation + bibliography style for the whole document. |
| 3 | | **Bibliography** | Small/medium button + dropdown | **Insert Bibliography**, **Update Citations and Bibliography**, **Convert Citations and Bibliography → Convert to Static Text**. |
| 3 | | **Manage Sources** | Small button | Opens **Source Manager** (Master List ↔ Current List). |
| 4 | **Captions** | **Insert Caption…** | Large button | Opens **Caption** dialog. |
| 4 | | **Insert Table of Figures** | Large button | Opens **Table of Figures** dialog. |
| 4 | | **Update Table** | Small button | Updates the selected Table of Figures (page numbers/entries). |
| 4 | | **Cross-reference** | Small button | Opens **Cross-reference** dialog. |
| 5 | **Index** | **Mark Entry** | Large button | Opens **Mark Index Entry** dialog. |
| 5 | | **Insert Index** | Large button | Opens **Index** dialog and inserts an `INDEX` field. |
| 5 | | **Update Index** | Small button | Rebuilds the selected index. |
| 6 | **Table of Authorities** | **Mark Citation** | Large button | Opens **Mark Citation** dialog for a legal citation (`TA` field). |
| 6 | | **Insert Table of Authorities** | Large button | Opens **Table of Authorities** dialog and inserts a `TOA` field. |
| 6 | | **Update Table** | Small button | Rebuilds the selected table of authorities. |
| — | *Research* (legacy only) | **Smart Lookup** | Large button | Legacy research pane; not part of the clone target. |

Visual notes for the clone:

- Group labels are centered under a thin group separator, as already implemented by `RibbonGroup` in `src/components/ribbon/ui.tsx:3`.
- Large buttons are icon-over-label with a 66 px body height (`src/styles/word.css:329`). Small buttons are one-line 22 px controls (`src/styles/word.css:384`).
- The References tab is wide enough that the six groups occupy roughly the full ribbon at 1366 px; at narrower widths Word collapses labels to icons. The clone should allow horizontal overflow rather than hiding controls.
- **Table of Contents** group layout is: one large TOC button, then a vertical stack of two small wide buttons (`Add Text`, `Update Table`).
- **Citations & Bibliography** layout is: large `Insert Citation` on the left; `Style` combo across the top of the right column; `Bibliography` and `Manage Sources` beneath it.
- **Captions**, **Index**, and **Table of Authorities** each have two large buttons followed by one small button (Captions has two small: `Update Table`, `Cross-reference`).

### 1.2 Mailings tab — groups and controls, left to right

| # | Group label | Control, left → right | Control type | Opens / behavior |
|---|---|---|---|---|
| 1 | **Create** | **Envelopes** | Large button | **Envelopes and Labels** dialog, Envelopes tab. |
| 1 | | **Labels** | Large button | **Envelopes and Labels** dialog, Labels tab. |
| 2 | **Start Mail Merge** | **Start Mail Merge** | Large button + dropdown | **Letters**, **E-mail Messages…**, **Envelopes…**, **Labels…**, **Directory**, separator, **Normal Word Document**, separator, **Step-by-Step Mail Merge Wizard…**. |
| 2 | | **Select Recipients** | Large button + dropdown | **Type a New List…**, **Use an Existing List…**, **Choose from Outlook Contacts…**. |
| 2 | | **Edit Recipient List** | Large button | **Mail Merge Recipients** dialog. Disabled/greyed until a data source is connected. |
| 3 | **Write & Insert Fields** | **Address Block…** | Large button | **Insert Address Block** dialog. Disabled until a data source is connected and the main document type supports it. |
| 3 | | **Greeting Line…** | Large button | **Insert Greeting Line** dialog. Disabled until a data source is connected. |
| 3 | | **Insert Merge Field** | Large button + dropdown | Field list from the connected data source; inserts `«Field»`. Disabled until a data source is connected. |
| 3 | | **Rules** | Large button + dropdown | **Ask…**, **Fill-in…**, **If…Then…Else…**, **Merge Record #**, **Merge Sequence #**, **Next Record**, **Next Record If…**, **Set Bookmark…**, **Skip Record If…**. |
| 3 | | **Highlight Merge Fields** | Small button | Toggles highlighting of inserted merge fields. |
| 3 | | **Match Fields** | Small button | **Match Fields** dialog (document field ↔ data-source column). |
| 3 | | **Update Labels** | Small button | Repeats/propagates the label layout to every label on the sheet for label merges. |
| 4 | **Preview Results** | **Preview Results** | Large toggle button | Turns preview on/off. When on, shows merged record data in place of fields. |
| 4 | | **First record / Previous record / Next record / Last record** | Small arrow buttons (appear when preview is on) | Navigate records; a `Record x of y` counter is shown beside them. |
| 4 | | **Find Recipient** | Small button | **Find Recipient** dialog: search text, **Find Next**. |
| 4 | | **Check for Errors** | Small button + dropdown | **Simulated Merge…**, **Auto Check for Errors**, **Complete the merge**. |
| 5 | **Finish** | **Finish & Merge** | Large button + dropdown | **Edit Individual Documents…**, **Print Documents…**, **Send Email Messages…**. |

State rules observed in the video and in Word:

- Before a recipient list is connected, most of **Write & Insert Fields**, **Preview Results**, and **Finish** are disabled. In the video, after choosing a data source at 00:04:26–00:04:34, “many of them were grayed out … but now are not.”
- `Insert Merge Field` can still appear greyed out even with a data source when focus/selection is inside a field or the document is in a protected state; the video works around it by clicking away and triple-clicking the target text (00:08:53–00:09:05). This is a Word focus quirk, not intended behavior.
- `Edit Recipient List` becomes enabled once a list is attached; the button remains available after preview is toggled off.
- `Address Block` and `Greeting Line` are only meaningful for letter/e-mail/envelope/label main documents; they remain visible for Directory but the resulting fields behave like ordinary merge fields.

---

## 2. Dropdowns, dialogs, and field-level details

### 2.1 Table of Contents

#### Table of Contents gallery

Clicking the caret (or the button in the video at 00:00:46) opens a gallery panel at least 240 px wide with live thumbnails:

| Item | What it inserts | Updatable |
|---|---|---|
| **Automatic Table 1** | `TOC` field using built-in “Contents” heading style; entries use TOC 1–3 | Yes |
| **Automatic Table 2** | `TOC` field with a different built-in look (video selects this at 00:02:51) | Yes |
| **Manual Table** | A static table with placeholder entries and no `TOC` field | No (manual editing only) |
| **Custom Table of Contents…** | Opens **Table of Contents** dialog | Yes |
| **Remove Table of Contents** | Deletes the TOC field/result, not the document | — |

Clone minimum: Automatic Table 1, Automatic Table 2, Manual Table, Custom Table of Contents…, Remove Table of Contents.

#### Add Text dropdown

| Item | Behavior |
|---|---|
| **Do Not Show in Table of Contents** | Removes the `TC` entry/level from the selection; the paragraph stays in the body but is excluded from the TOC. |
| **Level 1** … **Level 9** | Marks the selected text as a TOC entry at that level. Word writes a hidden `TC` field such as `{ TC "New Wave" \l 1 }`. This is how a non-heading paragraph can be added to an automatic TOC. |

Word’s built-in behavior: if the selection is already a Heading style, changing Add Text level overrides the outline level for TOC purposes without changing the visual paragraph style. The video uses Level 1 on a normal paragraph at 00:04:14–00:04:25, then updates the whole table, and the paragraph appears with a page number (00:04:34).

#### Update Table dropdown / dialog

- **Update Table…** opens a small dialog headed **Update Table of Contents** with two radio buttons:
  - **Update page numbers only** — keeps entry text/order, recomputes page numbers.
  - **Update entire table** — rebuilds entries and page numbers from current headings/TC fields.
- If the cursor is inside a TOC, the in-document control also shows an **Update Table** button/chip (video 00:03:51); right-clicking a TOC offers **Update Field**.
- If the document has no TOC, `Update Table` should be disabled or show a non-destructive message.

#### Table of Contents dialog (Custom Table of Contents…)

Dedicated dialog (modern Word; not the legacy tabbed “Index and Tables” dialog):

| Area | Control | Values / notes |
|---|---|---|
| Preview | **Print Preview** checkbox + preview pane | Shows the current format. |
| Preview | **Web preview** checkbox | Switches preview to web layout. |
| Page numbers | **Show page numbers** | Default on; off for web-only docs. |
| Page numbers | **Right align page numbers** | Default on; produces dot-leader alignment. |
| Page numbers | **Tab leader** | `(none)`, `......`, `------`, `______` (Word shows none/dot/dash/underline). |
| Format | **Formats** | **From template**, **Classic**, **Distinctive**, **Fancy**, **Modern**, **Simple**, **Formal** (exact list is build-dependent). |
| Depth | **Show levels** | Spinner 1–9, default **3**. |
| Advanced | **Options…** | Opens **Table of Contents Options**. |
| Advanced | **Modify…** | Opens the style editor for the selected TOC level style. |
| Footer | **OK** / **Cancel** | Inserts at cursor. |

**Table of Contents Options** dialog:

- **Build table of contents from** list with checkboxes:
  - **Styles** — map any paragraph style to TOC level 1–9 (default: Heading 1→1, Heading 2→2, Heading 3→3).
  - **Outline levels** — map outline levels 1–9.
  - **Table entry fields** — include `TC` fields.
- Columns: **Style** / **TOC level** (or **Outline level** / **TOC level**).
- **Reset** restores defaults; **OK** / **Cancel**.

#### TOC field and generated result

A default TOC is a field, conceptually:

```
{ TOC \o "1-3" \h \z \u }
```

- `\o "1-3"` = heading outline levels.
- `\h` = entries are hyperlinks.
- `\z` = hide tab leader/page numbers in Web Layout.
- `\u` = use applied paragraph outline levels.
- Manual `TC` entries are included by the TOC field and carry `\l <level>`.

Result formatting: “Table of Contents” heading in **TOC Heading** style; entries in **TOC 1**, **TOC 2**, … **TOC 9** with a right-aligned tab stop and leader; page number at the right margin; Ctrl+click follows the hyperlink. The heading itself is not an entry.

### 2.2 Footnotes and endnotes

#### Insert Footnote / Insert Endnote

- Inserts a superscript reference mark at the caret.
- Immediately moves the caret to the note area at the bottom of the page (footnote) or end of document/section (endnote) so the user can type note text.
- Auto-numbering increments; later insertion renumbers subsequent notes.
- Video evidence: 00:05:07–00:05:25 shows a superscript **1** at the reference and a **1** in the footnote area with a flashing cursor. The transcript gap then hides the typing and the endnote demonstration; endnotes in Word default to lowercase roman numerals (`i`, `ii`, `iii`), which matches the clone’s existing literal `[i]` placeholder but not its behavior.

#### Next Footnote

Dropdown items and behavior:

| Item | Behavior |
|---|---|
| **Next Footnote** | Selects/jumps to the next footnote reference in document order. |
| **Previous Footnote** | Jumps backward. |
| **Next Endnote** | Jumps to the next endnote. |
| **Previous Endnote** | Jumps backward. |

If the caret is in the body, `Next Footnote` opens the note pane if needed. Keyboard equivalents are in §4.

#### Show Notes

- In Print Layout: opens a pane at the bottom of the window showing the current footnote/endnote.
- In Draft: displays notes in the note pane; the body shrinks.
- The pane has a dropdown to switch **All Footnotes** / **All Endnotes** and shows the note separator.

#### Footnote and Endnote dialog (group launcher)

| Section | Control | Values |
|---|---|---|
| Location | **Footnotes:** | **Bottom of page** (default) / **Below text** |
| Location | **Endnotes:** | **End of document** (default) / **End of section** |
| Format | **Number format:** | `1, 2, 3`; `a, b, c`; `A, B, C`; `i, ii, iii`; `I, II, III`; `*, †, ‡` (and section symbol variants) |
| Format | **Start at:** | 1 (or chosen start) |
| Format | **Numbering:** | **Continuous** / **Restart each section** / **Restart each page** |
| Apply | **Apply changes to:** | **Whole document** / **This section** / **This point forward** |
| Convert | **Convert…** | Opens **Convert Notes**: **Convert all footnotes to endnotes**, **Convert all endnotes to footnotes**, **Swap footnotes and endnotes** |
| Footer | **OK** / **Cancel** | Applies formatting to existing and future notes. |

Additional Word behavior to model:

- Footnote/endnote text is part of the document story, not body inline text; it must survive save/reopen and export.
- A separator line (and continuation separator) appears above footnotes at the bottom of the page.
- Footnotes can break across pages depending on length; “Below text” anchors them below the last body line rather than the page bottom.
- Footnotes/endnotes can be cross-referenced (`REF` to the note number).
- Endnotes appear at the end of the document (or section) with their own heading/separator.

### 2.3 Citations and bibliography

#### Style dropdown

Observed styles in the video: **APA**, **Chicago**, **MLA** (00:08:09–00:08:24). Word’s built-in list is version-dependent; a typical Word 2019/365 list is:

| Style label | Family |
|---|---|
| **APA Sixth Edition** | Author–date |
| **Chicago Sixteenth Edition** (some builds: Seventeenth) | Note/bibliography or author–date depending on fields |
| **GOST - Name Sort** | Name sort |
| **GOST - Title Sort** | Title sort |
| **Harvard - Anglia Ruskin University** | Author–date |
| **IEEE** | Numeric |
| **ISO 690 - First Element and Date** | Numeric/name |
| **ISO 690 - Numerical Reference** | Numeric |
| **MLA Seventh Edition** | Author–page |
| **MLA Eighth Edition** (newer builds may offer Ninth) | Author–page |
| **Turabian Sixth Edition** | Notes |
| **Turabian Seventh Edition** | Notes |
| **Vancouver** | Numeric |

Clone recommendation: ship at least **APA 7th**, **MLA 9th**, **Chicago 17th (author–date and notes)**, **IEEE**, **Harvard**, **Vancouver**, plus a “plain” style for testing; keep the Word labels visible in the dropdown so screenshot parity is reasonable. Style changes re-render every in-text citation and the bibliography, not just future insertions.

Minimum rendering rules for the three styles seen in the video:

| Style | In-text citation | Bibliography entry (book example) |
|---|---|---|
| APA | (Author, Year) or Author (Year) | Author, A. A. (Year). *Title of work*. Publisher. |
| Chicago (author–date) | (Author Year, page) | Author, First. Year. *Title of Work*. Place: Publisher. |
| MLA | (Author page) | Author, First. *Title of Work*. Publisher, Year. |

(Exact punctuation is style-edition-specific; implement a formatter table rather than hardcoding strings.)

#### Insert Citation dropdown

| Item | Behavior |
|---|---|
| **Add New Source…** | Opens **Create Source** dialog. |
| **Add New Placeholder…** | Opens **Placeholder Name** dialog; inserts a placeholder citation such as `[Placeholder]` that can later be associated with a real source. |
| *Existing sources* | Lists every source in the **Current List**, usually sorted by author/title. Selecting one inserts an in-text citation at the caret. Hovering shows source details. |

#### Create Source / Edit Source dialog

| Area | Field | Notes |
|---|---|---|
| Top | **Type of Source** | Book, Book Section, Journal Article, Article in a Periodical, Conference Proceedings, Report, Web Site, Document from Web site, Electronic Source, Art, Sound Recording, Performance, Film, Interview, Patent, Case, Misc. Changing type changes the visible fields. |
| Fields | **Author** + **Edit…** | Author editor supports Last / First / Middle, Add, Delete; multiple authors; corporate author. |
| Fields | **Title** | Required for most types. |
| Fields | **Year** | Publication year; date fields for web sources. |
| Fields | **Publisher**, **City**, **Edition**, **Volume**, **Pages** | Book/article fields. |
| Fields | **Journal Name**, **Issue**, **Page range** | Article fields. |
| Fields | **URL**, **Accessed**, **Medium**, **Web site name** | Web/electronic fields. |
| Fields | Type-specific fields | Institution, Conference name, Place published, Producer, Director, Performer, Album title, Recording company, Theater, City, Date, Patent number, Country/Region, Court, Case number, Reporter, Short title, Standard number. |
| Options | **Show All Bibliography Fields** | Reveals every field for the selected type/style, not just the recommended subset. |
| Bottom | **Tag name:** | Unique key for the source (`AuthorYear`, `Source1`). Used by citations and the bibliography; must be unique within the document. |
| Footer | **OK** / **Cancel** | Adds to both **Current List** and (usually) **Master List**. |

#### Manage Sources (Source Manager)

| Area | Control | Behavior |
|---|---|---|
| Left | **Master List** | All sources available to the user/profile, including sources from other documents. |
| Right | **Current List** | Sources cited in the current document; checkmarks indicate cited-in-document. |
| Center | **Copy** buttons (`>` / `<`) | Copy selected source between Master and Current lists. |
| Lists | **Sort by** (Author / Title / Year) | Sort control per list (version-dependent placement). |
| Lists | Search/filter box | Filters the master list in newer builds. |
| Buttons | **New…** | Opens **Create Source**. |
| Buttons | **Edit…** | Opens **Edit Source** for the selected source. |
| Buttons | **Delete** | Removes from the list (with confirmation in some builds). |
| Bottom | **Preview** | Shows the selected source formatted in the active style. |
| Footer | **Close** | Applies changes to the document bibliography on update. |

Behavior:

- Sources are stored with the document; the Master List persists in the user’s Word profile. The clone can store `sources` in document JSON plus a localStorage master list.
- Inserting a citation creates a `CITATION` field referencing the source tag.
- The video at 00:08:27–00:08:50 describes the manager as useful for ordering, correcting, editing, deleting, copying, pasting, and creating sources.
- **Change Provider** (transcript 00:08:52–00:09:04) is a legacy/third-party citation-provider control. It is not present in current Microsoft 365 References ribbon; do not add it to the default clone UI. If needed, expose provider selection from the Source Manager’s options instead.

#### Citation Options (in-document citation control)

Clicking an inserted citation exposes:

| Item | Behavior |
|---|---|
| **Edit Citation…** | Opens **Edit Citation**: **Pages** (e.g., `42–44`), and **Suppress** checkboxes for **Author**, **Year**, **Title**. Used for direct quotes and narrative citations. |
| **Edit Source…** | Opens **Edit Source**; changes propagate to all citations of that source and the bibliography. |
| **Update Citations and Bibliography** | Re-renders fields after source/metadata changes. |
| **Convert Citation to Static Text** | Removes the field and leaves the current rendered text. |

#### Bibliography dropdown

| Item | Behavior |
|---|---|
| **Insert Bibliography** | Inserts a `BIBLIOGRAPHY` field at the caret using the active style. Heading “Bibliography” (or “References” per style), entries sorted per style, hanging indent. Disabled/no sources → inserts an empty bibliography or a message. |
| **Update Citations and Bibliography** | Rebuilds the bibliography and all citation fields. |
| **Convert Citations and Bibliography → Convert to Static Text** | Replaces fields with plain formatted text; no further updates. |

#### Placeholders

- **Add New Placeholder…** asks for a placeholder name and inserts a visible placeholder citation.
- Placeholders appear in the source list with a distinct icon/status.
- Selecting a placeholder and choosing **Edit Source** lets the user turn it into a real source; citations and bibliography then update.
- Word warns that placeholders are not included in the final bibliography until they are resolved (behavior varies by version; the clone should show an unresolved-placeholder warning rather than silently omitting them).

### 2.4 Captions, Table of Figures, cross-references

#### Insert Caption dialog

| Area | Control | Values / notes |
|---|---|---|
| Caption | **Caption:** | Free text, pre-filled as `Figure 1` (or current label + next number). |
| Options | **Label:** | **Figure**, **Table**, **Equation**, plus any custom labels. |
| Options | **Position:** | **Above selected item** / **Below selected item**. |
| Options | **Exclude label from caption** | Hides “Figure 1” text but keeps the `SEQ` field/number for cross-references. |
| Buttons | **New Label…** | Creates a custom label (e.g., “Chart”, “Exhibit”). |
| Buttons | **Delete Label** | Removes a custom label (not the built-ins). |
| Buttons | **Numbering…** | Opens **Caption Numbering**. |
| Buttons | **AutoCaption…** | Opens **AutoCaption**. |
| Footer | **OK** / **Cancel** | Inserts caption paragraph in **Caption** style. |

**Caption Numbering** dialog:

- **Format:** `1, 2, 3`; `a, b, c`; `A, B, C`; `i, ii, iii`; `I, II, III`.
- **Include chapter number** checkbox.
- **Chapter starts with style:** Heading 1…Heading 9 (enabled when include chapter number is checked).
- **Use separator:** hyphen, period, colon, em dash, en dash.
- **OK** / **Cancel**.

**AutoCaption** dialog:

- **Add caption when inserting:** checklist of object types (Microsoft Word Table, Microsoft Word Picture, Microsoft Word Drawing, etc.).
- **Use label:** dropdown.
- **Position:** above/below.
- **OK** / **Cancel**.

Video evidence: a picture is captioned at 00:09:32–00:09:46 (“I want to label the figure below the selected item”); a shape is captioned at 00:09:56–00:10:01; a selected paragraph is captioned at 00:10:21–00:10:33. This confirms captions are not limited to images and can wrap any selected object/paragraph.

#### Insert Table of Figures dialog

| Area | Control | Values / notes |
|---|---|---|
| Preview | **Print Preview** / **Web preview** | Preview pane. |
| Page numbers | **Show page numbers** | On by default. |
| Page numbers | **Right align page numbers** | On by default. |
| Page numbers | **Tab leader** | none / dot / dash / underline. |
| Format | **Formats** | From template, Classic, Distinctive, Fancy, Modern, Simple, Formal (build-dependent). |
| Entries | **Caption label:** | **Figure**, **Table**, **Equation**, custom labels. This filters entries by caption label. |
| Entries | **Include label and number** | Includes “Figure 1” prefix in each entry; off shows only caption text. |
| Advanced | **Options…** | Choose the style used to build the table (e.g., `Table of Figures` style, headings) and map entries. |
| Advanced | **Modify…** | Edit the Table of Figures style. |
| Footer | **OK** / **Cancel** | Inserts a `TOC \c "<label>"` field. |

Word field: `{ TOC \h \z \c "Figure" }` for figures; `\c "Table"` for tables. Update via **Update Table**, right-click **Update Field**, or F9.

#### Cross-reference dialog

| Control | Values / notes |
|---|---|
| **Reference type:** | Numbered item, Heading, Bookmark, Footnote, Endnote, Equation, Figure, Table. |
| **Insert reference to:** | Depends on type — see table below. |
| **Insert as hyperlink** | Makes the reference Ctrl+clickable. |
| **Include above/below** | Inserts “above”/“below” relative to the target (only for types that support it). |
| **Separate numbers with** | Hyphen, period, colon, em dash, en dash (numbered items/headings with multi-level numbers). |
| **For which heading / numbered item / bookmark / footnote / endnote / figure** | List of targets in the document. |
| **Insert** | Inserts a `REF` field at the caret and keeps the dialog open. |
| **Close** | Closes the dialog. |

`Insert reference to` options by type:

| Type | Options |
|---|---|
| **Heading** | Heading text, Page number, Heading number, Heading number (no context), Heading number (full context), Above/below |
| **Numbered item** | Paragraph number, Paragraph number (no context), Paragraph number (full context), Page number, Above/below |
| **Bookmark** | Bookmark text, Page number, Above/below |
| **Footnote** | Footnote number, Page number, Above/below |
| **Endnote** | Endnote number, Page number, Above/below |
| **Figure / Table / Equation** | Entire caption, Only label and number, Only caption text, Page number, Above/below |

Video evidence: 00:10:43–00:11:12 cross-references a paragraph to a heading; the dialog is set to reference type **Heading**, target heading chosen, then **Insert**, **Close**. The reference text updates when the heading changes.

### 2.5 Index

#### Mark Index Entry dialog

| Area | Control | Behavior |
|---|---|---|
| Entry | **Main entry:** | Pre-filled with the selected text (e.g., “New Wave”). |
| Entry | **Subentry:** | Optional nested term (e.g., “Synthesizers”). |
| Options | **Cross-reference:** | “See …” / “See also …” text; mutually exclusive with page options. |
| Options | **Current page** | Default; indexes the current page. |
| Options | **Page range** | Uses a bookmark and the range’s start/end pages. |
| Options | **Bookmark:** | Enabled with Page range. |
| Format | **Bold** / **Italic** | Applies to the main entry text in the index. |
| Format | **Page number format: Bold / Italic** | Applies to the page number. |
| Buttons | **Mark** | Marks the current occurrence and keeps the dialog open for the next entry. |
| Buttons | **Mark All** | Marks every occurrence of the selected text in the document. |
| Buttons | **Cancel** | Closes without marking (also acts as Close). |

Behavior: marking writes a hidden `XE` field such as `{ XE "New Wave" }` or `{ XE "New Wave:Synthesizers" }`. The markup is visible when **Show/Hide ¶** is on and hidden in Read Mode (video 00:11:38–00:12:07). `Mark All` at 00:11:41 marks the term across pages.

#### Insert Index dialog

| Area | Control | Values / notes |
|---|---|---|
| Preview | **Print Preview** / **Web preview** | Preview pane. |
| Type | **Indented** / **Run-in** | Indented = each subentry on its own line; Run-in = subentries flow in a paragraph. |
| Layout | **Columns:** | 1–4 (typically 1 or 2). |
| Page numbers | **Right align page numbers** | On by default for indented indexes. |
| Page numbers | **Tab leader** | none / dot / dash / underline. |
| Format | **Formats** | From template, Classic, Fancy, Modern, Bulleted, Formal, Simple. |
| Advanced | **Options…** | Index style/build options. |
| Advanced | **Modify…** | Edit index styles. |
| Footer | **OK** / **Cancel** | Inserts an `INDEX` field. |

Generated result: heading “Index” (Index Heading style), alphabetical main entries, subentries indented, page numbers with leaders, repeated page numbers suppressed, page ranges where marked. Update with **Update Index** or F9. In the video the first index shows “New Wave” on the title page and pages 1–5 (00:12:27–00:12:42); a second term (“Synthesizers”) is added and a fresh index shows both terms (00:12:45–00:13:09).

### 2.6 Table of Authorities

#### Mark Citation dialog

| Area | Control | Behavior |
|---|---|---|
| Text | **Selected text:** | Pre-filled from the selection; editable. |
| Category | **Category:** | Cases, Statutes, Other Authorities, Rules, Treatises, Regulations, Constitutional Provisions, plus custom categories 8–16. |
| Citations | **Short citation:** | Short form shown in the TOA (e.g., `Brown v. Board`). |
| Citations | **Long citation:** | Full citation text, often multiline; can include page reference placeholder. |
| Buttons | **Next Citation** | Jumps to the next `TA` field/citation candidate. |
| Buttons | **Mark** | Marks the current citation and keeps the dialog open. |
| Buttons | **Mark All** | Marks all occurrences of the citation text. |
| Buttons | **Cancel** | Closes. |

Hidden field example: `{ TA \l "Brown v. Board of Education, 347 U.S. 483 (1954)" \s "Brown v. Board" \c 1 }`.

#### Insert Table of Authorities dialog

| Area | Control | Values / notes |
|---|---|---|
| Preview | **Print Preview** / **Web preview** | Preview pane. |
| Category | **Category:** | **All** or one category (Cases, Statutes, Other Authorities, Rules, Treatises, Regulations, Constitutional Provisions). |
| Options | **Use passim** | Replaces repeated page numbers with “passim” when a citation appears on many pages (Word threshold is 5 pages). |
| Options | **Keep original formatting** | Preserves citation formatting instead of applying the TOA style. |
| Page numbers | **Tab leader** | none / dot / dash / underline. |
| Format | **Formats** | From template, Classic, Distinctive, Fancy, Modern, Bulleted, Formal, Simple. |
| Advanced | **Modify…** | Edit TOA styles. |
| Footer | **OK** / **Cancel** | Inserts `{ TOA \c <n> }` or an all-categories TOA. |

Video evidence: 00:13:48–00:13:56 selects text, opens **Mark Citation**, chooses a category and long citation, then **Mark**, **Close**; 00:14:02–00:14:08 inserts the Table of Authorities and accepts the default options.

### 2.7 Envelopes and Labels

#### Envelopes tab

| Area | Control | Behavior |
|---|---|---|
| Address | **Delivery address:** | Multiline; pre-filled from selection if the document has an address-like selection. |
| Address | **Return address:** | Multiline; pre-filled from Word user info. |
| Address | **Omit** | Hides the return address on the envelope. |
| Preview | Envelope preview | Shows delivery/return placement. |
| Buttons | **Options…** | **Envelope Options** dialog. |
| Buttons | **Add to Document** | Inserts the envelope as page 1 of the current document (Word may prompt to save). |
| Buttons | **Print** | Sends the envelope to the printer. |
| Buttons | **Cancel** | Closes. |

**Envelope Options** dialog:

- **Envelope size:** dropdown (Size 10, DL, C5, C4, Monarch, Personal, custom), with **Custom…**.
- **Delivery address:** **From left** / **From top** spin boxes.
- **Return address:** **From left** / **From top** spin boxes.
- **Printing Options** tab: feed method diagrams, **Face up** / **Face down**, **Clockwise rotation**, paper source/tray.
- **OK** / **Cancel**.

#### Labels tab

| Area | Control | Behavior |
|---|---|---|
| Address | **Address:** | Multiline label content. |
| Address | **Use return address** | Includes the return address above the delivery address. |
| Print | **Full page of the same label** | Repeats the address on every label on the sheet. |
| Print | **Single label** + **Row:** / **Column:** | Prints only one label at the chosen grid position. |
| Buttons | **Options…** | **Label Options** dialog. |
| Buttons | **New Document** | Creates a label sheet document. |
| Buttons | **Print** | Prints labels. |
| Buttons | **Cancel** | Closes. |

**Label Options** dialog:

- **Printer information:** **Continuous feed** / **Page printers**, **Tray:** dropdown.
- **Label information:** **Label vendors:** (Avery US Letter, Avery A4/A5, etc.), **Product number:** list, **Type:**, **Height:**, **Width:**, **Details…**.
- **OK** / **Cancel**.

Mail-merge relationship: envelopes and labels can be the main document for a merge; the **Mailings → Start Mail Merge → Envelopes/Labels** path creates the layout, then recipients/fields are added normally. The Mail Merge video teases envelope merge at 00:14:20–00:14:33 but does not demonstrate it.

### 2.8 Mail merge

#### 2.8.1 Start Mail Merge choices

| Item | Effect |
|---|---|
| **Letters** | Standard form letters; one output document page-set per record. |
| **E-mail Messages…** | Main document becomes an e-mail body; Finish → Send Email Messages becomes the primary output. |
| **Envelopes…** | Opens Envelope Options, then sets the document to envelope size/layout. |
| **Labels…** | Opens Label Options, then creates a label grid; `Update Labels` propagates the layout. |
| **Directory** | One output document listing all records (no page break per record), used for catalogs/lists. |
| **Normal Word Document** | Resets the main document to a normal document and disconnects merge type (data source may remain). |
| **Step-by-Step Mail Merge Wizard…** | Opens the 6-step task pane described below. |

#### 2.8.2 Select Recipients

| Item | Effect |
|---|---|
| **Type a New List…** | Opens **New Address List**; on OK, prompts to save the list, then attaches it. |
| **Use an Existing List…** | Opens a file picker (Excel `.xlsx/.xls`, CSV, TXT, Access, Word data source). |
| **Choose from Outlook Contacts…** | Opens the Outlook contact picker (Windows desktop Word only; not applicable to a browser clone unless Outlook integration exists). |

**Data-source connection (Excel)** — observed in detail:

1. File picker; choose the workbook.
2. Word shows **Select Table** listing worksheets/named ranges (video shows only `Sheet1$` because the workbook has one data sheet).
3. **First row of data contains column headers** checkbox (must be checked when row 1 is headers; video 00:04:11–00:04:24).
4. **OK** attaches the data; ribbon buttons enable. No visible success banner is shown (video 00:04:26–00:04:40).

Word requirements stated in Microsoft docs and demonstrated in the video:

- All data on the first sheet (or a named range) is the most reliable.
- Header row names become merge-field names.
- Keep addresses split into Street/City/State/ZIP if individual fields are needed; a single address column is also valid.
- Keep first/last names separate when the greeting line should use only a first or last name.
- Format percentages, currencies, postal codes, and leading zeros in Excel before connecting; Word reads displayed values.
- Close/save the workbook before connecting; changes made after connection are not automatically re-read (reconnect or refresh).

#### 2.8.3 New Address List dialog

| Area | Control | Behavior |
|---|---|---|
| Grid | Columns | Title, First Name, Last Name, Company Name, Address Line 1, Address Line 2, City, State, ZIP Code, Country or Region, Home Phone, Work Phone, E-mail Address (plus custom columns). |
| Buttons | **New Entry** | Adds a blank row. |
| Buttons | **Delete Entry** | Deletes the selected row. |
| Buttons | **Find Entry** | Searches the list (field + value). |
| Buttons | **Customize Columns…** | Add/remove/rename/reorder fields. |
| Footer | **OK** / **Cancel** | OK prompts **Save Address List** (file name + type); then attaches the saved list. |

#### 2.8.4 Mail Merge Recipients dialog

| Area | Control | Behavior |
|---|---|---|
| Grid | Checkbox column + data columns | Uncheck a recipient to exclude from the merge (video 00:04:58–00:05:07 unchecks “Lena,” then re-checks her at 00:05:39). |
| Grid | Column headers | Sort on click; column chooser may be available. |
| Bottom | **Data source:** dropdown + **Browse…** | Shows the attached file; browse to change. |
| Refine | **Sort…** | **Sort by** / **Then by** up to three fields, ascending/descending. |
| Refine | **Filter…** | Field / Comparison / Compare to, with And/Or rows. |
| Refine | **Find duplicates…** | Compare records by selected fields; reports duplicate groups. |
| Refine | **Find recipient…** | Search box; finds a record by any field. |
| Refine | **Validate addresses…** | Address-validation service/dialog (availability is version/region dependent). |
| Footer | **OK** / **Cancel** | Applies selection/filters/sort to the merge. |

Filter comparison operators: equals, not equal to, less than, greater than, less than or equal, greater than or equal, is blank, is not blank (plus “begins with”/“contains” in some builds). The video demonstrates filtering by **State** and notes ZIP code as another field (00:05:12–00:05:22), sorting (00:05:22–00:05:27), finding duplicates (00:05:29), and validating addresses (00:05:32).

#### 2.8.5 Insert Address Block dialog

| Area | Control | Behavior |
|---|---|---|
| Name | **Insert recipient’s name in this format** + dropdown | Formats: First Last; First Middle Last; First M. Last; F. M. Last; First Last; Last, First; Last, First Middle; Last, First M.; etc. |
| Company | **Insert company name** | Includes the Company Name field. |
| Address | **Insert postal address** | Includes Address 1/2, City, State, ZIP, Country/Region. |
| Address | **Format address according to the destination country/region** | Uses the data source’s country to choose layout (version-dependent). |
| Preview | Preview pane + **Previous/Next** arrows | Shows the selected record’s block. |
| Footer | **OK** / **Cancel** | Inserts an `ADDRESSBLOCK` field. |

If a needed column is unmatched, the preview omits it (video 00:10:05–00:10:10: city/state/ZIP present, street missing). Fix via **Match Fields**.

#### 2.8.6 Insert Greeting Line dialog

| Area | Control | Values |
|---|---|---|
| Greeting | **Greeting line format:** | Salutation: **Dear**, **To**, or none; name format: **Joshua Randall**, **Joshua**, **Mr. Randall**, etc.; punctuation: **comma**, **colon**, **semicolon**, **none**. |
| Invalid names | **Greeting line for invalid recipient names:** | Default **Dear Sir or Ma’am**, plus other generic options. |
| Preview | Preview pane + arrows | Cycles through records, e.g. “Dear Lena,” “Dear Ellis,” “Dear Douglas,” (video 00:07:08–00:07:23). |
| Footer | **OK** / **Cancel** | Inserts a `GREETINGLINE` field. |

#### 2.8.7 Insert Merge Field

Modern Word: the large button’s dropdown lists every field/column from the connected data source; choosing one inserts `«Field»`. Legacy/alternate dialog: **Insert Merge Field** with a **Fields** list, **Database fields** / **Address fields** radio choice, **Insert**, **Cancel**.

Video behavior: first-name and last-name fields are inserted at 00:09:14–00:09:19, then **Close** (dialog form); other fields can be inserted anywhere, including e-mail and phone (00:11:22–00:11:31). Fields are placeholder tokens, not plain text.

#### 2.8.8 Rules dropdown and dialogs

| Rule | Dialog fields | Effect |
|---|---|---|
| **Ask…** | Bookmark name, Prompt, Default bookmark text | Prompts the user once per merge (or per record, depending on field options) and stores the answer in a bookmark for use by `REF`/conditional rules. |
| **Fill-in…** | Prompt, Default fill-in text | Prompts once and inserts the answer as text at the field location. |
| **If…Then…Else…** | Field name, Comparison, Compare to, Insert this text, Otherwise insert this text | Inserts conditional text per record; e.g., “If State = TX insert ‘Howdy’ otherwise ‘Hello’.” |
| **Merge Record #** | — (inserts `MERGEREC`) | Inserts the current merge record number. |
| **Merge Sequence #** | — (inserts `MERGESEQ`) | Inserts the number of the record in the merged output (affected by skips/conditions). |
| **Next Record** | — (inserts `NEXT`) | Moves to the next record immediately; used for label grids and multi-record layouts. |
| **Next Record If…** | Field name, Comparison, Compare to | Advances to the next record only when the condition is true. |
| **Set Bookmark…** | Bookmark name, Bookmark text | Defines/redefines a bookmark value for later `REF` fields. |
| **Skip Record If…** | Field name, Comparison, Compare to | Omits the current record from output when true. |

#### 2.8.9 Match Fields dialog

| Area | Content |
|---|---|
| Left | **Field name in your document:** Address 1, Address 2, Address 3, Address 4, City, Company Name, Country or Region, E-mail Address, First Name, Home Phone, Last Name, Postal Code, State, Work Phone. |
| Right | **Field name from your data source:** dropdown per row; `(not matched)` plus every column from the data source. |
| Bottom | **Remember this mapping** (version-dependent) / **OK** / **Cancel**. |

Video examples:

- First Name → First Name and Last Name → Last Name matched automatically (00:07:54).
- Address 1 unmatched; user maps **Address 1 → Business Address** (the Excel column holding the street) at 00:10:17–00:10:35. After OK, the address block preview gains the street line (00:10:36–00:10:48).
- Name/company display options and preview are revisited at 00:10:51–00:11:02.

#### 2.8.10 Preview Results

- Toggle turns the document into a read-only preview of the current record; clicking again returns to field view. It is explicitly a toggle in the video (00:12:13).
- Navigation: First, Previous, Next, Last record arrows; `Record x of y` counter.
- **Find Recipient** opens a small dialog with a search field and **Find Next**.
- Editing while preview is on edits the main document and propagates to all records (video 00:11:50–00:12:01 fixes a missing space between first and last name; 00:12:35 deletes a duplicated name and the preview updates for every record).
- Video defects shown intentionally: `Stephanie Ball` repeated (name inserted both by Address Block and by manual fields), and missing space between first/last name (00:11:38–00:11:59).

#### 2.8.11 Check for Errors

| Option | Behavior |
|---|---|
| **Simulated Merge…** | Dry run that reports missing fields/records without producing output; user can continue or cancel. |
| **Auto Check for Errors** | Checks during the actual merge and prompts when a problem is found. |
| **Complete the merge** | Merges without pre-checking. |

Video: the menu shows three options at 00:12:54, but the user skips it because preview already looks correct.

#### 2.8.12 Finish & Merge dialogs

| Output | Dialog | Fields |
|---|---|---|
| **Edit Individual Documents…** | **Merge to New Document** | **Merge records:** All / Current record / From [ ] To [ ]; **OK** / **Cancel**. Produces one document containing all records separated by section/page breaks (Word 2002+ default), or separate documents in older versions. Video says this would create 62 separate documents (00:13:03–00:13:12); implementation should follow modern Word: one new document with each record starting on a new page/section and a page break between. |
| **Print Documents…** | **Merge to Printer** | Same record range; **OK** → printer dialog. Video notes 62 copies (00:13:44–00:14:01). |
| **Send Email Messages…** | **Merge to E-mail** | **To:** (field dropdown, auto-selects a column named E-mail Address — video 00:13:19–00:13:27), **Subject line:**, **Mail format:** Plain text / HTML / Attachment, **Send records:** All / Current record / From–To; **OK** / **Cancel**. Requires Outlook (desktop). |

Additional behavior:

- After merging to a new document, the result is a separate document with no live data connection; the original main document keeps the connection.
- Saving the main document preserves the data source path; reopening prompts to keep/restore the connection.
- For labels/envelopes, output is laid out on the label/envelope stock; `Update Labels` must be pressed after editing the first label.
- The video saves a copy of the merge document for reuse at 00:14:07–00:14:20.

#### 2.8.13 Step-by-Step Mail Merge Wizard

Six-step task pane (right side), with `Next: …` / `Previous: …` links:

1. **Select document type** — Letters, E-mail messages, Envelopes, Labels, Directory. Radio list + description.
2. **Select starting document** — Use the current document, Start from a template, Start from existing document. For envelopes/labels, choose envelope/label options here.
3. **Select recipients** — Use an existing list (Browse…), Select from Outlook contacts, Type a new list (Create…). **Edit recipient list…** link.
4. **Write your letter** — **Address block…**, **Greeting line…**, **Electronic postage…**, **More items…**; a “You can also insert fields using the ribbon” note; `Next: Preview your letters`.
5. **Preview your letters** — recipient navigation, **Find a recipient…**, **Edit recipient list…**, **Exclude this recipient**; live preview.
6. **Complete the merge** — **Print…** (Merge to Printer), **Edit individual letters…** (Merge to New Document); “Merge” section with **Merge to New Document** / **Merge to Printer**; done.

---

## 3. End-to-end behavior

### 3.1 TOC insertion and update

**Insert**

1. User formats section titles with Heading 1–9 (video shows Home → Styles → Heading 2 at 00:01:06–00:01:57). Only heading-styled paragraphs (or TC-marked paragraphs, or mapped styles) become entries.
2. User places the caret where the TOC should go (video creates a cover page, then a blank page, and puts the caret there, 00:02:19–00:02:45).
3. References → Table of Contents → choose Automatic Table 1/2 (video picks Automatic Table 2 at 00:02:51) or Custom Table of Contents….
4. Insert a TOC field at the caret. Render:
   - Heading paragraph “Table of Contents” in TOC Heading style.
   - One entry per heading/TC field at its level, in document order.
   - Entry indentation by level; right-aligned page number with tab leader.
   - Entry text is a hyperlink to the heading/bookmark.
   - Empty document → “No headings found” message, no field.
5. Page numbers are computed from final pagination, not from character position. The clone currently has a single CSS page (`src/components/PageCanvas.tsx:49`) and a hardcoded page number `1` (`:89`), so this requires a pagination layer first.

**Update**

- Trigger: References → Update Table; right-click TOC → Update Field; F9 with the field selected; or the in-document Update Table chip.
- Dialog choice: **Update page numbers only** or **Update entire table**.
- Rebuild entries from headings/TC fields, renumber, re-paginate, preserve TOC field settings (levels, hyperlinks, leaders).
- Video failure mode to reproduce/test: after adding paragraphs the conclusion moves to a new page, but the TOC still says page 4; Update → page numbers only changes it to 6 (00:03:14–00:03:47).
- **Do not** create a duplicate TOC at the caret; update the existing field in place.
- Removing a TOC removes only the field/result, never body text.

**Add Text / TC**

- Select a non-heading paragraph or part of one → Add Text → Level 1–9.
- The paragraph remains visually unchanged; the TOC includes the selected text at that level after Update entire table.
- `Do Not Show in Table of Contents` removes the TC marking / level.
- Video: adding a full paragraph produces a long entry; the narrator notes selecting a small part would have been better (00:04:40–00:04:59). Acceptance should not truncate automatically, but UI can hint.

**Acceptance criteria**

- TOC entries exactly match headings/TC fields, in order, with correct levels.
- Page numbers update after edits with a single Update action.
- TOC field survives save/export and is not flattened to plain paragraphs on DOCX export (or is exported as a real TOC field).
- Automatic vs manual table is visually distinguishable; manual table is not auto-updated.
- Removing TOC leaves the document body intact.

### 3.2 Footnotes and endnotes

1. Caret at body position → Insert Footnote.
2. Insert a reference mark node at the caret: superscript, auto-numbered, with a stable ID.
3. Append a note object to the page’s footnote area (or end-of-document area for endnotes), with the same number, and place the caret there.
4. User types note text; body text reflows as the note area grows.
5. Subsequent insertions renumber; notes can be deleted from either the reference or the note side and both sides disappear.
6. Endnotes use their own sequence and location. Default format is lowercase roman in Word; the clone may choose Arabic but must expose Number format in the dialog.
7. Next Footnote/Previous Footnote navigate references, opening the notes pane and scrolling to the note.
8. Export must emit real Word footnotes/endnotes (not literal `[1]` text); import should preserve them.
9. Cross-references to footnote/endnote numbers must update when notes are inserted/deleted.

**Acceptance criteria**

- No literal `[1]`/`[i]` text nodes in the document model.
- Inserting before an existing note renumbers all later notes and any cross-references.
- Footnote stays with the page of its reference (or “below text” anchor).
- Deleting a reference deletes its note (with confirmation if the note has content).
- Note text can contain formatting, lists, and links.
- Word round-trip preserves note content and numbering settings.

### 3.3 Citations and bibliography

1. Choose style in References → Style (video: APA default, then Chicago, then MLA, 00:08:09–00:08:24).
2. Place caret at the citation point → Insert Citation → Add New Source… (or pick an existing source).
3. Fill **Create Source** (type, author, title, year, publisher, etc.; tag name), OK.
4. Insert an in-text citation field at the caret; render per active style.
5. Insert more citations, including repeated sources; use Citation Options → Edit Citation to add pages/suppress author/year/title.
6. Place caret at bibliography location → Bibliography → Insert Bibliography (or use the gallery/dropdown).
7. Render heading (“Bibliography” / “References”), entries sorted per style, hanging indent, style-specific punctuation/italics.
8. Change style → all in-text citations and the bibliography re-render immediately, preserving source data.
9. Manage Sources → edit/delete/copy sources; bibliography marks dirty; Update Citations and Bibliography rebuilds.
10. Add New Placeholder… → insert placeholder; later Edit Source resolves it.
11. Convert to Static Text removes fields but keeps visible text; no further updates.

**Data model requirements**

- `Source { tag, type, fields: Record<string,string>, authors: Person[], cited: boolean }`.
- Master list persisted separately from the document; Current List is per document.
- `Citation { sourceTag, pages?, suppressAuthor?, suppressYear?, suppressTitle?, placeholderName? }` inline atom/field.
- `Bibliography` block field references the current list and style.
- Formatter registry keyed by style ID with in-text and bibliography renderers; sort rules; author-name formatting; title casing per style.
- Unresolved placeholders and missing sources must be surfaced, not silently dropped.

**Acceptance criteria**

- Source edits propagate to every citation and the bibliography.
- Deleting a source used by citations warns or leaves a visible broken-citation marker.
- Style switch is lossless and instant.
- Bibliography contains exactly the cited sources (plus explicitly included ones, if supported), sorted per style.
- Word round-trip: at minimum, export static rendered text with correct formatting; ideally export `CITATION`/`BIBLIOGRAPHY` fields.

### 3.4 Captions, Table of Figures, cross-references

1. Select an image, table, equation, shape, or text paragraph.
2. References → Insert Caption… → choose label, position, text, numbering; optionally chapter numbering; OK.
3. Insert caption paragraph in Caption style immediately above/below the object; number comes from a `SEQ <label>` field, so inserting a new caption renumbers later captions.
4. Caption text can be edited; editing the number manually breaks the sequence (Word warns/handles poorly; clone should keep the field and allow text edits around it).
5. Cross-reference → choose reference type (Figure/Table/Equation/Heading/etc.), what to insert (entire caption / label and number / caption text / page number / above-below), target, Insert, Close.
6. Cross-reference inserts a `REF` field with hyperlink option; updating the caption/number updates the reference (F9 or update all).
7. Insert Table of Figures → choose caption label, include label/number, page numbers, leader, format → inserts `TOC \c "Figure"` field.
8. Update Table after adding/moving captions; page numbers and entries refresh.
9. AutoCaption can create captions automatically for future inserted objects of chosen types.

**Acceptance criteria**

- Caption numbers are fields, not typed numbers; insertion/deletion renumbers.
- Chapter numbering honors the configured heading style and separator.
- Cross-reference target list is accurate and grouped by type.
- TOF includes only the chosen label (or all labels if “All” is offered) and updates page numbers.
- “Exclude label from caption” keeps the number available to cross-references and TOF.
- Caption/TOF/cross-reference survive save/export and update after pagination changes.

### 3.5 Index

1. Select a term in the body → References → Mark Entry.
2. Dialog pre-fills **Main entry**; optionally add **Subentry**, cross-reference, page range/bookmark, bold/italic, page-number formatting.
3. **Mark** marks one occurrence and keeps the dialog open; **Mark All** marks every occurrence.
4. Hidden `XE` fields are written at the marked positions; they are visible with formatting marks on and hidden in Read Mode/print.
5. Place caret where the index belongs → Insert Index → choose type (Indented/Run-in), columns, right-align, leader, format → OK.
6. Insert an `INDEX` field; render alphabetical entries, subentries, page numbers/leaders, repeated-page suppression, cross-references.
7. After adding/removing entries, Update Index rebuilds; page numbers reflect current pagination.
8. Multiple indexes can coexist only if each is built from a distinct bookmark/range (advanced); default is one index for the document.

**Acceptance criteria**

- `Mark All` is case-insensitive enough to catch “New Wave”/“new wave” per Word behavior, but does not mark substrings inside unrelated words.
- Page ranges and “See” cross-references render correctly.
- Update Index does not duplicate entries.
- Index field survives save/export; hidden XE fields do not print.
- Read mode hides XE markup (video 00:11:57).

### 3.6 Table of Authorities

1. Select a legal citation in the body → Mark Citation.
2. Choose category, edit short/long citation, Mark (or Mark All); hidden `TA` field inserted.
3. Continue with **Next Citation** until all authorities are marked.
4. Place caret at the TOA location → Insert Table of Authorities → choose category (All or one), passim, keep original formatting, leader, format → OK.
5. Render category headings and entries with page numbers; `passim` for heavily repeated citations.
6. Update Table after edits; page numbers refresh.
7. Video demonstrates the full mark → insert flow but only one citation and default options.

**Acceptance criteria**

- Categories map to Word’s numeric categories; custom categories 8–16 supported.
- `Use passim` behavior is configurable and documented (Word uses 5+ pages).
- `Keep original formatting` preserves italics/underlines in citations.
- Update does not duplicate entries or lose category grouping.
- TA/TOA fields survive save/export; TA fields are hidden in print.

### 3.7 Complete mail merge flow

**Pre-flight (Excel)**

1. Put all data on one sheet; row 1 contains unique column headers.
2. Decide address granularity (single address vs. Street/City/State/ZIP) and name granularity (single name vs. First/Last).
3. Format ZIPs, phone numbers, currency, percentages, dates; remove blank rows; save and close the workbook.
4. Note the file path and sheet name.

**Connect (Word)**

5. Open/create the main document (form letter). Save it before connecting.
6. Mailings → Select Recipients → Use an Existing List… (the video deliberately selects recipients before Start Mail Merge, 00:02:57–00:03:33).
7. Pick the workbook → **Select Table** → choose the sheet/named range → check **First row of data contains column headers** → OK.
8. Confirm ribbon controls enable (video 00:04:32–00:04:40).
9. Optional: set the document type via Start Mail Merge → Letters/E-mail/Envelopes/Labels/Directory. (Video skips this; default is Letters.)
10. Edit Recipient List → uncheck excluded recipients, filter (e.g., State), sort, find duplicates, validate addresses → OK.

**Compose**

11. Place caret where the recipient name goes → Address Block… or Greeting Line…, or Insert Merge Field for individual fields.
12. Configure Address Block: name format, company, postal address; preview; OK.
13. Configure Greeting Line: salutation, name format, punctuation, invalid-name fallback; preview; OK.
14. If fields are wrong/blank → Match Fields → map document fields to source columns (e.g., Address 1 → Business Address) → OK; re-check preview.
15. Delete the old static placeholder text that the merge field replaced (video deletes “Recipient Name” and the old address block text at 00:08:17–00:08:21 and 00:11:04–00:11:09).
16. Insert any additional merge fields anywhere (e-mail, phone, invoice number, etc.).

**Preview and validate**

17. Preview Results on; navigate First/Previous/Next/Last; use Find Recipient.
18. Fix layout issues in preview (spaces, duplicated fields, missing lines). Edits apply to all records.
19. Optional: Check for Errors → Simulated Merge / Auto Check / Complete without checking.

**Finish**

20. Finish & Merge:
    - **Edit Individual Documents…** → record range → new document (one merged document; modern Word separates records with page/section breaks). Verify page count and record count.
    - **Print Documents…** → record range → printer dialog; verify copies = record count (video: 62 records).
    - **Send Email Messages…** → To field (auto-detected E-mail Address), subject, format (HTML/Plain/Attachment), record range → Outlook.
21. Save the main document to preserve the data connection (video 00:14:07–00:14:20).
22. Reopen later → keep the connection, replace the recipient list, or edit the main document; do not destroy the merge setup.

**Merge engine requirements**

- Main document AST with merge-field atoms (`«Field»`), rules, and conditional regions.
- Data source abstraction: workbook/sheet/range, CSV, address list; header row mapping; type coercion for dates/numbers/ZIPs.
- Recipient state: `rows`, `selectedIds`, `filters`, `sort`, `currentIndex`.
- Field map: document field name → source column; defaults; `(not matched)`.
- Evaluation order per record: apply filters/skips → evaluate rules/ASK/FILL-IN/SET → expand fields/address block/greeting → output; `NEXT` advances within a record for label grids.
- Address block and greeting line are composite fields with their own option state; editing options re-renders all records.
- `Update Labels` duplicates the first label’s content across the label grid, inserting `NEXT` records as needed.
- Output adapters: new document (merge to doc), print (browser print or host print), email (SMTP/Outlook/mailto fallback; must be explicit about unsupported environments).
- Error model: missing data source, missing column, invalid field map, zero recipients, record-range out of bounds, email column missing, printer unavailable. Never silently merge zero records.

**Acceptance criteria**

- 62-row Excel sheet produces exactly 62 merged letters (or 62 pages) with the correct name/address per record.
- Unchecked/filtered recipients are excluded from all outputs.
- Match Fields corrections immediately fix the preview and all outputs.
- Preview navigation is consistent and the counter is accurate.
- Rules produce deterministic output per record.
- Finish → Edit/Print/Email all honor the All/Current/From–To range.
- Saving and reopening preserves the connection and field mappings.
- No merge field tokens leak into final output; no static placeholder text remains where a field was inserted.

---

## 4. Keyboard shortcuts

Documented Word for Windows shortcuts relevant to these tabs. Ribbon Key Tips are dynamic and not all are published; the reliable tab access keys are **Alt+S** (References) and **Alt+M** (Mailings). After pressing those, Word displays the current key letters on the ribbon.

### References

| Action | Shortcut |
|---|---|
| Open References tab | **Alt+S** |
| Insert footnote | **Ctrl+Alt+F** |
| Insert endnote | **Ctrl+Alt+D** |
| Next footnote | **Alt+Shift+>** |
| Previous footnote | **Alt+Shift+<** |
| Mark a TOC entry (TC field) | **Alt+Shift+O** |
| Mark a table of authorities citation (TA field) | **Alt+Shift+I** |
| Choose citation options | **Alt+Shift+F12**, then **Spacebar** |
| Mark an index entry (XE field) | **Alt+Shift+X** |
| Go to a footnote/endnote/table/etc. | **Ctrl+G** (Go To dialog) |
| Update selected fields | **F9** |
| Update all fields in a selection/document | Select, then **F9** |
| Unlink a field (convert to static text) | **Ctrl+Shift+F9** |
| Toggle selected field code/result | **Shift+F9** |
| Toggle all field codes/results | **Alt+F9** |
| Next field | **F11** |
| Previous field | **Shift+F11** |
| Insert empty field | **Ctrl+F9** |
| Show/hide formatting marks (see TC/XE/TA) | **Ctrl+Shift+8** |
| Heading 1 / 2 / 3 (TOC prerequisites) | **Ctrl+Alt+1 / 2 / 3** |
| Print preview | **Ctrl+Alt+I** |
| Insert page break (for TOC/cover pages) | **Ctrl+Enter** |

### Mailings

| Action | Shortcut |
|---|---|
| Open Mailings tab | **Alt+M** |
| Preview mail merge results | **Alt+Shift+K** |
| Merge a document | **Alt+Shift+N** |
| Print the merged document | **Alt+Shift+M** |
| Edit a mail-merge data document | **Alt+Shift+E** |
| Insert a merge field | **Alt+Shift+F** |
| Insert PAGE field (page numbers) | **Alt+Shift+P** |
| Insert DATE field | **Alt+Shift+D** |
| Insert TIME field | **Alt+Shift+T** |
| Update fields after merge/edit | **F9** |

### Clone requirements

- Implement at minimum: `Ctrl+Alt+F`, `Ctrl+Alt+D`, `Alt+Shift+>`, `Alt+Shift+<`, `Alt+Shift+O`, `Alt+Shift+I`, `Alt+Shift+X`, `F9`, `Ctrl+Shift+F9`, `Shift+F9`, `Alt+F9`, `F11`, `Shift+F11`, `Ctrl+Shift+8`, `Alt+S`, `Alt+M`, `Alt+Shift+K`, `Alt+Shift+N`, `Alt+Shift+M`, `Alt+Shift+E`, `Alt+Shift+F`.
- The current app only handles `Ctrl+S/F/P/O/N` (`src/App.tsx:164-193`); no reference or merge shortcuts exist.
- On macOS, substitute `Cmd` where Word uses `Ctrl` for the documented Mac equivalents, but keep the Windows spellings in the UI for parity.

---

## 5. Gap analysis vs. current app

### 5.1 Control-by-control

| Word control | Current implementation | Gap / severity |
|---|---|---|
| **Table of Contents** gallery | `ReferencesTab.tsx:13` calls `insertTOC(editor)` directly; caret handler is empty. No gallery, no styles 1/2/manual, no remove. | **High** — no choice, no field, no styles. |
| **Add Text** (levels 1–9) | Missing entirely. | **High** — cannot add non-headings to a TOC. |
| **Update Table** | Popover (`ReferencesTab.tsx:14-24`) with “Update Table…” that calls `insertTOC` again, and “Remove Table of Contents” that does `selectAll().deleteSelection()` (`:21`). | **Critical** — update duplicates the TOC; remove deletes the entire document. |
| TOC field, page numbers, leaders, hyperlinks | `insertTOC` (`actions.ts:132-145`) inserts plain `<p class="toc-entry">` text with no page numbers, no dot leader, no hyperlink, no field; empty state inserts “No headings found” (`:135`). | **High** — cosmetic, not functional; page numbers impossible without pagination. |
| **Insert Footnote** | Inserts literal `<sup>[1]</sup>` (`ReferencesTab.tsx:30-35`), toast only. No counter, note body, separator, or pane. | **Critical** — not a footnote. |
| **Insert Endnote** | Inserts literal `<sup>[i]</sup>` (`:36-43`). | **Critical** — not an endnote. |
| **Next Footnote** / **Show Notes** / dialog launcher | Missing. | **High**. |
| **Insert Citation** | Inserts literal ` (Author, Year)` (`:47-53`); caret handler empty. | **Critical** — no source, no field, no style. |
| **Style** dropdown | Missing; no citation styles in `constants.ts`. | **High**. |
| **Bibliography** | Inserts hardcoded title + fake entry (`:56`), not a field. | **High**. |
| **Manage Sources** | Button is mislabeled “Add Citation Source” and only toasts (`:55`). No Source Manager, source list, or persistence. | **Critical**. |
| **Insert Caption** | Inserts literal “Figure 1: ” (`:60-65`); no dialog, label, position, numbering, or SEQ field. | **High**. |
| **Insert Table of Figures** | Missing entirely. | **High**. |
| **Update Table** (Captions) | Missing. | **High**. |
| **Cross-reference** | Toast only (`:67`). | **High**. |
| **Mark Entry** | Popover only toasts “Index entry marked” (`:72-83`); no dialog, no Mark All, no XE field. | **High**. |
| **Insert Index** | Inserts hardcoded “Index / Topic …… 1” (`:79`); no options, no field, no page numbers. | **High**. |
| **Update Index** | Toast only (`:80`). | **High**. |
| **Mark Citation** (TOA) | Toast only (`:87`). | **Medium/High**. |
| **Insert Table of Authorities** | Inserts title only (`:88`). | **High**. |
| **Update Table** (TOA) | Toast only (`:89`). | **Medium**. |
| **Envelopes** | Toast only (`MailingsTab.tsx:10`). | **High**. |
| **Labels** | Toast only (`:11`). | **High**. |
| **Start Mail Merge** + type dropdown | Toast only (`:14`); no document-type menu or wizard. | **Critical**. |
| **Select Recipients** + menu | Toast only (`:15`); no list/Outlook/new-list options. | **Critical**. |
| **Edit Recipient List** | Toast only (`:16`). | **Critical**. |
| **Address Block** | Missing. | **Critical**. |
| **Greeting Line** | Missing. | **Critical**. |
| **Highlight Merge Fields** | Missing. | **Medium**. |
| **Insert Merge Field** | Toast only (`:19`); no field list. | **Critical**. |
| **Rules** | Toast only (`:20`); no rule dialogs. | **High**. |
| **Match Fields** | Missing. | **High**. |
| **Update Labels** | Missing. | **Medium**. |
| **Preview Results** + navigation | Toast only (`:23`); no toggle, arrows, or record counter. | **Critical**. |
| **Find Recipient** | Toast only (`:24`). | **High**. |
| **Check for Errors** | Missing. | **Medium/High**. |
| **Finish & Merge** + menu | Toast only (`:27`); no output options. | **Critical**. |

### 5.2 Architecture gaps

| Area | Current state | Required work |
|---|---|---|
| Dialog framework | Only `Popover` (`ui.tsx:93-137`); no modal/dialog primitive. `FindReplace` and `Backstage` are bespoke. | Add a reusable `Dialog` with title, body, footer, tabs, form fields, preview pane, Escape/backdrop close, focus trap. |
| Reference data model | None. Editor JSON only stores paragraphs/headings/images/tables. | Add source registry, citations, footnote/endnote objects, captions, TOC/TOF/index/TOA blocks, cross-reference targets, merge state. |
| TipTap extensions | `extensions.ts:106-134` has no footnote, citation, caption, index-entry, TOA, TOC, or merge-field nodes. | Add inline atoms (footnote ref, citation, cross-ref, merge field) and block nodes (TOC, TOF, index, TOA) with attrs and schema validation. |
| Pagination / page numbers | Single `.page-wrap` with `minHeight` (`PageCanvas.tsx:49-93`); footer page number hardcoded `1` (`:89`). | Implement multi-page layout/measurement. TOC/TOF/index/TOA page numbers and cross-reference page numbers all depend on it. |
| DOCX export | `docx.ts:95-165` maps paragraphs/headings/lists/tables/images/page breaks only; TOC entries export as plain paragraphs; no footnotes, fields, SEQ, TOC, INDEX, TOA, or citations. | Extend docx generation with footnotes/endnotes, fields (`TOC`, `PAGEREF`, `SEQ`, `REF`, `INDEX`, `TOA`, `CITATION`, `BIBLIOGRAPHY`), or export static rendered text with correct page numbers as a fallback. |
| DOCX import | `mammoth.convertToHtml` (`docx.ts:238-245`) flattens fields/footnotes. | Use a richer importer or accept loss with a warning; map headings and captions at minimum. |
| Persistence | `localStorage` stores content and page only (`App.tsx:71,81-92`). | Persist sources/master list, footnote metadata, caption sequences, merge data connection/field map (never store workbook data without consent). |
| Fields/update engine | No field abstraction; `insertTOC` is a one-shot HTML insert. | Add field nodes with stable IDs, dirty flags, `F9`/update-all, field-code toggle, and unlink-to-static. |
| Shortcuts | Only `Ctrl+S/F/P/O/N` (`App.tsx:164-193`). | Add the reference and mail-merge shortcuts in §4 without breaking browser defaults (e.g., `Ctrl+Alt+F` may conflict with browser find on some platforms; intercept only when the editor is focused). |
| Duplicate entry points | `InsertTab.tsx:222` and `HomeTab.tsx:324` also call `insertTOC`, bypassing the References group. | Route all TOC insertion through one command/service with the same gallery/dialog; remove duplicate direct inserts or make them open the same UI. |
| Feedback model | `toast()` only (`App.tsx:100-104`), 2.6 s. | Replace toast-only stubs with real UI; use toasts only for success/error after a dialog completes. |
| Accessibility | Ribbon buttons have `title` but no `aria-expanded`/`aria-haspopup`; popovers are unfocusable divs. | Add ARIA menu/dialog semantics, keyboard navigation, and screen-reader labels. |

### 5.3 Critical correctness bugs to fix first

1. `ReferencesTab.tsx:21` — “Remove Table of Contents” selects the entire document and deletes it. This must target only the TOC block.
2. `ReferencesTab.tsx:20` — “Update Table…” inserts a new TOC at the cursor instead of updating the existing one.
3. Footnote/endnote/citation buttons insert literal text that will be exported to DOCX as ordinary text, so documents are semantically wrong.
4. `insertTOC` has no page numbers; once pagination exists, stale “page 4/6” behavior must match Word’s update model (video 00:03:14–00:03:47).
5. Mailings tab is entirely non-functional; every button is a toast. The first real milestone is a data-source model + recipient list, not the Finish button.

---

## 6. Frame timestamp capture table

### 6.1 References video — `uELfu0qaIJQ`

| hh:mm:ss | What UI to capture |
|---|---|
| 00:00:19 | References tab selected in the ribbon; all six groups visible at once |
| 00:00:43 | Cursor at top of document, Table of Contents group highlighted |
| 00:00:46 | **Table of Contents** gallery open: Automatic Table 1/2, Manual Table, Custom…, Remove |
| 00:01:06 | Home tab > Styles group; “Introduction” selected, Heading 2 being chosen |
| 00:01:41 | Heading assignment pattern across section titles |
| 00:02:19 | Insert tab > Cover page gallery |
| 00:02:38 | Insert tab > Blank page inserted after cover page |
| 00:02:45 | Caret on blank page, References tab, TOC group |
| 00:02:51 | Choosing **Automatic Table 2** in the TOC gallery |
| 00:02:59 | Generated TOC with heading entries and page numbers |
| 00:03:14 | TOC still showing old page number after content moves |
| 00:03:26 | **Update Table** button in the References group |
| 00:03:40 | **Update Table of Contents** dialog: page numbers only vs entire table |
| 00:03:47 | Updated TOC showing conclusion on page 6 |
| 00:03:51 | In-document TOC control/chip with **Update Table** |
| 00:03:57 | **Add Text** button highlighted in Table of Contents group |
| 00:04:05 | Non-heading paragraph selected in the body |
| 00:04:14 | Add Text dropdown open with level choices |
| 00:04:25 | TOC selected again, Update Table being clicked |
| 00:04:34 | Newly added paragraph as a TOC entry with page number |
| 00:05:01 | Footnotes group highlighted on the References tab |
| 00:05:07 | **Insert Footnote** clicked in the body |
| 00:05:15 | Footnote area with number 1 and flashing cursor |
| 00:05:25–00:08:09 | **Caption gap** — no subtitles; do not schedule a frame from this range without re-watching the video |
| 00:08:09 | **Style** control in Citations & Bibliography group (APA selected) |
| 00:08:17 | Style dropdown showing APA / Chicago / MLA choices |
| 00:08:19 | Switching style to Chicago; in-text citations re-render |
| 00:08:21 | Switching style to MLA |
| 00:08:27 | **Manage Sources** button clicked |
| 00:08:32 | **Source Manager** dialog: Master List / Current List |
| 00:08:47 | Source Manager editing/copying sources; preview pane |
| 00:08:52 | Legacy **Change Provider** control mentioned (may not exist in current Word) |
| 00:09:07 | Captions group highlighted |
| 00:09:17 | Insert > Pictures > This device picker |
| 00:09:32 | Picture selected; **Insert Caption** clicked |
| 00:09:35 | **Caption** dialog: text, label Figure, position Below selected item |
| 00:09:43 | Captioned picture with “Figure 1” below it |
| 00:09:56 | Shape/smiley selected; Insert Caption again |
| 00:10:03 | **Insert Table of Figures** clicked |
| 00:10:13 | **Table of Figures** dialog with default options and OK |
| 00:10:17 | Generated Table of Figures |
| 00:10:21 | Paragraph selected; Insert Caption for text |
| 00:10:33 | Paragraph with “Key paragraph” caption |
| 00:10:52 | Cross-reference entry point in Captions group |
| 00:10:56 | **Cross-reference** dialog: Reference type Heading, target list |
| 00:11:02 | Reference inserted and dialog closed |
| 00:11:14 | Index group highlighted |
| 00:11:30 | “New Wave” highlighted in body |
| 00:11:38 | **Mark Index Entry** dialog with Main entry pre-filled |
| 00:11:41 | **Mark All** clicked; dialog still open |
| 00:11:44 | XE field markup visible in the document |
| 00:11:57 | View mode switched to Read Mode; markup hidden |
| 00:12:23 | **Insert Index** clicked at end of document |
| 00:12:25 | **Index** dialog with type/columns/format options |
| 00:12:27 | Generated index showing “New Wave” and pages |
| 00:12:45 | “Synthesizers” selected and marked |
| 00:13:02 | Second index generated with both terms |
| 00:13:17 | Table of Authorities group highlighted |
| 00:13:48 | Legal citation selected; **Mark Citation** clicked |
| 00:13:51 | **Mark Citation** dialog: category, short/long citation |
| 00:13:56 | Mark + Close applied |
| 00:14:02 | **Insert Table of Authorities** clicked |
| 00:14:08 | **Table of Authorities** dialog options and OK |
| 00:14:10 | Final summary of References groups |

### 6.2 Mail Merge video — `mFqCvTOpOL0`

| hh:mm:ss | What UI to capture |
|---|---|
| 00:00:02 | Word form letter with “Dear Recipient Name” placeholders |
| 00:00:23 | Letter body showing recipient name/company/address to customize |
| 00:00:34 | Excel workbook with contact data and columns |
| 00:01:00 | Step 1: Excel data inspection; contact list |
| 00:01:31 | Header row with column headings |
| 00:01:44 | Split Street / City / State / ZIP columns |
| 00:02:34 | Word document restored; Mailings tab clicked |
| 00:02:42 | Mailings ribbon fully visible |
| 00:02:50 | **Start Mail Merge** group and button |
| 00:02:57 | **Select Recipients** clicked |
| 00:03:00 | Recipient menu: Type a New List / Use Existing List / Outlook |
| 00:03:21 | Choosing **Use an Existing List** |
| 00:03:33 | File picker showing the Excel workbook |
| 00:03:48 | Workbook opened; **Select Table** dialog |
| 00:04:03 | `Sheet1$` selected as the table |
| 00:04:11 | **First row of data contains column headers** checkbox |
| 00:04:24 | OK clicked; data connection established |
| 00:04:32 | Ribbon buttons change from greyed to enabled |
| 00:04:41 | **Edit Recipient List** now available and clicked |
| 00:04:47 | **Mail Merge Recipients** grid with all names |
| 00:04:58 | Unchecking “Lena” to exclude her |
| 00:05:12 | **Filter** dialog by State |
| 00:05:22 | **Sort** options for recipients |
| 00:05:29 | **Find duplicates** option highlighted |
| 00:05:32 | **Validate addresses** option highlighted |
| 00:05:41 | OK after re-checking Lena |
| 00:06:12 | Write & Insert Fields group highlighted |
| 00:06:17 | **Greeting Line…** clicked |
| 00:06:20 | **Insert Greeting Line** dialog with preview |
| 00:06:34 | Greeting name-format dropdown |
| 00:06:38 | Last-name-only format option |
| 00:06:43 | Punctuation choices after the name |
| 00:06:51 | Invalid recipient name fallback options |
| 00:07:08 | Greeting preview: “Dear Lena,” “Dear Ellis,” “Dear Douglas,” |
| 00:07:26 | **Match Fields** clicked |
| 00:07:35 | Match Fields dialog: document fields left, source columns right |
| 00:07:54 | First Name/Last Name automatically matched |
| 00:08:09 | Greeting Line field inserted; static text deleted |
| 00:08:31 | Top-of-letter recipient-name area selected |
| 00:08:40 | **Insert Merge Field** clicked (greyed out) |
| 00:08:53 | Field button disabled; click-away/triple-click workaround |
| 00:09:05 | Merge field list open |
| 00:09:14 | Insert First Name; 00:09:16 Last Name; 00:09:19 Close |
| 00:09:31 | Address block text selected |
| 00:09:48 | **Address Block…** clicked |
| 00:09:53 | Address Block preview for a record |
| 00:10:05 | Preview missing the street address |
| 00:10:15 | **Match Fields** reopened |
| 00:10:17 | Address 1 shown as “(not matched)” |
| 00:10:23 | Mapping Address 1 → Business Address |
| 00:10:35 | OK; corrected address preview |
| 00:10:51 | Address Block name/company display options |
| 00:11:04 | Old static address text deleted |
| 00:11:13 | Document ready for merge; preview next |
| 00:11:22 | Insert Merge Field list showing e-mail/phone fields |
| 00:11:33 | **Preview Results** clicked |
| 00:11:38 | Preview shows duplicated “Stephanie Ball” |
| 00:11:50 | Missing space fixed directly in preview |
| 00:11:59 | Next-record arrow shows the fix for the next recipient |
| 00:12:13 | Preview toggle turned off |
| 00:12:26 | Duplicate name traced to Address Block |
| 00:12:35 | Duplicated name deleted; all records update |
| 00:12:51 | **Check for Errors** menu opened |
| 00:12:54 | Three error-checking options visible |
| 00:13:00 | **Finish & Merge** menu opened |
| 00:13:03 | Three finish options: Edit Individual / Print / Send Email |
| 00:13:05 | **Edit Individual Documents** selected |
| 00:13:12 | Explanation of 62 separate documents |
| 00:13:19 | **Send Email Messages** selected; To field auto-detected |
| 00:13:29 | Subject line and mail-format settings |
| 00:13:39 | **Print Documents** selected |
| 00:13:44 | Preview footer showing “Page 1 of 1” |
| 00:13:53 | Merge printing 62 times |
| 00:14:01 | Printer dialog |
| 00:14:07 | File tab > Save a copy for reuse |
| 00:14:20 | Envelope mail-merge teaser |

---

## 7. Implementation notes for the clone

These are suggestions derived from the gap analysis; they do not change app source today.

1. **Build pagination first.** TOC/TOF/index/TOA page numbers, cross-reference page numbers, and header/footer page numbers all depend on knowing which page each block starts on. The current single-page canvas (`PageCanvas.tsx:49-93`) cannot support Word-accurate page numbers.
2. **Introduce a field abstraction.** Model `TOC`, `TC`, `PAGEREF`, `SEQ`, `REF`, `XE`, `INDEX`, `TA`, `TOA`, `CITATION`, `BIBLIOGRAPHY`, `ADDRESSBLOCK`, `GREETINGLINE`, `MERGEFIELD`, and rule fields as nodes/attrs with stable IDs. Render results from a resolver; keep the raw code for field-code toggle and update.
3. **Separate reference data from rendered text.** Sources, master list, caption counters, index entries, and merge state belong in document metadata or a side store, not in visible HTML strings.
4. **Use one command layer.** `insertTOC`, `updateTOC`, `removeTOC`, `insertFootnote`, `insertCitation`, `updateBibliography`, etc. should be commands that operate on the editor state and can be triggered by ribbon, context menu, and keyboard.
5. **Add a dialog system.** `Popover` is fine for menus, but the reference/merge features need modals with tabs and previews. Use the existing visual language in `word.css` (white surface, `#c8c6c4` border, 6 px radius, accent `--word-accent`).
6. **Persist safely.** For mail merge, store the data-source path/identifier and field map, not the entire workbook, unless the user explicitly imports/saves the list. Warn about external file changes.
7. **Make destructive actions safe.** Remove TOC/index/TOA/bibliography should target the field node only; “Convert to Static Text” should be explicit. Never use `selectAll()`.
8. **Match Word’s update semantics.** Page-number-only updates keep entry text; entire-table updates rebuild from headings/TC. Style changes re-render citations/bibliography but preserve source data. Preview edits apply to the main document.
9. **Round-trip DOCX.** At minimum, export static rendered results with correct page numbers; ideally export real fields and footnotes so Word can update them.
10. **Test with the video’s exact scenarios.** TOC page drift (4→6), Add Text Level 1 on an ordinary paragraph, footnote 1 + endnote i, style APA→Chicago→MLA, caption below picture + caption on a shape + caption on a paragraph, TOF for Figure, cross-reference to Heading, Mark All for “New Wave”/“Synthesizers”, TOA with a long citation, and a 62-row Excel merge with a corrected Address 1 mapping.

---

## 8. Sources

- Microsoft Support — Insert a table of contents: https://support.microsoft.com/en-us/office/insert-a-table-of-contents-882e8564-0edb-435e-84b5-1d8552ccf0c0
- Microsoft Support — Create a bibliography, citations, and references: https://support.microsoft.com/en-us/office/create-a-bibliography-citations-and-references-17686589-4824-4940-9c69-342c289fa2a5
- Microsoft Support — Mail merge using an Excel spreadsheet: https://support.microsoft.com/en-us/office/mail-merge-using-an-excel-spreadsheet-858c7d7f-5cc0-4ba1-9a7b-0a948fa3d7d3
- Microsoft Support — Keyboard shortcuts in Word: https://support.microsoft.com/en-us/office/keyboard-shortcuts-in-word-95ef89dd-7142-4b50-afb2-f762f663ceb2
- Video transcript — `research/videos/uELfu0qaIJQ.en.srt`
- Video transcript — `research/videos/mFqCvTOpOL0.en.srt`

Version note: exact menu labels, style lists, and dialog layouts vary by Word build (2016/2019/2021/365 and Mac). This spec targets the Windows Microsoft 365 layout shown in the videos and notes build-dependent items explicitly.
