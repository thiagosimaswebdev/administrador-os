import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { javascriptRouteTree } from "./build/javascript-route-tree.js";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [react(), javascriptRouteTree()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },
  resolve: {
    alias: { "@": path.resolve(root, "./src") },
  },
});
