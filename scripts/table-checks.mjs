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
const page = await browser.newPage()
await page.setViewport({ width: 1536, height: 900 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push('CONSOLE: ' + m.text()))
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message))

await page.goto(URL, { waitUntil: 'domcontentloaded' })
await page.waitForFunction(() => Boolean(window.__editor), { timeout: 15000 })

const checks = []
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail })

async function resetTable(rows = 3, cols = 3) {
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForSelector('.ribbon-content', { timeout: 15000 })
  await page.waitForFunction(() => Boolean(window.__editor), { timeout: 15000 })
  await sleep(200)
  await page.evaluate(
    ({ rows, cols }) => {
      window.__editor.commands.setContent('<p>Table demo</p>')
      window.__editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
    },
    { rows, cols },
  )
  await sleep(220)
}

async function openTab(name) {
  await page.evaluate((name) => {
    ;[...document.querySelectorAll('.ribbon-tab')].find((b) => b.textContent.trim() === name)?.click()
  }, name)
  await sleep(220)
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

async function clickMenu(text) {
  await sleep(120)
  return page.evaluate((text) => {
    const el = [...document.querySelectorAll('.popover .menu-item')].find((b) => b.textContent.trim().includes(text))
    if (!el) return false
    el.click()
    return true
  }, text)
}

const tableAttrs = () => page.evaluate(() => window.__editor.getAttributes('table'))
const cellAttrs = () =>
  page.evaluate(() => ({ ...window.__editor.getAttributes('tableHeader'), ...window.__editor.getAttributes('tableCell') }))
const tableStats = () =>
  page.evaluate(() => {
    const table = document.querySelector('.ProseMirror table')
    if (!table) return null
    const rows = [...table.querySelectorAll('tr')]
    return {
      rows: rows.length,
      cols: rows[0]?.children.length || 0,
      cellCount: table.querySelectorAll('td, th').length,
      tableWidth: Math.round(table.getBoundingClientRect().width),
      firstCellWidth: Math.round(table.querySelector('td, th')?.getBoundingClientRect().width || 0),
    }
  })

// 1. Contextual tabs and options
await resetTable()
const tabsInTable = await page.$$eval('.ribbon-tab', (els) => els.map((e) => e.textContent.trim()))
check('Table Design tab appears after View', tabsInTable.indexOf('Table Design') === tabsInTable.indexOf('View') + 1)
check('Table Layout tab follows Table Design', tabsInTable.indexOf('Table Layout') === tabsInTable.indexOf('Table Design') + 1)
check('Table tabs before Help', tabsInTable.indexOf('Table Layout') < tabsInTable.indexOf('Help'))
await openTab('Table Design')
check('Table Design tab activates', await page.$$eval('.ribbon-tab.active', (els) => els.some((e) => e.textContent.trim() === 'Table Design')))
const optionLabels = await page.$$eval('.table-options-ribbon label', (els) => els.map((e) => e.textContent.trim()))
check(
  'Table Style Options show six checkboxes',
  ['Header Row', 'Total Row', 'Banded Rows', 'First Column', 'Last Column', 'Banded Columns'].every((l) => optionLabels.includes(l)),
  optionLabels.join(', '),
)
const galleryCards = await page.$$eval('.table-styles-strip .table-style-card', (els) => els.length)
check('Table Styles gallery is inline in ribbon', galleryCards === 26, `cards=${galleryCards}`)
const groupsVisible = await page.$$eval('.ribbon-group', (els) =>
  els.every((e) => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0),
)
check('Table Design ribbon groups are visible', groupsVisible)

const bandedBefore = (await tableAttrs()).bandedRows
await page.evaluate(() => {
  const label = [...document.querySelectorAll('.table-options-ribbon label')].find((l) => l.textContent.includes('Banded Rows'))
  label?.querySelector('input')?.click()
})
await sleep(200)
const bandedAfter = await page.evaluate(() => {
  const label = [...document.querySelectorAll('.table-options-ribbon label')].find((l) => l.textContent.includes('Banded Rows'))
  return { attr: window.__editor.getAttributes('table').bandedRows, checked: label?.querySelector('input')?.checked }
})
check('Banded Rows checkbox changes table attr', bandedBefore === true && bandedAfter.attr === false)
check('Banded Rows checkbox reflects new state', bandedAfter.checked === false)
await page.evaluate(() => {
  const label = [...document.querySelectorAll('.table-options-ribbon label')].find((l) => l.textContent.includes('Banded Rows'))
  label?.querySelector('input')?.click()
})
await sleep(150)

const blueCard = await page.$('.table-style-card[title="Grid, Blue, Medium"]')
check('Blue Medium style card exists', Boolean(blueCard))
await page.evaluate(() => document.querySelector('.table-style-card[title="Grid, Blue, Medium"]')?.click())
await sleep(250)
const styled = await page.evaluate(() => {
  const t = document.querySelector('.ProseMirror table')
  const th = document.querySelector('.ProseMirror th')
  return {
    style: t?.dataset.tableStyle,
    accent: t?.dataset.tableAccent,
    intensity: t?.dataset.tableIntensity,
    headerBg: th ? getComputedStyle(th).backgroundColor : '',
  }
})
check('Applying table style updates table attrs', styled.style === 'grid' && styled.accent === '#4472C4' && styled.intensity === 'medium')
check('Header row uses theme tint', styled.headerBg !== 'rgb(242, 242, 242)' && styled.headerBg !== 'rgba(0, 0, 0, 0)', styled.headerBg)
await page.screenshot({ path: path.join(OUT, 'table-design.png') })

// 2. Borders and shading
await clickTitle('Borders')
await clickMenu('All Borders')
await sleep(200)
const border = await page.evaluate(() => {
  const td = document.querySelector('.ProseMirror td')
  return { attr: td.getAttribute('data-cell-border-top'), computed: getComputedStyle(td).borderTop }
})
check('All Borders writes cell border attribute', border.attr === '1pt solid #000000', border.attr)
check('Cell border renders computed style', border.computed.includes('1px'), border.computed)

await clickTitle('Shading')
await sleep(150)
const swatches = await page.$$eval('.popover .swatch', (els) => els.length)
check('Shading palette has theme colors', swatches >= 40, `swatches=${swatches}`)
await page.evaluate(() => document.querySelector('.popover .swatch[title="#ffc000"]')?.click())
await sleep(220)
const shading = await page.evaluate(() => {
  const th = document.querySelector('.ProseMirror th')
  return { attr: th.getAttribute('data-cell-shading'), computed: getComputedStyle(th).backgroundColor }
})
check('Cell shading writes attribute', shading.attr === '#ffc000', shading.attr)
check('Cell shading renders background', shading.computed.includes('255, 192, 0') || shading.computed.includes('1 0.75'), shading.computed)
await page.screenshot({ path: path.join(OUT, 'table-style-applied.png') })

// 2b. Borders and Shading dialog
await clickTitle('Borders and Shading')
await sleep(220)
check('Borders and Shading dialog opens from group launcher', Boolean(await page.$('.borders-shading-dialog')))
const bsTabs = await page.$$eval('.borders-shading-dialog .dialog-tab', (els) => els.map((e) => e.textContent.trim()))
check('Borders and Shading dialog has Borders and Shading tabs', bsTabs.join(',') === 'Borders,Shading', bsTabs.join(','))
await page.evaluate(() => {
  const all = [...document.querySelectorAll('.borders-setting-list label')].find((l) => l.textContent.trim() === 'All')
  all?.querySelector('input')?.click()
})
await sleep(150)
await page.screenshot({ path: path.join(OUT, 'borders-shading.png') })
await page.evaluate(() => [...document.querySelectorAll('.borders-shading-dialog .dialog-btn')].find((b) => b.textContent.trim() === 'OK')?.click())
await sleep(250)
const dialogBorders = await page.evaluate(() => {
  const td = document.querySelector('.ProseMirror td')
  const th = document.querySelector('.ProseMirror th')
  return {
    top: td?.getAttribute('data-cell-border-top'),
    bottom: td?.getAttribute('data-cell-border-bottom'),
    headerTop: th?.getAttribute('data-cell-border-top'),
  }
})
check(
  'Borders dialog All sets outer and inner cell borders',
  dialogBorders.top?.includes('solid') && dialogBorders.bottom?.includes('solid') && dialogBorders.headerTop?.includes('solid'),
  JSON.stringify(dialogBorders),
)

await clickTitle('Borders and Shading')
await sleep(200)
await page.evaluate(() => {
  const tab = [...document.querySelectorAll('.borders-shading-dialog .dialog-tab')].find((b) => b.textContent.trim() === 'Shading')
  tab?.click()
})
await sleep(120)
await page.evaluate(() => document.querySelector('.borders-shading-dialog .swatch[title="#ffc000"]')?.click())
await sleep(100)
await page.evaluate(() => [...document.querySelectorAll('.borders-shading-dialog .dialog-btn')].find((b) => b.textContent.trim() === 'OK')?.click())
await sleep(250)
const dialogShading = await page.evaluate(() => {
  const cells = [...document.querySelectorAll('.ProseMirror td, .ProseMirror th')]
  return {
    count: cells.length,
    shaded: cells.filter((c) => c.getAttribute('data-cell-shading') === '#ffc000').length,
  }
})
check('Borders dialog Shading fills the whole table', dialogShading.count > 0 && dialogShading.shaded === dialogShading.count, JSON.stringify(dialogShading))

// 3. Column resize
const boundary = await page.$eval('.ProseMirror th', (e) => {
  const r = e.getBoundingClientRect()
  return { x: r.right, y: r.top + r.height / 2 }
})
let handleFound = false
for (const dx of [-2, -4, -1, -6, 0]) {
  await page.mouse.move(boundary.x + dx, boundary.y)
  await sleep(80)
  handleFound = Boolean(await page.$('.ProseMirror .column-resize-handle'))
  if (handleFound) break
}
const beforeResize = await tableStats()
if (handleFound) {
  const box = await page.$eval('.ProseMirror .column-resize-handle', (e) => {
    const r = e.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  })
  await page.mouse.move(box.x, box.y)
  await page.mouse.down()
  await page.mouse.move(box.x + 60, box.y, { steps: 10 })
  await page.mouse.up()
  await sleep(300)
}
const afterResize = await tableStats()
check('Column resize handle appears on column edge', handleFound)
check('Dragging column edge resizes first column', afterResize && beforeResize && afterResize.firstCellWidth > beforeResize.firstCellWidth + 30, `${beforeResize?.firstCellWidth} -> ${afterResize?.firstCellWidth}`)

// 4. Table Layout: select, insert, delete, merge/split
await openTab('Table Layout')
check('Table Layout tab activates', await page.$$eval('.ribbon-tab.active', (els) => els.some((e) => e.textContent.trim() === 'Table Layout')))
await clickTitle('Select')
await clickMenu('Select Row')
await sleep(180)
const rowSelected = await page.evaluate(() => window.__editor.state.selection.constructor.name)
check('Select Row creates a cell selection', rowSelected.includes('CellSelection'), rowSelected)

let stats = await tableStats()
await clickTitle('Insert Below')
await sleep(180)
const statsAfterInsertRow = await tableStats()
check('Insert Below adds a row', statsAfterInsertRow.rows === stats.rows + 1, `${stats.rows} -> ${statsAfterInsertRow.rows}`)
await clickTitle('Insert Right')
await sleep(180)
const statsAfterInsertCol = await tableStats()
check('Insert Right adds a column', statsAfterInsertCol.cols === statsAfterInsertRow.cols + 1, `${statsAfterInsertRow.cols} -> ${statsAfterInsertCol.cols}`)

await clickTitle('Select')
await clickMenu('Select Row')
await sleep(150)
await clickTitle('Delete')
await clickMenu('Delete Rows')
await sleep(180)
check('Delete Rows removes a row', (await tableStats()).rows === statsAfterInsertCol.rows - 1)

await page.evaluate(() => {
  const cells = document.querySelectorAll('.ProseMirror td, .ProseMirror th')
  const editor = window.__editor
  const pos1 = editor.view.posAtDOM(cells[0], 0) - 1
  const pos2 = editor.view.posAtDOM(cells[1], 0) - 1
  editor.chain().focus().setCellSelection({ anchorCell: pos1, headCell: pos2 }).run()
})
await sleep(150)
const beforeMerge = await tableStats()
await clickTitle('Merge Cells')
await sleep(200)
const afterMerge = await tableStats()
check('Merge Cells reduces cell count', afterMerge.cellCount < beforeMerge.cellCount, `${beforeMerge.cellCount} -> ${afterMerge.cellCount}`)
await clickTitle('Split Cells')
await sleep(200)
const afterSplit = await tableStats()
check('Split Cells restores cell count', afterSplit.cellCount === beforeMerge.cellCount, `${afterMerge.cellCount} -> ${afterSplit.cellCount}`)

await resetTable(4, 3)
await openTab('Table Layout')
await page.evaluate(() => {
  const cells = document.querySelectorAll('.ProseMirror td')
  const editor = window.__editor
  const pos = editor.view.posAtDOM(cells[3], 0)
  editor.chain().focus().setTextSelection(pos).run()
})
await sleep(180)
const tablesBeforeSplit = await page.evaluate(() => window.__editor.state.doc.content.content.filter((n) => n.type.name === 'table').length)
await clickTitle('Split Table')
await sleep(250)
const tablesAfterSplit = await page.evaluate(() => window.__editor.state.doc.content.content.filter((n) => n.type.name === 'table').length)
check('Split Table creates a second table', tablesAfterSplit > tablesBeforeSplit, `${tablesBeforeSplit} -> ${tablesAfterSplit}`)

// 5. Cell size, alignment, direction, gridlines
await resetTable(3, 3)
await openTab('Table Layout')
await clickTitle('AutoFit')
await clickMenu('AutoFit Window')
await sleep(180)
check('AutoFit Window sets 100% width', (await tableAttrs()).tableWidth === '100%')
await clickTitle('AutoFit')
await clickMenu('Distribute Columns Evenly')
await sleep(200)
const widths = await page.$$eval('.ProseMirror colgroup col', (els) => els.map((e) => e.style.width || e.style.minWidth))
check('Distribute Columns Evenly sets column widths', widths.length === 3 && new Set(widths).size === 1, widths.join(', '))

await page.evaluate(() => document.querySelector('.table-layout-grid button[title="Align Center"]')?.click())
await sleep(180)
const alignment = await cellAttrs()
check('Cell alignment grid sets vertical and horizontal alignment', alignment.cellVerticalAlign === 'middle' && alignment.cellTextAlign === 'center', JSON.stringify(alignment))

await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Cell Margins')?.click())
await sleep(150)
await clickMenu('Wide')
await sleep(180)
const padding = (await cellAttrs()).cellPadding
check('Cell margins preset applies padding', Boolean(padding) && Number(padding) > 8, padding)

await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Text Direction')?.click())
await sleep(150)
await clickMenu('Rotate All Text 90')
await sleep(180)
const direction = await page.evaluate(() => {
  const th = document.querySelector('.ProseMirror th')
  return { attr: th.getAttribute('data-cell-text-direction'), writingMode: getComputedStyle(th).writingMode }
})
check('Text Direction sets vertical writing mode', direction.attr === 'tbrl' && direction.writingMode.includes('vertical'), `${direction.attr} / ${direction.writingMode}`)

const gridBefore = (await tableAttrs()).tableGridlines
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Gridlines')?.click())
await sleep(180)
const gridAfter = (await tableAttrs()).tableGridlines
check('Gridlines toggles table gridlines', gridBefore !== false && gridAfter === false)
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Gridlines')?.click())
await sleep(150)

// 6. Data: sort, convert, repeat header, formula
await resetTable(3, 3)
await page.evaluate(() => {
  const e = window.__editor
  e.commands.setContent('<p>Sort</p><table><tbody><tr><th><p>Name</p></th></tr><tr><td><p>Charlie</p></td></tr><tr><td><p>Alice</p></td></tr><tr><td><p>Bob</p></td></tr></tbody></table>')
  const cell = document.querySelector('.ProseMirror th')
  e.chain().focus().setTextSelection(e.view.posAtDOM(cell, 0)).run()
})
await sleep(220)
await openTab('Table Layout')
await clickTitle('Sort')
await sleep(220)
check('Sort dialog opens', Boolean(await page.$('.sort-table-dialog')))
await page.screenshot({ path: path.join(OUT, 'table-sort.png') })
await page.evaluate(() => [...document.querySelectorAll('.sort-table-dialog .dialog-btn')].find((b) => b.textContent.trim() === 'OK')?.click())
await sleep(220)
const sortedText = await page.evaluate(() => window.__editor.state.doc.textContent)
check('Sort dialog sorts rows ascending', sortedText.indexOf('Alice') < sortedText.indexOf('Bob') && sortedText.indexOf('Bob') < sortedText.indexOf('Charlie'))

const formulaClick = await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Formula')?.click() ?? false)
await sleep(150)
check('Formula shows guidance toast', await page.evaluate(() => Boolean(document.querySelector('.toast')?.textContent?.includes('SUM'))))

const repeatBefore = (await tableAttrs()).headerRow
await page.evaluate(() => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Repeat Header Rows')?.click())
await sleep(180)
check('Repeat Header Rows toggles header row', (await tableAttrs()).headerRow === !repeatBefore)

// 7. Dialogs: properties, modify style, insert cells
await resetTable(3, 3)
await openTab('Table Layout')
await clickTitle('Properties')
await sleep(220)
check('Table Properties dialog opens', Boolean(await page.$('.table-properties-dialog')))
const propsDefaults = await page.evaluate(() => {
  const input = document.querySelector('.table-properties-dialog input[type="number"]')
  return { width: Number(input?.value), unit: document.querySelector('.table-properties-dialog select')?.value }
})
check('Table Properties shows rendered table width', propsDefaults.width > 400 && propsDefaults.unit === 'px', JSON.stringify(propsDefaults))
const widthBeforeOk = (await tableStats()).tableWidth
await page.screenshot({ path: path.join(OUT, 'table-properties.png') })
await page.evaluate(() => [...document.querySelectorAll('.table-properties-dialog .dialog-btn')].find((b) => b.textContent.trim() === 'OK')?.click())
await sleep(250)
const widthAfterOk = (await tableStats()).tableWidth
check('Table Properties OK preserves table width', Math.abs(widthAfterOk - widthBeforeOk) <= 2, `${widthBeforeOk} -> ${widthAfterOk}`)

await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((b) => b.textContent.trim() === 'Table Design')?.click())
await sleep(180)
await page.evaluate(() => document.querySelector('button.ribbon-launcher[title="Modify Table Style"]')?.click())
await sleep(220)
check('Table Styles launcher opens Modify Style dialog', Boolean(await page.$('.modify-table-dialog')))
await page.screenshot({ path: path.join(OUT, 'modify-table-style.png') })
await page.evaluate(() => [...document.querySelectorAll('.modify-table-dialog .dialog-btn')].find((b) => b.textContent.trim() === 'Cancel')?.click())
await sleep(150)

await page.evaluate(() => [...document.querySelectorAll('.ribbon-tab')].find((b) => b.textContent.trim() === 'Table Layout')?.click())
await sleep(180)
await page.evaluate(() => document.querySelector('button.ribbon-launcher[title="Insert Cells"]')?.click())
await sleep(220)
check('Insert Cells dialog opens', Boolean(await page.$('.insert-cells-dialog')))
await page.evaluate(() => [...document.querySelectorAll('.insert-cells-dialog .dialog-btn')].find((b) => b.textContent.trim() === 'OK')?.click())
await sleep(200)
check('Insert Cells OK adds a column', (await tableStats()).cols === 4)

// 8. Convert to text and leaving the table
await resetTable(3, 3)
await openTab('Table Layout')
await clickTitle('Convert to Text')
await sleep(220)
check('Convert to Text removes table', await page.evaluate(() => window.__editor.state.doc.content.content.every((n) => n.type.name !== 'table')))
const converted = await page.evaluate(() => window.__editor.state.doc.textContent)
check('Convert to Text keeps cell text', converted.includes('Table demo'))

await resetTable(3, 3)
await openTab('Table Design')
await page.evaluate(() => window.__editor.chain().focus().setTextSelection(1).run())
await sleep(250)
const afterLeave = await page.evaluate(() => ({
  tabs: [...document.querySelectorAll('.ribbon-tab')].map((e) => e.textContent.trim()),
  active: [...document.querySelectorAll('.ribbon-tab.active')].map((e) => e.textContent.trim()),
}))
check('Leaving table hides contextual tabs', !afterLeave.tabs.includes('Table Design') && !afterLeave.tabs.includes('Table Layout'))
check('Leaving table returns to Home', afterLeave.active.length === 1 && afterLeave.active[0] === 'Home')

const failed = checks.filter((c) => !c.pass)
const report = { total: checks.length, passed: checks.length - failed.length, failed: failed.length, errors, checks }
fs.writeFileSync(path.join(OUT, 'table-checks.json'), JSON.stringify(report, null, 2))
console.log(JSON.stringify({ total: report.total, passed: report.passed, failed: report.failed, errors, failedChecks: failed }, null, 2))
await browser.close()
if (failed.length || errors.length) process.exitCode = 1
