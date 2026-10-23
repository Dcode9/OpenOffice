# 05 — Review, View & File: Research Spec

Status: research complete  
Scope: Microsoft Word **Review** tab, **View** tab, and **File** backstage (Word for Microsoft 365 / Word 2021+ on Windows), intended as the build spec for the Word clone in `C:\Users\Dhairya Shah\.t3\projects\openoffice`.  
Primary video sources:

- `research/videos/IvAHYchBIak.en-orig.srt` — Review tab walkthrough (20:31)
- `research/videos/s2EzLiIL5B4.en.srt` — View tab walkthrough (17:32)
- `research/videos/k2UfPX5caCo.en.srt` — File tab / backstage walkthrough (12:55)

Secondary source: Microsoft Support, *Keyboard shortcuts in Word* (Windows section), used for §4 only.

> **Transcript and timing caveat.** The Review video had no bundled English subtitle file; auto-generated `en-orig` captions were downloaded with `yt-dlp`. Caption timestamps drift by several seconds from the visible UI (the narration often describes a control that was clicked earlier). Timestamps in §6 identify the moment the UI is on screen closely enough to scrub; always confirm the exact control in the frame. Any behavior that is standard Word but not visibly demonstrated is marked **(not shown in video)**. Strings in quotation marks are the exact English UI labels seen in the recordings.

---

## 1. Exact ribbon and backstage anatomy

### 1.1 Review tab — groups and controls, left to right

The Review tab sits between **Mailings** and **View** in the tab strip. The recording shows **nine** groups. Group labels are at the bottom of the ribbon.

| # | Group | Control, left → right | Type | Opens / behavior |
|---|---|---|---|---|
| 1 | **Proofing** | **Editor** | Large button + dropdown caret | Opens the **Editor** pane. The caret exposes **Editor**, **Show Editor Score**, and proofing options. |
| 1 | | **Spelling and Grammar** | Large button + dropdown caret | Starts the Editor/Spelling pane at the next spelling issue. The caret exposes **Spelling** and **Grammar** entry points. |
| 1 | | **Thesaurus** | Large button | Opens the **Thesaurus** pane for the selected word (or the word at the caret). |
| 1 | | **Word Count** | Large button | Opens the **Word Count** dialog. |
| 2 | **Speech** | **Read Aloud** | Large button | Starts Read Aloud from the selection or the current position; a floating playback bar appears. |
| 3 | **Accessibility** | **Check Accessibility** | Large button + dropdown caret | Runs the accessibility checker and opens the **Accessibility** pane. Caret exposes **Check Accessibility** and **Accessibility Checker** settings. |
| 4 | **Language** | **Translate** | Large button | Opens the **Translator** pane. |
| 4 | | **Language** | Large button | Opens the **Language** dialog (proofing language). |
| 5 | **Comments** | **New Comment** | Large button | Creates a comment on the selection / at the caret and opens the comment card. |
| 5 | | **Delete** | Small button + dropdown caret | **Delete**, **Delete All Comments in Document**, **Delete All Comments Shown**. |
| 5 | | **Previous** | Small button | Jumps to the previous comment. Disabled when there are no comments. |
| 5 | | **Next** | Small button | Jumps to the next comment. Disabled when there are no comments. |
| 5 | | **Show Comments** | Small toggle button | Shows/hides the **Comments** pane (balloons remain controlled by **Show Markup**). |
| 6 | **Tracking** | **Track Changes** | Large toggle button | Turns change tracking on/off. Button is pressed/highlighted when on. |
| 6 | | **Simple Markup** | Dropdown/combo (label reflects current mode) | Markup display mode: **Simple Markup**, **All Markup**, **No Markup**, **Original**. |
| 6 | | **Show Markup** | Large button + dropdown caret | Opens the **Show Markup** checklist (see §2.1.7). |
| 6 | | **Reviewing Pane** | Large button + dropdown caret | Opens the reviewing pane; caret chooses **Reviewing Pane Vertical** / **Reviewing Pane Horizontal**. |
| 7 | **Changes** | **Accept** | Large button + dropdown caret | **Accept and Move to Next**, **Accept This Change**, **Accept All Changes Shown**, **Accept All Changes**, **Accept All Changes and Stop Tracking**. |
| 7 | | **Reject** | Large button + dropdown caret | **Reject and Move to Next**, **Reject This Change**, **Reject All Changes Shown**, **Reject All Changes**. |
| 7 | | **Previous** | Small button | Previous tracked change. |
| 7 | | **Next** | Small button | Next tracked change. |
| 8 | **Compare** | **Compare** | Large button + dropdown caret | **Compare…**, **Combine…**, **Compare Documents…**; the recording also shows a submenu labeled **Major Version**, **Last Version**, **Specific Version…** above the compare commands. **Show Source Documents** is present but disabled until a comparison is open. |
| 9 | **Protect** | **Block Authors** | Large button | Opens the **Block Authors** pane (block/unblock specific authors). |
| 9 | | **Restrict Editing** | Large button | Opens the **Restrict Editing** pane on the right. |
| 10 | **Ink** | **Hide Ink** | Large button + dropdown caret | Toggles ink display; caret exposes **Hide Ink** and **Delete All Ink in Document**. |

Notes on layout:

- **Proofing** is the widest group: four large buttons in a row. The recording shows `Editor`, `Spelling and Grammar`, `Thesaurus`, `Word Count` all as large icon-over-label buttons.
- **Comments** is one large button (`New Comment`) plus a narrow column of small buttons (`Delete` with caret, `Previous`, `Next`, `Show Comments`).
- **Tracking** has two large buttons (`Track Changes`, `Show Markup`), the markup-mode dropdown wedged beside/below `Track Changes`, and `Reviewing Pane` as a large button with caret.
- **Changes** has two large buttons (`Accept`, `Reject`), each with a caret, plus two small navigation buttons.
- **Ink** is conditional: it appears only when the document contains ink or a pen/touch device is present. In the recording the group is present and `Hide Ink` is checked.
- Newer/older 365 builds differ slightly: some show `Editor` only (no separate Spelling button), some show `Check Accessibility` without a caret, and some omit **Block Authors**. Treat those as build variants; the recording is the target.

### 1.2 View tab — groups and controls, left to right

The View tab sits between **Review** and **Developer/Help**. The recording shows **eight** groups (the last is conditional).

| # | Group | Control, left → right | Type | Opens / behavior |
|---|---|---|---|---|
| 1 | **Views** | **Read Mode** | Large toggle | Switches to Read Mode. |
| 1 | | **Print Layout** | Large toggle | Switches to Print Layout (default). |
| 1 | | **Web Layout** | Large toggle | Switches to Web Layout. |
| 1 | | **Outline** | Small/stacked button | Switches to Outline view. |
| 1 | | **Draft** | Small/stacked button | Switches to Draft view. |
| 2 | **Immersive** | **Focus** | Large button | Enters Focus mode (dims everything except the current paragraph/line). |
| 2 | | **Immersive Reader** | Large button | Enters Immersive Reader and shows the contextual **Immersive Reader** tab. |
| 3 | **Page Movement** | **Vertical** | Toggle | Normal vertical page scrolling. |
| 3 | | **Side to Side** | Toggle | Horizontal page flipping; the horizontal scrollbar turns pages. |
| 4 | **Show** | **Ruler** | Toggle | Shows/hides horizontal and vertical rulers (Print Layout only). |
| 4 | | **Gridlines** | Toggle | Shows/hides the page grid. |
| 4 | | **Navigation Pane** | Toggle | Shows/hides the Navigation pane on the left. |
| 5 | **Zoom** | **Zoom** | Large button + dropdown caret | Opens the **Zoom** dialog. Caret exposes presets and the dialog. |
| 5 | | **100%** | Small button | Sets zoom to 100%. |
| 5 | | **One Page** | Small button | Fits one whole page in the window. |
| 5 | | **Multiple Pages** | Small button | Fits two or more pages across. |
| 5 | | **Page Width** | Small button | Fits the page width to the window. |
| 6 | **Window** | **New Window** | Large button | Opens another window onto the same document. |
| 6 | | **Arrange All** | Large button | Tiles all open Word windows. |
| 6 | | **Split** | Large button | Splits the current window into two independently scrollable panes. |
| 6 | | **View Side by Side** | Large toggle | Places two document windows side by side; enabled only with two windows. |
| 6 | | **Synchronous Scrolling** | Small toggle | Links scrolling of the two side-by-side windows; enabled only in side-by-side. |
| 6 | | **Reset Window Position** | Small button | Restores the two windows to equal side-by-side sizes. |
| 6 | | **Switch Windows** | Small button + dropdown | Lists open document windows and switches to the chosen one. |
| 7 | **Macros** | **Macros** | Large button + dropdown | Top half lists available macros; bottom half opens the **Macros** dialog. Disabled/greyed when no macros exist. |
| 8 | **SharePoint** (conditional) | **Properties** | Large button | Opens the SharePoint document properties panel; visible only for a document saved to SharePoint/OneDrive for Business. |

