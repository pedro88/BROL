import { defineConfig } from "vitest/config";
import path from "path";

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
  },
});
