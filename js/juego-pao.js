(function () {
  'use strict';

  const LS_PAO_LISTS = 'sparrowPAOLists';
  const LS_PAO_STATS = 'sparrowPAOStats';

  const DEFAULT_LISTS = {
    personas: ['Homero', 'Batman', 'Einstein', 'Messi', 'Drácula', 'Abuela', 'Hulk', 'Sherlock', 'Elvis', 'Frankenstein'],
    acciones: ['corriendo', 'saltando', 'nadando', 'bailando', 'volando', 'cocinando', 'rompiendo', 'escribiendo', 'cantando', 'durmiendo'],
    objetos: ['pelota', 'espada', 'libro', 'guitarra', 'reloj', 'sartén', 'martillo', 'lupa', 'micrófono', 'almohada']
  };

  var lists = DEFAULT_LISTS;
  var stats = { total: 0, aciertos: 0, racha: 0, mejorRacha: 0 };
  var numero = 0;
  var fase = 'pregunta';
  var respuesta = '';
  var acierto = null;
  var editando = false;

  var rootEl = null;
  var escenaEl = null;
  var inputEl = null;
  var feedbackEl = null;
  var statsEl = null;
  var editPanelEl = null;

  function loadState() {
    try {
      var l = localStorage.getItem(LS_PAO_LISTS);
      if (l) lists = JSON.parse(l);
      var s = localStorage.getItem(LS_PAO_STATS);
      if (s) stats = JSON.parse(s);
    } catch (e) {}
  }

  function saveLists() {
    try { localStorage.setItem(LS_PAO_LISTS, JSON.stringify(lists)); } catch (e) {}
  }

  function saveStats() {
    try { localStorage.setItem(LS_PAO_STATS, JSON.stringify(stats)); } catch (e) {}
  }

  function randomNumero() {
    return Math.floor(Math.random() * 1000);
  }

  function decodificar(num) {
    var s = String(num).padStart(3, '0');
    return {
      digitos: s,
      persona: lists.personas[+s[0]],
      accion: lists.acciones[+s[1]],
      objeto: lists.objetos[+s[2]]
    };
  }

  function nuevaRonda() {
    numero = randomNumero();
    respuesta = '';
    acierto = null;
    fase = 'pregunta';
    renderFase();
    if (inputEl) inputEl.focus();
  }

  function enviarRespuesta() {
    if (fase !== 'pregunta' || respuesta.length === 0) return;
    var escena = decodificar(numero);
    var correcto = respuesta.padStart(3, '0') === escena.digitos;
    acierto = correcto;
    stats.total++;
    if (correcto) {
      stats.aciertos++;
      stats.racha++;
    } else {
      stats.racha = 0;
    }
    stats.mejorRacha = Math.max(stats.mejorRacha, stats.racha);
    saveStats();
    fase = 'feedback';
    renderFase();
  }

  function renderFase() {
    var escena = decodificar(numero);
    if (escenaEl) {
      escenaEl.innerHTML =
        '<div class="pao-word pao-persona">' + escapeHtml(escena.persona) + '</div>' +
        '<div class="pao-word pao-accion">' + escapeHtml(escena.accion) + '</div>' +
        '<div class="pao-word pao-objeto">' + escapeHtml(escena.objeto) + '</div>';
    }
    if (fase === 'pregunta') {
      if (feedbackEl) feedbackEl.innerHTML = '';
      if (inputEl) inputEl.style.display = '';
      if (inputEl) inputEl.value = respuesta;
      if (inputEl) inputEl.focus();
    } else {
      if (inputEl) inputEl.style.display = 'none';
      if (feedbackEl) {
        feedbackEl.innerHTML =
          '<div class="pao-feedback ' + (acierto ? 'correct' : 'incorrect') + '">' + (acierto ? 'Correcto' : 'Incorrecto') + '</div>' +
          '<div class="pao-answer">Número: <strong>' + escena.digitos + '</strong>' +
          (!acierto ? ' · Tu respuesta: <strong class="pao-wrong">' + respuesta.padStart(3, '0') + '</strong>' : '') + '</div>' +
          '<button class="duo-btn pao-next-btn" id="paoNextBtn"><span class="btn-label">SIGUIENTE →</span></button>';
        var nextBtn = feedbackEl.querySelector('#paoNextBtn');
        if (nextBtn) nextBtn.addEventListener('click', nuevaRonda);
      }
    }
    renderStats();
  }

  function renderStats() {
    if (!statsEl) return;
    var precision = stats.total > 0 ? Math.round((stats.aciertos / stats.total) * 100) : 0;
    statsEl.innerHTML =
      '<div class="pao-stat"><span>' + stats.total + '</span><small>Intentos</small></div>' +
      '<div class="pao-stat"><span>' + precision + '%</span><small>Precisión</small></div>' +
      '<div class="pao-stat"><span>' + stats.racha + '</span><small>Racha</small></div>' +
      '<div class="pao-stat"><span>' + stats.mejorRacha + '</span><small>Mejor</small></div>';
  }

  function toggleEditar() {
    editando = !editando;
    if (editPanelEl) editPanelEl.style.display = editando ? 'block' : 'none';
    if (editando && editPanelEl) renderEditPanel();
  }

  function resetLists() {
    lists = JSON.parse(JSON.stringify(DEFAULT_LISTS));
    saveLists();
    if (editando && editPanelEl) renderEditPanel();
    if (inputEl) inputEl.value = '';
    if (fase === 'pregunta') nuevaRonda();
  }

  function renderEditPanel() {
    if (!editPanelEl) return;
    editPanelEl.innerHTML = '';
    var resetBtn = document.createElement('button');
    resetBtn.className = 'mode-pill pao-reset-btn';
    resetBtn.textContent = 'Restaurar default';
    resetBtn.addEventListener('click', resetLists);
    editPanelEl.appendChild(resetBtn);
    ['personas', 'acciones', 'objetos'].forEach(function (cat) {
      var wrap = document.createElement('div');
      wrap.className = 'pao-edit-cat';
      var title = document.createElement('div');
      title.className = 'pao-edit-title';
      title.textContent = cat;
      wrap.appendChild(title);
      var grid = document.createElement('div');
      grid.className = 'pao-edit-grid';
      lists[cat].forEach(function (val, i) {
        (function (c, idx) {
          var row = document.createElement('div');
          row.className = 'pao-edit-row';
          var idxEl = document.createElement('span');
          idxEl.className = 'pao-edit-idx';
          idxEl.textContent = idx;
          var inp = document.createElement('input');
          inp.className = 'personal-textarea pao-edit-input';
          inp.value = val;
          inp.addEventListener('input', function () {
            lists[c][idx] = inp.value;
            saveLists();
          });
          row.appendChild(idxEl);
          row.appendChild(inp);
          grid.appendChild(row);
        })(cat, i);
      });
      wrap.appendChild(grid);
      editPanelEl.appendChild(wrap);
    });
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
  }

  function createRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'paoModule';
    rootEl.style.display = 'none';
    rootEl.style.width = '100%';
    rootEl.style.maxWidth = '600px';
    rootEl.style.margin = '0 auto';
    rootEl.innerHTML = '' +
      '<div class="pao-header">' +
      '<div><div class="pao-brand">Sparrow · PAO</div><div class="pao-range">000–999</div></div>' +
      '<button class="mode-pill" id="paoEditBtn">Editar listas</button>' +
      '</div>' +
      '<div class="pao-stats" id="paoStats"></div>' +
      '<div class="pao-card" id="paoCard">' +
      '<div class="pao-scene" id="paoScene"></div>' +
      '<input type="text" class="pao-input" id="paoInput" placeholder="000" inputmode="numeric" autocomplete="off" maxlength="3">' +
      '<div class="pao-feedback-wrap" id="paoFeedback"></div>' +
      '</div>' +
      '<div class="pao-edit" id="paoEditPanel" style="display:none"></div>' +
      '<div class="pao-hint">Enter para confirmar y avanzar</div>';
    return rootEl;
  }

  function bindUI(root) {
    escenaEl = root.querySelector('#paoScene');
    inputEl = root.querySelector('#paoInput');
    feedbackEl = root.querySelector('#paoFeedback');
    statsEl = root.querySelector('#paoStats');
    editPanelEl = root.querySelector('#paoEditPanel');

    inputEl.addEventListener('input', function () {
      respuesta = inputEl.value.replace(/\D/g, '').slice(0, 3);
      inputEl.value = respuesta;
    });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (fase === 'pregunta') enviarRespuesta();
        else nuevaRonda();
      }
    });
    root.querySelector('#paoEditBtn').addEventListener('click', toggleEditar);
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
    editando = false;
    if (editPanelEl) editPanelEl.style.display = 'none';
    nuevaRonda();
    renderStats();
  }

  function hide() {
    if (!rootEl) return;
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
    loadState();
    var root = createRoot();
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.appendChild(root);
    bindUI(root);
    if (localStorage.getItem('sparrowGame') === 'pao') {
      show();
    }
  }

  window.PAOModule = { show: show, hide: hide, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
