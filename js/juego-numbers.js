let numbersConfig = document.getElementById('numbersConfig');
let numCount = document.getElementById('numCount');
let numFrom = document.getElementById('numFrom');
let numTo = document.getElementById('numTo');

document.getElementById('numCountUp').addEventListener('click', () => {
  numCount.value = Math.min(100, (parseInt(numCount.value) || 2) + 1);
});

document.getElementById('numCountDown').addEventListener('click', () => {
  numCount.value = Math.max(1, (parseInt(numCount.value) || 2) - 1);
});

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
