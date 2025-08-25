import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true, // Allow external connections
    allowedHosts: [
      'localhost',
      '.ngrok.io',
      '.ngrok-free.app',
      '.ngrok.app'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3002', // your backend
        changeOrigin: true,
        secure: false, // in case of self-signed certs
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: (id) => {
        // Handle problematic external dependencies
        if (id.includes('define-globalThis-property')) return true
        return false
      }
    }
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: ['@assistant-ui/react', '@assistant-ui/react-ai-sdk', '@assistant-ui/react-ui']
  },
})
