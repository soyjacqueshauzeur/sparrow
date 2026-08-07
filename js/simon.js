(function () {
  'use strict';

  const LS_COLORS = 'sparrowSimonColors';
  const LS_SOUND = 'sparrowSimonSound';
  const LS_STATS = 'sparrowSimonStats';

  const COLORS = [
    { name: 'verde', hex: '#22c55e', freq: 440 },
    { name: 'rojo', hex: '#ef4444', freq: 493.88 },
    { name: 'azul', hex: '#3b82f6', freq: 523.25 },
    { name: 'amarillo', hex: '#eab308', freq: 587.33 },
    { name: 'blanco', hex: '#f5f5f5', freq: 659.25 },
    { name: 'negro', hex: '#18181b', freq: 698.46 },
    { name: 'gris', hex: '#9ca3af', freq: 783.99 },
    { name: 'morado', hex: '#a855f7', freq: 880 },
    { name: 'naranja', hex: '#f97316', freq: 987.77 },
    { name: 'fucsia', hex: '#ec4899', freq: 1046.5 },
    { name: 'café', hex: '#92400e', freq: 1174.66 },
    { name: 'cian', hex: '#22d3ee', freq: 1318.51 }
  ];

  const KEY_LABELS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'];

  var colorCount = 4;
  var soundOn = true;
  var sequence = [];
  var playerIdx = 0;
  var round = 0;
  var state = 'idle';
  var timeouts = [];
  var audioCtx = null;
  var stats = loadStats();

  var rootEl = null;
  var boardEl = null;
  var centerEl = null;
  var roundEl = null;
  var statusEl = null;
  var colorLabel = null;
  var playBtn = null;
  var playLbl = null;
  var soundBtn = null;
  var bestEl = null;

  function loadStats() {
    try {
      var raw = localStorage.getItem(LS_STATS);
      return raw ? JSON.parse(raw) : { best_round: 0, games_played: 0 };
    } catch (e) {
      return { best_round: 0, games_played: 0 };
    }
  }

  function saveStats() {
    try { localStorage.setItem(LS_STATS, JSON.stringify(stats)); } catch (e) {}
  }

  function clearTimers() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function delay(fn, ms) {
    timeouts.push(setTimeout(fn, ms));
  }

  function getTone(freq, dur) {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur + 0.05);
    } catch (e) {}
  }

  function errorTone() {
    if (!soundOn) return;
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = 180;
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  }

  function setState(s) {
    state = s;
    renderButtons();
  }

  function flashColor(idx) {
    if (!boardEl) return;
    var btn = boardEl.querySelector('.simon-sector[data-idx="' + idx + '"]');
    if (!btn) return;
    btn.classList.add('lit');
    getTone(COLORS[idx].freq, 0.3);
    delay(function () {
      btn.classList.remove('lit');
    }, 280);
  }

  function playSequence() {
    setState('playback');
    statusEl.textContent = 'Observa la secuencia…';
    var base = Math.max(260, 700 - (round - 1) * 25);
    sequence.forEach(function (idx, i) {
      delay(function () {
        flashColor(idx);
      }, i * base);
    });
    delay(function () {
      playerIdx = 0;
      statusEl.textContent = 'Tu turno: repite la secuencia (teclas 0-9, a, b…)';
      setState('input');
    }, sequence.length * base + 400);
  }

  function beginRound() {
    sequence.push(Math.floor(Math.random() * colorCount));
    round++;
    roundEl.textContent = 'Ronda ' + round;
    if (round > stats.best_round) {
      stats.best_round = round;
      saveStats();
      if (bestEl) bestEl.textContent = 'Récord: ' + stats.best_round;
    }
    playSequence();
  }

  function startGame() {
    clearTimers();
    sequence = [];
    playerIdx = 0;
    round = 0;
    beginRound();
  }

  function gameOver() {
    clearTimers();
    errorTone();
    if (boardEl) boardEl.classList.add('shake');
    delay(function () {
      if (boardEl) boardEl.classList.remove('shake');
    }, 500);
    stats.games_played++;
    saveStats();
    statusEl.textContent = 'Fin del juego · alcanzaste la ronda ' + round;
    setState('idle');
    playLbl.textContent = 'COMENZAR';
    playBtn.classList.remove('paused');
  }

  function handleColorClick(idx) {
    if (state !== 'input') return;
    if (idx < 0 || idx >= colorCount) return;
    flashColor(idx);
    if (idx === sequence[playerIdx]) {
      playerIdx++;
      if (playerIdx >= sequence.length) {
        statusEl.textContent = '¡Correcto!';
        delay(function () {
          if (state === 'input') beginRound();
        }, 650);
      }
    } else {
      gameOver();
    }
  }

  function setColorCount(n) {
    colorCount = Math.max(4, Math.min(COLORS.length, n));
    if (colorLabel) colorLabel.textContent = colorCount + ' colores';
    buildBoard();
    try { localStorage.setItem(LS_COLORS, colorCount); } catch (e) {}
  }

  function toggleSound() {
    soundOn = !soundOn;
    if (soundBtn) soundBtn.textContent = soundOn ? '🔊 Sonido' : '🔇 Silencio';
    try { localStorage.setItem(LS_SOUND, soundOn ? '1' : '0'); } catch (e) {}
  }

  function sectorPoints(startDeg, endDeg, radius) {
    function pt(deg) {
      var rad = (deg * Math.PI) / 180;
      return { x: 50 + radius * Math.sin(rad), y: 50 - radius * Math.cos(rad) };
    }
    var p1 = pt(startDeg);
    var p2 = pt(endDeg);
    return 'polygon(50% 50%, ' + p1.x.toFixed(3) + '% ' + p1.y.toFixed(3) + '%, ' +
      p2.x.toFixed(3) + '% ' + p2.y.toFixed(3) + '%)';
  }

  function buildBoard() {
    if (!boardEl) return;
    boardEl.querySelectorAll('.simon-sector').forEach(function (el) { el.remove(); });
    var total = colorCount;
    var sector = 360 / total;
    var radius = 48.5;
    var inset = 0.7;

    for (var i = 0; i < total; i++) {
      (function (idx) {
        var startDeg = 270 + idx * sector;
        var endDeg = startDeg + sector;
        var btn = document.createElement('button');
        btn.className = 'simon-sector';
        btn.dataset.idx = idx;
        btn.setAttribute('aria-label', COLORS[idx].name + ' (' + KEY_LABELS[idx] + ')');
        btn.style.background = COLORS[idx].hex;
        btn.style.clipPath = sectorPoints(startDeg + inset, endDeg - inset, radius);
        var lbl = document.createElement('span');
        lbl.className = 'simon-sector-key';
        lbl.textContent = KEY_LABELS[idx];
        lbl.style.color = readableText(COLORS[idx].hex);
        btn.appendChild(lbl);
        btn.addEventListener('click', function () { handleColorClick(idx); });
        btn.addEventListener('pointerdown', function (e) { e.preventDefault(); });
        boardEl.appendChild(btn);
      })(i);
    }
  }

  function renderButtons() {
    if (!playBtn) return;
    if (state === 'idle') {
      playLbl.textContent = 'COMENZAR';
      playBtn.classList.remove('paused');
    } else if (state === 'playback') {
      playLbl.textContent = 'ESPERA…';
      playBtn.classList.add('paused');
    } else if (state === 'input') {
      playLbl.textContent = 'REPETIR';
      playBtn.classList.add('paused');
    }
  }

  function readableText(hex) {
    var n = parseInt(hex.slice(1), 16);
    var r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var lum = 0.299 * r + 0.587 * g + 0.114 * b;
    return lum > 150 ? '#111113' : '#FFFFFF';
  }

  function createRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'simonModule';
    rootEl.style.display = 'none';
    rootEl.style.width = '100%';
    rootEl.style.maxWidth = '600px';
    rootEl.style.margin = '0 auto';
    rootEl.innerHTML = '' +
      '<div class="simon-top-row">' +
      '<div class="simon-colors-config">' +
      '<span class="simon-config-label">Colores</span>' +
      '<div class="simon-config-controls">' +
      '<button class="config-arrow" id="simonColorUp">▲</button>' +
      '<span class="simon-color-count" id="simonColorCount">' + colorCount + ' colores</span>' +
      '<button class="config-arrow" id="simonColorDown">▼</button>' +
      '</div>' +
      '</div>' +
      '<button class="mode-pill" id="simonSoundBtn">' + (soundOn ? '🔊 Sonido' : '🔇 Silencio') + '</button>' +
      '</div>' +
      '<div class="simon-board" id="simonBoard">' +
      '<div class="center-circle">' +
      '<div class="center-logo">simon</div>' +
      '<div class="center-round" id="simonRound">Ronda 0</div>' +
      '<div class="center-best" id="simonBest">Récord: ' + stats.best_round + '</div>' +
      '<div class="speaker-grille"></div>' +
      '</div>' +
      '</div>' +
      '<div class="simon-status" id="simonStatus">Elige la cantidad de colores y presiona COMENZAR</div>' +
      '<div class="lectura-btn-row">' +
      '<button class="duo-btn simon-play-btn" id="simonPlayBtn">' +
      '<svg id="simonPlayIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
      '<span class="btn-label" id="simonPlayLabel">COMENZAR</span>' +
      '</button>' +
      '<button class="duo-btn lectura-stop-btn" id="simonClearBtn">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>' +
      '<span class="btn-label">LIMPIAR</span>' +
      '</button>' +
      '</div>';
    return rootEl;
  }

  function bindUI(root) {
    boardEl = root.querySelector('#simonBoard');
    roundEl = root.querySelector('#simonRound');
    statusEl = root.querySelector('#simonStatus');
    colorLabel = root.querySelector('#simonColorCount');
    bestEl = root.querySelector('#simonBest');
    playBtn = root.querySelector('#simonPlayBtn');
    playLbl = root.querySelector('#simonPlayLabel');
    soundBtn = root.querySelector('#simonSoundBtn');

    root.querySelector('#simonColorUp').addEventListener('click', function () { setColorCount(colorCount + 1); });
    root.querySelector('#simonColorDown').addEventListener('click', function () { setColorCount(colorCount - 1); });
    soundBtn.addEventListener('click', toggleSound);

    playBtn.addEventListener('click', function () {
      if (state === 'idle') {
        startGame();
      }
    });
    root.querySelector('#simonClearBtn').addEventListener('click', function () {
      clearTimers();
      sequence = [];
      playerIdx = 0;
      round = 0;
      statusEl.textContent = 'Elige la cantidad de colores y presiona COMENZAR';
      roundEl.textContent = 'Ronda 0';
      setState('idle');
      playLbl.textContent = 'COMENZAR';
      playBtn.classList.remove('paused');
    });
  }

  function keyToIndex(key) {
    if (/^[0-9]$/.test(key)) return parseInt(key, 10);
    var lower = key.toLowerCase();
    var idx = KEY_LABELS.indexOf(lower);
    return idx;
  }

  function handleKeyDown(e) {
    if (!rootEl || rootEl.style.display === 'none') return;
    var active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    if (e.key === 'Enter') {
      if (state === 'idle') startGame();
      return;
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (state === 'idle') startGame();
      return;
    }
    var idx = keyToIndex(e.key);
    if (idx >= 0 && idx < colorCount) {
      e.preventDefault();
      handleColorClick(idx);
    }
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
    if (bottomControls) bottomControls.style.display = 'none';
    if (infoBar) infoBar.style.display = 'none';
    if (instructTbl) instructTbl.style.display = 'none';
    if (cardContainer) cardContainer.style.display = 'none';
    if (recallCompare) recallCompare.style.display = 'none';
    if (lessonHeader) lessonHeader.style.display = 'none';
    ['numbersConfig', 'binarioConfig', 'deckConfig', 'personalConfig'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    buildBoard();
  }

  function hide() {
    if (!rootEl) return;
    clearTimers();
    rootEl.style.display = 'none';
    var contentArea = document.querySelector('.content');
    var bottomControls = document.querySelector('.bottom-controls');
    var infoBar = document.querySelector('.info-bar');
    var cardContainer = document.getElementById('cardContainer');
    var recallCompare = document.getElementById('recallCompare');
    var lessonHeader = document.querySelector('.lesson-header');
    if (contentArea) contentArea.classList.remove('no-center');
    if (bottomControls) bottomControls.style.display = '';
    if (infoBar) infoBar.style.display = '';
    if (cardContainer) cardContainer.style.display = '';
    if (recallCompare) recallCompare.style.display = 'none';
    if (lessonHeader) lessonHeader.style.display = '';
  }

  function init() {
    var c = localStorage.getItem(LS_COLORS);
    if (c !== null) colorCount = Math.max(4, Math.min(COLORS.length, parseInt(c) || 4));
    var s = localStorage.getItem(LS_SOUND);
    if (s !== null) soundOn = s === '1';
    var root = createRoot();
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.appendChild(root);
    bindUI(root);
    document.addEventListener('keydown', handleKeyDown);
    if (localStorage.getItem('sparrowGame') === 'simon') {
      show();
    }
  }

  window.SimonModule = { show: show, hide: hide, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
