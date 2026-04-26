import type { StoryJSON } from '../types'
import { LEVEL_CONFIGS } from '../levelConfig'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

function buildPrompt(userPrompt: string, level: number): string {
  const config = LEVEL_CONFIGS[level]

  return `Generate a children's story as a single JSON object. No markdown, no explanation, just JSON.

Topic: ${userPrompt}
Age: ${config.age}, Level: ${config.level}
Sentence length: ${config.sentenceLen}
Target word type: ${config.wordType}
Number of target words: ${config.wordCount}
Number of scenes: 6

JSON structure:
{
  "title": "Story Title",
  "scenes": [
    {
      "storyText": "Full sentence for this scene.",
      "pauseText": "Sentence fragment ending before the target word e.g. The cat was...",
      "targetWord": "big",
      "wordSplit": "b—ig",
      "phonemes": ["b", "i", "g"],
      "imagePrompt": "Vivid scene description for a children's book illustrator"
    }
  ]
}

Story structure (6 scenes must follow this arc):
1. Introduction — introduce the main character and setting
2. Setup — something happens or the character wants something
3. Rising action — the character tries or explores
4. Challenge — a problem or obstacle appears
5. Resolution — the character solves it or learns something
6. Ending — a warm, satisfying conclusion

Rules:
- Each scene's storyText must be 3–4 sentences long, not just one line
- Each scene must naturally follow from the previous one — connected narrative, not isolated sentences
- Use the same characters and setting throughout
- Exactly 6 scene objects in the scenes array
- Spread the ${config.wordCount} target word(s) across different scenes
- targetWord MUST appear verbatim inside storyText
- wordSplit uses — (em dash) to split syllables e.g. "r—ed", "b—ig", "c—at"
- phonemes is an array of individual sounds e.g. ["r","e","d"]
- Scenes with no target word: set targetWord and wordSplit to "" and phonemes to []
- pauseText is only needed when targetWord is non-empty

Output the JSON object now:`
}

export async function generateStory(userPrompt: string, level: number): Promise<StoryJSON> {
  if (!GROQ_API_KEY) throw new Error('No Groq key — add VITE_GROQ_API_KEY to .env')

  const res = await fetch(GROQ_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: buildPrompt(userPrompt, level) }],
      temperature: 0.7,
      max_tokens: 3500,
    }),
  })

  if (res.status === 429) throw new Error('Rate limit — wait a moment and try again')
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Groq API ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  const raw = data?.choices?.[0]?.message?.content ?? ''
  if (!raw) throw new Error('Empty response from Groq')

  const jsonText = extractJson(raw)
  let story: StoryJSON
  try {
    story = JSON.parse(jsonText)
  } catch (e) {
    throw new Error(`JSON parse failed: ${(e as Error).message}`)
  }

  sanitiseStory(story)
  return story
}

function extractJson(text: string): string {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) return cleaned.slice(start, end + 1)
  return cleaned
}

function sanitiseStory(story: StoryJSON): void {
  if (!story.title || !Array.isArray(story.scenes) || story.scenes.length === 0) {
    throw new Error('Story JSON missing title or scenes')
  }
  for (const scene of story.scenes) {
    scene.storyText = scene.storyText ?? ''
    scene.pauseText = scene.pauseText ?? ''
    scene.targetWord = scene.targetWord ?? ''
    scene.wordSplit = scene.wordSplit ?? ''
    scene.phonemes = Array.isArray(scene.phonemes) ? scene.phonemes : []
    scene.imagePrompt = scene.imagePrompt ?? ''
  }
}

// ── Images ────────────────────────────────────────────────────

const POLLINATIONS_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY as string | undefined

export function generateImage(prompt: string): string {
  const safe = prompt.trim() || 'A cheerful children storybook scene'
  const core = safe.length > 180 ? safe.slice(0, 180) : safe
  const styled = `${core}, children's book illustration, colorful, friendly, cute, no text`
  const seed = Math.abs(hashStr(safe)) % 99999
  if (POLLINATIONS_KEY) {
    return `https://gen.pollinations.ai/image/${encodeURIComponent(styled)}?width=512&height=384&seed=${seed}&model=nanobanana&nologo=true&key=${encodeURIComponent(POLLINATIONS_KEY)}`
  }
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(styled)}?width=512&height=384&seed=${seed}&model=turbo&nologo=true`
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}
