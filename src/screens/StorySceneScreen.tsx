import { useEffect, useRef, useState } from 'react'
import { narrate } from '../api/elevenlabs'
import type { Scene } from '../types'

const FALLBACK_EMOJIS = ['🌟', '🌈', '🦋', '🌺', '🏔️', '🐉', '🦄']

interface Props {
  scene: Scene
  sceneIndex: number
  totalScenes: number
  image: string | null
  learnedCount: number
  onContinue: () => void
}

export default function StorySceneScreen({
  scene,
  sceneIndex,
  totalScenes,
  image,
  learnedCount,
  onContinue,
}: Props) {
  const didPlayRef = useRef(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (didPlayRef.current) return
    didPlayRef.current = true
    narrate(scene.storyText)
  }, [scene.storyText])

  useEffect(() => {
    // Reset failure state whenever the scene image changes.
    setImageFailed(false)
  }, [image])

  function renderText() {
    if (!scene.targetWord) {
      return <p className="scene-text">{scene.storyText}</p>
    }
    const regex = new RegExp(`(${scene.targetWord})`, 'i')
    const parts = scene.storyText.split(regex)
    return (
      <p className="scene-text">
        {parts.map((part, i) =>
          part.toLowerCase() === scene.targetWord.toLowerCase() ? (
            <span key={i} className="target-word">{part}</span>
          ) : (
            part
          )
        )}
      </p>
    )
  }

  return (
    <div className="screen scene-screen">
      <div className="scene-header">
        <div className="scene-dots">
          {Array.from({ length: totalScenes }, (_, i) => (
            <div
              key={i}
              className={`dot ${i === sceneIndex ? 'active' : i < sceneIndex ? 'done' : ''}`}
            />
          ))}
        </div>
        {learnedCount > 0 && (
          <div className="words-badge">⭐ {learnedCount}</div>
        )}
      </div>

      <div className="scene-image-wrap">
        {image && !imageFailed ? (
          <img
            src={image}
            alt="Story scene"
            className="scene-image"
            onError={() => {
              console.warn(`Scene image failed to load (scene ${sceneIndex + 1})`)
              setImageFailed(true)
            }}
          />
        ) : (
          <div className="scene-image-fallback">
            {FALLBACK_EMOJIS[sceneIndex % FALLBACK_EMOJIS.length]}
          </div>
        )}
      </div>

      <div className="scene-bottom">
        {renderText()}
        <button className="continue-btn" onClick={onContinue}>
          Continue →
        </button>
      </div>
    </div>
  )
}
