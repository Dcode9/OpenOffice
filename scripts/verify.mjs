import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const dlDir = path.join(process.cwd(), 'downloads')
fs.rmSync(dlDir, { recursive: true, force: true })
fs.mkdirSync(dlDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })

const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE ' + m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))

const client = await page.target().createCDPSession()
await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dlDir, eventsEnabled: true })
await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dlDir }).catch(() => {})

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1200))

const report = {}

// --- are Styles + Editing visible within the ribbon? ---
report.ribbonFitsStyles = await page.evaluate(() => {
  const g = [...document.querySelectorAll('.ribbon-group-label')].map((e) => e.textContent)
  const rects = [...document.querySelectorAll('.ribbon-group')].map((el) => ({
    label: el.querySelector('.ribbon-group-label')?.textContent,
    right: Math.round(el.getBoundingClientRect().right),
  }))
  const styles = document.querySelector('.styles-gallery')
  const r = styles?.getBoundingClientRect()
  return { groups: g, rects, stylesVisible: !!r && r.right <= window.innerWidth + 2, stylesRight: r && Math.round(r.right), innerWidth: window.innerWidth }
})

// --- apply Heading 1 to whole doc ---
await page.evaluate(() => {
  const card = [...document.querySelectorAll('.style-card')].find((c) => c.getAttribute('title') === 'Heading 1')
  card && card.click()
})
await new Promise((r) => setTimeout(r, 300))
report.headingsAfterStyle = await page.$$eval('.ProseMirror h1', (e) => e.length)

// --- undo it back (Ctrl+Z) ---
await page.keyboard.down('Control')
await page.keyboard.press('z')
await page.keyboard.up('Control')
await new Promise((r) => setTimeout(r, 200))

// --- Insert a table ---
await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((t) => t.textContent === 'Insert').click())
await new Promise((r) => setTimeout(r, 300))
await page.evaluate(() => {
  const b = [...document.querySelectorAll('.rb-big')].find((x) => x.textContent.trim().startsWith('Table'))
  b && b.click()
})
await new Promise((r) => setTimeout(r, 300))
await page.evaluate(() => document.querySelectorAll('.tp-cell')[34]?.click())
await new Promise((r) => setTimeout(r, 300))
report.tableInserted = await page.$$eval('.ProseMirror table', (e) => e.length)

// --- Find panel ---
await page.keyboard.down('Control')
await page.keyboard.press('f')
await page.keyboard.up('Control')
await new Promise((r) => setTimeout(r, 300))
await page.type('.find-input', 'Word')
await new Promise((r) => setTimeout(r, 300))
report.findPanel = await page.$eval('.find-panel', (e) => !!e).catch(() => false)
report.findCount = await page.$eval('.find-count', (e) => e.textContent).catch(() => null)
await page.screenshot({ path: 'shot-find.png' })
await page.evaluate(() => document.querySelector('.find-btn[title="Close"]')?.click())

// --- Design tab screenshot ---
await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((t) => t.textContent === 'Design').click())
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: 'shot-design.png' })

// --- Home screenshot (refined) ---
await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((t) => t.textContent === 'Home').click())
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: 'shot-home.png' })

// --- Export a real .docx (validate serializer via module import) ---
report.exportTest = await page.evaluate(async () => {
  try {
    const mod = await import('/src/lib/docx.ts')
    const json = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Title' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello ', marks: [{ type: 'bold' }] }, { type: 'text', text: 'world' }] },
        { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item' }] }] }] },
      ],
    }
    const blob = await mod.exportDocx(json, 'Verify')
    const buf = new Uint8Array(await blob.arrayBuffer())
    const sig = Array.from(buf.slice(0, 4)).map((b) => b.toString(16).padStart(2, '0')).join('')
    const file = new File([blob], 'Verify.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const imported = await mod.importDocx(file)
    return { ok: true, size: buf.length, sig, roundTripHasHello: /Hello/.test(imported.html) && /world/.test(imported.html) }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
})

report.errors = errors.slice(0, 20)
report.errorCount = errors.length

fs.writeFileSync('verify-result.json', JSON.stringify(report, null, 2))
console.log(JSON.stringify(report, null, 2))
await browser.close()
