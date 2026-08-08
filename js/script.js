let currentSet = null;
let currentIndex = 0;
let isPaused = false;
let isRunning = false;
let isShuffle = true;
let isRecall = true;
let isCardHidden = false;
let personalMode = 'story';
let hiddenCardData = null;
let shuffleOrder = [];
let timer = null;
let container = document.getElementById('cardContainer');
let emptyState = document.getElementById('emptyState');
let modeAleatorio = document.getElementById('modeAleatorio');
let modeTraining = document.getElementById('modeTraining');
let modeRecall = document.getElementById('modeRecall');
let recallCompare = document.getElementById('recallCompare');
let recallInput = document.getElementById('recallInput');
let compareBtn = document.getElementById('compareBtn');
let cleanBtn = document.getElementById('cleanBtn');
let pauseBtn = document.getElementById('pauseBtn');
let pauseLabel = pauseBtn.querySelector('.btn-label');
let pauseIcon = pauseBtn.querySelector('.btn-icon');
let lessonTitle = document.getElementById('lessonTitle');
let lessonSubtitle = document.getElementById('lessonSubtitle');
let modeOrden = document.getElementById('modeOrden');
let bottomControls = document.querySelector('.bottom-controls');
let contentArea = document.querySelector('.content');
let fontDown = document.getElementById('fontDown');
let fontUp = document.getElementById('fontUp');
let fontReset = document.getElementById('fontReset');
let fontDownVal = document.getElementById('fontDownVal');
let fontUpVal = document.getElementById('fontUpVal');
let fontResetVal = document.getElementById('fontResetVal');

const FONT_MIN = 8;
const FONT_MAX = 160;
const FONT_DEFAULT = 32;
let fontSize = FONT_DEFAULT;

function applyFontScale() {
  document.documentElement.style.setProperty('--card-font-size', fontSize + 'px');
  fontDownVal.textContent = Math.max(FONT_MIN, fontSize - 1);
  fontUpVal.textContent = Math.min(FONT_MAX, fontSize + 1);
  fontResetVal.textContent = fontSize;
}

fontDown.addEventListener('click', () => {
  if (fontSize > FONT_MIN) { fontSize--; applyFontScale(); }
});

fontUp.addEventListener('click', () => {
  if (fontSize < FONT_MAX) { fontSize++; applyFontScale(); }
});

fontReset.addEventListener('click', () => {
  fontSize = FONT_DEFAULT;
  applyFontScale();
});

applyFontScale();

let instructionsTable = document.getElementById('instructionsTable');
let clockDisplay = document.getElementById('clockDisplay');
let timerDisplay = document.getElementById('timerDisplay');

let speedInput = document.getElementById('speedInput');
let speedFill = document.getElementById('speedFill');

let speedTimer = document.getElementById('speedTimer');
let timerValue = document.getElementById('timerValue');
let speedInputRow = document.querySelector('.bottom-controls .speed-input-row');
let speedBar = document.querySelector('.bottom-controls .speed-bar');
let speedLimits = document.querySelector('.bottom-controls .speed-limits');
let speedArrows = document.querySelector('.bottom-controls .speed-arrows');
let speedUnit = document.querySelector('.bottom-controls .speed-unit');

let timerElapsed = 0;
let timerInterval = null;

function pad2(n) { return String(n).padStart(2, '0'); }

function updateClock() {
  const now = new Date();
  clockDisplay.textContent = pad2(now.getHours()) + ':' + pad2(now.getMinutes()) + ':' + pad2(now.getSeconds());
}
updateClock();
setInterval(updateClock, 1000);

function resetTimer() {
  timerElapsed = 0;
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  timerDisplay.textContent = '00:00:00:00';
}

function updateTimerDisplay() {
  const cs = Math.floor((timerElapsed % 1000) / 10);
  const totalSec = Math.floor(timerElapsed / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  timerDisplay.textContent = pad2(h) + ':' + pad2(m) + ':' + pad2(s) + ':' + pad2(cs);
}

const MIN_DELAY = 100;
const MAX_DELAY = 359000;

function parseSpeed(raw) {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!s) return null;
  const msMatch = s.match(/^([\d.]+)ms$/);
  if (msMatch) return parseFloat(msMatch[1]);
  const mMinMatch = s.match(/^(\d+)m(\d+)s?$/);
  if (mMinMatch) return parseInt(mMinMatch[1]) * 60000 + parseInt(mMinMatch[2]) * 1000;
  const mSecMatch = s.match(/^(\d+)m([\d.]+)s$/);
  if (mSecMatch) return parseInt(mSecMatch[1]) * 60000 + parseFloat(mSecMatch[2]) * 1000;
  const mOnlyMatch = s.match(/^([\d.]+)m$/);
  if (mOnlyMatch) return parseFloat(mOnlyMatch[1]) * 60000;
  const sOnlyMatch = s.match(/^([\d.]+)s?$/);
  if (sOnlyMatch) return parseFloat(sOnlyMatch[1]) * 1000;
  return null;
}

