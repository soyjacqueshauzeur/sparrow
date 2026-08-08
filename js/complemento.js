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
  var selCell = null;
  var selSymbol = null;
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
    SYMBOLS.forEach(function (sym, idx) {
      var cell = document.createElement('div');
      cell.className = 'supl-ref-cell';
      cell.dataset.idx = idx;
      cell.textContent = sym;
      cell.addEventListener('click', function () { handleRefCellClick(idx); });
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

  function renderPlayGrid(seqPos) {
    var cells = playGridEl.children;
    for (var i = 0; i < cells.length; i++) {
      cells[i].textContent = '';
      cells[i].classList.remove('supl-hit', 'supl-miss', 'supl-current');
    }
    if (seqPos >= 0 && seqPos < sequence.length) {
      var cell = sequence[seqPos].cell;
      cells[cell].textContent = SYMBOLS[sequence[seqPos].symbol];
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
    // pick `count` distinct random symbol indices
    var symPool = [];
    for (var i = 0; i < SYMBOLS.length; i++) symPool.push(i);
    for (var i = symPool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [symPool[i], symPool[j]] = [symPool[j], symPool[i]];
    }
    var chosenSymbols = symPool.slice(0, count);
    // pick `count` distinct random cell positions
    var cellPool = [];
    for (var c = 0; c < 24; c++) cellPool.push(c);
    for (var c = cellPool.length - 1; c > 0; c--) {
      var j2 = Math.floor(Math.random() * (c + 1));
      [cellPool[c], cellPool[j2]] = [cellPool[j2], cellPool[c]];
    }
    var chosenCells = cellPool.slice(0, count);
    // build ordered pairs: sequence[k] = {symbol, cell}
    for (var k = 0; k < count; k++) {
      sequence.push({ symbol: chosenSymbols[k], cell: chosenCells[k] });
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
    selCell = null;
    selSymbol = null;
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
      clearPlayGrid();
      clearRefSelection();
      statusEl.textContent = 'Selecciona la casilla donde apareció y el símbolo de referencia';
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

  function clearRefSelection() {
    selCell = null;
    selSymbol = null;
    var cells = playGridEl.children;
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.remove('supl-selected');
    }
    var refs = refGridEl.children;
    for (var r = 0; r < refs.length; r++) {
      refs[r].classList.remove('supl-selected');
    }
  }

  function handleCellClick(idx) {
    if (state !== 'recall-input') return;
    var cells = playGridEl.children;
    if (selCell === null) {
      selCell = idx;
      cells[idx].classList.add('supl-selected');
    } else {
      cells[selCell].classList.remove('supl-selected');
      selCell = idx;
      cells[idx].classList.add('supl-selected');
    }
    checkPair();
  }

  function handleRefCellClick(idx) {
    if (state !== 'recall-input') return;
    var refs = refGridEl.children;
    if (selSymbol === null) {
      selSymbol = idx;
      refs[idx].classList.add('supl-selected');
    } else {
      refs[selSymbol].classList.remove('supl-selected');
      selSymbol = idx;
      refs[idx].classList.add('supl-selected');
    }
    checkPair();
  }

  function checkPair() {
    if (selCell === null || selSymbol === null) return;
    var cells = playGridEl.children;
    var refs = refGridEl.children;
    var correctCell = sequence[recallIdx].cell;
    var correctSymbol = sequence[recallIdx].symbol;
    if (selCell === correctCell && selSymbol === correctSymbol) {
      cells[selCell].classList.remove('supl-selected');
      cells[selCell].classList.add('supl-hit');
      cells[selCell].textContent = SYMBOLS[correctSymbol];
      refs[selSymbol].classList.remove('supl-selected');
      refs[selSymbol].classList.add('supl-hit');
      hits++;
      recallIdx++;
      selCell = null;
      selSymbol = null;
      if (recallIdx >= sequence.length) {
        setState('done');
        statusEl.textContent = '¡Completado!';
        updateScore();
        showResultModal();
        return;
      }
      updateScore();
      statusEl.textContent = '¡Correcto! Siguiente símbolo.';
    } else {
      misses++;
      cells[selCell].classList.remove('supl-selected');
      cells[selCell].classList.add('supl-miss');
      refs[selSymbol].classList.remove('supl-selected');
      refs[selSymbol].classList.add('supl-miss');
      updateScore();
      statusEl.textContent = 'Incorrecto, vuelve a intentarlo.';
      var wrongCell = selCell;
      var wrongSymbol = selSymbol;
      selCell = null;
      selSymbol = null;
      delay(function () {
        if (state === 'recall-input') {
          cells[wrongCell].classList.remove('supl-miss');
          refs[wrongSymbol].classList.remove('supl-miss');
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
    if (infoBar) infoBar.style.display = '';
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
    if (bottomControls) bottomControls.style.display = '';
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
