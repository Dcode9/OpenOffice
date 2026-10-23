import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const URL = 'http://localhost:5173'
const OUT = path.join(process.cwd(), 'verify', 'app')
fs.mkdirSync(OUT, { recursive: true })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
})
await browser.defaultBrowserContext().overridePermissions(URL, ['clipboard-read', 'clipboard-write'])
const page = await browser.newPage()
await page.setViewport({ width: 1440, height: 900 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))
await page.evaluateOnNewDocument(() => {
  window.prompt = (_m, d) => d || 'Test Style'
  window.confirm = () => true
  window.alert = () => {}
  window.print = () => {}
})

const checks = []
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail })

async function reset(content) {
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ribbon-content', { timeout: 15000 })
  await page.waitForFunction(() => Boolean(window.__editor), { timeout: 15000 })
  await sleep(200)
  if (content) {
    await page.evaluate((html) => window.__editor.commands.setContent(html), content)
    await sleep(80)
  }
}

async function selectAll() {
  await page.evaluate(() => {
    const e = window.__editor
    e.chain().focus().setTextSelection({ from: 1, to: e.state.doc.content.size - 1 }).run()
  })
  await sleep(80)
}

async function clickTitle(title, selector = 'button') {
  return page.evaluate(
    ({ title, selector }) => {
      const el = [...document.querySelectorAll(selector)].find((b) => b.getAttribute('title') === title)
      if (!el) return false
      el.click()
      return true
    },
    { title, selector },
  )
}

async function clickText(text, selector = 'button') {
  return page.evaluate(
    ({ text, selector }) => {
      const el = [...document.querySelectorAll(selector)].find((b) => b.textContent.trim() === text)
      if (!el) return false
      el.click()
      return true
    },
    { text, selector },
  )
}

async function clickMenu(text) {
  await sleep(120)
  return page.evaluate((text) => {
    const el = [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim().includes(text))
    if (!el) return false
    el.click()
    return true
  }, text)
}

const attrs = (type) => page.evaluate((t) => window.__editor.getAttributes(t), type)
const active = (name, value) => page.evaluate(({ name, value }) => window.__editor.isActive(name, value), { name, value })
const contentSize = () => page.evaluate(() => window.__editor.state.doc.content.size)
const text = () => page.evaluate(() => window.__editor.state.doc.textContent)

await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 })
await page.waitForSelector('.ribbon-content', { timeout: 20000 })
await page.waitForFunction(() => Boolean(window.__editor), { timeout: 15000 })

// Clipboard
await reset('<p>Alpha beta</p><p>Gamma delta</p>')
await selectAll()
check('Clipboard Copy button exists', await clickTitle('Copy (Ctrl+C)'))
await sleep(350)
await clickTitle('Office Clipboard', 'button.ribbon-launcher')
await sleep(200)
check('Office Clipboard pane opens', Boolean(await page.$('.clipboard-pane')))
check('Office Clipboard has copied item', (await page.$$('.clip-item')).length >= 1)
await page.evaluate(() => document.querySelector('.clipboard-pane .side-pane-close')?.click())
await sleep(100)

await selectAll()
check('Clipboard Paste button exists', await clickTitle('Paste (Ctrl+V)'))
await sleep(500)
check('Paste inserts clipboard content', (await text()).length > 0)

await selectAll()
const beforeCut = (await text()).length
check('Clipboard Cut button exists', await clickTitle('Cut (Ctrl+X)'))
await sleep(400)
check('Cut removes selection', (await text()).length < beforeCut)

