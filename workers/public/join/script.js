const INTERESTS = [
  "Web Development",
  "Mobile Development",
  "Machine Learning",
  "Data Science",
  "Cybersecurity",
  "Game Development",
  "Open Source",
  "DevOps",
];

function renderInterests() {
  const container = document.getElementById("interestsContainer");
  INTERESTS.forEach((interest) => {
    const div = document.createElement("div");
    div.className = "checkbox-item";
    div.innerHTML = `
            <input type="checkbox" name="interests" value="${interest}" id="interest-${interest}">
            <label for="interest-${interest}">${interest}</label>
        `;
    container.appendChild(div);
  });
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const newTheme = isDark ? "light" : "dark";
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", newTheme);
  document.getElementById("themeIcon").textContent =
    newTheme === "dark" ? "🌙" : "☀️";
}

function showAlert(type, title, message, details = "", duration = 5000) {
  const container = document.getElementById("alertsContainer");
  container.innerHTML = "";
  const alert = document.createElement("div");
  alert.className = `alert ${type}`;
  const icon =
    type === "success"
      ? "✓"
      : type === "error"
        ? "✗"
        : type === "warning"
          ? "!"
          : "i";
  alert.innerHTML = `
        <div class="alert-title">
            <span>${icon}</span>
            <span>${title}</span>
        </div>
        <div class="alert-message">${message}</div>
        ${details ? `<div class="alert-details">${details}</div>` : ""}
    `;
  container.appendChild(alert);
  alert.style.display = "block";
  if (duration > 0) {
    setTimeout(() => {
      if (alert.parentNode === container) {
        alert.style.opacity = "0";
        alert.style.transform = "translateY(-10px)";
        setTimeout(() => {
          if (alert.parentNode === container) {
            container.removeChild(alert);
          }
        }, 300);
      }
    }, duration);
  }
  return alert;
}

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const errorElement = document.getElementById(fieldId + "Error");
  if (field) field.classList.add("field-error");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => {
    el.style.display = "none";
    el.textContent = "";
  });
  document
    .querySelectorAll(".field-error")
    .forEach((el) => el.classList.remove("field-error"));
  document.getElementById("alertsContainer").innerHTML = "";
}

function validateEmail(email) {
  return email.endsWith("@stemgharbiya.moe.edu.eg");
}

function validateSeniorYear(year) {
  if (!year) return false;
  const match = year.match(/^[Ss](\d+)$/);
  if (!match) return false;
  const yearNum = parseInt(match[1], 10);
  return yearNum >= 25 && yearNum <= 30;
}

