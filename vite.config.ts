import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['jwt-decode'],
    force: true
  },
  server : {
    port: 5173,
    host: '0.0.0.0',
  }
})
