import { Resend } from "resend";

interface EmailData {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

export async function sendResendEmail(emailData: EmailData, env: Env) {
  const resend = new Resend(env.RESEND_API_KEY);

  if (env.DISABLE_EMAILS === "true") {
    console.log("Email sending disabled. email:", emailData);
    return;
  }
  try {
    if (!env.RESEND_SENDER_EMAIL) {
      throw new Error("RESEND_SENDER_EMAIL is not configured");
    }

    const { data, error } = await resend.emails.send({
      from: env.RESEND_SENDER_EMAIL,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (error) {
      throw new Error(`Resend API error: ${error.message}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}
