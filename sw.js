// BACKPANEL service worker: offline-first for app shell.
const CACHE_V = 'bp-v2';
const PRECACHE = [
  '/', '/index.html', '/stack.html', '/privacy.html', '/terms.html',
  '/site.webmanifest', '/src/styles/global.css', '/src/styles/tokens.css',
  '/src/styles/styles.css', '/app.js', '/bp-enhance.js',
  '/assets/fonts/archivo-black-latin.woff2', '/assets/fonts/inter-var-latin.woff2'
];

// Install: cache each asset individually so one 404 won't fail install.
self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_V);
    for (const u of PRECACHE) {
      try { await c.add(u); } catch (err) { /* skip missing asset */ }
    }
    await self.skipWaiting();
  })());
});

// Activate: drop old cache versions.
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_V).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

// Fetch: GET + same-origin only; never cache POST/analytics.
self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;
  if (new URL(request.url).origin !== location.origin) return;
  // Navigation: network first, fall back to cached index offline.
  if (request.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        const c = await caches.open(CACHE_V);
        c.put(request, fresh.clone());
        return fresh;
      } catch (err) {
        return (await caches.match('/index.html')) || Response.error();
      }
    })());
    return;
  }
  // Static: cache-first, update cache in background.
  e.respondWith((async () => {
    const hit = await caches.match(request);
    if (hit) {
      e.waitUntil((async () => {
        try {
          const fresh = await fetch(request);
          (await caches.open(CACHE_V)).put(request, fresh);
        } catch (err) { /* offline: keep stale */ }
      })());
      return hit;
    }
    try {
      const fresh = await fetch(request);
      (await caches.open(CACHE_V)).put(request, fresh.clone());
      return fresh;
    } catch (err) {
      return Response.error();
    }
  })());
});
