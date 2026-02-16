import type { JoinValidated } from "../schemas/join";

declare module "hono" {
  interface Context {
    req: Request & {
      valid(name: "json"): JoinValidated;
    };
  }
}
