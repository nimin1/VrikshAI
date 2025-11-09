/**
 * VrikshAI Service Worker
 * Enables offline functionality and PWA installation
 */

/* eslint-disable no-restricted-globals */

// Cache names
const CACHE_NAME = 'vrikshAI-v2';
const RUNTIME_CACHE = 'vrikshAI-runtime-v2';

// Assets to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Precaching app shell');
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.log('Service Worker: Cache addAll error:', err);
        // Continue even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            console.log('Service Worker: Deleting old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests - let browser handle them
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API requests - let them go directly to network without caching
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Only cache successful GET requests
            if (event.request.method === 'GET' && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch((error) => {
            console.log('Service Worker: Fetch failed, serving offline page', error);
            // Return a custom offline page if available
            return caches.match('/index.html');
          });
      });
    })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
