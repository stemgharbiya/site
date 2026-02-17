import { Hono } from "hono";
import { cors } from "hono/cors";
import { siteConfig } from "../../src/data/constants";
import { handleJoinRequests } from "./services/join";
import { handleContactRequests } from "./services/contact";
import { zValidator } from "@hono/zod-validator";
import { joinSchema } from "./schemas/join";
import { contactSchema } from "./schemas/contact";
import { env } from "cloudflare:workers";

function validateEnvVars() {
  const requiredVars = [
    "RESEND_API_KEY",
    "RESEND_SENDER_EMAIL",
    "TEAM_NOTIFICATION_EMAIL",
    "TURNSTILE_SITE_KEY",
    "TURNSTILE_SECRET_KEY",
  ];
  const missing: string[] = [];

  for (const key of requiredVars) {
    if (!env[key as keyof typeof env]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  console.log("✓ All required environment variables are configured");
}

validateEnvVars();

let DB_INITIALIZED = false;

async function ensureDatabase(envParam: Env) {
  try {
    const db = envParam.DB as any;
    if (!db) return;
    await db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        schoolEmail TEXT NOT NULL,
        githubUsername TEXT NOT NULL,
        seniorYear TEXT NOT NULL,
        interests TEXT NOT NULL,
        motivation TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `,
      )
      .run();

    await db
      .prepare(
        `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL
      );
    `,
      )
      .run();

    console.log("✓ D1 database initialized");
  } catch (err) {
    console.error("Failed to initialize D1 database", err);
  }
}

const app = new Hono<{ Bindings: Env }>();

app.use("*", async (c, next) => {
  const appEnv = String(c.env.APP_ENV || "development").toLowerCase();
  const autoCreate =
    String(c.env.AUTO_CREATE_DB || "false").toLowerCase() === "true";
  if (!DB_INITIALIZED && (appEnv !== "production" || autoCreate)) {
    await ensureDatabase(c.env as unknown as Env);
    DB_INITIALIZED = true;
    console.log(
      `Database initialization attempted (APP_ENV=${appEnv}, AUTO_CREATE_DB=${autoCreate})`,
    );
  } else if (!DB_INITIALIZED) {
    console.log(`Skipping automatic DB init in production (APP_ENV=${appEnv})`);
  }
  const rawOrigin = c.env.CORS_ORIGIN;
  const allowedOrigins = Array.isArray(rawOrigin)
    ? rawOrigin
    : String(rawOrigin || "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);
  const corsMiddlewareHandler = cors({
    origin: allowedOrigins.length ? allowedOrigins : "*",
  });
  return corsMiddlewareHandler(c, next);
});

app.post(
  "/join",
  zValidator("json", joinSchema, (result, c) => {
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const field =
        firstIssue?.path && firstIssue.path.length > 0
          ? String(firstIssue.path[0])
          : null;
      return c.json(
        {
          error: firstIssue?.message || "Validation failed",
          field,
        },
        400,
      );
    }
  }),
  async (c) => {
    return await handleJoinRequests(c);
  },
);

app.post(
  "/contact",
  zValidator("json", contactSchema, (result, c) => {
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const field =
        firstIssue?.path && firstIssue.path.length > 0
          ? String(firstIssue.path[0])
          : null;
      return c.json(
        {
          error: firstIssue?.message || "Validation failed",
          field,
        },
        400,
      );
    }
  }),
  async (c) => {
    return await handleContactRequests(c);
  },
);

app.get("/", (c) => {
  return c.text(`Welcome to the ${siteConfig.name} Site Workers API!`);
});

export default app;