await page.evaluate(() => window.__editor.commands.setContent('<p>Styled text</p><p>Target words</p>'))
await page.evaluate(() => {
  const e = window.__editor
  e.chain().focus().setTextSelection({ from: 1, to: 7 }).toggleBold().run()
})
await sleep(100)
check('Format Painter starts', await clickTitle('Format Painter'))
await page.evaluate(() => {
  const e = window.__editor
  e.chain().focus().setTextSelection({ from: 14, to: 20 }).run()
  document.querySelector('.ProseMirror').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
})
await sleep(300)
const painterApplied = await page.evaluate(() => {
  const e = window.__editor
  let found = false
  e.state.doc.descendants((node) => {
    if (node.isText && node.text === 'Target' && node.marks.some((m) => m.type.name === 'bold')) found = true
    return true
  })
  return found
})
check('Format Painter applies copied formatting', painterApplied)

// Font
await reset('<p>Formatting sample text</p>')
await selectAll()
await page.evaluate(() => document.querySelector('.font-combo')?.click())
await clickText('Arial', '.popover .font-item')
await sleep(150)
check('Font family applies', (await attrs('textStyle')).fontFamily === 'Arial')
await page.evaluate(() => document.querySelector('.size-combo')?.click())
await clickText('20', '.popover .font-item')
await sleep(150)
check('Font size applies', String((await attrs('textStyle')).fontSize) === '20')
check('Grow Font button', await clickTitle('Grow Font'))
await sleep(100)
check('Grow Font increments size', String((await attrs('textStyle')).fontSize) === '21')
check('Shrink Font button', await clickTitle('Shrink Font'))
await sleep(100)
check('Shrink Font decrements size', String((await attrs('textStyle')).fontSize) === '20')

check('Change Case menu', await clickTitle('Change Case'))
await clickMenu('UPPERCASE')
await sleep(150)
check('UPPERCASE applies', (await text()).includes('FORMATTING'))
check('Clear Formatting button', await clickTitle('Clear Formatting'))
await sleep(150)
check('Clear Formatting removes font', !(await attrs('textStyle')).fontFamily)

await selectAll()
for (const [button, mark] of [
  ['Bold (Ctrl+B)', 'bold'],
  ['Italic (Ctrl+I)', 'italic'],
  ['Underline (Ctrl+U)', 'underline'],
  ['Strikethrough', 'strike'],
  ['Subscript', 'subscript'],
  ['Superscript', 'superscript'],
]) {
  await clickTitle(button)
  await sleep(80)
  check(`${mark} toggles on`, await active(mark))
  await clickTitle(button)
  await sleep(60)
}
await selectAll()
check('Text Effects menu', await clickTitle('Text Effects and Typography'))
await clickMenu('Shadow')
await sleep(150)
check('Text effect applies', Boolean((await attrs('textStyle')).textShadow))
check('Text Effects menu reopens', await clickTitle('Text Effects and Typography'))
await sleep(180)
check('Text Effects dialog opens', await clickMenu('Text Effects and Typography…'))
await sleep(150)
check('Text Effects dialog visible', Boolean(await page.$('.font-dialog .effect-choice')))
await page.evaluate(() => [...document.querySelectorAll('.font-dialog .dialog-btn')].find((b) => b.textContent === 'Cancel')?.click())

check('Highlight color menu', await clickTitle('Text Highlight Color'))
await page.evaluate(() => document.querySelector('.color-pop .swatch')?.click())
await sleep(150)
check('Highlight applies', Boolean((await attrs('highlight')).color))
check('Font color menu', await clickTitle('Font Color'))
await page.evaluate(() => document.querySelectorAll('.color-pop .swatch')[5]?.click())
await sleep(150)
check('Font color applies', Boolean((await attrs('textStyle')).color))

