import { useState } from 'react'
import { generateStory, generateImages } from './api/gemini'
import type { StoryJSON } from './types'

export default function TestPage() {
  const [prompt, setPrompt] = useState('A little bear finds a glowing cave')
  const [level, setLevel] = useState(2)

  const [storyLoading, setStoryLoading] = useState(false)
  const [storyStatus, setStoryStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [storyError, setStoryError] = useState<string | null>(null)
  const [story, setStory] = useState<StoryJSON | null>(null)
  const [sceneImages, setSceneImages] = useState<(string | null)[]>([])

  const [imageLoading, setImageLoading] = useState(false)
  const [imageStatus, setImageStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [imageError, setImageError] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  async function handleTestStory() {
    if (!prompt.trim()) return

    setStoryLoading(true)
    setStoryStatus('idle')
    setStoryError(null)
    setStory(null)
    setSceneImages([])

    try {
      const result = await generateStory(prompt.trim(), level)
      setStory(result)
      const images = await generateImages(result.scenes.map(scene => scene.imagePrompt))
      setSceneImages(images)
      setStoryStatus('success')
    } catch (e) {
      setStoryStatus('error')
      setStoryError(e instanceof Error ? e.message : String(e))
    } finally {
      setStoryLoading(false)
    }
  }

  async function handleTestImage() {
    const imagePrompt =
      story?.scenes[0]?.imagePrompt || `${prompt.trim() || 'A friendly bear reading'} in children storybook style`

    setImageLoading(true)
    setImageStatus('idle')
    setImageError(null)
    setImagePreview(null)

    try {
      const images = await generateImages([imagePrompt])
      const firstImage = images[0]
      if (!firstImage) throw new Error('Image URL was empty')
      setImagePreview(firstImage)
      setImageStatus('success')
    } catch (e) {
      setImageStatus('error')
      setImageError(e instanceof Error ? e.message : String(e))
    } finally {
      setImageLoading(false)
    }
  }

  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ marginBottom: 10 }}>Simple AI Key Test</h2>
      <p style={{ marginTop: 0, marginBottom: 18, color: '#666' }}>
        Test storytelling and image generation separately.
      </p>

      <div style={{ background: '#f8f8ff', border: '1px solid #ded9ff', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#5a4ab9', fontWeight: 700, marginBottom: 6 }}>Config check</div>
        <div style={{ fontSize: 14 }}>
          Story model key (`VITE_GEMMA_API_KEY`):{' '}
          <strong>{import.meta.env.VITE_GEMMA_API_KEY ? 'Detected' : 'Missing'}</strong>
        </div>
        <div style={{ fontSize: 14, marginTop: 4 }}>
          Image key (`VITE_POLLINATIONS_API_KEY`):{' '}
          <strong>{import.meta.env.VITE_POLLINATIONS_API_KEY ? 'Detected' : 'Missing (optional)'}</strong>
        </div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 6 }}>
          Image generation now uses `gen.pollinations.ai/image/...` and includes key when provided.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input
          style={{ flex: 1, padding: '10px 14px', fontSize: 16, borderRadius: 10, border: '2px solid #9B6DFF' }}
          placeholder="Story prompt for testing..."
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleTestStory()}
        />
        <select
          style={{ padding: '10px 14px', fontSize: 16, borderRadius: 10, border: '2px solid #9B6DFF' }}
          value={level}
          onChange={e => setLevel(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <button
          style={{ padding: '10px 18px', fontSize: 15, borderRadius: 10, background: '#6C3CE1', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          onClick={handleTestStory}
          disabled={storyLoading || !prompt.trim()}
        >
          {storyLoading ? 'Testing story...' : 'Test Story API'}
        </button>
        <button
          style={{ padding: '10px 18px', fontSize: 15, borderRadius: 10, background: '#0f766e', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}
          onClick={handleTestImage}
          disabled={imageLoading}
        >
          {imageLoading ? 'Testing image...' : 'Test Image API'}
        </button>
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <div style={{ background: '#f5f3ff', padding: 10, borderRadius: 10, fontSize: 14 }}>
          Story test:{' '}
          <strong>
            {storyStatus === 'success' ? 'PASS' : storyStatus === 'error' ? 'FAIL' : 'Not run yet'}
          </strong>
        </div>
        {storyError && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 10, fontSize: 14 }}>
            {storyError}
          </div>
        )}
        <div style={{ background: '#ecfeff', padding: 10, borderRadius: 10, fontSize: 14 }}>
          Image test:{' '}
          <strong>
            {imageStatus === 'success' ? 'PASS' : imageStatus === 'error' ? 'FAIL' : 'Not run yet'}
          </strong>
        </div>
        {imageError && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 10, fontSize: 14 }}>
            {imageError}
          </div>
        )}
      </div>

      {story && (
        <>
          <h3 style={{ color: '#6C3CE1', marginBottom: 12 }}>Story Result: "{story.title}"</h3>
          <p style={{ marginTop: 0, color: '#666', fontSize: 13 }}>
            Story API is working if scenes are shown below.
          </p>

          <div style={{ display: 'grid', gap: 20 }}>
            {story.scenes.map((scene, i) => (
              <div key={i} style={{ border: '2px solid #e0d0ff', borderRadius: 14, overflow: 'hidden', background: 'white' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr' }}>
                  <div style={{ background: '#f0e6ff', minHeight: 210, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                    {sceneImages[i] ? (
                      <img
                        src={sceneImages[i] ?? ''}
                        alt={`Scene ${i + 1}`}
                        style={{ width: '100%', height: '100%', minHeight: 210, objectFit: 'cover', display: 'block' }}
                      />
                    ) : (
                      '📝'
                    )}
                  </div>
                  <div style={{ padding: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#9B6DFF', textTransform: 'uppercase', marginBottom: 6 }}>Scene {i + 1}</div>
                    <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{scene.storyText}</p>

                    {scene.targetWord && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                        <Tag label="Target word" value={scene.targetWord} color="#FFB800" />
                        <Tag label="Split" value={scene.wordSplit} color="#FF6B9D" />
                        <Tag label="Phonemes" value={scene.phonemes.join(' -> ')} color="#6C3CE1" />
                      </div>
                    )}

                    <div style={{ fontSize: 12, color: '#888', marginTop: 8, fontStyle: 'italic' }}>
                      Image prompt: {scene.imagePrompt}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <details style={{ marginTop: 20 }}>
            <summary style={{ cursor: 'pointer', fontWeight: 700, color: '#6C3CE1' }}>Raw JSON</summary>
            <pre style={{ background: '#f4f0ff', padding: 16, borderRadius: 10, fontSize: 12, overflow: 'auto', marginTop: 8 }}>
              {JSON.stringify(story, null, 2)}
            </pre>
          </details>
        </>
      )}

      {imagePreview && (
        <div style={{ marginTop: 20 }}>
          <h3 style={{ color: '#0f766e', marginBottom: 8 }}>Image Result</h3>
          <p style={{ marginTop: 0, color: '#666', fontSize: 13 }}>
            Image API is working if this preview loads.
          </p>
          <div style={{ border: '2px solid #99f6e4', borderRadius: 12, overflow: 'hidden', maxWidth: 520 }}>
            <img src={imagePreview} alt="Image test preview" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      )}
    </div>
  )
}

function Tag({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ fontSize: 13 }}>
      <span style={{ color: '#888', marginRight: 4 }}>{label}:</span>
      <span style={{ background: `${color}22`, color, padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{value}</span>
    </div>
  )
}
