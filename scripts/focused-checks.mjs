import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.evaluateOnNewDocument(() => {
  window.prompt = (_m, d) => (d === undefined || d === '' ? 'https://example.com' : d)
  window.confirm = () => true
  window.print = () => {}
})

async function reset() {
  try {
    await page.evaluate(() => { localStorage.clear() })
  } catch {}
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ribbon-content')
  await sleep(300)
}
async function tab(n) {
  await page.evaluate((x) => [...document.querySelectorAll('.ribbon-tab')].find((t) => t.textContent === x)?.click(), n)
  await sleep(200)
}
async function selAll() {
  await page.click('.ProseMirror')
  await page.keyboard.down('Control')
  await page.keyboard.press('a')
  await page.keyboard.up('Control')
  await sleep(100)
}
const text = () => page.$eval('.ProseMirror', (e) => e.textContent)
const html = () => page.$eval('.ProseMirror', (e) => e.innerHTML)

const out = {}

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForSelector('.ribbon-content', { timeout: 20000 })

// 1. Change case
await reset(); await selAll()
out.changeCaseBefore = (await text()).slice(0, 60)
await page.evaluate(() => [...document.querySelectorAll('.rb-small')].find((b) => b.title === 'Change Case')?.click())
await sleep(300)
await page.evaluate(() => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.includes('lowercase'))?.click())
await sleep(400)
out.changeCaseAfterLower = (await text()).slice(0, 60)
out.changeCaseChanged = out.changeCaseBefore !== out.changeCaseAfterLower

// 2. Title style
await reset(); await selAll()
const beforeTitle = await html()
await page.evaluate(() => document.querySelector('.style-more')?.click())
await sleep(200)
await page.evaluate(() => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim() === 'Title')?.click())
await sleep(400)
const afterTitle = await html()
out.titleStyleChanged = beforeTitle !== afterTitle
out.titleMarkup = await page.$eval('.ProseMirror', (e) => {
  const first = e.querySelector('p, h1, h2')
  const span = first?.querySelector('span')
  return first ? { tag: first.tagName, cls: first.className, style: first.getAttribute('style'), span: span?.getAttribute('style') } : null
})

// 3. Subtitle style
await reset(); await selAll()
const beforeSub = await html()
await page.evaluate(() => document.querySelector('.style-more')?.click())
await sleep(200)
await page.evaluate(() => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim() === 'Subtitle')?.click())
await sleep(400)
out.subtitleStyleChanged = beforeSub !== (await html())

// 4. Link
await reset(); await tab('Insert'); await selAll()
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith('Link'))?.click())
await sleep(500)
out.linkAnchors = await page.$$eval('.ProseMirror a', (els) => els.map((e) => ({ href: e.getAttribute('href'), text: e.textContent.slice(0, 30) })))

// 5. Header / Footer / Page Number
await reset(); await tab('Insert')
async function bigMenu(label, item) {
  await page.evaluate((x) => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith(x))?.click(), label)
  await sleep(150)
  await page.evaluate((x) => [...document.querySelectorAll('.popover .menu-item')].find((m) => m.textContent.includes(x))?.click(), item)
  await sleep(250)
}
await bigMenu('Header', 'Blank Header')
out.headerRendered = !!(await page.$('.hf-header'))
await bigMenu('Footer', 'Blank Footer')
out.footerRendered = !!(await page.$('.hf-footer'))
await bigMenu('Page Number', 'Plain Number')
out.pageNumberRendered = !!(await page.$('.page-num'))

// 6. Watermark text changes
await reset(); await tab('Design')
async function wm(label) {
  await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith('Watermark'))?.click())
  await sleep(250)
  await page.evaluate((l) => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim() === l)?.click(), label)
  await sleep(300)
  return page.$eval('.watermark', (e) => e.textContent).catch(() => null)
}
out.wmDraft = await wm('DRAFT')
out.wmConfidential = await wm('CONFIDENTIAL')

// 7. Margins change body padding
await reset(); await tab('Layout')
const pad0 = await page.$eval('.doc-body', (e) => getComputedStyle(e).paddingLeft)
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith('Margins'))?.click())
await sleep(250)
await page.evaluate(() => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim() === 'Wide')?.click())
await sleep(300)
const pad1 = await page.$eval('.doc-body', (e) => getComputedStyle(e).paddingLeft)
out.margins = { before: pad0, afterWide: pad1, changed: pad0 !== pad1 }

// 8. Page size + orientation
await reset(); await tab('Layout')
const w0 = await page.$eval('.page-wrap', (e) => Math.round(e.getBoundingClientRect().width))
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith('Size'))?.click())
await sleep(200)
await page.evaluate(() => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.includes('A4'))?.click())
await sleep(300)
const w1 = await page.$eval('.page-wrap', (e) => Math.round(e.getBoundingClientRect().width))
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith('Orientation'))?.click())
await sleep(300)
const w2 = await page.$eval('.page-wrap', (e) => Math.round(e.getBoundingClientRect().width))
out.pageSize = { letter: w0, a4: w1, afterOrientation: w2 }

// 9. Zoom slider (native setter)
await reset()
const z0 = await page.$eval('.zoom-pct', (e) => e.textContent)
await page.evaluate(() => {
  const el = document.querySelector('.zoom-slider')
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '140')
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await sleep(350)
out.zoom = { before: z0, after: await page.$eval('.zoom-pct', (e) => e.textContent) }

// 10. Web layout / keyboard shortcuts
await reset(); await tab('View')
const canvasBefore = await page.$eval('.canvas', (e) => e.className)
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim() === 'Web Layout')?.click())
await sleep(300)
out.webLayout = { before: canvasBefore, after: await page.$eval('.canvas', (e) => e.className) }
await tab('Help')
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.includes('Keyboard Shortcuts'))?.click())
await sleep(400)
out.shortcutsPanel = !!(await page.$('.word-modal, .shortcuts, .modal, .dialog'))

// 11. Select all / indent idempotence / default presets
await reset(); await selAll()
out.selectAllSelectionLen = await page.evaluate(() => (window.getSelection()?.toString() || '').length)
await reset(); await selAll()
const ind0 = await page.$eval('.doc-body', (e) => getComputedStyle(e).paddingLeft)
await page.evaluate(() => [...document.querySelectorAll('.rb-small')].find((b) => b.title === 'Decrease Indent')?.click())
await sleep(250)
out.decreaseIndentAtZero = { before: ind0, after: await page.$eval('.doc-body', (e) => getComputedStyle(e).paddingLeft) }

out.errors = errors
console.log(JSON.stringify(out, null, 2))
await browser.close()

