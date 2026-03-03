import { siteConfig } from "../data/constants";

import type { ManifestOptions } from "vite-plugin-pwa";

import logo from "../assets/images/logo.png";
import logoDark from "../assets/images/logo.dark.png";

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
  icons: [
    {
      src: logo.src,
      sizes: "1993x1856",
      type: "image/png",
      purpose: "any",
    },
    {
      src: logoDark.src,
      sizes: "225x225",
      type: "image/png",
      purpose: "any",
    },
    {
      src: logo.src,
      sizes: "1993x1856",
      type: "image/png",
      purpose: "any maskable",
    },
  ],
  shortcuts: [
    {
      name: "Home",
      short_name: "Home",
      url: "/",
      icons: [{ src: logo.src, sizes: "1993x1856", type: "image/png" }],
    },
    {
      name: "About",
      short_name: "About",
      url: "/about",
      icons: [{ src: logo.src, sizes: "1993x1856", type: "image/png" }],
    },
    {
      name: "Admissions",
      short_name: "Admissions",
      url: "/about/admission",
      icons: [{ src: logo.src, sizes: "1993x1856", type: "image/png" }],
    },
    {
      name: "Alumni",
      short_name: "Alumni",
      url: "/alumni",
      icons: [{ src: logo.src, sizes: "1993x1856", type: "image/png" }],
    },
    {
      name: "Contact",
      short_name: "Contact",
      url: "/contact",
      icons: [{ src: logo.src, sizes: "1993x1856", type: "image/png" }],
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
