import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Cloud,
  Copy,
  FileDown,
  FilePlus,
  FileText,
  FileType,
  FolderOpen,
  Grid3x3,
  History,
  Home,
  Info,
  LayoutTemplate,
  Link,
  Mail,
  Monitor,
  Palette,
  Pin,
  Plus,
  Presentation,
  Printer,
  Save,
  Search,
  Send,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Upload,
  User,
  X,
} from 'lucide-react'
import { useWord } from '../context'

type Page =
  | 'Home'
  | 'New'
  | 'Open'
  | 'Add-ins'
  | 'Info'
  | 'Save As'
  | 'Print'
  | 'Share'
  | 'Export'
  | 'Account'
  | 'Options'

const TEMPLATES = [
  { name: 'Blank document', sub: 'Start with a clean page', kind: 'blank' },
  { name: 'Banner', sub: 'Suggested searches', kind: 'banner' },
  { name: 'Calendar', sub: 'Suggested searches', kind: 'calendar' },
  { name: 'Brochure', sub: 'Suggested searches', kind: 'brochure' },
  { name: 'Agenda', sub: 'Suggested searches', kind: 'agenda' },
]

const FILES = [
  { name: 'Document1.docx', date: 'A few seconds ago' },
  { name: 'Project Proposal.docx', date: 'Yesterday, 4:32 PM' },
  { name: 'Meeting Notes.docx', date: 'October 12, 2026' },
  { name: 'Quarterly Report.docx', date: 'October 2, 2026' },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function Backstage({ onClose }: { onClose: () => void }) {
  const {
    newDoc,
    openDoc,
    saveDocx,
    saveAsDocx,
    printDoc,
    docTitle,
    setDocTitle,
    toast,
    wordCount,
    theme,
    setTheme,
  } = useWord()
  const [page, setPage] = useState<Page>('Home')
  const [tab, setTab] = useState<'Recent' | 'Pinned' | 'Shared with Me'>('Recent')
  const [pinned, setPinned] = useState<string[]>([])
  const [templates, setTemplates] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [docTab, setDocTab] = useState<'Documents' | 'Folders'>('Documents')
  const [optionPage, setOptionPage] = useState('General')
  const [openSection, setOpenSection] = useState('')
  const [settings, setSettings] = useState({
    copies: 1,
    printer: 'Microsoft Print to PDF',
    printWhat: 'Print All Pages',
    pages: '1-2',
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const nav: { label: string; icon: React.ReactNode; divider?: boolean }[] = [
    { label: 'Home', icon: <Home size={17} /> },
    { label: 'New', icon: <FilePlus size={17} /> },
    { label: 'Open', icon: <FolderOpen size={17} /> },
    { label: 'Get Add-ins', icon: <Plus size={17} />, divider: true },
    { label: 'Info', icon: <Info size={17} /> },
    { label: 'Save', icon: <Save size={17} /> },
    { label: 'Save As', icon: <FileDown size={17} /> },
    { label: 'Print', icon: <Printer size={17} /> },
    { label: 'Share', icon: <Share2 size={17} /> },
    { label: 'Export', icon: <FileDown size={17} /> },
    { label: 'Close', icon: <X size={17} /> },
  ]

  const togglePin = (name: string) =>
    setPinned((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]))

  const templateCards = (
    <>
      <div className="bs-section-head">
        <h3>New</h3>
      </div>
      <div className="bs-templates">
        {TEMPLATES.map((t) => {
          const chosen = selected === t.name
          return (
            <button
              key={t.name}
              className={`bs-template${chosen ? ' selected' : ''}`}
              onClick={() => {
                if (t.kind === 'blank') {
                  newDoc()
                  onClose()
                } else {
                  setSelected(t.name)
                }
              }}
            >
              <span className={`bs-thumb ${t.kind}`}>
                {t.kind === 'blank' ? <FileText size={22} /> : null}
              </span>
              <span className="bs-template-name">{t.name}</span>
              <span className="bs-template-sub">{t.sub}</span>
              {chosen ? <span className="bs-template-check"><Check size={12} /></span> : null}
            </button>
          )
        })}
      </div>
    </>
  )

  const fileList = (items: typeof FILES) => (
    <div className="bs-list">
      <div className="bs-list-head">
        <span>Name</span>
        <span>Date modified</span>
      </div>
      {items.map((f) => (
        <div
          key={f.name}
          className="bs-row"
          role="button"
          tabIndex={0}
          onClick={() => {
            setDocTitle(f.name.replace(/\.docx$/, ''))
            toast(`Opened ${f.name}`)
            onClose()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setDocTitle(f.name.replace(/\.docx$/, ''))
              onClose()
            }
          }}
        >
          <FileText size={17} />
          <span className="bs-row-name">{f.name}</span>
          <span className="bs-row-date">{f.date}</span>
          <button
            className={`bs-pin${pinned.includes(f.name) ? ' on' : ''}`}
            title={pinned.includes(f.name) ? 'Unpin' : 'Pin'}
            onClick={(e) => {
              e.stopPropagation()
              togglePin(f.name)
            }}
          >
            <Pin size={14} />
          </button>
        </div>
      ))}
    </div>
  )

  const content = () => {
    switch (page) {
      case 'Home': {
        const items =
          tab === 'Pinned'
            ? FILES.filter((f) => pinned.includes(f.name))
            : tab === 'Shared with Me'
              ? FILES.slice(1, 3)
              : FILES
        return (
          <>
            <div className="bs-page-head">
              <h1>{greeting()}</h1>
              <div className="bs-search">
                <Search size={15} />
                <input placeholder="Search for online templates" />
              </div>
            </div>
            {templateCards}
            <div className="bs-section-head">
              <h3>Recent</h3>
              <button className="bs-link" onClick={() => setPage('Open')}>More documents</button>
            </div>
            <div className="bs-tabs">
              {(['Recent', 'Pinned', 'Shared with Me'] as const).map((t) => (
                <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
              ))}
            </div>
            {items.length ? fileList(items) : <p className="bs-empty">Nothing pinned yet.</p>}
          </>
        )
      }
      case 'New':
        return (
          <>
            <div className="bs-page-head">
              <h1>New</h1>
              <div className="bs-search">
                <Search size={15} />
                <input placeholder="Search for online templates" />
              </div>
            </div>
            {templateCards}
            <div className="bs-chips">
              {['Business', 'Calendar', 'Flyer', 'Letter', 'Resume'].map((c) => (
                <button key={c} className="bs-chip" onClick={() => toast(`Searching: ${c}`)}>{c}</button>
              ))}
            </div>
            <div className="bs-create-row">
              <span className="bs-muted">{selected ? `Selected: ${selected}` : 'Select a template to create'}</span>
              <button
                className="bs-primary"
                disabled={!selected}
                onClick={() => {
                  toast(`Creating ${selected}`)
                  newDoc()
                  onClose()
                }}
              >
                Create
              </button>
            </div>
          </>
        )
      case 'Open':
        return (
          <>
            <div className="bs-page-head">
              <h1>Open</h1>
            </div>
            <div className="bs-sources">
              {['Recent', 'Shared with Me', 'OneDrive', 'This PC', 'Add a Place'].map((s) => (
                <button key={s} className={`bs-source${s === 'Recent' ? ' active' : ''}`} onClick={() => toast(s)}>{s}</button>
              ))}
              <button className="bs-source" onClick={openDoc}><FolderOpen size={14} /> Browse</button>
            </div>
            <div className="bs-tabs">
              {(['Documents', 'Folders'] as const).map((t) => (
                <button key={t} className={docTab === t ? 'active' : ''} onClick={() => setDocTab(t)}>{t}</button>
              ))}
            </div>
            {docTab === 'Documents' ? (
              <>
                <div className="bs-group-label">Today</div>
                {fileList(FILES.slice(0, 2))}
                <div className="bs-group-label">Yesterday</div>
                {fileList(FILES.slice(2, 3))}
                <div className="bs-group-label">Older</div>
                {fileList(FILES.slice(3))}
              </>
            ) : (
              <div className="bs-list">
                {['Documents', 'Desktop', 'Downloads'].map((f) => (
                  <div key={f} className="bs-row" role="button" tabIndex={0} onClick={() => toast(f)} onKeyDown={() => {}}>
                    <FolderOpen size={17} />
                    <span className="bs-row-name">{f}</span>
                    <span className="bs-row-date">This PC</span>
                  </div>
                ))}
              </div>
            )}
            <button className="bs-link bs-recover" onClick={() => toast('Recover Unsaved Documents')}>Recover Unsaved Documents</button>
          </>
        )
      case 'Add-ins':
        return (
          <>
            <div className="bs-page-head"><h1>Get Add-ins</h1></div>
            <div className="bs-addins">
              {['Wikipedia', 'Web Video Player', 'Pickit Free Images', 'Translator'].map((a) => (
                <div key={a} className="bs-addin">
                  <span className="bs-addin-icon"><Grid3x3 size={20} /></span>
                  <span>
                    <strong>{a}</strong>
                    <small>Productivity · ★★★★☆</small>
                  </span>
                  <button className="bs-primary" onClick={() => toast(`Added ${a}`)}>Add</button>
                </div>
              ))}
            </div>
          </>
        )
      case 'Info':
        return (
          <>
            <div className="bs-page-head">
              <h1>{docTitle}</h1>
              <div className="bs-actions">
                <button className="bs-action" onClick={() => toast('Upload to OneDrive')}><Upload size={16} /> Upload</button>
                <button className="bs-action" onClick={() => toast('Share link copied')}><Share2 size={16} /> Share</button>
                <button className="bs-action" onClick={() => { navigator.clipboard?.writeText('C:\\Users\\Documents\\' + docTitle + '.docx'); toast('Path copied') }}><Copy size={16} /> Copy path</button>
                <button className="bs-action" onClick={() => toast('Opened file location')}><FolderOpen size={16} /> Open file location</button>
              </div>
            </div>
            <div className="bs-info-layout">
              <div className="bs-info-sections">
                <section>
                  <button className="bs-sec-head" onClick={() => setOpenSection(openSection === 'protect' ? '' : 'protect')}>
                    <ShieldCheck size={18} /><span><strong>Protect Document</strong><small>Control what types of changes people can make</small></span><ChevronDown size={15} />
                  </button>
                  {openSection === 'protect' && (
                    <div className="bs-sec-body">
                      {['Mark as Final', 'Encrypt with Password', 'Restrict Editing', 'Restrict Access'].map((o) => (
                        <button key={o} className="bs-menu-row" onClick={() => toast(o)}>{o}</button>
                      ))}
                    </div>
                  )}
                </section>
                <section>
                  <button className="bs-sec-head" onClick={() => setOpenSection(openSection === 'inspect' ? '' : 'inspect')}>
                    <Search size={18} /><span><strong>Inspect Document</strong><small>Check the document for hidden properties or personal information</small></span><ChevronDown size={15} />
                  </button>
                  {openSection === 'inspect' && (
                    <div className="bs-sec-body">
                      {['Inspect Document', 'Check Accessibility', 'Check Compatibility'].map((o) => (
                        <button key={o} className="bs-menu-row" onClick={() => toast(o)}>{o}</button>
                      ))}
                    </div>
                  )}
                </section>
                <section>
                  <button className="bs-sec-head" onClick={() => setOpenSection(openSection === 'history' ? '' : 'history')}>
                    <History size={18} /><span><strong>Version History</strong><small>View or restore earlier versions</small></span><ChevronDown size={15} />
                  </button>
                  {openSection === 'history' && <div className="bs-sec-body"><button className="bs-menu-row" onClick={() => toast('Version History')}>Version History</button></div>}
                </section>
                <section>
                  <button className="bs-sec-head" onClick={() => setOpenSection(openSection === 'manage' ? '' : 'manage')}>
                    <FileDown size={18} /><span><strong>Manage Document</strong><small>Recover unsaved documents</small></span><ChevronDown size={15} />
                  </button>
                  {openSection === 'manage' && (
                    <div className="bs-sec-body">
                      {['Recover Unsaved Documents', 'Delete All Unsaved Documents'].map((o) => (
                        <button key={o} className="bs-menu-row" onClick={() => toast(o)}>{o}</button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
              <aside className="bs-props">
                <h3>Properties</h3>
                <div className="bs-prop"><span>Size</span><span>15.7KB</span></div>
                <div className="bs-prop"><span>Pages</span><span>1</span></div>
                <div className="bs-prop"><span>Words</span><span>{wordCount.words}</span></div>
                <div className="bs-prop"><span>Total Editing Time</span><span>7 Minutes</span></div>
                <div className="bs-prop-field"><label>Title</label><input placeholder="Add a title" defaultValue={docTitle} /></div>
                <div className="bs-prop-field"><label>Tags</label><input placeholder="Add a tag" /></div>
                <div className="bs-prop-field"><label>Comments</label><input placeholder="Add comments" /></div>
                <button className="bs-link" onClick={() => toast('All properties')}>Show All Properties</button>
              </aside>
            </div>
          </>
        )
      case 'Save As':
        return (
          <>
            <div className="bs-page-head"><h1>Save As</h1></div>
            <div className="bs-saveas">
              <div className="bs-saveas-main">
                <div className="bs-saveas-loc">
                  {['This PC', 'OneDrive - Personal', 'Add a Place'].map((loc) => (
                    <button key={loc} className="bs-saveas-place" onClick={() => toast(loc)}>{loc}</button>
                  ))}
                </div>
                <label className="bs-field"><span>File name</span><input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} /></label>
                <label className="bs-field"><span>Save as type</span>
                  <select defaultValue="Word Document (*.docx)">
                    <option>Word Document (*.docx)</option>
                    <option>Word Macro-Enabled Document (*.docm)</option>
                    <option>PDF (*.pdf)</option>
                    <option>Word Template (*.dotx)</option>
                    <option>Plain Text (*.txt)</option>
                    <option>Web Page (*.htm; *.html)</option>
                  </select>
                </label>
                <div className="bs-options-actions">
                  <button className="bs-primary" onClick={() => saveAsDocx()}>Save</button>
                  <button className="bs-secondary" onClick={() => setPage('Home')}>Cancel</button>
                </div>
                <div className="bs-saveas-actions">
                  <button className="bs-link" onClick={() => saveDocx()}>Save a Copy</button>
                  <button className="bs-link" onClick={() => toast('Version history')}>Version History</button>
                </div>
              </div>
            </div>
          </>
        )
      case 'Print':
        return (
          <>
            <div className="bs-print">
              <div className="bs-print-controls">
                <div className="bs-print-top">
                  <button className="bs-print-btn" onClick={() => printDoc()}><Printer size={22} /> Print</button>
                  <label className="bs-inline">Copies <input type="number" min={1} value={settings.copies} onChange={(e) => setSettings({ ...settings, copies: Number(e.target.value) })} /></label>
                </div>
                <label className="bs-field"><span>Printer</span>
                  <select value={settings.printer} onChange={(e) => setSettings({ ...settings, printer: e.target.value })}>
                    <option>Microsoft Print to PDF</option>
                    <option>Adobe PDF</option>
                    <option>OneNote for Windows 10</option>
                  </select>
                </label>
                <button className="bs-link" onClick={() => toast('Printer Properties')}>Printer Properties</button>
                <label className="bs-field"><span>Settings</span>
                  <select value={settings.printWhat} onChange={(e) => setSettings({ ...settings, printWhat: e.target.value })}>
                    <option>Print All Pages</option>
                    <option>Print Selection</option>
                    <option>Print Current Page</option>
                    <option>Custom Range</option>
                    <option>Print Odd/Even Pages</option>
                  </select>
                </label>
                <label className="bs-field"><span>Pages</span><input value={settings.pages} onChange={(e) => setSettings({ ...settings, pages: e.target.value })} /></label>
                <div className="bs-print-summary">
                  <span>Print One Sided</span>
                  <span>Collated</span>
                  <span>Portrait Orientation</span>
                  <span>Letter (8.5 × 11 in)</span>
                  <span>Normal Margins</span>
                  <span>1 Page Per Sheet</span>
                </div>
                <button className="bs-link" onClick={() => toast('Page Setup')}>Page Setup</button>
              </div>
              <div className="bs-preview">
                <div className="bs-preview-page">
                  <div className="bs-preview-title">{docTitle}</div>
                  <div className="bs-preview-line" /><div className="bs-preview-line short" />
                  <div className="bs-preview-line" /><div className="bs-preview-line" />
                  <div className="bs-preview-line short" />
                </div>
                <div className="bs-preview-nav"><span>1 of 1</span><span className="bs-zoom">64%</span></div>
              </div>
            </div>
          </>
        )
      case 'Share':
        return (
          <>
            <div className="bs-page-head"><h1>Share</h1><p className="bs-muted">Share with People</p></div>
            <div className="bs-share">
              <div className="bs-share-main">
                <h3>Share with People</h3>
                <p>Save to the cloud, then invite people to view or edit.</p>
                <button className="bs-primary" onClick={() => toast('Saved to OneDrive')}><Cloud size={16} /> Save to Cloud</button>
                <div className="bs-email">
                  <h4>Email</h4>
                  {[
                    ['Send as Attachment', <Mail size={16} key="1" />],
                    ['Send a Link', <Link size={16} key="2" />],
                    ['Send as PDF', <FileText size={16} key="3" />],
                    ['Send as XPS', <FileType size={16} key="4" />],
                  ].map(([label, icon]) => (
                    <button key={label as string} className="bs-menu-row" onClick={() => toast(label as string)}>{icon}{label as string}</button>
                  ))}
                </div>
                <button className="bs-menu-row" onClick={() => toast('Create PDF and share link')}><FileDown size={16} /> Create PDF and share link</button>
                <button className="bs-menu-row" onClick={() => toast('Present Online')}><Presentation size={16} /> Present Online</button>
              </div>
              <aside className="bs-share-side">
                <h4>Get a sharing link</h4>
                <button className="bs-menu-row" onClick={() => toast('View link created')}><Link size={16} /> Create a View link</button>
                <button className="bs-menu-row" onClick={() => toast('Edit link created')}><Share2 size={16} /> Create an Edit link</button>
                <div className="bs-prop"><span>Expiration</span><span>None</span></div>
                <div className="bs-prop"><span>Password</span><span>Off</span></div>
              </aside>
            </div>
          </>
        )
      case 'Export':
        return (
          <>
            <div className="bs-page-head"><h1>Export</h1><p className="bs-muted">Choose how you want to share your document.</p></div>
            <div className="bs-export">
              <div className="bs-export-card">
                <FileText size={26} />
                <div>
                  <strong>Create PDF/XPS Document</strong>
                  <p className="bs-muted">Create a PDF or XPS copy of the document.</p>
                </div>
                <button className="bs-primary" onClick={() => { toast('PDF export'); printDoc() }}>Create PDF/XPS</button>
              </div>
              <h3>Change File Type</h3>
              <div className="bs-types">
                {[
                  ['Word Document', '*.docx'],
                  ['Word 97-2003 Document', '*.doc'],
                  ['OpenDocument Text', '*.odt'],
                  ['Template', '*.dotx'],
                  ['Plain Text', '*.txt'],
                  ['Rich Text Format', '*.rtf'],
                  ['Single File Web Page', '*.mht'],
                ].map(([name, ext]) => (
                  <button key={name} className="bs-type" onClick={saveAsDocx}>
                    <FileType size={18} />
                    <span><strong>{name}</strong><small>{ext}</small></span>
                  </button>
                ))}
              </div>
              <button className="bs-primary" onClick={saveAsDocx}>Save As</button>
            </div>
          </>
        )
      case 'Account':
        return (
          <>
            <div className="bs-page-head"><h1>Account</h1></div>
            <div className="bs-account">
              <section>
                <h3>User Information</h3>
                <div className="bs-user">
                  <span className="bs-avatar">DS</span>
                  <span><strong>Dhairya Shah</strong><small>dhairya@example.com</small></span>
                  <button className="bs-link" onClick={() => toast('Change photo')}>Change photo</button>
                  <button className="bs-link" onClick={() => toast('Signed out')}>Sign out</button>
                </div>
                <button className="bs-link" onClick={() => toast('Manage privacy settings')}>Manage privacy settings</button>
              </section>
              <section>
                <h3>Office Background</h3>
                <select className="bs-wide-select" defaultValue="Circuit">
                  <option>Circuit</option><option>Calligraphy</option><option>Clouds</option><option>None</option>
                </select>
              </section>
              <section>
                <h3>Office Theme</h3>
                <select className="bs-wide-select" value={theme} onChange={(e) => setTheme(e.target.value)}>
                  <option value="dark">Black</option>
                  <option value="colorful">Colorful</option>
                  <option value="white">White</option>
                </select>
              </section>
              <section>
                <h3>Connected Services</h3>
                {['OneDrive', 'SharePoint'].map((s) => (
                  <div key={s} className="bs-service"><Cloud size={16} /> {s}<button className="bs-link" onClick={() => toast(`Remove ${s}`)}>Remove</button></div>
                ))}
                <button className="bs-link" onClick={() => toast('Add a service')}><Plus size={14} /> Add a service</button>
              </section>
              <section>
                <h3>Product Information</h3>
                <p className="bs-product">Microsoft 365 Apps for enterprise</p>
                <div className="bs-actions">
                  <button className="bs-action" onClick={() => toast('Manage Account')}>Manage Account</button>
                  <button className="bs-action" onClick={() => toast('Switch License')}>Switch License</button>
                  <button className="bs-action" onClick={() => toast('Update License')}>Update License</button>
                  <button className="bs-action" onClick={() => toast('Word · Version 2505 (Build 16.0.20430.20182)')}>About Word</button>
                </div>
              </section>
            </div>
          </>
        )
      case 'Options':
        return (
          <>
            <div className="bs-page-head"><h1>Word Options</h1></div>
            <div className="bs-options">
              <nav className="bs-options-nav">
                {['General', 'Display', 'Proofing', 'Save', 'Language', 'Accessibility', 'Advanced', 'Customize Ribbon', 'Quick Access Toolbar', 'Add-ins', 'Trust Center'].map((o) => (
                  <button key={o} className={optionPage === o ? 'active' : ''} onClick={() => setOptionPage(o)}>{o}</button>
                ))}
              </nav>
              <div className="bs-options-body">
                <h2>{optionPage}</h2>
                {optionPage === 'General' && (
                  <>
                    <h4>User Interface options</h4>
                    {['Show Mini Toolbar on selection', 'Show Quick Analysis options on selection', 'Enable Live Preview', 'Update document while typing'].map((o) => (
                      <label key={o} className="bs-check"><input type="checkbox" defaultChecked /> {o}</label>
                    ))}
                    <h4>Personalize your copy of Microsoft Office</h4>
                    <label className="bs-field"><span>User name</span><input defaultValue="Dhairya Shah" /></label>
                    <label className="bs-field"><span>Initials</span><input defaultValue="DS" /></label>
                    <label className="bs-check"><input type="checkbox" /> Always use these values regardless of sign in</label>
                    <h4>Start up options</h4>
                    <label className="bs-check"><input type="checkbox" defaultChecked /> Show the Start screen when this application starts</label>
                  </>
                )}
                {optionPage === 'Display' && (
                  <>
                    <h4>Page display options</h4>
                    {['Show white space between pages in Print Layout view', 'Show highlighter marks', 'Show document tooltips on hover', 'Show picture placeholders', 'Show drawings and text boxes on screen'].map((o) => (
                      <label key={o} className="bs-check"><input type="checkbox" defaultChecked /> {o}</label>
                    ))}
                    <h4>Always show these formatting marks on the screen</h4>
                    {['Tab characters', 'Spaces', 'Paragraph marks', 'Hidden text', 'All formatting marks'].map((o) => (
                      <label key={o} className="bs-check"><input type="checkbox" /> {o}</label>
                    ))}
                  </>
                )}
                {optionPage === 'Proofing' && (
                  <>
                    {['Check spelling as you type', 'Mark grammar errors as you type', 'Frequently confused words', 'Check grammar with spelling', 'Show readability statistics'].map((o) => (
                      <label key={o} className="bs-check"><input type="checkbox" defaultChecked={o !== 'Show readability statistics'} /> {o}</label>
                    ))}
                    <button className="bs-primary" onClick={() => toast('Recheck Document')}>Recheck Document</button>
                  </>
                )}
                {!['General', 'Display', 'Proofing'].includes(optionPage) && (
                  <p className="bs-muted">Settings for {optionPage} appear here.</p>
                )}
                <div className="bs-options-actions">
                  <button className="bs-primary" onClick={() => { toast('Options saved'); setPage('Home') }}>OK</button>
                  <button className="bs-secondary" onClick={() => setPage('Home')}>Cancel</button>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="backstage">
      <div className="backstage-nav">
        <button className="back-btn" onClick={onClose}>
          <ArrowLeft size={18} /> Back
        </button>
        <nav>
          {nav.map((n) => (
            <div key={n.label}>
              {n.divider && <div className="bs-divider" />}
              <button
                className={`bs-item${page === (n.label === 'Get Add-ins' ? 'Add-ins' : n.label) ? ' active' : ''}`}
                onClick={() => {
                  if (n.label === 'Close') {
                    toast('Document closed')
                    onClose()
                  } else if (n.label === 'Save') {
                    saveDocx()
                  } else {
                    setPage(n.label === 'Get Add-ins' ? 'Add-ins' : (n.label as Page))
                  }
                }}
              >
                {n.icon} {n.label}
              </button>
            </div>
          ))}
        </nav>
        <div className="bs-nav-bottom">
          <button className={`bs-item${page === 'Account' ? ' active' : ''}`} onClick={() => setPage('Account')}><User size={17} /> Account</button>
          <button className={`bs-item${page === 'Options' ? ' active' : ''}`} onClick={() => setPage('Options')}><Settings size={17} /> Options</button>
        </div>
      </div>

      <div className="backstage-main">
        {content()}
      </div>
    </div>
  )
}
