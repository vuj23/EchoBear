import type { StoryJSON } from './types'

export const DEMO_STORY: StoryJSON = {
  title: 'The Big Red Cat',
  scenes: [
    {
      storyText: 'A big cat sat on the mat.',
      pauseText: 'The cat was...',
      targetWord: 'big',
      wordSplit: 'b—ig',
      phonemes: ['b', 'i', 'g', 'ig', 'b—ig'],
      imagePrompt: 'A large fluffy red cat sitting proudly on a colorful mat, children\'s book illustration',
    },
    {
      storyText: 'The cat saw a fat rat.',
      pauseText: 'The rat was so...',
      targetWord: 'fat',
      wordSplit: 'f—at',
      phonemes: ['f', 'a', 't', 'at', 'f—at'],
      imagePrompt: 'A red cat staring at a chubby round rat, cute children\'s book illustration',
    },
    {
      storyText: 'The cat ran after the rat!',
      pauseText: 'The cat...',
      targetWord: 'ran',
      wordSplit: 'r—an',
      phonemes: ['r', 'a', 'n', 'an', 'r—an'],
      imagePrompt: 'A red cat running fast after a rat, action scene, children\'s book illustration',
    },
    {
      storyText: 'The rat hid in a hat.',
      pauseText: '',
      targetWord: '',
      wordSplit: '',
      phonemes: [],
      imagePrompt: 'A small rat peeking out from inside a top hat, cute children\'s book illustration',
    },
    {
      storyText: 'The cat and rat became the best pals!',
      pauseText: '',
      targetWord: '',
      wordSplit: '',
      phonemes: [],
      imagePrompt: 'A cat and rat sitting together smiling, best friends, children\'s book illustration',
    },
  ],
}
