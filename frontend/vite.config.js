import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/forecast': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/metrics': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/spikes': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/decisions': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/backend-status': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/run-summary': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/charts': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    }
  }
})
