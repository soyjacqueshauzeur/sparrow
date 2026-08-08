let binarioConfig = document.getElementById('binarioConfig');
let binCount = document.getElementById('binCount');

document.getElementById('binCountUp').addEventListener('click', () => {
  binCount.value = Math.min(50, (parseInt(binCount.value) || 5) + 1);
});

document.getElementById('binCountDown').addEventListener('click', () => {
  binCount.value = Math.max(1, (parseInt(binCount.value) || 5) - 1);
});

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
