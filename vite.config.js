// @lovable.dev/vite-tanstack-config already includes the TanStack Start,
// React, Tailwind, path alias, Nitro and diagnostic plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import { javascriptRouteTree } from "./build/javascript-route-tree.js";

export default defineConfig({
  tanstackStart: {
    router: {
      disableTypes: true,
      generatedRouteTree: "routeTree.gen.js",
    },
    start: { entry: "start.js" },
    server: { entry: "server.js" },
  },
  vite: {
    plugins: [
      javascriptRouteTree(),
      VitePWA({
        strategies: "generateSW",
        registerType: "autoUpdate",
        injectRegister: null,
        manifest: false,
        outDir: ".output/public",
        includeAssets: ["favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"],
        filename: "sw.js",
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ["**/*.{js,css,svg,png,ico,woff2}"],
          navigateFallback: null,
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: { cacheName: "pages", networkTimeoutSeconds: 3 },
            },
            {
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin && url.pathname.startsWith("/assets/"),
              handler: "CacheFirst",
              options: { cacheName: "assets" },
            },
          ],
        },
      }),
    ],
  },
});
