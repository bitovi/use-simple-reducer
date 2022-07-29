import { resolve } from 'path'
import { defineConfig } from 'vite'
import typescript from 'rollup-plugin-typescript2'

export default defineConfig((configEnv) => ({
  plugins: [typescript()],
  build: {
    lib: {
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
