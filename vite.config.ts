import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'src/demo',
  publicDir: resolve(__dirname, 'public'),
  base: './',
  server: {
    open: '/',
    port: 3000,
    allowedHosts: "crescentlike-florencio-nonrustic.ngrok-free.dev",
  },
  build: {
    outDir: resolve(__dirname, 'dist-demo'),
    emptyOutDir: true,
  },
})
