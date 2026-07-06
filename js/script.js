const dataSets = {
  '1-100': [],
  'binario': [],
  'deck': [],
  'abc': ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(l => ({ top: l, bottom: '' })),
  'cirilico': 'А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ц Ч Ш Щ Ъ Ы Ь Э Ю Я'.split(' ').map(l => ({ top: l, bottom: '' })),
  'cantidades': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '20', '30', '40', '50', '100', '1.000', '10.000', '100.000', '1.000.000'].map(l => ({ top: l, bottom: '' })),
  'meses': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(l => ({ top: l, bottom: '' }))
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
let deckConfig = document.getElementById('deckConfig');
let deckCount = document.getElementById('deckCount');
let personalConfig = document.getElementById('personalConfig');
let personalTextarea = document.getElementById('personalTextarea');
let personalWord = document.getElementById('personalWord');
let personalStory = document.getElementById('personalStory');
let instructionsTable = document.getElementById('instructionsTable');
let clockDisplay = document.getElementById('clockDisplay');
let timerDisplay = document.getElementById('timerDisplay');

let speedInput = document.getElementById('speedInput');
let speedFill = document.getElementById('speedFill');

let speedTimer = document.getElementById('speedTimer');
let timerValue = document.getElementById('timerValue');

let personalMinutes = 0;
let personalSeconds = 0;

function updatePersonalTimerDisplay() {
  timerValue.textContent = pad2(personalMinutes) + ':' + pad2(personalSeconds);
}

function changeTimerMinutes(delta) {
  personalMinutes = Math.max(0, Math.min(60, personalMinutes + delta));
  updatePersonalTimerDisplay();
}

function changeTimerSeconds(delta) {
  let total = personalMinutes * 60 + personalSeconds + delta;
  if (total < 0) total = 0;
  if (total > 60 * 60 + 59) total = 60 * 60 + 59;
  personalMinutes = Math.floor(total / 60);
  personalSeconds = total % 60;
  updatePersonalTimerDisplay();
}

document.getElementById('timerMinUp').addEventListener('click', () => changeTimerMinutes(1));
document.getElementById('timerMinDown').addEventListener('click', () => changeTimerMinutes(-1));
document.getElementById('timerSecUp').addEventListener('click', () => changeTimerSeconds(1));
document.getElementById('timerSecDown').addEventListener('click', () => changeTimerSeconds(-1));

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
  if (currentSet === 'personal') {
    return (personalMinutes * 60 + personalSeconds) * 1000;
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
  sessionStorage.setItem('sparrowShuffle', shuffle);
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
  sessionStorage.setItem('sparrowRecall', recall);
  if (currentSet) {
    if (recallCompare) recallCompare.style.display = 'none';
    cleanCardFeedback();
    selectSet(currentSet);
  }
}

modeTraining.addEventListener('click', () => setRecallMode(false));
modeRecall.addEventListener('click', () => setRecallMode(true));

personalWord.addEventListener('click', () => {
  personalMode = 'word';
  personalWord.classList.add('active');
  personalStory.classList.remove('active');
  sessionStorage.setItem('sparrowPersonalMode', 'word');
});

