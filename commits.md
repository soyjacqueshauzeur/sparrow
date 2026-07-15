7fdf4a4 feat(instructions): add Cyrillic alphabet and deck cards tables
c6468b2 fix: speed step 100ms, click-only handlers, Telegram icon, footer copyright colors
d50ea62 fix: bump SW cache to v2 and increase speed step from 100ms to 200ms
b4e7267 feat(config): add up/down arrows to binario & deck quantity inputs
ac62018 Fix mobile buttons: add appearance:none, touch-action:manipulation and pointerdown handlers for config-arrow and speed-arrow
f14cdc7 feat(numbers): add up/down arrows to quantity input in numbers config
038665f feat: convertir Sparrow en PWA offline-first con persistencia
a31186e Fix: guardar juego en sessionStorage al seleccionar sin estar corriendo
edf134b Default: Instrucciones como juego inicial en primera visita
01cba7c Fix: pausar mantiene la card visible + corregir init de savedPersonalMode
50fed4e Fix: resetGameState bloquea timeouts pendientes con isPaused=true, mayor jerarquía
2568b4f Barra de velocidad: mínimo 5% de relleno, sin 0 absoluto
ff4b7d0 Velocidad mínima: 0.10s, no permite 0 absoluto
ce83885 Fix: invertir flechas de velocidad. ▲ = más lento (sube nº), ▼ = más rápido (baja nº)
d0e80d5 Traducción a español: HTML, JS labels, months, buttons, subtítulos
efe4056 Extraer resetGameState como función nombrada para el botón CLEAN
e76e141 Normalizar inputs de Binary y Deck al mismo tamaño que Numbers Amount
6afccbc Fix: CLEAN 50% igual que START en todos los modos, clase .full-width para 100%
0307dba CLEAN button: 100% width cuando START oculto en Personal, 50% cuando START visible
5926212 Cambiar icono CLEAR por una X
8d3aa5a START + CLEAR: dos botones 50/50, CLEAR resetea todo excepto timer
cceeb8c Fix móvil: pointerdown + debounce 200ms + clase .hidden en vez de style.display
ab80af4 Agregar favicon SVG en el head
b036b6d Fix: cambiar de juego recarga la página limpiamente via sessionStorage
2ccc80d Fix: selectSet('personal') en vez de resetPersonalToConfig para un reseteo completo y consistente
a88741d Fix: resetPersonalToConfig elimina explícitamente la card del DOM
3ff0f0b Personal: Training/Recall/Single Word/Story resetean a config conservando el texto
ff68a33 Fix: applyPersonalMode oculta config y actualiza botón START al cambiar modo
b8df277 Fix: applyPersonalMode() refactoriza el cambio Single Word/Story desde cero
0a809a6 Fix: cambio Single Word/Story aplica inmediatamente sin recargar
be97fbf Personal: START button hidden until text + timer > 00:00 are both met
1d1a80c Clean button: clase .clean-icon para sizing manual, limpia el textarea original y reinicia Personal
70513a4 Clean button: SVG inline como botón, sin wrapper <button>
0420265 Clean button: reemplazar texto por ícono SVG mx-cleanup.svg
17329ae Recall: botón CLEAN para limpiar el textarea
4be768b Fix: función duplicada updateTimerDisplay rompía el cronómetro global. Renombrada a updatePersonalTimerDisplay
09087d0 Personal textarea min-height 120px
1f87cb0 Personal: timer MM:SS con flechas independientes para minutos y segundos
e38c76a Eliminar 'Tap a category' y el icono SVG del empty-state
7195be2 Traducción completa a inglés: UI, labels, meses, subtítulos
fd5a0af Personal: modo Single Word / Story
b73f5d3 Persistencia con sessionStorage: juego, Training/Recall y Orden/Aleatorio sobreviven recargas
ba00b68 Numbers: dígitos naturales agrupados en pares visuales. Sin padding. Default hasta=10
c1ff6f0 Numbers: padStart(2,'0') para que 0-9 ocupen 2 dígitos consistentes
8a09b0e Numbers: dígitos individuales agrupados en pares. cantidad=5 → 55 41 7
35ae43d Numbers: quitar padding 2 dígitos forzado, mostrar números naturales
2b0119e Restauraciones: Numbers original, velocidad 0.10, info-bar compacto
4be1851 Fix: Training/Recall mode no se sobreescribía en selectSet
535c918 Reset total al cambiar de juego + null safety completo
6f7199c Fix crítico: doble disparo en móvil + race condition en advanceToNextCard
4656aa6 Card responsive fluid + fix fuente persistente + limpieza
3b06936 Renombrar memory-plus-plus.html → index.html para Netlify
acbf518 Merge remote Sparrow with local development
e948bb9 Initial commit
733b927 Recall unificado + Deck configurable + Numbers/Binario agrupados
f8116e2 Sparrow v2 — Recall interactivo, Binario reformateado, control de fuente y mejoras móviles
6c444a7 Memory Sparrow — sistema de memorización con gamificación
