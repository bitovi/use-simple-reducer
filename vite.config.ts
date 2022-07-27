import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig((configEnv) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'use-simple-reducer',
      fileName: (format) => `use-simple-reducer.${format}.js`,
    },
    rollupOptions: {
      external: ['react'],
      output: {
        globals: {
          react: 'react',
        },
      },
    },
  },
}))