function saveFormData() {
  const formData = {
    fullName: document.getElementById("fullName").value,
    schoolEmail: document.getElementById("schoolEmail").value,
    githubUsername: document.getElementById("githubUsername").value,
    seniorYear: document.getElementById("seniorYear").value,
    interests: Array.from(
      document.querySelectorAll('input[name="interests"]:checked'),
    ).map((cb) => cb.value),
    motivation: document.getElementById("motivation").value,
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
      document.getElementById("fullName").value = formData.fullName;
    if (formData.schoolEmail)
      document.getElementById("schoolEmail").value = formData.schoolEmail;
    if (formData.githubUsername)
      document.getElementById("githubUsername").value = formData.githubUsername;
    if (formData.seniorYear)
      document.getElementById("seniorYear").value = formData.seniorYear;
    if (formData.motivation)
      document.getElementById("motivation").value = formData.motivation;
    if (formData.interests && Array.isArray(formData.interests)) {
      document
        .querySelectorAll('input[name="interests"]')
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

function setLoading(loading) {
  const submitBtn = document.getElementById("submitBtn");
  const submitText = document.getElementById("submitText");
  if (loading) {
    submitBtn.disabled = true;
    submitBtn.classList.add("loading");
    submitText.textContent = "Submitting...";
  } else {
    submitBtn.disabled = false;
    submitBtn.classList.remove("loading");
    submitText.textContent = "Submit Application";
  }
}

async function submitForm(formData) {
  setLoading(true);
  clearErrors();
  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 400) {
        showAlert(
          "error",
          "Validation Error",
          result.error || "Please check your form inputs",
          result.details || "",
        );
      } else if (response.status === 403) {
        showAlert(
          "warning",
          "Application Submitted",
          "Your application was received but we encountered an issue with email notifications.",
          "Our team will review your application shortly.",
        );
        setTimeout(() => {
          document.getElementById("applicationForm").reset();
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
      document.getElementById("applicationForm").reset();
    }, 1000);
  } catch (error) {
    if (
      error.name === "TypeError" &&
      error.message.includes("Failed to fetch")
    ) {
      showAlert(
        "error",
        "Network Error",
        "Unable to connect to the server. Please check your internet connection and try again.",
        "",
        10000,
      );
    } else {
      showAlert(
        "error",
        "Submission Failed",
        error.message || "An unexpected error occurred. Please try again.",
        "",
        10000,
      );
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  } finally {
    setLoading(false);
  }
}

document
  .getElementById("applicationForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    const formData = new FormData(e.target);
    const interests = Array.from(
      document.querySelectorAll('input[name="interests"]:checked'),
    ).map((cb) => cb.value);
    let hasErrors = false;
    if (interests.length === 0) {
      showFieldError("interests", "Select at least one interest");
      hasErrors = true;
    }
    const email = formData.get("schoolEmail");
    if (!validateEmail(email)) {
      showFieldError(
        "schoolEmail",
        "Must be a STEM Gharbiya school email (@stemgharbiya.moe.edu.eg)",
      );
      hasErrors = true;
    }
    const seniorYear = formData.get("seniorYear");
    if (!validateSeniorYear(seniorYear)) {
      showFieldError(
        "seniorYear",
        "Senior Year must be S25 through S30 only (e.g., S25, S26, S27)",
      );
      hasErrors = true;
    }
    const motivation = formData.get("motivation");
    if (motivation.length < 10 || motivation.length > 500) {
      showFieldError("motivation", "Motivation must be 10-500 characters");
      hasErrors = true;
    }
    const requiredFields = ["fullName", "githubUsername"];
    requiredFields.forEach((field) => {
      if (!formData.get(field)?.trim()) {
        showFieldError(field, "This field is required");
        hasErrors = true;
      }
    });
    if (!formData.get("agreement")) {
      showFieldError("agreement", "You must agree to the Code of Conduct");
      hasErrors = true;
    }
    const turnstileToken = window.turnstile?.getResponse();
    if (!turnstileToken || typeof turnstileToken !== 'string' || turnstileToken.trim().length === 0) {
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
    await submitForm(formData);
    if (window.turnstile?.reset) window.turnstile.reset();
  });

document.getElementById("schoolEmail").addEventListener("blur", function () {
  if (this.value && !validateEmail(this.value))
    showFieldError(
      "schoolEmail",
      "Must be a STEM Gharbiya school email (@stemgharbiya.moe.edu.eg)",
    );
});

document.getElementById("seniorYear").addEventListener("blur", function () {
  if (this.value && !validateSeniorYear(this.value))
    showFieldError(
      "seniorYear",
      "Senior Year must be S25 through S30 only (e.g., S25, S26, S27)",
    );
});

document.getElementById("motivation").addEventListener("input", function () {
  const text = this.value;
  if (text && (text.length < 10 || text.length > 500))
    showFieldError("motivation", `Characters: ${text.length}/500 (min 10)`);
});

document.querySelectorAll("input, textarea").forEach((field) => {
  field.addEventListener("input", function () {
    this.classList.remove("field-error");
    const errorElement = document.getElementById(this.id + "Error");
    if (errorElement) errorElement.style.display = "none";
  });
});

document.getElementById("themeToggle").addEventListener("click", toggleTheme);
document.getElementById("themeIcon").textContent =
  document.documentElement.classList.contains("dark") ? "🌙" : "☀️";
renderInterests();
loadFormData();
document
  .querySelectorAll('input[type="text"], input[type="email"], textarea')
  .forEach((field) => field.addEventListener("input", saveFormData));
document
  .querySelectorAll('input[name="interests"]')
  .forEach((checkbox) => checkbox.addEventListener("change", saveFormData));
