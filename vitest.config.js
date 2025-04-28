import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    watch: false,
    environment: "jsdom",
    root: "./",
    dir: "./tests/unit",
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      reportsDirectory: './tests/unit/coverage'
    }
  },
})