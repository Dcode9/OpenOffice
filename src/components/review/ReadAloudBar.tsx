import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, Square, Volume2 } from 'lucide-react'
import { useWord } from '../../context'

export default function ReadAloudBar({ onClose }: { onClose: () => void }) {
  const { editor } = useWord()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [voiceName, setVoiceName] = useState('')
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const indexRef = useRef(0)
  const rateRef = useRef(1)
  const voiceRef = useRef('')
  const speakRef = useRef<(next: number) => void>(() => {})

  const chunks = useMemo(() => {
    if (!editor) return []
    const { from, to } = editor.state.selection
    const source = from !== to ? editor.state.doc.textBetween(from, to, ' ') : editor.getText()
    return source
      .split(/(?<=[.!?])\s+|\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 200)
  }, [editor])

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!supported) return
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices()
      setVoices(available)
      if (!voiceRef.current && available.length) {
        const preferred = available.find((voice) => /en[-_]/i.test(voice.lang)) ?? available[0]
        voiceRef.current = preferred.name
        setVoiceName(preferred.name)
      }
    }
    loadVoices()
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices)
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const speak = (next: number) => {
    if (!supported || !chunks.length) return
    const target = Math.max(0, Math.min(chunks.length - 1, next))
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(chunks[target])
    utterance.rate = rateRef.current
    const voice = voices.find((item) => item.name === voiceRef.current)
    if (voice) utterance.voice = voice
    utterance.onend = () => {
      if (target + 1 < chunks.length) {
        indexRef.current = target + 1
        setIndex(target + 1)
        speakRef.current(target + 1)
      } else {
        setPlaying(false)
      }
    }
    utterance.onerror = () => setPlaying(false)
    utteranceRef.current = utterance
    indexRef.current = target
    setIndex(target)
    setPlaying(true)
    window.speechSynthesis.speak(utterance)
  }
  speakRef.current = speak

  useEffect(() => {
    const timer = window.setTimeout(() => speakRef.current(0), 150)
    return () => window.clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chunks.length])

  const pause = () => {
    if (!supported) return
    if (playing) {
      window.speechSynthesis.pause()
      setPlaying(false)
    } else if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setPlaying(true)
    } else {
      speakRef.current(indexRef.current)
    }
  }

  const stop = () => {
    window.speechSynthesis.cancel()
    setPlaying(false)
    onClose()
  }

  const changeRate = (value: number) => {
    setRate(value)
    rateRef.current = value
    if (playing) speakRef.current(indexRef.current)
  }

  const changeVoice = (name: string) => {
    setVoiceName(name)
    voiceRef.current = name
    if (playing) speakRef.current(indexRef.current)
  }

  return (
    <div className="rv-read-aloud" role="toolbar" aria-label="Read Aloud">
      <div className="rv-read-icon">
        <Volume2 size={16} />
      </div>
      <div className="rv-read-main">
        <div className="rv-read-title">Read Aloud</div>
        <div className="rv-read-text">
          {!supported
            ? 'Speech synthesis is not available in this browser.'
            : chunks[index] || 'There is no text to read.'}
        </div>
        <div className="rv-read-progress">
          <span style={{ width: `${chunks.length ? ((index + 1) / chunks.length) * 100 : 0}%` }} />
        </div>
      </div>
      <div className="rv-read-controls">
        <button
          type="button"
          className="rv-icon-btn"
          onClick={() => speakRef.current(indexRef.current - 1)}
          disabled={!supported}
          aria-label="Previous sentence"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          className="rv-round-btn"
          onClick={pause}
          disabled={!supported}
          aria-label={playing ? 'Pause reading' : 'Play reading'}
        >
          {playing ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <button
          type="button"
          className="rv-icon-btn"
          onClick={() => speakRef.current(indexRef.current + 1)}
          disabled={!supported}
          aria-label="Next sentence"
        >
          <ChevronRight size={16} />
        </button>
        <button type="button" className="rv-icon-btn" onClick={stop} aria-label="Close Read Aloud">
          <Square size={14} />
        </button>
        <select className="rv-select rv-select-compact" value={String(rate)} onChange={(event) => changeRate(Number(event.target.value))}>
          <option value="0.75">0.75x</option>
          <option value="1">1x</option>
          <option value="1.25">1.25x</option>
          <option value="1.5">1.5x</option>
        </select>
        <select className="rv-select rv-select-compact" value={voiceName} onChange={(event) => changeVoice(event.target.value)}>
          {voices.map((voice) => (
            <option key={voice.name} value={voice.name}>{voice.name}</option>
          ))}
        </select>
      </div>
    </div>
  )
}
