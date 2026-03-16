import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/auth/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
      "/rest/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
      "/functions/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
      "/storage/v1": {
        target: "https://xfeeizryotmnopvgevmf.supabase.co",
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),

    // ── PWA Plugin ──────────────────────────────────────────────
    VitePWA({
      registerType: 'prompt',   // we register manually via src/lib/registerSW.ts
      injectRegister: null,

      // ── Web App Manifest ────────────────────────────────────
      manifest: {
        name: 'KrishiSanjivni',
        short_name: 'Krishi',
        description: 'AI-powered smart farming platform for Indian farmers',
        start_url: '/',
        display: 'standalone',
        theme_color: '#1B5E20',
        background_color: '#ffffff',
        icons: [
          {
            src: '/pwa-192x192.webp',
            sizes: '192x192',
            type: 'image/webp',
          },
          {
            src: '/pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp',
          },
          {
            src: '/pwa-512x512.webp',
            sizes: '512x512',
            type: 'image/webp',
            purpose: 'maskable',
          },
        ],
      },

      // ── Workbox Configuration ───────────────────────────────
      workbox: {
        // Pre-cache the app shell
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],

        // Don't pre-cache files larger than 5 MB (e.g. videos)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

        // ── Runtime Caching Strategies ────────────────────────
        runtimeCaching: [
          // Static image assets – Cache First
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'krishi-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },

          // Google Fonts stylesheets – Stale While Revalidate
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'krishi-google-fonts-stylesheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },

          // Google Fonts webfont files – Cache First
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'krishi-google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
              },
            },
          },

          // Supabase REST API – Network First
          {
            urlPattern: /^https:\/\/xfeeizryotmnopvgevmf\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'krishi-supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              networkTimeoutSeconds: 10,
            },
          },

          // Supabase Edge Functions – Network First
          {
            urlPattern: /^https:\/\/xfeeizryotmnopvgevmf\.supabase\.co\/functions\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'krishi-supabase-functions',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 3 * 24 * 60 * 60, // 3 days
              },
              networkTimeoutSeconds: 15,
            },
          },

          // Supabase Storage – Cache First
          {
            urlPattern: /^https:\/\/xfeeizryotmnopvgevmf\.supabase\.co\/storage\/v1\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'krishi-supabase-storage',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],

        // Offline fallback page
        navigateFallback: null,   // handled by the custom handler below
        navigateFallbackDenylist: [/^\/api/],
      },

      // Dev options – enable SW during development for testing
      devOptions: {
        enabled: false,  // set to true temporarily to test SW in dev mode
      },
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-i18n': ['i18next', 'react-i18next'],
        },
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
