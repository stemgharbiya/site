const RATE_LIMIT_WINDOW = 60;
const MAX_REQUESTS = 1;

export async function rateLimit(env: Env, userKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const kvKey = `rate:${userKey}`;

  const existing = (await env.SUBMIT_RATE_LIMITER.get(kvKey, "json")) as {
    count: number;
    expires: number;
  } | null;

  if (existing) {
    if (existing.expires > now) {
      if (existing.count >= MAX_REQUESTS) {
        return new Response(
          JSON.stringify({ error: "Too many requests, try again later" }),
          { status: 429, headers: { "Content-Type": "application/json" } },
        );
      } else {
        await env.SUBMIT_RATE_LIMITER.put(
          kvKey,
          JSON.stringify({
            count: existing.count + 1,
            expires: existing.expires,
          }),
          { expiration: existing.expires },
        );
      }
    } else {
      await env.SUBMIT_RATE_LIMITER.put(
        kvKey,
        JSON.stringify({
          count: 1,
          expires: now + RATE_LIMIT_WINDOW,
        }),
        { expiration: now + RATE_LIMIT_WINDOW },
      );
    }
  } else {
    await env.SUBMIT_RATE_LIMITER.put(
      kvKey,
      JSON.stringify({
        count: 1,
        expires: now + RATE_LIMIT_WINDOW,
      }),
      { expiration: now + RATE_LIMIT_WINDOW },
    );
  }

  return null;
}
