/* MotoGo static PWA service worker. No background GPS is performed here. */
const CACHE_NAME = 'motogo-shell-v1';

self.addEventListener('install', (event) => {
  const scope = self.registration.scope;
  const appShell = [
    scope,
    new URL('index.html', scope).href,
    new URL('manifest.json', scope).href,
    new URL('icons/motogo-192.png', scope).href,
    new URL('icons/motogo-512.png', scope).href,
    new URL('icons/motogo.svg', scope).href
  ];
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(appShell))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('motogo-shell-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const indexUrl = new URL('index.html', self.registration.scope).href;
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(indexUrl, copy));
          }
          return response;
        })
        .catch(async () => (await caches.match(indexUrl)) || (await caches.match(self.registration.scope)))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});