import fs from 'node:fs'
import path from 'node:path'
import mammoth from 'mammoth'

async function testImport() {
  const docxPath = path.resolve('research/word-master/Master_Word_Showcase.docx')
  if (!fs.existsSync(docxPath)) {
    console.error('File not found:', docxPath)
    process.exit(1)
  }
  const buffer = fs.readFileSync(docxPath)
  console.log('Read DOCX file size:', buffer.length)

  const result = await mammoth.convertToHtml(
    { buffer },
    {
      styleMap: [
        "p[style-name='Title'] => h1.sample-title:fresh",
        "p[style-name='Subtitle'] => p.sample-sub:fresh",
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Quote'] => blockquote:fresh",
        "p[style-name='Intense Quote'] => blockquote.sample-quote:fresh",
        "r[style-name='Strong'] => strong",
        "r[style-name='Emphasis'] => em",
      ],
    }
  )

  console.log('Conversion warnings count:', result.messages.length)
  console.log('Converted HTML length:', result.value.length)
  console.log('--- HTML Preview (first 1000 chars) ---')
  console.log(result.value.slice(0, 1000))

  // Verify key elements exist in converted HTML
  const checks = [
    { name: 'Title present', ok: result.value.includes('Comprehensive Microsoft Word Feature Showcase') },
    { name: 'Subtitle present', ok: result.value.includes('A rigorous technical benchmark') },
    { name: 'Heading 1 present', ok: result.value.includes('Typography, Formatting &amp; Font Effects') },
    { name: 'Table 1 present', ok: result.value.includes('<table>') },
    { name: 'Banded rows present', ok: result.value.includes('Desktop Software') },
    { name: 'Lists present', ok: result.value.includes('<ul>') || result.value.includes('<ol>') },
  ]

  let allOk = true
  for (const c of checks) {
    console.log(`[${c.ok ? 'PASS' : 'FAIL'}] ${c.name}`)
    if (!c.ok) allOk = false
  }

  if (allOk) {
    console.log('ALL DOCX IMPORT PARITY CHECKS PASSED!')
  } else {
    console.error('Some DOCX import checks failed.')
    process.exit(1)
  }
}

testImport().catch((err) => {
  console.error(err)
  process.exit(1)
})
