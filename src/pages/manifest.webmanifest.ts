import { siteConfig } from "../data/constants";

import type { ManifestOptions } from "vite-plugin-pwa";

const icons: ManifestOptions["icons"] = [
  {
    src: "/web-app-manifest-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/web-app-manifest-192x192.png",
    sizes: "192x192",
    type: "image/png",
    purpose: "maskable",
  },
  {
    src: "/web-app-manifest-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "any",
  },
  {
    src: "/web-app-manifest-512x512.png",
    sizes: "512x512",
    type: "image/png",
    purpose: "maskable",
  },
];

export const manifest: Partial<ManifestOptions> = {
  id: "/",
  name: siteConfig.name,
  short_name: siteConfig.name,
  description: siteConfig.description,
  lang: siteConfig.locale,
  start_url: "/",
  scope: "/",
  display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#ffffff",
  dir: "ltr",
  orientation: "any",
  categories: ["education", "science", "productivity"],
  icons,
  shortcuts: [
    {
      name: "Home",
      short_name: "Home",
      url: "/",
      icons,
    },
    {
      name: "About",
      short_name: "About",
      url: "/about",
      icons,
    },
    {
      name: "Admissions",
      short_name: "Admissions",
      url: "/about/admission",
      icons,
    },
    {
      name: "Alumni",
      short_name: "Alumni",
      url: "/alumni",
      icons,
    },
    {
      name: "Contact",
      short_name: "Contact",
      url: "/contact",
      icons,
    },
  ],
  prefer_related_applications: false,
};

export const GET = () => {
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json",
    },
  });
};
