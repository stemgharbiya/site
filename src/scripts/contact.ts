export {};

import { validateEmail } from "../lib/utils";

const apiBase = import.meta.env.API_BASE_URL || "http://localhost:8787";

type AlertType = "success" | "error" | "warning" | "info";

type AlertFn = (
  type: AlertType,
  title: string,
  message: string,
  details?: string,
  duration?: number,
) => HTMLDivElement | null;

declare global {
  interface Window {
    showAlert?: AlertFn;
    turnstile?: {
      getResponse: () => string;
      reset?: () => void;
    };
  }
}

const errorClasses = [
  "border-destructive",
  "focus:border-destructive",
  "focus:ring-destructive/20",
];

const alertStyles: Record<AlertType, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-border bg-secondary/50 text-foreground",
};

const showAlert: AlertFn = (
  type,
  title,
  message,
  details = "",
  duration = 5000,
) => {
  const container = document.getElementById("alertsContainer");
  if (!container) return null;
  container.innerHTML = "";
  const alert = document.createElement("div");
  alert.className = `rounded-2xl border px-4 py-3 text-sm shadow-sm ${alertStyles[type]}`;
  const icon =
    type === "success"
      ? "✓"
      : type === "error"
        ? "✗"
        : type === "warning"
          ? "!"
          : "i";
  alert.innerHTML = `
        <div class="flex items-center gap-2 text-sm font-semibold">
            <span>${icon}</span>
            <span>${title}</span>
        </div>
        <div class="mt-1 text-sm">${message}</div>
        ${details ? `<div class="mt-1 text-xs opacity-90">${details}</div>` : ""}
    `;
  container.appendChild(alert);
  alert.classList.remove("hidden");
  if (duration > 0) {
    setTimeout(() => {
      if (alert.parentNode === container) {
        alert.classList.add("opacity-0");
        alert.classList.add("-translate-y-2");
        setTimeout(() => {
          if (alert.parentNode === container) {
            container.removeChild(alert);
          }
        }, 300);
      }
    }, duration);
  }
  return alert;
};

function showFieldError(fieldId: string, message: string) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + "Error");
  if (field) field.classList.add(...errorClasses);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    const node = el as HTMLElement;
    node.classList.add("hidden");
    node.textContent = "";
  });
  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
    .forEach((el) => el.classList.remove(...errorClasses));
  const container = document.getElementById("alertsContainer");
  if (container) container.innerHTML = "";
}

function saveFormData() {
  const formData = {
    name: (document.getElementById("name") as HTMLInputElement | null)?.value,
    email: (document.getElementById("email") as HTMLInputElement | null)?.value,
    subject: (document.getElementById("subject") as HTMLInputElement | null)
      ?.value,
    message: (document.getElementById("message") as HTMLTextAreaElement | null)
      ?.value,
  };
  try {
    localStorage.setItem("stemgharbiya-contact", JSON.stringify(formData));
  } catch {}
}

function loadFormData() {
  try {
    const savedData = localStorage.getItem("stemgharbiya-contact");
    if (!savedData) return;
    const formData = JSON.parse(savedData);
    if (formData.name)
      (document.getElementById("name") as HTMLInputElement).value =
        formData.name;
    if (formData.email)
      (document.getElementById("email") as HTMLInputElement).value =
        formData.email;
    if (formData.subject)
      (document.getElementById("subject") as HTMLInputElement).value =
        formData.subject;
    if (formData.message)
      (document.getElementById("message") as HTMLTextAreaElement).value =
        formData.message;
  } catch {}
}

function clearFormData() {
  try {
    localStorage.removeItem("stemgharbiya-contact");
  } catch {}
}

