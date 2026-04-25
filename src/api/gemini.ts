import type { StoryJSON } from '../types'
import { LEVEL_CONFIGS } from '../levelConfig'

const API_KEY = import.meta.env.VITE_GEMMA_API_KEY
const BASE = 'https://generativelanguage.googleapis.com/v1beta'

// Use a stable Gemini identifier to avoid model 404s.
const GEMMA_MODEL = 'gemma-4-31b-it'
const FALLBACK_MODEL = 'gemma-4-31b-it'

// ── Prompt ────────────────────────────────────────────────────

function buildPrompt(userPrompt: string, level: number): string {
  const config = LEVEL_CONFIGS[level]

  // Few-shot example primes Gemma to understand the exact output shape
  const example = `{"title":"The Moon Cat","scenes":[{"storyText":"A big cat sat on the moon.","pauseText":"The cat was...","targetWord":"big","wordSplit":"b—ig","phonemes":["b","i","g","ig","b—ig"],"imagePrompt":"A large fluffy cat sitting on the moon, stars all around, children's book style"},{"storyText":"The cat saw the stars shine.","pauseText":"","targetWord":"","wordSplit":"","phonemes":[],"imagePrompt":"A cat looking up at glowing stars on the moon surface"}]}`

  return `You are a children's story generator. Output ONLY a valid JSON object — no markdown, no explanation, nothing else.

Here is an example of the exact output format:
${example}

Now generate a NEW story about: "${userPrompt}"
- Age ${config.age}, Level ${config.level}
- Sentence length: ${config.sentenceLen}
- Use exactly ${config.wordCount} target word(s) of type: ${config.wordType}
- Use exactly 4 scenes total
- Return JSON ONLY. Do not think step-by-step. No preamble.
- imagePrompt: describe the scene vividly so an illustrator can draw it

Rules:
- targetWord MUST appear verbatim in storyText
- Spread target words across separate scenes
- Scenes without a target word: use "" for targetWord/wordSplit and [] for phonemes
- The story MUST be about "${userPrompt}"

JSON:`
}

// ── API calls ─────────────────────────────────────────────────

async function callModel(
  model: string,
  prompt: string,
  jsonMode: boolean,
  retries: number,
): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const body: Record<string, unknown> = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 2048,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    }

    const res = await fetch(`${BASE}/models/${model}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 429) {
      if (attempt === retries) throw new Error('Rate limit — wait a moment and try again')
      await new Promise(r => setTimeout(r, attempt * 5000))
      continue
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`${model} API ${res.status}: ${body.slice(0, 200)}`)
    }

    const data = await res.json()
    return extractRawTextFromGemmaResponse(data)
  }
  throw new Error('All retries exhausted')
}

function extractRawTextFromGemmaResponse(responseData: any): string {
  const parts = responseData?.candidates?.[0]?.content?.parts
  if (!Array.isArray(parts)) return ''

  // Some responses include non-text thought blocks; keep text only.
  return parts
    .filter((part: any) => !part?.thought)
    .map((part: any) => part?.text || '')
    .join('')
}

async function callWithFallback(prompt: string): Promise<string> {
  // Try Gemma first.
  try {
    const raw = await callModel(GEMMA_MODEL, prompt, true, 2)
    const jsonText = extractJson(raw)
    if (jsonText.includes('"title"') && jsonText.includes('"scenes"')) {
      console.log('✅ Gemma 4 returned valid JSON')
      return raw
    }
    console.warn('⚠️ Gemma 4 did not return JSON — retrying fallback model')
  } catch (e) {
    console.warn('⚠️ Gemma 4 failed:', e, '— retrying fallback model')
  }

  // Fallback call (same stable model ID).
  return callModel(FALLBACK_MODEL, prompt, true, 3)
}

function extractJson(text: string): string {
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  const jsonRegex = /```json\s+([\s\S]*?)\s+```/
  const match = text.match(jsonRegex)

  if (match && match[1]) {
    return match[1].trim()
  }

  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start >= 0 && end > start) {
    return cleaned.slice(start, end + 1)
  }

  return cleaned
}

// ── Public API ────────────────────────────────────────────────

export async function generateStory(userPrompt: string, level: number): Promise<StoryJSON> {
  if (!API_KEY) throw new Error('No API key — add VITE_GEMMA_API_KEY to .env')

  const raw = await callWithFallback(buildPrompt(userPrompt, level))
  if (!raw) throw new Error('Empty response from API')

  const jsonText = extractJson(raw)
  if (!jsonText || !jsonText.includes('{')) {
    throw new Error(`No JSON in response: ${raw.slice(0, 200)}`)
  }

  let story: StoryJSON
  try {
    story = JSON.parse(jsonText)
  } catch (e) {
    throw new Error(`JSON parse failed: ${(e as Error).message}`, { cause: e })
  }

  sanitiseStory(story)
  return story
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

// ── Images via Pollinations.ai ─────────────────────────────────

export function generateImages(prompts: string[]): Promise<(string | null)[]> {
  return Promise.resolve(prompts.map(p => buildPollinationsUrl(p)))
}

const POLLINATIONS_BASES = [
  'https://image.pollinations.ai/prompt/',
  'https://pollinations.ai/p/',
]

const POLLINATIONS_KEY = import.meta.env.VITE_POLLINATIONS_API_KEY as string | undefined

function buildPollinationsUrl(prompt: string, baseIndex = 0): string {
  const safePrompt = prompt.trim() || 'A cheerful children storybook scene with friendly animals'
  const core = safePrompt.length > 180 ? safePrompt.slice(0, 180) : safePrompt
  const styled = `${core}, children's book illustration, colorful, friendly, cute, no text`
  const seed = Math.abs(hashStr(safePrompt)) % 99999
  const base = POLLINATIONS_BASES[baseIndex % POLLINATIONS_BASES.length]
  const token = POLLINATIONS_KEY ? `&token=${encodeURIComponent(POLLINATIONS_KEY)}` : ''
  return `${base}${encodeURIComponent(styled)}?width=768&height=576&seed=${seed}&model=flux&nologo=true${token}`
}

function loadImageTag(url: string, baseIndex = 0): Promise<string> {
  // Try the given base URL, then fall back to the alternate base on error
  const finalUrl = baseIndex === 0 ? url : url.replace(POLLINATIONS_BASES[0], POLLINATIONS_BASES[1])
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    const t = setTimeout(() => { img.src = ''; reject(new Error('Timeout')) }, 50_000)
    img.onload = () => { clearTimeout(t); resolve(finalUrl) }
    img.onerror = () => {
      clearTimeout(t)
      if (baseIndex === 0) {
        // Retry with alternate Pollinations base after a short pause
        setTimeout(() => loadImageTag(url, 1).then(resolve, reject), 1500)
      } else {
        reject(new Error('Image load failed on both endpoints'))
      }
    }
    img.src = finalUrl
  })
}

export async function fetchSceneImage(url: string, delayMs = 0): Promise<string | null> {
  if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs))
  try {
    return await loadImageTag(url)
  } catch (e) {
    console.warn('Scene image failed:', e)
    return null
  }
}

export async function preloadImages(urls: (string | null)[]): Promise<(string | null)[]> {
  const results = await Promise.allSettled(
    urls.map(url => (url ? loadImageTag(url) : Promise.resolve(null))),
  )
  return results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    console.warn(`Image ${i} failed:`, (r as PromiseRejectedResult).reason)
    return null
  })
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return h
}
