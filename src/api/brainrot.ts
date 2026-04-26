import type { StoryJSON } from '../types'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

// 200 images in public/archive/ named 0.jpg … 199.jpg
const ALL_IMAGES = Array.from({ length: 200 }, (_, i) => `/archive/${i}.jpg`)

export function getBrainrotImages(): string[] {
  return [...ALL_IMAGES].sort(() => Math.random() - 0.5).slice(0, 6)
}

const ADVENTURES = [
  'Tung Tung Tung Sahur goes on a quest to find the loudest drum in the world',
  'Tung Tung Tung Sahur accidentally wakes up every animal in the jungle',
  'Tung Tung Tung Sahur enters a drumming competition against a robot',
  'Tung Tung Tung Sahur loses his drum and must find it before sunrise',
  'Tung Tung Tung Sahur teaches a shy mouse how to make music',
  'Tung Tung Tung Sahur tries to sneak through a sleeping giant\'s village',
  'Tung Tung Tung Sahur discovers a magic drum that plays itself',
  'Tung Tung Tung Sahur must use his drum to call the rain clouds',
]

function randomAdventure(): string {
  return ADVENTURES[Math.floor(Math.random() * ADVENTURES.length)]
}

export async function generateBrainrotStory(): Promise<StoryJSON> {
  if (!GROQ_API_KEY) throw new Error('No Groq key')

  const adventure = randomAdventure()

  const prompt = `Generate a funny children's story as a single JSON object. No markdown, no explanation, just JSON.

The main character is Tung Tung Tung Sahur — a wild, loud, energetic kid who carries a giant drum everywhere and yells "TUNG! TUNG! TUNG!" at random moments. He is chaotic but kind-hearted.

Story: ${adventure}

Age: 6-8, fun and silly tone, short sentences that are easy to read aloud.
Number of scenes: 6

JSON structure:
{
  "title": "Story Title",
  "scenes": [
    {
      "storyText": "3-4 sentences for this scene. Keep it fun and lively.",
      "pauseText": "Sentence fragment ending just before the target word e.g. The drum was so...",
      "targetWord": "loud",
      "wordSplit": "l—oud",
      "phonemes": ["l", "ou", "d"],
      "imagePrompt": ""
    }
  ]
}

Story arc (one scene each):
1. Introduce Tung Tung Tung Sahur and the setting
2. Something kicks off the adventure
3. Rising action — things get more chaotic or exciting
4. A big problem or obstacle appears
5. Tung Tung Tung Sahur solves it, probably with his drum
6. Happy ending — funny and warm

Rules:
- Each scene must continue from the previous one — one connected story
- 3 scenes must have a targetWord (a simple CVC or common word for age 6), spread them out
- Scenes 4 and 6 should have no targetWord — set targetWord and wordSplit to "" and phonemes to []
- targetWord MUST appear verbatim in storyText
- wordSplit uses — (em dash) between syllables e.g. "b—ig", "r—ed", "j—ump"
- phonemes is array of individual sounds
- imagePrompt can be left as ""
- Include "TUNG! TUNG! TUNG!" at least once in the story

Output the JSON object now:`

  const res = await fetch(GROQ_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 3000,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Groq ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const raw = data?.choices?.[0]?.message?.content ?? ''
  if (!raw) throw new Error('Empty response')

  const cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  const jsonText = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned

  let story: StoryJSON
  try {
    story = JSON.parse(jsonText)
  } catch (e) {
    throw new Error(`JSON parse failed: ${(e as Error).message}`)
  }

  if (!story.title || !Array.isArray(story.scenes)) throw new Error('Invalid story JSON')
  for (const s of story.scenes) {
    s.storyText = s.storyText ?? ''
    s.pauseText = s.pauseText ?? ''
    s.targetWord = s.targetWord ?? ''
    s.wordSplit = s.wordSplit ?? ''
    s.phonemes = Array.isArray(s.phonemes) ? s.phonemes : []
    s.imagePrompt = ''
  }

  return story
}
