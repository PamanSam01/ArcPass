import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
  ],
  server: {
    host: true,
  },
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('viem') || id.includes('wagmi') || id.includes('@reown')) {
            return 'web3-vendor';
          }
        }
      }
    }
  }
})
