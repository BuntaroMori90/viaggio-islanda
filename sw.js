const CACHE_NAME = 'islanda2026-v7';
const RESTYLE_CSS = './visual-restyle.css?v=1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './push-notifications.js',
  './visual-restyle.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();

    // Un solo reload automatico quando entra in funzione questa nuova versione:
    // chi ha già installato la PWA riceve il restyling senza reinstallare nulla.
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(clients.map(async (client) => {
      try { await client.navigate(client.url); } catch (_) {}
    }));
  })());
});

function injectRestyle(response) {
  if (!response) return Promise.resolve(response);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return Promise.resolve(response);

  return response.text().then((html) => {
    if (!html.includes('visual-restyle.css')) {
      html = html.replace('</head>', `  <link rel="stylesheet" href="${RESTYLE_CSS}">\n</head>`);
    }

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.delete('etag');

    return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  });
}

// Strategia:
// - HTML: network-first + iniezione del solo foglio grafico del restyling.
// - manifest e push-notifications.js: network-first, come prima.
// - altri asset locali: cache-first con aggiornamento in background.
// - logica, dati, Supabase, mappe e notifiche non vengono modificati.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigazione = req.mode === 'navigate' || (isSameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));
  const isPushScript = isSameOrigin && url.pathname.endsWith('/push-notifications.js');
  const isManifest = isSameOrigin && url.pathname.endsWith('/manifest.json');

  if (isNavigazione) {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(req);
        const styledResponse = await injectRestyle(networkResponse);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, styledResponse.clone());
        return styledResponse;
      } catch (_) {
        const cached = await caches.match(req);
        return cached ? injectRestyle(cached) : Response.error();
      }
    })());
  } else if (isPushScript || isManifest) {
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
