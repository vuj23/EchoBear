import { useState, useEffect, useRef } from 'react'
import './App.css'

type WordData = {
  word: string
  syllables: string[]
  visual: string
}

type Story = {
  title: string
  sentences: string[]
  wordsToRead: WordData[]
}

type StoryKey = 'spiderman' | 'princess' | 'dinosaur'

const stories: Record<StoryKey, Story> = {
  spiderman: {
    title: "Spiderman's Adventure",
    sentences: [
      "Once upon a time, there was a brave spider named Spiderman.",
      "He lived in a big city called New York.",
      "One day, a bad guy tried to steal a bank.",
      "Spiderman swung in and stopped him.",
      "The people cheered for Spiderman."
    ],
    wordsToRead: [
      { word: "spider", syllables: ["spi", "der"], visual: "🕷️" },
      { word: "city", syllables: ["cit", "y"], visual: "🏙️" },
      { word: "bad", syllables: ["bad"], visual: "😈" },
      { word: "swung", syllables: ["swung"], visual: "🕸️" },
      { word: "cheered", syllables: ["cheered"], visual: "🎉" }
    ]
  },
  princess: {
    title: "The Princess and the Dragon",
    sentences: [
      "Once upon a time, there was a beautiful princess.",
      "She lived in a tall castle with her family.",
      "One day, a scary dragon came to the castle.",
      "The princess was brave and talked to the dragon.",
      "They became friends and lived happily ever after."
    ],
    wordsToRead: [
      { word: "princess", syllables: ["prin", "cess"], visual: "👸" },
      { word: "castle", syllables: ["cas", "tle"], visual: "🏰" },
      { word: "dragon", syllables: ["drag", "on"], visual: "🐉" },
      { word: "brave", syllables: ["brave"], visual: "🦸" },
      { word: "friends", syllables: ["friends"], visual: "👫" }
    ]
  },
  dinosaur: {
    title: "Dino's Big Adventure",
    sentences: [
      "In a jungle long ago, there lived a big dinosaur.",
      "His name was Rex and he had sharp teeth.",
      "One day, Rex found a shiny rock.",
      "He showed it to his dinosaur friends.",
      "They all played together happily."
    ],
    wordsToRead: [
      { word: "dinosaur", syllables: ["di", "no", "saur"], visual: "🦕" },
      { word: "jungle", syllables: ["jun", "gle"], visual: "🌴" },
      { word: "teeth", syllables: ["teeth"], visual: "🦷" },
      { word: "rock", syllables: ["rock"], visual: "🪨" },
      { word: "friends", syllables: ["friends"], visual: "👫" }
    ]
  }
}

function generateStory(topic: string): Story {
  return {
    title: `${topic.charAt(0).toUpperCase() + topic.slice(1)}'s Story`,
    sentences: [
      `Once upon a time, there was a ${topic}.`,
      `The ${topic} lived in a fun place.`,
      `One day, the ${topic} had an adventure.`,
      `The ${topic} met new friends.`,
      `They all lived happily ever after.`
    ],
    wordsToRead: [
      { word: topic, syllables: [topic], visual: "❓" },
      { word: "place", syllables: ["place"], visual: "🏠" },
      { word: "adventure", syllables: ["ad", "ven", "ture"], visual: "🗺️" },
      { word: "friends", syllables: ["friends"], visual: "👫" },
      { word: "happily", syllables: ["hap", "pi", "ly"], visual: "😊" }
    ]
  }
}

