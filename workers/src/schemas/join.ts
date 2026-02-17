import { z } from "zod";
import { MAX_FIELD_LENGTHS, ALLOWED_INTERESTS } from "../../../src/data/forms";
import {
  validateGitHubUsername,
  validateStudentSchoolEmail,
} from "../../../src/lib/utils";

export const joinSchema = z
  .object({
    fullName: z.string().min(1).max(MAX_FIELD_LENGTHS.fullName),
    schoolEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email()
      .refine(validateStudentSchoolEmail, {
        message:
          "Use your student school email in this format: name.19YYXXX@stemgharbiya.moe.edu.eg",
      }),
    githubUsername: z
      .string()
      .max(MAX_FIELD_LENGTHS.githubUsername)
      .refine(validateGitHubUsername, {
        message: "Invalid GitHub username format",
      }),
    seniorYear: z.string().regex(/^[Ss](2[5-9]|30)$/),
    interests: z
      .union([z.string(), z.array(z.string())])
      .transform((v) =>
        Array.isArray(v)
          ? v
          : v
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
      )
      .refine((arr) => arr.length >= 1 && arr.length <= 5)
      .refine((arr) => arr.every((i) => ALLOWED_INTERESTS.includes(i))),
    motivation: z.string().min(10).max(MAX_FIELD_LENGTHS.motivation),
    "cf-turnstile-response": z.string().min(1),
    agreement: z.preprocess(
      (v) => {
        if (typeof v === "string") return v.length > 0;
        return v;
      },
      z.boolean().refine((b) => b === true, {
        message: "You must agree to the Code of Conduct",
      }),
    ),
  })
  .strict();

export type JoinValidated = z.infer<typeof joinSchema>;
