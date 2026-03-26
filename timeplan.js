const studyLessons = document.querySelectorAll(".studietid");
const modal = document.getElementById("attendanceModal");
const modalTitle = document.getElementById("modalTitle");
const modalTime = document.getElementById("modalTime");
const modalDate = document.getElementById("modalDate");
const registerBtn = document.getElementById("registerBtn");
const absenceWrap = document.getElementById("absenceWrap");
const verdiDager = document.getElementById("verdiDager");
const verdiTimekrav = document.getElementById("verdiTimekrav");
const verdiTimerTilstede = document.getElementById("verdiTimerTilstede");
const verdiOverUnder = document.getElementById("verdiOverUnder");

let activeLesson = null;

studyLessons.forEach((lesson) => {
  lesson.addEventListener("click", () => {
    activeLesson = lesson;
    modalTitle.textContent = lesson.dataset.subject || "IM2A STU - 999999";
    modalTime.textContent = lesson.dataset.time || "08:15 - 09:00";
    modalDate.textContent = lesson.dataset.date || "25.03.2026";
    const isLocked = lesson.dataset.locked === "true";

    if (lesson.classList.contains("registrert")) {
      absenceWrap.textContent = "M";
    } else if (isLocked) {
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
