import styles from './Story.module.css'
import navStyles from './Home.module.css'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { StoryJSON } from '../types'
import { generateImage } from '../api/groq'
import { saveStory, saveLearnedWord } from '../utils/storyStorage'

type NavItem = 'home' | 'library' | 'profile'
type Phase = 'reading' | 'practicing'
type PracticeResult = 'idle' | 'correct' | 'wrong'

declare global {
  interface Window {
    SpeechRecognition: unknown
    webkitSpeechRecognition: unknown
  }
}

const ELEVEN_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const ELEVEN_VOICE_ID = '4Mhjd1Q9JRWcKfDQvn26'

const FALLBACK_STORY: StoryJSON = {
  title: 'The Little Red Flower',
  scenes: [
    { storyText: 'Once upon a time there was a little red flower. She lived in a garden.', pauseText: '', targetWord: '', wordSplit: '', phonemes: [], imagePrompt: '' },
    { storyText: 'One sunny day, a busy bee flew by. "Hello, little flower!" buzzed the bee.', pauseText: '', targetWord: '', wordSplit: '', phonemes: [], imagePrompt: '' },
    { storyText: 'The flower stood tall and brave. She shared her sweet nectar with a smile.', pauseText: '', targetWord: '', wordSplit: '', phonemes: [], imagePrompt: '' },
  ],
}