personalStory.addEventListener('click', () => {
  personalMode = 'story';
  personalStory.classList.add('active');
  personalWord.classList.remove('active');
  sessionStorage.setItem('sparrowPersonalMode', 'story');
});

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
  const rawCorrect = (hiddenCardData.bottom || hiddenCardData.top).trim();
  let userAnswer, correctAnswer;
  if (currentSet === 'personal' && personalMode === 'story') {
    userAnswer = rawUser.replace(/\s+/g, ' ').toLowerCase();
    correctAnswer = rawCorrect.replace(/\s+/g, ' ').toLowerCase();
  } else {
    userAnswer = rawUser.replace(/\s/g, '').toLowerCase();
    correctAnswer = rawCorrect.replace(/\s/g, '').toLowerCase();
  }
  const isCorrect = userAnswer === correctAnswer;

  const topEl = cardEl.querySelector('.card-top');
  const bottomEl = cardEl.querySelector('.card-bottom');
  let existingDivider = cardEl.querySelector('.card-divider');
  let existingWrong = cardEl.querySelector('.card-wrong');

  if (isCorrect) {
    cardEl.classList.add('correct');
    if (topEl) topEl.textContent = hiddenCardData.top;
    if (bottomEl) bottomEl.textContent = hiddenCardData.bottom;
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

  isPaused = true;
  if (timer) { clearTimeout(timer); timer = null; }
  updatePauseButton();
  hiddenCardData = null;
  isCardHidden = false;
  recallInput.value = '';
  if (compareBtn) compareBtn.textContent = 'NEXT';
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

function handlePauseAction() {
  if (!currentSet) {
    currentSet = '1-100';
  }
  if (!isRunning) {
if (savedPersonalMode !== null) {
  personalMode = savedPersonalMode;
  personalWord.classList.toggle('active', personalMode === 'word');
  personalStory.classList.toggle('active', personalMode === 'story');
}

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
    updatePauseButton();
  } else {
    isPaused = false;
    updatePauseButton();
    startTimerInterval();
    scheduleNext();
  }
}

pauseBtn.addEventListener('click', handlePauseAction);

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
    pauseLabel.textContent = 'START';

  } else if (isPaused) {
    pauseIcon.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
    pauseLabel.textContent = 'RESUME';

  } else {
    pauseIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
    pauseLabel.textContent = 'PAUSE';
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
    '1-100': '1-100', 'binario': 'BINARY', 'deck': 'DECK', 'abc': 'ABC',
    'cirilico': 'CYRILLIC', 'cantidades': 'QTY', 'meses': 'MONTHS', 'personal': 'PERSONAL'
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
    document.querySelector('.speed-input-row').style.display = 'none';
    document.querySelector('.speed-bar').style.display = 'none';
    document.querySelector('.speed-limits').style.display = 'none';
  } else {
    speedTimer.style.display = 'none';
    document.querySelector('.speed-input-row').style.display = '';
    document.querySelector('.speed-bar').style.display = '';
    document.querySelector('.speed-limits').style.display = '';
  }
  const setNames = {
    '1-100': 'Numbers 1-100', 'binario': 'Binary numbers', 'deck': 'Deck', 'numbers': 'Numbers',
    'personal': 'Personal',
    'abc': 'ABC', 'cirilico': 'Cyrillic alphabet',
    'cantidades': 'Quantities', 'meses': 'Months of the year'
  };
  lessonTitle.textContent = setNames[setKey] || setKey;
  if (setKey === 'instructions') {
    lessonSubtitle.textContent = 'Phonetic conversion system';
    instructionsTable.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'deck') {
    lessonSubtitle.textContent = 'Card count and START';
    deckConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'numbers') {
    lessonSubtitle.textContent = 'Configure and press START';
    numbersConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'binario') {
    lessonSubtitle.textContent = 'Binary count and START';
    binarioConfig.style.display = 'flex';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  if (setKey === 'personal') {
    lessonSubtitle.textContent = 'Paste words and press START';
    personalConfig.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    container.appendChild(emptyState);
    return;
  }
  const items = dataSets[setKey];
  lessonSubtitle.textContent = items ? items.length + ' items' : '';
  if (!items || items.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'none';
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
    } else if (currentSet === 'deck') {
      fadeOutAndNextDeck();
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

function fadeOutAndNextDeck() {
  const card = container.querySelector('.card');
  if (card) card.classList.remove('visible');
  setTimeout(() => {
    if (isPaused) return;
    currentIndex++;
    showDeckCard();
    scheduleNext();
  }, 350);
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

function generateNumbers() {
  const count = parseInt(numCount.value) || 2;
  const from = parseInt(numFrom.value) || 0;
  const to = parseInt(numTo.value) || 100;
  const clampedCount = Math.min(count, 50);
  const digits = [];
  for (let i = 0; i < clampedCount; i++) {
    const n = Math.floor(Math.random() * (to - from + 1)) + from;
    digits.push(String(n));
  }
  const groups = [];
  for (let i = 0; i < digits.length; i += 2) {
    groups.push(digits.slice(i, i + 2).join(''));
  }
  return groups.join(' ');
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
  lessonSubtitle.textContent = count + ' words';
}

function generateDeckCards() {
  const count = parseInt(deckCount.value) || 1;
  const clampedCount = Math.min(count, 52);
  const allCards = [...dataSets['deck']];
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }
  return allCards.slice(0, clampedCount);
}

function showDeckCard() {
  const cards = generateDeckCards();
  const tops = cards.map(c => c.top).join('  ');
  const bottoms = cards.map(c => c.bottom).join('  ');
  container.innerHTML = '';
  container.appendChild(emptyState);
  emptyState.style.display = 'none';
  const card = document.createElement('div');
  card.className = 'card';

  const label = document.createElement('div');
  label.className = 'card-label';
  label.textContent = 'DECK';

  const top = document.createElement('div');
  top.className = 'card-top';
  top.textContent = tops;

  const bottom = document.createElement('div');
  bottom.className = 'card-bottom';
  bottom.textContent = bottoms;

  card.appendChild(label);
  card.appendChild(top);
  card.appendChild(bottom);
  container.appendChild(card);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.classList.add('visible');
    });
  });
}

function generateBinario() {
  const count = parseInt(binCount.value) || 5;
  const clampedCount = Math.min(count, 50);
  const digits = [];
  for (let i = 0; i < clampedCount; i++) {
    digits.push(Math.random() < 0.5 ? '0' : '1');
  }
  const groups = [];
  for (let i = 0; i < digits.length; i += 2) {
    groups.push(digits.slice(i, i + 2).join(''));
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
  label.textContent = 'BINARY';

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
      deckConfig.style.display = 'none';
      personalConfig.style.display = 'none';
      instructionsTable.style.display = 'none';
      lessonTitle.textContent = 'Select a group';
      lessonSubtitle.textContent = 'to start memorizing';
      container.innerHTML = '';
      emptyState.style.display = 'none';
      container.appendChild(emptyState);
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
      return;
    }
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectSet(setKey);
    sessionStorage.setItem('sparrowGame', setKey);
    sessionStorage.setItem('sparrowRecall', isRecall);
    sessionStorage.setItem('sparrowShuffle', isShuffle);
    sessionStorage.setItem('sparrowPersonalMode', personalMode);
    sessionStorage.setItem('sparrowTimerMin', personalMinutes);
    sessionStorage.setItem('sparrowTimerSec', personalSeconds);
  });
});

const savedGame = sessionStorage.getItem('sparrowGame') || '1-100';
const savedRecall = sessionStorage.getItem('sparrowRecall');
const savedShuffle = sessionStorage.getItem('sparrowShuffle');
const savedPersonalMode = sessionStorage.getItem('sparrowPersonalMode');
const savedTimerMin = sessionStorage.getItem('sparrowTimerMin');
const savedTimerSec = sessionStorage.getItem('sparrowTimerSec');

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

try {
  selectSet(savedGame);
  document.querySelectorAll('.cat-pill').forEach(b => {
    b.classList.toggle('active', b.dataset.set === savedGame);
  });
} catch (e) {
  currentSet = '1-100';
  selectSet('1-100');
}
updateSpeedFill();