await reset('<p>Dialog font sample</p>')
await selectAll()
check('Font dialog launcher', await clickTitle('Font', 'button.ribbon-launcher'))
await sleep(150)
check('Font dialog visible', Boolean(await page.$('.font-dialog')))
await page.evaluate(() => {
  const selects = document.querySelectorAll('.font-dialog select')
  selects[1].value = 'Bold Italic'
  selects[1].dispatchEvent(new Event('change', { bubbles: true }))
  selects[2].value = '18'
  selects[2].dispatchEvent(new Event('change', { bubbles: true }))
})
await page.evaluate(() => [...document.querySelectorAll('.font-dialog .dialog-btn')].find((b) => b.textContent === 'Apply')?.click())
await sleep(250)
check('Font dialog applies size', String((await attrs('textStyle')).fontSize) === '18')
check('Font dialog applies bold and italic', (await active('bold')) && (await active('italic')))
await page.evaluate(() => [...document.querySelectorAll('.font-dialog .dialog-btn')].find((b) => b.textContent === 'Cancel')?.click())

// Paragraph
await reset('<p>Second paragraph</p><p>First paragraph</p>')
await selectAll()
check('Bullets button', await clickTitle('Bullets'))
await sleep(120)
check('Bullets toggle list', await active('bulletList'))
await clickTitle('Bullets')
await clickTitle('Numbering')
await sleep(120)
check('Numbering toggle list', await active('orderedList'))
await clickTitle('Numbering')
checks.push({ name: 'Multilevel List button', pass: await clickTitle('Multilevel List') })
await sleep(120)
check('Multilevel List creates list', (await active('orderedList')) || (await active('bulletList')))
await clickTitle('Multilevel List')

await selectAll()
check('Increase Indent', await clickTitle('Increase Indent'))
await sleep(120)
check('Increase Indent sets indent', Number((await attrs('paragraph')).indent) > 0)
check('Decrease Indent', await clickTitle('Decrease Indent'))
await sleep(120)
check('Decrease Indent resets indent', Number((await attrs('paragraph')).indent) === 0)

await reset('<p>Second paragraph</p><p>First paragraph</p>')
await selectAll()
check('Sort menu', await clickTitle('Sort'))
await clickMenu('Sort Ascending')
await sleep(200)
const order = await page.evaluate(() => [...window.__editor.state.doc.children].map((n) => n.textContent))
check('Sort ascending reorders paragraphs', order[0] === 'First paragraph' && order[1] === 'Second paragraph')

check('Show All button', await clickTitle('Show All'))
await sleep(100)
check('Show All renders paragraph marks', await page.$eval('.ProseMirror', (el) => el.classList.contains('show-marks')))
await clickTitle('Show All')

for (const [button, value] of [
  ['Align Left', 'left'],
  ['Center', 'center'],
  ['Align Right', 'right'],
  ['Justify', 'justify'],
]) {
  await clickTitle(button)
  await sleep(80)
  check(`${button} applies`, (await attrs('paragraph')).textAlign === value)
}

await clickTitle('Line and Paragraph Spacing')
await clickMenu('2.0')
await sleep(120)
check('Line spacing applies', String((await attrs('paragraph')).lineHeight) === '2')

await clickTitle('Shading')
await clickMenu('#ffff00')
await sleep(120)
check('Paragraph shading applies', (await attrs('paragraph')).shading === '#ffff00')

for (const border of ['Bottom Border', 'Top Border', 'Left Border', 'Right Border']) {
  await clickTitle('Borders')
  await clickMenu(border)
  await sleep(80)
}
check('Borders apply', String((await attrs('paragraph')).borderSides || '').split(',').length === 4)
await clickTitle('Borders')
await clickMenu('No Border')
await sleep(100)
check('No Border clears borders', !(await attrs('paragraph')).borderSides)

await reset('<p>Dialog paragraph sample</p>')
await selectAll()
check('Paragraph dialog launcher', await clickTitle('Paragraph', 'button.ribbon-launcher'))
await sleep(150)
check('Paragraph dialog visible', Boolean(await page.$('.paragraph-dialog')))
await page.evaluate(() => {
  const inputs = document.querySelectorAll('.paragraph-dialog input[type=number]')
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  setter.call(inputs[0], '1')
  inputs[0].dispatchEvent(new Event('input', { bubbles: true }))
  setter.call(inputs[3], '18')
  inputs[3].dispatchEvent(new Event('input', { bubbles: true }))
})
await page.evaluate(() => [...document.querySelectorAll('.paragraph-dialog .dialog-btn')].find((b) => b.textContent === 'Apply')?.click())
await sleep(200)
check('Paragraph dialog applies indent', Number((await attrs('paragraph')).indentLeft) === 1)
check('Paragraph dialog applies spacing', Number((await attrs('paragraph')).spaceBefore) === 18)
await page.evaluate(() => [...document.querySelectorAll('.paragraph-dialog .dialog-btn')].find((b) => b.textContent === 'Cancel')?.click())

