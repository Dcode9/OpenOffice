import puppeteer from 'puppeteer-core'
const b = await puppeteer.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true, args: ['--no-sandbox'] })
const p = await b.newPage()
await p.setViewport({ width: 1536, height: 900 })
const errors = []
p.on('pageerror', (e) => errors.push(String(e)))
p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
await p.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })
await p.waitForSelector('.ribbon-content')
await new Promise((r) => setTimeout(r, 400))

async function openTab(name) {
  const tabs = await p.$$('.ribbon-tab')
  for (const t of tabs) {
    const txt = await t.evaluate((el) => el.textContent.trim())
    if (txt === name) { await t.click(); break }
  }
  await new Promise((r) => setTimeout(r, 350))
}

for (const tab of ['Design', 'Layout', 'References', 'Mailings', 'Review', 'Draw', 'View', 'Help']) {
  await openTab(tab)
  const info = await p.evaluate(() => {
    const rc = document.querySelector('.ribbon-content')
    return {
      scrollW: rc.scrollWidth,
      clientW: rc.clientWidth,
      groups: [...document.querySelectorAll('.ribbon-group')].map((g) => ({
        label: g.querySelector('.ribbon-group-label')?.textContent,
        w: Math.round(g.getBoundingClientRect().width),
      })),
    }
  })
  console.log(tab, JSON.stringify(info))
  await p.screenshot({ path: `verify/app/dark-${tab.toLowerCase()}.png`, clip: { x: 0, y: 0, width: 1536, height: 260 } })
}

await openTab('Design')
const popover = await p.$('.ds-style-gallery, .style-set-gallery')
if (popover) {
  console.log('styleSets', await popover.evaluate((el) => ({ cards: el.children.length, h: el.getBoundingClientRect().height, w: Math.round(el.getBoundingClientRect().width) })))
}
console.log('errors', errors)
await b.close()
