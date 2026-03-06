import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// ✅ VERSION APP — incrémenter à chaque déploiement important
const APP_VERSION = "2.1.0";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },

  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  build: {
    chunkSizeWarningLimit: 600,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) return 'assets/css/[name]-[hash][extname]';
          if (assetInfo.name?.match(/\.(png|jpe?g|svg|gif|webp|ico)$/))
            return 'assets/img/[name]-[hash][extname]';
          return 'assets/[name]-[hash][extname]';
        },
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-accordion",
            "@radix-ui/react-dropdown-menu",
          ],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-charts": ["recharts"],
          "vendor-motion": ["framer-motion"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png", "icon-512-maskable.png", "taalam-icon.png"],
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        globIgnores: ["**/firebase-messaging-sw.js", "**/sw.js"],

        // ✅ Force immediate activation
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,

        runtimeCaching: [
          {
            // HTML — always revalidate
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: "NetworkFirst",
            options: {
              cacheName: "html-cache",
              expiration: { maxEntries: 5, maxAgeSeconds: 60 },
              networkTimeoutSeconds: 3,
            },
          },
          {
            // Cache Quran audio (CacheFirst)
            urlPattern: /^https:\/\/cdn\.islamic\.network\/quran\/audio\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "quran-audio-cache",
              expiration: { maxEntries: 500, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
          {
            // Cache other audio sources (CacheFirst)
            urlPattern: /\.(?:mp3|wav|ogg|m4a)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "audio-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Google Fonts stylesheets (StaleWhileRevalidate)
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Google Fonts webfonts (CacheFirst)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase API calls (NetworkFirst)
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 5 * 60 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Quran text API (StaleWhileRevalidate)
            urlPattern: /^https:\/\/api\.alquran\.cloud\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "quran-api-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Quran.com API (StaleWhileRevalidate)
            urlPattern: /^https:\/\/api\.quran\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "qurancom-api-cache",
              expiration: { maxEntries: 700, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Images (CacheFirst)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        id: "be.taalam.app",
        version: APP_VERSION,
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
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" as any },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" as any },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" as any },
          { src: "/icon-512-maskable.png", sizes: "512x512", type: "image/jpeg", purpose: "maskable" },
        ],
        screenshots: [
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", form_factor: "wide", label: "Ta'alam App" } as any,
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", form_factor: "narrow", label: "Ta'alam App" } as any,
        ] as any,
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
