const CACHE_NAME = 'studyhub-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/quiz',
  '/globals.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests for assets
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached asset or fetch from network
      return response || fetch(event.request).catch(() => {
        // If both fail and it's a page navigation, we could return an offline page
        // For now, just let it fail or return cached root
        if (event.request.mode === 'navigate') {
          return caches.match('/');
        }
      });
    })
  );
});

// Sync logic could go here if using Background Sync API, 
// but for now we'll handle it in the React component.
