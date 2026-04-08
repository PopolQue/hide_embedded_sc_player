import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    open: '/demo.html',
  },
  build: {
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'demo.html'),
      },
    },
  },
})
