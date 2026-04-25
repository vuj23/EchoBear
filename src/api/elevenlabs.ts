const API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const BASE = 'https://api.elevenlabs.io/v1'
const MODEL = 'eleven_turbo_v2_5'

// Two distinct voices for the prize track
const NARRATOR_VOICE = '21m00Tcm4TlvDq8ikWAM' // Rachel — warm storyteller
const TEACHER_VOICE = 'AZnzlk1XvdvUeBnXmlld'  // Domi — clear, patient teacher

async function speak(text: string, voiceId: string, stability = 0.5): Promise<void> {
  if (!text.trim()) return

  if (!API_KEY) {
    return browserTTS(text)
  }

  try {
    const res = await fetch(`${BASE}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: MODEL,
        voice_settings: {
          stability,
          similarity_boost: 0.75,
          style: 0.1,
          use_speaker_boost: true,
        },
      }),
    })

    if (!res.ok) throw new Error(`ElevenLabs ${res.status}`)

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    await playAudio(url)
    URL.revokeObjectURL(url)
  } catch (err) {
    console.warn('ElevenLabs failed, falling back to browser TTS:', err)
    await browserTTS(text)
  }
}

function playAudio(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.onended = () => resolve()
    audio.onerror = () => reject(new Error('Audio playback failed'))
    audio.play().catch(reject)
  })
}

function browserTTS(text: string): Promise<void> {
  return new Promise(resolve => {
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(text)
    utt.rate = 0.85
    utt.onend = () => resolve()
    window.speechSynthesis.speak(utt)
  })
}

export function narrate(text: string): Promise<void> {
  return speak(text, NARRATOR_VOICE, 0.45)
}

export function teach(text: string): Promise<void> {
  return speak(text, TEACHER_VOICE, 0.65)
}
