const CACHE_NAME = 'islanda2026-v27';
const RESTYLE_CSS = './visual-restyle.css';
const RESTYLE_JS = './visual-restyle.js';
const HERO_CSS = './hero-restyle.css';
const HERO_JS = './hero-restyle.js';
const METEO_CSS = './meteo-restyle.css';
const WEATHER_JS = './weather-live.js';
const PREP_CSS = './prep-restyle.css';
const NAV_CSS = './navigation-restyle.css';
const NAV_JS = './navigation-restyle.js';
const DASH_CSS = './home-dashboard.css';
const DASH_JS = './home-dashboard.js';
const ITINERARY_CSS = './itinerary-restyle.css';
const ITINERARY_JS = './itinerary-restyle.js';
const BUDGET_CSS = './budget-restyle.css';
const BUDGET_JS = './budget-restyle.js';
const ALTRO_CSS = './altro-restyle.css';
const ALTRO_JS = './altro-restyle.js';
const POLISH_CSS = './global-polish.css';
const OPS_CSS = './ops-live.css';
const OPS_JS = './ops-live.js';
const FX_JS = './currency-live.js';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './push-notifications.js',
  './visual-restyle.css',
  './visual-restyle.js',
  './hero-restyle.css',
  './hero-restyle.js',
  './meteo-restyle.css',
  './weather-live.js',
  './prep-restyle.css',
  './navigation-restyle.css',
  './navigation-restyle.js',
  './home-dashboard.css',
  './home-dashboard.js',
  './itinerary-restyle.css',
  './itinerary-restyle.js',
  './budget-restyle.css',
  './budget-restyle.js',
  './altro-restyle.css',
  './altro-restyle.js',
  './global-polish.css',
  './ops-live.css',
  './ops-live.js',
  './currency-live.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

