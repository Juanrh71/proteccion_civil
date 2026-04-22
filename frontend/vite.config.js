import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['jspdf'],
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable'],
  },
  server: {
    port: 5173,
  },
})
