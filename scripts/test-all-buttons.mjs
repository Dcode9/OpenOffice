import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const TAB_NAMES = ARGS.length
  ? ARGS
  : ['Home', 'Insert', 'Draw', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View', 'Help']
const FULL_RUN = ARGS.length === 0
const OUT = path.join(process.cwd(), 'verify', 'app')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,900'],
  protocolTimeout: 240000,
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

const allErrors = []
page.on('console', (m) => {
  if (m.type() === 'error') allErrors.push('CONSOLE: ' + m.text())
})
page.on('pageerror', (e) => allErrors.push('PAGEERROR: ' + e.message))

await page.evaluateOnNewDocument(() => {
  window.__downloads = 0
  window.__prints = 0
  window.__fileDialogs = 0
  window.__exec = {}
  window.__fullscreen = 0
  window.__opened = 0
  window.open = () => {
    window.__opened++
    return null
  }
  const origAnchor = HTMLAnchorElement.prototype.click
  HTMLAnchorElement.prototype.click = function () {
    if (this.download) window.__downloads++
    return origAnchor.apply(this, arguments)
  }
  const origInput = HTMLInputElement.prototype.click
  HTMLInputElement.prototype.click = function () {
    if (this.type === 'file') {
      window.__fileDialogs++
      return
    }
    return origInput.apply(this, arguments)
  }
  window.print = () => {
    window.__prints++
  }
  window.prompt = (_m, d) => (d === undefined ? 'Document1' : d)
  window.confirm = () => true
  window.alert = () => {}
  Element.prototype.requestFullscreen = function () {
    window.__fullscreen++
    return Promise.resolve()
  }
  const origExec = document.execCommand.bind(document)
  document.execCommand = (cmd, ...rest) => {
    window.__exec[cmd] = (window.__exec[cmd] || 0) + 1
    try {
      return origExec(cmd, ...rest)
    } catch {
      return false
    }
  }
})

async function reset() {
  await page.evaluate(() => {
    try {
      localStorage.removeItem('openoffice:content')
      localStorage.removeItem('openoffice:page')
    } catch {}
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ribbon-content', { timeout: 15000 })
  await sleep(220)
}

async function clickTab(name) {
  await page.evaluate((n) => {
    const t = [...document.querySelectorAll('.ribbon-tab')].find((x) => x.textContent === n)
    if (t) t.click()
  }, name)
  await sleep(180)
}

async function focusAll(tab) {
  if (tab?.startsWith('Table ')) {
    await page.evaluate(() => {
      const cell = document.querySelector('.ProseMirror td, .ProseMirror th')
      if (!cell) return
      const pos = window.__editor.view.posAtDOM(cell, 0)
      window.__editor.chain().focus().setTextSelection(pos).run()
    })
    await sleep(60)
    return
  }
  const ed = await page.$('.ProseMirror')
  if (ed) {
    await ed.click()
    await page.keyboard.down('Control')
    await page.keyboard.press('a')
    await page.keyboard.up('Control')
    await sleep(60)
  }
}

async function observe() {
  return page.evaluate(() => {
    const ed = document.querySelector('.ProseMirror')
    const pg = document.querySelector('.page-wrap')
    const body = document.querySelector('.doc-body')
    return {
      html: ed ? ed.innerHTML : '',
      marks: ed
        ? ed.querySelectorAll('strong,em,u,s,sub,sup,mark,span[style],a,img,table,div[data-page-break],.toc-entry,.text-box').length
        : 0,
      pageStyle: pg ? pg.getAttribute('style') : '',
      pageColor: pg ? getComputedStyle(pg).backgroundColor : '',
      pageWidth: pg ? Math.round(pg.getBoundingClientRect().width) : 0,
      columns: body ? getComputedStyle(body).columnCount : '',
      toast: document.querySelector('.toast')?.textContent || '',
      popover: !!document.querySelector('.popover'),
      backstage: !!document.querySelector('.backstage'),
      find: !!document.querySelector('.find-panel'),
      nav: !!document.querySelector('.nav-pane'),
      watermark: !!document.querySelector('.watermark'),
      ruler: !!document.querySelector('.ruler'),
      grid: pg ? pg.className : '',
      statusText: document.querySelector('.statusbar')?.textContent || '',
      activeCount: document.querySelectorAll('.rb-small.active,.rb-big.active').length,
      selectionLen: (window.getSelection()?.toString() || '').length,
      downloads: window.__downloads || 0,
      prints: window.__prints || 0,
      fileDialogs: window.__fileDialogs || 0,
      exec: JSON.stringify(window.__exec || {}),
      fullscreen: window.__fullscreen || 0,
      opened: window.__opened || 0,
      zoom: document.querySelector('.zoom-pct')?.textContent || '',
    }
  })
}

function signals(b, a) {
  return {
    html: a.html !== b.html,
    marks: a.marks !== b.marks,
    pageStyle: a.pageStyle !== b.pageStyle,
    pageColor: a.pageColor !== b.pageColor,
    pageWidth: a.pageWidth !== b.pageWidth,
    columns: a.columns !== b.columns,
    toast: a.toast && a.toast !== b.toast,
    backstage: a.backstage !== b.backstage,
    find: a.find !== b.find,
    nav: a.nav !== b.nav,
    watermark: a.watermark !== b.watermark,
    ruler: a.ruler !== b.ruler,
    grid: a.grid !== b.grid,
    statusText: a.statusText !== b.statusText,
    active: a.activeCount !== b.activeCount,
    selection: a.selectionLen !== b.selectionLen,
    download: a.downloads > b.downloads,
    print: a.prints > b.prints,
    fileDialog: a.fileDialogs > b.fileDialogs,
    exec: a.exec !== b.exec,
    fullscreen: a.fullscreen > b.fullscreen,
    opened: a.opened > b.opened,
    zoom: a.zoom !== b.zoom,
    popoverOpened: a.popover && !b.popover,
  }
}

function classify(sig, errs, isDropdown) {
  if (errs.length) return 'ERROR'
  const changed =
    sig.html || sig.marks || sig.pageStyle || sig.pageColor || sig.pageWidth || sig.columns ||
    sig.backstage || sig.find || sig.nav || sig.watermark || sig.ruler || sig.grid ||
    sig.statusText || sig.active || sig.selection || sig.download || sig.print ||
    sig.fileDialog || sig.exec || sig.fullscreen || sig.opened || sig.zoom
  if (changed) return 'PASS'
  if (isDropdown) return 'DROPDOWN'
  if (sig.toast) return 'STUB'
  return 'NO-OP'
}

const results = []
function record(o) {
  results.push(o)
}

async function controlHandles() {
  return page.$$(
    '.ribbon-content .rb-big, .ribbon-content .rb-small, .ribbon-content .combo, .ribbon-content .style-card, .ribbon-content .style-more',
  )
}

async function labelOf(handle) {
  return handle.evaluate((el) => {
    const t = (el.getAttribute('title') || el.getAttribute('aria-label') || el.textContent || '').trim()
    return t.replace(/\s+/g, ' ').slice(0, 80)
  })
}

async function kindOf(handle) {
  return handle.evaluate((el) => {
    if (el.classList.contains('rb-big')) return 'big'
    if (el.classList.contains('rb-small')) return 'small'
    if (el.classList.contains('combo')) return 'combo'
    if (el.classList.contains('style-card')) return 'style'
    if (el.classList.contains('style-more')) return 'style-more'
    return 'control'
  })
}

async function testPopoverItems(tab, triggerIndex, parentLabel) {
  const handles = await controlHandles()
  const trigger = handles[triggerIndex]
  if (!trigger) return
  if (!(await page.$('.popover'))) {
    await trigger.evaluate((el) => el.click())
    await sleep(220)
  }
  if (!(await page.$('.popover'))) return

  const firstCount = (await page.$$('.popover button, .popover .tp-cell')).length
  for (let j = 0; j < firstCount; j++) {
    if (!(await page.$('.popover'))) {
      const hs = await controlHandles()
      await hs[triggerIndex]?.evaluate((el) => el.click())
      await sleep(150)
    }
    const btns = await page.$$('.popover button, .popover .tp-cell')
    if (!btns[j]) continue
    const itemLabel = await btns[j].evaluate((el) => (el.textContent || el.getAttribute('title') || '').trim().replace(/\s+/g, ' ').slice(0, 80))
    const before = await observe()
    const errMark = allErrors.length
    await btns[j].click()
    await sleep(300)
    const after = await observe()
    const errs = allErrors.slice(errMark)
    const sig = signals(before, after)
    const outcome = classify(sig, errs, false)
    record({ tab, label: `${parentLabel} > ${itemLabel || '(item ' + j + ')'}`, kind: 'popover-item', outcome, note: JSON.stringify(sig), error: errs.join(' | ') })
    await page.keyboard.press('Escape')
    await sleep(60)
  }
}

async function resetForTab(tab) {
  await reset()
  if (tab.startsWith('Table ')) {
    await page.evaluate(() => {
      window.__editor.commands.setContent('<p>Table demo</p>')
      window.__editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    })
    await sleep(200)
  }
}

async function testTab(tab) {
  await resetForTab(tab)
  await clickTab(tab)
  await page.screenshot({ path: path.join(OUT, `tab-${tab}.png`) })

  const count = (await controlHandles()).length
  for (let i = 0; i < count; i++) {
    await resetForTab(tab)
    await clickTab(tab)
    const handles = await controlHandles()
    const h = handles[i]
    if (!h) continue
    const label = await labelOf(h)
    const kind = await kindOf(h)
    await focusAll(tab)
    const before = await observe()
    const errMark = allErrors.length
    let clickErr = ''
    try {
      await h.click()
    } catch (e) {
      clickErr = String(e)
    }
    await sleep(300)
    const after = await observe()
    const errs = allErrors.slice(errMark)
    const sig = signals(before, after)
    const outcome = classify(sig, errs, sig.popoverOpened)
    record({ tab, label: `${label} [${i}]`, kind, outcome, note: JSON.stringify(sig), error: (clickErr + ' ' + errs.join(' | ')).trim() })
    if (sig.popoverOpened) {
      await testPopoverItems(tab, i, label)
    }
  }
}

async function testBackstage() {
  const items = []
  await reset()
  await clickTab('File')
  await page.waitForSelector('.backstage', { timeout: 5000 })
  await page.screenshot({ path: path.join(OUT, 'tab-File.png') })
  const labels = await page.$$eval('.bs-item, .bs-card', (els) =>
    els.map((e) => ({ text: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80), cls: e.className })),
  )
  for (let i = 0; i < labels.length; i++) {
    await reset()
    await clickTab('File')
    await page.waitForSelector('.backstage', { timeout: 5000 })
    const els = await page.$$('.bs-item, .bs-card')
    if (!els[i]) continue
    const before = await observe()
    const errMark = allErrors.length
    await els[i].click()
    await sleep(1600)
    const after = await observe()
    const errs = allErrors.slice(errMark)
    const sig = signals(before, after)
    const outcome = classify(sig, errs, false)
    record({ tab: 'File', label: labels[i].text, kind: labels[i].cls.includes('bs-card') ? 'backstage-card' : 'backstage-item', outcome, note: JSON.stringify(sig), error: errs.join(' | ') })
  }
}

async function testStatusBar() {
  const sels = ['.status-icon', '.status-btn', '.zoom-pct', '.zoom-slider']
  for (const sel of sels) {
    await reset()
    const count = (await page.$$(sel)).length
    for (let i = 0; i < count; i++) {
      await reset()
      const els = await page.$$(sel)
      const el = els[i]
      if (!el) continue
      const label = await el.evaluate((e) => (e.getAttribute('title') || e.textContent || e.className).trim().replace(/\s+/g, ' ').slice(0, 60))
      const before = await observe()
      const errMark = allErrors.length
      try {
        if (sel === '.zoom-slider') await el.evaluate((e) => { e.value = '140'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) })
        else await el.click()
      } catch {}
      await sleep(300)
      const after = await observe()
      const errs = allErrors.slice(errMark)
      const sig = signals(before, after)
      record({ tab: 'Status bar', label: `${label} ${i}`, kind: sel.replace('.', ''), outcome: classify(sig, errs, false), note: JSON.stringify(sig), error: errs.join(' | ') })
    }
  }
}

async function testFind() {
  await reset()
  await page.keyboard.down('Control')
  await page.keyboard.press('f')
  await page.keyboard.up('Control')
  await sleep(300)
  await page.type('.find-input', 'Word')
  await sleep(250)
  const before = await observe()
  const errMark = allErrors.length
  const next = await page.$('.find-btn[title="Next"]')
  await next?.click()
  await sleep(200)
  const after = await observe()
  const sig = signals(before, after)
  record({ tab: 'Find', label: 'Find next (query "Word")', kind: 'find', outcome: classify(sig, allErrors.slice(errMark), false), note: JSON.stringify(sig), error: '' })

  const toggle = await page.$$('.find-btn')
  for (const t of toggle) {
    const title = await t.evaluate((e) => e.getAttribute('title') || '')
    if (title === 'Replace') {
      await t.click()
      break
    }
  }
  await sleep(250)
  const replInput = await page.$('.find-row:nth-child(2) .find-input')
  if (replInput) {
    await page.type('.find-row:nth-child(2) .find-input', 'Document')
    const replBtn = await page.$('.find-action')
    const beforeR = await observe()
    const errMarkR = allErrors.length
    await replBtn?.click()
    await sleep(300)
    const afterR = await observe()
    record({ tab: 'Find', label: 'Replace one', kind: 'find', outcome: classify(signals(beforeR, afterR), allErrors.slice(errMarkR), false), note: JSON.stringify(signals(beforeR, afterR)), error: '' })
  }
}

try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForSelector('.ribbon-content', { timeout: 20000 })
  await sleep(500)
  for (const tab of TAB_NAMES) await testTab(tab)
  if (FULL_RUN) {
    await testBackstage()
    await testStatusBar()
    await testFind()
  }
} catch (e) {
  allErrors.push('HARNESS: ' + (e.stack || String(e)))
}

