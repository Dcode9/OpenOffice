import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const out = {}

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox', '--force-device-scale-factor=1'] })
const page = await browser.newPage()
await page.setViewport({ width: 1536, height: 900, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

async function reset() {
  try { await page.evaluate(() => localStorage.clear()) } catch {}
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ribbon-content')
  await sleep(350)
}
async function tab(name) {
  await page.evaluate((x) => [...document.querySelectorAll('.ribbon-tab')].find((t) => t.textContent === x)?.click(), name)
  await sleep(250)
}
async function clickStyle(label) {
  await page.evaluate(() => document.querySelector('.style-more')?.click())
  await sleep(200)
  await page.evaluate((l) => [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim() === l)?.click(), label)
  await sleep(450)
}

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForSelector('.ribbon-content', { timeout: 20000 })
await sleep(500)

await page.screenshot({ path: 'verify/app/dark-full.png' })
await page.screenshot({ path: 'verify/app/dark-top.png', clip: { x: 0, y: 0, width: 1536, height: 250 } })

out.metrics = await page.evaluate(() => {
  const box = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }
  }
  return {
    titlebar: box('.titlebar'),
    tabs: box('.ribbon-tabs'),
    ribbon: box('.ribbon-content'),
    canvas: box('.canvas'),
    page: box('.page-wrap'),
    status: box('.statusbar'),
    search: box('.search-box'),
    title: box('.titlebar-title'),
  }
})

await reset()
await page.click('.ProseMirror p:first-child')
await clickStyle('Title')
out.titleStyle = await page.$eval('.ProseMirror', (e) => {
  const p = e.querySelector('p')
  const span = p?.querySelector('span')
  return { text: p?.textContent.slice(0, 20), style: span?.getAttribute('style') || p?.getAttribute('style'), html: p?.outerHTML.slice(0, 180) }
})

await reset()
await page.click('.ProseMirror p:first-child')
await clickStyle('Subtitle')
out.subtitleStyle = await page.$eval('.ProseMirror', (e) => {
  const p = e.querySelector('p')
  const span = p?.querySelector('span')
  return { style: span?.getAttribute('style') || p?.getAttribute('style'), html: p?.outerHTML.slice(0, 180) }
})

await reset()
await tab('View')
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.includes('Web Layout'))?.click())
await sleep(500)
out.webLayout = await page.evaluate(() => {
  const c = document.querySelector('.canvas')
  const p = document.querySelector('.page-wrap')
  return {
    webClass: c?.classList.contains('web-mode'),
    pageW: p?.getBoundingClientRect().width,
    canvasW: c?.getBoundingClientRect().width,
    rulerVisible: !!document.querySelector('.ruler-strip'),
    shadow: p ? getComputedStyle(p).boxShadow : null,
  }
})
await page.screenshot({ path: 'verify/app/dark-web.png' })

await reset()
await tab('View')
await page.evaluate(() => [...document.querySelectorAll('.rb-small')].find((b) => b.textContent.includes('Page Width'))?.click())
await sleep(400)
out.pageWidthZoom = await page.$eval('.page-wrap', (e) => ({ zoom: e.style.zoom, width: e.getBoundingClientRect().width }))

await reset()
await tab('Help')
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find((b) => b.textContent.includes('Keyboard Shortcuts'))?.click())
await sleep(350)
out.shortcuts = await page.evaluate(() => ({
  open: !!document.querySelector('.word-modal'),
  title: document.querySelector('.word-modal h2')?.textContent,
  rows: document.querySelectorAll('.shortcut-row').length,
}))
await page.screenshot({ path: 'verify/app/dark-shortcuts.png' })

await reset()
out.dark = await page.evaluate(() => {
  const cs = (sel, prop) => {
    const el = document.querySelector(sel)
    return el ? getComputedStyle(el)[prop] : null
  }
  return {
    titlebar: cs('.titlebar', 'backgroundColor'),
    ribbon: cs('.ribbon-content', 'backgroundColor'),
    canvas: cs('.canvas', 'backgroundColor'),
    status: cs('.statusbar', 'backgroundColor'),
    page: cs('.page-wrap', 'backgroundColor'),
    doc: cs('.ProseMirror', 'color'),
    fileTabBg: cs('.file-tab', 'backgroundColor'),
  }
})

out.errors = errors
console.log(JSON.stringify(out, null, 2))
await browser.close()

