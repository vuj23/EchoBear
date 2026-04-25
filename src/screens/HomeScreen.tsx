import { useState, useRef, useEffect } from 'react'
import { LEVEL_DESCRIPTIONS } from '../levelConfig'

const EXAMPLE_PROMPTS = [
  'a dragon who is scared of fire',
  'a bunny who loves the stars',
  'a robot who wants a friend',
  'a fish who can fly',
  'a cat who bakes cakes',
]

interface Props {
  initialLevel: number
  onMakeStory: (prompt: string, level: number) => void
}

export default function HomeScreen({ initialLevel, onMakeStory }: Props) {
  const [prompt, setPrompt] = useState('')
  const [level, setLevel] = useState(initialLevel)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const speechSupported = !!(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  )

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) return
    const rec = new SpeechRec()
    rec.continuous = false
    rec.lang = 'en-US'
    rec.onresult = (e: any) => {
      setPrompt(e.results[0][0].transcript)
      setIsListening(false)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
  }, [])

  function startListening() {
    if (!recognitionRef.current || isListening) return
    setIsListening(true)
    recognitionRef.current.start()
  }

  function handleSubmit() {
    if (!prompt.trim()) return
    onMakeStory(prompt.trim(), level)
  }

  return (
    <div className="screen home-screen">
      <div className="home-header">
        <div className="logo">📖</div>
        <h1 className="app-title">StoryBloom</h1>
        <p className="app-subtitle">What story should we make today?</p>
      </div>

      <div className="home-content">
        {speechSupported && (
          <button
            className={`mic-button ${isListening ? 'listening' : ''}`}
            onClick={startListening}
            disabled={isListening}
            aria-label="Speak your story idea"
          >
            <span className="mic-icon">🎤</span>
            <span className="mic-label">{isListening ? 'Listening...' : 'Tap to speak'}</span>
          </button>
        )}

        <div className="prompt-chips">
          {EXAMPLE_PROMPTS.map(p => (
            <button key={p} className="chip" onClick={() => setPrompt(p)}>
              {p}
            </button>
          ))}
        </div>

        <input
          className="prompt-input"
          type="text"
          placeholder="or type your story idea here..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        {prompt.trim() && (
          <div className="prompt-preview">✨ {prompt}</div>
        )}

        <div className="level-selector">
          <p className="level-label">Reading level</p>
          <div className="level-buttons">
            {[1, 2, 3, 4, 5].map(l => (
              <button
                key={l}
                className={`level-btn ${level === l ? 'active' : ''}`}
                onClick={() => setLevel(l)}
              >
                L{l}
              </button>
            ))}
          </div>
          <p className="level-desc">{LEVEL_DESCRIPTIONS[level]}</p>
        </div>

        <button
          className="cta-button"
          onClick={handleSubmit}
          disabled={!prompt.trim()}
        >
          Make my story! ✨
        </button>
      </div>
    </div>
  )
}