Layout notes:

- **Views** shows three large buttons in a row followed by **Outline** and **Draft** as a stacked pair of smaller buttons. The stacked pair is visually separated from the three primary views, matching Word's “the other two views” treatment.
- **Zoom** is a large button on the left and a vertical stack of four small wide buttons on the right (`100%`, `One Page`, `Multiple Pages`, `Page Width`). The recording's stack shows these in that order.
- **Window** is the widest group: three large buttons (`New Window`, `Arrange All`, `Split`), then a vertical stack of the side-by-side controls, then `Switch Windows`.
- When only one document window exists, `View Side by Side`, `Synchronous Scrolling`, and `Reset Window Position` are disabled. After `New Window` is used, `View Side by Side` becomes enabled; `Synchronous Scrolling` becomes enabled only after side-by-side is active.

### 1.3 File backstage — navigation and pages

Clicking **File** replaces the ribbon and document with a full-window backstage. A back arrow sits at the top left. The left navigation column in the recording, top to bottom:

```
← Back
Home
New
Open
────────
Get Add-ins
Info
Save
Save As
Save as Adobe PDF      (add-in; not stock Word)
Print
Share
Export
Transform              (Microsoft 365; may be absent in other builds)
Close
────────
Account
Options
```

- `Home`, `New`, `Open` are the first group; a divider follows.
- `Info`, `Save`, `Save As`, `Print`, `Share`, `Export`, `Close` are stock.
- `Get Add-ins`, `Save as Adobe PDF`, and `Transform` are conditional (add-in / subscription / build).
- `Account` and `Options` are pinned near the bottom, separated from the document commands.
- Selecting an item does not close the backstage; it swaps the right-hand page. `Back` (or `Esc`) returns to the document.

#### Home page

- Greeting line: “Good evening” / “Good afternoon” / “Good morning” based on local time (recording shows **“Good evening”**).
- **New** section: a row of template thumbnails. First card is **Blank document**; the rest are recently used templates (banner, calendar, brochure, agenda in the recording), each with a name and a “Suggested searches” style subtitle. A **More templates** link/arrow sits at the right.
- Search field: “Search for online templates”.
- **Recent / Pinned / Shared with Me** tabs.
- File list with columns **Name** and **Date modified**; each row has a pin icon on hover. Pinned files appear under the **Pinned** tab; files shared by others appear under **Shared with Me**.
- A selected recent file opens on click; the pin toggles pinned state without opening.

#### New page

- Heading **New**.
- Large **Blank document** card.
- Gallery of template thumbnails (same set as Home, often more).
- Search field: “Search for online templates”.
- Suggested-search chips (e.g. “Business”, “Calendar”, “Flyer”, “Letter”, “Resume”).
- Clicking a template selects it and enables **Create**; clicking **Blank document** / **Create** opens a new untitled document.

#### Open page

- Heading **Open**.
- Sources: **Recent**, **Shared with Me**, **OneDrive**, **This PC**, **Add a Place**, **Browse**.
- Two tabs above the list: **Documents** and **Folders**.
- Recent list grouped by **Pinned**, **Today**, **Yesterday**, **Older** (relative date groups); columns **Name**, **Date modified**.
- Pin icons on rows; right-click / “…” menu offers Open, Open Read-Only, Pin, Remove from list.
- Bottom link: **Recover Unsaved Documents** (opens the UnsavedFiles folder).
- **Browse** opens the standard Windows file picker.

#### Info page

- Document name as the page title (recording: **“Superiority of Synthop”**).
- Action row: **Upload** (to OneDrive), **Share**, **Copy path**, **Copy local path**, **Open file location**.
- **Protect Document** section with a dropdown: **Mark as Final**, **Encrypt with Password**, **Restrict Editing**, **Restrict Access** (Information Rights Management; build-dependent).
- **Inspect Document** section: **Check for Issues** dropdown → **Inspect Document**, **Check Accessibility**, **Check Compatibility**.
- **Version History** section: button to turn on / open version history. Enabling it uploads the file to cloud storage; the recording warns about this.
- **Manage Document** section: **Recover Unsaved Documents**, **Delete All Unsaved Documents**.
- **Properties** panel on the right:
  - **Size** (recording: `15.7KB`)
  - **Pages** (`2`)
  - **Words** (`634`)
  - **Total Editing Time** (`7 Minutes`)
  - **Title**, **Tags**, **Comments** (placeholder “Add a title”, “Add a tag”, “Add comments”)
  - **Related Dates**: Last Modified, Created, Last Printed
  - **Related People**: Author, Last Modified By
  - **Related Documents**: file location / template / basis
  - Link: **Show All Properties**
- **Advanced Properties** dialog (from Show All Properties → Advanced Properties): tabs **General**, **Summary**, **Statistics**, **Contents**, **Custom**; includes Title, Subject, Author, Manager, Company, Category, Keywords, Comments, Hyperlink base, Template; statistics show Created/Modified/Printed, revision number, total editing time, pages/words/characters/paragraphs/lines; Custom tab has Name/Type/Value and Add/Delete.

#### Print page

- Large **Print** button at top left; **Copies** spinner.
- **Printer** dropdown (recording: `Adobe PDF`), **Printer Properties** link.
- **Settings** dropdown: **Print All Pages** (alternatives: Print Selection, Print Current Page, Custom Range, Print Odd/Even Pages).
- **Pages** text field (e.g. `1-2`), with “Print One Sided”, “Collated”, “Portrait Orientation”, “Letter (8.5 × 11 in)”, “Normal Margins”, “1 Page Per Sheet” as the default summary line.
- **Page Setup** link at the bottom of Settings.
- Preview pane on the right with page image, page navigation (“1 of 2”), and a zoom control (recording: `64%` with slider and fit-page button).
- The recording has no physical printer attached, so Print is attempted but cannot complete; the preview/settings still render.

#### Share page

- Heading **Share**; subheading “Share with People”.
- **Share with People** section with **Step 1** / **Step 2** explanatory text (save to cloud, then invite).
- **Save to Cloud** button (OneDrive).
- **Email** section: **Send as Attachment**, **Send a Link**, **Send as PDF**, **Send as XPS**.
- **Create PDF and share link**.
- **Present Online** (creates a link for a browser-based presentation; recording shows the option).
- **Get a sharing link** options: View/Edit link, expiration, password (build-dependent).

#### Export page

- **Create Adobe PDF** (visible because the Adobe add-in is installed; not stock).
- **Create PDF/XPS Document** → **Create PDF/XPS** button → Save As dialog with “PDF (*.pdf)” / “XPS (*.xps)”, **Options…** (page range, publish what, non-printing information, PDF options: ISO 19005-1, bitmap text, bookmarks, document properties, accessibility tags).
- **Change File Type** gallery with two columns:
  - **Document**: Word Document (*.docx), Word 97-2003 Document (*.doc), OpenDocument Text (*.odt), Template (*.dotx), Plain Text (*.txt), Rich Text Format (*.rtf), Single File Web Page (*.mht).
  - **Save as Another File Type** → **Save As** button.
- **Send documents to Kindle** (Amazon Send-to-Kindle; build-dependent).

#### Account page

- **User Information**: avatar/photo, name, email, “Change photo”, “Sign out”.
- **Account Privacy**: **Manage privacy settings** link.
- **Office Background**: dropdown/gallery (recording: `Circuit`).
- **Office Theme**: dropdown/gallery (recording: `Colorful`; alternatives White, Dark Gray, Black).
- **Connected Services**: OneDrive, SharePoint, etc. with Add/Remove.
- **Product Information**: Microsoft 365 subscription product name, **Manage Account**, **Switch License**, **Update License**, **About Word**.
- **Office Updates**: update channel, **Update Now**, **View updates**.
- **About Word** dialog: version/build, “Microsoft 365 Apps for enterprise”, copyright, “What’s New”.

#### Options dialog (Word Options)

Left navigation, top to bottom:

```
General
Display
Proofing
Save
Language
Accessibility
Advanced
Customize Ribbon
Quick Access Toolbar
Add-ins
Trust Center
```

