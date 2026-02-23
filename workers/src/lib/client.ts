import { hc } from "hono/client";
import type { AppType } from "../index";

export type ApiPayload = Record<string, unknown>;

export type ApiClient = ReturnType<typeof hc<AppType>>;

export const client = (baseUrl: string): ApiClient => hc<AppType>(baseUrl);
