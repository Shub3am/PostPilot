import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.ts"],
    clearMocks: true,
  },
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
    include: ["src/**/*.{ts,tsx}"],
    exclude: ["src/**/*.test.ts", "src/test/**"],
  },
});
