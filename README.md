# Bobby the Story Bot

A children's reading literacy app built with React, TypeScript, and Vite. The app helps kids practice reading by reading stories aloud and prompting them to read specific words, with visual aids and speech recognition.

## Features

- Interactive story reading with speech synthesis
- Speech-to-text input for story topic requests
- Dynamic story selection based on child's request
- Word recognition prompts with visual cues (emojis)
- Speech recognition to check child's reading
- **Phonics teaching**: Breaks down difficult words into syllables for guided learning
- Simple, child-friendly interface
- Predefined stories for common topics (Spiderman, Princess, Dinosaur)
- Automatic story generation for new topics

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5174](http://localhost:5174) in your browser.

## Usage

- Click the microphone button and speak your desired story topic (e.g., "spiderman", "princess", "dinosaur").
- The app will display what you said and confirm with "Tell me a story!".
- Listen as Bobby reads the story.
- When prompted, read the highlighted word aloud.
- **If you get it wrong**: Bobby will teach you by breaking the word into syllables (e.g., "Spi... der... Spider!")
- The app uses speech recognition to verify correct reading and provide guided learning.

## Technologies Used

- React 19
- TypeScript
- Vite
- Web Speech API (Synthesis and Recognition)
- **ElevenLabs API** (optional for premium voice synthesis)

## ElevenLabs Integration

For enhanced voice quality, integrate with ElevenLabs AI voices. See `ELEVENLABS_README.md` for setup instructions. Use a Vite environment variable named `VITE_ELEVENLABS_API_KEY`.

## Browser Support

Requires a modern browser with Web Speech API support (e.g., Chrome, Edge).
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
