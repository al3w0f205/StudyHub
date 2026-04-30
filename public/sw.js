const CACHE_NAME = 'studyhub-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/quiz',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force update
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          fetch(url).then(response => {
            if (response.ok) return cache.put(url, response);
          })
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim()); // Take control immediately
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;

  // Only handle GET requests and same-origin requests
  if (event.request.method !== 'GET' || !isSameOrigin) return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).catch((err) => {
        if (event.request.mode === 'navigate') {
          return caches.match('/').then(rootResponse => {
            return rootResponse || Promise.reject(err);
          });
        }
        throw err;
      });
    })
  );
});