function msToInput(ms) {
  if (ms < 1000) return (ms / 1000).toFixed(2);
  if (ms < 60000) return (ms / 1000).toFixed(1);
  const m = Math.floor(ms / 60000);
  const s = Math.round((ms % 60000) / 1000);
  return s > 0 ? m + 'm' + s : m + 'm';
}

function getDelay() {
  if (currentSet === 'personal') {
    return Math.max(MIN_DELAY, (personalMinutes * 60 + personalSeconds) * 1000);
  }
  const ms = parseSpeed(speedInput.value);
  if (ms === null || ms < MIN_DELAY) return MIN_DELAY;
  return Math.min(ms, MAX_DELAY);
}

function updateSpeedFill() {
  const ms = getDelay();
  const logMin = Math.log(MIN_DELAY);
  const logMax = Math.log(MAX_DELAY);
  const pct = (Math.log(ms) - logMin) / (logMax - logMin) * 100;
  speedFill.style.width = Math.max(5, Math.min(100, pct)) + '%';
}

speedInput.addEventListener('input', () => {
  updateSpeedFill();
});

speedInput.addEventListener('blur', () => {
  if (speedInput.value.trim() === '') {
    speedInput.value = '0.10';
    updateSpeedFill();
  }
});

speedInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { speedInput.blur(); return; }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    adjustSpeed(e.key === 'ArrowUp');
  }
});

function adjustSpeed(up) {
  let ms = parseSpeed(speedInput.value);
  if (ms === null) ms = 500;
  const step = ms >= 60000 ? 5000 : 100;
  if (up) ms = Math.min(MAX_DELAY, ms + step);
  else ms = Math.max(MIN_DELAY, ms - step);
  speedInput.value = msToInput(ms);
  updateSpeedFill();
}

document.getElementById('speedUp').addEventListener('click', () => adjustSpeed(true));
document.getElementById('speedDown').addEventListener('click', () => adjustSpeed(false));

function buildShuffleOrder(count) {
  const arr = [];
  for (let i = 0; i < count; i++) arr.push(i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function setMode(shuffle) {
  if (isShuffle === shuffle && currentSet) return;
  isShuffle = shuffle;
  modeOrden.classList.toggle('active', !shuffle);
  modeAleatorio.classList.toggle('active', shuffle);
  localStorage.setItem('sparrowShuffle', shuffle);
  if (currentSet) {
    const count = dataSets[currentSet].length;
    if (isRunning) {
      shuffleOrder = isShuffle ? buildShuffleOrder(count) : [];
      currentIndex = 0;
      showCard(currentIndex);
    } else {
      shuffleOrder = [];
      currentIndex = 0;
      showCard(0);
    }
  }
}

modeOrden.addEventListener('click', () => setMode(false));
modeAleatorio.addEventListener('click', () => setMode(true));

function setRecallMode(recall) {
  isRecall = recall;
  modeTraining.classList.toggle('active', !recall);
  modeRecall.classList.toggle('active', recall);
  localStorage.setItem('sparrowRecall', recall);
  if (currentSet) {
    if (recallCompare) recallCompare.style.display = 'none';
    cleanCardFeedback();
    selectSet(currentSet);
  }
}

modeTraining.addEventListener('click', () => setRecallMode(false));
modeRecall.addEventListener('click', () => setRecallMode(true));

function handleCompareClick() {
  if (!isCardHidden && hiddenCardData === null && (isPaused || !isPaused)) {
    advanceToNextCard();
    return;
  }
  if (hiddenCardData !== null && recallInput.value.trim() !== '') {
    compareAndReveal();
  } else {
    advanceToNextCard();
  }
}

compareBtn.addEventListener('click', handleCompareClick);

cleanBtn.addEventListener('click', () => advanceToNextCard());
cleanBtn.addEventListener('pointerdown', (e) => { e.preventDefault(); advanceToNextCard(); });

function resetGameState() {
  isRunning = false;
  isPaused = true;
  if (timer) { clearTimeout(timer); timer = null; }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  resetTimer();
  cleanCardFeedback();
  container.innerHTML = '';
  emptyState.style.display = 'none';
  container.appendChild(emptyState);
  isCardHidden = false;
  hiddenCardData = null;
  if (compareBtn) compareBtn.textContent = 'COMPARAR';
  if (recallCompare) recallCompare.style.display = 'none';
  personalTextarea.value = '';
  if (currentSet === 'personal') {
    personalConfig.style.display = 'block';
    updatePersonalStartButton();
  }
  updatePauseButton();
}

document.getElementById('clearBtn').addEventListener('click', () => {
  if (currentSet === 'suplemento' && window.SuplementoModule && typeof window.SuplementoModule.reset === 'function') {
    window.SuplementoModule.reset();
    isRunning = false;
    isPaused = false;
    resetTimer();
    return;
  }
  if (currentSet === 'animales' && window.AnimalesModule && typeof window.AnimalesModule.reset === 'function') {
    window.AnimalesModule.reset();
    isRunning = false;
    isPaused = false;
    resetTimer();
    return;
  }
  resetGameState();
});

recallInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    handleCompareClick();
  }
});

