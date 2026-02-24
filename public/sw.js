const CACHE_NAME = 'codigo-secreto-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Minimal fetch handler to satisfy PWA requirements
    // We are not aggressively caching the game assets to avoid stale versions, 
    // relying mostly on the browser's default caching or Vite's build caching.
    event.respondWith(fetch(event.request).catch(() => new Response('Offline')));
});
