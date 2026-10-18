import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), ""),
      "server-only": path.resolve(process.cwd(), "./vitest.mocks/server-only.ts"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["**/*.{test,spec}.?(c|m)[jt]s?(x)"],
    exclude: ["node_modules", ".next", "out", "build", ".kilo"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
