import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/core/**/*.test.ts", "src/lib/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/core/**/*.ts"],
      exclude: ["src/core/**/*.test.ts", "src/core/__fixtures__/**"],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/core": path.resolve(__dirname, "./src/core"),
    },
  },
});
