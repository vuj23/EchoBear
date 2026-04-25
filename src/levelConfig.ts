import type { LevelConfig } from './types'

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    age: '3–4',
    sentenceLen: '3–5 words, one simple idea',
    wordType: 'Simple CVC only',
    wordCount: 1,
    vocab: 'very simple 3-letter words only',
  },
  2: {
    level: 2,
    age: '4–5',
    sentenceLen: '5–8 words',
    wordType: 'CVC patterns',
    wordCount: 2,
    vocab: 'simple short words',
  },
  3: {
    level: 3,
    age: '5–6',
    sentenceLen: '8–12 words',
    wordType: 'Consonant blends',
    wordCount: 3,
    vocab: 'elementary words with consonant blends',
  },
  4: {
    level: 4,
    age: '6–7',
    sentenceLen: '12–18 words',
    wordType: 'Sight words + 2-syllable',
    wordCount: 4,
    vocab: 'grade 1-2 words including sight words',
  },
  5: {
    level: 5,
    age: '7–8',
    sentenceLen: 'full sentences',
    wordType: 'Multi-syllable words',
    wordCount: 5,
    vocab: 'grade 2-3 words including multi-syllable words',
  },
}

export const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'Ages 3–4 · Simple words',
  2: 'Ages 4–5 · Short sentences',
  3: 'Ages 5–6 · Blends & patterns',
  4: 'Ages 6–7 · Sight words',
  5: 'Ages 7–8 · Full sentences',
}
