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
const TARGET_PAGE = "timeplan.html";

let supabase = null;

function setMessage(text) {
  if (msg) {
    msg.textContent = text;
  }
}

function redirectToTimeplan() {
  const targetUrl = new URL(TARGET_PAGE, window.location.href).href;
  window.location.assign(targetUrl);

  // Extra fallback in case assign is ignored by browser state.
  setTimeout(() => {
    if (!window.location.href.includes(TARGET_PAGE)) {
      window.location.replace(targetUrl);
    }
  }, 120);
}

if (window.supabase && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (msg) {
  msg.textContent = "Kunne ikke laste Supabase bibliotek.";
}

if (form) {
  form.addEventListener("submit", async (event) => {
    if (!KRAV_INNLOGGING) {
      // Let HTML form fallback work even if JavaScript redirect fails.
      setMessage("Logger inn...");
      setTimeout(redirectToTimeplan, 100);
      return;
    }

    event.preventDefault();

    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      setMessage("Skriv inn e-post og passord.");
      return;
    }

    if (!supabase) {
      setMessage("Supabase er ikke klar. Last siden pa nytt.");
      return;
    }

    if (!email.includes("@")) {
      setMessage("Skriv inn en gyldig e-postadresse.");
      return;
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
        setMessage("Feil ved innlogging: " + error.message);
        return;
      }

      setMessage("Innlogget!");
      redirectToTimeplan();
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
