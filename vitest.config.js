import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom'
  },
  esbuild: {
    target: 'es2020',
    include: /\.(m?[jt]s|[jt]sx)$/,
    exclude: []
  }
})