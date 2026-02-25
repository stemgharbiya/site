type AlertType = "success" | "error" | "warning" | "info";

export type AlertFn = (
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
      reset?: (widgetId?: string) => void;
      render?: (
        container: string | HTMLElement,
        params?: Record<string, unknown>,
      ) => string;
    };
  }
}

export const errorClasses = [
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

export const showAlert: AlertFn = (
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

type FieldUiOptions = {
  fieldErrorIdMap?: Record<string, string>;
  fieldElementIdMap?: Record<string, string>;
  setAriaInvalid?: boolean;
};

function resolveField(fieldId: string, options?: FieldUiOptions) {
  return (
    document.getElementById(fieldId) ||
    (options?.fieldElementIdMap?.[fieldId]
      ? document.getElementById(options.fieldElementIdMap[fieldId])
      : null)
  );
}

function resolveErrorElement(fieldId: string, options?: FieldUiOptions) {
  return document.getElementById(
    options?.fieldErrorIdMap?.[fieldId] || fieldId + "Error",
  );
}

export function showFieldError(
  fieldId: string,
  message: string,
  options?: FieldUiOptions,
) {
  const field = resolveField(fieldId, options);
  const errorElement = resolveErrorElement(fieldId, options);

  if (field) {
    field.classList.add(...errorClasses);
    if (options?.setAriaInvalid) {
      field.setAttribute("aria-invalid", "true");
    }
  }

  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.remove("hidden");
  }
}

export function hideFieldError(fieldId: string, options?: FieldUiOptions) {
  const field = resolveField(fieldId, options);
  const errorElement = resolveErrorElement(fieldId, options);

  if (field) {
    field.classList.remove(...errorClasses);
    if (options?.setAriaInvalid) {
      field.removeAttribute("aria-invalid");
    }
  }

  if (errorElement) {
    errorElement.classList.add("hidden");
    errorElement.textContent = "";
  }
}

export function clearErrors(
  options?: Pick<FieldUiOptions, "fieldElementIdMap" | "setAriaInvalid">,
) {
  document.querySelectorAll(".error").forEach((el) => {
    const node = el as HTMLElement;
    node.classList.add("hidden");
    node.textContent = "";
  });

  document
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input, textarea")
    .forEach((el) => {
      el.classList.remove(...errorClasses);
      if (options?.setAriaInvalid) {
        el.removeAttribute("aria-invalid");
      }
    });

  if (options?.fieldElementIdMap) {
    Object.values(options.fieldElementIdMap).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove(...errorClasses);
      if (options.setAriaInvalid) {
        el.removeAttribute("aria-invalid");
      }
    });
  }

  const container = document.getElementById("alertsContainer");
  if (container) container.innerHTML = "";
}

export function setLoading(
  loading: boolean,
  buttonId: string,
  textId: string,
  loadingText: string,
  idleText: string,
) {
  const submitBtn = document.getElementById(
    buttonId,
  ) as HTMLButtonElement | null;
  const submitText = document.getElementById(textId);
  if (!submitBtn || !submitText) return;

  const existingSpinner = document.getElementById("submitSpinner");
  if (loading) {
    submitBtn.disabled = true;
    submitText.textContent = loadingText;
    if (!existingSpinner) {
      const spinner = document.createElement("span");
      spinner.id = "submitSpinner";
      spinner.className =
        "ml-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent";
      submitText.after(spinner);
    }
  } else {
    submitBtn.disabled = false;
    submitText.textContent = idleText;
    existingSpinner?.remove();
  }
}

export async function safeParseResponse(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export function extractValidationError(result: any) {
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

  return { errMsg, detailsText };
}

export function resetTurnstile() {
  const reset = window.turnstile?.reset;
  if (!reset) return;

  const widgets = document.querySelectorAll<HTMLElement>(".cf-turnstile");
  if (widgets.length === 0) {
    reset();
    return;
  }

  widgets.forEach((widget) => {
    const widgetId = widget.dataset.turnstileWidgetId;
    reset(widgetId);
  });
}

window.showAlert = showAlert;
