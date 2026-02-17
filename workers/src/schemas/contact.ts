import { z } from "zod";

export const contactSchema = z
  .object({
    email: z.string().email().max(100),
    name: z.string().min(1).max(100),
    subject: z.string().min(1).max(150),
    message: z.string().min(10).max(4000),
    "cf-turnstile-response": z.string().min(1),
  })
  .strict();

export type ContactValidated = z.infer<typeof contactSchema>;
