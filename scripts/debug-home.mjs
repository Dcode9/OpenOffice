import puppeteer from 'puppeteer-core'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] })
await browser.defaultBrowserContext().overridePermissions('http://localhost:5173', ['clipboard-read', 'clipboard-write'])
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
page.on('pageerror', (e) => console.log('PAGEERROR', e.message))
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => Boolean(window.__editor))
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => Boolean(window.__editor))
await sleep(300)

const dump = async (label) => {
  const info = await page.evaluate(() => ({
    text: window.__editor.state.doc.textContent,
    pos: window.__editor.state.selection.from,
    to: window.__editor.state.selection.to,
    painter: document.body.classList.contains('format-painter-active'),
    blocks: [...window.__editor.state.doc.children].map((n) => ({ text: n.textContent, size: n.nodeSize })),
    bold: window.__editor.isActive('bold'),
  }))
  console.log(label, info)
}

await page.evaluate(() => window.__editor.commands.setContent('<p>Styled text</p><p>Target words</p>'))
await sleep(100)
await page.evaluate(() => window.__editor.chain().focus().setTextSelection({ from: 1, to: 7 }).toggleBold().run())
await dump('after bold')
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.getAttribute('title') === 'Format Painter')?.click())
await sleep(200)
await dump('after painter click')
await page.evaluate(() => {
  const e = window.__editor
  e.chain().focus().setTextSelection({ from: 15, to: 21 }).run()
})
await dump('after select target')
await page.evaluate(() => document.querySelector('.ProseMirror').dispatchEvent(new MouseEvent('mouseup', { bubbles: true })))
await sleep(200)
await dump('after mouseup')
console.log(await page.evaluate(() => window.__editor.getHTML()))

// paragraph dialog debug
await page.evaluate(() => window.__editor.commands.setContent('<p>Dialog paragraph sample</p>'))
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.getAttribute('title') === 'Paragraph' && b.classList.contains('ribbon-launcher'))?.click())
await sleep(200)
console.log('dialog?', Boolean(await page.$('.paragraph-dialog')))
const values = await page.evaluate(() => [...document.querySelectorAll('.paragraph-dialog input[type=number]')].map((i) => i.value))
console.log('input values before', values)
await page.evaluate(() => {
  const inputs = document.querySelectorAll('.paragraph-dialog input[type=number]')
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  setter.call(inputs[0], '1')
  inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
  setter.call(inputs[3], '18')
  inputs[3].dispatchEvent(new Event('input', { bubbles: true }))
})
await sleep(100)
console.log('values after', await page.evaluate(() => [...document.querySelectorAll('.paragraph-dialog input[type=number]')].map((i) => i.value)))
await page.evaluate(() => [...document.querySelectorAll('.paragraph-dialog .dialog-btn')].find((b) => b.textContent === 'Apply')?.click())
await sleep(200)
console.log('attrs', await page.evaluate(() => ({ indent: window.__editor.getAttributes('paragraph').indentLeft, before: window.__editor.getAttributes('paragraph').spaceBefore })))

// find replace debug
await page.evaluate(() => window.__editor.commands.setContent('<p>Find me</p>'))
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Find' && b.classList.contains('rb-small'))?.click())
await sleep(200)
console.log('find rows', await page.evaluate(() => document.querySelectorAll('.find-panel .find-row').length))
await page.evaluate(() => document.querySelector('.find-panel .find-btn[title="Close"]')?.click())
await sleep(200)
console.log('panel after close', Boolean(await page.$('.find-panel')))
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Replace' && b.classList.contains('rb-small'))?.click())
await sleep(300)
console.log('replace rows', await page.evaluate(() => document.querySelectorAll('.find-panel .find-row').length))
await browser.close()