const summary = results.reduce(
  (acc, r) => {
    acc.total++
    acc[r.outcome] = (acc[r.outcome] || 0) + 1
    return acc
  },
  { total: 0 },
)

const report = { generatedAt: new Date().toISOString(), summary, results, errors: allErrors }
const reportName = FULL_RUN ? 'app-report.json' : `app-report-${TAB_NAMES.join('-').toLowerCase()}.json`
fs.writeFileSync(path.join(OUT, reportName), JSON.stringify(report, null, 2))

const byTab = {}
for (const r of results) {
  byTab[r.tab] = byTab[r.tab] || { total: 0, PASS: 0, STUB: 0, 'NO-OP': 0, ERROR: 0, DROPDOWN: 0 }
  byTab[r.tab].total++
  byTab[r.tab][r.outcome] = (byTab[r.tab][r.outcome] || 0) + 1
}
console.log(JSON.stringify({ summary, byTab, errors: allErrors.slice(0, 15) }, null, 2))

console.log('\n--- ERROR / NO-OP / STUB ---')
for (const r of results.filter((x) => x.outcome !== 'PASS' && x.outcome !== 'DROPDOWN')) {
  console.log(`${r.outcome.padEnd(7)} | ${r.tab.padEnd(11)} | ${r.kind.padEnd(12)} | ${r.label}`)
}

await browser.close()