function hideCardShowQuestion() {
  const cardEl = container.querySelector('.card');
  if (!cardEl) return;
  const topEl = cardEl.querySelector('.card-top');
  const bottomEl = cardEl.querySelector('.card-bottom');
  hiddenCardData = {
    top: topEl ? topEl.textContent : '',
    bottom: bottomEl ? bottomEl.textContent : ''
  };
  if (topEl) topEl.textContent = '?';
  if (bottomEl) bottomEl.textContent = '';
  isCardHidden = true;
  recallInput.value = '';
  if (compareBtn) compareBtn.textContent = 'COMPARAR';
  if (recallCompare) recallCompare.style.display = 'flex';
  recallInput.focus();
}

function compareAndReveal() {
  recallInput.blur();
  if (document.activeElement === recallInput) {
    const dummy = document.createElement('div');
    dummy.tabIndex = -1;
    document.body.appendChild(dummy);
    dummy.focus();
    dummy.blur();
    document.body.removeChild(dummy);
  }
  const cardEl = container.querySelector('.card');
  if (!cardEl || hiddenCardData === null) return;

  const rawUser = recallInput.value.trim();
  const rawCorrect = currentSet === 'deck'
    ? currentDeckCards.map(c => deckCardToCode(c.top)).join(' ')
    : (hiddenCardData.bottom || hiddenCardData.top).trim();
  function normalizeNoAccent(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/^[\.\s]+|[\.\s]+$/g, '');
  }
  let userAnswer, correctAnswer;
  if (currentSet === 'personal' && personalMode === 'story') {
    userAnswer = normalizeNoAccent(rawUser.replace(/\s+/g, ' ').toLowerCase());
    correctAnswer = normalizeNoAccent(rawCorrect.replace(/\s+/g, ' ').toLowerCase());
  } else {
    userAnswer = normalizeNoAccent(rawUser.replace(/\s/g, '').toLowerCase());
    correctAnswer = normalizeNoAccent(rawCorrect.replace(/\s/g, '').toLowerCase());
  }
  const isCorrect = userAnswer === correctAnswer;

  const topEl = cardEl.querySelector('.card-top');
  const bottomEl = cardEl.querySelector('.card-bottom');
  let existingDivider = cardEl.querySelector('.card-divider');
  let existingWrong = cardEl.querySelector('.card-wrong');

  const deckCodes = currentSet === 'deck'
    ? currentDeckCards.map(c => deckCardToCode(c.top)).join('  ')
    : '';

  if (isCorrect) {
    cardEl.classList.add('correct');
    if (topEl) topEl.textContent = hiddenCardData.top;
    if (bottomEl) bottomEl.textContent = currentSet === 'deck' ? deckCodes : hiddenCardData.bottom;
  } else {
    cardEl.classList.add('incorrect');
    if (topEl) topEl.textContent = hiddenCardData.top;
    if (bottomEl) bottomEl.textContent = currentSet === 'deck' ? deckCodes : hiddenCardData.bottom;

    if (!existingDivider) {
      existingDivider = document.createElement('div');
      existingDivider.className = 'card-divider';
      bottomEl.parentNode.insertBefore(existingDivider, bottomEl.nextSibling);
    }
    if (!existingWrong) {
      existingWrong = document.createElement('div');
      existingWrong.className = 'card-wrong';
      existingDivider.parentNode.insertBefore(existingWrong, existingDivider.nextSibling);
    }
    existingWrong.textContent = userAnswer;
  }

  isPaused = true;
  if (timer) { clearTimeout(timer); timer = null; }
  updatePauseButton();
  hiddenCardData = null;
  isCardHidden = false;
  recallInput.value = '';
  if (compareBtn)   compareBtn.textContent = 'SIGUIENTE';
  if (recallCompare) recallCompare.style.display = 'flex';
}

