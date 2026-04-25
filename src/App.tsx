import { useState } from 'react'
import TestPage from './TestPage'
import { generateStory, generateImages } from './api/gemini'
import { isCorrect } from './utils/pronunciation'
import { DEMO_STORY } from './demoStory'
import type { AppScreen, StoryJSON } from './types'
import ErrorToast from './components/ErrorToast'
import HomeScreen from './screens/HomeScreen'
import LoadingScreen from './screens/LoadingScreen'
import StorySceneScreen from './screens/StorySceneScreen'
import WordMomentScreen from './screens/WordMomentScreen'
import CorrectScreen from './screens/CorrectScreen'
import WrongScreen from './screens/WrongScreen'
import PhonicsScaffoldScreen from './screens/PhonicsScaffoldScreen'
import EndScreen from './screens/EndScreen'
import './App.css'

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('home')
  const [level, setLevel] = useState(2)
  const [story, setStory] = useState<StoryJSON | null>(null)
  const [sceneImages, setSceneImages] = useState<(string | null)[]>([])
  const [currentScene, setCurrentScene] = useState(0)
  const [heardWord, setHeardWord] = useState('')
  const [learnedWords, setLearnedWords] = useState<string[]>([])
  const [currentAttempts, setCurrentAttempts] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)

  async function handleMakeStory(prompt: string, lvl: number) {
    setLevel(lvl)
    setScreen('loading')
    setCurrentScene(0)
    setLearnedWords([])
    setApiError(null)

    try {
      const newStory = await generateStory(prompt, lvl)
      const images = await generateImages(newStory.scenes.map(s => s.imagePrompt))
      setStory(newStory)
      setSceneImages(images)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('Story generation failed:', msg)
      setApiError(`Story generation failed — using demo story. (${msg.slice(0, 80)})`)
      setStory(DEMO_STORY)
      setSceneImages(DEMO_STORY.scenes.map(() => null))
    }

    setScreen('scene')
  }

  function advanceScene() {
    if (!story) return
    const next = currentScene + 1
    if (next < story.scenes.length) {
      setCurrentScene(next)
      setScreen('scene')
    } else {
      setScreen('end')
    }
  }

  function handleContinue() {
    if (!story) return
    const scene = story.scenes[currentScene]
    if (scene.targetWord) {
      setCurrentAttempts(0)
      setScreen('word-moment')
    } else {
      advanceScene()
    }
  }

  function handleWordResult(heard: string) {
    if (!story) return
    const target = story.scenes[currentScene].targetWord
    setHeardWord(heard)
    if (isCorrect(heard, target)) {
      setLearnedWords(prev => prev.includes(target) ? prev : [...prev, target])
      setScreen('correct')
    } else {
      setCurrentAttempts(prev => prev + 1)
      setScreen('wrong')
    }
  }

  function handleNewStory() {
    setStory(null)
    setSceneImages([])
    setCurrentScene(0)
    setLearnedWords([])
    setApiError(null)
    setScreen('home')
  }

  function handleReadAgain() {
    setCurrentScene(0)
    setLearnedWords([])
    setScreen('scene')
  }

  const scene = story?.scenes[currentScene]

  if (new URLSearchParams(window.location.search).has('test')) {
    return <TestPage />
  }

  function renderScreen() {
    switch (screen) {
      case 'home':
        return <HomeScreen initialLevel={level} onMakeStory={handleMakeStory} />

      case 'loading':
        return <LoadingScreen />

      case 'scene':
        if (!story || !scene) return null
        return (
          <StorySceneScreen
            key={`scene-${currentScene}`}
            scene={scene}
            sceneIndex={currentScene}
            totalScenes={story.scenes.length}
            image={sceneImages[currentScene] ?? null}
            learnedCount={learnedWords.length}
            onContinue={handleContinue}
          />
        )

      case 'word-moment':
        if (!scene) return null
        return (
          <WordMomentScreen
            key={`wm-${currentScene}-${currentAttempts}`}
            scene={scene}
            attempts={currentAttempts}
            onResult={handleWordResult}
            onSkip={advanceScene}
          />
        )

      case 'correct':
        if (!scene) return null
        return (
          <CorrectScreen
            targetWord={scene.targetWord}
            heardWord={heardWord}
            onKeepReading={advanceScene}
          />
        )

      case 'wrong':
        if (!scene) return null
        return (
          <WrongScreen
            targetWord={scene.targetWord}
            heardWord={heardWord}
            onShowPhonics={() => setScreen('phonics')}
            onTryAgain={() => setScreen('word-moment')}
          />
        )

      case 'phonics':
        if (!scene) return null
        return (
          <PhonicsScaffoldScreen
            targetWord={scene.targetWord}
            wordSplit={scene.wordSplit}
            phonemes={scene.phonemes}
            onComplete={() => {
              setCurrentAttempts(prev => prev + 1)
              setScreen('word-moment')
            }}
          />
        )

      case 'end':
        return (
          <EndScreen
            learnedWords={learnedWords}
            onNewStory={handleNewStory}
            onReadAgain={handleReadAgain}
          />
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderScreen()}
      {apiError && (
        <ErrorToast message={apiError} onDismiss={() => setApiError(null)} />
      )}
    </>
  )
}
