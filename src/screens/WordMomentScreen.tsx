import { useState, useEffect, useRef } from 'react'
import type { Scene } from '../types'

interface Props {
  scene: Scene
  attempts: number
  onResult: (heard: string) => void
  onSkip: () => void
}

export default function WordMomentScreen({ scene, attempts, onResult, onSkip }: Props) {
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState('Tap the mic and say the word!')
  const recognitionRef = useRef<any>(null)
  const resultHandled = useRef(false)

  useEffect(() => {
    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRec) {
      setStatus('Speech recognition not supported — please type your answer or skip.')
      return
    }

    const rec = new SpeechRec()
    rec.continuous = false
    rec.lang = 'en-US'

    rec.onstart = () => {
      setIsListening(true)
      setStatus('Listening... say the word!')
    }
    rec.onresult = (e: any) => {
      const heard = e.results[0][0].transcript.toLowerCase().trim()
      setIsListening(false)
      setStatus(`You said: "${heard}"`)
      if (!resultHandled.current) {
        resultHandled.current = true
        setTimeout(() => onResult(heard), 600)
      }
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => {
      setIsListening(false)
      setStatus('Hmm, try again — tap the mic!')
    }

    recognitionRef.current = rec

    // Auto-start on first attempt
    if (attempts === 0) {
      setTimeout(() => {
        try { rec.start() } catch { /* already started */ }
      }, 700)
    }

    return () => {
      try { rec.abort() } catch { /* ignore */ }
    }
  }, [])

  function startListening() {
    if (!recognitionRef.current || isListening) return
    resultHandled.current = false
    try {
      recognitionRef.current.start()
    } catch { /* already running */ }
  }

  return (
    <div className="screen word-moment-screen">
      {scene.pauseText && (
        <p className="pause-text">{scene.pauseText}</p>
      )}

      <div className="word-split-display">{scene.wordSplit || scene.targetWord}</div>

      <p className="word-status">{status}</p>

      <button
        className={`mic-button large ${isListening ? 'listening' : ''}`}
        onClick={startListening}
        disabled={isListening}
        aria-label="Say the word"
      >
        <span className="mic-icon">🎤</span>
      </button>

      <button className="skip-btn" onClick={onSkip}>
        Skip this word
      </button>
    </div>
  )
}
