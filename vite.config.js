import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API serverless (Vercel) agar mode lokal/dev ikut berfungsi:
    // /api/users → https://rapor-ikm.vercel.app/api/users
    proxy: {
      '/api': {
        target: 'https://rapor-ikm.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