function cleanCardFeedback() {
  const cardEl = container.querySelector('.card');
  if (!cardEl) return;
  cardEl.classList.remove('correct', 'incorrect');
  const divider = cardEl.querySelector('.card-divider');
  const wrong = cardEl.querySelector('.card-wrong');
  if (divider) divider.remove();
  if (wrong) wrong.remove();
}

function advanceToNextCard() {
  recallInput.blur();
  if (compareBtn) compareBtn.textContent = 'COMPARAR';
  const cardEl = container.querySelector('.card');
  if (cardEl) cardEl.classList.remove('visible');
  if (recallCompare) recallCompare.style.display = 'none';
  isCardHidden = false;
  hiddenCardData = null;
  isPaused = false;
  updatePauseButton();
  cleanCardFeedback();
  setTimeout(() => {
    if (currentSet === 'numbers') {
      currentIndex++;
      showNumbersCard();
    } else if (currentSet === 'binario') {
      currentIndex++;
      showBinarioCard();
    } else if (currentSet === 'deck') {
      currentIndex++;
      showDeckCard();
    } else {
      currentIndex = (currentIndex + 1) % dataSets[currentSet].length;
      if (currentIndex === 0 && isShuffle) {
        shuffleOrder = buildShuffleOrder(dataSets[currentSet].length);
      }
      showCard(currentIndex);
    }
    scheduleNext();
  }, 200);
}
function getItemIndex() {
  return isShuffle && shuffleOrder.length > 0 ? shuffleOrder[currentIndex] : currentIndex;
}

let lastPauseAction = 0;
function handlePauseAction() {
  const now = Date.now();
  if (now - lastPauseAction < 200) return;
  lastPauseAction = now;
  if (currentSet === 'suplemento') {
    if (window.SuplementoModule && typeof window.SuplementoModule.start === 'function') {
      window.SuplementoModule.start();
    }
    isRunning = true;
    isPaused = false;
    startTimerInterval();
    return;
  }
  if (currentSet === 'animales') {
    if (window.AnimalesModule && typeof window.AnimalesModule.start === 'function') {
      window.AnimalesModule.start();
    }
    isRunning = true;
    isPaused = false;
    startTimerInterval();
    return;
  }
  if (!currentSet) {
    currentSet = '1-100';
  }
  if (!isRunning) {
    try {
      startRunning();
    } catch (e) {
      console.error(e);
    }
    startTimerInterval();
  } else if (isPaused && isRecall && !isCardHidden) {
    advanceToNextCard();
    startTimerInterval();
  } else if (!isPaused) {
    isPaused = true;
    if (timer) { clearTimeout(timer); timer = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const cardEl = container.querySelector('.card');
    if (cardEl) cardEl.classList.add('visible');
    updatePauseButton();
  } else {
    isPaused = false;
    updatePauseButton();
    startTimerInterval();
    scheduleNext();
  }
}

pauseBtn.addEventListener('click', handlePauseAction);
pauseBtn.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  handlePauseAction();
});

function startTimerInterval() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!isPaused && isRunning) {
      timerElapsed += 10;
      updateTimerDisplay();
    }
  }, 10);
}

function updatePauseButton() {
  if (!isRunning) {
    pauseIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    pauseLabel.textContent = 'COMENZAR';

  } else if (isPaused) {
    pauseIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    pauseLabel.textContent = 'REANUDAR';

  } else {
    pauseIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    pauseLabel.textContent = 'PAUSAR';
    pauseBtn.classList.remove('paused');
  }
}

function renderCard(item, index, total) {
  container.innerHTML = '';
  container.appendChild(emptyState);
  emptyState.style.display = 'none';
  const card = document.createElement('div');
  card.className = 'card';

  const label = document.createElement('div');
  label.className = 'card-label';
  label.textContent = currentSetDisplayName();

  const top = document.createElement('div');
  top.className = 'card-top';
  top.textContent = item.top;

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  bottom.textContent = item.bottom;

  const idx = document.createElement('div');
  idx.className = 'card-index';
  idx.textContent = (index + 1) + '/' + total;

  card.appendChild(label);
  card.appendChild(top);
  card.appendChild(bottom);
  card.appendChild(idx);
  container.appendChild(card);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.add('visible');
    });
  });
}

function currentSetDisplayName() {
  const names = {
    '1-100': '1-100', 'binario': 'BINARIO', 'deck': 'DECK', 'abc': 'ABC',
    'cirilico': 'CIRÍLICO', 'cantidades': 'CANT.', 'meses': 'MESES', 'personal': 'PERSONAL'
  };
  return names[currentSet] || currentSet;
}

function showCard(index) {
  const items = dataSets[currentSet];
  if (!items || items.length === 0) return;
  const idx = getItemIndex();
  const item = items[idx];
  renderCard(item, index, items.length);
}