- **General** sections in the recording: **User Interface options** (Show Mini Toolbar on selection, Show Quick Analysis options on selection, Enable Live Preview, Update document while typing), **Personalize your copy of Microsoft Office** (User name, Initials, Always use these values regardless of sign in), **Privacy Settings** (privacy controls / “Privacy Settings…”), **Start up options** (Open e-mail attachments and other uneditable files in Reading View, Show the Start screen when this application starts), **OK / Cancel**.
- **Display**: page display options, “Show white space between pages in Print Layout view”, “Show highlighter marks”, “Show document tooltips on hover”, “Show picture placeholders”, “Show drawings and text boxes on screen”, “Print drawings created in Word”, “Print background colors and images”, “Print document properties”, “Show all formatting marks”.
- **Proofing**: AutoCorrect options, “Check spelling as you type”, “Mark grammar errors as you type”, “Frequently confused words”, “Check grammar with spelling”, “Show readability statistics”, “Writing Style”, **Settings…**, **Recheck Document**.
- **Save**: save formats, AutoRecover time, “Keep the last autosaved version if I close without saving”, default local/cloud save, embedding fonts, privacy options.
- **Language**: Office authoring languages, proofing languages, display/help languages, “Set the Office Language Preferences”.
- **Accessibility**: feedback options, “Make sounds”, “Show accessibility notifications”, “Accessibility Checker” settings.
- **Advanced**: editing, cut/copy/paste, show document content, display, print, save, compatibility, layout.
- **Customize Ribbon / Quick Access Toolbar / Add-ins / Trust Center**: standard Word options; not explored in detail in the recording.

#### Close

- Selecting **Close** closes the document and returns to the backstage Home/Start screen (or another open document). If there are unsaved changes, Word prompts **Save / Don’t Save / Cancel** before closing.
- Closing the last document may leave the app on the Start screen rather than exiting.

#### Get Add-ins / Transform

- **Get Add-ins** opens the Office Add-ins store dialog with tabs **Store** and **My Add-ins**, a search field, categories, and **Add** buttons. The recording installs an Adobe PDF add-in, after which `Save as Adobe PDF` appears in the backstage nav.
- **Transform** (Microsoft 365) presents options to transform the document into a web page / interactive page and requires cloud storage; the recording only shows the entry and a brief explanatory panel.

---

## 2. Detailed dropdowns, dialogs, and panes

### 2.1 Review

#### 2.1.1 Word Count dialog

Opened by **Review → Word Count** (or the status-bar word count).

| Field | Contents |
|---|---|
| Title | **Word Count** |
| Statistics | **Pages**, **Words**, **Characters (no spaces)**, **Characters (with spaces)**, **Paragraphs**, **Lines** |
| Checkbox | **Include textboxes, footnotes and endnotes** (unchecked by default in the recording) |
| Buttons | **Close** (no OK; values update live when the checkbox is toggled) |

The status bar shows `634 words` in the Info example; the Word Count dialog is the authoritative source and includes or excludes textboxes/notes per the checkbox.

#### 2.1.2 Editor pane

Opened by **Editor**. The pane is a right-side task pane.

- Header: **Editor** with a close `×`.
- **Editor Score**: large percentage (recording shows a score in the 90s), a horizontal segmented bar, and a dropdown showing the writing style (**Formal writing**). The score segments are colored (green/amber/red) by issue density.
- **Corrections** section:
  - **Spelling** row with issue count, e.g. “0 issues”.
  - **Grammar** row with issue count.
  - Clicking a row expands the list of issues.
- **Refinements** section: rows such as **Conciseness**, **Clarity**, **Inclusive language**, **Punctuation**, **Vocabulary**, each with issue counts.
- Each issue card shows the flagged text, a one-line explanation, and actions:
  - **Ignore Once**, **Ignore All**, **Add to Dictionary** (spelling)
  - suggested replacement(s) with **Change** / **Change All**
  - **Don’t check for this issue** / settings link
- Footer/gear: **Settings** for Editor (which categories run), **Feedback**.
- Clicking an issue moves the document selection to the flagged range; the document shows a red/blue wavy underline as appropriate.
- The pane remains open while editing and refreshes the score.

#### 2.1.3 Spelling and Grammar

- In modern Word this routes into the **Editor** pane with the Spelling or Grammar category expanded. The recording uses the classic “Spelling and Grammar” button, which opens the pane at the first issue.
- Classic dialog variant (Word 2016/2019): **Spelling** / **Grammar** title, “Not in Dictionary” / “Consider”, suggestion list, **Ignore Once**, **Ignore All**, **Add to Dictionary**, **Change**, **Change All**, **AutoCorrect**, **Options…**, **Undo**, **Cancel**.
- Grammar issues show a green underline; spelling issues a red underline.

#### 2.1.4 Thesaurus pane

- Opens on the right with the selected word in a search box.
- Results grouped by part of speech (noun, verb, adjective) with synonym lists; clicking a synonym replaces the selection or inserts it.
- **Back** / **Search** controls; “No matches found” state for unknown words.

#### 2.1.5 Accessibility pane (Check Accessibility)

- Pane title **Accessibility**.
- **Inspection Results** heading.
- **Errors** group, e.g. **Missing Object Description** with a count.
- Each issue row expands to show:
  - the object/text location,
  - **Recommended Actions** (e.g. “Add a description”, “Mark as decorative”),
  - **Additional Information** / “Why fix this?”.
- **Warnings** and **Tips** groups below Errors (e.g. “Use accessible text formats”, “Check reading order”).
- Checkbox at the bottom: **Keep accessibility checker running while I work**.
- **Recheck Document** link/button.
- Clicking an issue selects the object in the document; the pane updates as issues are fixed.

#### 2.1.6 Language dialog

Opened by **Review → Language → Language** (or status-bar language).

| Control | Contents |
|---|---|
| Title | **Language** |
| Section | **Change proofing language for:** |
| Radio | **Selected text** / **Current Document** (recording uses one of these depending on selection) |
| List | “Mark selected text as” list of languages; recording selects **English (India)** |
| Checkbox | **Do not check spelling or grammar** |
| Checkbox | **Detect language automatically** |
| Buttons | **Set As Default…**, **OK**, **Cancel** |

- The language list is long and scrollable, with language names in their native script where available.
- **Set As Default** changes the default for new documents, not just this one.
- Applying to **Current Document** changes all text; applying to **Selected text** changes only the selection.
- The status bar language label updates after OK.

#### 2.1.7 Show Markup menu

The **Show Markup** dropdown is a checklist. Items in the recording:

| Item | State / submenu | Meaning |
|---|---|---|
| **Insertions and Deletions** | checked | Show tracked inserts/deletes. |
| **Formatting** | unchecked/checked | Show formatting-change markup. |
| **Balloons** | submenu | **Show Revisions in Balloons**, **Show Only Comments and Formatting in Balloons**, **Show All Revisions Inline**. |
| **Specific People** | submenu | Checklist of authors (e.g. “Charles Richardson”, “All Reviewers”). Unchecking hides that author’s markup. |
| **Highlight Updates** | checked | Tints updated regions while the document is being reviewed. |
| **Other Authors** | submenu | Additional author filtering when more than one reviewer exists. |

- Checking/unchecking affects **display only**; it does not accept, reject, or delete revisions.
- The menu closes on click; the ribbon does not keep a pressed state for individual items.
- If **No Markup** or **Original** is selected, the Show Markup filters still apply when returning to Simple/All Markup.

#### 2.1.8 Markup mode dropdown

The label next to **Track Changes** reflects the current mode:

| Mode | Visual result |
|---|---|
| **Simple Markup** | Clean text with a red vertical bar in the margin at changed lines; clicking the bar switches to All Markup. |
| **All Markup** | Inline insertions/deletions plus comment and formatting balloons in the right margin. |
| **No Markup** | Final-looking text; revisions are hidden but still stored. |
| **Original** | Original text as it was before revisions; revisions are hidden. |

The recording selects **Simple Markup**, demonstrates the red margin bar, then switches to **All Markup** to show balloons, then back.

#### 2.1.9 Comments

**Creating:**

1. Select text (or place the caret).
2. **Review → New Comment** (or `Ctrl+Alt+M`).
3. A comment card opens in the right margin; the selected range gets a pale highlight and a bracket/anchor.
4. Type in the card; the author name/avatar and timestamp appear.
5. **Post** (or `Ctrl+Enter`) commits the comment. `Esc` or **X** discards the draft. The recording explicitly notes `Ctrl+Enter` posts.

**Comment card anatomy (recording):**

- Author name **“Charles Richardson”** and avatar/initials.
- Timestamp (relative or absolute).
- Comment body text.
- **Reply** box / “Reply…” link.
- **Resolve** / **Reopen** (thread state).
- “…” menu: **Edit**, **Delete**, **Delete Thread**, **Resolve**, **Copy Link** (build-dependent).
- **Post** button and **X** (cancel) while drafting.

**Comment navigation and display:**

- `Previous` / `Next` move between comment threads, selecting the anchor and opening the card.
- **Show Comments** toggles the Comments pane. With it off, comment balloons may still show depending on **Show Markup → Balloons**.
- **Delete** dropdown:
  - **Delete** — current comment/thread.
  - **Delete All Comments in Document**.
  - **Delete All Comments Shown** — only comments currently visible after author filtering.
- Comment anchors are red/pink in the margin; hovering the anchor or highlight shows a preview; clicking selects the commented range.
- Resolved comments collapse to a small resolved marker (build-dependent) and can be filtered.

#### 2.1.10 Track Changes

