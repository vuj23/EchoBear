import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: 'C:/Users/saqib/AppData/Local/vite-cache/EchoBear',
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
})
