import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:        resolve(__dirname, 'index.html'),
        resinTables: resolve(__dirname, 'resin-tables/index.html'),
        services:    resolve(__dirname, 'services/index.html'),
        gallery:     resolve(__dirname, 'gallery/index.html'),
      }
    }
  }
})
