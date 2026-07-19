importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
const CACHE_NAME = 'islanda2026-v3';
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

// Strategia:
// - Pagina HTML (navigazione, es. index.html): network-first. Prova sempre a scaricare
//   la versione più recente da internet; se non c'è connessione, usa quella salvata in cache.
//   Così ogni volta che apri l'app con internet vedi subito le modifiche pubblicate.
// - Icone/manifest (contenuto statico che cambia raramente): cache-first, con aggiornamento
//   in background per la volta successiva.
// - Tutto il resto (meteo, Supabase, font esterni): network-first, come prima.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigazione = req.mode === 'navigate' || (isSameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));

  if (isNavigazione) {
    event.respondWith(
      fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => caches.match(req))
    );
  } else if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  } else {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  }
});