import { defineConfig, resolve } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

const backendSrc = fileURLToPath(new URL('../backend/src', import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@ruoyi/backend': backendSrc,
    },
  },
})
