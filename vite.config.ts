import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: '.',
  publicDir: false,
  base: '/',
  server: {
    open: '/docs/index.html',
    port: 3000,
    allowedHosts: "crescentlike-florencio-nonrustic.ngrok-free.dev",
  },
  build: {
    outDir: 'dist-demo',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        demo: resolve(__dirname, 'src/demo/index.html'),
      },
    },
  },
})
