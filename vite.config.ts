import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import dts from 'vite-plugin-dts'
import typescript from '@rollup/plugin-typescript'

export default defineConfig((configEnv) => ({
  plugins: [react(), typescript()],
  build: {
    lib: {
      formats: ['es', 'umd'],
      entry: resolve(__dirname, 'src/use-simple-reducer.ts'),
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
