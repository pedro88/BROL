import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Allow importing .ts files without extension
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/test/**",
        "src/**/__tests__/**",
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/server.ts",
        "src/emails/**",
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
  },
});
