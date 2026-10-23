import puppeteer from 'puppeteer-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errs = []
page.on('pageerror', e => errs.push('PAGEERROR ' + e.message))
page.on('console', m => m.type() === 'error' && errs.push('CONSOLE ' + m.text()))
await page.evaluateOnNewDocument(() => {
  window.prompt = (m, d) => d ?? 'DRAFT'
  window.confirm = () => true
  window.alert = () => {}
  window.print = () => { window.__printed = (window.__printed || 0) + 1 }
})
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 })
await page.waitForSelector('.ProseMirror')
await new Promise(r => setTimeout(r, 700))
async function tab(t) {
  await page.evaluate(t => [...document.querySelectorAll('.ribbon-tab')].find(x => x.textContent.trim() === t)?.click(), t)
  await new Promise(r => setTimeout(r, 250))
}
async function clickLabel(t, label) {
  await tab(t)
  const r = await page.evaluate(label => {
    const els = [...document.querySelectorAll('.ribbon-content .rb-big,.ribbon-content .rb-small')]
    const el = els.find(e => (e.querySelector('.rb-big-label,.rb-small-label')?.textContent || e.title || '').trim() === label)
    if (!el) return false
    el.click(); return true
  }, label)
  await new Promise(r => setTimeout(r, 350))
  return r
}
console.log('before headings', await page.$$eval('.ProseMirror h1', e => e.length))
console.log('toc clicked', await clickLabel('Insert', 'Table of Contents'))
console.log('after toc', await page.evaluate(() => ({ toc: document.querySelectorAll('.ProseMirror .toc-entry').length, title: document.querySelector('.ProseMirror .toc-title')?.textContent, html: document.querySelector('.ProseMirror').innerHTML.slice(-600) })))
await clickLabel('Review', 'Accept')
console.log('accept popover', await page.evaluate(() => [...document.querySelectorAll('.popover .menu-item')].map(x => x.textContent)))
const accept = await page.$('.popover .menu-item')
if (accept) await accept.click()
await new Promise(r => setTimeout(r, 300))
console.log('after accept errors', errs, 'toast', await page.evaluate(() => document.querySelector('.toast')?.textContent))
await tab('Draw')
console.log('draw highlighter clicked', await page.evaluate(() => {
  const el = [...document.querySelectorAll('.rb-big')].find(e => e.textContent.trim() === 'Highlighter')
  el?.click(); return !!el
}))
await new Promise(r => setTimeout(r, 300))
console.log('after draw hl', await page.evaluate(() => ({ mark: document.querySelectorAll('.ProseMirror mark').length, toast: document.querySelector('.toast')?.textContent })), errs)
await tab('Help')
await page.evaluate(() => [...document.querySelectorAll('.rb-big')].find(e => e.textContent.trim() === 'Keyboard Shortcuts')?.click())
await new Promise(r => setTimeout(r, 300))
console.log('after shortcuts', await page.evaluate(() => ({ any: [...document.querySelectorAll('*')].filter(e => /shortcut/i.test(e.textContent || '')).length, toast: document.querySelector('.toast')?.textContent })), errs)
await tab('Layout')
const inputs = await page.$$('.num-input')
console.log('num inputs', inputs.length)
for (let i = 0; i < inputs.length; i++) {
  const before = await page.evaluate(() => ({ indent: document.querySelector('.ProseMirror [data-indent]')?.getAttribute('data-indent') || null, before: getComputedStyle(document.documentElement).getPropertyValue('--doc-para-before'), after: getComputedStyle(document.documentElement).getPropertyValue('--doc-para-after'), toast: document.querySelector('.toast')?.textContent }))
  await inputs[i].click()
  await page.keyboard.down('Control'); await page.keyboard.press('a'); await page.keyboard.up('Control')
  await page.keyboard.type('4')
  await new Promise(r => setTimeout(r, 300))
  const after = await page.evaluate(() => ({ indent: document.querySelector('.ProseMirror [data-indent]')?.getAttribute('data-indent') || null, before: getComputedStyle(document.documentElement).getPropertyValue('--doc-para-before'), after: getComputedStyle(document.documentElement).getPropertyValue('--doc-para-after'), toast: document.querySelector('.toast')?.textContent }))
  console.log('input', i, before, '->', after)
}
await browser.close()
