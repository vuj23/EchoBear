import styles from './Profile.module.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveLevel, loadLevel, loadLearnedWords } from '../utils/storyStorage'

type NavItem = 'home' | 'library' | 'profile'
type ReadingLevel = 1 | 2 | 3 | 4 | 5

const GOAL = 50

const readingLevels = [
  { level: 1, ages: '3-4', description: 'Learning letters & sounds' },
  { level: 2, ages: '4-5', description: 'Simple words & short phrases' },
  { level: 3, ages: '5-6', description: 'Short sentences & rhymes' },
  { level: 4, ages: '6-7', description: 'Longer stories & new words' },
  { level: 5, ages: '7-8', description: 'Rich vocabulary stories' },
]

export default function Profile() {
  const [active, setActive] = useState<NavItem>('profile')
  const [selectedLevel, setSelectedLevel] = useState<ReadingLevel>(() => loadLevel() as ReadingLevel)
  const [settings, setSettings] = useState({
    readAloud: true,
    backgroundMusic: false,
    wordHighlights: true,
    parentControls: false,
  })
  const navigate = useNavigate()

  const learnedWords = loadLearnedWords()
  const wordCount = learnedWords.length
  const progress = Math.min(100, Math.round((wordCount / GOAL) * 100))

  function handleLevelChange(level: ReadingLevel) {
    setSelectedLevel(level)
    saveLevel(level)
  }

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

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Reading Level</h2>
          <p className={styles.cardSubtitle}>Choose the level that fits your child best</p>

          <div className={styles.levelGrid}>
            {readingLevels.map((level) => (
              <button
                key={level.level}
                className={`${styles.levelButton} ${selectedLevel === level.level ? styles.levelButtonActive : ''}`}
                onClick={() => handleLevelChange(level.level as ReadingLevel)}
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

        <div className={styles.contentRow}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Words Learned</h2>
            <div className={styles.wordsCount}>{wordCount}</div>
            <div className={styles.wordsLabel}>WORDS LEARNED</div>

            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressText}>{wordCount} of {GOAL} — Goal: {GOAL} words</div>

            {learnedWords.length > 0 ? (
              <div className={styles.wordTags}>
                {learnedWords.map((word) => (
                  <span key={word} className={styles.wordTag}>{word}</span>
                ))}
              </div>
            ) : (
              <p className={styles.noWordsText}>Practice phonics in stories to add words here!</p>
            )}
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Settings</h2>
            <div className={styles.settingsList}>
              {[
                { key: 'readAloud' as const, icon: '🔊', title: 'Read Aloud', desc: 'Narrate the story out loud' },
                { key: 'backgroundMusic' as const, icon: '🎵', title: 'Background Music', desc: 'Soft sounds while reading' },
                { key: 'wordHighlights' as const, icon: '✏️', title: 'Word Highlights', desc: 'Highlight words as they\'re read' },
              ].map(({ key, icon, title, desc }) => (
                <div key={key} className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <div className={styles.settingIcon}>{icon}</div>
                    <div className={styles.settingContent}>
                      <div className={styles.settingTitle}>{title}</div>
                      <div className={styles.settingDesc}>{desc}</div>
                    </div>
                  </div>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={settings[key]} onChange={() => toggleSetting(key)} />
                    <span className={styles.toggleSwitch} />
                  </label>
                </div>
              ))}
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
        {icon === 'home' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
        {icon === 'book' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M6 3h11a2 2 0 0 1 2 2v15a1 1 0 0 1-1 1H7a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M5 5v16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
        {icon === 'user' && <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M12 13a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>}
      </span>
      <span className={styles.navLabel}>{label}</span>
      {active ? <span className={styles.navDot} aria-hidden="true" /> : <span className={styles.navDotSpacer} />}
    </button>
  )
}
