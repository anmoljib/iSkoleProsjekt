const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const feideBtn = document.getElementById("feideBtn");
const passkeyBtn = document.getElementById("passkeyBtn");
const resetBtn = document.getElementById("resetBtn");
const TIMEPLAN_PAGE = "timeplan.html";
const EMAIL_STORAGE_KEY = "iskoleEmail";
const DISPLAY_NAME_STORAGE_KEY = "iskoleDisplayName";
const DEFAULT_EMAIL_DOMAIN = "stud.akademiet.no";

function getDisplayNameFromEmail(email) {
  const normalizedEmail = String(email || "").trim();
  const atIndex = normalizedEmail.lastIndexOf("@");

  if (atIndex <= 0) {
    return normalizedEmail;
  }

  return normalizedEmail.slice(0, atIndex);
}

function normalizeEmail(rawEmail) {
  const normalized = String(rawEmail || "").trim();

  if (!normalized) {
    return "";
  }

  if (normalized.includes("@")) {
    return normalized;
  }

  return `${normalized}@${DEFAULT_EMAIL_DOMAIN}`;
}

function storeIdentity(email) {
  const displayName = getDisplayNameFromEmail(email);
  try {
    localStorage.setItem(EMAIL_STORAGE_KEY, email);

    if (displayName) {
      localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName);
    }
  } catch (_error) {
    // Ignore storage failures (private mode / blocked storage), login flow should continue.
  }
}

function goToTimeplan() {
  const targetUrl = new URL(TIMEPLAN_PAGE, window.location.href).href;
  window.location.href = targetUrl;
}

if (form && msg) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = normalizeEmail(emailInput && emailInput.value);
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      msg.textContent = "Skriv inn e-post og passord.";
      return;
    }

    try {
      storeIdentity(email);
    } catch (_error) {
      // Ignore storage errors and continue.
    }

    msg.textContent = "Logger inn...";
    goToTimeplan();
  });

  // Ensure button click still triggers the form submit in all browsers.
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      form.requestSubmit();
    });
  }
}

if (feideBtn) {
  feideBtn.addEventListener("click", () => {
    msg.textContent = "FEIDE-knapp er ikke koblet enda.";
  });
}

if (passkeyBtn) {
  passkeyBtn.addEventListener("click", () => {
    msg.textContent = "Passnokkel er ikke lagt til enda.";
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    msg.textContent = "Passord-reset er ikke satt opp i denne demoen.";
  });
}

if (msg) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("blocked") === "auth") {
    msg.textContent = "Du ble logget ut. Logg inn pa nytt.";
  }
}