function App() {
  const [requestedTopic, setRequestedTopic] = useState('')
  const [story, setStory] = useState<Story | null>(null)
  const [currentSentence, setCurrentSentence] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [isPrompting, setIsPrompting] = useState(false)
  const [recognized, setRecognized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isTeaching, setIsTeaching] = useState(false)
  const [speechSupported, setSpeechSupported] = useState(false)
  const synth = useRef(window.speechSynthesis)
  const recognitionRef = useRef<any>(null)
  const requestRecognitionRef = useRef<any>(null)

  useEffect(() => {
    const SpeechRecognitionConstructor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (SpeechRecognitionConstructor) {
      setSpeechSupported(true)
      setStatusMessage('Say a story topic aloud or type one below.')
      recognitionRef.current = new SpeechRecognitionConstructor()
      recognitionRef.current.continuous = false
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        if (story) {
          const currentWord = story.wordsToRead[currentSentence].word
          if (transcript.includes(currentWord)) {
            setRecognized(true)
            setFeedbackMessage("Congratulations, you got it correct!")
            setIsPrompting(false)
            setTimeout(() => {
              if (currentSentence < story.sentences.length - 1) {
                setCurrentSentence(currentSentence + 1)
                setRecognized(false)
                setFeedbackMessage('')
                setIsReading(true)
              }
            }, 2000)
          } else {
            teachWord(story.wordsToRead[currentSentence])
          }
        }
      }
      recognitionRef.current.onend = () => {
        if (!recognized && story && isPrompting && !isTeaching) {
          teachWord(story.wordsToRead[currentSentence])
        }
      }

      requestRecognitionRef.current = new SpeechRecognitionConstructor()
      requestRecognitionRef.current.continuous = false
      requestRecognitionRef.current.lang = 'en-US'
      requestRecognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase()
        setRequestedTopic(transcript)
        setIsListening(false)
      }
      requestRecognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [currentSentence, story, recognized, isPrompting, isTeaching])

  const startStory = () => {
    const topicInput = requestedTopic.toLowerCase().trim()
    if (!topicInput) {
      setStatusMessage('Please say or type a story topic first.')
      return
    }

    const selectedStory = Object.prototype.hasOwnProperty.call(stories, topicInput)
      ? stories[topicInput as StoryKey]
      : generateStory(topicInput)

    setStory(selectedStory)
    setCurrentSentence(0)
    setIsReading(true)
    setRecognized(false)
    setStatusMessage('')
  }

  const startListening = () => {
    if (requestRecognitionRef.current) {
      setIsListening(true)
      requestRecognitionRef.current.start()
    }
  }

  const speakWithElevenLabs = async (text: string) => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) {
      return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.onend = resolve
        synth.current.speak(utterance)
      })
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/0mLOQqwA3kovxF1ID7z6', { // Rachel voice - change to your preferred voice ID
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        return new Promise((resolve) => {
          audio.onended = resolve
          audio.play()
        })
      }

      console.error('ElevenLabs API returned non-ok response:', response.status)
    } catch (error) {
      console.error('ElevenLabs API error:', error)
    }

    // Fallback to Web Speech API for any failure
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.onend = resolve
      synth.current.speak(utterance)
    })
  }

  const teachWord = async (wordData: WordData) => {
    setIsTeaching(true)
    setFeedbackMessage("Let's learn together!")
    
    const syllables = wordData.syllables
    
    for (let i = 0; i < syllables.length; i++) {
      await speakWithElevenLabs(syllables[i])
      await new Promise(resolve => setTimeout(resolve, 500)) // Pause between syllables
    }
    
    // After syllables, speak the whole word
    await new Promise(resolve => setTimeout(resolve, 1000))
    await speakWithElevenLabs(wordData.word)
    
    setIsTeaching(false)
    setFeedbackMessage("Now you try!")
    // Restart recognition
    setTimeout(() => {
      recognitionRef.current.start()
    }, 1000)
  }

  useEffect(() => {
    if (isReading && story && !isPrompting) {
      speakWithElevenLabs(story.sentences[currentSentence]).then(() => {
        setIsReading(false)
        setIsPrompting(true)
        // Start recognition
        if (recognitionRef.current) {
          recognitionRef.current.start()
        }
      })
    }
  }, [isReading, currentSentence, isPrompting, story])

  const renderSentence = () => {
    if (!story) return null
    const sentence = story.sentences[currentSentence]
    const word = story.wordsToRead[currentSentence].word
    const parts = sentence.split(word)
    return (
      <p>
        {parts[0]}
        <span style={{ backgroundColor: 'yellow' }}>{word}</span>
        {parts[1]}
      </p>
    )
  }

  if (!story) {
    return (
      <div className="app">
        <h1>Bobby the Story Bot</h1>
        <p>Hi! I'm Bobby. What story would you like?</p>
        {speechSupported ? (
          <button onClick={startListening} disabled={isListening}>
            {isListening ? 'Listening...' : '🎤 Speak your story topic'}
          </button>
        ) : (
          <p className="feedback">Speech recognition is not supported in this browser.</p>
        )}
        <input
          type="text"
          placeholder="e.g., spiderman, princess, dinosaur"
          value={requestedTopic}
          onChange={(e) => setRequestedTopic(e.target.value)}
          style={{ fontSize: '18px', padding: '10px', margin: '10px' }}
        />
        <button onClick={startStory}>Tell me a story!</button>
        {statusMessage && <p className="feedback">{statusMessage}</p>}
        {requestedTopic && speechSupported && (
          <div>
            <p>You said: <strong>{requestedTopic}</strong></p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <h1>{story.title}</h1>
      {renderSentence()}
      {isPrompting && (
        <div>
          <p>Hey, read this word with me: <strong>{story.wordsToRead[currentSentence].word}</strong></p>
          <div className="visual-aid">{story.wordsToRead[currentSentence].visual}</div>
          {feedbackMessage && <p className="feedback">{feedbackMessage}</p>}
          {isTeaching && <p className="teaching">Listen carefully...</p>}
        </div>
      )}
      {currentSentence === story.sentences.length - 1 && recognized && (
        <p>The end! Great job reading!</p>
      )}
    </div>
  )
}

export default App
