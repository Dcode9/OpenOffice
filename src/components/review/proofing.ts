import type { Editor } from '@tiptap/react'

export type ProofIssueType = 'spelling' | 'grammar'

export type ProofIssue = {
  id: string
  type: ProofIssueType
  word: string
  message: string
  suggestions: string[]
  from: number
  to: number
  sentence: string
}

const COMMON_WORDS = `
a able about above accept access according account across act action active add added adding
address after again against age ago agree agreed ahead air all allow allowed almost alone along
already also although always am among amount an and another answer any anyone anything appear
apple application apply applied approach area are around art as ask asked at author available away
back bad be because become been before begin beginning behind being below best better between both
box bring broad build built business but buy by call called came can cannot car care carry case
cause center certain change changed chapter check child choose city class clear close code color
come comes coming common company complete computer concept concern condition consider contain
content continue control copy correct could country course cover create created current cut data
date day days deal decide deep describe design detail did different difficult direct do document
does doing done door down draw drive drop during each early easy edit editor education effect
either else end enough enter entire equation even ever every everything example except experience
explain eye face fact family far fast father few field file fill find fine finish first follow
following font for force form format forward found four free from front full future game general
get getting give given go going good got government great group grow had half hand happen has have
he head hear heard help her here high him his history hold home hope hour house how however idea
if image important improve in include including increase indeed information inside instead interest
into is issue it item its itself job join just keep key kind know known large last late later law
lay layout learn least leave left less let letter level life light like line link list little live
local long look made main make makes making man many margin may maybe me mean media meet member
memory mention menu message might mind minute miss more most mother move much must my name need
never new next nice night no none nor not note nothing now number of off offer office often oh ok
old on once one only open opened option or order original other others our out over own page pages
paper paragraph part particular past people per perhaps person picture place plan play point
possible power practice present press pretty previous print problem process produce product program
project provide public pull purpose push put question quick quite quote range rather read ready
real reason receive recent record red region relate remember remove repeat replace reply report
require research resource response result return review right room rule run said same save saw say
says school screen second section see seem select selected sense sent sentence separate set several
shall she short should show shown side simple since small so some something sometimes soon sort
sound source space speak special spell spelling start state stay step still stop store story
straight strong style subject such suggest support sure system table take taken talk task team tell
term test text than thank that the their them then there these they thing think third this those
though thought three through time title to today together too took tool top topic total toward
track true try turn two type under understand until up update upon us use used user using usual
value various version very view want war water way we web week well went were what when where which
while white who whole why will window with within without word words work world would write
written year yes yet you your yourself

openoffice docx microsoft alan kay calibri ribbon tiptap markdown html css react javascript
charles richardson spain spanish french german hindi india indian english united states
document1 comparison revised original inserted deleted formatting accessibility comments
changes comment resolve reopen reply replies author initials timestamp track tracking markup
proofing thesaurus translate translation language languages grammar suggestions suggestion
insertions deletions reviewing pane balloons specific people highlight updates other authors
protect protection restrict editing encrypt password formatting styles block authors ink
aloud speech synthesis voice playback emphasis bulleted numbered subscripts superscripts
highlighting underlined italic struck through behaves compatible everything works welcome
future invent predict press find replace ctrl shift
`.split(/\s+/).filter(Boolean)

export const DICTIONARY = new Set(COMMON_WORDS.map((word) => word.toLowerCase()))

const ADDED_KEY = 'openoffice:review:dictionary'
const IGNORED_KEY = 'openoffice:review:ignored'

function readList(key: string) {
  try {
    const raw = localStorage.getItem(key)
    const value = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set<string>()
  }
}

function writeList(key: string, list: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...list]))
  } catch {
    /* ignore */
  }
}

export function getAddedWords() {
  return readList(ADDED_KEY)
}

export function addDictionaryWord(word: string) {
  const added = getAddedWords()
  added.add(word.toLowerCase())
  writeList(ADDED_KEY, added)
}

export function getIgnoredWords() {
  return readList(IGNORED_KEY)
}

export function addIgnoredWord(word: string) {
  const ignored = getIgnoredWords()
  ignored.add(word.toLowerCase())
  writeList(IGNORED_KEY, ignored)
}

function knownWord(raw: string) {
  const word = raw.toLowerCase().replace(/[’']s$/, '').replace(/[’']/g, "'")
  if (!word) return true
  if (DICTIONARY.has(word) || getAddedWords().has(word)) return true
  const candidates = new Set<string>()
  if (word.endsWith('ies')) candidates.add(`${word.slice(0, -3)}y`)
  if (word.endsWith('es')) candidates.add(word.slice(0, -2))
  if (word.endsWith('s')) candidates.add(word.slice(0, -1))
  if (word.endsWith('ed')) {
    candidates.add(word.slice(0, -2))
    candidates.add(word.slice(0, -1))
    if (word.length > 3 && word[word.length - 3] === word[word.length - 4]) candidates.add(word.slice(0, -3))
  }
  if (word.endsWith('ing')) {
    candidates.add(word.slice(0, -3))
    candidates.add(`${word.slice(0, -3)}e`)
    if (word.length > 4 && word[word.length - 4] === word[word.length - 5]) candidates.add(word.slice(0, -4))
  }
  if (word.endsWith('ly')) candidates.add(word.slice(0, -2))
  if (word.endsWith('er')) {
    candidates.add(word.slice(0, -2))
    candidates.add(word.slice(0, -1))
  }
  if (word.endsWith('est')) {
    candidates.add(word.slice(0, -3))
    candidates.add(word.slice(0, -2))
  }
  if (word.endsWith('ness')) candidates.add(word.slice(0, -4))
  if (word.endsWith('ment')) candidates.add(word.slice(0, -4))
  for (const candidate of candidates) {
    if (candidate && (DICTIONARY.has(candidate) || getAddedWords().has(candidate))) return true
  }
  return false
}

