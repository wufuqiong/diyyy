import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  base: '/diyyy/', // Replace with your actual repo name
  build: {
    outDir: 'dist',
  },
})