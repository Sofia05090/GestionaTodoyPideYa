import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En desarrollo las rutas relativas /api y /uploads se reenvian al backend local.
  // En produccion lo hace Nginx (ver nginx/default.conf).
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
})
