export {};

import {
  validateGitHubUsername,
  validateSeniorYear,
  validateStudentSchoolEmail,
} from "../lib/utils";
import { postJoin } from "./apiClient";
import {
  clearErrors as clearErrorsBase,
  extractValidationError,
  hideFieldError as hideFieldErrorBase,
  resetTurnstile,
  safeParseResponse,
  setLoading as setLoadingBase,
  showAlert,
  showFieldError as showFieldErrorBase,
} from "./sharedForm";

const fieldErrorIdMap: Record<string, string> = {
  fullName: "nameError",
  schoolEmail: "emailError",
  githubUsername: "githubError",
};

const fieldElementIdMap: Record<string, string> = {
  interests: "interestsContainer",
};

const fieldUiOptions = {
  fieldErrorIdMap,
  fieldElementIdMap,
  setAriaInvalid: true,
};

function showFieldError(fieldId: string, message: string) {
  showFieldErrorBase(fieldId, message, fieldUiOptions);
}

function hideFieldError(fieldId: string) {
  hideFieldErrorBase(fieldId, fieldUiOptions);
}

function clearErrors() {
  clearErrorsBase(fieldUiOptions);
}

function validateEmail(email: string) {
  return validateStudentSchoolEmail(email);
}

function saveFormData() {
  const formData = {
    fullName: (document.getElementById("fullName") as HTMLInputElement | null)
      ?.value,
    schoolEmail: (
      document.getElementById("schoolEmail") as HTMLInputElement | null
    )?.value,
    githubUsername: (
      document.getElementById("githubUsername") as HTMLInputElement | null
    )?.value,
    seniorYear: (
      document.getElementById("seniorYear") as HTMLInputElement | null
    )?.value,
    interests: Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[name="interests"]:checked',
      ),
    ).map((cb) => cb.value),
    motivation: (
      document.getElementById("motivation") as HTMLTextAreaElement | null
    )?.value,
  };
  try {
    localStorage.setItem("stemgharbiya-application", JSON.stringify(formData));
  } catch {}
}

function loadFormData() {
  try {
    const savedData = localStorage.getItem("stemgharbiya-application");
    if (!savedData) return;
    const formData = JSON.parse(savedData);
    if (formData.fullName)
      (document.getElementById("fullName") as HTMLInputElement).value =
        formData.fullName;
    if (formData.schoolEmail)
      (document.getElementById("schoolEmail") as HTMLInputElement).value =
        formData.schoolEmail;
    if (formData.githubUsername)
      (document.getElementById("githubUsername") as HTMLInputElement).value =
        formData.githubUsername;
    if (formData.seniorYear)
      (document.getElementById("seniorYear") as HTMLInputElement).value =
        formData.seniorYear;
    if (formData.motivation)
      (document.getElementById("motivation") as HTMLTextAreaElement).value =
        formData.motivation;
    if (formData.interests && Array.isArray(formData.interests)) {
      document
        .querySelectorAll<HTMLInputElement>('input[name="interests"]')
        .forEach((checkbox) => {
          checkbox.checked = formData.interests.includes(checkbox.value);
        });
    }
  } catch {}
}

function clearFormData() {
  try {
    localStorage.removeItem("stemgharbiya-application");
  } catch {}
}

function setLoading(loading: boolean) {
  setLoadingBase(
    loading,
    "submitBtn",
    "submitText",
    "Submitting...",
    "Submit Application",
  );
}

