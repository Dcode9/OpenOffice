import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--font-render-hinting=none'],
})

const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 })

const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('CONSOLE ' + m.text())
})
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise((r) => setTimeout(r, 1500))

const title = await page.title()
const hasRibbon = !!(await page.$('.ribbon-tabs'))
const hasEditor = !!(await page.$('.ProseMirror'))
const wordCount = await page.$eval('.status-words', (el) => el.textContent).catch(() => null)
const tabCount = await page.$$eval('.ribbon-tab', (els) => els.length)

await page.screenshot({ path: 'shot-home.png' })

// Insert tab
const tabs = await page.$$('.ribbon-tab')
for (const t of tabs) {
  const txt = await t.evaluate((e) => e.textContent)
  if (txt === 'Insert') {
    await t.click()
    break
  }
}
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: 'shot-insert.png' })

// Open File backstage
for (const t of await page.$$('.ribbon-tab')) {
  const txt = await t.evaluate((e) => e.textContent)
  if (txt === 'File') {
    await t.click()
    break
  }
}
await new Promise((r) => setTimeout(r, 500))
const hasBackstage = !!(await page.$('.backstage'))
await page.screenshot({ path: 'shot-file.png' })

// Design tab
await page.keyboard.press('Escape')
await page.evaluate(() => {
  const tabs = [...document.querySelectorAll('.ribbon-tab')]
  const d = tabs.find((t) => t.textContent === 'Design')
  d && d.click()
})
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: 'shot-design.png' })

const result = {
  title,
  hasRibbon,
  hasEditor,
  wordCount,
  tabCount,
  hasBackstage,
  errorCount: errors.length,
  errors: errors.slice(0, 20),
}
fs.writeFileSync('smoke-result.json', JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))

await browser.close()
