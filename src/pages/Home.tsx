import styles from './Home.module.css'
import { useState } from 'react'

import { useNavigate } from 'react-router-dom'

type NavItem = 'home' | 'library' | 'profile'

export default function Home() {
  const [active, setActive] = useState<NavItem>('home')
  const navigate = useNavigate()
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
            <button className={styles.micButton} type="button" aria-label="Tap to speak" onClick={() => navigate('/story')}>
              <span className={styles.micIcon} aria-hidden="true">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 11a7 7 0 0 1-14 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 21h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div className={styles.tapText} >Tap to speak</div>
          </div>
        </section>

        <section className={styles.right}>
          <img className={styles.logo} src="/Logo.png" alt="" />
        </section>
      </main>

      <footer className={styles.nav}>
        <NavButton active={active === 'home'} onClick={() => setActive('home')} label="HOME" icon="home" />
        <NavButton active={active === 'library'} onClick={() => setActive('library')} label="LIBRARY" icon="book" />
        <NavButton active={active === 'profile'} onClick={() => setActive('profile')} label="PROFILE" icon="user" />
      </footer>
    </div>
  )
}

function NavButton({
  active,
  label,
  icon,
  onClick
}: {
  active: boolean
  label: string
  icon: 'home' | 'book' | 'user',
  onClick?: () => void
}) {
  return (
    <button className={`${styles.navItem} ${active ? styles.navItemActive : ''}`} type="button" onClick={onClick}>
      <span className={styles.navIcon} aria-hidden="true">
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
      <span className={styles.navLabel}>{label}</span>
      {active ? <span className={styles.navDot} aria-hidden="true" /> : <span className={styles.navDotSpacer} />}
    </button>
  )
}