- Toggle: **Review → Track Changes** or `Ctrl+Shift+E`.
- Button is highlighted/pressed while on; the status bar shows **“Track Changes: On”**.
- New edits after enabling are recorded as revisions; existing text is untouched.
- Recorded operations include insertions, deletions, formatting changes, and (in tables) row/column changes. Moving text may be recorded as delete+insert.
- The recording demonstrates typing with tracking on, then shows the markup, then accepts changes.
- **Track Changes Options** (from the dropdown / “Change Tracking Options” dialog; not fully shown):
  - **Insertions** color and markup (underline, double underline, etc.)
  - **Deletions** color and markup (strikethrough, hidden, caret, etc.)
  - **Changed lines** color and position
  - **Comments** color
  - **Track moves** / **Track formatting**
  - **Balloons** margin width and “Show lines connecting to text”
  - **Paper orientation** for balloons
  - **User name** / **Initials** for new revisions.

#### 2.1.11 Reviewing Pane

- Opened via **Reviewing Pane** (vertical) or its dropdown (horizontal).
- In the recording it is docked at the **left**, titled **Reviewing Pane**, with a summary line **“Revisions / 5 revisions”**.
- Each revision row shows:
  - type icon/word (Inserted, Deleted, Formatted, Comment),
  - author,
  - timestamp,
  - the changed text (often truncated).
- Clicking a row selects and scrolls to that revision.
- The pane updates counts as changes are accepted/rejected.
- Close via the pane’s `×`, the ribbon toggle, or `Alt+Shift+C`.
- Horizontal orientation docks at the bottom and is useful for wide documents.

#### 2.1.12 Accept / Reject menus

**Accept** dropdown:

1. **Accept and Move to Next** — accepts current revision, advances to next.
2. **Accept This Change** — accepts current only, stays/advances minimally.
3. **Accept All Changes Shown** — accepts only revisions visible under current Show Markup filters.
4. **Accept All Changes** — accepts everything in the document.
5. **Accept All Changes and Stop Tracking** — accepts everything and turns Track Changes off.

**Reject** dropdown:

1. **Reject and Move to Next**.
2. **Reject This Change**.
3. **Reject All Changes Shown**.
4. **Reject All Changes**.

Tooltips in the recording: the large Accept button reads **“Accept and Move to Next”**; the split caret exposes the rest. The previous/next small buttons move between revisions without accepting.

Behavior specifics:

- Accepting an insertion makes the new text permanent; accepting a deletion removes the struck text.
- Rejecting an insertion removes it; rejecting a deletion restores the original text.
- Accepting/rejecting a formatting change applies/reverts the formatting.
- Rejecting a comment deletes the comment (comments are not “rejected” as text changes).
- If no revision is selected, Accept/Reject act on the nearest revision at/after the caret.
- After the last revision, Word reports “No more revisions” / the buttons disable.

#### 2.1.13 Compare / Combine

**Compare dropdown:**

- **Compare…** / **Compare Documents…** opens the **Compare Documents** dialog.
- **Combine…** opens **Combine Documents**.
- **Major Version**, **Last Version**, **Specific Version…** appear as version-selection entries when the document has version history.
- **Show Source Documents** submenu: **Show Original**, **Show Revised**, **Show Both**; disabled until a comparison document is open.

**Compare Documents dialog:**

| Control | Contents |
|---|---|
| Title | **Compare Documents** |
| Original document | dropdown of open documents + **Browse…** (folder icon) |
| Revised document | dropdown + **Browse…** |
| Label changes with | author name text field (defaults to current user) |
| **More >>** | expands comparison settings |
| Comparison settings | **Ignore formatting**, **Ignore case changes**, **Ignore whitespace**, **Ignore tables**, **Ignore headers and footers**, **Ignore footnotes and endnotes**, **Ignore textboxes**, **Ignore comments** (checkboxes) |
| Show changes in | **New document** (default), **Original document**, **Revised document** |
| Buttons | **OK**, **Cancel** |

- Result opens a third document named “Compare Result” (or the chosen target) with revisions attributed to the “Label changes with” author; the Review tab shows the comparison markup, Reviewing Pane, and **Show Source Documents** enabled.
- **Combine Documents** has the same layout but merges revisions from two documents into one, useful when both copies were edited.

#### 2.1.14 Restrict Editing

Pane title **Restrict Editing**, docked right.

**1. Formatting restrictions**

- Checkbox: **Limit formatting to a selection of styles**.
- **Settings…** link opens **Formatting Restrictions** dialog:
  - Checkbox: **Limit formatting to a selection of styles**.
  - List: **Checked styles are currently allowed** with checkboxes for each style.
  - Buttons: **All**, **Recommended Minimum**, **None**.
  - Checkboxes: **Block Theme or Scheme switching**, **Block Quick Style Set switching**.
  - **OK**, **Cancel**.
- When enabled, formatting commands not in the allowed set are disabled/greyed.

**2. Start enforcement**

- Checkbox/option: **Editing restrictions**.
- Dropdown:
  - **No changes (Read only)**
  - **Tracked changes**
  - **Comments**
  - **Filling in forms**
- Checkbox: **Allow only this type of editing in the document** (label varies by build).

**3. Exceptions (optional)**

- Text: “Exceptions (optional)”.
- **Groups:** list of users/groups (e.g. “Everyone”) with checkboxes; add users via **Add Users** / “More users”.
- **Find next region I can edit** / **Show all regions I can edit** links.
- Highlighted exception regions appear in the document.

**4. Enforce**

- Button: **Yes, Start Enforcing Protection**.
- Opens **Start Enforcing Protection** dialog:
  - **Password** (optional), **Re-enter password**.
  - Radio: **User authentication** (if IRM available) / **Password**.
  - **OK**, **Cancel**.
- After enforcement, the pane shows **Stop Protection** (password required) and the document is restricted per the chosen type.
- The recording selects **No changes (Read only)**, marks an exception, and starts enforcement.

#### 2.1.15 Block Authors

- Opens the **Block Authors** pane (or dropdown) listing authors who have contributed to the document.
- Each author has a **Block** / **Unblock** action; blocked authors’ revisions cannot be accepted and their content is protected from editing (build-dependent).
- “Block all authors” / “Unblock all” may be present.
- **(not shown in video)** — the recording shows the button but does not open the pane.

#### 2.1.16 Hide Ink

- **Hide Ink** toggle (checked by default when ink exists) hides all ink drawings without deleting them.
- Dropdown:
  - **Hide Ink** (toggle)
  - **Delete All Ink in Document** (confirmation required; destructive).
- When ink is hidden, the Ink group may still remain until the document is reopened.

#### 2.1.17 Read Aloud (Speech group)

- Starts playback at the selection/caret in a natural voice.
- Floating playback bar: **Play/Pause**, **Previous/Next paragraph**, **Voice Selection** (language/voice), **Speed** slider, **Settings** (highlight spoken text, etc.), **Close**.
- Word highlights the sentence/word being spoken; reading continues through the document.
- The recording demonstrates Read Aloud only briefly from the Review tab; the Immersive Reader has its own Read Aloud control.

### 2.2 View

#### 2.2.1 Read Mode

- The ribbon and status bar are replaced by a minimal reading chrome.
- Top bar: **File** at the left; **Tools** and **View** menus at the right (recording shows **File**, **Tools**, **View**).
- Body: a book-like two-page spread on a neutral background; text is reflowed into columns/pages, not the Print Layout page.
- Left/right page arrows at the screen edges; clicking turns pages.
- Page indicator at the bottom/center, e.g. **“2-3 of 4”** (a spread showing pages 2 and 3 of 4).
- `Esc` exits Read Mode and returns to the previous view (Print Layout in the recording).
- **View** menu in Read Mode: **Read Mode**, **Print Layout**, **Web Layout**, **Layout** (column width), **Zoom**, **Navigation Pane**, **Immersive Reader** (build-dependent).
- **Tools** menu: **Find**, **Comments**, **Read Aloud**, **Translate**, **Word Count** (build-dependent).
- No editing caret by default; clicking text may allow selection/copy.

#### 2.2.2 Immersive Reader

Entering Immersive Reader replaces the ribbon with a contextual **Immersive Reader** tab and a full-window reading surface.

Tab groups/controls, left → right:

| Control | Type | Menu / behavior |
|---|---|---|
| **Column Width** | Button + dropdown | **Very Narrow**, **Narrow**, **Moderate**, **Wide**. Changes line length; recording demonstrates Narrow/Moderate/Wide. |
| **Page Color** | Button + dropdown | **None**, **Sepia**, **Inverse**, and a color grid (cream, peach, yellow, blue, green, etc.). View-only, does not print. |
| **Line Focus** | Button + dropdown | **None**, **One Line**, **Three Lines**, **Five Lines**. Dims all but the chosen number of lines; up/down arrows move the focus window. |
| **Text Spacing** | Button + dropdown | Spacing presets (e.g. **Narrow**, **Medium**, **Wide**), plus **Increase/Decrease** text size. |
| **Syllables** | Toggle | Inserts syllable dots/breaks in words to aid pronunciation. |
| **Read Aloud** | Button | Starts Immersive Reader Read Aloud with its own playback bar. |
| **Close** | Button | Exits Immersive Reader and returns to the document’s previous view. |

