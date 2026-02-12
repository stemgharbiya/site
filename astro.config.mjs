// @ts-check
import { defineConfig } from "astro/config";
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
  integrations: [AstroPWA({}), sitemap(), icon()],
});