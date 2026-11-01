import { defineConfig } from 'vite'

// The library build: the core and the React wrapper as separate ESM entry points, React left to the app.
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: { index: 'src/index.ts', react: 'src/react.tsx' },
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react/jsx-runtime'],
      output: {
        chunkFileNames: 'glyphfield.js',
        // the React entry runs on the client only (Next.js App Router and other server-component setups)
        banner: (chunk) => (chunk.name === 'react' ? "'use client';" : ''),
      },
    },
  },
})