- Immersive Reader settings affect only the reading experience; they do not change the document or print output.
- The recording explicitly demonstrates **Syllables** (dots between syllables), **Line Focus** (one/three/five lines), **Page Color**, and **Column Width**.
- Read Aloud in Immersive Reader uses a natural voice and can read the selection or the whole document.

#### 2.2.3 Focus mode

- **View → Focus** (or **Focus** in the Immersive group) dims the ribbon, status bar, and all text except the current paragraph/line.
- The current paragraph stays at full contrast; surrounding lines fade.
- `Esc` exits Focus and returns to the previous view.
- Focus is a display mode only; it does not change the document.

#### 2.2.4 Outline view

- **View → Outline** (or `Ctrl+Alt+O`).
- The document becomes a hierarchical outline:
  - Heading levels are indented and labeled with level numbers (`1`, `2`, `3`…).
  - Body text appears as unnumbered paragraphs under headings (often greyed).
  - Collapse/expand markers (`+`/`−`) appear beside headings.
- The **Outlining** contextual tab appears with:
  - **Promote** / **Demote** (and **Promote to Heading 1**),
  - **Move Up** / **Move Down**,
  - **Expand** / **Collapse**,
  - **Show Level** dropdown (Level 1…Level 9, All Levels),
  - **Show Text Formatting** toggle,
  - **Show First Line Only** toggle,
  - **Master Document** group,
  - **Close Outline View** (returns to Print Layout).
- The recording notes Outline view is best for documents built with heading styles; with a single heading the outline is sparse.
- Editing in Outline view edits the document directly; promoting/demoting changes the paragraph’s heading level.

#### 2.2.5 Draft view

- **View → Draft** (or `Ctrl+Alt+N`).
- Shows only the text content: no page margins, no page background, no headers/footers, no images/floating objects (they are not visible).
- Page breaks appear as dotted/dashed horizontal lines.
- Text wraps to the full window width; the ribbon remains.
- Useful for fast text editing; the recording switches back to Print Layout afterward.
- `Ctrl+Alt+P` returns to Print Layout.

#### 2.2.6 Page Movement

- **Vertical** (default): pages stack vertically and scroll normally.
- **Side to Side**: pages are arranged horizontally; the horizontal scrollbar (and mouse wheel/Shift+wheel) turns pages left/right. The recording drags the bottom horizontal slider and pages flip.
- Applies to Print Layout/Web Layout; Read Mode has its own page turning.

#### 2.2.7 Show group

- **Ruler**: shows the horizontal ruler above the page and the vertical ruler at the left (Print Layout). Unchecking hides both; the setting persists per user/session.
- **Gridlines**: overlays a light grid on the page to align objects/text; does not print. The recording notes it makes text harder to read but helps alignment.
- **Navigation Pane**: docks the Navigation pane at the left (see §2.2.8). Toggling again closes it.

#### 2.2.8 Navigation pane

- Title **Navigation** with a close `×`.
- Search box with placeholder **“Search document”** and a magnifier icon.
- Three tabs/views, represented by small icons at the top or by section labels:
  1. **Headings** — hierarchical list of headings with indentation by level. Clicking jumps to the heading. Collapse/expand triangles for nested headings.
  2. **Pages** — thumbnail grid of pages with page numbers. Clicking a thumbnail jumps to that page. Page thumbnails are generated from the document.
  3. **Results** — appears/activates when a search is run; lists matches with context snippets and a count (e.g. “29 results”). Clicking a result jumps to and highlights the match.
- Dragging a heading in the Headings tab moves the associated content (build-dependent; standard Word behavior).
- The pane width is resizable; it can be closed via `×` or the ribbon toggle.
- The recording searches “New Wave”, gets 29 results, browses Results, clicks a result, and jumps to the paragraph; it also clicks a page thumbnail and a heading.

#### 2.2.9 Zoom

**Zoom dialog** (View → Zoom, or status-bar percentage):

| Control | Contents |
|---|---|
| Title | **Zoom** |
| Presets | **200%**, **100%**, **75%**, **50%**, **25%** |
| Radio | **Page width**, **Text width**, **Whole page**, **Many pages** |
| Many pages | Spinner/field for number of pages across (e.g. `1`, `2`, `3`…) |
| Percent | **Percent:** text field (e.g. `124%`) |
| Buttons | **OK**, **Cancel** |

- Presets select the corresponding percent; typing a custom percent selects the **Percent** field.
- **Page width** fits the page width to the window; **Text width** fits the text column; **Whole page** fits the entire page; **Many pages** fits N pages across.
- The recording tries 75%, 200%, and a custom **124%**, then Page Width/Text Width/Whole Page/Many Pages.
- Ribbon buttons:
  - **100%** — exact 100%.
  - **One Page** — fits one whole page.
  - **Multiple Pages** — fits multiple pages across (usually 2; honors the last “Many pages” setting).
  - **Page Width** — fills the window width.
- Status-bar zoom: `−` / slider / `+`, percentage label. Clicking the percentage opens the **Zoom** dialog (in stock Word). `Ctrl+Scroll` zooms; `Ctrl+Plus`/`Ctrl+Minus` zoom in/out; `Ctrl+0` resets to 100%.

#### 2.2.10 Window group

- **New Window**: opens a second window on the same document. Both windows edit the same underlying document; changes appear in both. The recording clicks it and sees what looks like a refresh, then notes it is a separate window.
- **Arrange All**: tiles all open Word document windows on screen (grid). The recording opens four or five windows and arranges them.
- **Split**: divides the current window into two panes with a draggable horizontal divider. Each pane can scroll to a different part of the same document. `Split` toggles; clicking it again (or dragging the divider to an edge / double-clicking it) removes the split.
- **View Side by Side**: with two windows, places them side by side and sizes them equally. Enabled only when at least two windows are open.
- **Synchronous Scrolling**: when side-by-side is active, scrolling one window scrolls the other. Toggle off to scroll independently. Disabled unless side-by-side is active.
- **Reset Window Position**: restores the two side-by-side windows to equal size/position after manual resizing.
- **Switch Windows**: dropdown/list of open document windows (e.g. “Document1”, “Document2”); selecting one activates it.

#### 2.2.11 Macros

- **Macros** large button:
  - Top half (button body) opens the macro list directly (available macros).
  - Bottom half (caret) opens the **Macros** dialog.
- **Macros** dialog:
  - **Macro name:** text field.
  - **Macros in:** dropdown (All active templates and documents, Normal.dotm, current document).
  - List of macros with descriptions.
  - Buttons: **Run**, **Step Into**, **Edit**, **Create**, **Delete**, **Organizer…**, **Cancel**.
- When no macros exist the list is empty and Run/Edit/Delete are disabled; the recording notes it has none.
- The **Developer** tab's **Record Macro** is separate; the View tab only lists/runs macros.

#### 2.2.12 SharePoint Properties

- Visible only for documents stored on SharePoint/OneDrive for Business.
- **Properties** opens the document properties panel (server-side metadata: title, status, content type, version, check-in/out, workflow).
- Not part of the core clone; document as conditional.

### 2.3 File backstage details

#### 2.3.1 Backstage shell

- Full-window surface with a light background; the ribbon, ruler, and status bar are hidden.
- Top-left **← Back** arrow returns to the document. `Esc` also returns.
- Left nav is a vertical list with icons; the active item has a highlighted background and accent bar.
- Hovering a nav item previews its accent; clicking swaps the right pane without closing.
- The right pane scrolls independently; content width is constrained to a readable column on wide screens.
- The document title may appear at the top of some pages (Info) and in the window title bar throughout.

#### 2.3.2 Home / New / Open behavior

- **Home** is the default backstage page when no document is open (Start screen) or after clicking File.
- Recent files are read from the app’s recent-documents store; missing files show a “file not found” state and can be removed.
- **Pinned** files persist across sessions.
- **Shared with Me** requires a signed-in cloud account; otherwise it shows an empty state/sign-in prompt.
- **New** templates are fetched online; offline shows only local/blank templates. Searching filters the gallery and shows “No results”.
- **Open → This PC → Browse** opens the OS file dialog; the app’s own `.docx` open path is the same as the toolbar Open command.
- **Recover Unsaved Documents** opens the autorecovery folder; selecting a file opens it as an unsaved document.

#### 2.3.3 Info behavior