function fadeOutAndNext() {
  const card = container.querySelector('.card');
  if (card) card.classList.remove('visible');

  setTimeout(() => {
    if (isPaused) return;
    currentIndex = (currentIndex + 1) % dataSets[currentSet].length;
    if (currentIndex === 0 && isShuffle) {
      shuffleOrder = buildShuffleOrder(dataSets[currentSet].length);
    }
    showCard(currentIndex);
    scheduleNext();
  }, 350);
}

function stopCycle() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  isRunning = false;
  isPaused = false;
  isCardHidden = false;
  hiddenCardData = null;
  if (compareBtn) compareBtn.textContent = 'COMPARAR';
  if (recallCompare) recallCompare.style.display = 'none';
  updatePauseButton();
}

function selectSet(setKey) {
  stopCycle();
  resetTimer();
  isCardHidden = false;
  hiddenCardData = null;
  if (compareBtn) compareBtn.textContent = 'COMPARAR';
  if (recallCompare) recallCompare.style.display = 'none';
  currentSet = setKey;
  currentIndex = 0;
  bottomControls.style.display = setKey === 'instructions' ? 'none' : '';
  contentArea.classList.toggle('no-center', setKey === 'instructions');
  numbersConfig.style.display = 'none';
  binarioConfig.style.display = 'none';
  deckConfig.style.display = 'none';
  personalConfig.style.display = 'none';
  instructionsTable.style.display = 'none';
  container.style.display = '';
  if (setKey === 'personal') {
    speedTimer.style.display = 'flex';
    speedInputRow.style.display = 'none';
    speedBar.style.display = 'none';
    speedLimits.style.display = 'none';
    speedArrows.style.display = 'none';
    speedUnit.style.display = 'none';
  } else {
    speedTimer.style.display = 'none';
    speedInputRow.style.display = '';
    speedBar.style.display = '';
    speedLimits.style.display = '';
    speedArrows.style.display = '';
    speedUnit.style.display = '';
    pauseBtn.classList.remove('hidden');
    const cb = document.getElementById('clearBtn');
    if (cb) cb.classList.remove('full-width');
  }
  const setNames = {
    '1-100': 'Números 1-100', 'binario': 'Números binarios', 'deck': 'Baraja', 'numbers': 'Numbers',
    'personal': 'Personal',
    'abc': 'ABC', 'cirilico': 'Alfabeto cirílico',
    'cantidades': 'Cantidades', 'meses': 'Meses del año'
  };
  lessonTitle.textContent = setNames[setKey] || setKey;
  if (setKey === 'instructions') {
    lessonSubtitle.textContent = 'Sistema de conversión fonética';
    instructionsTable.style.display = '';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'deck') {
    lessonSubtitle.textContent = 'Cantidad de cartas y COMENZAR';
    deckConfig.style.display = 'flex';
    syncSuitButtons();
    updateDeckCountMax();
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'numbers') {
    lessonSubtitle.textContent = 'Configura y presiona COMENZAR';
    numbersConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'binario') {
    lessonSubtitle.textContent = 'Cantidad de binarios y COMENZAR';
    binarioConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'personal') {
    lessonSubtitle.textContent = 'Pega palabras y presiona COMENZAR';
    personalConfig.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    updatePersonalStartButton();
    return;
  }
  const items = dataSets[setKey];
  lessonSubtitle.textContent = items ? items.length + ' elementos' : '';
  if (!items || items.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  emptyState.style.display = 'none';
  showCard(0);
}

function scheduleNext() {
  if (timer) clearTimeout(timer);
  if (isPaused) return;
  if (isRecall) {
    timer = setTimeout(() => {
      if (isPaused || !isRunning) return;
      hideCardShowQuestion();
    }, getDelay());
    return;
  }
  timer = setTimeout(() => {
    if (isPaused) return;
    if (currentSet === 'numbers') {
      fadeOutAndNextNumbers();
    } else if (currentSet === 'binario') {
      fadeOutAndNextBinario();
    } else if (currentSet === 'deck') {
      fadeOutAndNextDeck();
    } else {
      fadeOutAndNext();
    }
  }, getDelay());
}

function startRunning() {
  isRunning = true;
  isPaused = false;
  isCardHidden = false;
  hiddenCardData = null;
  if (compareBtn) compareBtn.textContent = 'COMPARAR';
  if (recallCompare) recallCompare.style.display = 'none';
  if (currentSet === 'numbers') {
    currentIndex = 0;
    showNumbersCard();
  } else if (currentSet === 'binario') {
    currentIndex = 0;
    showBinarioCard();
  } else if (currentSet === 'deck') {
    currentIndex = 0;
    showDeckCard();
  } else if (currentSet === 'personal') {
    if (personalMode === 'story') {
      const text = personalTextarea.value.trim();
      if (!text) return;
      dataSets['personal'] = [{ top: text, bottom: '' }];
      personalConfig.style.display = 'none';
      shuffleOrder = [];
      currentIndex = 0;
      updateLessonForPersonal(1);
      showCard(0);
    } else if (personalMode === 'frases') {
      const list = parsePersonalFrases();
      if (list.length === 0) return;
      dataSets['personal'] = list.map(p => ({ top: p, bottom: '' }));
      personalConfig.style.display = 'none';
      shuffleOrder = isShuffle ? buildShuffleOrder(dataSets['personal'].length) : [];
      currentIndex = 0;
      updateLessonForPersonal(list.length);
      showCard(0);
    } else {
      const list = parsePersonal();
      if (list.length === 0) return;
      dataSets['personal'] = list.map(w => ({ top: w, bottom: '' }));
      personalConfig.style.display = 'none';
      shuffleOrder = isShuffle ? buildShuffleOrder(dataSets['personal'].length) : [];
      currentIndex = 0;
      updateLessonForPersonal(list.length);
      showCard(0);
    }
  } else {
    shuffleOrder = isShuffle ? buildShuffleOrder(dataSets[currentSet].length) : [];
    currentIndex = 0;
    showCard(0);
  }
  updatePauseButton();
  scheduleNext();
}

const menuCategories = {
  'aprender': ['instructions', '1-100', 'abc', 'cirilico', 'meses'],
  'aplicar': ['numbers', 'pao', 'deck', 'binario', 'cantidades', 'suplemento', 'animales'],
  'leer': ['personal', 'lectura'],
  'simon': ['simon']
};

const subPillNames = {
  'instructions': 'Instrucciones', '1-100': '1-100', 'pao': 'PAO', 'abc': 'ABC', 'cirilico': 'Cirílico',
  'numbers': 'Numbers', 'deck': 'Deck', 'binario': 'Binario', 'cantidades': 'Cantidades',
  'meses': 'Meses', 'personal': 'Personal', 'lectura': 'Lectura', 'simon': 'Simon',
  'suplemento': 'Suplemento', 'animales': 'Animales'
};

let currentMenu = null;
const mainMenu = document.getElementById('mainMenu');
const subMenu = document.getElementById('subMenu');

function findMenuForSet(setKey) {
  for (const menu in menuCategories) {
    if (menuCategories[menu].includes(setKey)) return menu;
  }
  return null;
}

function deselectCurrentSet() {
  currentSet = null;
  localStorage.removeItem('sparrowGame');
  bottomControls.style.display = '';
  contentArea.classList.remove('no-center');
  numbersConfig.style.display = 'none';
  binarioConfig.style.display = 'none';
  deckConfig.style.display = 'none';
  personalConfig.style.display = 'none';
  instructionsTable.style.display = 'none';
  lessonTitle.textContent = 'Selecciona un grupo';
  lessonSubtitle.textContent = 'para comenzar a memorizar';
  container.innerHTML = '';
  emptyState.style.display = 'none';
  container.appendChild(emptyState);
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
}

function hideLecturaIfVisible() {
  if (window.LecturaModule && typeof window.LecturaModule.hide === 'function') {
    window.LecturaModule.hide();
  }
}

function hideSimonIfVisible() {
  if (window.SimonModule && typeof window.SimonModule.hide === 'function') {
    window.SimonModule.hide();
  }
}

function hideSuplementoIfVisible() {
  if (window.SuplementoModule && typeof window.SuplementoModule.hide === 'function') {
    window.SuplementoModule.hide();
  }
}

function hideAnimalesIfVisible() {
  if (window.AnimalesModule && typeof window.AnimalesModule.hide === 'function') {
    window.AnimalesModule.hide();
  }
}

function hidePAOIfVisible() {
  if (window.PAOModule && typeof window.PAOModule.hide === 'function') {
    window.PAOModule.hide();
  }
}

function activateSimon(btn) {
  if (isRunning) stopCycle();
  resetTimer();
  currentSet = 'simon';
  localStorage.setItem('sparrowGame', 'simon');
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (window.SimonModule && typeof window.SimonModule.show === 'function') {
    window.SimonModule.show();
  }
}

function activateSuplemento(btn) {
  if (isRunning) stopCycle();
  resetTimer();
  currentSet = 'suplemento';
  localStorage.setItem('sparrowGame', 'suplemento');
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (window.SuplementoModule && typeof window.SuplementoModule.show === 'function') {
    window.SuplementoModule.show();
  }
}

function activateAnimales(btn) {
  if (isRunning) stopCycle();
  resetTimer();
  currentSet = 'animales';
  localStorage.setItem('sparrowGame', 'animales');
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (window.AnimalesModule && typeof window.AnimalesModule.show === 'function') {
    window.AnimalesModule.show();
  }
}

function activatePAO(btn) {
  if (isRunning) stopCycle();
  resetTimer();
  currentSet = 'pao';
  localStorage.setItem('sparrowGame', 'pao');
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (window.PAOModule && typeof window.PAOModule.show === 'function') {
    window.PAOModule.show();
  }
}

function activateLectura(btn) {
  if (isRunning) stopCycle();
  resetTimer();
  currentSet = 'lectura';
  localStorage.setItem('sparrowGame', 'lectura');
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (window.LecturaModule && typeof window.LecturaModule.show === 'function') {
    window.LecturaModule.show();
  }
}

function handleSubPillClick(btn) {
  const setKey = btn.dataset.set;
  if (currentSet === 'lectura' && setKey !== 'lectura') {
    hideLecturaIfVisible();
    currentSet = null;
  }
  if (currentSet === 'simon' && setKey !== 'simon') {
    hideSimonIfVisible();
    currentSet = null;
  }
  if (currentSet === 'suplemento' && setKey !== 'suplemento') {
    hideSuplementoIfVisible();
    currentSet = null;
  }
  if (currentSet === 'animales' && setKey !== 'animales') {
    hideAnimalesIfVisible();
    currentSet = null;
  }
  if (currentSet === 'pao' && setKey !== 'pao') {
    hidePAOIfVisible();
    currentSet = null;
  }
  if (setKey === 'lectura') {
    if (currentSet === 'lectura') return;
    if (isRunning) {
      saveConfigValues();
    }
    activateLectura(btn);
    return;
  }
  if (setKey === 'simon') {
    if (currentSet === 'simon') return;
    if (isRunning) {
      saveConfigValues();
    }
    activateSimon(btn);
    return;
  }
  if (setKey === 'suplemento') {
    if (currentSet === 'suplemento') return;
    if (isRunning) {
      saveConfigValues();
    }
    activateSuplemento(btn);
    return;
  }
  if (setKey === 'animales') {
    if (currentSet === 'animales') return;
    if (isRunning) {
      saveConfigValues();
    }
    activateAnimales(btn);
    return;
  }
  if (setKey === 'pao') {
    if (currentSet === 'pao') return;
    if (isRunning) {
      saveConfigValues();
    }
    activatePAO(btn);
    return;
  }
  if (setKey === currentSet && isRunning) {
    stopCycle();
    selectSet(setKey);
    return;
  }
  if (setKey === currentSet && !isRunning) {
    deselectCurrentSet();
    return;
  }
  if (isRunning) {
    localStorage.setItem('sparrowGame', setKey);
    saveConfigValues();
    location.reload();
    return;
  }
  subMenu.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  localStorage.setItem('sparrowGame', setKey);
  selectSet(setKey);
}

function renderSubMenu(menuKey, activeSet) {
  subMenu.innerHTML = '';
  menuCategories[menuKey].forEach(setKey => {
    const b = document.createElement('button');
    b.className = 'cat-pill sub-pill' + (setKey === activeSet ? ' active' : '');
    b.dataset.set = setKey;
    b.textContent = subPillNames[setKey];
    b.addEventListener('click', () => handleSubPillClick(b));
    subMenu.appendChild(b);
  });
}

function selectMenu(menuKey, activeSet) {
  currentMenu = menuKey;
  localStorage.setItem('sparrowMenu', menuKey);
  mainMenu.querySelectorAll('.main-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.menu === menuKey);
  });
  renderSubMenu(menuKey, activeSet || null);
}

