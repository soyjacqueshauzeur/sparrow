let deckConfig = document.getElementById('deckConfig');
let deckCount = document.getElementById('deckCount');

let deckSelectedSuits = ['♥', '♣', '♠', '♦'];
const ALL_SUITS = ['♥', '♣', '♠', '♦'];
let currentDeckCards = [];

const DECK_SUIT_CODE = { '♥': 'C', '♣': 'T', '♠': 'P', '♦': 'D' };
const DECK_RANK_CODE = { 'A': '1', 'J': '11', 'Q': '12', 'K': '13' };

function deckCardToCode(top) {
  const rank = top.slice(0, -1);
  const suit = top.slice(-1);
  return (DECK_SUIT_CODE[suit] || suit) + (DECK_RANK_CODE[rank] || rank);
}

function getDeckMaxCount() {
  return deckSelectedSuits.length * 13;
}

function updateDeckCountMax() {
  const max = getDeckMaxCount();
  deckCount.max = max;
  const val = parseInt(deckCount.value) || 1;
  if (val > max) deckCount.value = max;
}

function setAllSuits() {
  deckSelectedSuits = [...ALL_SUITS];
}

function toggleSuit(suit) {
  const idx = deckSelectedSuits.indexOf(suit);
  if (idx === -1) {
    deckSelectedSuits.push(suit);
  } else {
    if (deckSelectedSuits.length === 1) return;
    deckSelectedSuits.splice(idx, 1);
  }
}

function syncSuitButtons() {
  document.querySelectorAll('.suit-pill[data-suit]').forEach(btn => {
    btn.classList.toggle('active', deckSelectedSuits.includes(btn.dataset.suit));
  });
  document.getElementById('suitAll').classList.toggle('active', deckSelectedSuits.length === 4);
}

document.getElementById('deckCountUp').addEventListener('click', () => {
  deckCount.value = Math.min(getDeckMaxCount(), (parseInt(deckCount.value) || 1) + 1);
});

document.getElementById('deckCountDown').addEventListener('click', () => {
  deckCount.value = Math.max(1, (parseInt(deckCount.value) || 1) - 1);
});

document.getElementById('suitAll').addEventListener('click', () => {
  setAllSuits();
  syncSuitButtons();
  updateDeckCountMax();
});

document.querySelectorAll('.suit-pill[data-suit]').forEach(btn => {
  btn.addEventListener('click', () => {
    toggleSuit(btn.dataset.suit);
    syncSuitButtons();
    updateDeckCountMax();
  });
});

function generateDeckCards() {
  const count = parseInt(deckCount.value) || 1;
  const clampedCount = Math.min(count, getDeckMaxCount());
  const allCards = dataSets['deck'].filter(c => deckSelectedSuits.some(s => c.top.endsWith(s)));
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }
  return allCards.slice(0, clampedCount);
}

function showDeckCard() {
  const cards = generateDeckCards();
  currentDeckCards = cards;
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
