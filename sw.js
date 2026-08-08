const CACHE_NAME = 'sparrow-v11-pao';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/datos.js',
  './js/juego-numbers.js',
  './js/juego-binario.js',
  './js/juego-deck.js',
  './js/juego-personal.js',
  './js/script.js',
  './js/lectura.js',
  './js/simon.js',
  './js/complemento.js',
  './js/animales.js',
  './js/juego-pao.js',
  './js/vendor/jszip.min.js',
  './js/vendor/pdf.min.js',
  './js/vendor/pdf.worker.min.js',
  './synaptic.svg',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => {
        return cached || new Response('Offline', { status: 503 });
      });

      return cached || fetchPromise;
    })
  );
});
