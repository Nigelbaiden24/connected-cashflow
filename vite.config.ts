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
    mode === "mobile" && {
      name: "flowpulse-mobile-viewport",
      transformIndexHtml: (html: string) => html.replace(", viewport-fit=cover", ""),
    },
    mode !== "mobile" && VitePWA({
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
        ],
        shortcuts: [
          {
            name: 'Finance Dashboard',
            short_name: 'Finance',
            url: '/dashboard',
            icons: [{ src: '/flowpulse-logo.png', sizes: '192x192' }]
          },
          {
            name: 'Business Dashboard',
            short_name: 'Business',
            url: '/business/dashboard',
            icons: [{ src: '/flowpulse-logo.png', sizes: '192x192' }]
          },
          {
            name: 'Investor Portal',
            short_name: 'Investor',
            url: '/investor/dashboard',
            icons: [{ src: '/flowpulse-logo.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,woff,woff2}'],
        globIgnores: ['**/templates/**', '**/OneSignalSDKWorker.js', '**/OneSignalSDK*.js'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024,
        navigateFallbackDenylist: [/^\/~oauth/, /^\/api/, /^\/enterprise-data/, /^\/OneSignalSDKWorker\.js/, /^\/OneSignalSDK/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
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
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              networkTimeoutSeconds: 10
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
  build: {
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        // Function form so a chunk only holds its own packages. The object
        // form also pulled shared helpers (clsx) into vendor-charts, which made
        // every page preload the 450 KB chart library.
        manualChunks(id: string) {
          // Rollup's CommonJS interop helpers are used everywhere; keep them in
          // the always-loaded React chunk instead of whichever chunk used them first.
          if (id.includes('commonjsHelpers')) return 'vendor-react';
          if (!id.includes('node_modules')) return undefined;
          const pkg = id.slice(id.lastIndexOf('node_modules/') + 'node_modules/'.length);
          if (/^(react|react-dom|react-router|react-router-dom|@remix-run\/router|scheduler)\//.test(pkg)) return 'vendor-react';
          if (/^@radix-ui\/react-(dialog|popover|tooltip|dropdown-menu)\//.test(pkg)) return 'vendor-ui';
          if (/^(recharts|recharts-scale|victory-vendor|d3-[a-z-]+|internmap|decimal\.js-light)\//.test(pkg)) return 'vendor-charts';
          // Tiny class-name helpers used app-wide; without this Rollup folds them
          // into vendor-charts (a dependency of recharts) and every page preloads it.
          if (/^(clsx|tailwind-merge|class-variance-authority)\//.test(pkg)) return 'vendor-utils';
          if (/^@tanstack\//.test(pkg)) return 'vendor-query';
          if (/^@supabase\//.test(pkg)) return 'vendor-supabase';
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
}));
