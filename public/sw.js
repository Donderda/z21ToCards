const CACHE_NAME = 'lok-karten-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './style-cozy.css',
  './style-vintage.css',
  './style-industrial.css',
  './script.js',
  './manifest.json',
  './lib/jszip.min.js',
  './lib/jspdf.umd.min.js',
  './lib/sql-wasm.js',
  './lib/sql-wasm.wasm',
  './icons8-lokomotive-emoji-100.png',
  './icons8-eisenbahnwaggon-100.png',
  './icons8-tree-96.png',
  './icons8-laubbaum.png',
  './icons8-nuss-100.png',
  './squirrel.png',
  './BirdSprite.png',
  './lang/de.json',
  './lang/en.json',
  './lang/nl.json',
  './lang/la.json'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (CDN scripts)
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('mobasoftware.github.io')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone and cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request);
      })
  );
});