const dataSets = {
  '1-100': [],
  'binario': [],
  'deck': [],
  'abc': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(l => ({ top: l, bottom: '' })),
  'cirilico': 'А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я'.split(' ').map(l => ({ top: l, bottom: '' })),
  'cantidades': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '20', '30', '40', '50', '100', '1.000', '10.000', '100.000', '1.000.000'].map(l => ({ top: l, bottom: '' })),
  'meses': ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map(l => ({ top: l, bottom: '' }))
};

const pegWords = {
  '00':'Reir','0':'Aro','1':'Tea','2':'Noe','3':'Amo','4':'Oca','5':'Ley',
  '6':'Oso','7':'Fea','8':'Ucha','9':'Ave','10':'Torre','11':'Teta','12':'Tina',
  '13':'Tomo','14':'Taco','15':'Tela','16':'Tez','17':'Tufo','18':'Techo',
  '19':'Tubo','20':'Nuera','21':'Nido','22':'Niño','23':'Nomo','24':'Naco',
  '25':'Nilo','26':'Nuez','27':'Naife','28':'Nicho','29':'Nube','30':'Mar',
  '31':'Mito','32':'Mono','33':'Mama','34':'Meca','35':'Mulo','36':'Mesa',
  '37':'Mufo','38':'Mecha','39':'Mapa','40':'Corro','41':'Codo','42':'Cuna',
  '43':'Cama','44':'Coco','45':'Cola','46':'Cazo','47':'Café','48':'Coche',
  '49':'Cubo','50':'Lira','51':'Loto','52':'Luna','53':'Lima','54':'Loco',
  '55':'Lulu','56':'Lazo','57':'Elfo','58':'Lucha','59':'Lupa','60':'Suero',
  '61':'Ostia','62':'Zona','63':'Sima','64':'Saco','65':'Sol','66':'Seso',
  '67':'Sofa','68':'Asecho','69':'Sapo','70':'Faro','71':'Foto','72':'Faena',
  '73':'Fama','74':'Foca','75':'Fiel','76':'Fosa','77':'Fofo','78':'Ficha',
  '79':'Fobia','80':'Chorro','81':'Chita','82':'Chino','83':'Chama','84':'Cheque',
  '85':'Chal','86':'Choza','87':'Enchufa','88':'Chacha','89':'Chapa','90':'Burro',
  '91':'Pito','92':'Pino','93':'Puma','94':'Vaca','95':'Bala','96':'Buzo',
  '97':'Bife','98':'Bache','99':'Pipa','100':'Torero'
};
const pegOrder = ['00','0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99','100'];
for (const key of pegOrder) {
  dataSets['1-100'].push({ top: key, bottom: pegWords[key] });
}

const deckMatrix = {
  '♥': { A:'Cai', 2:'Can', 3:'Com', 4:'Caca', 5:'Cal', 6:'Caceria', 7:'Cofre', 8:'Caucho', 9:'Caviar', 10:'Carro', J:'Cajón', Q:'Quicullo', K:'Cekar' },
  '♣': { A:'Taz', 2:'Tinto', 3:'Timo', 4:'Tac', 5:'Tallo', 6:'Tiza', 7:'Tifón', 8:'Techo', 9:'Tampób', 10:'Tarro', J:'Tejon', Q:'Tequila', K:'Tikuna' },
  '♠': { A:'Pala', 2:'Pan', 3:'Poma', 4:'Peca', 5:'Pelo', 6:'Pasas', 7:'Puf', 8:'Pecho', 9:'Pibe', 10:'Parra', J:'Pujar', Q:'Pequeca', K:'Pekado' },
  '♦': { A:'Dia', 2:'Don', 3:'Damian', 4:'Doctor', 5:'Dalmata', 6:'Disco', 7:'Diferente', 8:'Ducha', 9:'Diva', 10:'Dardo', J:'Dejó', Q:'Doqumento', K:'Dekalogo' }
};
const deckSuits = ['♥','♣','♠','♦'];
const deckRanks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

for (const s of deckSuits) {
  for (const r of deckRanks) {
    dataSets['deck'].push({ top: r + s, bottom: deckMatrix[s][r] });
  }
}

let currentSet = null;
let currentIndex = 0;
let isPaused = false;
let isRunning = false;
let isShuffle = true;
let isRecall = true;
let isCardHidden = false;
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

