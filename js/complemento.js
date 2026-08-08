(function () {
  'use strict';

  const LS_COUNT = 'sparrowSuplementoCount';

  const SYMBOLS = [
    'Ԁ', 'Ԃ', 'Ԅ', 'Ԇ', 'Ԉ', 'Ԋ', 'Ԍ', 'Ԏ',
    'Ԑ', 'Ԓ', 'Ԕ', 'Ԗ', 'Ԙ', 'Ԛ', 'Ԝ', 'Ԟ',
    'Ԡ', 'Ԣ', 'Ԥ', 'Ԧ', 'Ԩ', 'Ԫ', 'Ԭ', 'Ԯ'
  ];

  var count = 5;
  var sequence = [];
  var state = 'idle';
  var seqIdx = 0;
  var recallIdx = 0;
  var hits = 0;
  var misses = 0;
  var timeouts = [];
  var isRecallMode = false;
  var isShuffle = true;

  var rootEl = null;
  var refGridEl = null;
  var playGridEl = null;
  var countLabel = null;
  var statusEl = null;
  var scoreEl = null;
  var roundEl = null;

  function loadCount() {
    try {
      var raw = localStorage.getItem(LS_COUNT);
      if (raw !== null) count = Math.max(1, Math.min(24, parseInt(raw, 10) || 5));
    } catch (e) {}
  }

  function saveCount() {
    try { localStorage.setItem(LS_COUNT, count); } catch (e) {}
  }

  function clearTimers() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function delay(fn, ms) {
    timeouts.push(setTimeout(fn, ms));
  }

  function buildRefGrid() {
    if (!refGridEl) return;
    refGridEl.innerHTML = '';
    SYMBOLS.forEach(function (sym) {
      var cell = document.createElement('div');
      cell.className = 'supl-ref-cell';
      cell.textContent = sym;
      refGridEl.appendChild(cell);
    });
  }

  function buildPlayGrid() {
    if (!playGridEl) return;
    playGridEl.innerHTML = '';
    for (var i = 0; i < 24; i++) {
      (function (idx) {
        var cell = document.createElement('div');
        cell.className = 'supl-cell';
        cell.dataset.idx = idx;
        cell.addEventListener('click', function () { handleCellClick(idx); });
        playGridEl.appendChild(cell);
      })(i);
    }
  }

  function renderPlayGrid(symbolIdx) {
    var cells = playGridEl.children;
    for (var i = 0; i < cells.length; i++) {
      cells[i].textContent = (symbolIdx === i) ? SYMBOLS[sequence[symbolIdx]] : '';
      cells[i].classList.remove('supl-hit', 'supl-miss', 'supl-current');
    }
  }

  function clearPlayGrid() {
    var cells = playGridEl.children;
    for (var i = 0; i < cells.length; i++) {
      cells[i].textContent = '';
      cells[i].classList.remove('supl-hit', 'supl-miss', 'supl-current');
    }
  }

  function setState(s) {
    state = s;
    updatePlayButton();
  }

  function buildSequence() {
    sequence = [];
    if (isShuffle) {
      var pool = [];
      for (var i = 0; i < SYMBOLS.length; i++) pool.push(i);
      for (var i = pool.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      sequence = pool.slice(0, count);
    } else {
      for (var i = 0; i < count; i++) sequence.push(i);
    }
  }

  function startTraining() {
    clearTimers();
    buildSequence();
    seqIdx = 0;
    setState('training');
    statusEl.textContent = 'Observa la secuencia…';
    runTrainingStep();
  }

  function runTrainingStep() {
    if (state !== 'training') return;
    if (seqIdx >= sequence.length) {
      seqIdx = 0;
    }
    renderPlayGrid(seqIdx);
    delay(function () {
      clearPlayGrid();
      seqIdx++;
      delay(function () {
        runTrainingStep();
      }, getStepDelay());
    }, getShowDelay());
  }

  function getStepDelay() {
    var ms = getGlobalDelay();
    return ms > 500 ? ms * 0.4 : Math.max(120, ms * 0.6);
  }

  function getShowDelay() {
    return getGlobalDelay();
  }

  function getGlobalDelay() {
    var input = document.getElementById('speedInput');
    if (!input) return 500;
    var raw = input.value.trim();
    if (!raw) return 500;
    var v = parseFloat(raw.replace(/m.*/, '').replace(/s.*/, ''));
    if (/m/.test(raw)) return v * 60000;
    if (isNaN(v)) return 500;
    return v * 1000;
  }

  function startRecall() {
    clearTimers();
    buildSequence();
    seqIdx = 0;
    recallIdx = 0;
    hits = 0;
    misses = 0;
    updateScore();
    setState('recall-show');
    statusEl.textContent = 'Memoriza la secuencia…';
    runRecallShowStep();
  }

  function runRecallShowStep() {
    if (state !== 'recall-show') return;
    if (seqIdx >= sequence.length) {
      seqIdx = 0;
      setState('recall-input');
      statusEl.textContent = 'Haz click en la casilla donde apareció: ' + SYMBOLS[sequence[recallIdx]];
      updateScore();
      return;
    }
    renderPlayGrid(seqIdx);
    delay(function () {
      clearPlayGrid();
      seqIdx++;
      delay(function () {
        runRecallShowStep();
      }, getStepDelay());
    }, getShowDelay());
  }

  function handleCellClick(idx) {
    if (state !== 'recall-input') return;
    var cells = playGridEl.children;
    if (idx === sequence[recallIdx]) {
      cells[idx].classList.add('supl-hit');
      cells[idx].textContent = SYMBOLS[sequence[recallIdx]];
      hits++;
      recallIdx++;
      if (recallIdx >= sequence.length) {
        setState('done');
        statusEl.textContent = '¡Completado!';
        showResultModal();
        return;
      }
      statusEl.textContent = 'Haz click en la casilla donde apareció: ' + SYMBOLS[sequence[recallIdx]];
      updateScore();
    } else {
      cells[idx].classList.add('supl-miss');
      misses++;
      updateScore();
      var correctCell = cells[sequence[recallIdx]];
      correctCell.classList.add('supl-current');
      correctCell.textContent = SYMBOLS[sequence[recallIdx]];
      delay(function () {
        if (state === 'recall-input') {
          correctCell.classList.remove('supl-current');
          if (cells[idx].classList.contains('supl-miss')) {
            cells[idx].classList.remove('supl-miss');
            cells[idx].textContent = '';
          }
        }
      }, 700);
    }
  }

  function updateScore() {
    if (scoreEl) scoreEl.textContent = 'Aciertos: ' + hits + ' · Fallos: ' + misses;
  }

  function showResultModal() {
    var overlay = document.querySelector('.lectura-modal-overlay');
    if (overlay) {
      overlay.style.display = 'flex';
      var msg = overlay.querySelector('.lectura-modal-msg');
      var actions = overlay.querySelector('.lectura-modal-actions');
      if (msg) msg.innerHTML = '<strong>Ronda completada</strong><br><br><p class="lectura-summary">' +
        '<p>Aciertos: <strong>' + hits + '</strong></p>' +
        '<p>Fallos: <strong>' + misses + '</strong></p></p>';
      if (actions) {
        actions.innerHTML = '';
        var b = document.createElement('button');
        b.className = 'duo-btn';
        b.textContent = 'Reiniciar';
        b.addEventListener('click', function () {
          overlay.style.display = 'none';
          resetToConfig();
        });
        actions.appendChild(b);
      }
      return;
    }
    resetToConfig();
  }

  function resetToConfig() {
    clearTimers();
    setState('idle');
    clearPlayGrid();
    statusEl.textContent = 'Configura la cantidad y presiona COMENZAR';
    roundEl.textContent = '';
    updateScore();
  }

  function updatePlayButton() {
    var pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;
    var lbl = pauseBtn.querySelector('.btn-label');
    if (!lbl) return;
    if (state === 'idle') {
      lbl.textContent = 'COMENZAR';
      pauseBtn.classList.remove('paused');
    } else if (state === 'training') {
      lbl.textContent = 'ENTRENANDO';
      pauseBtn.classList.add('paused');
    } else if (state === 'recall-show') {
      lbl.textContent = 'MEMORIZA…';
      pauseBtn.classList.add('paused');
    } else if (state === 'recall-input') {
      lbl.textContent = 'RESPONDE';
      pauseBtn.classList.add('paused');
    } else {
      lbl.textContent = 'COMPLETADO';
      pauseBtn.classList.add('paused');
    }
  }

  function setCount(n) {
    count = Math.max(1, Math.min(24, n));
    if (countLabel) countLabel.textContent = count;
    saveCount();
  }

  function createRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'suplementoModule';
    rootEl.style.display = 'none';
    rootEl.style.width = '100%';
    rootEl.style.maxWidth = '600px';
    rootEl.style.margin = '0 auto';
    rootEl.innerHTML = '' +
      '<div class="supl-config">' +
      '<span class="supl-config-label">Cantidad</span>' +
      '<div class="supl-config-controls">' +
      '<button class="config-arrow" id="suplCountUp">▲</button>' +
      '<span class="supl-count" id="suplCount">' + count + '</span>' +
      '<button class="config-arrow" id="suplCountDown">▼</button>' +
      '</div>' +
      '</div>' +
      '<div class="supl-status" id="suplStatus">Configura la cantidad y presiona COMENZAR</div>' +
      '<div class="supl-score" id="suplScore">Aciertos: 0 · Fallos: 0</div>' +
      '<div class="supl-ref-wrap">' +
      '<div class="supl-label">Referencia</div>' +
      '<div class="supl-ref-grid" id="suplRefGrid"></div>' +
      '</div>' +
      '<div class="supl-play-wrap">' +
      '<div class="supl-label">Juego</div>' +
      '<div class="supl-play-grid" id="suplPlayGrid"></div>' +
      '</div>';
    return rootEl;
  }

  function bindUI(root) {
    refGridEl = root.querySelector('#suplRefGrid');
    playGridEl = root.querySelector('#suplPlayGrid');
    countLabel = root.querySelector('#suplCount');
    statusEl = root.querySelector('#suplStatus');
    scoreEl = root.querySelector('#suplScore');
    roundEl = root.querySelector('#suplScore');

    root.querySelector('#suplCountUp').addEventListener('click', function () { setCount(count + 1); });
    root.querySelector('#suplCountDown').addEventListener('click', function () { setCount(count - 1); });

    buildRefGrid();
    buildPlayGrid();
  }

  function show() {
    if (!rootEl) return;
    rootEl.style.display = '';
    var contentArea = document.querySelector('.content');
    var bottomControls = document.querySelector('.bottom-controls');
    var infoBar = document.querySelector('.info-bar');
    var instructTbl = document.getElementById('instructionsTable');
    var cardContainer = document.getElementById('cardContainer');
    var recallCompare = document.getElementById('recallCompare');
    var lessonHeader = document.querySelector('.lesson-header');
    if (contentArea) contentArea.classList.add('no-center');
    if (bottomControls) bottomControls.style.display = '';
    if (infoBar) infoBar.style.display = 'none';
    if (instructTbl) instructTbl.style.display = 'none';
    if (cardContainer) cardContainer.style.display = 'none';
    if (recallCompare) recallCompare.style.display = 'none';
    if (lessonHeader) lessonHeader.style.display = 'none';
    ['numbersConfig', 'binarioConfig', 'deckConfig', 'personalConfig'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    isRecallMode = document.getElementById('modeRecall') ? document.getElementById('modeRecall').classList.contains('active') : false;
    isShuffle = document.getElementById('modeAleatorio') ? document.getElementById('modeAleatorio').classList.contains('active') : true;
    resetToConfig();
  }

  function hide() {
    if (!rootEl) return;
    clearTimers();
    rootEl.style.display = 'none';
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.classList.remove('no-center');
    var bottomControls = document.querySelector('.bottom-controls');
    var infoBar = document.querySelector('.info-bar');
    if (bottomControls) bottomControls.style.display = '';
    if (infoBar) infoBar.style.display = '';
  }

  function startGame() {
    isRecallMode = document.getElementById('modeRecall') ? document.getElementById('modeRecall').classList.contains('active') : false;
    isShuffle = document.getElementById('modeAleatorio') ? document.getElementById('modeAleatorio').classList.contains('active') : true;
    if (isRecallMode) {
      startRecall();
    } else {
      startTraining();
    }
  }

  function init() {
    loadCount();
    var root = createRoot();
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.appendChild(root);
    bindUI(root);
    if (localStorage.getItem('sparrowGame') === 'suplemento') {
      show();
    }
  }

  window.SuplementoModule = { show: show, hide: hide, init: init, start: startGame, reset: resetToConfig };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