- **Protect Document → Mark as Final** sets the file read-only and shows a “MARK AS FINAL” ribbon/status banner; editing is disabled until the user clicks “Edit Anyway”.
- **Encrypt with Password** opens a password dialog; the password is required on every open. Losing it means the file cannot be recovered.
- **Restrict Editing** opens the same pane as Review → Restrict Editing.
- **Inspect Document** opens the **Document Inspector** dialog with checkboxes:
  - Comments, Revisions, Versions, and Annotations
  - Document Properties and Personal Information
  - Custom XML Data
  - Headers, Footers, and Watermarks
  - Invisible Content
  - Hidden Text
  - (build-dependent) Macros, ActiveX controls, Embedded documents
  - **Inspect**, **Remove All**, **Close**.
- Inspection results show “Removed” / “Nothing found” per category; **Remove All** is destructive and cannot be undone.
- **Check Accessibility** routes to the Accessibility pane; **Check Compatibility** opens the compatibility checker.
- **Version History** requires cloud storage; enabling uploads the current file, and subsequent saves create versions. The version pane lists timestamps/authors and allows open/restore.
- **Properties** values update after saving; Total Editing Time accumulates while the document is open. Title/Tags/Comments are editable inline and saved to the file’s core properties.
- **Show All Properties** expands the panel; **Advanced Properties** opens the classic Properties dialog.

#### 2.3.4 Print behavior

- Print settings are per-document/session; changing printer reloads capabilities (duplex, color, paper sizes).
- **Print All Pages** dropdown options change the summary line and enable the **Pages** field for ranges.
- **Print One Sided** → **Print on Both Sides** (flip on long/short edge) when the printer supports duplex.
- **Collated** → **Uncollated** for multiple copies.
- **Portrait Orientation** → **Landscape Orientation**.
- Paper size list comes from the printer driver (Letter, Legal, A4, etc.).
- **Normal Margins** → **Narrow**, **Moderate**, **Wide**, **Custom Margins…** (opens Page Setup).
- **1 Page Per Sheet** → 2/4/6/8/16 pages per sheet.
- **Page Setup** opens the Page Setup dialog (Margins, Paper, Layout).
- Preview updates live; page navigation arrows and zoom (slider + “Fit page”).
- **Print** sends the job; if no printer is available, Word shows an error and the button may be disabled.

#### 2.3.5 Share behavior

- **Save to Cloud** uploads to OneDrive and converts the local path to a cloud path; the title bar changes to show the cloud location/autosave.
- **Share with People** requires the file to be in cloud storage; entering names/emails and permissions (Can edit / Can view) sends invitations.
- **Email → Send as Attachment** attaches the `.docx`; **Send as PDF** attaches a PDF; **Send a Link** inserts a cloud link.
- **Create PDF and share link** exports a PDF and creates a view link.
- **Present Online** creates a browser link for a live/recorded presentation (requires sign-in; service availability varies).
- **Get a sharing link** creates View/Edit links with optional expiration/password (tenant-dependent).

#### 2.3.6 Export behavior

- **Create PDF/XPS** uses the current print settings for page range; **Options** controls publish range, non-printing info, PDF/A, bookmarks, document properties, accessibility tags.
- Export does not modify the open document; the exported file opens in the default PDF viewer.
- **Change File Type** selects a format and then **Save As** opens the file dialog with that format preselected. Some formats (Plain Text, RTF, Single File Web Page) may show a compatibility/encoding warning.
- Exporting to older `.doc` may trigger Compatibility Mode; the title bar shows “[Compatibility Mode]”.
- **Send documents to Kindle** requires an Amazon account and converts the document for Kindle delivery.

#### 2.3.7 Account / Options behavior

- Account changes apply to the Office identity across apps; switching licenses may require restart/sign-in.
- Office Theme/Background change immediately across all Office apps, not just Word.
- **Options → General → Start up options** controls the Start screen; disabling it opens a blank document on launch.
- Options changes are global (per user) unless noted; **OK** applies, **Cancel** discards, **Apply** is not present in modern Word Options.
- Proofing/AutoCorrect settings affect all documents; **Recheck Document** re-runs the checker on the current document after changing exceptions.

---

## 3. Behaviors and visual rules

### 3.1 Review markup visuals

| Element | Standard Word appearance | Notes |
|---|---|---|
| Insertion | Underlined text in the author’s color | In All Markup; color assigned per author (red, blue, green, purple, etc.). |
| Deletion | Struck-through text in the author’s color | In All Markup; in balloons mode, deleted text appears in a balloon. |
| Formatting change | Underlined/bolded change indicator or a balloon | Balloon lists “Formatted: Font: Bold” etc. |
| Changed line | Vertical bar in the margin | Red in Simple Markup; color configurable. |
| Comment | Pale highlight on the anchored range + margin bubble/anchor | Bubble contains author initials/avatar; hover previews, click opens. |
| Balloon area | Right margin column | Width configurable; lines connect balloon to anchor. |
| Reviewing pane | Left (vertical) or bottom (horizontal) list | Summary “Revisions / N revisions”; click to jump. |
| Ink | Freeform drawing | Hidden/deleted via Hide Ink. |

Rules:

- **Simple Markup** is the default display for many users: clean text + red margin bars. Clicking a red bar switches to All Markup at that location; clicking again can return to Simple.
- **All Markup** shows everything: inline insertions/deletions, formatting, comments, and balloons.
- **No Markup** shows the final (accepted) text but keeps revisions; **Original** shows the pre-revision text.
- Markup colors are author-specific and stable within a document; the same author keeps the same color across insertions/deletions/comments.
- **Show Markup** filters are display-only. Hiding a reviewer’s markup does not remove it; **Accept All Changes Shown** affects only what is shown.
- **Highlight Updates** tints newly changed regions (often light blue/green) while reviewing; it is a viewing aid, not a revision.
- Comment anchors use a red/pink margin marker; the highlighted range is a pale tint of the author color. Hovering shows the comment; clicking the marker selects the range.
- Deleting a comment removes the anchor and any replies; resolving keeps the thread but collapses it (build-dependent).
- The Reviewing Pane count updates immediately after accept/reject/delete; when zero, it shows “No revisions”.
- Accept/reject acts on the revision at the caret; if the caret is not on a revision, Word finds the next one in document order.
- Accepting all changes does not delete comments; comments must be deleted separately (unless “Delete All Comments” is used).
- Track Changes state is per-document/session; the status bar indicator is the reliable cue. Turning it off does not accept existing revisions.
- Revisions are stored in the `.docx`; saving with tracking off keeps them until accepted/rejected.

### 3.2 View behaviors

- **Print Layout** is the default editing view: page boundaries, margins, headers/footers, images, and floating objects are visible. Ruler and gridlines are available.
- **Web Layout** removes page boundaries and reflows text to the window width; it is not WYSIWYG for printing. The clone currently renders a page-like canvas with 100% width but keeps page chrome; a true Web Layout should remove page shadow/boundaries and let content fill the window.
- **Read Mode** is a reading-optimized view: no ribbon, book-like spread, page-turn arrows, page indicator. `Esc` exits. It is not an editing mode.
- **Outline** is structural: heading levels, collapse/expand, promote/demote, move up/down. Body text is secondary. It is best with heading styles; without them the outline is flat.
- **Draft** is text-only: fastest for typing, hides layout/graphics. Page breaks show as dashed lines.
- **Focus** dims chrome and non-current text; `Esc` exits. It does not alter the document.
- **Immersive Reader** is a full-screen accessibility reading mode with its own tab. Column Width, Page Color, Line Focus, Text Spacing, Syllables, and Read Aloud are view-only. **Close** returns to the prior view.
- **Page Movement → Side to Side** changes the scroll axis, not the document; the horizontal scrollbar turns pages.
- **Ruler/Gridlines** are per-view toggles; gridlines never print. Ruler is hidden in Web Layout/Read Mode.
- **Navigation Pane** docks left and can be resized. Headings/Pages/Results are alternative views of the same document; search populates Results and shows a count. Clicking any entry jumps/scrolls and selects the target. The pane stays in sync with edits.
- **Zoom** is per-window, not saved in the document. Presets and slider stay in sync; the status-bar percentage reflects the current zoom. `Ctrl+Scroll` zooms around the pointer.
- **Window** commands operate on app windows:
  - New Window creates a second view of the same document; edits are shared.
  - Arrange All tiles windows.
  - Split creates two scrollable panes in one window; the divider is draggable; toggling removes it.
  - View Side by Side requires two windows; Synchronous Scrolling links them; Reset restores equal sizing.
  - Switch Windows activates another open document window.
- **Macros** lists/runs VBA macros; with no macros the list is empty. (The clone has no VBA engine; this is document-only.)
- **Status bar** (stock Word):
  - Page count / “Page X of Y”; in Read Mode the page indicator can show a spread (“2-3 of 4”).
  - Word count; clicking opens **Word Count**.
  - Proofing language; clicking opens **Language**.
  - Track Changes indicator when on.
  - View shortcut buttons (Read Mode, Print Layout, Web Layout).
  - Zoom slider and percentage; clicking the percentage opens **Zoom**.
  - Optional: selection mode, macro recording, spelling/grammar status, upload status, sign-in.

