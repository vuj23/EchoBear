import styles from './Library.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStories } from '../utils/storyStorage'

export default function Library() {
  const [active, setActive] = useState<'home' | 'library' | 'profile'>('library')
  const navigate = useNavigate()
  const stories = loadStories()

  const handleNavClick = (key: 'home' | 'library' | 'profile') => {
    setActive(key)
    if (key === 'home') navigate('/')
    if (key === 'profile') navigate('/profile')
  }

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className={styles.heading}>My Story Library:</h1>

        <div className={styles.statsBadge}>
          <div className={styles.statsIcon}>⭐</div>
          <div className={styles.statsContent}>
            <div className={styles.statsNumber}>{stories.length} {stories.length === 1 ? 'story' : 'stories'}</div>
            <div className={styles.statsLabel}>SAVED</div>
          </div>
        </div>

        {stories.length === 0 ? (
          <div className={styles.empty}>
            <p>No stories yet!</p>
            <p>Generate a story from the home screen and it will appear here.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {stories.map((s) => (
              <div
                key={s.id}
                className={styles.storyCard}
                onClick={() => navigate('/story', { state: { story: s.story, images: s.images } })}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.storyImageArea}>
                  <div className={styles.storyIcon}>{s.letter}</div>
                </div>
                <div className={styles.storyContent}>
                  <h2 className={styles.storyTitle}>{s.title}</h2>
                  <div className={styles.storyMeta}>
                    <span className={styles.storyDate}>{s.date}</span>
                    <span className={styles.storyPages}>{s.pages} scenes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className={styles.navBar}>
        {(['home', 'library', 'profile'] as const).map((key) => (
          <button
            key={key}
            className={`${styles.navItem} ${active === key ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick(key)}
          >
            <div className={styles.navIcon}>
              {key === 'home' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
              {key === 'library' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M5 5v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
              {key === 'profile' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
            </div>
            <div className={styles.navLabel}>{key.toUpperCase()}</div>
            {key === 'library' && active === 'library' && <div className={styles.navDot} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
