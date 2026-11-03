import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The library server (server/index.js) scans music folders and streams files.
  server: { port: 5180, proxy: { '/api': 'http://127.0.0.1:5181' } },
  preview: { proxy: { '/api': 'http://127.0.0.1:5181' } },
})