mainMenu.querySelectorAll('.main-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const menuKey = btn.dataset.menu;
    if (menuKey === currentMenu) return;
    if (currentSet === 'lectura') {
      hideLecturaIfVisible();
      currentSet = null;
      localStorage.removeItem('sparrowGame');
    }
    if (currentSet === 'simon') {
      hideSimonIfVisible();
      currentSet = null;
      localStorage.removeItem('sparrowGame');
    }
    if (currentSet === 'suplemento') {
      hideSuplementoIfVisible();
      currentSet = null;
      localStorage.removeItem('sparrowGame');
    }
    if (currentSet === 'animales') {
      hideAnimalesIfVisible();
      currentSet = null;
      localStorage.removeItem('sparrowGame');
    }
    if (currentSet === 'pao') {
      hidePAOIfVisible();
      currentSet = null;
      localStorage.removeItem('sparrowGame');
    }
    if (isRunning) {
      stopCycle();
      resetTimer();
    }
    if (currentSet && !menuCategories[menuKey].includes(currentSet)) {
      deselectCurrentSet();
    }
    selectMenu(menuKey, currentSet && menuCategories[menuKey].includes(currentSet) ? currentSet : null);
  });
});

function saveConfigValues() {
  localStorage.setItem('sparrowPersonalText', personalTextarea.value);
  localStorage.setItem('sparrowNumCount', numCount.value);
  localStorage.setItem('sparrowNumFrom', numFrom.value);
  localStorage.setItem('sparrowNumTo', numTo.value);
  localStorage.setItem('sparrowBinCount', binCount.value);
  localStorage.setItem('sparrowDeckCount', deckCount.value);
  localStorage.setItem('sparrowDeckSuits', deckSelectedSuits.join(''));
  localStorage.setItem('sparrowSpeedInput', speedInput.value);
  localStorage.setItem('sparrowTimerMin', personalMinutes);
  localStorage.setItem('sparrowTimerSec', personalSeconds);
  localStorage.setItem('sparrowRecall', isRecall);
  localStorage.setItem('sparrowShuffle', isShuffle);
  localStorage.setItem('sparrowPersonalMode', personalMode);
}

