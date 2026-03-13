const apiBase = import.meta.env.API_BASE_URL || "http://localhost:8787";

function apiPost(path: string, payload: Record<string, unknown>) {
  return fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function postJoin(payload: Record<string, unknown>) {
  return await apiPost("/join", payload);
}

export async function postContact(payload: Record<string, unknown>) {
  return await apiPost("/contact", payload);
}
