import { useEffect } from 'react'
import { teach } from '../api/elevenlabs'

interface Props {
  targetWord: string
  heardWord: string
  onShowPhonics: () => void
  onTryAgain: () => void
}

export default function WrongScreen({ targetWord, heardWord, onShowPhonics, onTryAgain }: Props) {
  useEffect(() => {
    teach(`Let's try together! The word is ${targetWord}. Can you say ${targetWord}?`)
  }, [targetWord])

  return (
    <div className="screen wrong-screen">
      <div className="result-icon">🤔</div>
      <h2 className="result-heading">Let's try together!</h2>
      <p className="result-sub">
        You said <strong>"{heardWord}"</strong>
        <br />
        The word is <strong>"{targetWord}"</strong>
      </p>

      <button className="cta-button" onClick={onShowPhonics}>
        Show me how! 🔤
      </button>
      <button className="secondary-btn" onClick={onTryAgain}>
        Try again 🎤
      </button>
    </div>
  )
}