function restoreConfigValues() {
  const pt = localStorage.getItem('sparrowPersonalText');
  if (pt !== null) personalTextarea.value = pt;
  const nc = localStorage.getItem('sparrowNumCount');
  if (nc !== null) numCount.value = nc;
  const nf = localStorage.getItem('sparrowNumFrom');
  if (nf !== null) numFrom.value = nf;
  const nt = localStorage.getItem('sparrowNumTo');
  if (nt !== null) numTo.value = nt;
  const bc = localStorage.getItem('sparrowBinCount');
  if (bc !== null) binCount.value = bc;
  const dc = localStorage.getItem('sparrowDeckCount');
  if (dc !== null) deckCount.value = dc;
  const ds = localStorage.getItem('sparrowDeckSuits');
  if (ds !== null) {
    const saved = ds.split('').filter(s => ALL_SUITS.includes(s));
    deckSelectedSuits = saved.length ? saved : [...ALL_SUITS];
    syncSuitButtons();
    updateDeckCountMax();
  }
  const si = localStorage.getItem('sparrowSpeedInput');
  if (si !== null) speedInput.value = si;
}

const savedGame = localStorage.getItem('sparrowGame') || 'instructions';
const savedRecall = localStorage.getItem('sparrowRecall');
const savedShuffle = localStorage.getItem('sparrowShuffle');
const savedPersonalMode = localStorage.getItem('sparrowPersonalMode');
const savedTimerMin = localStorage.getItem('sparrowTimerMin');
const savedTimerSec = localStorage.getItem('sparrowTimerSec');

