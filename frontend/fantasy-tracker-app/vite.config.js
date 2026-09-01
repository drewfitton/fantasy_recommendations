import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // .env lives at the repo root (frontend/fantasy-tracker-app is nested two
  // levels below it), not next to this config.
  envDir: fileURLToPath(new URL('../..', import.meta.url)),
})