### 3.3 Backstage behaviors

- File always opens the backstage, never a dropdown menu; this is the defining difference from ribbon tabs.
- Back returns to the exact prior document state/scroll position.
- Backstage pages are not modal dialogs: commands either navigate to another page, open a dialog/file picker, or perform the action and return/close.
- `Save` saves in place; `Save As` always asks for a new name/location and creates a second file. The recording explicitly distinguishes the two.
- `Print` shows a live preview; actual printing requires a printer driver. Export to PDF is the printer-independent path.
- `Share` and cloud features require sign-in; without it, Word shows sign-in/“Save to Cloud” prompts.
- `Info` is the document dashboard: protect, inspect, versions, manage, properties.
- `Account` and `Options` are app-level, not document-level.
- `Close` prompts to save unsaved changes; `Back` never prompts.
- Add-ins can inject nav items (e.g. `Save as Adobe PDF`), so the nav is not fixed.

---

## 4. Keyboard shortcuts

### 4.1 Tabs and backstage

| Action | Shortcut |
|---|---|
| Open **File** backstage | `Alt+F` |
| Open **Review** tab | `Alt+R` (or `Alt`, then `R`) |
| Open **View** tab | `Alt+W` (or `Alt`, then `W`) |
| Ribbon key-tip navigation | `Alt` or `F10`, then letter(s) |
| Search / Tell Me | `Alt+Q` |
| Back from backstage | `Esc` (or `← Back`) |

### 4.2 Review

| Action | Shortcut |
|---|---|
| New comment | `Ctrl+Alt+M` |
| Post comment / save comment edit | `Ctrl+Enter` |
| Discard draft comment / cancel edit | `Esc` |
| Show/hide Comments pane | `Alt+Period, R, K` (or `Alt+Windows, R, K`) |
| Show list of comments | `Alt+R, P, 1, L` |
| Next comment thread (Comments pane focused) | `Down Arrow` |
| Previous comment thread (Comments pane focused) | `Up Arrow` |
| Expand/collapse comment thread | `Right Arrow` / `Left Arrow` |
| Move to reply box | `Tab`, `Tab`, `Enter` |
| Edit focused comment/reply | `Tab`, `Enter` |
| Turn Track Changes on/off | `Ctrl+Shift+E` |
| Close Reviewing Pane | `Alt+Shift+C` |
| Spelling / Editor | `F7` |
| Thesaurus | `Shift+F7` |
| Word Count | `Ctrl+Shift+G` |
| Accept and move to next | `Alt+R, A, 1` (ribbon key tips; build-dependent) |
| Reject and move to next | `Alt+R, J, 1` (build-dependent) |

### 4.3 View

| Action | Shortcut |
|---|---|
| Read Mode | `Alt+W, F` |
| Print Layout | `Ctrl+Alt+P` |
| Outline view | `Ctrl+Alt+O` |
| Draft view | `Ctrl+Alt+N` |
| Exit Read Mode | `Esc` |
| Exit Focus / Immersive Reader | `Esc` |
| Zoom in / out | `Ctrl+Plus` / `Ctrl+Minus` |
| Zoom to 100% | `Ctrl+0` |
| Zoom with mouse | `Ctrl+Scroll` |
| Outline: promote/demote | `Alt+Shift+Left` / `Alt+Shift+Right` |
| Outline: move up/down | `Alt+Shift+Up` / `Alt+Shift+Down` |
| Outline: expand/collapse | `Alt+Shift+Plus` / `Alt+Shift+Minus` |
| Outline: show level 1…9 | `Alt+Shift+1` … `Alt+Shift+9` |
| Outline: expand/collapse all | `Alt+Shift+A` |
| Outline: show first line/all text | `Alt+Shift+L` |
| Navigation Pane | `Ctrl+F` (opens Find/Nav) |

### 4.4 File / general

| Action | Shortcut |
|---|---|
| New document | `Ctrl+N` |
| Open | `Ctrl+O` |
| Save | `Ctrl+S` |
| Save As | `F12` (or `Ctrl+Shift+S`) |
| Print | `Ctrl+P` (or `Ctrl+F2` print preview) |
| Close document | `Ctrl+W` |
| Exit Word | `Alt+F4` |
| Undo / Redo | `Ctrl+Z` / `Ctrl+Y` |
| Find | `Ctrl+F` |
| Replace | `Ctrl+H` |
| Go To | `Ctrl+G` |
| Select all | `Ctrl+A` |

---

## 5. Gap analysis vs current clone

Current implementation reviewed:

- `src/components/ribbon/ReviewTab.tsx`
- `src/components/ribbon/ViewTab.tsx`
- `src/components/Backstage.tsx`
- `src/components/StatusBar.tsx`
- `src/components/NavigationPane.tsx`
- `src/components/PageCanvas.tsx`
- `src/components/TitleBar.tsx`
- `src/editor/extensions.ts`
- `src/context.ts`
- `src/styles/word.css`

### 5.1 Review tab

| Area | Current clone | Word target | Gap |
|---|---|---|---|
| Groups | 5 groups: Proofing, Comments, Tracking, Compare, Protect | 9–10 groups: Proofing, Speech, Accessibility, Language, Comments, Tracking, Changes, Compare, Protect, Ink | **Major** |
| Proofing | Spelling & Grammar, Thesaurus, Word Count as toasts | Editor pane, Spelling & Grammar, Thesaurus pane, Word Count dialog | **Major** — all stubs, no Editor, no dialog |
| Speech | absent | Read Aloud with playback bar | **Major** |
| Accessibility | absent | Check Accessibility + pane | **Major** |
| Language | absent | Translate (Translator pane) + Language dialog | **Major** |
| Comments | New Comment/Delete/Previous/Next toasts; no `Show Comments` | Full comment data model, cards, replies, resolve, delete menu, Show Comments, navigation | **Major** — no comment extension in `src/editor/extensions.ts` |
| Tracking | Track Changes toggle + Accept popover only | Track Changes, markup modes (Simple/All/No/Original), Show Markup checklist, Reviewing Pane | **Major** |
| Changes | Accept folded into Tracking; Reject is a plain button; no dropdowns | Separate Changes group; Accept/Reject dropdowns with all/shown/next variants; Previous/Next | **Major** |
| Compare | single toast button | Compare/Combine dialogs, version entries, Show Source Documents | **Major** |
| Protect | Restrict Editing toast only | Block Authors pane + Restrict Editing pane with formatting/editing restrictions, exceptions, password enforcement | **Major** |
| Ink | absent | Hide Ink toggle + Delete All Ink | **Minor/conditional** |
| Markup rendering | none | Inline insertions/deletions, margin bars, balloons, comment anchors, author colors | **Major** — no track-changes extension or CSS |

### 5.2 View tab

| Area | Current clone | Word target | Gap |
|---|---|---|---|
| Views | Read Mode, Print Layout, Web Layout only | Plus Outline and Draft | **Major** |
| Immersive | absent | Focus + Immersive Reader with contextual tab (Column Width, Page Color, Line Focus, Text Spacing, Syllables, Read Aloud) | **Major** |
| Page Movement | absent | Vertical / Side to Side | **Medium** |
| Show | Ruler, Gridlines, Navigation Pane present and functional | Same | **Mostly complete**; Navigation pane needs tabs/results |
| Zoom | Zoom button increments +10%; 100%, Page Width, One Page | Zoom dialog, Multiple Pages, presets, status-bar dialog | **Medium** — missing dialog and Multiple Pages; Zoom button behavior wrong |
| Window | Split (toast), Full Screen (non-Word command), New Window, Switch Windows (toast) | New Window, Arrange All, Split (real), View Side by Side, Synchronous Scrolling, Reset Window Position, Switch Windows | **Major** |
| Macros | button with empty handler | Macro list / Macros dialog | **Low** for a browser clone (no VBA), but UI should not be dead |
| SharePoint | absent | Properties (conditional) | **Low/conditional** |
| Read Mode | white `.read-sheet` at 800px, ribbon still visible? (`canvas read-mode` only) | Book spread, minimal top bar, page arrows, “2-3 of 4”, Esc exits | **Major** |
| Web Layout | `.web-mode` class applied, inline width 100%, but no `.web-mode` CSS rule; page chrome still present | Full-width reflow, no page boundaries/shadow | **Medium** |
| Outline/Draft | absent | Full outline tools / text-only draft | **Major** |
| Navigation Pane | Headings only; fake single page thumbnail; filter is local to headings | Headings/Pages/Results tabs, search count, real thumbnails, click-to-jump | **Major** |
| Status bar | “Page 1 of 1”, words/chars/paragraphs, static language, track changes pill, view icons, zoom slider/percentage (click resets to 100%) | Real page count, click word count → Word Count, click language → Language, click percentage → Zoom, read-mode spread indicator | **Medium** |
| View state | `ViewMode = 'print' \| 'web' \| 'read'` in `src/context.ts` | Add `outline`, `draft`; focus/immersive transient states; page movement | **Major** |

