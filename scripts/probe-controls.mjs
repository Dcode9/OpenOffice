import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const OUT = 'verify/app/probe.json'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await new Promise(r => setTimeout(r, 800))
const tabs = ['Home','Insert','Draw','Design','Layout','References','Mailings','Review','View','Help']
const result = {}
for (const tab of tabs) {
  await page.evaluate(t => [...document.querySelectorAll('.ribbon-tab')].find(x => x.textContent.trim() === t)?.click(), tab)
  await new Promise(r => setTimeout(r, 250))
  result[tab] = await page.evaluate(() => {
    const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' }
    const all = [...document.querySelectorAll('.ribbon-content button, .ribbon-content input, .ribbon-content [role=button], .ribbon-content .style-card, .ribbon-content .combo')]
    return all.map((el, i) => {
      const r = el.getBoundingClientRect()
      return {
        i,
        tag: el.tagName,
        cls: el.className?.baseVal ?? el.className,
        type: el.getAttribute('type'),
        title: el.getAttribute('title'),
        text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
        inPopover: !!el.closest('.popover'),
        disabled: !!el.disabled,
        visible: visible(el),
        rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      }
    })
  })
}
await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find(x => x.textContent.trim() === 'File')?.click())
await new Promise(r => setTimeout(r, 250))
result.File = await page.evaluate(() => {
  const sel = '.backstage button, .backstage [role=button], .backstage input'
  return [...document.querySelectorAll(sel)].map((el, i) => ({
    i, tag: el.tagName, cls: el.className?.baseVal ?? el.className,
    text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
  }))
})
result.chrome = await page.evaluate(() => {
  const sel = '.titlebar button, .titlebar input, .statusbar button, .statusbar input, .find-panel button, .find-panel input, .ribbon-collapse'
  return [...document.querySelectorAll(sel)].map((el, i) => ({
    i, tag: el.tagName, cls: el.className?.baseVal ?? el.className,
    title: el.getAttribute('title'), type: el.getAttribute('type'),
    text: (el.innerText || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
  }))
})
fs.writeFileSync(OUT, JSON.stringify(result, null, 2))
console.log(JSON.stringify(Object.fromEntries(Object.entries(result).map(([k,v]) => [k, v.length])), null, 2))
for (const [k,v] of Object.entries(result)) console.log(k, v.map(x => `${x.tag}.${x.cls}|${x.title || x.text}`).join(' || '))
await browser.close()
