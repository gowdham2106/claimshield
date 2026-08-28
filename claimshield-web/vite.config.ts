import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Allows access via localtunnel/ngrok-style hostnames for
    // presenting the local dev server - fine for a temporary demo,
    // not something to leave enabled for a real deployment.
    allowedHosts: true,
  },
})