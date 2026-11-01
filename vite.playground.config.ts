import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The playground: a live demo with controls, served from playground/ and importing the library source directly.
export default defineConfig({
  root: 'playground',
  base: './',
  plugins: [react()],
  build: { outDir: '../playground-dist', emptyOutDir: true },
})