function SceneImage({ src, index }: { src: string | null; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const [currentSrc, setCurrentSrc] = useState(src)
  const [permanentFail, setPermanentFail] = useState(false)
  const retryCount = useRef(0)

  function handleError() {
    if (retryCount.current < 2) {
      retryCount.current += 1
      const n = retryCount.current
      setTimeout(() => {
        setLoaded(false)
        setCurrentSrc(src ? `${src}&_r=${n}` : null)
      }, n * 4000)
    } else {
      setPermanentFail(true)
    }
  }

  if (!currentSrc || permanentFail) {
    return (
      <div className={styles.imagePlaceholder}>
        {(['🌟', '🌈', '🦋', '🌺'] as const)[index % 4]}
      </div>
    )
  }

  return (
    <>
      {!loaded && (
        <div className={styles.imagePlaceholder}>
          <span className={styles.imageSpinner} />
        </div>
      )}
      <img
        src={currentSrc}
        alt={`Scene ${index + 1}`}
        referrerPolicy="no-referrer"
        className={styles.sceneImage}
        style={loaded ? undefined : { display: 'none' }}
        onLoad={() => setLoaded(true)}
        onError={handleError}
      />
    </>
  )
}

export default function StoryPage() {
  const [active, setActive] = useState<NavItem>('home')
  const [pageIndex, setPageIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('reading')

  // Practice states
  const [practiceResult, setPracticeResult] = useState<PracticeResult>('idle')
  const [heardWord, setHeardWord] = useState('')
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isAudioLoadingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { story: StoryJSON; images?: (string | null)[] } | null
  const story = state?.story ?? FALLBACK_STORY

  const [imageUrls] = useState<(string | null)[]>(
    () => state?.images ?? story.scenes.map(s => s.imagePrompt ? generateImage(s.imagePrompt) : null)
  )

  const scene = story.scenes[pageIndex]
  const image = imageUrls[pageIndex] ?? null
  const isLastPage = pageIndex >= story.scenes.length - 1
  const wordParts = scene?.wordSplit?.split('—') ?? [scene?.targetWord ?? '']

  // Save to library on first load
  useEffect(() => {
    saveStory(story, imageUrls)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function goToPage(index: number) {
    recognitionRef.current?.stop()
    setPageIndex(index)
    setPhase('reading')
    setPracticeResult('idle')
    setHeardWord('')
    setIsListening(false)
  }

  const playStoryText = useCallback(async (text: string) => {
    // Cancel any in-flight request and stop current audio
    abortRef.current?.abort()
    const abort = new AbortController()
    abortRef.current = abort

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    try {
      isAudioLoadingRef.current = true
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVEN_API_KEY,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: 0.8, style: 0.0, use_speaker_boost: true },
          }),
          signal: abort.signal,
        }
      )
      if (abort.signal.aborted) return
      const blob = await res.blob()
      if (abort.signal.aborted) return
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio
      isAudioLoadingRef.current = false
      audio.play()
      audio.onended = () => URL.revokeObjectURL(url)
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return
      console.error('ElevenLabs error:', error)
      isAudioLoadingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (scene?.storyText) playStoryText(scene.storyText)
    return () => {
      abortRef.current?.abort()
      audioRef.current?.pause()
    }
  }, [scene?.storyText, playStoryText])

  function advanceScene() {
    if (isLastPage) navigate('/')
    else goToPage(pageIndex + 1)
  }

  function handleNextClick() {
    if (scene?.targetWord) {
      audioRef.current?.pause()
      audioRef.current = null
      setPhase('practicing')
    } else {
      advanceScene()
    }
  }

  function handleMicClick() {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    setPracticeResult('idle')
    setHeardWord('')

    const rec = new (SR as any)()
    rec.lang = 'en-US'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      const spoken = e.results[0][0].transcript.trim().toLowerCase()
      setHeardWord(spoken)
      const correct = spoken.includes(scene.targetWord.toLowerCase())
      setPracticeResult(correct ? 'correct' : 'wrong')
      if (correct) {
        saveLearnedWord(scene.targetWord)
        setTimeout(() => advanceScene(), 1400)
      }
      setIsListening(false)
    }
    rec.onend = () => setIsListening(false)
    rec.onerror = () => { setIsListening(false); setPracticeResult('wrong') }
    recognitionRef.current = rec
    rec.start()
    setIsListening(true)
  }

  if (phase === 'practicing' && scene?.targetWord) {
    return (
      <div>
        <div className={styles.practiceScreen}>
          <div className={styles.practiceCard}>
            <p className={styles.practicePrompt}>
              {scene.pauseText ? `"${scene.pauseText}"` : 'Can you say this word?'}
            </p>

            <div className={styles.wordDisplay}>
              {wordParts.map((part, i) => (
                <div key={i} className={styles.wordPartWrapper}>
                  {i > 0 && <span className={styles.syllableSep}>—</span>}
                  <div className={`${styles.wordPart} ${i === 0 ? styles.wordPartBlue : styles.wordPartGold}`}>
                    {part}
                  </div>
                </div>
              ))}
            </div>

            {practiceResult === 'wrong' && scene.phonemes.length > 0 && (
              <div className={styles.phonemeRow}>
                {scene.phonemes.map((p, i) => (
                  <span key={i} className={styles.phoneme}>{p}</span>
                ))}
              </div>
            )}

            <button
              className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`}
              onClick={handleMicClick}
              aria-label={isListening ? 'Listening' : 'Tap to speak'}
            >
              {isListening ? '🎙️' : '🎤'}
            </button>
            <p className={styles.micLabel}>{isListening ? 'Listening…' : 'Tap to speak'}</p>

            {practiceResult === 'correct' && (
              <div className={styles.feedbackCorrect}>Great job! 🌟 Word added to your list!</div>
            )}
            {practiceResult === 'wrong' && heardWord && (
              <div className={styles.feedbackWrong}>
                I heard "<strong>{heardWord}</strong>" — try saying <strong>{scene.targetWord}</strong>
              </div>
            )}

            <button className={styles.skipBtn} onClick={advanceScene}>
              Skip →
            </button>
          </div>

          <div className={styles.dots}>
            {story.scenes.map((_, i) => (
              <span
                key={i}
                className={`${styles.dot} ${i === pageIndex ? styles.dotActive : i < pageIndex ? styles.dotDone : ''}`}
              />
            ))}
          </div>
        </div>

        <footer className={navStyles.nav}>
          <NavButton active={active === 'home'} onClick={() => { navigate('/'); setActive('home') }} label="HOME" icon="home" />
          <NavButton active={active === 'library'} onClick={() => setActive('library')} label="LIBRARY" icon="book" />
          <NavButton active={active === 'profile'} onClick={() => setActive('profile')} label="PROFILE" icon="user" />
        </footer>
      </div>
    )
  }

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.imageCard}>
          <SceneImage key={pageIndex} src={image} index={pageIndex} />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.textContent}>
            <p className={styles.storyLine}>
              {scene?.storyText}
              <button
                className={styles.audioTrigger}
                onClick={() => playStoryText(scene.storyText)}
                aria-label="Replay audio"
              >
                🔊
              </button>
            </p>
          </div>
          <button
            className={styles.nextButton}
            aria-label="Next"
            type="button"
            onClick={handleNextClick}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className={styles.dots}>
          {story.scenes.map((_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i === pageIndex ? styles.dotActive : i < pageIndex ? styles.dotDone : ''}`}
            />
          ))}
        </div>
      </div>

      <footer className={navStyles.nav}>
        <NavButton active={active === 'home'} onClick={() => { navigate('/'); setActive('home') }} label="HOME" icon="home" />
        <NavButton active={active === 'library'} onClick={() => setActive('library')} label="LIBRARY" icon="book" />
        <NavButton active={active === 'profile'} onClick={() => setActive('profile')} label="PROFILE" icon="user" />
      </footer>
    </div>
  )
}

function NavButton({ active, label, icon, onClick }: {
  active: boolean
  label: string
  icon: 'home' | 'book' | 'user'
  onClick?: () => void
}) {
  return (
    <button className={`${navStyles.navItem} ${active ? navStyles.navItemActive : ''}`} type="button" onClick={onClick}>
      <span className={navStyles.navIcon} aria-hidden="true">
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
      <span className={navStyles.navLabel}>{label}</span>
      {active ? <span className={navStyles.navDot} aria-hidden="true" /> : <span className={navStyles.navDotSpacer} />}
    </button>
  )
}
