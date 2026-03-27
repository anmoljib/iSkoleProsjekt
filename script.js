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

let supabase = null;

if (window.supabase && window.supabase.createClient) {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else if (msg) {
  msg.textContent = "Kunne ikke laste Supabase bibliotek.";
}

if (form && msg) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const redirectToTimeplan = () => {
      window.location.href = "timeplan.html";
    };

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      msg.textContent = "Skriv inn e-post og passord.";
      return;
    }

    if (!KRAV_INNLOGGING) {
      msg.textContent = "Logger inn...";
      setTimeout(redirectToTimeplan, 250);
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

    const email = emailInput.value.trim();
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
