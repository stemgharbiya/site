import { rateLimit } from "../lib/ratelimit";
import { sendResendEmail } from "../lib/email";
import { escapeHtml } from "../lib/utils";
import { verifyTurnstile } from "../lib/turnstile";
import { securityHeaders } from "../../../src/data/forms";
import type { ContactValidated } from "../schemas/contact";
import { type Context } from "hono";

type ContactRequestData = {
  email: string;
  name: string;
  subject: string;
  message: string;
  "cf-turnstile-response": string;
};

export async function sendTeamContactEmail(
  data: ContactRequestData,
  timestamp: string,
  env: Env,
) {
  const emailData = {
    from: env.RESEND_SENDER_EMAIL,
    to: [env.TEAM_NOTIFICATION_EMAIL],
    subject: `New Contact Message: ${data.subject.slice(0, 80)}`,
    html: `
			<h2>New Contact Message</h2>
			<p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
			<p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
			<p><strong>Subject:</strong> ${escapeHtml(data.subject)}</p>
			<p><strong>Message:</strong></p>
			<p>${escapeHtml(data.message).replace(/\n/g, "<br/>")}</p>
			<p><strong>Submitted:</strong> ${new Date(timestamp).toISOString().slice(0, 10)}</p>
		`,
  };

  return sendResendEmail(emailData, env);
}

export async function sendContactAcknowledgementEmail(
  data: ContactRequestData,
  env: Env,
) {
  const emailData = {
    from: env.RESEND_SENDER_EMAIL,
    to: [data.email],
    subject: "Message Received - STEM Gharbiya",
    html: `
			<p>Hi ${escapeHtml(data.name)},</p>
			<p>Thank you for contacting STEM Gharbiya. We received your message.</p>
			<p><strong>Summary:</strong></p>
			<ul>
				<li><strong>Subject:</strong> ${escapeHtml(data.subject)}</li>
				<li><strong>Message:</strong> ${escapeHtml(data.message).replace(/\n/g, "<br/>")}</li>
			</ul>
			<p>Our team will review your message and get back to you as soon as possible.</p>
			<p>STEM Gharbiya Team</p>
		`,
  };

  return sendResendEmail(emailData, env);
}

export const handleContactRequests = async (c: Context<{ Bindings: Env }>) => {
  const headers = { "Content-Type": "application/json", ...securityHeaders };
  try {
    if (!c.env.DB) {
      return new Response(
        JSON.stringify({ error: "Service temporarily unavailable" }),
        { status: 500, headers },
      );
    }

    const data = (
      c as unknown as { req: { valid(name: "json"): ContactValidated } }
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

    const rateLimitResponse = await rateLimit(c.env, data.email);
    if (rateLimitResponse) return rateLimitResponse;

    const timestamp = new Date().toISOString();

    try {
      const stmt = c.env.DB.prepare(
        "INSERT INTO contacts (name, email, subject, message, timestamp) VALUES (?, ?, ?, ?, ?)",
      );
      await stmt
        .bind(
          data.name.trim(),
          data.email,
          data.subject.trim(),
          data.message.trim(),
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
      sendTeamContactEmail(data, timestamp, c.env),
      sendContactAcknowledgementEmail(data, c.env),
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
          warning: "Message received but notifications may be delayed",
          message: "Message sent successfully",
        }),
        { status: 200, headers },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Message sent successfully",
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
