import type { D1Database, RateLimit } from "@cloudflare/workers-types";

declare global {
  interface Env {
    SUBMIT_RATE_LIMITER: RateLimit;
    DB: D1Database;
    TURNSTILE_SITE_KEY: string;
    RESEND_API_KEY: string;
    RESEND_SENDER_EMAIL: string;
    TEAM_NOTIFICATION_EMAIL: string;
    DISABLE_EMAILS: string;
    TURNSTILE_SECRET_KEY: string;
    CORS_ORIGIN: string | string[];
    APP_ENV?: "development" | "production" | string;
    AUTO_CREATE_DB?: "true" | "false" | string;
  }
}

export {};
