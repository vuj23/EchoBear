import { useEffect, useMemo } from 'react'
import { narrate } from '../api/elevenlabs'

const BADGE_COLORS = ['#FF6B9D', '#FFB800', '#6C3CE1', '#4CAF50', '#00BCD4', '#FF5722', '#9C27B0']
const CONFETTI_COLORS = [...BADGE_COLORS]

interface Props {
  learnedWords: string[]
  onNewStory: () => void
  onReadAgain: () => void
}

export default function EndScreen({ learnedWords, onNewStory, onReadAgain }: Props) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  )

  useEffect(() => {
    const count = learnedWords.length
    const text =
      count > 0
        ? `The End! Amazing! You learned ${count} word${count !== 1 ? 's' : ''} today: ${learnedWords.join(', ')}! Great job!`
        : `The End! Great job reading the whole story!`
    narrate(text)
  }, [])

  return (
    <div className="screen end-screen">
      <div className="confetti-wrap" aria-hidden>
        {confetti.map(c => (
          <div
            key={c.id}
            className="confetti-piece"
            style={{ left: c.left, animationDelay: c.delay, backgroundColor: c.color }}
          />
        ))}
      </div>

      <h1 className="end-heading">The End! 🎉</h1>

      {learnedWords.length > 0 ? (
        <>
          <p className="words-count">
            {learnedWords.length} word{learnedWords.length !== 1 ? 's' : ''} learned today!
          </p>
          <div className="words-badges">
            {learnedWords.map((word, i) => (
              <span
                key={word}
                className="word-badge"
                style={{
                  backgroundColor: BADGE_COLORS[i % BADGE_COLORS.length],
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                {word}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="words-count">Great job reading the whole story!</p>
      )}

      <div className="end-buttons">
        <button className="cta-button" onClick={onNewStory}>
          New story! ✨
        </button>
        <button className="secondary-btn" onClick={onReadAgain}>
          Read again 📖
        </button>
      </div>
    </div>
  )
}