function injectRestyle(response) {
  if (!response) return Promise.resolve(response);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return Promise.resolve(response);

  return response.text().then((html) => {
    if (!html.includes('visual-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${RESTYLE_CSS}">\n</head>`);
    if (!html.includes('hero-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${HERO_CSS}">\n</head>`);
    if (!html.includes('meteo-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${METEO_CSS}">\n</head>`);
    if (!html.includes('prep-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${PREP_CSS}">\n</head>`);
    if (!html.includes('navigation-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${NAV_CSS}">\n</head>`);
    if (!html.includes('home-dashboard.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${DASH_CSS}">\n</head>`);
    if (!html.includes('itinerary-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${ITINERARY_CSS}">\n</head>`);
    if (!html.includes('budget-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${BUDGET_CSS}">\n</head>`);
    if (!html.includes('altro-restyle.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${ALTRO_CSS}">\n</head>`);
    if (!html.includes('global-polish.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${POLISH_CSS}">\n</head>`);
    if (!html.includes('ops-live.css')) html = html.replace('</head>', `  <link rel="stylesheet" href="${OPS_CSS}">\n</head>`);
    if (!html.includes('visual-restyle.js')) html = html.replace('</body>', `  <script src="${RESTYLE_JS}" defer></script>\n</body>`);
    if (!html.includes('hero-restyle.js')) html = html.replace('</body>', `  <script src="${HERO_JS}" defer></script>\n</body>`);
    if (!html.includes('weather-live.js')) html = html.replace('</body>', `  <script src="${WEATHER_JS}" defer></script>\n</body>`);
    if (!html.includes('navigation-restyle.js')) html = html.replace('</body>', `  <script src="${NAV_JS}" defer></script>\n</body>`);
    if (!html.includes('home-dashboard.js')) html = html.replace('</body>', `  <script src="${DASH_JS}" defer></script>\n</body>`);
    if (!html.includes('itinerary-restyle.js')) html = html.replace('</body>', `  <script src="${ITINERARY_JS}" defer></script>\n</body>`);
    if (!html.includes('budget-restyle.js')) html = html.replace('</body>', `  <script src="${BUDGET_JS}" defer></script>\n</body>`);
    if (!html.includes('altro-restyle.js')) html = html.replace('</body>', `  <script src="${ALTRO_JS}" defer></script>\n</body>`);
    if (!html.includes('ops-live.js')) html = html.replace('</body>', `  <script src="${OPS_JS}" defer></script>\n</body>`);
    if (!html.includes('currency-live.js')) html = html.replace('</body>', `  <script src="${FX_JS}" defer></script>\n</body>`);

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    headers.delete('content-encoding');
    headers.delete('etag');
    return new Response(html, { status: response.status, statusText: response.statusText, headers });
  });
}

async function refreshIntoCache(req) {
  try {
    const networkResponse = await fetch(req, { cache: 'no-store' });
    if (!networkResponse || !networkResponse.ok) return;
    const cache = await caches.open(CACHE_NAME);
    const toStore = req.mode === 'navigate' ? await injectRestyle(networkResponse) : networkResponse;
    await cache.put(req, toStore.clone());
  } catch (_) {}
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isNavigazione = req.mode === 'navigate' || (isSameOrigin && (url.pathname.endsWith('/') || url.pathname.endsWith('.html')));
  const isPushScript = isSameOrigin && url.pathname.endsWith('/push-notifications.js');
  const isManifest = isSameOrigin && url.pathname.endsWith('/manifest.json');
  const isRestyleAsset = isSameOrigin && (
    url.pathname.endsWith('/visual-restyle.css') ||
    url.pathname.endsWith('/visual-restyle.js') ||
    url.pathname.endsWith('/hero-restyle.css') ||
    url.pathname.endsWith('/hero-restyle.js') ||
    url.pathname.endsWith('/meteo-restyle.css') ||
    url.pathname.endsWith('/weather-live.js') ||
    url.pathname.endsWith('/prep-restyle.css') ||
    url.pathname.endsWith('/navigation-restyle.css') ||
    url.pathname.endsWith('/navigation-restyle.js') ||
    url.pathname.endsWith('/home-dashboard.css') ||
    url.pathname.endsWith('/home-dashboard.js') ||
    url.pathname.endsWith('/itinerary-restyle.css') ||
    url.pathname.endsWith('/itinerary-restyle.js') ||
    url.pathname.endsWith('/budget-restyle.css') ||
    url.pathname.endsWith('/budget-restyle.js') ||
    url.pathname.endsWith('/altro-restyle.css') ||
    url.pathname.endsWith('/altro-restyle.js') ||
    url.pathname.endsWith('/global-polish.css') ||
    url.pathname.endsWith('/ops-live.css') ||
    url.pathname.endsWith('/ops-live.js') ||
    url.pathname.endsWith('/currency-live.js')
  );

  if (isNavigazione) {
    event.respondWith((async () => {
      const cached = await caches.match(req) || await caches.match('./index.html') || await caches.match('./');
      if (cached) {
        event.waitUntil(refreshIntoCache(req));
        return injectRestyle(cached);
      }

      try {
        const networkResponse = await fetch(req, { cache: 'no-store' });
        const styledResponse = await injectRestyle(networkResponse);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, styledResponse.clone());
        return styledResponse;
      } catch (_) {
        const fallback = await caches.match('./index.html') || await caches.match('./');
        return fallback ? injectRestyle(fallback) : Response.error();
      }
    })());
  } else if (isRestyleAsset) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) {
        event.waitUntil(refreshIntoCache(req));
        return cached;
      }
      try {
        const networkResponse = await fetch(req, { cache: 'no-store' });
        const cache = await caches.open(CACHE_NAME);
        await cache.put(req, networkResponse.clone());
        return networkResponse;
      } catch (_) {
        return Response.error();
      }
    })());
  } else if (isPushScript || isManifest) {
    event.respondWith(fetch(req, { cache: 'no-store' }).then((res) => {
      const resClone = res.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
      return res;
    }).catch(() => caches.match(req)));
  } else if (isSameOrigin) {
    event.respondWith(caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    }));
  } else {
    event.respondWith(fetch(req).catch(() => caches.match(req)));
  }
});
