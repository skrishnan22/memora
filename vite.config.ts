import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  publicDir: false, // Disable default public dir
  build: {
    outDir: 'xtn',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup.ts'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          //src: 'src/**/*.{html,json,png,jpg,jpeg,gif,svg,css,woff,woff2,ttf,eot}',
          src: ['src/**/*', '!src/**/*.ts', '!src/**/*.tsx'],
          dest: '.',
        },
      ],
    }),
  ],
})
