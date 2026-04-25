import { useEffect, useMemo } from 'react'
import { narrate } from '../api/elevenlabs'

const CONFETTI_COLORS = ['#FF6B9D', '#FFB800', '#6C3CE1', '#4CAF50', '#00BCD4', '#FF5722']

interface Props {
  targetWord: string
  heardWord: string
  onKeepReading: () => void
}

export default function CorrectScreen({ targetWord, heardWord, onKeepReading }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 1.2}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  )

  useEffect(() => {
    narrate(`Amazing job! You said ${targetWord} perfectly! Keep reading!`)
  }, [targetWord])

  return (
    <div className="screen correct-screen">
      <div className="confetti-wrap" aria-hidden>
        {confetti.map(c => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{ left: c.left, animationDelay: c.delay, backgroundColor: c.color }}
          />
        ))}
      </div>

      <div className="result-icon">⭐</div>
      <h2 className="result-heading">Amazing job!</h2>
      <p className="result-sub">
        You said <strong>"{heardWord}"</strong>
        <br />
        The word was <strong>"{targetWord}"</strong>
      </p>

      <button className="cta-button" onClick={onKeepReading}>
        Keep reading! 📖
      </button>
    </div>
  )
}