let fontSize = 8;

function applyFontScale() {
  const em = fontSize * 0.5;
  document.documentElement.style.setProperty('--card-font-size', em + 'em');
  document.querySelectorAll('.card-top').forEach(el => el.style.fontSize = em + 'em');
  document.querySelectorAll('.card-bottom').forEach(el => el.style.fontSize = (em * 0.4) + 'em');
  document.querySelectorAll('.card-wrong').forEach(el => el.style.fontSize = (em * 0.35) + 'em');
}

fontDown.addEventListener('click', () => {
  if (fontSize > 0) { fontSize--; applyFontScale(); }
});

fontUp.addEventListener('click', () => {
  if (fontSize < 28) { fontSize++; applyFontScale(); }
});

applyFontScale();
let numbersConfig = document.getElementById('numbersConfig');
let numCount = document.getElementById('numCount');
let numFrom = document.getElementById('numFrom');
let numTo = document.getElementById('numTo');
let binarioConfig = document.getElementById('binarioConfig');
let binCount = document.getElementById('binCount');
let personalConfig = document.getElementById('personalConfig');
let personalTextarea = document.getElementById('personalTextarea');
let instructionsTable = document.getElementById('instructionsTable');
let clockDisplay = document.getElementById('clockDisplay');
let timerDisplay = document.getElementById('timerDisplay');

let speedInput = document.getElementById('speedInput');
let speedFill = document.getElementById('speedFill');

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

const MIN_DELAY = 1;
const MAX_DELAY = 300000;

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
  const ms = parseSpeed(speedInput.value);
  if (ms === null || ms < MIN_DELAY) return MIN_DELAY;
  return Math.min(ms, MAX_DELAY);
}

function updateSpeedFill() {
  const ms = getDelay();
  const logMin = Math.log(MIN_DELAY);
  const logMax = Math.log(MAX_DELAY);
  const pct = (Math.log(ms) - logMin) / (logMax - logMin) * 100;
  speedFill.style.width = Math.min(100, Math.max(0, pct)) + '%';
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
  const step = 100;
  if (up) ms = Math.max(MIN_DELAY, ms - step);
  else ms = Math.min(MAX_DELAY, ms + step);
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
  if (currentSet) {
    recallCompare.style.display = 'none';
    cleanCardFeedback();
    selectSet(currentSet);
  }
}

modeTraining.addEventListener('click', () => setRecallMode(false));
modeRecall.addEventListener('click', () => setRecallMode(true));

compareBtn.addEventListener('click', () => {
  if (!isCardHidden) return;
  if (hiddenCardData !== null && recallInput.value.trim() !== '') {
    compareAndReveal();
  } else {
    advanceToNextCard();
  }
});

recallInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (hiddenCardData !== null && recallInput.value.trim() !== '') {
      compareAndReveal();
    } else {
      advanceToNextCard();
    }
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
  recallCompare.style.display = 'flex';
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

  const userAnswer = recallInput.value.trim().replace(/\s+/g, ' ');
  const correctAnswer = (hiddenCardData.bottom || hiddenCardData.top).trim().replace(/\s+/g, ' ');
  const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();

  const topEl = cardEl.querySelector('.card-top');
  const bottomEl = cardEl.querySelector('.card-bottom');
  let existingDivider = cardEl.querySelector('.card-divider');
  let existingWrong = cardEl.querySelector('.card-wrong');

  if (isCorrect) {
    cardEl.classList.add('correct');
    if (topEl) topEl.textContent = hiddenCardData.top;
    if (bottomEl) bottomEl.textContent = hiddenCardData.bottom;
    isPaused = true;
    if (timer) { clearTimeout(timer); timer = null; }
    updatePauseButton();
  } else {
    cardEl.classList.add('incorrect');
    if (topEl) topEl.textContent = hiddenCardData.top + ' ' + hiddenCardData.bottom;
    if (bottomEl) bottomEl.textContent = '';

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

  hiddenCardData = null;
  isCardHidden = false;
  recallInput.value = '';
  recallCompare.style.display = 'flex';
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
  const cardEl = container.querySelector('.card');
  if (cardEl) cardEl.classList.remove('visible');
  recallCompare.style.display = 'none';
  isCardHidden = false;
  hiddenCardData = null;
  isPaused = false;
  updatePauseButton();
  cleanCardFeedback();
  setTimeout(() => {
    if (isPaused || !isRunning) return;
    if (currentSet === 'numbers') {
      currentIndex++;
      showNumbersCard();
    } else if (currentSet === 'binario') {
      currentIndex++;
      showBinarioCard();
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

function handlePauseAction() {
  if (!currentSet) return;
  if (!isRunning) {
    startRunning();
    startTimerInterval();
  } else if (isPaused && isRecall && !isCardHidden) {
    advanceToNextCard();
    startTimerInterval();
  } else if (!isPaused) {
    isPaused = true;
    if (timer) { clearTimeout(timer); timer = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    updatePauseButton();
  } else {
    isPaused = false;
    updatePauseButton();
    startTimerInterval();
    scheduleNext();
  }
}

pauseBtn.addEventListener('click', handlePauseAction);
pauseBtn.addEventListener('touchend', (e) => {
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
    pauseBtn.classList.remove('paused');
  } else if (isPaused) {
    pauseIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    pauseLabel.textContent = 'REANUDAR';
    pauseBtn.classList.add('paused');
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
    'cirilico': 'CIRILICO', 'cantidades': 'CANT.', 'meses': 'MESES', 'personal': 'PERSONAL'
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

function scheduleNext() {
  if (timer) clearTimeout(timer);
  if (isPaused) return;
  timer = setTimeout(() => {
    if (isPaused) return;
    fadeOutAndNext();
  }, getDelay());
}

function stopCycle() {
  if (timer) { clearTimeout(timer); timer = null; }
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  isRunning = false;
  isPaused = false;
  isCardHidden = false;
  hiddenCardData = null;
  recallCompare.style.display = 'none';
  updatePauseButton();
}

function selectSet(setKey) {
  stopCycle();
  resetTimer();
  isCardHidden = false;
  hiddenCardData = null;
  recallCompare.style.display = 'none';
  currentSet = setKey;
  currentIndex = 0;
  bottomControls.style.display = setKey === 'instructions' ? 'none' : '';
  contentArea.classList.toggle('no-center', setKey === 'instructions');
  numbersConfig.style.display = 'none';
  binarioConfig.style.display = 'none';
  personalConfig.style.display = 'none';
  instructionsTable.style.display = 'none';
  container.style.display = '';
  const setNames = {
    '1-100': 'Números 1-100', 'binario': 'Números binarios', 'deck': 'Baraja', 'numbers': 'Numbers',
    'personal': 'Personal',
    'abc': 'ABC', 'cirilico': 'Alfabeto cirílico',
    'cantidades': 'Cantidades', 'meses': 'Meses del año'
  };
  lessonTitle.textContent = setNames[setKey] || setKey;
  if (setKey === 'instructions') {
    lessonSubtitle.textContent = 'Sistema de conversión fonética';
    instructionsTable.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'numbers') {
    lessonSubtitle.textContent = 'Configura y presiona COMENZAR';
    numbersConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'binario') {
    lessonSubtitle.textContent = 'Cantidad de binarios y COMENZAR';
    binarioConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'personal') {
    lessonSubtitle.textContent = 'Pega palabras y presiona COMENZAR';
    personalConfig.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    container.appendChild(emptyState);
    return;
  }
  const items = dataSets[setKey];
  lessonSubtitle.textContent = items ? items.length + ' elementos' : '';
  if (!items || items.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    container.appendChild(emptyState);
    return;
  }
  emptyState.style.display = 'none';
  showCard(0);
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
    } else {
      fadeOutAndNext();
    }
  }, getDelay());
}

function fadeOutAndNextNumbers() {
  const card = container.querySelector('.card');
  if (card) card.classList.remove('visible');
  setTimeout(() => {
    if (isPaused) return;
    currentIndex++;
    showNumbersCard();
    scheduleNext();
  }, 350);
}

function fadeOutAndNextBinario() {
  const card = container.querySelector('.card');
  if (card) card.classList.remove('visible');
  setTimeout(() => {
    if (isPaused) return;
    currentIndex++;
    showBinarioCard();
    scheduleNext();
  }, 350);
}

function startRunning() {
  isRunning = true;
  isPaused = false;
  isCardHidden = false;
  hiddenCardData = null;
  recallCompare.style.display = 'none';
  if (currentSet === 'numbers') {
    numbersConfig.style.display = 'none';
    currentIndex = 0;
    showNumbersCard();
  } else if (currentSet === 'binario') {
    binarioConfig.style.display = 'none';
    currentIndex = 0;
    showBinarioCard();
  } else if (currentSet === 'personal') {
    const list = parsePersonal();
    if (list.length === 0) return;
    dataSets['personal'] = list.map(w => ({ top: w, bottom: '' }));
    personalConfig.style.display = 'none';
    shuffleOrder = isShuffle ? buildShuffleOrder(dataSets['personal'].length) : [];
    currentIndex = 0;
    updateLessonForPersonal(list.length);
    showCard(0);
  } else {
    shuffleOrder = isShuffle ? buildShuffleOrder(dataSets[currentSet].length) : [];
    currentIndex = 0;
    showCard(0);
  }
  updatePauseButton();
  scheduleNext();
}

function generateNumbers() {
  const count = parseInt(numCount.value) || 5;
  const from = parseInt(numFrom.value) || 1;
  const to = parseInt(numTo.value) || 69;
  const clampedCount = Math.min(count, Math.max(1, to - from + 1));
  const pool = [];
  for (let i = from; i <= to; i++) pool.push(i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const selected = pool.slice(0, clampedCount);
  selected.sort((a, b) => a - b);
  return selected.map(n => String(n).padStart(2, '0')).join(' ');
}

function parsePersonal() {
  const raw = personalTextarea.value.trim();
  if (!raw) return [];
  const parts = raw.split(/[,\n]+/);
  return parts
    .map(p => p.trim())
    .flatMap(p => p.split(/\s+/))
    .filter(w => w.length > 0);
}

function updateLessonForPersonal(count) {
  lessonTitle.textContent = 'Personal';
  lessonSubtitle.textContent = count + ' palabras';
}

function generateBinario() {
  const count = parseInt(binCount.value) || 5;
  const clampedCount = Math.min(count, 50);
  const groups = [];
  for (let i = 0; i < clampedCount; i++) {
    const a = Math.random() < 0.5 ? '0' : '1';
    const b = Math.random() < 0.5 ? '0' : '1';
    groups.push(a + b);
  }
  return groups.join(' ');
}

function showBinarioCard() {
  const binarios = generateBinario();
  container.innerHTML = '';
  container.appendChild(emptyState);
  emptyState.style.display = 'none';
  const card = document.createElement('div');
  card.className = 'card';

  const label = document.createElement('div');
  label.className = 'card-label';
  label.textContent = 'BINARIO';

  const top = document.createElement('div');
  top.className = 'card-top';
  top.textContent = binarios;

  card.appendChild(label);
  card.appendChild(top);
  container.appendChild(card);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.add('visible');
    });
  });
}

function showNumbersCard() {
  const numbers = generateNumbers();
  container.innerHTML = '';
  container.appendChild(emptyState);
  emptyState.style.display = 'none';
  const card = document.createElement('div');
  card.className = 'card';

  const label = document.createElement('div');
  label.className = 'card-label';
  label.textContent = 'NUMBERS';

  const top = document.createElement('div');
  top.className = 'card-top';
  top.textContent = numbers;

  card.appendChild(label);
  card.appendChild(top);
  container.appendChild(card);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.add('visible');
    });
  });
}

document.querySelectorAll('.cat-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    const setKey = btn.dataset.set;
    if (setKey === currentSet && isRunning) {
      stopCycle();
      selectSet(setKey);
      return;
    }
    if (setKey === currentSet && !isRunning) {
      currentSet = null;
      bottomControls.style.display = '';
      contentArea.classList.remove('no-center');
      numbersConfig.style.display = 'none';
      binarioConfig.style.display = 'none';
      personalConfig.style.display = 'none';
      instructionsTable.style.display = 'none';
      lessonTitle.textContent = 'Selecciona un grupo';
      lessonSubtitle.textContent = 'para comenzar a memorizar';
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      container.appendChild(emptyState);
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      return;
    }
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectSet(setKey);
  });
});

selectSet('1-100');
updateSpeedFill();
