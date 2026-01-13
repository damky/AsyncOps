import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use backend service name in Docker, localhost for local dev
  const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://localhost:8000'
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0', // Required for Docker to access the dev server
      port: 3000,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
