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

let activeLesson = null;

function updateHeaderDisplayName() {
  if (!brukerNavn) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryName = (urlParams.get("bruker") || "").trim();

  if (queryName) {
    brukerNavn.textContent = queryName;
    localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, queryName);
    return;
  }

  const savedName = localStorage.getItem(DISPLAY_NAME_STORAGE_KEY);
  if (savedName) {
    brukerNavn.textContent = savedName;
  }
}

updateHeaderDisplayName();

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

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.classList.add("skjult");
    modal.setAttribute("aria-hidden", "true");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modal.classList.add("skjult");
    modal.setAttribute("aria-hidden", "true");
  }
});
