import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:         resolve(__dirname, 'index.html'),
        resinTables:  resolve(__dirname, 'resin-tables/index.html'),
        services:     resolve(__dirname, 'services/index.html'),
        gallery:      resolve(__dirname, 'gallery/index.html'),
        sawMill:      resolve(__dirname, 'saw-mill/index.html'),
        woodSpecies:  resolve(__dirname, 'wood-species/index.html'),
        customOrders: resolve(__dirname, 'custom-orders/index.html'),
        about:        resolve(__dirname, 'about/index.html'),
        contact:      resolve(__dirname, 'contact/index.html'),
        blogGunroom:      resolve(__dirname, 'blog/wildebeest-gunroom/index.html'),
        blogCountertop:   resolve(__dirname, 'blog/wildebeest-countertop/index.html'),
      }
    }
  }
})
