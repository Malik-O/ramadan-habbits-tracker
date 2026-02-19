import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// Build-time revision so precached pages refresh on each deploy
const BUILD_ID = Date.now().toString();

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    skipWaiting: true,
    // Pre-cache all static page routes for full offline support
    additionalManifestEntries: [
      { url: "/", revision: BUILD_ID },
      { url: "/manage", revision: BUILD_ID },
      { url: "/profile", revision: BUILD_ID },
      { url: "/stats", revision: BUILD_ID },
      { url: "/leaderboard", revision: BUILD_ID },
    ],
    // Runtime caching strategies for dynamic requests
    runtimeCaching: [
      // Cache Google Fonts stylesheets (stale-while-revalidate)
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // Cache Google Fonts webfont files (cache-first since they're versioned)
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
      // Cache images from the same origin
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images-cache",
          expiration: {
            maxEntries: 60,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      // Cache Next.js static assets (JS/CSS bundles)
      {
        urlPattern: /^\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year (content-hashed)
          },
        },
      },
      // Cache page navigations (stale-while-revalidate for HTML pages)
      {
        urlPattern: /^\/(?!api\/).*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
          networkTimeoutSeconds: 3,
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  // Allow @ducanh2912/next-pwa webpack plugin alongside Turbopack
  turbopack: {},
};

export default withPWA(nextConfig);
