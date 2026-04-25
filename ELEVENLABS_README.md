# ElevenLabs Integration

To use ElevenLabs for high-quality voice synthesis:

1. Sign up at https://elevenlabs.io/
2. Get your API key from the dashboard
3. Create a `.env` file in the project root:
   ```
   VITE_ELEVENLABS_API_KEY=your_api_key_here
   ```
4. Choose a voice ID from ElevenLabs (default is "21m00Tcm4TlvDq8ikWAM" - Rachel)
5. The app will automatically use ElevenLabs if the API key is provided, falling back to Web Speech API if not.

## Security Note
For production, move API calls to a backend server to keep your API key secure. Client-side API keys can be exposed.