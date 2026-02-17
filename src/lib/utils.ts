export function escapeHtml(str: string) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function validateSeniorYear(year: string) {
  if (!year) return false;
  const match = String(year).match(/^[Ss](\d+)$/);
  if (!match) return false;
  const yearNum = parseInt(match[1], 10);
  return yearNum >= 25 && yearNum <= 30;
}

export function validateGitHubUsername(username: string) {
  return /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username);
}

export function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

export function validateStudentSchoolEmail(email: string) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  return /^[a-z0-9]+(?:[._-][a-z0-9]+)*\.19\d{5}@stemgharbiya\.moe\.edu\.eg$/.test(
    normalizedEmail,
  );
}
