import type { StoryJSON } from '../types'

const STORAGE_KEY = 'echobear_library'
const LEVEL_KEY = 'echobear_level'
const WORDS_KEY = 'echobear_words'
const MAX_STORIES = 20

// ── Reading level ──────────────────────────────────────────────

export function saveLevel(level: number): void {
  localStorage.setItem(LEVEL_KEY, String(level))
}

export function loadLevel(): number {
  const raw = localStorage.getItem(LEVEL_KEY)
  const n = raw ? parseInt(raw, 10) : 2
  return isNaN(n) ? 2 : Math.max(1, Math.min(5, n))
}

// ── Learned words ──────────────────────────────────────────────

export function saveLearnedWord(word: string): void {
  if (!word.trim()) return
  const words = loadLearnedWords()
  const w = word.toLowerCase().trim()
  if (!words.includes(w)) {
    localStorage.setItem(WORDS_KEY, JSON.stringify([...words, w]))
  }
}

export function loadLearnedWords(): string[] {
  try {
    const raw = localStorage.getItem(WORDS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export interface SavedStory {
  id: string
  title: string
  letter: string
  date: string
  pages: number
  story: StoryJSON
  images: (string | null)[]
}

export function saveStory(story: StoryJSON, images: (string | null)[]): void {
  if (!story?.title || story.title === 'The Little Red Flower') return // skip fallback

  const existing = loadStories()
  const alreadySaved = existing.some(s => s.title === story.title)
  if (alreadySaved) return

  const entry: SavedStory = {
    id: Date.now().toString(),
    title: story.title,
    letter: story.title.trim()[0]?.toLowerCase() ?? '?',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    pages: story.scenes.length,
    story,
    images,
  }

  const updated = [entry, ...existing].slice(0, MAX_STORIES)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // storage full — drop oldest
    const trimmed = [entry, ...existing].slice(0, Math.floor(MAX_STORIES / 2))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
  }
}

export function loadStories(): SavedStory[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SavedStory[]) : []
  } catch {
    return []
  }
}