function setLoading(loading: boolean) {
  const submitBtn = document.getElementById(
    "submitBtn",
  ) as HTMLButtonElement | null;
  const submitText = document.getElementById("submitText");
  if (!submitBtn || !submitText) return;
  const existingSpinner = document.getElementById("submitSpinner");
  if (loading) {
    submitBtn.disabled = true;
    submitText.textContent = "Sending...";
    if (!existingSpinner) {
      const spinner = document.createElement("span");
      spinner.id = "submitSpinner";
      spinner.className =
        "ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent";
      submitText.after(spinner);
    }
  } else {
    submitBtn.disabled = false;
    submitText.textContent = "Send Message";
    existingSpinner?.remove();
  }
}

async function submitForm(formData: FormData) {
  setLoading(true);
  clearErrors();
  try {
    const response = await fetch(`${apiBase}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 400) {
        let errMsg = "";
        let detailsText = "";
        if (result) {
          if (typeof result.error === "string") errMsg = result.error;
          else if (
            result.error &&
            typeof result.error === "object" &&
            result.error.message
          )
            errMsg = result.error.message;
          else if (result.message) errMsg = result.message;
          else if (result.issues && Array.isArray(result.issues)) {
            errMsg = "Validation failed";
            detailsText = result.issues
              .map((i: any) => i.message || JSON.stringify(i))
              .join("; ");
          } else errMsg = JSON.stringify(result);
          if (!detailsText && result.details) detailsText = result.details;
        } else {
          errMsg = "Please check your form inputs";
        }

        showAlert(
          "error",
          "Validation Error",
          errMsg || "Please check your form inputs",
          detailsText || "",
        );
      } else {
        throw new Error(
          result.error || result.message || `Server error: ${response.status}`,
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    showAlert(
      "success",
      "Message Sent",
      result.message || "Your message has been sent successfully.",
      result.warning ? `Note: ${result.warning}` : "",
    );
    clearFormData();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      (
        document.getElementById("contactForm") as HTMLFormElement | null
      )?.reset();
    }, 1000);
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      showAlert(
        "error",
        "Network Error",
        "Unable to connect to the server. Please check your internet connection and try again.",
        "",
        10000,
      );
    } else if (error instanceof Error) {
      showAlert(
        "error",
        "Submission Failed",
        error.message || "An unexpected error occurred. Please try again.",
        "",
        10000,
      );
    } else {
      showAlert(
        "error",
        "Submission Failed",
        "An unexpected error occurred. Please try again.",
        "",
        10000,
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  } finally {
    setLoading(false);
  }
}

function bindFormHandlers() {
  const form = document.getElementById("contactForm") as HTMLFormElement | null;
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);

    let hasErrors = false;

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name) {
      showFieldError("name", "This field is required");
      hasErrors = true;
    }

    if (!email || !validateEmail(email)) {
      showFieldError("email", "Please enter a valid email address");
      hasErrors = true;
    }

    if (!subject) {
      showFieldError("subject", "This field is required");
      hasErrors = true;
    }

    if (message.length < 10 || message.length > 4000) {
      showFieldError("message", "Message must be 10-4000 characters");
      hasErrors = true;
    }

    const turnstileToken = window.turnstile?.getResponse?.() ?? "";
    if (!turnstileToken.trim()) {
      showAlert(
        "error",
        "Captcha Required",
        "Please complete the Turnstile captcha before submitting.",
      );
      hasErrors = true;
    }

    if (hasErrors) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    formData.set("name", name);
    formData.set("email", email);
    formData.set("subject", subject);
    formData.set("message", message);
    formData.set("cf-turnstile-response", turnstileToken);

    await submitForm(formData);
    if (window.turnstile?.reset) window.turnstile.reset();
  });

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
    .forEach((field) => {
      field.addEventListener(
        "input",
        function (this: HTMLInputElement | HTMLTextAreaElement) {
          this.classList.remove(...errorClasses);
          const errorElement = document.getElementById(this.id + "Error");
          if (errorElement) errorElement.classList.add("hidden");
        },
      );
    });
}

window.showAlert = showAlert;

loadFormData();
bindFormHandlers();

document
  .querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >('input[type="text"], input[type="email"], textarea')
  .forEach((field) => field.addEventListener("input", saveFormData));
