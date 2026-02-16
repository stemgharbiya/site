import { rateLimit } from "../lib/ratelimit";
import { sendResendEmail } from "../lib/email";
import { escapeHtml } from "../lib/utils";
import { verifyTurnstile } from "../lib/turnstile";
import {
  securityHeaders,
  type JoinApplicationData,
} from "../../../src/data/forms";
import type { JoinValidated } from "../schemas/join";
import { type Context } from "hono";

export async function sendTeamEmail(
  data: JoinApplicationData,
  interests: JoinApplicationData["interests"],
  timestamp: string,
  env: Env,
) {
  const emailData = {
    from: env.RESEND_SENDER_EMAIL,
    to: [env.TEAM_NOTIFICATION_EMAIL],
    subject: `New Dev Team Application: ${data.fullName?.slice(0, 50) || "New Applicant"}`,
    html: `
      <h2>New Dev Team Application</h2>
      <p><strong>Name:</strong> ${escapeHtml(data.fullName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(data.schoolEmail)}</p>
      <p><strong>GitHub:</strong> ${escapeHtml(data.githubUsername)}</p>
      <p><strong>Senior Year:</strong> ${escapeHtml(data.seniorYear?.toUpperCase() || "")}</p>
      <p><strong>Interests:</strong> ${(typeof interests === "string" ? interests.split(",") : interests).map(escapeHtml).join(", ")}</p>
      <p><strong>Motivation:</strong> ${escapeHtml(data.motivation)}</p>
      <p><strong>Submitted:</strong> ${new Date(timestamp).toISOString().slice(0, 10)}</p>
      <hr/>
      <p><a href="https://github.com/${encodeURIComponent(data.githubUsername)}">View applicant's GitHub profile</a></p>
    `,
  };

  return sendResendEmail(emailData, env);
}

export async function sendApplicantEmail(
  data: JoinApplicationData,
  interests: JoinApplicationData["interests"],
  env: Env,
) {
  const emailData = {
    from: env.RESEND_SENDER_EMAIL,
    to: [data.schoolEmail],
    subject: "Application Received - STEM Gharbiya Dev Team",
    html: `
      <p>Hi ${escapeHtml(data.fullName)},</p>
      <p>Thank you for applying to join the STEM Gharbiya Dev Team!</p>
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
        <li>Contact you with next steps if approved</li>
      </ol>
      <p>In the meantime, check out our projects: 
        <a href="https://github.com/stemgharbiya">github.com/stemgharbiya</a>
      </p>
      <p>Questions? Reply to this email.</p>
      <p>— STEM Gharbiya Team</p>
    `,
  };

  return sendResendEmail(emailData, env);
}

export const handleJoinRequests = async (c: Context<{ Bindings: Env }>) => {
  const headers = { "Content-Type": "application/json", ...securityHeaders };
  try {
    if (!c.env.DB) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    const data = (
      c as unknown as { req: { valid(name: "json"): JoinValidated } }
    ).req.valid("json");

    const turnstileToken = data["cf-turnstile-response"];

    const ip =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0] ||
      "unknown";

    const turnstileError = await verifyTurnstile(
      turnstileToken,
      c.env.TURNSTILE_SECRET_KEY,
      ip,
    );
    if (turnstileError) return turnstileError;

    const rateLimitResponse = await rateLimit(c.env, data.schoolEmail);
    if (rateLimitResponse) return rateLimitResponse;

    const interests = (data.interests as unknown as string[]) || [];

    const timestamp = new Date().toISOString();

    try {
      const checkStmt = c.env.DB.prepare(
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
      const stmt = c.env.DB.prepare(
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
      sendTeamEmail(data, interests, timestamp, c.env),
      sendApplicantEmail(data, interests, c.env),
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
