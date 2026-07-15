(function () {
  'use strict';

  const LS_SESSION = 'sparrowLecturaState';
  const LS_BOOKMARKS = 'sparrowLecturaBookmarks';
  const LS_HISTORY = 'sparrowLecturaHistory';
  const LS_STATS = 'sparrowLecturaStats';
  const MAX_STORAGE_TEXT = 2 * 1024 * 1024;
  const HISTORY_MAX = 50;
  const PROXY_URL_1 = 'https://api.allorigins.win/get?url=';
  const PROXY_URL_2 = 'https://corsproxy.io/?';

  var words = [];
  var currentWordIndex = 0;
  var isReading = false;
  var isPaused = false;
  var currentWpm = 300;
  var currentFontSize = 38;
  var currentFileName = '';
  var bookmarks = [];
  var readingHistory = [];
  var readingStats = getDefaultStats();
  var chapters = [];
  var summaryMode = false;
  var summaryParagraphs = [];
  var wakeLock = null;
  var readTimeout = null;
  var lastShowTime = 0;
  var totalReadTimeMs = 0;
  var readStartTime = null;

  var rootEl = null;
  var displayEl = null;
  var displayLabel = null;
  var displayIndex = null;
  var speedInput = null;
  var speedFill = null;
  var fontUp = null;
  var fontDown = null;
  var progressBar = null;
  var progressLabel = null;
  var timerLabel = null;
  var playBtn = null;
  var playLbl = null;
  var playIco = null;
  var stopBtn = null;
  var bmBtn = null;
  var summaryBtn = null;
  var previewBtn = null;
  var exportBtn = null;
  var navPrev10 = null;
  var navPrev1 = null;
  var navNext1 = null;
  var navNext10 = null;
  var textAreaWrap = null;
  var textArea = null;
  var textToggleBtn = null;
  var sourceBar = null;
  var panelOverlay = null;
  var panels = {};
  var panelTabs = [];
  var modalOverlay = null;
  var modalMsg = null;
  var modalActions = null;
  var resumeModal = null;
  var speedTimerRow = null;
  var speedInputRow = null;
  var speedBarRow = null;
  var speedLimitsRow = null;
  var speedUnitEl = null;

  function getDefaultStats() {
    return {
      total_words_read: 0,
      total_reading_time: 0,
      sessions_count: 0,
      avg_wpm: 0,
      wpm_history: []
    };
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  // ===================== PERSISTENCIA =====================
  function saveSessionState() {
    if (!words.length) { return; }
    var lastIdx = Math.max(0, isReading ? Math.max(0, currentWordIndex - 1) : currentWordIndex);
    var state = { lastWordIndex: lastIdx, wpm: currentWpm, fontSize: currentFontSize, fileName: currentFileName };
    var fullText = words.map(function (w) { return w[0]; }).join(' ');
    if (fullText.length <= MAX_STORAGE_TEXT) {
      state.text = fullText;
    } else {
      state.text = null;
      state.textTooLarge = true;
    }
    try { localStorage.setItem(LS_SESSION, JSON.stringify(state)); } catch (e) {}
  }

  function loadSessionState() {
    try {
      var raw = localStorage.getItem(LS_SESSION);
      if (!raw) return null;
      var state = JSON.parse(raw);
      if (!state.text) return state;
      var loadedWords = preprocessText(state.text);
      state.words = loadedWords;
      return state;
    } catch (e) { return null; }
  }

  function clearSessionState() { localStorage.removeItem(LS_SESSION); }

  function saveBookmarks() {
    try { localStorage.setItem(LS_BOOKMARKS, JSON.stringify(bookmarks)); } catch (e) {}
  }

  function loadBookmarks() {
    try {
      var raw = localStorage.getItem(LS_BOOKMARKS);
      bookmarks = raw ? JSON.parse(raw) : [];
    } catch (e) { bookmarks = []; }
  }

  function saveHistory() {
    try { localStorage.setItem(LS_HISTORY, JSON.stringify(readingHistory)); } catch (e) {}
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(LS_HISTORY);
      readingHistory = raw ? JSON.parse(raw) : [];
    } catch (e) { readingHistory = []; }
  }

  function saveStats() {
    try { localStorage.setItem(LS_STATS, JSON.stringify(readingStats)); } catch (e) {}
  }

  function loadStats() {
    try {
      var raw = localStorage.getItem(LS_STATS);
      readingStats = raw ? JSON.parse(raw) : getDefaultStats();
    } catch (e) { readingStats = getDefaultStats(); }
  }

  // ===================== UTILIDADES =====================
  function preprocessText(text) {
    var result = [];
    var cleaned = text.replace(/\r/g, '');
    var regex = /\S+/g;
    var match;
    while ((match = regex.exec(cleaned)) !== null) {
      result.push([match[0], match.index, regex.lastIndex]);
    }
    return result;
  }

  function calculateDelay(wpm) { return Math.max(10, 60000 / wpm); }

  function getWordsText() { return words.map(function (w) { return w[0]; }).join(' '); }

  function getWordAtIndex(idx) { return idx >= 0 && idx < words.length ? words[idx][0] : ''; }

  function now() { return Date.now(); }

  // ===================== PROGRESO Y TIMER =====================
  function updateProgress() {
    if (!progressBar || !progressLabel) return;
    var total = words.length;
    if (total === 0) {
      progressBar.style.width = '0%';
      progressLabel.textContent = '0%';
      progressBar.style.background = '#58CC02';
      return;
    }
    var completed = Math.max(0, isReading ? Math.max(0, currentWordIndex - 1) : currentWordIndex);
    var pct = Math.min(100, Math.floor((completed / total) * 100));
    progressBar.style.width = pct + '%';
    progressLabel.textContent = pct + '%';
    if (pct < 33) progressBar.style.background = '#58CC02';
    else if (pct < 66) progressBar.style.background = '#FFC800';
    else progressBar.style.background = '#1CB0F6';
  }

  function updateTimer() {
    if (!timerLabel) return;
    var total = words.length;
    var wpm = currentWpm;
    if (total === 0 || wpm === 0) { timerLabel.textContent = '00:00:00'; return; }
    var remaining = Math.max(0, total - currentWordIndex);
    var secs = Math.floor((remaining / wpm) * 60);
    timerLabel.textContent = pad2(Math.floor(secs / 3600)) + ':' + pad2(Math.floor((secs % 3600) / 60)) + ':' + pad2(secs % 60);
  }

  function progressBarTap(e) {
    if (!words.length) return;
    var rect = progressBar.parentElement.getBoundingClientRect();
    var pct = (e.clientX - rect.left) / rect.width;
    currentWordIndex = Math.max(0, Math.min(words.length - 1, Math.floor(pct * words.length)));
    updateProgress();
    updateTimer();
    if (displayEl) displayEl.textContent = getWordAtIndex(currentWordIndex);
    highlightInTextArea();
  }

  // ===================== DISPLAY =====================
  function updateDisplayFont() {
    if (displayEl) displayEl.style.fontSize = currentFontSize + 'px';
  }

  function updateBtnStates() {
    if (!playIco || !playLbl) return;
    if (!isReading && !isPaused) {
      playIco.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      playLbl.textContent = 'COMENZAR';
      playBtn.classList.remove('paused');
      if (bmBtn) bmBtn.style.display = 'none';
      if (navPrev1) navPrev1.style.display = 'none';
      if (navPrev10) navPrev10.style.display = 'none';
      if (navNext1) navNext1.style.display = 'none';
      if (navNext10) navNext10.style.display = 'none';
      var card = rootEl.querySelector('.lectura-card');
      if (card) { card.style.cursor = 'pointer'; card.title = 'Tap para comenzar'; }
    } else if (isPaused) {
      playIco.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
      playLbl.textContent = 'REANUDAR';
      playBtn.classList.add('paused');
      if (bmBtn) bmBtn.style.display = '';
      if (navPrev1) navPrev1.style.display = '';
      if (navPrev10) navPrev10.style.display = '';
      if (navNext1) navNext1.style.display = '';
      if (navNext10) navNext10.style.display = '';
      var card2 = rootEl.querySelector('.lectura-card');
      if (card2) { card2.style.cursor = 'pointer'; card2.title = 'Tap para continuar'; }
    } else {
      playIco.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      playLbl.textContent = 'PAUSAR';
      playBtn.classList.remove('paused');
      if (bmBtn) bmBtn.style.display = '';
      if (navPrev1) navPrev1.style.display = 'none';
      if (navPrev10) navPrev10.style.display = 'none';
      if (navNext1) navNext1.style.display = 'none';
      if (navNext10) navNext10.style.display = 'none';
      var card3 = rootEl.querySelector('.lectura-card');
      if (card3) { card3.style.cursor = 'pointer'; card3.title = 'Tap para pausar'; }
    }
  }

  // ===================== TIMER DE LECTURA =====================
  var readingTimerInterval = null;

  function startReadingTimer() {
    if (readingTimerInterval) clearInterval(readingTimerInterval);
    readStartTime = now();
    readingTimerInterval = setInterval(function () {
      if (isReading && !isPaused && readStartTime) {
        var elapsed = now() - readStartTime;
        totalReadTimeMs += elapsed;
        readStartTime = now();
      }
    }, 1000);
  }

  function stopReadingTimer() {
    if (readingTimerInterval) { clearInterval(readingTimerInterval); readingTimerInterval = null; }
    if (isReading && !isPaused && readStartTime) {
      totalReadTimeMs += now() - readStartTime;
    }
    readStartTime = null;
  }

  function resetReadingTimer() {
    stopReadingTimer();
    totalReadTimeMs = 0;
  }

  function getReadingTimeSeconds() { return Math.floor(totalReadTimeMs / 1000); }

  // ===================== RSVP ENGINE =====================
  function showNextWord() {
    if (!isReading || currentWordIndex >= words.length) {
      finishReading();
      return;
    }
    if (displayEl) {
      displayEl.textContent = words[currentWordIndex][0];
    }
    highlightInTextArea();
    if (displayIndex) displayIndex.textContent = (currentWordIndex + 1) + '/' + words.length;
    currentWordIndex++;
    updateProgress();
    updateTimer();
    scheduleNext();
  }

  function scheduleNext() {
    if (readTimeout) clearTimeout(readTimeout);
    if (!isReading || isPaused) return;
    var delay = calculateDelay(currentWpm);
    readTimeout = setTimeout(showNextWord, delay);
  }

  function toggleReading() {
    if (!words.length) {
      showModal('Sin texto', 'Pega texto, abre un archivo o carga una URL para empezar.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
      return;
    }
    if (!isReading) {
      if (currentWordIndex >= words.length) currentWordIndex = 0;
      isReading = true;
      isPaused = false;
      startReadingTimer();
      updateBtnStates();
      if (displayEl) showNextWord();
      else scheduleNext();
      requestWakeLock();
    } else if (isPaused) {
      isPaused = false;
      startReadingTimer();
      updateBtnStates();
      scheduleNext();
    } else {
      isPaused = true;
      stopReadingTimer();
      clearReadTimeout();
      updateBtnStates();
      releaseWakeLock();
    }
  }

  function stopReading(reset) {
    clearReadTimeout();
    stopReadingTimer();
    isReading = false;
    isPaused = false;
    releaseWakeLock();
    if (reset) {
      currentWordIndex = 0;
      words = [];
      totalReadTimeMs = 0;
      clearSessionState();
      if (displayEl) displayEl.textContent = 'Lectura';
      if (displayLabel) displayLabel.textContent = 'LECTURA';
      if (displayIndex) displayIndex.textContent = '';
      updateProgress();
      updateTimer();
      updateBtnStates();
      clearTextAreaHighlight();
      if (textAreaWrap) textAreaWrap.style.display = 'none';
      if (textToggleBtn) textToggleBtn.textContent = 'Mostrar texto';
    } else {
      if (displayEl) displayEl.textContent = 'Detenido';
      updateBtnStates();
    }
    saveSessionState();
  }

  function finishReading() {
    clearReadTimeout();
    stopReadingTimer();
    isReading = false;
    isPaused = false;
    releaseWakeLock();
    updateBtnStates();
    updateProgress();
    updateTimer();
    clearSessionState();
    var wordsRead = currentWordIndex;
    var timeSpent = getReadingTimeSeconds();
    var avgWpm = timeSpent > 0 ? Math.round((wordsRead / timeSpent) * 60) : currentWpm;
    _updateStats(wordsRead, avgWpm, timeSpent);
    if (currentFileName) {
      _addToHistory(currentFileName, wordsRead, avgWpm);
    }
    showModal(
      '¡Lectura completada!',
      '<div class="lectura-summary">' +
      '<p>Palabras: <strong>' + wordsRead + '</strong></p>' +
      '<p>Tiempo: <strong>' + formatTime(timeSpent) + '</strong></p>' +
      '<p>Velocidad: <strong>' + avgWpm + ' PPM</strong></p>' +
      '</div>',
      [
        { text: 'Reiniciar', cls: 'duo-btn', action: function () { closeModal(); stopReading(true); } }
      ]
    );
  }

  function clearReadTimeout() {
    if (readTimeout) { clearTimeout(readTimeout); readTimeout = null; }
  }

  function formatTime(secs) {
    return pad2(Math.floor(secs / 3600)) + ':' + pad2(Math.floor((secs % 3600) / 60)) + ':' + pad2(secs % 60);
  }

  // ===================== WPM / FUENTE =====================
  function setWpm(wpm) {
    currentWpm = Math.max(100, Math.min(2500, wpm));
    if (speedInput) speedInput.value = currentWpm;
    updateSpeedFill();
    updateTimer();
    if (isReading && !isPaused) {
      clearReadTimeout();
      scheduleNext();
    }
  }

  function updateSpeedFill() {
    if (!speedFill) return;
    var logMin = Math.log(100);
    var logMax = Math.log(2500);
    var pct = (Math.log(currentWpm) - logMin) / (logMax - logMin) * 100;
    speedFill.style.width = Math.max(5, Math.min(100, pct)) + '%';
  }

  function adjustWpm(up) {
    setWpm(currentWpm + (up ? 50 : -50));
  }

  function adjustFont(up) {
    currentFontSize = Math.max(16, Math.min(144, currentFontSize + (up ? 4 : -4)));
    updateDisplayFont();
  }

  // ===================== NAVEGACIÓN MANUAL =====================
  function navWords(delta) {
    if (!words.length) return;
    currentWordIndex = Math.max(0, Math.min(words.length - 1, currentWordIndex + delta));
    updateProgress();
    updateTimer();
    if (displayEl) displayEl.textContent = getWordAtIndex(currentWordIndex);
    if (displayIndex) displayIndex.textContent = (currentWordIndex + 1) + '/' + words.length;
    highlightInTextArea();
  }

  // ===================== TEXTO COMPLETO CON RESALTADO =====================
  function toggleTextArea() {
    if (!textAreaWrap) return;
    var visible = textAreaWrap.style.display !== 'none';
    if (visible) {
      textAreaWrap.style.display = 'none';
      if (textToggleBtn) textToggleBtn.textContent = 'Mostrar texto';
    } else {
      textAreaWrap.style.display = 'block';
      if (textToggleBtn) textToggleBtn.textContent = 'Ocultar texto';
      if (textArea && words.length) {
        textArea.value = getWordsText();
        highlightInTextArea();
      }
    }
  }

  function highlightInTextArea() {
    if (!textArea || textAreaWrap.style.display === 'none') return;
    var idx = Math.max(0, isReading ? Math.max(0, currentWordIndex - 1) : currentWordIndex);
    if (idx >= words.length || idx < 0) return;
    var fullText = getWordsText();
    textArea.value = fullText;
    var pos = 0;
    for (var i = 0; i < words.length; i++) {
      var w = words[i][0];
      var start = fullText.indexOf(w, pos);
      if (i === idx && start !== -1) {
        textArea.focus();
        textArea.setSelectionRange(start, start + w.length);
        return;
      }
      if (start !== -1) pos = start + w.length;
    }
  }

  function clearTextAreaHighlight() {
    if (textArea) { textArea.value = ''; textArea.setSelectionRange(0, 0); }
  }

  // ===================== ESTADÍSTICAS =====================
  function _updateStats(wordsRead, wpm, timeSpent) {
    readingStats.total_words_read += wordsRead;
    readingStats.total_reading_time += timeSpent;
    readingStats.sessions_count++;
    readingStats.wpm_history.push(wpm);
    if (readingStats.wpm_history.length > 100) readingStats.wpm_history = readingStats.wpm_history.slice(-100);
    if (readingStats.wpm_history.length) {
      var sum = 0;
      readingStats.wpm_history.forEach(function (v) { sum += v; });
      readingStats.avg_wpm = Math.round(sum / readingStats.wpm_history.length);
      }
    saveStats();
    updateStatsPanel();
  }

  function updateStatsPanel() {
    var el = panels['estadisticas'];
    if (!el) return;
    var s = readingStats;
    var h = Math.floor(s.total_reading_time / 3600);
    var m = Math.floor((s.total_reading_time % 3600) / 60);
    el.innerHTML = '' +
      '<div class="lectura-stats-grid">' +
      '<div class="lectura-stat"><span class="lectura-stat-num">' + s.sessions_count + '</span><span class="lectura-stat-lbl">Sesiones</span></div>' +
      '<div class="lectura-stat"><span class="lectura-stat-num">' + s.total_words_read + '</span><span class="lectura-stat-lbl">Palabras</span></div>' +
      '<div class="lectura-stat"><span class="lectura-stat-num">' + h + 'h ' + m + 'm</span><span class="lectura-stat-lbl">Tiempo</span></div>' +
      '<div class="lectura-stat"><span class="lectura-stat-num">' + s.avg_wpm + '</span><span class="lectura-stat-lbl">PPM promedio</span></div>' +
      '</div>';
  }

  // ===================== HISTORIAL =====================
  function _addToHistory(filename, wordsRead, wpm) {
    readingHistory.unshift({
      filename: filename,
      words_read: wordsRead,
      wpm: wpm,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });
    if (readingHistory.length > HISTORY_MAX) readingHistory = readingHistory.slice(0, HISTORY_MAX);
    saveHistory();
    updateHistoryPanel();
  }

  function updateHistoryPanel() {
    var el = panels['historial'];
    if (!el) return;
    var html = '';
    readingHistory.forEach(function (entry, i) {
      html += '<div class="lectura-panel-item" data-idx="' + i + '">' +
        '<span class="lectura-item-main">' + escapeHtml(entry.filename) + '</span>' +
        '<span class="lectura-item-sub">' + entry.words_read + ' palabras | ' + entry.wpm + ' PPM | ' + entry.timestamp + '</span>' +
        '<button class="lectura-item-del" data-idx="' + i + '">×</button></div>';
    });
    el.innerHTML = html || '<div class="lectura-panel-empty">Sin historial</div>';
    el.querySelectorAll('.lectura-item-del').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        deleteHistoryItem(parseInt(btn.dataset.idx));
      });
    });
  }

  function deleteHistoryItem(index) {
    showModal('Confirmar', '¿Eliminar esta entrada del historial?', [
      { text: 'Cancelar', cls: 'mode-pill', action: closeModal },
      { text: 'Eliminar', cls: 'duo-btn', action: function () { readingHistory.splice(index, 1); saveHistory(); updateHistoryPanel(); closeModal(); } }
    ]);
  }

  function clearAllHistory() {
    showModal('Confirmar', '¿Limpiar todo el historial, marcadores y capítulos?<br>Las estadísticas NO se borrarán.', [
      { text: 'Cancelar', cls: 'mode-pill', action: closeModal },
      { text: 'Limpiar todo', cls: 'duo-btn', action: function () { readingHistory = []; bookmarks = []; chapters = []; saveHistory(); saveBookmarks(); updateHistoryPanel(); updateBookmarksPanel(); updateChaptersPanel(); closeModal(); } }
    ]);
  }

  // ===================== MARCADORES =====================
  function addBookmark() {
    if (!words.length) return;
    var idx = Math.max(0, currentWordIndex - 1);
    if (idx >= words.length) idx = words.length - 1;
    var mark = {
      word_index: idx,
      word: words[idx][0],
      label: words[idx][0],
      wpm: currentWpm,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    bookmarks.push(mark);
    saveBookmarks();
    updateBookmarksPanel();
  }

  function gotoBookmark(idx) {
    if (idx >= bookmarks.length) return;
    var target = bookmarks[idx].word_index;
    if (target >= words.length) return;
    currentWordIndex = target;
    updateProgress();
    updateTimer();
    if (displayEl) displayEl.textContent = words[target][0];
    if (displayIndex) displayIndex.textContent = (target + 1) + '/' + words.length;
    highlightInTextArea();
  }

  function deleteBookmark(idx) {
    bookmarks.splice(idx, 1);
    saveBookmarks();
    updateBookmarksPanel();
  }

  function updateBookmarksPanel() {
    var el = panels['marcadores'];
    if (!el) return;
    var html = '';
    bookmarks.forEach(function (bm, i) {
      html += '<div class="lectura-panel-item" data-idx="' + i + '">' +
        '<span class="lectura-item-main">' + escapeHtml(bm.label) + '</span>' +
        '<span class="lectura-item-sub">Palabra ' + (bm.word_index + 1) + ' | ' + bm.wpm + ' PPM</span>' +
        '<button class="lectura-item-del" data-idx="' + i + '">×</button></div>';
    });
    el.innerHTML = html || '<div class="lectura-panel-empty">Sin marcadores</div>';
    el.querySelectorAll('.lectura-panel-item').forEach(function (item) {
      item.addEventListener('click', function () { gotoBookmark(parseInt(item.dataset.idx)); });
    });
    el.querySelectorAll('.lectura-item-del').forEach(function (btn) {
      btn.addEventListener('click', function (e) { e.stopPropagation(); deleteBookmark(parseInt(btn.dataset.idx)); });
    });
  }

  // ===================== CAPÍTULOS =====================
  function detectChapters() {
    if (!words.length) return;
    chapters = [];
    var fullText = getWordsText();
    var patterns = [
      /^(capítulo|capitulo|chapter)\s+\d+/i,
      /^(parte?|part)\s+\d+/i,
      /^(sección|section)\s+\d+/i,
      /^\d+\.\s+[A-ZÁÉÍÓÚ]/,
      /^[IVXLC]+\.\s+/
    ];
    var lines = fullText.split('\n');
    var charPos = 0;
    lines.forEach(function (line, li) {
      for (var j = 0; j < patterns.length; j++) {
        if (patterns[j].test(line.trim())) {
          chapters.push({ title: line.trim().slice(0, 50), line_index: li, char_position: charPos });
          break;
        }
      }
      charPos += line.length + 1;
    });
    if (chapters.length) {
      chapters.forEach(function (ch) {
        var closestIdx = 0;
        var minDist = Infinity;
        words.forEach(function (w, wi) {
          var d = Math.abs(w[1] - ch.char_position);
          if (d < minDist) { minDist = d; closestIdx = wi; }
        });
        ch.word_index = closestIdx;
      });
    }
    updateChaptersPanel();
  }

  function gotoChapter(idx) {
    if (idx >= chapters.length) return;
    var target = chapters[idx].word_index;
    if (target >= words.length) return;
    currentWordIndex = target;
    updateProgress();
    updateTimer();
    if (displayEl) displayEl.textContent = getWordAtIndex(target);
    if (displayIndex) displayIndex.textContent = (target + 1) + '/' + words.length;
    highlightInTextArea();
  }

  function updateChaptersPanel() {
    var el = panels['capitulos'];
    if (!el) return;
    var html = '';
    chapters.forEach(function (ch, i) {
      html += '<div class="lectura-panel-item" data-idx="' + i + '">' +
        '<span class="lectura-item-main">' + escapeHtml(ch.title) + '</span></div>';
    });
    el.innerHTML = html || '<div class="lectura-panel-empty">Sin capítulos detectados</div>';
    el.querySelectorAll('.lectura-panel-item').forEach(function (item) {
      item.addEventListener('click', function () { gotoChapter(parseInt(item.dataset.idx)); });
    });
  }

  // ===================== RESUMEN =====================
  function toggleSummaryMode() {
    if (!words.length) return;
    summaryMode = !summaryMode;
    if (summaryBtn) summaryBtn.textContent = summaryMode ? 'Modo Normal' : 'Resumen';
    if (summaryMode) {
      generateSummary();
    } else {
      if (displayEl) displayEl.textContent = getWordAtIndex(Math.max(0, currentWordIndex - 1));
    }
  }

  function generateSummary() {
    var text = getWordsText();
    var paragraphs = text.split('\n\n');
    summaryParagraphs = [];
    paragraphs.forEach(function (p) {
      var lines = p.trim().split('\n');
      if (lines.length && lines[0].trim()) summaryParagraphs.push(lines[0].trim());
    });
    var summaryText = summaryParagraphs.slice(0, 20).join('\n');
    if (summaryParagraphs.length > 20) summaryText += '\n\n... y ' + (summaryParagraphs.length - 20) + ' párrafos más';
    if (displayEl) displayEl.textContent = '[RESUMEN]\n' + summaryText.slice(0, 500);
  }

  // ===================== PREVIEW =====================
  function previewDocument() {
    if (!words.length) { showModal('Sin texto', 'No hay texto cargado para previsualizar.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]); return; }
    var text = getWordsText();
    var wordCount = words.length;
    var charCount = text.length;
    var pCount = text.split('\n\n').length;
    var preview = text.slice(0, 1000);
    if (text.length > 1000) preview += '\n\n... (' + (text.length - 1000) + ' caracteres más)';
    showModal(
      'Vista Previa',
      '<div class="lectura-preview-info">Palabras: ' + wordCount + ' | Caracteres: ' + charCount + ' | Párrafos: ' + pCount + '</div>' +
      '<div class="lectura-preview-text">' + escapeHtml(preview) + '</div>',
      [{ text: 'Cerrar', cls: 'duo-btn', action: closeModal }]
    );
  }

  // ===================== EXPORTAR =====================
  function exportJSON() {
    var data = { bookmarks: bookmarks, reading_history: readingHistory, reading_stats: readingStats, export_date: new Date().toISOString() };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'sparrow_lectura_' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showModal('Exportado', 'Datos exportados correctamente.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ===================== MODALES =====================
  function ensureModal() {
    if (modalOverlay) return;
    modalOverlay = document.createElement('div');
    modalOverlay.className = 'lectura-modal-overlay';
    modalOverlay.style.display = 'none';
    modalOverlay.innerHTML = '<div class="lectura-modal-card">' +
      '<div class="lectura-modal-msg" id="lecturaModalMsg"></div>' +
      '<div class="lectura-modal-actions" id="lecturaModalActions"></div></div>';
    document.body.appendChild(modalOverlay);
    modalMsg = modalOverlay.querySelector('#lecturaModalMsg');
    modalActions = modalOverlay.querySelector('#lecturaModalActions');
    modalOverlay.addEventListener('click', function (e) { if (e.target === modalOverlay) closeModal(); });
  }

  function showModal(title, message, buttons) {
    ensureModal();
    modalMsg.innerHTML = '<strong>' + title + '</strong><br><br>' + message;
    modalActions.innerHTML = '';
    buttons.forEach(function (btn) {
      var b = document.createElement('button');
      b.className = btn.cls;
      b.textContent = btn.text;
      b.addEventListener('click', btn.action);
      modalActions.appendChild(b);
    });
    modalOverlay.style.display = 'flex';
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.style.display = 'none';
  }

  function showResumeModal(state, callback) {
    showModal(
      'Continuar sesión',
      'Hay una sesión guardada en "' + (state.fileName || 'texto') + '" (palabra ' + (state.lastWordIndex + 1) + ').<br>¿Deseas continuar?',
      [
        { text: 'No', cls: 'mode-pill', action: function () { closeModal(); callback(false); } },
        { text: 'Sí, continuar', cls: 'duo-btn', action: function () { closeModal(); callback(true); } }
      ]
    );
  }

  // ===================== PANEL (SIDEBAR MODAL) =====================
  function openPanel() {
    if (!panelOverlay) {
      panelOverlay = document.createElement('div');
      panelOverlay.className = 'lectura-panel-overlay';
      panelOverlay.innerHTML = '' +
        '<div class="lectura-panel">' +
        '<div class="lectura-panel-header"><span>Panel</span><button class="lectura-panel-close" id="lecturaPanelClose">×</button></div>' +
        '<div class="lectura-panel-tabs" id="lecturaPanelTabs">' +
        '<button class="mode-pill active" data-tab="marcadores">Marcadores</button>' +
        '<button class="mode-pill" data-tab="historial">Historial</button>' +
        '<button class="mode-pill" data-tab="capitulos">Capítulos</button>' +
        '<button class="mode-pill" data-tab="estadisticas">Estadísticas</button>' +
        '</div>' +
        '<div class="lectura-panel-content" id="lecturaPanelContent"></div>' +
        '</div>';
      document.body.appendChild(panelOverlay);
      panelOverlay.addEventListener('click', function (e) { if (e.target === panelOverlay) closePanel(); });
      panelOverlay.querySelector('#lecturaPanelClose').addEventListener('click', closePanel);
      panels['marcadores'] = document.createElement('div');
      panels['historial'] = document.createElement('div');
      panels['capitulos'] = document.createElement('div');
      panels['estadisticas'] = document.createElement('div');
      var currentTab = 'marcadores';
      var contentEl = panelOverlay.querySelector('#lecturaPanelContent');
      contentEl.appendChild(panels['marcadores']);
      panelOverlay.querySelectorAll('.lectura-panel-tabs .mode-pill').forEach(function (tab) {
        tab.addEventListener('click', function () {
          panelOverlay.querySelectorAll('.lectura-panel-tabs .mode-pill').forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          currentTab = tab.dataset.tab;
          contentEl.innerHTML = '';
          contentEl.appendChild(panels[currentTab]);
          if (currentTab === 'estadisticas') updateStatsPanel();
          if (currentTab === 'historial') updateHistoryPanel();
          if (currentTab === 'marcadores') updateBookmarksPanel();
          if (currentTab === 'capitulos') updateChaptersPanel();
        });
      });
    }
    panelOverlay.style.display = 'flex';
    updateBookmarksPanel();
    updateStatsPanel();
  }

  function closePanel() {
    if (panelOverlay) panelOverlay.style.display = 'none';
  }

  // ===================== CARGA DIFERIDA DE VENDORS =====================
  var _vendorPromise = {};

  function loadScript(src) {
    if (_vendorPromise[src]) return _vendorPromise[src];
    _vendorPromise[src] = new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return _vendorPromise[src];
  }

  function ensureEpubLib() { return loadScript('js/vendor/jszip.min.js'); }

  function ensurePdfLib() {
    if (typeof pdfjsLib !== 'undefined') return Promise.resolve();
    return loadScript('js/vendor/pdf.min.js').then(function () {
      if (typeof pdfjsLib !== 'undefined' && typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
      }
    });
  }
  function setText(sourceName, text) {
    stopReading(true);
    currentFileName = sourceName;
    words = preprocessText(text);
    currentWordIndex = 0;
    totalReadTimeMs = 0;
    updateProgress();
    updateTimer();
    updateBtnStates();
    if (displayEl) displayEl.textContent = words.length ? 'Listo (' + words.length + ' palabras)' : 'Texto vacío';
    if (displayLabel) displayLabel.textContent = 'LECTURA';
    if (displayIndex) displayIndex.textContent = words.length ? '0/' + words.length : '';
    if (textArea && textAreaWrap.style.display !== 'none') textArea.value = getWordsText();
    if (sourceName) {
      _addToHistory(sourceName, words.length, currentWpm);
    }
    detectChapters();
    clearSessionState();
  }

  function openFileDialog(fileInput) {
    fileInput.value = '';
    fileInput.click();
  }

  function loadTxtFile(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      setText(file.name, e.target.result);
    };
    reader.onerror = function () { showModal('Error', 'No se pudo leer el archivo.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]); };
    reader.readAsText(file, 'UTF-8');
  }

  function loadEpubFile(file) {
    ensureEpubLib().then(function () {
      var reader = new FileReader();
      reader.onload = function (e) {
        try {
          var zip = new JSZip();
          zip.loadAsync(e.target.result).then(function (zipData) {
            var textPromises = [];
            zipData.forEach(function (relativePath, zipEntry) {
              if (/\.x?html?$/i.test(relativePath) && !zipEntry.dir) {
                textPromises.push(zipEntry.async('string').then(function (html) {
                  var div = document.createElement('div');
                  div.innerHTML = html;
                  div.querySelectorAll('script, style, noscript, nav, footer, header').forEach(function (el) { el.remove(); });
                  return div.textContent || '';
                }));
              }
            });
            if (!textPromises.length) { showModal('Error', 'No se encontró contenido en el EPUB.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]); return; }
            Promise.all(textPromises).then(function (chunks) {
              setText(file.name, chunks.join('\n\n').replace(/[ \t]+/g, ' '));
            });
          }).catch(function (err) {
            showModal('Error', 'No se pudo procesar el EPUB: ' + err.message, [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
          });
        } catch (err) {
          showModal('Error', 'No se pudo procesar el EPUB: ' + err.message, [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
        }
      };
      reader.onerror = function () { showModal('Error', 'No se pudo leer el archivo EPUB.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]); };
      reader.readAsArrayBuffer(file);
    }).catch(function () {
      showModal('Error', 'No se pudo cargar la librería EPUB (jszip).', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
    });
  }

  function loadPdfFile(file) {
    ensurePdfLib().then(function () {
      var reader = new FileReader();
      reader.onload = function (e) {
        var typedarray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument({ data: typedarray }).promise.then(function (pdf) {
          var pages = [];
          for (var i = 1; i <= pdf.numPages; i++) {
            pages.push(i);
          }
          return Promise.all(pages.map(function (pageNum) {
            return pdf.getPage(pageNum).then(function (page) {
              return page.getTextContent().then(function (textContent) {
                return textContent.items.map(function (item) { return item.str; }).join(' ');
              });
            });
          }));
        }).then(function (pageTexts) {
          setText(file.name, pageTexts.join(' '));
        }).catch(function (err) {
          showModal('Error', 'No se pudo procesar el PDF: ' + err.message, [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
        });
      };
      reader.onerror = function () { showModal('Error', 'No se pudo leer el archivo PDF.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]); };
      reader.readAsArrayBuffer(file);
    }).catch(function () {
      showModal('Error', 'No se pudo cargar la librería PDF (pdf.js).', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
    });
  }

  function handleFileInput(fileInput) {
    var file = fileInput.files[0];
    if (!file) return;
    var ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'txt' || ext === 'log') loadTxtFile(file);
    else if (ext === 'epub') loadEpubFile(file);
    else if (ext === 'pdf') loadPdfFile(file);
    else loadTxtFile(file);
  }

  function loadFromUrl() {
    showModal(
      'Cargar URL',
      '<input type="url" class="recall-input lectura-url-input" id="lecturaUrlInput" placeholder="https://ejemplo.com/articulo" autocomplete="off" style="width:100%">',
      [
        { text: 'Cancelar', cls: 'mode-pill', action: closeModal },
        { text: 'Cargar', cls: 'duo-btn', action: function () {
          var inp = document.getElementById('lecturaUrlInput');
          var url = inp ? inp.value.trim() : '';
          closeModal();
          if (url) fetchUrlContent(url);
        } }
      ]
    );
    var inp = document.getElementById('lecturaUrlInput');
    if (inp) {
      inp.focus();
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var url = inp.value.trim();
          closeModal();
          if (url) fetchUrlContent(url);
        }
      });
    }
  }

  function fetchUrlContent(url) {
    if (displayEl) { displayEl.textContent = 'Cargando URL...'; displayEl.style.color = '#FFC800'; }
    var fetchUrls = [PROXY_URL_1 + encodeURIComponent(url), PROXY_URL_2 + encodeURIComponent(url)];
    var success = false;
    function tryNext(idx) {
      if (idx >= fetchUrls.length) {
        if (displayEl) { displayEl.textContent = 'Lectura'; displayEl.style.color = ''; }
        if (!success) showModal('Error', 'No se pudo cargar la URL. Ambos proxies fallaron.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]);
        return;
      }
      fetch(fetchUrls[idx]).then(function (r) { return r.text(); }).then(function (data) {
        var html;
        if (idx === 0) {
          try { var json = JSON.parse(data); html = json.contents; } catch (err) { html = data; }
        } else {
          html = data;
        }
        if (!html) { tryNext(idx + 1); return; }
        var div = document.createElement('div');
        div.innerHTML = html;
        div.querySelectorAll('script, style, noscript, header, footer, nav, aside, form, svg, img, picture, video, audio, [aria-hidden="true"]').forEach(function (el) { el.remove(); });
        var clean = div.textContent || '';
        clean = clean.replace(/[\s\W]*\b\d{1,4}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?\b[\s\W]*/g, ' ');
        clean = clean.replace(/\d{2,}[\s\W]+/g, ' ');
        clean = clean.replace(/\d{2,4}(?=[A-Z])/g, ' ');
        clean = clean.replace(/This is some text inside of a div block/gi, ' ');
        clean = clean.replace(/Leer más/gi, ' ').replace(/Volver al sitio web/gi, ' ').replace(/Suscríbete al blog/gi, ' ');
        clean = clean.replace(/Artículos relacionados/gi, ' ').replace(/Ver todos/gi, ' ');
        clean = clean.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').replace(/^[\s\W]+/g, '').trim();
        if (!clean) { tryNext(idx + 1); return; }
        success = true;
        setText('URL: ' + url, clean);
        if (displayEl) displayEl.style.color = '';
      }).catch(function () { tryNext(idx + 1); });
    }
    tryNext(0);
  }

  function usePastedText() {
    if (!textArea) return;
    var text = textArea.value.trim();
    if (!text) { showModal('Sin texto', 'Pega o escribe texto en el campo.', [{ text: 'OK', cls: 'duo-btn', action: closeModal }]); return; }
    setText('Texto pegado', text);
    saveSessionState();
  }

  // ===================== WAKE LOCK =====================
  function requestWakeLock() {
    if (!('wakeLock' in navigator)) return;
    navigator.wakeLock.request('screen').then(function (lock) { wakeLock = lock; }).catch(function () {});
  }

  function releaseWakeLock() {
    if (wakeLock) { wakeLock.release().catch(function () {}); wakeLock = null; }
  }

  // ===================== KEYBOARD SHORTCUTS =====================
  function handleKeyDown(e) {
    if (rootEl.style.display === 'none') return;
    var active = document.activeElement;
    if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
    switch (e.key) {
      case 'F2': e.preventDefault(); openFileDialog(document.getElementById('lecturaFileInput')); break;
      case 'F3': e.preventDefault(); toggleReading(); break;
      case 'F4': e.preventDefault(); stopReading(true); break;
      case 'ArrowRight':
        e.preventDefault();
        if (e.shiftKey && isPaused) navWords(10);
        else adjustWpm(true);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (e.shiftKey && isPaused) navWords(-10);
        else adjustWpm(false);
        break;
      case 'ArrowUp': e.preventDefault(); adjustFont(true); break;
      case 'ArrowDown': e.preventDefault(); adjustFont(false); break;
      case 'b': case 'B': if (e.ctrlKey) { e.preventDefault(); addBookmark(); } break;
      case 'e': case 'E': if (e.ctrlKey) { e.preventDefault(); exportJSON(); } break;
      case 'Escape': closePanel(); closeModal(); break;
    }
  }

  // ===================== CONSTRUIR UI =====================
  function createRoot() {
    rootEl = document.createElement('div');
    rootEl.id = 'lecturaModule';
    rootEl.style.display = 'none';
    rootEl.style.width = '100%';
    rootEl.style.maxWidth = '600px';
    rootEl.style.margin = '0 auto';
    rootEl.innerHTML = '' +
      '<div class="lectura-display-wrap">' +
      '<div class="lectura-card" id="lecturaCard">' +
      '<div class="card-label" id="lecturaCardLabel">LECTURA</div>' +
      '<div class="card-top" id="lecturaWord" style="font-size:' + currentFontSize + 'px">Lectura</div>' +
      '<div class="card-index" id="lecturaCardIndex"></div>' +
      '</div>' +
      '</div>' +
      '<div class="lectura-progress-wrap">' +
      '<div class="lectura-progress-bar" id="lecturaProgressBarTrack">' +
      '<div class="lectura-progress-fill" id="lecturaProgressFill" style="width:0%"></div>' +
      '</div>' +
      '<div class="lectura-progress-label" id="lecturaProgressLabel">0%</div>' +
      '<div class="lectura-timer-label" id="lecturaTimerLabel">00:00:00</div>' +
      '</div>' +
      '<div class="lectura-nav-row" id="lecturaNavRow">' +
      '<button class="mode-pill lectura-nav-btn" id="lecturaNavPrev10">◀◀</button>' +
      '<button class="mode-pill lectura-nav-btn" id="lecturaNavPrev1">◀</button>' +
      '<button class="mode-pill lectura-nav-btn" id="lecturaNavNext1">▶</button>' +
      '<button class="mode-pill lectura-nav-btn" id="lecturaNavNext10">▶▶</button>' +
      '</div>' +
      '<div class="lectura-btn-row">' +
      '<button class="duo-btn lectura-play-btn" id="lecturaPlayBtn">' +
      '<svg id="lecturaPlayIcon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>' +
      '<span class="btn-label" id="lecturaPlayLabel">COMENZAR</span>' +
      '</button>' +
      '<button class="duo-btn lectura-stop-btn" id="lecturaStopBtn">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>' +
      '<span class="btn-label">DETENER</span>' +
      '</button>' +
      '</div>' +
      '<div class="lectura-extra-btns" id="lecturaExtraBtns">' +
      '<button class="mode-pill" id="lecturaBookmarkBtn">Marcador</button>' +
      '<button class="mode-pill" id="lecturaSummaryBtn">Resumen</button>' +
      '<button class="mode-pill" id="lecturaPreviewBtn">Preview</button>' +
      '<button class="mode-pill" id="lecturaExportBtn">Exportar</button>' +
      '<button class="mode-pill" id="lecturaTextToggleBtn">Mostrar texto</button>' +
      '<button class="mode-pill" id="lecturaPanelBtn">Panel</button>' +
      '</div>' +
      '<div class="lectura-textarea-wrap" id="lecturaTextAreaWrap" style="display:none">' +
      '<textarea class="personal-textarea lectura-textarea" id="lecturaTextArea" rows="4" placeholder="Pega o escribe tu texto aquí..."></textarea>' +
      '<button class="duo-btn full-width" id="lecturaUseTextBtn">' +
      '<span class="btn-label">USAR ESTE TEXTO</span>' +
      '</button>' +
      '</div>' +
      '<div class="speed-box lectura-speed-box">' +
      '<div class="speed-label-row"><svg class="speed-icon-small" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#AFAFAF" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span class="speed-title">VELOCIDAD (PPM)</span></div>' +
      '<div class="speed-input-row">' +
      '<input type="text" class="speed-input" id="lecturaWpmInput" value="' + currentWpm + '" inputmode="numeric" autocomplete="off">' +
      '<div class="speed-arrows"><button class="speed-arrow" id="lecturaWpmUp">▲</button><button class="speed-arrow" id="lecturaWpmDown">▼</button></div>' +
      '<span class="speed-unit">PPM</span>' +
      '</div>' +
      '<div class="speed-bar"><div class="speed-fill" id="lecturaSpeedFill" style="width:30%"></div></div>' +
      '<div class="speed-limits"><span>100</span><span>2500</span></div>' +
      '</div>' +
      '<div class="lectura-font-row">' +
      '<button class="mode-pill font-pill" id="lecturaFontDown">−</button>' +
      '<span class="lectura-font-size" id="lecturaFontSize">' + currentFontSize + 'px</span>' +
      '<button class="mode-pill font-pill" id="lecturaFontUp">+</button>' +
      '</div>' +
      '<div class="lectura-source-row">' +
      '<button class="mode-pill" id="lecturaOpenFile">Abrir archivo</button>' +
      '<button class="mode-pill" id="lecturaLoadUrl">Cargar URL</button>' +
      '<button class="mode-pill" id="lecturaPasteText">Pegar texto</button>' +
      '</div>' +
      '<input type="file" id="lecturaFileInput" accept=".txt,.epub,.pdf,.log" style="display:none">';
    return rootEl;
  }

  function bindUI(root) {
    displayEl = root.querySelector('#lecturaWord');
    displayLabel = root.querySelector('#lecturaCardLabel');
    displayIndex = root.querySelector('#lecturaCardIndex');
    speedInput = root.querySelector('#lecturaWpmInput');
    speedFill = root.querySelector('#lecturaSpeedFill');
    fontUp = root.querySelector('#lecturaFontUp');
    fontDown = root.querySelector('#lecturaFontDown');
    progressBar = root.querySelector('#lecturaProgressFill');
    progressLabel = root.querySelector('#lecturaProgressLabel');
    timerLabel = root.querySelector('#lecturaTimerLabel');
    playBtn = root.querySelector('#lecturaPlayBtn');
    playLbl = root.querySelector('#lecturaPlayLabel');
    playIco = root.querySelector('#lecturaPlayIcon');
    stopBtn = root.querySelector('#lecturaStopBtn');
    bmBtn = root.querySelector('#lecturaBookmarkBtn');
    summaryBtn = root.querySelector('#lecturaSummaryBtn');
    previewBtn = root.querySelector('#lecturaPreviewBtn');
    exportBtn = root.querySelector('#lecturaExportBtn');
    textToggleBtn = root.querySelector('#lecturaTextToggleBtn');
    navPrev1 = root.querySelector('#lecturaNavPrev1');
    navPrev10 = root.querySelector('#lecturaNavPrev10');
    navNext1 = root.querySelector('#lecturaNavNext1');
    navNext10 = root.querySelector('#lecturaNavNext10');
    textAreaWrap = root.querySelector('#lecturaTextAreaWrap');
    textArea = root.querySelector('#lecturaTextArea');
    var fontSz = root.querySelector('#lecturaFontSize');

    playBtn.addEventListener('click', toggleReading);
    stopBtn.addEventListener('click', function () { stopReading(true); });
    root.querySelector('#lecturaCard').addEventListener('click', toggleReading);
    root.querySelector('#lecturaProgressBarTrack').addEventListener('click', progressBarTap);

    speedInput.addEventListener('input', function () { var v = parseInt(speedInput.value) || currentWpm; setWpm(v); });
    speedInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') speedInput.blur(); if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); adjustWpm(e.key === 'ArrowUp'); } });
    root.querySelector('#lecturaWpmUp').addEventListener('click', function () { adjustWpm(true); speedInput.value = currentWpm; });
    root.querySelector('#lecturaWpmDown').addEventListener('click', function () { adjustWpm(false); speedInput.value = currentWpm; });

    fontUp.addEventListener('click', function () { adjustFont(true); if (fontSz) fontSz.textContent = currentFontSize + 'px'; });
    fontDown.addEventListener('click', function () { adjustFont(false); if (fontSz) fontSz.textContent = currentFontSize + 'px'; });

    bmBtn.addEventListener('click', addBookmark);
    if (bmBtn) bmBtn.style.display = 'none';
    summaryBtn.addEventListener('click', toggleSummaryMode);
    previewBtn.addEventListener('click', previewDocument);
    exportBtn.addEventListener('click', exportJSON);
    textToggleBtn.addEventListener('click', toggleTextArea);
    root.querySelector('#lecturaPanelBtn').addEventListener('click', openPanel);

    var fileInput = root.querySelector('#lecturaFileInput');
    root.querySelector('#lecturaOpenFile').addEventListener('click', function () { openFileDialog(fileInput); });
    fileInput.addEventListener('change', function () { handleFileInput(fileInput); });
    root.querySelector('#lecturaLoadUrl').addEventListener('click', loadFromUrl);
    root.querySelector('#lecturaPasteText').addEventListener('click', toggleTextArea);
    root.querySelector('#lecturaUseTextBtn').addEventListener('click', usePastedText);

    navPrev1.addEventListener('click', function () { if (isPaused) navWords(-1); });
    navPrev10.addEventListener('click', function () { if (isPaused) navWords(-10); });
    navNext1.addEventListener('click', function () { if (isPaused) navWords(1); });
    navNext10.addEventListener('click', function () { if (isPaused) navWords(10); });

    updateBtnStates();
    updateSpeedFill();
    updateDisplayFont();
  }

  // ===================== MÓDULO PÚBLICO =====================
  var pendingResumeState = null;

  function init() {
    loadBookmarks();
    loadHistory();
    loadStats();
    var root = createRoot();
    var contentArea = document.querySelector('.content');
    if (contentArea) contentArea.appendChild(root);
    bindUI(root);
    document.addEventListener('keydown', handleKeyDown);

    pendingResumeState = loadSessionState();
    if (pendingResumeState && !pendingResumeState.words && !pendingResumeState.text && pendingResumeState.textTooLarge) {
      pendingResumeState = null;
    }

    window.addEventListener('beforeunload', function () {
      saveSessionState();
      releaseWakeLock();
    });

    if (localStorage.getItem('sparrowGame') === 'lectura') {
      show();
    }
  }

  var _firstShowDone = false;

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
    updateDisplayFont();
    updateProgress();
    updateTimer();
    updateBtnStates();
    updateSpeedFill();

    if (!_firstShowDone && pendingResumeState) {
      _firstShowDone = true;
      var state = pendingResumeState;
      pendingResumeState = null;
      showResumeModal(state, function (resume) {
        if (resume) {
          if (state.words) words = state.words;
          currentWordIndex = state.lastWordIndex || 0;
          currentWpm = state.wpm || 300;
          currentFontSize = state.fontSize || 38;
          currentFileName = state.fileName || '';
          setWpm(currentWpm);
          updateDisplayFont();
          updateProgress();
          updateTimer();
          if (displayEl) displayEl.textContent = getWordAtIndex(Math.min(currentWordIndex, words.length - 1));
          if (displayLabel) displayLabel.textContent = currentFileName || 'LECTURA';
          if (displayIndex) displayIndex.textContent = words.length ? (currentWordIndex + 1) + '/' + words.length : '';
          highlightInTextArea();
          isReading = true;
          isPaused = true;
          updateBtnStates();
          detectChapters();
        } else {
          clearSessionState();
        }
      });
    } else {
      _firstShowDone = true;
    }
  }

  function hide() {
    if (!rootEl) return;
    saveSessionState();
    clearReadTimeout();
    stopReadingTimer();
    if (isReading) { isPaused = true; isReading = true; }
    else { isReading = false; isPaused = false; }
    releaseWakeLock();
    updateBtnStates();
    rootEl.style.display = 'none';
    closePanel();
    closeModal();
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

  window.LecturaModule = { show: show, hide: hide, init: init };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
