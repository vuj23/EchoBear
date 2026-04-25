/* StoryPage.tsx */
import styles from './Story.module.css'
import navStyles from './Home.module.css'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type NavItem = 'home' | 'library' | 'profile'

type StoryCard = {
  lines: string[]
}

// Temporary local story data (swap this later for generated story content)
const STORY: StoryCard[] = [
  { lines: ['Once upon a time there was a little red flower.', 'She lived in a garden. She loved to bloom.'] },
  { lines: ['One sunny day, a busy bee flew by.', '“Hello, little flower!” buzzed the bee.'] },
  { lines: ['The flower stood tall and brave.', 'She shared her sweet nectar with a smile.'] },
]

export default function StoryPage() {
  const [active, setActive] = useState<NavItem>('home')
  const navigate = useNavigate()

  const [pageIndex, setPageIndex] = useState(0)

  const page = useMemo(() => STORY[pageIndex] ?? STORY[0], [pageIndex])
  const isLastPage = pageIndex >= STORY.length - 1

  const goNext = () => {
    setPageIndex((i) => Math.min(i + 1, STORY.length - 1))
  }

  return (
    <div>
      <div className={styles.container}>
        {/* 1. The Image Card */}
        <div className={styles.imageCard}>
          <div className={styles.placeholderGrid}>{/* This represents your transparent grid area */}</div>
        </div>

        {/* 2. The Content Area */}
        <div className={styles.contentRow}>
          <div className={styles.textContent}>
            {page.lines.map((line, idx) => (
              <p key={idx} className={styles.storyLine}>
                {line}
              </p>
            ))}
          </div>

          {/* 3. The Next Button */}
          <button
            className={styles.nextButton}
            aria-label="Next page"
            type="button"
            onClick={goNext}
            disabled={isLastPage}
            style={isLastPage ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <footer className={navStyles.nav}>
        <NavButton
          active={active === 'home'}
          onClick={() => {
            navigate('/')
            setActive('home')
          }}
          label="HOME"
          icon="home"
        />
        <NavButton
          active={active === 'library'}
          onClick={() => {
            setActive('library')
          }}
          label="LIBRARY"
          icon="book"
        />
        <NavButton
          active={active === 'profile'}
          onClick={() => {
            setActive('profile')
          }}
          label="PROFILE"
          icon="user"
        />
      </footer>
    </div>
  )
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
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
            <path
              d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {icon === 'book' && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path d="M5 5v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        )}
        {icon === 'user' && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path
              d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span className={navStyles.navLabel}>{label}</span>
      {active ? <span className={navStyles.navDot} aria-hidden="true" /> : <span className={navStyles.navDotSpacer} />}
    </button>
  )
}