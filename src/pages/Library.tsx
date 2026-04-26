import styles from './Library.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Story {
  id: string
  letter: string
  title: string
  date: string
  pages: number
}

interface NavItem {
  label: string
  key: 'home' | 'library' | 'profile'
}

const stories: Story[] = [
  { id: '1', letter: 'r', title: 'The Little Red Flower', date: 'Apr 22', pages: 8 },
  { id: '2', letter: 'd', title: 'The Brave Dragon', date: 'Apr 20', pages: 12 },
  { id: '3', letter: 'f', title: "Freddie Frog's Big Jump", date: 'Apr 18', pages: 6 },
  { id: '4', letter: 's', title: 'A Unicorn Named Sparkle', date: 'Apr 14', pages: 10 },
  { id: '5', letter: 'm', title: 'To the Moon and Back', date: 'Apr 10', pages: 9 },
  { id: '6', letter: 'w', title: "Wally the Whale's Song", date: 'Apr 7', pages: 7 },
]

const navItems: NavItem[] = [
  { label: 'HOME', key: 'home' },
  { label: 'LIBRARY', key: 'library' },
  { label: 'PROFILE', key: 'profile' },
]

export default function Library() {
  const [active, setActive] = useState<'home' | 'library' | 'profile'>('library')
  const navigate = useNavigate()

  const handleNavClick = (key: 'home' | 'library' | 'profile') => {
    setActive(key)
    if (key === 'home') navigate('/')
    if (key === 'profile') navigate('/profile')
  }

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className={styles.heading}>My Story Library:</h1>

        {/* Stats Badge */}
        <div className={styles.statsBadge}>
          <div className={styles.statsIcon}>⭐</div>
          <div className={styles.statsContent}>
            <div className={styles.statsNumber}>19 words</div>
            <div className={styles.statsLabel}>LEARNED</div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className={styles.grid}>
          {stories.map((story) => (
            <div key={story.id} className={styles.storyCard}>
              <div className={styles.storyImageArea}>
                <div className={styles.storyIcon}>{story.letter}</div>
              </div>
              <div className={styles.storyContent}>
                <h2 className={styles.storyTitle}>{story.title}</h2>
                <div className={styles.storyMeta}>
                  <span className={styles.storyDate}>{story.date}</span>
                  <span className={styles.storyPages}>{story.pages} pages</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className={styles.navBar}>
        {navItems.map((item, index) => (
          <button
            key={index}
            className={`${styles.navItem} ${active === item.key ? styles.navItemActive : ''}`}
            onClick={() => handleNavClick(item.key)}
          >
            <div className={styles.navIcon}>
              {item.key === 'home' && '🏠'}
              {item.key === 'library' && '📚'}
              {item.key === 'profile' && '👤'}
            </div>
            <div className={styles.navLabel}>{item.label}</div>
            {item.key === 'library' && <div className={styles.navDot} />}
          </button>
        ))}
      </nav>
    </div>
  )
}
