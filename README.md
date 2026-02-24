# STEM Gharbiya — Website

This repository contains the **main STEM Gharbiya website** built with Astro and Tailwind CSS.

It includes public-facing pages for school information, academics, activities, alumni, contact, and team applications.

> For backend APIs and edge services documentation, see `workers/README.md`.

---

## Current Scope

### Implemented

- Multi-page Astro website with dynamic routes for activities and alumni
- Reusable component-driven sections (hero, stats, programs, admission, student life, etc.)
- Contact form and Join Dev Team form UI with client-side validation
- Cloudflare Turnstile integration on form pages
- Sitemap generation and PWA support

### Stack

- **Framework:** Astro 5 (TypeScript)
- **Styling:** Tailwind CSS 4
- **Icons:** `astro-icon` + Iconify packs
- **SEO/PWA:** `@astrojs/sitemap`, `@vite-pwa/astro`

---

## Folder Structure

```text
.
├── public/                  # Static public assets
├── scripts/
│   └── indexnow.js          # IndexNow submission utility
├── src/
│   ├── assets/images/       # Image assets (alumni, clubs, staff, etc.)
│   ├── components/          # Reusable Astro components and section blocks
│   │   ├── academics/
│   │   ├── admission/
│   │   ├── alumni/
│   │   ├── clubs/
│   │   ├── dorm/
│   │   ├── staff/
│   │   └── team/
│   ├── data/                # Site config + JSON content (team, alumni, clubs, staff)
│   ├── layouts/             # Shared page layouts
│   ├── lib/                 # Utilities and shared helpers
│   ├── pages/               # Route-based pages
│   │   ├── about/
│   │   ├── alumni/
│   │   ├── team/
│   │   └── contact.astro
│   ├── scripts/             # Browser form logic (join/contact/shared)
│   ├── styles/              # Global and feature styles
│   └── pwa.ts               # Service worker registration
├── workers/                 # Edge backend (documented separately)
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- Node.js 18+
- npm

---

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

3. Set frontend env values in `.env`:

```dotenv
TURNSTILE_SITE_KEY=your_turnstile_site_key
API_BASE_URL=http://localhost:8787
```

4. Start development server:

```bash
npm run dev
```

Default Astro dev URL:

```text
http://localhost:4321
```

5. (Optional, required for working contact/join form submissions locally) run the backend worker in a separate terminal:

```bash
cd workers
npm install
npm run dev
```

Worker dev URL (default):

```text
http://localhost:8787
```

---

## Available Scripts

- `npm run dev` — Start local Astro dev server
- `npm run build` — Build production output to `dist/`
- `npm run preview` — Preview the production build locally
- `npm run astro` — Run Astro CLI commands
- `npm run indexnow` — Submit site URLs via IndexNow helper script

---

## Configuration Notes

- Main site URL is configured in `src/data/constants.ts` and used by Astro sitemap.
- Contact and join forms submit to the API base defined by `API_BASE_URL`.
- Turnstile widget on form pages requires `TURNSTILE_SITE_KEY`.

---

## Build and Deployment

Build locally:

```bash
npm run build
```

Preview build output:

```bash
npm run preview
```

The app builds as an Astro site and can be deployed on any compatible static/SSR Astro hosting target.

---

## IndexNow (Optional)

Use `npm run indexnow` to submit URLs from generated sitemap files.

Optional environment variables:

- `INDEXNOW_KEY` — Explicit IndexNow key
- `INDEXNOW_KEY_FILE` — Path to file containing key
- `INDEXNOW_KEY_LOCATION` — Public URL of key file
- `INDEXNOW_HOST` — Host to submit for (defaults from sitemap URL)
- `INDEXNOW_ENDPOINT` — Submission endpoint (defaults to IndexNow API)
- `INDEXNOW_BATCH_SIZE` — URLs per request batch (default: `1000`)

Helpful flags:

- `npm run indexnow -- --dry-run` — Preview submission payload details
- `npm run indexnow -- --build` — Force `npm run build` before submission

---

## Additional Docs

- Website backend and worker-specific setup: `workers/README.md`
