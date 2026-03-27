const brukerNavn = document.getElementById("brukerNavn");
const verdiDager = document.getElementById("verdiDager");
const verdiTimekrav = document.getElementById("verdiTimekrav");
const verdiTimerTilstede = document.getElementById("verdiTimerTilstede");
const verdiOverUnder = document.getElementById("verdiOverUnder");
const DISPLAY_NAME_STORAGE_KEY = "iskoleDisplayName";
const modal = document.getElementById("attendanceModal");
const modalTitle = document.getElementById("modalTitle");
const modalTime = document.getElementById("modalTime");
const modalDate = document.getElementById("modalDate");
const absenceWrap = document.getElementById("absenceWrap");

let activeLesson = null;

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function updateHeaderDisplayName() {
  if (!brukerNavn) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const queryName = (urlParams.get("bruker") || "").trim();
  const savedName = safeStorageGet(DISPLAY_NAME_STORAGE_KEY);

  if (queryName) {
    brukerNavn.textContent = queryName;
    return;
  }

  if (savedName) {
    brukerNavn.textContent = savedName;
  }
}

function openLessonModal(lesson) {
  if (
    !lesson ||
    !modal ||
    !modalTitle ||
    !modalTime ||
    !modalDate ||
    !absenceWrap
  ) {
    return;
  }

  activeLesson = lesson;
  modalTitle.textContent = lesson.dataset.subject || "IM2A STU - 999999";
  modalTime.textContent = lesson.dataset.time || "08:15 - 09:00";
  modalDate.textContent = lesson.dataset.date || "25.03.2026";

  if (lesson.classList.contains("registrert")) {
    absenceWrap.textContent = "M";
  } else {
    absenceWrap.innerHTML =
      '<button id="registerBtn" class="liten-knapp" type="button">Registrer</button>';
  }

  modal.classList.remove("skjult");
  modal.setAttribute("aria-hidden", "false");
}

function registerLesson(lesson) {
  if (!lesson || !absenceWrap || lesson.classList.contains("registrert")) {
    return;
  }

  lesson.classList.add("registrert");
  lesson.dataset.locked = "true";
  absenceWrap.textContent = "M";
  oppdaterOppmoteTall();
}

function oppdaterOppmoteTall() {
  if (verdiDager) {
    verdiDager.textContent = String(Number(verdiDager.textContent) + 1);
  }
  if (verdiTimekrav) {
    verdiTimekrav.textContent = String(Number(verdiTimekrav.textContent) + 1);
  }
  if (verdiTimerTilstede) {
    verdiTimerTilstede.textContent = String(
      Number(verdiTimerTilstede.textContent) + 1,
    );
  }
  if (verdiOverUnder) {
    verdiOverUnder.textContent = String(Number(verdiOverUnder.textContent) + 1);
  }
}

updateHeaderDisplayName();

// Study-time click opens popup. Register button inside popup marks attendance.
document.addEventListener("click", (event) => {
  const lesson =
    event.target && event.target.closest
      ? event.target.closest(".studietid")
      : null;

  if (lesson) {
    openLessonModal(lesson);
    return;
  }

  if (event.target && event.target.id === "registerBtn") {
    registerLesson(activeLesson);
    return;
  }

  if (modal && event.target === modal) {
    modal.classList.add("skjult");
    modal.setAttribute("aria-hidden", "true");
  }
});

if (modal) {
  modal.classList.add("skjult");
  modal.setAttribute("aria-hidden", "true");
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal) {
    modal.classList.add("skjult");
    modal.setAttribute("aria-hidden", "true");
  }
});
