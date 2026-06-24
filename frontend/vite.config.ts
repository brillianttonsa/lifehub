import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Catches all /api/auth/... requests from Axios and forwards them to your server
      '/api': {
        target: 'http://localhost:5000', // <-- Change 5000 to your backend server's port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})