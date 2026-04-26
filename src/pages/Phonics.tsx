import styles from './Phonics.module.css'
import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { StoryJSON } from '../types'

type NavItem = 'home' | 'library' | 'profile'
type Result = 'idle' | 'correct' | 'wrong'

declare global {
  interface Window {
    SpeechRecognition: unknown
    webkitSpeechRecognition: unknown
  }
}

const FALLBACK_WORDS = [
  { targetWord: 'red', wordSplit: 'r—ed', phonemes: ['r', 'e', 'd'], pauseText: 'The flower was...' },
  { targetWord: 'big', wordSplit: 'b—ig', phonemes: ['b', 'i', 'g'], pauseText: 'The cat was...' },
]

export default function Phonics() {
  const [active, setActive] = useState<NavItem>('home')
  const [wordIndex, setWordIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [result, setResult] = useState<Result>('idle')
  const [heard, setHeard] = useState('')
  const recognitionRef = useRef<any>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { story: StoryJSON } | null
  const words = state?.story?.scenes
    .filter(s => s.targetWord)
    .map(s => ({
      targetWord: s.targetWord,
      wordSplit: s.wordSplit,
      phonemes: s.phonemes,
      pauseText: s.pauseText || s.storyText,
    })) ?? FALLBACK_WORDS

  const current = words[wordIndex]
  const parts = current?.wordSplit?.split('—') ?? [current?.targetWord ?? '']
  const isLast = wordIndex >= words.length - 1

  function handleMicClick() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    setResult('idle')
    setHeard('')

    const rec = new (SR as any)()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false

    rec.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript.trim().toLowerCase()
      setHeard(spoken)
      const target = current.targetWord.toLowerCase()
      setResult(spoken.includes(target) ? 'correct' : 'wrong')
      setIsListening(false)
    }

    rec.onend = () => setIsListening(false)
    rec.onerror = () => { setIsListening(false); setResult('wrong') }
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  function handleNext() {
    if (!isLast) {
      setWordIndex(i => i + 1)
      setResult('idle')
      setHeard('')
    } else {
      navigate('/')
    }
  }

  const handleNavClick = (key: NavItem) => {
    setActive(key)
    if (key === 'home') navigate('/')
    if (key === 'library') navigate('/library')
    if (key === 'profile') navigate('/profile')
  }

  if (!current) {
    return (
      <div className={styles.screen}>
        <div className={styles.container}>
          <p style={{ textAlign: 'center', color: '#8B6E4E', marginTop: 60 }}>
            No target words in this story.
          </p>
          <button onClick={() => navigate('/')} style={{ margin: '20px auto', display: 'block' }}>Go Home</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>‹</button>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((wordIndex + 1) / words.length) * 100}%` }}
              />
            </div>
            <span className={styles.progressLabel}>{wordIndex + 1} / {words.length}</span>
          </div>
          <div style={{ width: 40 }} />
        </div>

        <h1 className={styles.storyContext}>"{current.pauseText}"</h1>

        <div className={styles.mainContent}>
          <div className={styles.micSection}>
            <button
              className={`${styles.micButton} ${isListening ? styles.micButtonActive : ''}`}
              onClick={handleMicClick}
            >
              {isListening ? '🎙️' : '🎤'}
            </button>
            <p className={styles.micLabel}>{isListening ? 'Listening…' : 'Tap to speak'}</p>
          </div>

          <div className={styles.wordCard}>
            <div className={styles.wordContainer}>
              {parts.map((part, i) => (
                <div key={i} className={styles.wordPartWrapper}>
                  {i > 0 && <div className={styles.syllableSeparator}>—</div>}
                  <div className={`${styles.wordPart} ${i === 0 ? styles.wordPartBlue : styles.wordPartGold}`}>
                    {part}
                  </div>
                </div>
              ))}
            </div>

            {current.phonemes.length > 0 && (
              <div className={styles.phonemeRow}>
                {current.phonemes.map((p, i) => (
                  <span key={i} className={styles.phoneme}>{p}</span>
                ))}
              </div>
            )}

            <p className={styles.wordPrompt}>Can you say this word?</p>

            {result === 'correct' && (
              <div className={styles.feedback} style={{ color: '#4caf50' }}>
                ✅ Great job! You said "{heard}"
              </div>
            )}
            {result === 'wrong' && (
              <div className={styles.feedback} style={{ color: '#e06060' }}>
                ❌ I heard "{heard}" — try saying <strong>{current.targetWord}</strong>
              </div>
            )}
          </div>

          <button className={styles.nextButton} onClick={handleNext}>
            {isLast ? '🏠' : '›'}
          </button>
        </div>
      </div>

      <footer className={styles.nav}>
        <NavButton active={active === 'home'} onClick={() => handleNavClick('home')} label="HOME" icon="home" />
        <NavButton active={active === 'library'} onClick={() => handleNavClick('library')} label="LIBRARY" icon="book" />
        <NavButton active={active === 'profile'} onClick={() => handleNavClick('profile')} label="PROFILE" icon="user" />
      </footer>
    </div>
  )
}

function NavButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: 'home' | 'book' | 'user'; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', gap: '8px', background: 'none', border: 'none',
        cursor: 'pointer', color: active ? '#5bb5c0' : '#d4b48a', fontSize: '14px',
        fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.85px', position: 'relative',
      }}
    >
      <span style={{ display: 'grid', placeItems: 'center' }}>
        {icon === 'home' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
        {icon === 'book' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M5 5v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
        {icon === 'user' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
      </span>
      <span>{label}</span>
      {active && (
        <div style={{
          position: 'absolute', bottom: '-4px', width: '7px', height: '7px',
          background: '#5bb5c0', borderRadius: '50%',
        }} />
      )}
    </button>
  )
}
