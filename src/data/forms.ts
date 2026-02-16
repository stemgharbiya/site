export const MAX_FIELD_LENGTHS = {
  fullName: 100,
  schoolEmail: 100,
  githubUsername: 39,
  seniorYear: 10,
  motivation: 2000,
};

export const ALLOWED_INTERESTS = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Game Development",
  "Open Source",
  "DevOps",
];

export const securityHeaders = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export interface JoinApplicationData {
  fullName: string;
  schoolEmail: string;
  githubUsername: string;
  seniorYear: string;
  interests: string | string[];
  motivation: string;
  "cf-turnstile-response": string;
}