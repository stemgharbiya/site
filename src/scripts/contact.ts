export {};

import { validateEmail } from "../lib/utils";
import { postContact } from "./apiClient";
import {
  clearErrors as clearErrorsBase,
  extractValidationError,
  hideFieldError,
  resetTurnstile,
  safeParseResponse,
  setLoading as setLoadingBase,
  showAlert,
  showFieldError as showFieldErrorBase,
} from "./sharedForm";

function showFieldError(fieldId: string, message: string) {
  showFieldErrorBase(fieldId, message);
}

function clearErrors() {
  clearErrorsBase();
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
  setLoadingBase(
    loading,
    "submitBtn",
    "submitText",
    "Sending...",
    "Send Message",
  );
}

async function submitForm(formData: FormData) {
  setLoading(true);
  clearErrors();
  try {
    const response = await postContact(Object.fromEntries(formData));
    const result = await safeParseResponse(response);
    if (!response.ok) {
      if (response.status === 400) {
        const { errMsg, detailsText } = extractValidationError(result);

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
  if (form.dataset.bound === "true") return;

  form.dataset.bound = "true";

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

    try {
      await submitForm(formData);
    } finally {
      resetTurnstile();
    }
  });

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
    .forEach((field) => {
      field.addEventListener(
        "input",
        function (this: HTMLInputElement | HTMLTextAreaElement) {
          hideFieldError(this.id);
        },
      );
    });
}

function bindPersistenceHandlers() {
  document
    .querySelectorAll<
      HTMLInputElement | HTMLTextAreaElement
    >('input[type="text"], input[type="email"], textarea')
    .forEach((field) => {
      if (field.dataset.persistBound === "true") return;
      field.dataset.persistBound = "true";
      field.addEventListener("input", saveFormData);
    });
}

function ensureTurnstileWidget() {
  const widget = document.querySelector(".cf-turnstile") as HTMLElement | null;
  if (!widget) return;
  if (widget.querySelector("iframe")) return;

  const sitekey = widget.getAttribute("data-sitekey");
  if (!sitekey || !window.turnstile?.render) return;

  widget.innerHTML = "";
  const widgetId = window.turnstile.render(widget, {
    sitekey,
    theme: widget.getAttribute("data-theme") || "auto",
    callback: (token: string) => (window as any).onTurnstileSuccess?.(token),
    "error-callback": (code: string) =>
      (window as any).onTurnstileError?.(code),
    "expired-callback": () => (window as any).onTurnstileExpired?.(),
  });

  if (widgetId) {
    widget.dataset.turnstileWidgetId = widgetId;
  }
}

function initContactForm() {
  const form = document.getElementById("contactForm") as HTMLFormElement | null;
  if (!form) return;

  loadFormData();
  bindFormHandlers();
  bindPersistenceHandlers();
  ensureTurnstileWidget();
}

initContactForm();

const globalWindow = window as typeof window & {
  __contactLifecycleBound?: boolean;
};
if (!globalWindow.__contactLifecycleBound) {
  document.addEventListener("astro:page-load", initContactForm);
  globalWindow.__contactLifecycleBound = true;
}
