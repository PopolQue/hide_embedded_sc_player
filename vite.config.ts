import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: false,
  server: {
    open: '/demo.html',
    port: 3000,
  },
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'demo.html'),
      },
    },
  },
})
