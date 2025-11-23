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
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['flowpulse-logo.png', 'robots.txt'],
      manifest: {
        name: 'FlowPulse - Workflow Intelligence Platform',
        short_name: 'FlowPulse',
        description: 'Advanced business and wealth management platform with AI-powered automation, analytics, and compliance management',
        theme_color: '#1a1f2e',
        background_color: '#0a0f1e',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'any',
        categories: ['business', 'finance', 'productivity'],
        prefer_related_applications: false,
        icons: [
          {
            src: '/flowpulse-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/flowpulse-logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/flowpulse-logo.png',
            sizes: '256x256',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/flowpulse-logo.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/flowpulse-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          }
        ],
        screenshots: [
          {
            src: '/flowpulse-logo.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        globIgnores: ['**/templates/**'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB limit
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ],
        navigateFallback: null,
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
