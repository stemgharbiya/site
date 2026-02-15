import { rateLimit } from "./ratelimit";

// Types
interface ApplicationData {
  fullName: string;
  schoolEmail: string;
  githubUsername: string;
  seniorYear: string;
  interests: string | string[];
  motivation: string;
  "cf-turnstile-response": string;
}

interface EmailData {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

async function verifyTurnstile(token: string, secret: string, ip: string) {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return new Response(
      JSON.stringify({ error: "Invalid verification token" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!secret || typeof secret !== "string") {
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    // Validate the token by calling the "/siteverify" API.
    let formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token.trim());
    formData.append("remoteip", ip);

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        body: formData,
        method: "POST",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!result.ok) {
      throw new Error(`Verification service returned ${result.status}`);
    }

    const outcome: any = await result.json();

    if (!outcome.success) {
      console.error("Turnstile verification failed:", {
        "error-codes": outcome["error-codes"],
        ip: ip || "unknown",
        timestamp: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: "Verification failed. Please try again." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return null;
  } catch (error: any) {
    console.error("Turnstile verification error:", error.message);

    return new Response(
      JSON.stringify({ error: "Verification service temporarily unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }
}

function escapeHtml(str: string) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function validateSeniorYear(year: string) {
  if (!year) return false;
  const match = String(year).match(/^[Ss](\d+)$/);
  if (!match) return false;
  const yearNum = parseInt(match[1], 10);
  return yearNum >= 25 && yearNum <= 30;
}

function validateGitHubUsername(username: string) {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}

const MAX_FIELD_LENGTHS = {
  fullName: 100,
  schoolEmail: 100,
  githubUsername: 39,
  seniorYear: 10,
  motivation: 2000,
};

const ALLOWED_INTERESTS = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Game Development",
  "Open Source",
  "DevOps",
];

const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

async function sendResendEmail(emailData: EmailData, env: Env, type: string) {
  if (env.DISABLE_EMAILS) {
    console.log("Email sending disabled. email:", emailData);
    return;
  }
  try {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    if (!env.RESEND_SENDER_EMAIL) {
      throw new Error("RESEND_SENDER_EMAIL is not configured");
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(`Resend API error (${response.status}): ${responseText}`);
    }

    const result = JSON.parse(responseText);
    return result;
  } catch (error) {
    throw error;
  }
}

async function sendTeamEmail(
  data: ApplicationData,
  interests: ApplicationData["interests"],
  timestamp: string,
  env: Env,
) {
  const emailData = {
    from: env.RESEND_SENDER_EMAIL,
    to: [env.TEAM_NOTIFICATION_EMAIL],
    subject: `New Application: ${data.fullName?.slice(0, 50) || "New Applicant"}`,
    html: `
      <h2>New GitHub Join Request</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.schoolEmail)}</p>
      <p><strong>GitHub:</strong> ${escapeHtml(data.githubUsername)}</p>
      <p><strong>Senior Year:</strong> ${escapeHtml(data.seniorYear?.toUpperCase() || "")}</p>
      <p><strong>Interests:</strong> ${(typeof interests === "string" ? interests.split(",") : interests).map(escapeHtml).join(", ")}</p>
      <p><strong>Motivation:</strong> ${escapeHtml(data.motivation)}</p>
      <p><strong>Submitted:</strong> ${timestamp}</p>
      <hr/>
      <p><a href="https://github.com/${encodeURIComponent(data.githubUsername)}">View GitHub Profile</a></p>
    `,
  };

  return sendResendEmail(emailData, env, "team");
}

async function sendApplicantEmail(
  data: ApplicationData,
  interests: ApplicationData["interests"],
  env: Env,
) {
  const emailData = {
    from: env.RESEND_SENDER_EMAIL,
    to: [data.schoolEmail],
    subject: "Application Received - STEM Gharbiya GitHub",
    html: `
      <p>Hi ${escapeHtml(data.fullName)},</p>
      <p>Thank you for applying to join the STEM Gharbiya GitHub organization!</p>
      <p><strong>Application Summary:</strong></p>
      <ul>
        <li><strong>GitHub:</strong> ${escapeHtml(data.githubUsername)}</li>
        <li><strong>Senior Year:</strong> ${escapeHtml(data.seniorYear?.toUpperCase() || "")}</li>
        <li><strong>Interests:</strong> ${(typeof interests === "string" ? interests.split(",") : interests).map(escapeHtml).join(", ")}</li>
      </ul>
      <p><strong>What happens next?</strong></p>
      <ol>
        <li>We'll verify your school email</li>
        <li>Review your application (2-3 business days)</li>
        <li>Send a GitHub invitation if approved</li>
      </ol>
      <p>In the meantime, check out our projects: 
        <a href="https://github.com/stemgharbiya">github.com/stemgharbiya</a>
      </p>
      <p>Questions? Reply to this email.</p>
      <p>— STEM Gharbiya Team</p>
    `,
  };

  return sendResendEmail(emailData, env, "applicant");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const headers = { "Content-Type": "application/json", ...securityHeaders };
  try {
    if (!context.env.DB) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    if (
      !context.env.RESEND_API_KEY ||
      !context.env.RESEND_SENDER_EMAIL ||
      !context.env.TEAM_NOTIFICATION_EMAIL
    ) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    // Validate Turnstile configuration
    if (!context.env.TURNSTILE_SECRET_KEY) {
      console.error("TURNSTILE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    const data: ApplicationData = await context.request.json();

    const turnstileToken = data["cf-turnstile-response"];

    if (!turnstileToken || typeof turnstileToken !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid verification token" }),
        { status: 400, headers },
      );
    }

    const ip =
      context.request.headers.get("CF-Connecting-IP") ||
      context.request.headers.get("X-Forwarded-For")?.split(",")[0] ||
      "unknown";

    const turnstileError = await verifyTurnstile(
      turnstileToken,
      context.env.TURNSTILE_SECRET_KEY,
      ip,
    );
    if (turnstileError) {
      return turnstileError;
    }

    if (
      !data.schoolEmail ||
      typeof data.schoolEmail !== "string" ||
      data.schoolEmail.length > MAX_FIELD_LENGTHS.schoolEmail
    ) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers,
      });
    }

    const rateLimitResponse = await rateLimit(context.env, data.schoolEmail);
    if (rateLimitResponse) return rateLimitResponse;

    if (!data.schoolEmail.endsWith("@stemgharbiya.moe.edu.eg")) {
      return new Response(
        JSON.stringify({ error: "Invalid school email domain" }),
        { status: 400, headers },
      );
    }

    if (
      !data.fullName ||
      typeof data.fullName !== "string" ||
      data.fullName.length > MAX_FIELD_LENGTHS.fullName ||
      data.fullName.trim().length === 0
    ) {
      return new Response(JSON.stringify({ error: "Invalid name format" }), {
        status: 400,
        headers,
      });
    }

    if (
      !data.githubUsername ||
      typeof data.githubUsername !== "string" ||
      data.githubUsername.length > MAX_FIELD_LENGTHS.githubUsername ||
      !validateGitHubUsername(data.githubUsername)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid GitHub username format" }),
        { status: 400, headers },
      );
    }

    if (
      !data.seniorYear ||
      typeof data.seniorYear !== "string" ||
      !validateSeniorYear(data.seniorYear)
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid senior year format" }),
        { status: 400, headers },
      );
    }

    if (
      !data.motivation ||
      typeof data.motivation !== "string" ||
      data.motivation.length > MAX_FIELD_LENGTHS.motivation ||
      data.motivation.trim().length === 0
    ) {
      return new Response(
        JSON.stringify({ error: "Invalid motivation format" }),
        { status: 400, headers },
      );
    }

    const interests = data.interests
      ? typeof data.interests === "string"
        ? data.interests.split(",")
        : data.interests
      : [];

    if (
      !Array.isArray(interests) ||
      interests.length === 0 ||
      interests.length > 5
    ) {
      return new Response(
        JSON.stringify({ error: "Select at least one interest" }),
        { status: 400, headers },
      );
    }

    for (const interest of interests) {
      if (
        typeof interest !== "string" ||
        !ALLOWED_INTERESTS.includes(interest.trim())
      ) {
        return new Response(
          JSON.stringify({ error: "Invalid interest selection" }),
          { status: 400, headers },
        );
      }
    }

    const timestamp = new Date().toISOString();

    try {
      const checkStmt = context.env.DB.prepare(
        "SELECT id FROM applications WHERE schoolEmail = ? AND githubUsername = ?",
      );
      const existing = await checkStmt
        .bind(data.schoolEmail, data.githubUsername)
        .first();
      if (existing) {
        return new Response(
          JSON.stringify({ error: "Application already exists" }),
          { status: 409, headers },
        );
      }
    } catch (dbError) {
      console.error("Database check error:", dbError);
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    try {
      const stmt = context.env.DB.prepare(
        "INSERT INTO applications (fullName, schoolEmail, githubUsername, seniorYear, interests, motivation, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)",
      );
      await stmt
        .bind(
          data.fullName.trim(),
          data.schoolEmail,
          data.githubUsername,
          data.seniorYear,
          interests.join(","),
          data.motivation.trim(),
          timestamp,
        )
        .run();
    } catch (dbError) {
      console.error("Database insert error:", dbError);
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    const emailResults = await Promise.allSettled([
      sendTeamEmail(data, interests, timestamp, context.env),
      sendApplicantEmail(data, interests, context.env),
    ]);

    const failedEmails = emailResults.filter((r) => r.status === "rejected");
    if (failedEmails.length > 0) {
      console.error(
        "Some emails failed:",
        failedEmails.map((f) => f.reason?.message),
      );

      return new Response(
        JSON.stringify({
          success: true,
          warning: "Application received but notifications may be delayed",
          message: "Application submitted successfully",
        }),
        { status: 200, headers },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Application submitted successfully",
      }),
      { status: 200, headers },
    );
  } catch (error) {
    console.error("Submission error:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers },
    );
  }
};
