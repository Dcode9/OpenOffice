import fs from 'fs'
import puppeteer from 'puppeteer-core'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const TABS = ['Home', 'Insert', 'Draw', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View', 'Help']

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1536, height: 900 })
await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 500))

const out = {}
for (const tab of TABS) {
  const data = await page.evaluate((tab) => {
    const tabEl = [...document.querySelectorAll('.ribbon-tab')].find((x) => x.textContent.trim() === tab)
    tabEl?.click()
    const groups = [...document.querySelectorAll('.ribbon-group')].map((g) => ({
      label: g.querySelector('.ribbon-group-label')?.textContent?.trim() || '',
      className: g.className,
      controls: [...g.querySelectorAll('.rb-big, .rb-small')].map((b) => ({
        text: b.textContent.trim(),
        title: b.getAttribute('title') || '',
        cls: b.className,
        disabled: b.disabled,
      })),
    }))
    return { width: document.querySelector('.ribbon')?.scrollWidth, groups }
  }, tab)
  await new Promise((r) => setTimeout(r, 200))
  out[tab] = {
    ...data,
    groups: await page.evaluate(() =>
      [...document.querySelectorAll('.ribbon-group')].map((g) => ({
        label: g.querySelector('.ribbon-group-label')?.textContent?.trim() || '',
        className: g.className,
        controls: [...g.querySelectorAll('.rb-big, .rb-small')].map((b) => ({
          text: b.textContent.trim(),
          title: b.getAttribute('title') || '',
          cls: b.className,
          disabled: b.disabled,
        })),
      })),
    ),
  }
}

fs.writeFileSync('research/word-ui/app-ribbon.json', JSON.stringify(out, null, 2))
for (const [tab, d] of Object.entries(out)) {
  console.log(tab, d.groups.map((g) => `${g.label}(${g.controls.length})`).join(' | '))
}
await browser.close()
