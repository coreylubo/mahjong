import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub Pages sub-path (https://<user>.github.io/mahjong/).
// Override with BASE_PATH=/ when serving from a custom domain or the repo root.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/mahjong/',
  plugins: [react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
