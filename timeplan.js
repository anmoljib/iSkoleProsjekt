const studyLessons = document.querySelectorAll(".studietid");
const modal = document.getElementById("attendanceModal");
const modalTitle = document.getElementById("modalTitle");
const modalTime = document.getElementById("modalTime");
const modalDate = document.getElementById("modalDate");
const brukerNavn = document.getElementById("brukerNavn");
const registerBtn = document.getElementById("registerBtn");
const absenceWrap = document.getElementById("absenceWrap");
const verdiDager = document.getElementById("verdiDager");
const verdiTimekrav = document.getElementById("verdiTimekrav");
const verdiTimerTilstede = document.getElementById("verdiTimerTilstede");
const verdiOverUnder = document.getElementById("verdiOverUnder");
const DISPLAY_NAME_STORAGE_KEY = "iskoleDisplayName";
const EMAIL_STORAGE_KEY = "iskoleEmail";
const LOGIN_PAGE = "index.html";
const KRAV_INNLOGGING = false;
const SUPABASE_URL = "https://ugvzzwqlfveqhvsdhxob.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndnp6d3FsZnZlcWh2c2RoeG9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNTQzMjAsImV4cCI6MjA4OTkzMDMyMH0.D0KtK7fLLMc9onVPfxzLbmeO-umlLr7pWBRLPZ4pUOQ";

let supabase = null;

let activeLesson = null;

function clearStoredIdentity() {
  localStorage.removeItem(EMAIL_STORAGE_KEY);
  localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY);
}

function redirectToLoginBlocked(reason = "auth") {
  const loginUrl = new URL(LOGIN_PAGE, window.location.href);
  loginUrl.searchParams.set("blocked", reason);
  window.location.replace(loginUrl);
}

function getDisplayNameFromEmail(email) {
  const normalizedEmail = String(email || "").trim();
  const atIndex = normalizedEmail.lastIndexOf("@");

  if (atIndex <= 0) {
    return "";
  }

  return normalizedEmail.slice(0, atIndex);
}

async function enforceAuthenticatedSession() {
  if (!KRAV_INNLOGGING) {
    return true;
  }

  if (!window.supabase || !window.supabase.createClient) {
    redirectToLoginBlocked("auth");
    return false;
  }

  if (!supabase) {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  const { data, error } = await supabase.auth.getSession();
  if (error || !data || !data.session || !data.session.user) {
    clearStoredIdentity();
    redirectToLoginBlocked("auth");
    return false;
  }

  const sessionEmail = (data.session.user.email || "").trim();
  const sessionDisplayName = getDisplayNameFromEmail(sessionEmail);
  localStorage.setItem(EMAIL_STORAGE_KEY, sessionEmail);
  if (sessionDisplayName) {
    localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, sessionDisplayName);
  }

  return true;
}

function updateHeaderDisplayName() {
  if (!brukerNavn) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryName = (urlParams.get("bruker") || "").trim();
  const queryEmail = (urlParams.get("email") || "").trim();

  if (queryName) {
    brukerNavn.textContent = queryName;
    localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, queryName);
    return;
  }

  const displayNameFromQueryEmail = getDisplayNameFromEmail(queryEmail);
  if (displayNameFromQueryEmail) {
    brukerNavn.textContent = displayNameFromQueryEmail;
    localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayNameFromQueryEmail);
    localStorage.setItem(EMAIL_STORAGE_KEY, queryEmail);
    return;
  }

  const savedName = localStorage.getItem(DISPLAY_NAME_STORAGE_KEY);
  if (savedName) {
    brukerNavn.textContent = savedName;
    return;
  }

  const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
  const displayNameFromSavedEmail = getDisplayNameFromEmail(savedEmail);
  if (displayNameFromSavedEmail) {
    brukerNavn.textContent = displayNameFromSavedEmail;
  }
}

enforceAuthenticatedSession()
  .then((isAllowed) => {
    if (isAllowed) {
      updateHeaderDisplayName();
    }
  })
  .catch(() => {
    if (KRAV_INNLOGGING) {
      redirectToLoginBlocked("auth");
      return;
    }

    updateHeaderDisplayName();
  });

