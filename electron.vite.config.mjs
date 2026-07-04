import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    build: {
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {}
        }
      }
    }
  },
  preload: {
    build: {
      minify: true
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [vue()],
    build: {
      minify: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'element-plus': ['element-plus'],
            cropperjs: ['cropperjs']
          }
        }
      }
    }
  }
})
