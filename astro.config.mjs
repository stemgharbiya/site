// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import { siteConfig } from "./src/data/constants";
import AstroPWA from "@vite-pwa/astro";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["mill-max-orientation-gentle.trycloudflare.com"]
    }
  },
  integrations: [AstroPWA({}), sitemap()],
});
