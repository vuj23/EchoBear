export interface Scene {
  storyText: string
  pauseText: string
  targetWord: string
  wordSplit: string
  phonemes: string[]
  imagePrompt: string
}

export interface StoryJSON {
  title: string
  scenes: Scene[]
}

export interface LevelConfig {
  level: number
  age: string
  sentenceLen: string
  wordType: string
  wordCount: number
  vocab: string
}

export type AppScreen =
  | 'home'
  | 'loading'
  | 'scene'
  | 'word-moment'
  | 'correct'
  | 'wrong'
  | 'phonics'
  | 'end'
