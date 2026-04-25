import { useState, useEffect, useRef } from 'react'
import { teach } from '../api/elevenlabs'

interface Props {
  targetWord: string
  wordSplit: string
  phonemes: string[]
  onComplete: () => void
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function PhonicsScaffoldScreen({
  targetWord,
  wordSplit,
  phonemes,
  onComplete,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [done, setDone] = useState(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    async function playSequence() {
      await delay(400)
      for (let i = 0; i < phonemes.length; i++) {
        if (cancelledRef.current) return
        setActiveIndex(i)
        await teach(phonemes[i])
        await delay(350)
      }
      if (cancelledRef.current) return
      setActiveIndex(-1)
      await delay(300)
      await teach(`Now you try! Say the whole word: ${targetWord}`)
      if (!cancelledRef.current) setDone(true)
    }

    playSequence()
    return () => {
      cancelledRef.current = true
    }
  }, [targetWord, phonemes])

  return (
    <div className="screen phonics-screen">
      <h2 className="phonics-title">Let's sound it out! 🔤</h2>

      <div className="phonics-tiles">
        {phonemes.map((p, i) => (
          <div
            key={i}
            className={`phonics-tile ${
              i === activeIndex ? 'active' : i < activeIndex ? 'done' : ''
            }`}
          >
            {p}
          </div>
        ))}
      </div>

      {wordSplit && (
        <div className="word-split-display small">{wordSplit}</div>
      )}

      {done && (
        <button className="cta-button" onClick={onComplete}>
          Now I'll try! 🎤
        </button>
      )}
    </div>
  )
}
