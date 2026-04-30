const CACHE_NAME = 'studyhub-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/quiz',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Try to add assets one by one so one failure doesn't block the whole installation
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => 
          fetch(url).then(response => {
            if (response.ok) return cache.put(url, response);
            console.warn(`SW: Failed to cache ${url}: ${response.status}`);
          })
        )
      );
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
