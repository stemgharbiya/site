export async function verifyTurnstile(token: string, secret: string, ip: string) {
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