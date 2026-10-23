import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useWord } from '../../context'
import { ReviewButton, ReviewDialog } from './ReviewDialog'

type SynonymGroup = { pos: string; words: string[] }

const THESAURUS: Record<string, SynonymGroup[]> = {
  good: [
    { pos: 'adjective', words: ['excellent', 'fine', 'great', 'superior', 'worthy', 'pleasant', 'satisfactory'] },
    { pos: 'noun', words: ['benefit', 'advantage', 'goodness', 'virtue'] },
  ],
  great: [
    { pos: 'adjective', words: ['excellent', 'outstanding', 'remarkable', 'superb', 'considerable', 'large'] },
    { pos: 'noun', words: ['celebrated', 'eminent', 'prominent'] },
  ],
  big: [
    { pos: 'adjective', words: ['large', 'huge', 'enormous', 'substantial', 'major', 'significant'] },
  ],
  small: [
    { pos: 'adjective', words: ['little', 'tiny', 'minor', 'compact', 'slight', 'modest'] },
  ],
  fast: [
    { pos: 'adjective', words: ['quick', 'rapid', 'swift', 'speedy', 'brisk'] },
    { pos: 'adverb', words: ['quickly', 'rapidly', 'swiftly'] },
  ],
  slow: [
    { pos: 'adjective', words: ['sluggish', 'gradual', 'unhurried', 'delayed', 'leisurely'] },
  ],
  happy: [
    { pos: 'adjective', words: ['glad', 'cheerful', 'delighted', 'pleased', 'content', 'joyful'] },
  ],
  sad: [
    { pos: 'adjective', words: ['unhappy', 'sorrowful', 'gloomy', 'downcast', 'melancholy'] },
  ],
  important: [
    { pos: 'adjective', words: ['significant', 'essential', 'critical', 'vital', 'major', 'key'] },
  ],
  use: [
    { pos: 'verb', words: ['utilize', 'employ', 'apply', 'operate', 'exercise'] },
    { pos: 'noun', words: ['purpose', 'function', 'benefit', 'application'] },
  ],
  make: [
    { pos: 'verb', words: ['create', 'produce', 'build', 'construct', 'form', 'generate'] },
  ],
  show: [
    { pos: 'verb', words: ['display', 'present', 'demonstrate', 'reveal', 'illustrate'] },
    { pos: 'noun', words: ['display', 'exhibition', 'performance'] },
  ],
  begin: [
    { pos: 'verb', words: ['start', 'commence', 'initiate', 'launch', 'open'] },
  ],
  end: [
    { pos: 'verb', words: ['finish', 'conclude', 'complete', 'terminate', 'close'] },
    { pos: 'noun', words: ['ending', 'conclusion', 'finish', 'close'] },
  ],
  help: [
    { pos: 'verb', words: ['assist', 'aid', 'support', 'facilitate', 'guide'] },
    { pos: 'noun', words: ['assistance', 'aid', 'support', 'guidance'] },
  ],
  change: [
    { pos: 'verb', words: ['modify', 'alter', 'adjust', 'transform', 'revise'] },
    { pos: 'noun', words: ['modification', 'alteration', 'revision', 'shift'] },
  ],
  document: [
    { pos: 'noun', words: ['file', 'record', 'paper', 'report', 'manuscript'] },
    { pos: 'verb', words: ['record', 'chronicle', 'detail'] },
  ],
  work: [
    { pos: 'noun', words: ['labor', 'employment', 'task', 'job', 'effort'] },
    { pos: 'verb', words: ['labor', 'operate', 'function', 'perform'] },
  ],
  create: [
    { pos: 'verb', words: ['make', 'produce', 'build', 'design', 'develop', 'generate'] },
  ],
  improve: [
    { pos: 'verb', words: ['enhance', 'upgrade', 'refine', 'better', 'strengthen'] },
  ],
  difficult: [
    { pos: 'adjective', words: ['hard', 'challenging', 'demanding', 'complex', 'tough'] },
  ],
  easy: [
    { pos: 'adjective', words: ['simple', 'effortless', 'straightforward', 'clear', 'uncomplicated'] },
  ],
  beautiful: [
    { pos: 'adjective', words: ['attractive', 'lovely', 'gorgeous', 'pretty', 'elegant'] },
  ],
  quick: [
    { pos: 'adjective', words: ['fast', 'rapid', 'swift', 'speedy', 'prompt'] },
  ],
  clear: [
    { pos: 'adjective', words: ['obvious', 'evident', 'plain', 'transparent', 'distinct'] },
    { pos: 'verb', words: ['remove', 'erase', 'clean', 'empty'] },
  ],
  review: [
    { pos: 'verb', words: ['examine', 'inspect', 'assess', 'evaluate', 'analyze'] },
    { pos: 'noun', words: ['assessment', 'evaluation', 'inspection', 'analysis'] },
  ],
}

function lookup(word: string) {
  return THESAURUS[word.trim().toLowerCase()] ?? []
}

export default function ThesaurusDialog({ onClose }: { onClose: () => void }) {
  const { editor, toast } = useWord()
  const [initialWord] = useState(() => {
    if (!editor) return ''
    const { from, to } = editor.state.selection
    return editor.state.doc.textBetween(from, to, ' ').trim()
  })
  const [query, setQuery] = useState(initialWord)
  const [word, setWord] = useState(initialWord)
  const groups = useMemo(() => lookup(word), [word])
  const [range] = useState(() => {
    if (!editor) return null
    const { from, to } = editor.state.selection
    return from !== to ? { from, to } : null
  })

  const search = () => {
    setWord(query.trim())
  }

  const insert = (synonym: string) => {
    if (!editor) return
    if (range) editor.chain().focus().insertContentAt(range, synonym).run()
    else editor.chain().focus().insertContent(synonym).run()
    toast(`Replaced with "${synonym}"`)
    onClose()
  }

  return (
    <ReviewDialog
      title="Thesaurus"
      subtitle="Look up synonyms for the selected word"
      width={540}
      onClose={onClose}
      footer={
        <>
          <div className="rv-foot-note">{word ? `Results for “${word}”` : 'Select a word to look up'}</div>
          <ReviewButton onClick={onClose}>Close</ReviewButton>
        </>
      }
    >
      <div className="rv-search-row">
        <Search size={15} />
        <input
          className="rv-input"
          value={query}
          placeholder="Type a word"
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && search()}
          autoFocus
        />
        <ReviewButton variant="primary" onClick={search}>Search</ReviewButton>
      </div>
      {!word && <div className="rv-empty">Select a word in the document, or type one above.</div>}
      {word && groups.length === 0 && (
        <div className="rv-empty">No matches found for “{word}”. Try a different word.</div>
      )}
      <div className="rv-thesaurus-groups">
        {groups.map((group) => (
          <section className="rv-thesaurus-group" key={group.pos}>
            <div className="rv-thesaurus-pos">{group.pos}</div>
            <div className="rv-thesaurus-words">
              {group.words.map((synonym) => (
                <button key={synonym} type="button" className="rv-thesaurus-word" onClick={() => insert(synonym)}>
                  {synonym}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </ReviewDialog>
  )
}
