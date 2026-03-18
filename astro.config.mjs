// @ts-check
import { defineConfig, envField } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import { siteConfig } from "./src/data/constants";
import AstroPWA from "@vite-pwa/astro";

import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    layout: "constrained",
  },
  env: {
    schema: {
      API_BASE_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "http://localhost:8787",
      }),
      TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },
  integrations: [
    AstroPWA({
      registerType: "autoUpdate",
      workbox: {
        globDirectory: "dist",
        globPatterns: [
          "**/*.{html,js,css,svg,png,jpg,jpeg,gif,webp,woff,woff2,ttf,eot,ico}",
        ],
        navigateFallback: null,
      },
    }),
    sitemap(),
    icon(),
  ],
});