async function submitForm(formData: FormData) {
  setLoading(true);
  clearErrors();
  try {
    const response = await postJoin(Object.fromEntries(formData));
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
      } else if (response.status === 403) {
        showAlert(
          "warning",
          "Application Submitted",
          "Your application was received but we encountered an issue with email notifications.",
          "Our team will review your application shortly.",
        );
        setTimeout(() => {
          (
            document.getElementById("applicationForm") as HTMLFormElement | null
          )?.reset();
        }, 2000);
        return;
      } else if (response.status === 409) {
        showAlert(
          "error",
          "Duplicate Application",
          result.error ||
            "An application with this email and GitHub username already exists",
          "",
          10000,
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
      "Application Submitted!",
      result.message || "Your application has been submitted successfully.",
      result.warning ? `Note: ${result.warning}` : "",
    );
    clearFormData();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      (
        document.getElementById("applicationForm") as HTMLFormElement | null
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
  const form = document.getElementById(
    "applicationForm",
  ) as HTMLFormElement | null;
  if (!form) return;
  if (form.dataset.bound === "true") return;

  form.dataset.bound = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const interests = Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[name="interests"]:checked',
      ),
    ).map((cb) => cb.value);
    let hasErrors = false;
    if (interests.length === 0) {
      showFieldError("interests", "Select at least one interest");
      hasErrors = true;
    }
    const email = String(formData.get("schoolEmail") || "");
    if (!validateEmail(email)) {
      showFieldError(
        "schoolEmail",
        "Use student email format: name.19YYXXX@stemgharbiya.moe.edu.eg",
      );
      hasErrors = true;
    }
    const seniorYear = String(formData.get("seniorYear") || "");
    if (!validateSeniorYear(seniorYear)) {
      showFieldError(
        "seniorYear",
        "Senior Year must be S25 through S30 only (e.g., S25, S26, S27)",
      );
      hasErrors = true;
    }
    const motivation = String(formData.get("motivation") || "");
    if (motivation.length < 10 || motivation.length > 500) {
      showFieldError("motivation", "Motivation must be 10-500 characters");
      hasErrors = true;
    }
    const requiredFields = ["fullName", "githubUsername"];
    requiredFields.forEach((field) => {
      if (!String(formData.get(field) || "").trim()) {
        showFieldError(field, "This field is required");
        hasErrors = true;
      }
    });
    const githubUsername = String(formData.get("githubUsername") || "").trim();
    if (githubUsername && !validateGitHubUsername(githubUsername)) {
      showFieldError("githubUsername", "Invalid GitHub username format");
      hasErrors = true;
    }
    if (!formData.get("agreement")) {
      showFieldError("agreement", "You must agree to the Code of Conduct");
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
    formData.set("cf-turnstile-response", turnstileToken);
    formData.set("interests", interests.join(","));
    try {
      await submitForm(formData);
    } finally {
      resetTurnstile();
    }
  });

  (
    document.getElementById("schoolEmail") as HTMLInputElement | null
  )?.addEventListener("blur", function (this: HTMLInputElement) {
    if (this.value && !validateEmail(this.value)) {
      showFieldError(
        "schoolEmail",
        "Use student email format: name.19YYXXX@stemgharbiya.moe.edu.eg",
      );
      return;
    }
    hideFieldError("schoolEmail");
  });

  (
    document.getElementById("fullName") as HTMLInputElement | null
  )?.addEventListener("blur", function (this: HTMLInputElement) {
    if (!this.value.trim()) {
      showFieldError("fullName", "This field is required");
      return;
    }
    hideFieldError("fullName");
  });

  (
    document.getElementById("githubUsername") as HTMLInputElement | null
  )?.addEventListener("blur", function (this: HTMLInputElement) {
    const value = this.value.trim();
    if (!value) {
      showFieldError("githubUsername", "This field is required");
      return;
    }
    if (!validateGitHubUsername(value)) {
      showFieldError("githubUsername", "Invalid GitHub username format");
      return;
    }
    hideFieldError("githubUsername");
  });

  (
    document.getElementById("seniorYear") as HTMLInputElement | null
  )?.addEventListener("blur", function (this: HTMLInputElement) {
    if (this.value && !validateSeniorYear(this.value)) {
      showFieldError(
        "seniorYear",
        "Senior Year must be S25 through S30 only (e.g., S25, S26, S27)",
      );
      return;
    }
    hideFieldError("seniorYear");
  });

  (
    document.getElementById("motivation") as HTMLTextAreaElement | null
  )?.addEventListener("input", function (this: HTMLTextAreaElement) {
    const text = this.value;
    if (text && (text.length < 10 || text.length > 500)) {
      showFieldError("motivation", `Characters: ${text.length}/500 (min 10)`);
      return;
    }
    hideFieldError("motivation");
  });

  (
    document.getElementById("agreement") as HTMLInputElement | null
  )?.addEventListener("change", function (this: HTMLInputElement) {
    if (!this.checked) {
      showFieldError("agreement", "You must agree to the Code of Conduct");
      return;
    }
    hideFieldError("agreement");
  });

  document
    .querySelectorAll<HTMLInputElement>('input[name="interests"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const selected = document.querySelectorAll<HTMLInputElement>(
          'input[name="interests"]:checked',
        ).length;
        if (selected === 0) {
          showFieldError("interests", "Select at least one interest");
          return;
        }
        hideFieldError("interests");
      });
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

  document
    .querySelectorAll<HTMLInputElement>('input[name="interests"]')
    .forEach((checkbox) => {
      if (checkbox.dataset.persistBound === "true") return;
      checkbox.dataset.persistBound = "true";
      checkbox.addEventListener("change", saveFormData);
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

function initJoinForm() {
  const form = document.getElementById(
    "applicationForm",
  ) as HTMLFormElement | null;
  if (!form) return;

  loadFormData();
  bindFormHandlers();
  bindPersistenceHandlers();
  ensureTurnstileWidget();
}

initJoinForm();

const globalWindow = window as typeof window & {
  __joinLifecycleBound?: boolean;
};
if (!globalWindow.__joinLifecycleBound) {
  document.addEventListener("astro:page-load", initJoinForm);
  globalWindow.__joinLifecycleBound = true;
}