if (savedTimerMin !== null) personalMinutes = parseInt(savedTimerMin);
if (savedTimerSec !== null) personalSeconds = parseInt(savedTimerSec);
updatePersonalTimerDisplay();

if (savedRecall !== null) {
  isRecall = savedRecall === 'true';
  modeTraining.classList.toggle('active', !isRecall);
  modeRecall.classList.toggle('active', isRecall);
}
if (savedShuffle !== null) {
  isShuffle = savedShuffle === 'true';
  modeOrden.classList.toggle('active', !isShuffle);
  modeAleatorio.classList.toggle('active', isShuffle);
}
if (savedPersonalMode !== null) {
  personalMode = savedPersonalMode;
  personalWord.classList.toggle('active', personalMode === 'word');
  personalStory.classList.toggle('active', personalMode === 'story');
  personalFrases.classList.toggle('active', personalMode === 'frases');
}

restoreConfigValues();

const savedMenu = localStorage.getItem('sparrowMenu');

try {
  if (savedGame === 'lectura') {
    currentSet = 'lectura';
    selectMenu('leer', 'lectura');
  } else if (savedGame === 'simon') {
    currentSet = 'simon';
    selectMenu('simon', 'simon');
  } else if (savedGame === 'suplemento') {
    currentSet = 'suplemento';
    selectMenu('aplicar', 'suplemento');
  } else if (savedGame === 'animales') {
    currentSet = 'animales';
    selectMenu('aplicar', 'animales');
  } else if (savedGame === 'pao') {
    currentSet = 'pao';
    selectMenu('aplicar', 'pao');
  } else {
    const startMenu = (savedMenu && menuCategories[savedMenu] && menuCategories[savedMenu].includes(savedGame))
      ? savedMenu
      : (findMenuForSet(savedGame) || 'aprender');
    selectSet(savedGame);
    selectMenu(startMenu, savedGame);
  }
} catch (e) {
  currentSet = 'instructions';
  selectSet('instructions');
  selectMenu('aprender', 'instructions');
}
updateSpeedFill();
