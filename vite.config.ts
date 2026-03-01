import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ["**/firebase-messaging-sw.js"],
      },
      manifest: {
        name: "Ta'alam - Apprendre le Coran",
        short_name: "Ta'alam",
        description: "Apprenez le Coran facilement avec des quiz et de la récitation guidée",
        theme_color: "#1a6b3c",
        background_color: "#f5f0e8",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/taalam-icon.png", sizes: "512x512", type: "image/png" },
          { src: "/taalam-icon.png", sizes: "192x192", type: "image/png" },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
