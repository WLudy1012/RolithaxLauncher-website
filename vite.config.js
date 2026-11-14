import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    assetsDir: 'bundle',
    rolldownOptions: {
      input: ['index.html', 'download.html', 'mobile.html'],
    },
  },
})
