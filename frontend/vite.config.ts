/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: true, 
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001', // Tu puerto de backend
        ws: true, // ¡IMPORTANTE! Habilita WebSockets
        changeOrigin: true,
        secure: false,
      }
    }
  },
})