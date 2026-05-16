import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsConfigPaths({ projects: ["./tsconfig.json"] }), viteReact()],
  test: {
    css: true,
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});
