import styles from './Story.module.css'
import navStyles from './Home.module.css'
import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import type { StoryJSON } from '../types'

type NavItem = 'home' | 'library' | 'profile'

const FALLBACK_STORY: StoryJSON = {
  title: 'The Little Red Flower',
  scenes: [
    { storyText: 'Once upon a time there was a little red flower. She lived in a garden.', pauseText: '', targetWord: '', wordSplit: '', phonemes: [], imagePrompt: '' },
    { storyText: 'One sunny day, a busy bee flew by. "Hello, little flower!" buzzed the bee.', pauseText: '', targetWord: '', wordSplit: '', phonemes: [], imagePrompt: '' },
    { storyText: 'The flower stood tall and brave. She shared her sweet nectar with a smile.', pauseText: '', targetWord: '', wordSplit: '', phonemes: [], imagePrompt: '' },
  ],
}

// key={pageIndex} on this component forces a full remount on scene change,
// naturally resetting loaded/failed state with no useEffect needed.
function SceneImage({ src, index }: { src: string | null; index: number }) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const retryCount = useRef(0)

  function handleError() {
    if (retryCount.current < 2) {
      retryCount.current += 1
      setFailed(true)
      setTimeout(() => setFailed(false), retryCount.current * 4000)
    } else {
      setFailed(true)
    }
  }

  if (!src || failed) {
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
        src={src}
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
  const navigate = useNavigate()
  const location = useLocation()

  const state = location.state as { story: StoryJSON; images: (string | null)[] } | null
  const story = state?.story ?? FALLBACK_STORY
  const imageUrls = state?.images ?? story.scenes.map(() => null)

  const [pageIndex, setPageIndex] = useState(0)

  const scene = story.scenes[pageIndex]
  const image = imageUrls[pageIndex] ?? null
  const isLastPage = pageIndex >= story.scenes.length - 1

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.imageCard}>
          <SceneImage key={pageIndex} src={image} index={pageIndex} />
        </div>

        <div className={styles.contentRow}>
          <div className={styles.textContent}>
            <p className={styles.storyLine}>{scene?.storyText}</p>
          </div>
          <button
            className={styles.nextButton}
            aria-label="Next page"
            type="button"
            onClick={() => { if (!isLastPage) setPageIndex(i => i + 1) }}
            disabled={isLastPage}
            style={isLastPage ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
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
