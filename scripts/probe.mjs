import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const out = path.join(process.cwd(), 'verify', 'app')
fs.mkdirSync(out, { recursive: true })
const dl = path.join(out, 'downloads')
fs.rmSync(dl, { recursive: true, force: true })
fs.mkdirSync(dl, { recursive: true })

const BASELINE = {
  type: 'doc',
  content: [
    { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Alpha Heading' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'The quick brown fox jumps over the lazy dog.' }] },
    { type: 'paragraph', content: [{ type: 'text', text: 'Second paragraph sample text.' }] },
    { type: 'bulletList', content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet one' }] }] }] },
  ],
}
const PAGE = { sizeKey: 'letter', orientation: 'portrait', margins: { top: 96, right: 96, bottom: 96, left: 96 }, columns: 1, pageColor: '#ffffff', watermark: null }

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] })
const ctx = browser.defaultBrowserContext()
await ctx.overridePermissions(URL, ['clipboard-read', 'clipboard-write'])
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errs = []
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) })
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message))
const client = await page.target().createCDPSession()
await client.send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: dl, eventsEnabled: true })
client.on('Browser.downloadWillBegin', (e) => console.log('DL BEGIN', e.suggestedFilename, e.url?.slice(0, 40)))
client.on('Browser.downloadProgress', (e) => { if (e.state === 'completed') console.log('DL DONE', e.guid) })
page.on('filechooser', async (fc) => { console.log('FILECHOOSER', fc.isMultiple()); try { await fc.cancel() } catch {} })

await page.evaluateOnNewDocument((b, p) => {
  localStorage.setItem('openoffice:content', JSON.stringify(b))
  localStorage.setItem('openoffice:page', JSON.stringify(p))
  window.prompt = (msg, def) => (window.__promptResp !== undefined ? window.__promptResp : (def ?? 'Test'))
  window.confirm = () => true
  window.alert = () => {}
  window.print = () => { window.__printed = (window.__printed || 0) + 1 }
  window.__fileClicks = 0
  document.addEventListener('click', (e) => {
    const t = e.target
    if (t && t.tagName === 'INPUT' && t.type === 'file') window.__fileClicks++
    if (t && t.tagName === 'INPUT' && t.type === 'color') window.__colorClicks = (window.__colorClicks || 0) + 1
  }, true)
}, BASELINE, PAGE)

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1000))
const info = await page.evaluate(() => ({
  html: document.querySelector('.ProseMirror')?.innerHTML,
  tabs: [...document.querySelectorAll('.ribbon-tab')].map((e) => e.textContent),
  groups: [...document.querySelectorAll('.ribbon-group-label')].map((e) => e.textContent),
  big: [...document.querySelectorAll('.rb-big')].map((e) => e.textContent.trim()),
  small: [...document.querySelectorAll('.rb-small')].map((e) => e.textContent.trim() || e.title),
  combos: [...document.querySelectorAll('.combo')].map((e) => e.textContent.trim()),
  styles: [...document.querySelectorAll('.style-card')].map((e) => e.title),
  status: [...document.querySelectorAll('.statusbar button')].map((e) => e.title || e.textContent.trim()),
  titlebar: [...document.querySelectorAll('.titlebar button')].map((e) => e.title || e.textContent.trim()),
}))
console.log(JSON.stringify(info, null, 1))

// select all
await page.click('.ProseMirror')
await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control')
await new Promise((r) => setTimeout(r, 200))
console.log('selection', await page.evaluate(() => window.getSelection().toString().length))

// bold
await page.evaluate(() => [...document.querySelectorAll('.rb-small')].find((b) => b.title.startsWith('Bold')).click())
await new Promise((r) => setTimeout(r, 250))
console.log('bold HTML', (await page.$eval('.ProseMirror', (e) => e.innerHTML)).slice(0, 300))

// copy
await page.evaluate(() => document.execCommand('selectAll'))
await page.evaluate(() => [...document.querySelectorAll('.rb-small')].find((b) => b.textContent.includes('Copy')).click())
await new Promise((r) => setTimeout(r, 250))
console.log('clipboard', await page.evaluate(async () => { try { return (await navigator.clipboard.readText()).slice(0, 80) } catch (e) { return 'ERR ' + e.message } }))

// save via titlebar
await page.evaluate(() => document.querySelector('.qat-btn[title^="Save"]').click())
await new Promise((r) => setTimeout(r, 2500))
console.log('downloads', fs.readdirSync(dl))

// prompt link
await page.evaluate(() => { window.__promptResp = 'example.com' })
await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((t) => t.textContent === 'Insert').click())
await new Promise((r) => setTimeout(r, 300))
await page.click('.ProseMirror')
await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control')
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.trim().startsWith('Link')).click())
await new Promise((r) => setTimeout(r, 300))
console.log('link', await page.$$eval('.ProseMirror a', (as) => as.map((a) => [a.href, a.textContent])))

console.log('ERRORS', errs)
await browser.close()
