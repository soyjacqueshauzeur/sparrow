(function () {
  'use strict';

  const LS_COUNT = 'sparrowAnimalesCount';
  const LS_REPEAT = 'sparrowAnimalesRepeat';

  const ANIMALS = [
    { emoji: '🐵', name: 'Mono (Cara)' },
    { emoji: '🦍', name: 'Gorila' },
    { emoji: '🐶', name: 'Perro (Cara)' },
    { emoji: '🐩', name: 'Caniche' },
    { emoji: '🐺', name: 'Lobo (Cara)' },
    { emoji: '🦊', name: 'Zorro (Cara)' },
    { emoji: '🦝', name: 'Mapache' },
    { emoji: '🐱', name: 'Gato (Cara)' },
    { emoji: '🐈', name: 'Gato' },
    { emoji: '🦁', name: 'León (Cara)' },
    { emoji: '🐯', name: 'Tigre (Cara)' },
    { emoji: '🐅', name: 'Tigre' },
    { emoji: '🐴', name: 'Caballo (Cara)' },
    { emoji: '🦄', name: 'Unicornio (Cara)' },
    { emoji: '🦓', name: 'Cebra' },
    { emoji: '🐮', name: 'Vaca (Cara)' },
    { emoji: '🐂', name: 'Buey' },
    { emoji: '🐃', name: 'Búfalo de Agua' },
    { emoji: '🐄', name: 'Vaca' },
    { emoji: '🐷', name: 'Cerdo (Cara)' },
    { emoji: '🐗', name: 'Jabalí' },
    { emoji: '🐽', name: 'Nariz de Cerdo' },
    { emoji: '🐑', name: 'Oveja' },
    { emoji: '🐐', name: 'Cabra' },
    { emoji: '🐪', name: 'Camello' },
    { emoji: '🦙', name: 'Llama' },
    { emoji: '🦒', name: 'Jirafa' },
    { emoji: '🐘', name: 'Elefante' },
    { emoji: '🦏', name: 'Rinoceronte' },
    { emoji: '🦛', name: 'Hipopótamo' },
    { emoji: '🐁', name: 'Ratón' },
    { emoji: '🐹', name: 'Hámster (Cara)' },
    { emoji: '🐇', name: 'Conejo' },
    { emoji: '🐿', name: 'Ardilla Listada' },
    { emoji: '🦔', name: 'Erizo' },
    { emoji: '🦇', name: 'Murciélago' },
    { emoji: '🐻', name: 'Oso (Cara)' },
    { emoji: '🐨', name: 'Koala' },
    { emoji: '🐼', name: 'Panda (Cara)' },
    { emoji: '🦘', name: 'Canguro' },
    { emoji: '🦡', name: 'Tejón' },
    { emoji: '🐾', name: 'Huellas de Pata' },
    { emoji: '🦃', name: 'Pavo' },
    { emoji: '🐔', name: 'Gallina' },
    { emoji: '🐓', name: 'Gallo' },
    { emoji: '🐣', name: 'Pollito Naciendo' },
    { emoji: '🐥', name: 'Pollito' },
    { emoji: '🐦', name: 'Pájaro' },
    { emoji: '🐧', name: 'Pingüino' },
    { emoji: '🕊', name: 'Paloma' },
    { emoji: '🦅', name: 'Águila' },
    { emoji: '🦆', name: 'Pato' },
    { emoji: '🦢', name: 'Cisne' },
    { emoji: '🦉', name: 'Búho' },
    { emoji: '🦚', name: 'Pavo Real' },
    { emoji: '🦜', name: 'Loro' },
    { emoji: '🐸', name: 'Rana (Cara)' },
    { emoji: '🐊', name: 'Cocodrilo' },
    { emoji: '🐢', name: 'Tortuga' },
    { emoji: '🦎', name: 'Lagarto' },
    { emoji: '🐍', name: 'Serpiente' },
    { emoji: '🐉', name: 'Dragón' },
    { emoji: '🦕', name: 'Saurópodo' },
    { emoji: '🦖', name: 'T-Rex' },
    { emoji: '🐳', name: 'Ballena con Chorro' },
    { emoji: '🐋', name: 'Ballena' },
    { emoji: '🐬', name: 'Delfín' },
    { emoji: '🐟', name: 'Pez' },
    { emoji: '🐠', name: 'Pez Tropical' },
    { emoji: '🐡', name: 'Pez Globo' },
    { emoji: '🦈', name: 'Tiburón' },
    { emoji: '🐙', name: 'Pulpo' },
    { emoji: '🐚', name: 'Caracola' },
    { emoji: '🐌', name: 'Caracol' },
    { emoji: '🦋', name: 'Mariposa' },
    { emoji: '🐛', name: 'Oruga' },
    { emoji: '🐜', name: 'Hormiga' },
    { emoji: '🐝', name: 'Abeja' },
    { emoji: '🐞', name: 'Mariquita' },
    { emoji: '🦗', name: 'Grillo' },
    { emoji: '🕷', name: 'Araña' },
    { emoji: '🕸', name: 'Telaraña' },
    { emoji: '🦂', name: 'Escorpión' },
    { emoji: '🦟', name: 'Mosquito' },
    { emoji: '🦠', name: 'Microbio' }
  ];

  var count = 5;
  var repeat = false;
  var pool = [];
  var sequence = [];
  var state = 'idle';
  var seqIdx = 0;
  var recallIdx = 0;
  var rounds = 0;
  var timeouts = [];
  var isShuffle = true;

  var rootEl = null;
  var seqCardEl = null;
  var seqLabelEl = null;
  var gridEl = null;
  var countLabel = null;
  var repeatBtn = null;
  var statusEl = null;
  var roundEl = null;

  function loadState() {
    try {
      var c = localStorage.getItem(LS_COUNT);
      if (c !== null) count = Math.max(1, Math.min(85, parseInt(c, 10) || 5));
      var r = localStorage.getItem(LS_REPEAT);
      if (r !== null) repeat = r === '1';
    } catch (e) {}
  }

  function saveState() {
    try {
      localStorage.setItem(LS_COUNT, count);
      localStorage.setItem(LS_REPEAT, repeat ? '1' : '0');
    } catch (e) {}
  }

  function clearTimers() {
    timeouts.forEach(clearTimeout);
    timeouts = [];
  }

  function delay(fn, ms) {
    timeouts.push(setTimeout(fn, ms));
  }

  function getSeqDelay() {
    var input = document.getElementById('speedInput');
    if (!input) return 800;
    var raw = input.value.trim();
    if (!raw) return 800;
    var v = parseFloat(raw.replace(/m.*/, '').replace(/s.*/, ''));
    if (/m/.test(raw)) return v * 60000;
    if (isNaN(v)) return 800;
    return Math.max(500, v * 1000);
  }

  function setState(s) {
    state = s;
    updatePlayButton();
  }

  function buildPool() {
    var tmp = [];
    for (var i = 0; i < ANIMALS.length; i++) tmp.push(i);
    for (var i = tmp.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      [tmp[i], tmp[j]] = [tmp[j], tmp[i]];
    }
    pool = tmp.slice(0, count);
  }

  function buildSequence() {
    sequence = pool.slice();
    if (isShuffle) {
      for (var i = sequence.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]];
      }
    }
    if (repeat && count > 1) {
      var repSeq = [];
      for (var i = 0; i < count; i++) {
        repSeq.push(sequence[Math.floor(Math.random() * sequence.length)]);
      }
      sequence = repSeq;
    }
  }

  function buildGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = '';
    pool.forEach(function (animalIdx, i) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.className = 'anim-grid-btn';
        btn.dataset.animal = animalIdx;
        btn.innerHTML = '<span class="anim-grid-emoji">' + ANIMALS[animalIdx].emoji + '</span><span class="anim-grid-name">' + ANIMALS[animalIdx].name + '</span>';
        btn.addEventListener('click', function () { handleAnimalClick(idx); });
        gridEl.appendChild(btn);
      })(i);
    });
  }

  function renderSeqCard(animalIdx) {
    if (!seqCardEl) return;
    seqCardEl.innerHTML = '<span class="anim-card-emoji">' + ANIMALS[animalIdx].emoji + '</span><span class="anim-card-name">' + ANIMALS[animalIdx].name + '</span>';
    seqCardEl.classList.add('visible');
  }

  function clearSeqCard() {
    if (!seqCardEl) return;
    seqCardEl.innerHTML = '';
    seqCardEl.classList.remove('visible');
  }

  function resetGridMarks() {
    if (!gridEl) return;
    var btns = gridEl.children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove('anim-correct', 'anim-current');
    }
  }

  function startGame() {
    clearTimers();
    isShuffle = document.getElementById('modeAleatorio') ? document.getElementById('modeAleatorio').classList.contains('active') : true;
    buildPool();
    buildSequence();
    seqIdx = 0;
    recallIdx = 0;
    rounds++;
    if (roundEl) roundEl.textContent = 'Ronda ' + rounds;
    if (gridEl) gridEl.style.display = 'none';
    clearSeqCard();
    setState('show');
    statusEl.textContent = 'Memoriza la secuencia…';
    runShowStep();
  }

  function runShowStep() {
    if (state !== 'show') return;
    if (seqIdx >= sequence.length) {
      seqIdx = 0;
      clearSeqCard();
      setState('input');
      if (gridEl) gridEl.innerHTML = '';
      buildGrid();
      if (gridEl) gridEl.style.display = '';
      markCurrent();
      statusEl.textContent = 'Haz click en el orden de la secuencia';
      return;
    }
    renderSeqCard(sequence[seqIdx]);
    delay(function () {
      clearSeqCard();
      seqIdx++;
      delay(function () {
        runShowStep();
      }, Math.max(120, getSeqDelay() * 0.4));
    }, getSeqDelay());
  }

  function markCurrent() {
    if (!gridEl) return;
    var btns = gridEl.children;
    for (var i = 0; i < btns.length; i++) {
      btns[i].classList.remove('anim-current');
    }
    if (recallIdx < sequence.length) {
      var target = sequence[recallIdx];
      for (var i = 0; i < btns.length; i++) {
        if (parseInt(btns[i].dataset.animal, 10) === target) {
          btns[i].classList.add('anim-current');
          break;
        }
      }
    }
  }

  function handleAnimalClick(poolIdx) {
    if (state !== 'input') return;
    var btn = gridEl.children[poolIdx];
    var animalIdx = parseInt(btn.dataset.animal, 10);
    if (animalIdx === sequence[recallIdx]) {
      btn.classList.add('anim-correct');
      btn.classList.remove('anim-current');
      recallIdx++;
      if (recallIdx >= sequence.length) {
        setState('done');
        statusEl.textContent = '¡Completado! Nueva ronda…';
        delay(function () {
          startGame();
        }, 900);
        return;
      }
      markCurrent();
      statusEl.textContent = '¡Correcto! Siguiente: ' + ANIMALS[sequence[recallIdx]].name;
    } else {
      btn.classList.add('anim-wrong');
      statusEl.textContent = 'Error, se reinicia…';
      var wrongBtn = btn;
      delay(function () {
        if (wrongBtn) wrongBtn.classList.remove('anim-wrong');
        startGame();
      }, 600);
    }
  }

  function updatePlayButton() {
    var pauseBtn = document.getElementById('pauseBtn');
    if (!pauseBtn) return;
    var lbl = pauseBtn.querySelector('.btn-label');
    if (!lbl) return;
    if (state === 'idle') {
      lbl.textContent = 'COMENZAR';
      pauseBtn.classList.remove('paused');
    } else if (state === 'show') {
      lbl.textContent = 'MEMORIZA…';
      pauseBtn.classList.add('paused');
    } else if (state === 'input') {
      lbl.textContent = 'RESPONDE';
      pauseBtn.classList.add('paused');
    } else {
      lbl.textContent = 'COMPLETADO';
      pauseBtn.classList.add('paused');
    }
  }

  function setCount(n) {
    count = Math.max(1, Math.min(85, n));
    if (countLabel) countLabel.value = count;
    saveState();
  }

  function toggleRepeat() {
    repeat = !repeat;
    if (repeatBtn) repeatBtn.classList.toggle('active', repeat);
    saveState();
  }

  function createRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'animalesModule';
    rootEl.style.display = 'none';
    rootEl.style.width = '100%';
    rootEl.style.maxWidth = '600px';
    rootEl.style.margin = '0 auto';
    rootEl.innerHTML = '' +
      '<div class="anim-config">' +
      '<span class="anim-config-label">Cantidad</span>' +
      '<div class="anim-config-controls">' +
      '<button class="config-arrow" id="animCountUp">▲</button>' +
      '<input type="number" class="anim-count" id="animCount" value="' + count + '" min="1" max="85" inputmode="numeric">' +
      '<button class="config-arrow" id="animCountDown">▼</button>' +
      '<button class="anim-repeat-btn" id="animRepeatBtn" title="Permitir repeticiones">∞</button>' +
      '</div>' +
      '</div>' +
      '<div class="anim-status" id="animStatus">Configura la cantidad y presiona COMENZAR</div>' +
      '<div class="anim-round" id="animRound">Ronda 0</div>' +
      '<div class="anim-card" id="animCard"></div>' +
      '<div class="anim-label">Animales</div>' +
      '<div class="anim-grid" id="animGrid"></div>';
    return rootEl;
  }

  function bindUI(root) {
    seqCardEl = root.querySelector('#animCard');
    gridEl = root.querySelector('#animGrid');
    countLabel = root.querySelector('#animCount');
    repeatBtn = root.querySelector('#animRepeatBtn');
    statusEl = root.querySelector('#animStatus');
    roundEl = root.querySelector('#animRound');

    root.querySelector('#animCountUp').addEventListener('click', function () { setCount(count + 1); });
    root.querySelector('#animCountDown').addEventListener('click', function () { setCount(count - 1); });
    countLabel.addEventListener('input', function () {
      var v = parseInt(countLabel.value, 10);
      setCount(isNaN(v) ? 1 : v);
    });
    countLabel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowUp') { e.preventDefault(); setCount(count + 1); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setCount(count - 1); }
    });
    repeatBtn.addEventListener('click', toggleRepeat);
    repeatBtn.classList.toggle('active', repeat);
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
    var modeBar = document.querySelector('.mode-bar');
    if (modeBar) modeBar.style.display = 'none';
    if (infoBar) infoBar.style.display = '';
    if (instructTbl) instructTbl.style.display = 'none';
    if (cardContainer) cardContainer.style.display = 'none';
    if (recallCompare) recallCompare.style.display = 'none';
    if (lessonHeader) lessonHeader.style.display = 'none';
    ['numbersConfig', 'binarioConfig', 'deckConfig', 'personalConfig'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    resetToConfig();
  }

  function hide() {
    if (!rootEl) return;
    clearTimers();
    rootEl.style.display = 'none';
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.classList.remove('no-center');
    var bottomControls = document.querySelector('.bottom-controls');
    var modeBar = document.querySelector('.mode-bar');
    if (bottomControls) bottomControls.style.display = '';
    if (modeBar) modeBar.style.display = '';
  }

  function resetToConfig() {
    clearTimers();
    setState('idle');
    clearSeqCard();
    resetGridMarks();
    if (gridEl) gridEl.innerHTML = '';
    if (gridEl) gridEl.style.display = 'none';
    if (roundEl) roundEl.textContent = 'Ronda 0';
    statusEl.textContent = 'Configura la cantidad y presiona COMENZAR';
  }

  function init() {
    loadState();
    var root = createRoot();
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.appendChild(root);
    bindUI(root);
    if (localStorage.getItem('sparrowGame') === 'animales') {
      show();
    }
  }

  window.AnimalesModule = { show: show, hide: hide, init: init, start: startGame, reset: resetToConfig };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
