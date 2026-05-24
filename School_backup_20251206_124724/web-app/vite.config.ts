import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
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
    // Allow serving files from parent directory (for course files)
    fs: {
      allow: ['..'],
    },
  },
  // In development, course files are served from ../course
  // For production, ensure course directory is copied to dist or served separately
})

