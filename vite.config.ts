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
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png", "icon-512-maskable.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ["**/firebase-messaging-sw.js", "**/sw.js"],
      },
      manifest: {
        id: "be.taalam.app",
        name: "Ta'alam - Apprendre le Coran",
        short_name: "Ta'alam",
        description: "Apprenez le Coran facilement avec des quiz et de la récitation guidée",
        start_url: "/",
        display: "standalone",
        background_color: "#f5f0e8",
        theme_color: "#1a6b3c",
        lang: "fr",
        scope: "/",
        display_override: ["standalone", "browser"] as any,
        dir: "ltr" as const,
        categories: ["education", "lifestyle"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" as any },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Tarteel", short_name: "Tarteel", url: "/tarteel", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
          { name: "Coran", short_name: "Coran", url: "/quran", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
          { name: "Quiz", short_name: "Quiz", url: "/quiz", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
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
