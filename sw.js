// Caches the app files so it opens instantly and works offline.
// Bump VERSION whenever you change any file so phones pick up the update.
const VERSION = 'v4';
const FILES = [
  './',
  'index.html',
  'css/styles.css',
  'js/app.js',
  'js/util.js',
  'js/today/today.js',
  'js/money/money.js',
  'js/money/rates.js',
  'js/money/tally.js',
  'data/trip.json',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Only handle our own files; rate requests go straight to the network.
  if (url.origin !== location.origin) return;
  // Trip data: use the latest from the network when online, cached copy when offline.
  if (url.pathname.includes('/data/')) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
