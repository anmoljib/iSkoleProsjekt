// Fyll inn disse fra Supabase -> Settings -> API
const SUPABASE_URL = "https://ugvzzwqlfveqhvsdhxob.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndnp6d3FsZnZlcWh2c2RoeG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTQzMjAsImV4cCI6MjA4OTkzMDMyMH0.D0KtK7fLLMc9onVPfxzLbmeO-umlLr7pWBRLPZ4pUOQ";

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const feideBtn = document.getElementById("feideBtn");
const passkeyBtn = document.getElementById("passkeyBtn");
const resetBtn = document.getElementById("resetBtn");
const KRAV_INNLOGGING = false;
const TIMEPLAN_PAGE = "timeplan.html";
const EMAIL_STORAGE_KEY = "iskoleEmail";
const DISPLAY_NAME_STORAGE_KEY = "iskoleDisplayName";
const DEFAULT_EMAIL_DOMAIN = "stud.akademiet.no";
const SUBMIT_FALLBACK_DELAY_MS = 500;

let supabase = null;
let submitHandled = false;

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

function redirectToTimeplan() {
  const targetUrl = new URL(TIMEPLAN_PAGE, window.location.href).href;

  try {
    window.location.assign(targetUrl);
  } catch (error) {
    window.location.href = targetUrl;
  }
}

if (window.supabase && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (msg) {
  msg.textContent = "Kunne ikke laste Supabase bibliotek.";
}

if (form && msg) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitHandled = true;

    const email = normalizeEmail(emailInput && emailInput.value);
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      msg.textContent = "Skriv inn e-post og passord.";
      return;
    }

    if (!KRAV_INNLOGGING) {
      try {
        storeIdentity(email);
      } catch (_error) {
        // Continue even if persisting identity fails.
      }

      msg.textContent = "Logger inn...";
      redirectToTimeplan();
      setTimeout(redirectToTimeplan, 300);
      return;
    }

    if (!supabase) {
      msg.textContent = "Supabase er ikke klar. Last siden pa nytt.";
      return;
    }

    if (!email.includes("@")) {
      msg.textContent = "Skriv inn en gyldig e-postadresse.";
      return;
    }

    msg.textContent = "Prøver å logge inn...";

    try {
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve({ error: { message: "Timeout" } }), 7000);
      });

      const result = await Promise.race([loginPromise, timeoutPromise]);
      const error = result && result.error ? result.error : null;

      if (error) {
        msg.textContent = "Feil ved innlogging: " + error.message;
        if (!KRAV_INNLOGGING) {
          setTimeout(redirectToTimeplan, 300);
        }
        return;
      }

      storeIdentity(email);
      msg.textContent = "Innlogget!";
      redirectToTimeplan();
    } catch (err) {
      const errorMessage = err && err.message ? err.message : "Ukjent feil";
      msg.textContent = "Feil ved innlogging: " + errorMessage;
      if (!KRAV_INNLOGGING) {
        setTimeout(redirectToTimeplan, 300);
      }
    }
  });

  // Fallback to make sure submit handler fires in browsers with odd form behavior.
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("click", () => {
      submitHandled = false;
      form.requestSubmit();

      if (!KRAV_INNLOGGING) {
        setTimeout(() => {
          if (!submitHandled) {
            redirectToTimeplan();
          }
        }, SUBMIT_FALLBACK_DELAY_MS);
      }
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
  resetBtn.addEventListener("click", async () => {
    if (!supabase) {
      msg.textContent = "Sett opp Supabase for reset av passord.";
      return;
    }

    const email = normalizeEmail(emailInput && emailInput.value);
    if (!email) {
      msg.textContent = "Skriv inn e-post først.";
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      msg.textContent = "Feil: " + error.message;
      return;
    }

    msg.textContent = "Reset-link sendt hvis e-post finnes.";
  });
}

if (msg) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("blocked") === "auth") {
    msg.textContent = "Du ble logget ut. Logg inn pa nytt.";
  }
}
