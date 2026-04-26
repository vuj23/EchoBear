import styles from './Home.module.css'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { generateStory } from '../api/groq'
import { generateBrainrotStory, getBrainrotImages } from '../api/brainrot'
import { loadLevel } from '../utils/storyStorage'

type NavItem = 'home' | 'library' | 'profile'

export default function Home() {
  const [active, setActive] = useState<NavItem>('home')
  const navigate = useNavigate()

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  function handleMicClick() {
    if (isLoading) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setError('Voice not supported — try Chrome or Edge')
      return
    }

    setTranscript('')
    setError(null)
    const rec = new SR()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      setTranscript(e.results[0][0].transcript)
      setIsListening(false)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => { setIsListening(false); setError('Could not hear you — try again') }
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  async function handleBrainrot() {
    if (isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const story = await generateBrainrotStory()
      navigate('/story', { state: { story, images: getBrainrotImages() } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate story')
      setIsLoading(false)
    }
  }

  async function handleGenerate() {
    const prompt = transcript.trim()
    if (!prompt || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const story = await generateStory(prompt, loadLevel())
      navigate('/story', { state: { story } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate story')
      setIsLoading(false)
    }
  }

  const micLabel = isListening ? 'Listening…' : isLoading ? 'Creating…' : 'Tap to speak'

  return (
    <div className={styles.screen}>
      <main className={styles.main}>
        <section className={styles.left}>
          <div className={styles.card}>
            <h1 className={styles.title}>
              What story would you
              <br />
              like to hear today?
            </h1>
            <p className={styles.subtitle}>Tell me your idea and I'll write a story just for you!</p>
          </div>

          <div className={styles.micArea}>
            <button
              className={`${styles.micButton} ${isListening ? styles.micButtonListening : ''}`}
              type="button"
              aria-label="Tap to speak"
              onClick={handleMicClick}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.micSpinner} />
              ) : (
                <span className={styles.micIcon} aria-hidden="true">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M19 11a7 7 0 0 1-14 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
            <div className={styles.tapText}>{micLabel}</div>

            {transcript ? (
              <div className={styles.transcriptArea}>
                <p className={styles.transcriptText}>"{transcript}"</p>
                <button className={styles.generateBtn} onClick={handleGenerate} disabled={isLoading}>
                  {isLoading ? 'Creating story…' : 'Create Story →'}
                </button>
              </div>
            ) : null}

            {error && <p className={styles.errorText}>{error}</p>}

            <button
              className={styles.brainrotBtn}
              type="button"
              onClick={handleBrainrot}
            >
              🥁 Tung Tung Mode
            </button>
          </div>
        </section>

        <section className={styles.right}>
          <img className={styles.logo} src="/Logo.png" alt="" />
        </section>
      </main>

      <footer className={styles.nav}>
        <NavButton active={active === 'home'} onClick={() => { setActive('home'); navigate('/') }} label="HOME" icon="home" />
        <NavButton active={active === 'library'} onClick={() => { setActive('library'); navigate('/library') }} label="LIBRARY" icon="book" />
        <NavButton active={active === 'profile'} onClick={() => { setActive('profile'); navigate('/profile') }} label="PROFILE" icon="user" />
      </footer>
    </div>
  )
}

function NavButton({ active, label, icon, onClick }: { active: boolean; label: string; icon: 'home' | 'book' | 'user'; onClick?: () => void }) {
  return (
    <button className={`${styles.navItem} ${active ? styles.navItemActive : ''}`} type="button" onClick={onClick}>
      <span className={styles.navIcon} aria-hidden="true">
        {icon === 'home' && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        )}
        {icon === 'book' && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            <path d="M5 5v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        )}
        {icon === 'user' && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={styles.navLabel}>{label}</span>
      {active ? <span className={styles.navDot} aria-hidden="true" /> : <span className={styles.navDotSpacer} />}
    </button>
  )
}
