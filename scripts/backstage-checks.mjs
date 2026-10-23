import fs from 'fs'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'], protocolTimeout: 120000 })
const page = await browser.newPage()
await page.setViewport({ width: 1536, height: 900 })
const errors = []
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()) })
await page.evaluateOnNewDocument(() => {
  window.prompt = (_m, d) => d || 'Document1'
  window.print = () => {}
  window.open = () => null
})
await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' })
await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((x) => x.textContent.trim() === 'File')?.click())
await page.waitForSelector('.backstage', { timeout: 5000 })
const nav = await page.$$eval('.bs-item', (els) => els.map((e) => e.textContent.trim().replace(/\s+/g, ' ')))
const results = []
for (const label of nav) {
  if (label === 'Close') continue
  const before = await page.evaluate(() => document.querySelector('.backstage')?.textContent?.slice(0, 60) || '')
  await page.evaluate((n) => [...document.querySelectorAll('.bs-item')].find((x) => x.textContent.trim().replace(/\s+/g, ' ') === n)?.click(), label)
  await new Promise((r) => setTimeout(r, 280))
  const state = await page.evaluate(() => ({
    backstage: !!document.querySelector('.backstage'),
    heading: document.querySelector('.backstage-main h1')?.textContent?.trim() || '',
    navActive: document.querySelector('.bs-item.active')?.textContent?.trim() || '',
    changed: document.querySelector('.backstage')?.textContent?.slice(0, 60) || '',
  }))
  results.push({ label, ...state, changedText: state.changed !== before })
}
await page.screenshot({ path: 'verify/app/backstage-last.png' })
console.log(JSON.stringify({ nav, results, errors }, null, 2))
fs.writeFileSync('verify/app/backstage-report.json', JSON.stringify({ nav, results, errors }, null, 2))
await browser.close()
