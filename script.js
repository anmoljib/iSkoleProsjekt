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
const TARGET_PAGE = "timeplan.html";
const DISPLAY_NAME_STORAGE_KEY = "iskoleDisplayName";
const EMAIL_STORAGE_KEY = "iskoleEmail";

let supabase = null;

function setMessage(text) {
  if (msg) {
    msg.textContent = text;
  }
}

function normalizeLoginEmail(rawValue) {
  const value = String(rawValue || "")
    .trim()
    .toLowerCase();

  return value;
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

function redirectToTimeplan(displayName = "", email = "") {
  const targetUrl = new URL(TARGET_PAGE, window.location.href);
  const normalizedEmail = normalizeLoginEmail(
    email || (emailInput ? emailInput.value : ""),
  );

  if (displayName) {
    targetUrl.searchParams.set("bruker", displayName);
  }

  if (normalizedEmail) {
    targetUrl.searchParams.set("email", normalizedEmail);
  }

  const relativeTarget = `${TARGET_PAGE}${targetUrl.search}`;

  window.location.href = relativeTarget;

  // Extra fallback in case browser keeps current page in history navigation state.
  setTimeout(() => {
    if (!window.location.pathname.endsWith(`/${TARGET_PAGE}`)) {
      window.location.assign(relativeTarget);
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
if (blockedReason === "auth") {
  setMessage("Du ma logge inn for a apne timeplanen.");
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = normalizeLoginEmail(emailInput ? emailInput.value : "");
    const password = passwordInput ? passwordInput.value : "";
    const displayName = getDisplayNameFromEmail(email);

    if (!email || !password) {
      setMessage("Skriv inn e-post og passord.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase er ikke klar. Last siden pa nytt.");
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        clearStoredIdentity();
        setMessage("Feil ved innlogging: " + error.message);
        return;
      }

      if (!data || !data.session || !data.user) {
        setMessage("Innlogging fullforte ikke. Prov igjen.");
        return;
      }

      setMessage("Innlogget!");
      redirectToTimeplan(displayName, email);
    } catch (err) {
      const errorMessage = err && err.message ? err.message : "Ukjent feil";
      setMessage("Feil ved innlogging: " + errorMessage);
    }
  });

  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.addEventListener("click", (event) => {
      event.preventDefault();
      if (typeof form.requestSubmit === "function") {
        form.requestSubmit();
        return;
      }

      form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
  }
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
