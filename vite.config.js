import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // 🛠️ THE MAGIC FIX: This tells Vite how to bundle the older Google AI files!
  optimizeDeps: {
    include: ['@mediapipe/selfie_segmentation'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
})