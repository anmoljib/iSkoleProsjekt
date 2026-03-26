import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

if (form && msg) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!supabase) {
      msg.textContent = "Supabase er ikke satt opp enda.";
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    msg.textContent = "Prøver å logge inn...";

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      msg.textContent = "Feil: " + error.message;
      return;
    }

    msg.textContent = "Innlogget!";
    window.location.href = "timeplan.html";
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
