import { client } from "../../workers/src/lib/client";

const apiBase = import.meta.env.API_BASE_URL || "http://localhost:8787";

type ApiClientContract = {
  join: {
    $post(args: { json: Record<string, unknown> }): Promise<Response>;
  };
  contact: {
    $post(args: { json: Record<string, unknown> }): Promise<Response>;
  };
};

const apiClient = client(apiBase) as ApiClientContract;

export async function postJoin(payload: Record<string, unknown>) {
  return await apiClient.join.$post({ json: payload });
}

export async function postContact(payload: Record<string, unknown>) {
  return await apiClient.contact.$post({ json: payload });
}
