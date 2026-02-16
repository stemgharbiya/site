export async function rateLimit(env: Env, userKey: string) {
  const { success } = await env.SUBMIT_RATE_LIMITER.limit({ key: userKey });
  if (!success) {
    return new Response(
      JSON.stringify({ error: "Too many requests, try again later" }),
      {
        status: 429,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return null;
}
