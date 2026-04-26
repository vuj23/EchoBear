import type { StoryJSON } from '../types'
import { LEVEL_CONFIGS } from '../levelConfig'

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_BASE = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

function buildPrompt(userPrompt: string, level: number): string {
  const config = LEVEL_CONFIGS[level]
  const example = `{"title":"The Moon Cat","scenes":[{"storyText":"A big cat sat on the moon.","pauseText":"The cat was...","targetWord":"big","wordSplit":"b—ig","phonemes":["b","i","g"],"imagePrompt":"A large fluffy cat sitting on the moon, stars all around, children's book illustration"},{"storyText":"The cat saw the stars shine.","pauseText":"","targetWord":"","wordSplit":"","phonemes":[],"imagePrompt":"A cat looking up at glowing stars on the moon surface, children's book style"}]}`

  return `You are a children's story generator. Output ONLY valid JSON — no markdown, no explanation.

Example format:
${example}

Generate a story about: "${userPrompt}"
- Age ${config.age}, Level ${config.level}
- Sentence length: ${config.sentenceLen}
- Use exactly ${config.wordCount} target word(s) of type: ${config.wordType}
- Exactly 4 scenes
- imagePrompt: vivid scene description for an illustrator

Rules:
- targetWord MUST appear verbatim in storyText
- Spread target words across scenes
- Scenes without a target word: use "" for targetWord/wordSplit and [] for phonemes

Output only the JSON object:`
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
      temperature: 0.85,
      max_tokens: 2048,
      response_format: { type: 'json_object' },
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

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt/'
const POLLINATIONS_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY as string | undefined

function buildImageUrl(prompt: string): string {
  const safe = prompt.trim() || 'A cheerful children storybook scene'
  const core = safe.length > 180 ? safe.slice(0, 180) : safe
  const styled = `${core}, children's book illustration, colorful, friendly, cute, no text`
  const seed = Math.abs(hashStr(safe)) % 99999
  const token = POLLINATIONS_KEY ? `&token=${encodeURIComponent(POLLINATIONS_KEY)}` : ''
  return `${POLLINATIONS_BASE}${encodeURIComponent(styled)}?width=768&height=576&seed=${seed}&model=flux&nologo=true${token}`
}

export function generateImages(prompts: string[]): Promise<(string | null)[]> {
  return Promise.resolve(prompts.map(p => buildImageUrl(p)))
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}