// Styles
await reset('<p>Style sample</p>')
await selectAll()
check('Style gallery Heading', await clickText('Heading', '.style-card'))
await sleep(150)
check('Style gallery applies heading', await active('heading', { level: 1 }))
await page.evaluate(() => document.querySelector('.style-more')?.click())
await clickMenu('Title')
await sleep(200)
check('More styles applies Title formatting', String((await attrs('textStyle')).fontSize) === '37')
await page.evaluate(() => document.querySelector('.style-more')?.click())
await clickMenu('Create a Style')
await sleep(250)
check('Create a Style adds custom style', (await page.$eval('.styles-pane', (el) => el.textContent)).includes('New Style'))
await page.evaluate(() => document.querySelector('.styles-pane .side-pane-close')?.click())

await page.evaluate(() => document.querySelector('.styles-gallery button.style-card')?.click())
await sleep(100)
check('Styles launcher opens pane', await clickTitle('Styles', 'button.ribbon-launcher'))
await sleep(150)
check('Styles pane visible', Boolean(await page.$('.styles-pane')))
await page.evaluate(() => document.querySelector('.styles-pane .side-pane-close')?.click())

// Editing
await reset('<p>Find and replace sample</p>')
check('Find button opens panel', await clickTitle('Find'))
await sleep(200)
check('Find panel visible', Boolean(await page.$('.find-panel')))
await page.evaluate(() => document.querySelector('.find-panel .find-btn[title=Close]')?.click())
check('Replace button opens panel', await clickTitle('Replace'))
await sleep(200)
check('Replace row visible', (await page.$$('.find-panel .find-row')).length >= 2)
await page.evaluate(() => document.querySelector('.find-panel .find-btn[title=Close]')?.click())

await page.evaluate(() => window.__editor.commands.setContent('<p>Select all target</p>'))
check('Select menu', await clickTitle('Select'))
await clickMenu('Select All')
await sleep(120)
check('Select All selects document', await page.evaluate(() => {
  const s = window.__editor.state.selection
  return s.from <= 1 && s.to >= window.__editor.state.doc.content.size - 1
}))

await page.evaluate(() => window.__editor.commands.setContent('<p>Object mode</p><img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNEE5RUZGIi8+PC9zdmc+" />'))
await sleep(150)
check('Select Objects menu', await clickTitle('Select'))
await clickMenu('Select Objects')
await sleep(100)
await page.evaluate(() => document.querySelector('.ProseMirror img')?.dispatchEvent(new MouseEvent('click', { bubbles: true })))
await sleep(150)
check('Select Objects selects image', await page.evaluate(() => window.__editor.state.selection.node?.type.name === 'image'))

check('Add-ins button handled', await clickTitle('Add-ins'))
await sleep(100)
check('Add-ins reports web limitation', await page.evaluate(() => document.querySelector('.toast')?.textContent?.includes('web-based')))

await reset()
await page.screenshot({ path: path.join(OUT, 'home-functional.png'), fullPage: false })
const failed = checks.filter((c) => !c.pass)
const report = {
  total: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  errors,
  checks,
}
fs.writeFileSync(path.join(OUT, 'home-checks.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ total: report.total, passed: report.passed, failed: report.failed, errors, failedChecks: failed }, null, 2))
await browser.close()
if (failed.length || errors.length) process.exitCode = 1
