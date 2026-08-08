let personalConfig = document.getElementById('personalConfig');
let personalTextarea = document.getElementById('personalTextarea');
let personalWord = document.getElementById('personalWord');
let personalStory = document.getElementById('personalStory');
let personalFrases = document.getElementById('personalFrases');

let personalMinutes = 0;
let personalSeconds = 0;

function updatePersonalTimerDisplay() {
  timerValue.textContent = pad2(personalMinutes) + ':' + pad2(personalSeconds);
}

function changeTimerMinutes(delta) {
  personalMinutes = Math.max(0, personalMinutes + delta);
  updatePersonalTimerDisplay();
  updatePersonalStartButton();
}

function changeTimerSeconds(delta) {
  let total = personalMinutes * 60 + personalSeconds + delta;
  if (total < 0) total = 0;
  personalMinutes = Math.floor(total / 60);
  personalSeconds = total % 60;
  updatePersonalTimerDisplay();
  updatePersonalStartButton();
}

document.getElementById('timerMinUp').addEventListener('click', () => changeTimerMinutes(1));
document.getElementById('timerMinDown').addEventListener('click', () => changeTimerMinutes(-1));
document.getElementById('timerSecUp').addEventListener('click', () => changeTimerSeconds(1));
document.getElementById('timerSecDown').addEventListener('click', () => changeTimerSeconds(-1));

function setPersonalMode(mode) {
  personalMode = mode;
  personalWord.classList.toggle('active', mode === 'word');
  personalStory.classList.toggle('active', mode === 'story');
  personalFrases.classList.toggle('active', mode === 'frases');
  localStorage.setItem('sparrowPersonalMode', mode);
  if (currentSet === 'personal') selectSet('personal');
}

personalWord.addEventListener('click', () => setPersonalMode('word'));
personalStory.addEventListener('click', () => setPersonalMode('story'));
personalFrases.addEventListener('click', () => setPersonalMode('frases'));

function updatePersonalStartButton() {
  const clearBtn = document.getElementById('clearBtn');
  if (currentSet !== 'personal') {
    pauseBtn.classList.remove('hidden');
    if (clearBtn) clearBtn.classList.remove('full-width');
    return;
  }
  const hasText = personalTextarea.value.trim().length > 0;
  if (hasText) {
    pauseBtn.classList.remove('hidden');
    if (clearBtn) clearBtn.classList.remove('full-width');
  } else {
    pauseBtn.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('full-width');
  }
}

personalTextarea.addEventListener('input', updatePersonalStartButton);

function parsePersonal() {
  const raw = personalTextarea.value.trim();
  if (!raw) return [];
  const parts = raw.split(/[,\n]+/);
  return parts
    .map(p => p.trim())
    .flatMap(p => p.split(/\s+/))
    .filter(w => w.length > 0);
}

function parsePersonalFrases() {
  const raw = personalTextarea.value.trim();
  if (!raw) return [];
  return raw
    .split(/[.\n]+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => p + '.');
}

function updateLessonForPersonal(count) {
  lessonTitle.textContent = 'Personal';
  const noun = personalMode === 'frases' ? 'frases' : 'palabras';
  lessonSubtitle.textContent = count + ' ' + noun;
}
