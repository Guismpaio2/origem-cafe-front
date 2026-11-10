import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api/* vai para a API local. Assim o front não precisa
    // conhecer a porta da API e não há problema de CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  // Mesmo proxy para o build de produção servido com 'npm run preview'.
  preview: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
