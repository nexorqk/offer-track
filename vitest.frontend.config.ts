import path from "node:path"

import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "server-only": path.resolve(__dirname, "test/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["features/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
})