function getCurrentDateTimeString() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return {
    date: `${day}.${month}.${year}`,
    time: `${hours}:${minutes}`,
    hours: now.getHours(),
    minutes: now.getMinutes(),
  };
}

function isThursdayDate(dateString) {
  const [day, month, year] = (dateString || "").split(".").map(Number);

  if (!day || !month || !year) {
    return false;
  }

  // Use local noon to avoid timezone/day rollover edge-cases.
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.getDay() === 4;
}

function canRegisterLesson(lessonDate, lessonTime) {
  if (isThursdayDate(lessonDate)) {
    return true;
  }

  const current = getCurrentDateTimeString();

  // Check if date matches
  if (current.date !== lessonDate) {
    return false;
  }

  // Parse lesson time (e.g., "08:15 - 09:00")
  const timeParts = lessonTime.split(" - ");
  const lessonStartTime = timeParts[0]; // "08:15"

  // Parse current time and lesson start time
  const currentTotalMinutes = current.hours * 60 + current.minutes;
  const [lessonHours, lessonMinutes] = lessonStartTime.split(":").map(Number);
  const lessonTotalMinutes = lessonHours * 60 + lessonMinutes;

  // Can register if current time is within 15 minutes before or after lesson start
  const timeDifference = Math.abs(currentTotalMinutes - lessonTotalMinutes);
  return timeDifference <= 15;
}

studyLessons.forEach((lesson) => {
  lesson.addEventListener("click", () => {
    if (!modal || !modalTitle || !modalTime || !modalDate || !absenceWrap) {
      return;
    }

    activeLesson = lesson;
    modalTitle.textContent = lesson.dataset.subject || "IM2A STU - 999999";
    modalTime.textContent = lesson.dataset.time || "08:15 - 09:00";
    modalDate.textContent = lesson.dataset.date || "25.03.2026";
    const isLocked = lesson.dataset.locked === "true";
    const thursdayLesson = isThursdayDate(lesson.dataset.date);

    if (lesson.classList.contains("registrert")) {
      absenceWrap.textContent = "M";
    } else if (thursdayLesson) {
      absenceWrap.innerHTML =
        '<button id="registerBtn" class="liten-knapp" type="button">Registrer</button>';
      const dynamicBtn = document.getElementById("registerBtn");
      dynamicBtn.addEventListener("click", registerAbsence);
    } else if (isLocked && !thursdayLesson) {
      absenceWrap.textContent = "Kan ikke registreres";
    } else if (!canRegisterLesson(lesson.dataset.date, lesson.dataset.time)) {
      absenceWrap.textContent = "Kan ikke registreres";
    } else {
      absenceWrap.innerHTML =
        '<button id="registerBtn" class="liten-knapp" type="button">Registrer</button>';
      const dynamicBtn = document.getElementById("registerBtn");
      dynamicBtn.addEventListener("click", registerAbsence);
    }

    modal.classList.remove("skjult");
    modal.setAttribute("aria-hidden", "false");
  });
});

function registerAbsence() {
  if (!activeLesson) {
    return;
  }

  if (activeLesson.classList.contains("registrert")) {
    return;
  }

  activeLesson.classList.add("registrert");
  absenceWrap.textContent = "M";
  oppdaterOppmoteTall();
}

function oppdaterOppmoteTall() {
  verdiDager.textContent = String(Number(verdiDager.textContent) + 1);
  verdiTimekrav.textContent = String(Number(verdiTimekrav.textContent) + 1);
  verdiTimerTilstede.textContent = String(
    Number(verdiTimerTilstede.textContent) + 1,
  );
  verdiOverUnder.textContent = String(Number(verdiOverUnder.textContent) + 1);
}

if (registerBtn) {
  registerBtn.addEventListener("click", registerAbsence);
}

if (modal) {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.classList.add("skjult");
      modal.setAttribute("aria-hidden", "true");
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal) {
    modal.classList.add("skjult");
    modal.setAttribute("aria-hidden", "true");
  }
});
