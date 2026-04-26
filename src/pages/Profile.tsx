import styles from './Profile.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type NavItem = 'home' | 'library' | 'profile'
type ReadingLevel = 1 | 2 | 3 | 4 | 5

const readingLevels = [
  { level: 1, ages: '3-4', description: 'Learning letters & sounds' },
  { level: 2, ages: '4-5', description: 'Simple words & short phrases' },
  { level: 3, ages: '5-6', description: 'Short sentences & rhymes' },
  { level: 4, ages: '6-7', description: 'Longer stories & new words' },
  { level: 5, ages: '7-8', description: 'Rich vocabulary stories' },
]

const learnedWords = ['red', 'flower', 'garden', 'dragon', 'brave', 'frog', 'jump', 'moon', 'star', 'whale', 'song', 'magic']

export default function Profile() {
  const [active, setActive] = useState<NavItem>('profile')
  const [selectedLevel, setSelectedLevel] = useState<ReadingLevel>(2)
  const [settings, setSettings] = useState({
    readAloud: true,
    backgroundMusic: false,
    wordHighlights: true,
    parentControls: false,
  })
  const navigate = useNavigate()

  const handleNavClick = (key: NavItem) => {
    setActive(key)
    if (key === 'home') navigate('/')
    if (key === 'library') navigate('/library')
  }

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const selectedLevelData = readingLevels.find(l => l.level === selectedLevel)

  return (
    <div className={styles.screen}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Profile:</h1>

        {/* Reading Level Section */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Reading Level</h2>
          <p className={styles.cardSubtitle}>Choose the level that fits your child best</p>

          <div className={styles.levelGrid}>
            {readingLevels.map((level) => (
              <button
                key={level.level}
                className={`${styles.levelButton} ${selectedLevel === level.level ? styles.levelButtonActive : ''}`}
                onClick={() => setSelectedLevel(level.level as ReadingLevel)}
              >
                <div className={styles.levelNumber}>{level.level}</div>
                <div className={styles.levelAges}>Ages {level.ages}</div>
                <div className={styles.levelDesc}>{level.description}</div>
              </button>
            ))}
          </div>

          {selectedLevelData && (
            <div className={styles.selectedLevelInfo}>
              <div className={styles.selectedLevelIcon}>●</div>
              <span className={styles.selectedLevelText}>
                Level {selectedLevel} — {selectedLevelData.description} ({selectedLevelData.ages})
              </span>
            </div>
          )}
        </div>

        {/* Content Row */}
        <div className={styles.contentRow}>
          {/* Words Learned */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Words Learned</h2>
            <div className={styles.wordsCount}>19</div>
            <div className={styles.wordsLabel}>WORDS LEARNED</div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '38%' }}></div>
            </div>
            <div className={styles.progressText}>19 of 50 — Goal: 50 words</div>

            <div className={styles.wordTags}>
              {learnedWords.map((word) => (
                <span key={word} className={styles.wordTag}>
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Settings</h2>

            <div className={styles.settingsList}>
              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingIcon}>🔊</div>
                  <div className={styles.settingContent}>
                    <div className={styles.settingTitle}>Read Aloud</div>
                    <div className={styles.settingDesc}>Narrate the story out loud</div>
                  </div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={settings.readAloud}
                    onChange={() => toggleSetting('readAloud')}
                  />
                  <span className={styles.toggleSwitch}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingIcon}>🎵</div>
                  <div className={styles.settingContent}>
                    <div className={styles.settingTitle}>Background Music</div>
                    <div className={styles.settingDesc}>Soft sounds while reading</div>
                  </div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={settings.backgroundMusic}
                    onChange={() => toggleSetting('backgroundMusic')}
                  />
                  <span className={styles.toggleSwitch}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingIcon}>✏️</div>
                  <div className={styles.settingContent}>
                    <div className={styles.settingTitle}>Word Highlights</div>
                    <div className={styles.settingDesc}>Highlight words as they're read</div>
                  </div>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={settings.wordHighlights}
                    onChange={() => toggleSetting('wordHighlights')}
                  />
                  <span className={styles.toggleSwitch}></span>
                </label>
              </div>

              <div className={styles.settingItem}>
                <div className={styles.settingInfo}>
                  <div className={styles.settingIcon}>🔒</div>
                  <div className={styles.settingContent}>
                    <div className={styles.settingTitle}>Parent Controls</div>
                    <div className={styles.settingDesc}>Manage content and screen time</div>
                  </div>
                </div>
                <div className={styles.settingArrow}>›</div>
              </div>
            </div>
          </div>
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