function levenshtein(a: string, b: string) {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > 2) return 99
  const rows = a.length + 1
  const cols = b.length + 1
  const table = new Array<number>(cols)
  for (let j = 0; j < cols; j += 1) table[j] = j
  for (let i = 1; i < rows; i += 1) {
    let previous = table[0]
    table[0] = i
    for (let j = 1; j < cols; j += 1) {
      const temp = table[j]
      table[j] = Math.min(
        table[j] + 1,
        table[j - 1] + 1,
        previous + (a[i - 1] === b[j - 1] ? 0 : 1),
      )
      previous = temp
    }
  }
  return table[cols - 1]
}

export function suggestionsFor(word: string) {
  const lower = word.toLowerCase()
  const scored: { word: string; score: number }[] = []
  for (const candidate of DICTIONARY) {
    if (Math.abs(candidate.length - lower.length) > 3) continue
    if (candidate[0] !== lower[0] && candidate.length > 3) continue
    const score = levenshtein(lower, candidate)
    if (score <= Math.max(2, Math.ceil(lower.length / 3))) scored.push({ word: candidate, score })
  }
  scored.sort((a, b) => a.score - b.score || a.word.localeCompare(b.word))
  return scored.slice(0, 6).map((item) => item.word)
}

function sentenceFor(text: string, from: number, to: number) {
  let start = from
  let end = to
  while (start > 0 && !/[.!?\n]/.test(text[start - 1])) start -= 1
  while (end < text.length && !/[.!?\n]/.test(text[end])) end += 1
  return text.slice(start, Math.min(text.length, end + 1)).trim()
}

export function findProofIssues(text: string): ProofIssue[] {
  const issues: ProofIssue[] = []
  const ignored = getIgnoredWords()
  const wordPattern = /[\p{L}][\p{L}'’-]*/gu
  let match: RegExpExecArray | null
  while ((match = wordPattern.exec(text))) {
    const raw = match[0]
    if (raw.length <= 2) continue
    if (/[0-9]/.test(raw)) continue
    if (raw === raw.toUpperCase() && raw.length > 1) continue
    if (ignored.has(raw.toLowerCase())) continue
    if (knownWord(raw)) continue
    issues.push({
      id: `spell-${match.index}`,
      type: 'spelling',
      word: raw,
      message: 'Not in Dictionary',
      suggestions: suggestionsFor(raw),
      from: match.index,
      to: match.index + raw.length,
      sentence: sentenceFor(text, match.index, match.index + raw.length),
    })
  }

  const repeated = /\b([\p{L}]+)(\s+)\1\b/giu
  while ((match = repeated.exec(text))) {
    const secondIndex = match.index + match[1].length + match[2].length
    issues.push({
      id: `grammar-repeat-${match.index}`,
      type: 'grammar',
      word: match[1],
      message: `Repeated word "${match[1]}"`,
      suggestions: [match[1]],
      from: secondIndex,
      to: secondIndex + match[1].length,
      sentence: sentenceFor(text, match.index, secondIndex + match[1].length),
    })
  }

  const spacePunctuation = / +([,.;:!?])/g
  while ((match = spacePunctuation.exec(text))) {
    issues.push({
      id: `grammar-space-${match.index}`,
      type: 'grammar',
      word: match[1],
      message: 'Remove the space before punctuation',
      suggestions: [match[1]],
      from: match.index,
      to: match.index + match[0].length,
      sentence: sentenceFor(text, match.index, match.index + match[0].length),
    })
  }

  const lowerI = /(^|[^\p{L}])i([^\p{L}]|$)/gu
  while ((match = lowerI.exec(text))) {
    const index = match.index + match[1].length
    issues.push({
      id: `grammar-i-${index}`,
      type: 'grammar',
      word: 'i',
      message: 'The personal pronoun "I" must be capitalized',
      suggestions: ['I'],
      from: index,
      to: index + 1,
      sentence: sentenceFor(text, index, index + 1),
    })
  }

  issues.sort((a, b) => a.from - b.from)
  return issues
}

export function buildTextMap(editor: Editor) {
  let text = ''
  const map: number[] = []
  editor.state.doc.descendants((node, pos) => {
    if (node.isText) {
      const value = node.text || ''
      for (let index = 0; index < value.length; index += 1) {
        text += value[index]
        map.push(pos + index)
      }
    } else if (node.isBlock) {
      text += '\n'
      map.push(-1)
    }
    return true
  })
  return { text, map }
}

export function editorRange(issue: ProofIssue, map: number[]) {
  const from = map[issue.from]
  const to = map[Math.max(issue.from, issue.to - 1)]
  if (from === undefined || to === undefined || from < 0 || to < 0) return null
  return { from, to: to + 1 }
}
