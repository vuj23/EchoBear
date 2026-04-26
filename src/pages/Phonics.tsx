import styles from './Phonics.module.css'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

type NavItem = 'home' | 'library' | 'profile'

interface PhonicsWord {
  text: string
  parts: string[]
}

declare global {
  interface Window {
    SpeechRecognition: unknown
    webkitSpeechRecognition: unknown
  }
}

export default function Phonics() {
  const [active, setActive] = useState<NavItem>('home')
  const [isListening, setIsListening] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const navigate = useNavigate()

  const word: PhonicsWord = {
    text: 'red',
    parts: ['r', 'ed'],
  }

  const handleNavClick = (key: NavItem) => {
    setActive(key)
    if (key === 'home') navigate('/')
    if (key === 'library') navigate('/library')
    if (key === 'profile') navigate('/profile')
  }

  function handleMicClick() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new (SR as any)()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = () => {
      setIsListening(false)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => setIsListening(false)
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        {/* Header with back button and progress */}
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            ‹
          </button>

          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '45%' }}></div>
            </div>
          </div>

          <button className={styles.readAloudButton}>🔊</button>
        </div>

        {/* Story context */}
        <h1 className={styles.storyContext}>The flower was...</h1>

        {/* Main content area */}
        <div className={styles.mainContent}>
          {/* Mic button */}
          <div className={styles.micSection}>
            <button
              className={`${styles.micButton} ${isListening ? styles.micButtonActive : ''}`}
              onClick={handleMicClick}
            >
              🎤
            </button>
            <p className={styles.micLabel}>Tap to speak</p>
          </div>

          {/* Word card */}
          <div className={styles.wordCard}>
            <div className={styles.wordContainer}>
              {word.parts.map((part, index) => (
                <div key={index} className={styles.wordPartWrapper}>
                  {index > 0 && <div className={styles.syllableSeparator}>—</div>}
                  <div className={`${styles.wordPart} ${index === 0 ? styles.wordPartBlue : styles.wordPartGold}`}>
                    {part}
                  </div>
                </div>
              ))}
            </div>

            <p className={styles.wordPrompt}>Can you say this word?</p>
          </div>

          {/* Next button */}
          <button className={styles.nextButton}>›</button>
        </div>
      </div>

      {/* Navigation */}
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
      className={`nav-button ${active ? 'active' : ''}`}
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: active ? '#5bb5c0' : '#d4b48a',
        fontSize: '14px',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '0.85px',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: '26px' }}>
        {icon === 'home' && '🏠'}
        {icon === 'book' && '📚'}
        {icon === 'user' && '👤'}
      </span>
      <span>{label}</span>
      {active && (
        <div
          style={{
            position: 'absolute',
            bottom: '-4px',
            width: '7px',
            height: '7px',
            background: '#5bb5c0',
            borderRadius: '50%',
          }}
        />
      )}
    </button>
  )
}