### 5.3 File backstage

| Area | Current clone | Word target | Gap |
|---|---|---|---|
| Shell | Full-window `backstage` with left nav + `Back` | Same, with hover/accent and scroll | **Mostly complete** |
| Nav items | Home, New, Open, Save, Save As, Print, Share, Export, Close | Home, New, Open, Get Add-ins, Info, Save, Save As, Print, Share, Export, Transform, Close, Account, Options | **Major** |
| Home | Static “Good day” + 4 action cards | Greeting, blank/template gallery, More templates, search, Recent/Pinned/Shared tabs, Name/Date list, pins | **Major** |
| New | reuses `newDoc` directly | Template gallery, online template search, Create | **Major** |
| Open | native file open only | Recent/Shared/OneDrive/This PC/Add a Place/Browse, Documents/Folders, date groups, Recover Unsaved | **Major** |
| Info | one paragraph in Home, not a page | Full Info dashboard (protect, inspect, versions, manage, properties) | **Major** |
| Print | `printDoc()` direct | Print page with preview, copies, printer, settings, page range, page setup | **Major** |
| Share | toast “link copied” | Share page with cloud/email/PDF link/Present Online | **Major** |
| Export | routes to `saveAsDocx` | PDF/XPS, Change File Type gallery, Kindle | **Major** |
| Account | absent | Account page (user, privacy, background, theme, services, product, updates) | **Major** |
| Options | absent | Full Word Options dialog with 11 sections | **Major** |
| Get Add-ins / Transform | absent | Add-in store / transform page | **Low/conditional** |
| Save/Save As | functional `.docx` save | Same; Save As should prompt for name/location | **Partial** — behavior depends on `saveAsDocx` |
| Close | `onClose` without save prompt | Prompt Save/Don’t Save/Cancel | **Medium** |

### 5.4 Cross-cutting

- No comments or track-changes ProseMirror extensions/marks in `src/editor/extensions.ts`; markup cannot be stored, rendered, navigated, accepted, or rejected.
- No author/color model, revision timestamps, or comment threads.
- No page-count engine connected to the status bar (hardcoded “Page 1 of 1”); no real thumbnails.
- No persistence of view settings (zoom per window, nav pane width, markup mode).
- No dialogs infrastructure for Word-style modal dialogs (most actions are toasts); the clone needs a reusable dialog + task-pane pattern.
- No backstage page routing; `Backstage.tsx` is a single static screen.
- No keyboard shortcut wiring for Review/View/File (`Alt+R`, `Alt+W`, `Ctrl+Alt+M`, `Ctrl+Shift+E`, `Ctrl+F2`, etc.).
- Many buttons are visually present but inert (`Macros`, `Compare`, `Restrict Editing`, `Thesaurus`, `Word Count`), which is worse than hiding them for a demo.

---

## 6. Frame-capture timestamp table

Use these timestamps to capture reference frames. Times are `hh:mm:ss` from the start of each video; scrub ±3–5 s because captions drift. “Capture” means the moment the named UI is on screen.

| Video | hh:mm:ss | What UI to capture |
|---|---|---|
| Review `IvAHYchBIak` | 00:00:59 | Word Count dialog with Pages/Words/Characters/Paragraphs/Lines and the textboxes/notes checkbox |
| Review | 00:01:47 | Editor pane opening at the right, score area and category rows |
| Review | 00:05:44 | Full Editor pane with Editor Score, writing-style dropdown, Corrections/Refinements |
| Review | 00:09:28 | Check Accessibility dropdown and Accessibility pane (Errors → Missing Object Description) |
| Review | 00:11:45 | Translate menu and Translator pane (Selection/Document, From English → To Spanish, Insert) |
| Review | 00:12:11 | New Comment card, selected text highlight, author “Charles Richardson”, Post button |
| Review | 00:13:35 | Track Changes options/dropdown and the comments/tracking area of the ribbon |
| Review | 00:14:24 | Markup-mode dropdown open: Simple Markup, All Markup, No Markup, Original |
| Review | 00:14:45 | Show Markup checklist: Insertions and Deletions, Formatting, Balloons, Specific People, Highlight Updates, Other Authors |
| Review | 00:15:51 | Accept dropdown open (Accept and Move to Next, Accept This Change, Accept All Changes Shown, Accept All Changes, Accept All Changes and Stop Tracking) |
| Review | 00:16:47 | Compare dropdown: Major Version, Last Version, Specific Version…, Compare…, Combine…, Show Source Documents |
| Review | 00:17:45 | Restrict Editing pane: formatting restrictions, editing restrictions “No changes (Read only)”, exceptions, Start Enforcing Protection |
| View `s2EzLiIL5B4` | 00:00:47 | Print Layout view and the Views group (Read Mode / Print Layout / Web Layout) |
| View | 00:01:02 | Read Mode book spread with page arrows and page indicator |
| View | 00:02:32 | Outline view with heading levels and Outlining contextual tab |
| View | 00:03:00 | Draft view (text only, dashed page break) |
| View | 00:03:52 | Focus mode dimming chrome and surrounding text |
| View | 00:04:36 | Immersive Reader full screen with contextual tab |
| View | 00:05:47 | Column Width menu (Very Narrow/Narrow/Moderate/Wide) |
| View | 00:06:39 | Line Focus menu (None/One Line/Three Lines/Five Lines) |
| View | 00:08:59 | Page Movement group (Vertical / Side to Side) and horizontal page slider |
| View | 00:09:58 | Navigation pane with Headings, Pages, Results; search “New Wave” and 29 results |
| View | 00:11:06 | Zoom dialog (presets, Page width/Text width/Whole page/Many pages, Percent) |
| View | 00:15:18 | View Side by Side + Synchronous Scrolling enabled/disabled states |
| File `k2UfPX5caCo` | 00:00:44 | File backstage shell with back arrow and left nav list |
| File | 00:01:01 | Home page: greeting, blank/template thumbnails, More templates, search, Recent list |
| File | 00:03:26 | New page: blank document, template gallery, online-template search |
| File | 00:03:48 | Open page: Recent/Shared/OneDrive/This PC/Add a Place/Browse, Documents/Folders tabs |
| File | 00:05:19 | Info page: document name, Upload/Share/Copy path/Open file location, Protect/Inspect/Version/Manage |
| File | 00:06:00 | Document Inspector dialog with category checkboxes and Inspect/Remove All |
| File | 00:07:07 | Properties panel (Size 15.7KB, Pages 2, Words 634, Total Editing Time 7 Minutes, dates/people) |
| File | 00:09:04 | Print page: copies, printer dropdown, Print All Pages, orientation, paper size, preview/zoom |
| File | 00:10:07 | Export page: Create Adobe PDF, Create PDF/XPS, Change File Type, Send to Kindle |
| File | 00:11:56 | Word Options dialog with left nav (General … Trust Center) and General sections |

---

## 7. Top 10 gaps to close first

1. **No revision model.** Add ProseMirror marks/extensions for insertions, deletions, and formatting changes, with author, timestamp, and stable IDs; without this, Review is a mock.
2. **No comment model.** Add comment marks + thread storage (author, body, replies, resolved), anchors in the margin, and a Comments pane/card UI.
3. **Missing Review groups.** Build Speech (Read Aloud), Accessibility (Check Accessibility pane), and Language (Translator + Language dialog); currently absent.
4. **Tracking/Changes split is wrong.** Create a real Tracking group (Track Changes, markup modes, Show Markup, Reviewing Pane) and a separate Changes group (Accept/Reject dropdowns, Previous/Next).
5. **Proofing is stubbed.** Replace toasts with the Word Count dialog and a working Editor/Spelling pane (even a limited rule set), plus Thesaurus.
6. **Compare/Protect are stubs.** Implement Compare/Combine dialogs and the Restrict Editing pane with formatting restrictions, editing restrictions, exceptions, and password enforcement.
7. **View tab is incomplete.** Add Outline and Draft views, Focus, Immersive Reader (with its tab/menus), Page Movement, and the real Zoom dialog + Multiple Pages; fix Window to Arrange All/View Side by Side/Synchronous/Reset/Switch.
8. **Read/Web layouts are shallow.** Read Mode needs the book spread, minimal top bar, page arrows, and spread indicator; Web Layout needs true full-width reflow with no page chrome.
9. **Navigation pane is headings-only.** Add Pages and Results tabs, real page thumbnails/count, search-result count, and click-to-jump for each tab.
10. **Backstage is a placeholder.** Add Info, Account, Options, Get Add-ins, and Transform pages; turn Home into a real Start page with templates/recent/pinned/shared; make Print a settings+preview page and Export a format gallery.

---

*This document is research only. No application source files were modified.*
