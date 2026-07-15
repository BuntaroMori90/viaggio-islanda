
const CACHE_NAME = 'islanda2026-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Strategia: cache-first per la pagina e le icone (contenuto statico che non cambia spesso),
// network-first per tutto il resto (meteo, Supabase, font) così i dati restano aggiornati
// quando c'è connessione, ma non si rompe nulla se manca internet.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  const isCoreAsset = url.origin === self.location.origin;

  if (isCoreAsset) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => cached))
    );
  } else {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  }
});
