import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/h2s-poc/',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'google-ai': ['@google/generative-ai'],
          'ui-core': ['framer-motion', 'lucide-react', 'react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
