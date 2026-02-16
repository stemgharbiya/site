# STEM Gharbiya — Workers (Edge Backend)

This directory contains the **server-side Workers application** that powers parts of the STEM Gharbiya website. It runs on Cloudflare Workers using the Hono framework and is deployed to Cloudflare’s edge network.

> This is **not** the full website. It contains only the backend APIs and background logic used by the site.

---

## Current Status

### Implemented

- **Join Dev Team Worker**
  - Accepts applications
  - Validates input
  - Stores submissions in D1
  - Sends notification and confirmation emails

### Planned

- Contact form worker
- Newsletter subscription worker

---

## Architecture Overview

- **Runtime:** Cloudflare Workers (Edge/serverless)
- **Framework:** Hono (TypeScript)
- **Database:** Cloudflare D1 (SQLite)
- **KV Store:** Cloudflare KV (Rate limiting)
- **Validation:** Zod
- **Bot Protection:** Cloudflare Turnstile
- **Email Delivery:** Resend
- **Tooling:** Wrangler, Miniflare

---

# Features

### Security and Abuse Prevention

- Configurable rate limiting (Cloudflare binding)
- Turnstile CAPTCHA verification
- Duplicate submission prevention (email + GitHub username)
- Strict server-side validation
- Parameterized queries (SQL injection protection)

### Data and Persistence

- Structured storage in D1
- Automatic table creation during local development (optional)
- Easy querying and backup via Wrangler

### Email Automation

- Confirmation email to applicant
- Internal notification to team
- Optional email disabling for development

### Developer Experience

- Fully typed (TypeScript)
- Zod-based schemas
- Modular service structure
- Local development with Wrangler

---

# Prerequisites

- Node.js 18+
- Cloudflare account
- Resend account (for email sending)
- Git

---

# Quick Start

## 1. Clone Repository

```bash
git clone https://github.com/stemgharbiya/site.git
cd site
```

## 2. Install Dependencies

```bash
npm install
# or
pnpm install
```

---

## 3. Create D1 Database

```bash
npx wrangler d1 create stemgharbiya-site
```

Create the applications table:

```bash
npx wrangler d1 execute stemgharbiya-site --command="
CREATE TABLE applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT NOT NULL,
  schoolEmail TEXT NOT NULL,
  githubUsername TEXT NOT NULL,
  seniorYear TEXT NOT NULL,
  interests TEXT NOT NULL,
  motivation TEXT NOT NULL,
  timestamp TEXT NOT NULL
);"
```

Note: During local development, the app attempts to create the table automatically if it does not exist.
By default `wrangler.jsonc` sets `APP_ENV=production`. The app will only attempt automatic DB creation when `APP_ENV` is not `production` or when `AUTO_CREATE_DB=true` is set in your environment. For local development set `APP_ENV=development` in your `.dev.vars`.

---

## 4. Create KV Namespace (Rate Limiting)

```bash
npx wrangler kv:namespace create "SUBMIT_RATE_LIMITER"
```

Then update the generated namespace ID in `wrangler.jsonc`.

---

## 5. Configure Environment Variables

Create `.dev.vars`:

```
RESEND_API_KEY=your_resend_api_key
RESEND_SENDER_EMAIL=your-verified-email@resend.dev
TEAM_NOTIFICATION_EMAIL=team@example.com
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
DISABLE_EMAILS=false
  # Optional: set application environment. Use "production" in production.
  APP_ENV=development
  # Optional: allow automatic DB creation even in production (use with caution)
  AUTO_CREATE_DB=false
```

---

## 6. Start Local Development

```bash
npm run dev
```

Visit:

```
http://localhost:8788
```

---

# Deployment

## 1. Update `wrangler.jsonc`

- Add your D1 database ID
- Add your KV namespace ID
- Configure production bindings

## 2. Deploy

```bash
npx wrangler pages deploy .
```

## 3. Set Production Secrets

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put RESEND_SENDER_EMAIL
npx wrangler secret put TEAM_NOTIFICATION_EMAIL
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put DISABLE_EMAILS
```

---

# API

### `POST /join`

Accepts a JSON payload validated against the Zod schema in:

```
src/schemas/join.ts
```

Handles:

- Validation
- Rate limiting
- Turnstile verification
- Database insertion
- Email dispatch

Set:

```
DISABLE_EMAILS=true
```

to disable email sending during testing.

---

# Validation Rules

- **Email domain:** `@stemgharbiya.moe.edu.eg`
- **Senior Year:** S25–S30 only
- **Interests:** At least one required
- **Motivation:** 10–500 characters
- **Duplicates:** Same email + GitHub username blocked

---

# Database Management

### View Submissions (Local)

```bash
npx wrangler d1 execute stemgharbiya-site --command="SELECT * FROM applications;"
```

### View Submissions (Production)

```bash
npx wrangler d1 execute stemgharbiya-site --remote --command="SELECT * FROM applications;"
```

### Backup

```bash
npx wrangler d1 backup create stemgharbiya-site --name backup-$(date +%Y%m%d)
```

---

# Project Structure

```
├── .dev.vars
├── .env.example
├── package.json
├── tsconfig.json
├── wrangler.jsonc
├── src/
│   ├── index.ts
│   ├── env.d.ts
│   ├── lib/
│   ├── schemas/
│   ├── services/
│   └── types/
└── README.md
```

---

# Available Scripts

- `npm run dev` — Start local dev server
- `npm run deploy` — Deploy to production

---

# Security Overview

- Rate limiting via Cloudflare binding
- CAPTCHA verification with Turnstile
- Strict Zod validation
- Prepared SQL statements
- Escaped HTML in emails
- Secrets stored in environment bindings

---

# Acknowledgments

Built for the STEM Gharbiya community.  
Powered by Cloudflare’s edge platform.  
Email delivery via Resend.
