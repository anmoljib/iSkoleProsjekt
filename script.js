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
const KRAV_INNLOGGING = true;
const TILLAT_DEMO_FALLBACK = true;
const TARGET_PAGE = "timeplan.html";
const ALLOWED_EMAIL_DOMAIN = "stud.akademiet.no";
const DISPLAY_NAME_STORAGE_KEY = "iskoleDisplayName";
const EMAIL_STORAGE_KEY = "iskoleEmail";

let supabase = null;

function setMessage(text) {
  if (msg) {
    msg.textContent = text;
  }
}

function hasAllowedEmailDomain(email) {
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();
  const atIndex = normalizedEmail.lastIndexOf("@");

  if (atIndex <= 0 || atIndex === normalizedEmail.length - 1) {
    return false;
  }

  const domain = normalizedEmail.slice(atIndex + 1);
  return domain === ALLOWED_EMAIL_DOMAIN;
}

function getDisplayNameFromEmail(email) {
  const normalizedEmail = String(email || "").trim();
  const atIndex = normalizedEmail.lastIndexOf("@");

  if (atIndex <= 0) {
    return "";
  }

  return normalizedEmail.slice(0, atIndex);
}

function clearStoredIdentity() {
  localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY);
  localStorage.removeItem(EMAIL_STORAGE_KEY);
}

function redirectToTimeplan(displayName = "") {
  const targetUrl = new URL(TARGET_PAGE, window.location.href);

  if (displayName) {
    targetUrl.searchParams.set("bruker", displayName);
  }

  if (emailInput && emailInput.value.trim()) {
    targetUrl.searchParams.set("email", emailInput.value.trim());
  }

  const targetUrlString = targetUrl.toString();

  window.location.assign(targetUrlString);

  // Extra fallback in case assign is ignored by browser state.
  setTimeout(() => {
    if (!window.location.href.includes(TARGET_PAGE)) {
      window.location.replace(targetUrlString);
    }
  }, 120);
}

if (window.supabase && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (msg) {
  msg.textContent = "Kunne ikke laste Supabase bibliotek.";
}

const blockedReason = new URLSearchParams(window.location.search).get(
  "blocked",
);
if (blockedReason === "domain") {
  setMessage(
    "Du ma logge inn med en e-post som slutter pa @stud.akademiet.no.",
  );
}

if (blockedReason === "auth") {
  setMessage("Du ma logge inn for a apne timeplanen.");
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!KRAV_INNLOGGING) {
      // Local demo mode: skip Supabase, but still enforce domain rule.
      const demoEmail = emailInput ? emailInput.value.trim() : "";
      const demoDisplayName = getDisplayNameFromEmail(demoEmail);

      if (!hasAllowedEmailDomain(demoEmail)) {
        clearStoredIdentity();
        setMessage("Bruk en e-post med @stud.akademiet.no.");
        return;
      }

      if (demoDisplayName) {
        localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, demoDisplayName);
      }

      localStorage.setItem(EMAIL_STORAGE_KEY, demoEmail);
      setMessage("Logger inn...");
      setTimeout(() => redirectToTimeplan(demoDisplayName), 100);
      return;
    }

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";
    const displayName = getDisplayNameFromEmail(email);

    if (!email || !password) {
      setMessage("Skriv inn e-post og passord.");
      return;
    }

    if (!hasAllowedEmailDomain(email)) {
      clearStoredIdentity();
      setMessage("Bruk en e-post med @stud.akademiet.no.");
      return;
    }

    if (!supabase) {
      if (!TILLAT_DEMO_FALLBACK) {
        setMessage("Supabase er ikke klar. Last siden pa nytt.");
        return;
      }

      if (displayName) {
        localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName);
      }

      localStorage.setItem(EMAIL_STORAGE_KEY, email);
      setMessage("Supabase utilgjengelig. Fortsetter i demo-modus...");
      setTimeout(() => redirectToTimeplan(displayName), 150);
      return;
    }

    if (displayName) {
      localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName);
    }

    if (email) {
      localStorage.setItem(EMAIL_STORAGE_KEY, email);
    }

    setMessage("Prøver å logge inn...");

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
        if (!TILLAT_DEMO_FALLBACK) {
          setMessage("Feil ved innlogging: " + error.message);
          return;
        }

        setMessage("Innlogging feilet. Fortsetter i demo-modus...");
        setTimeout(() => redirectToTimeplan(displayName), 150);
        return;
      }

      setMessage("Innlogget!");
      redirectToTimeplan(displayName);
    } catch (err) {
      const errorMessage = err && err.message ? err.message : "Ukjent feil";
      setMessage("Feil ved innlogging: " + errorMessage);
    }
  });
}

if (feideBtn) {
  feideBtn.addEventListener("click", () => {
    setMessage("FEIDE-knapp er ikke koblet enda.");
  });
}

if (passkeyBtn) {
  passkeyBtn.addEventListener("click", () => {
    setMessage("Passnokkel er ikke lagt til enda.");
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    if (!supabase) {
      setMessage("Sett opp Supabase for reset av passord.");
      return;
    }

    const email = emailInput ? emailInput.value.trim() : "";
    if (!email) {
      setMessage("Skriv inn e-post først.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setMessage("Feil: " + error.message);
      return;
    }

    setMessage("Reset-link sendt hvis e-post finnes.");
  });
}
