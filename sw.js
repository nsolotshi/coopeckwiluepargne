const CACHE_NAME = 'coopec-kwilu-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.postimg.cc/RNH2v9sC/logo-coopec-Kwilu.jpg'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Installation en cours');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation du Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activation en cours');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', function(event) {
  // Ne pas mettre en cache les requêtes vers Google Apps Script
  if (event.request.url.includes('script.google.com')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retourner la réponse en cache ou fetch la requête
        return response || fetch(event.request)
          .then(function(fetchResponse) {
            // Mettre en cache les nouvelles ressources
            return caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request.url, fetchResponse.clone());
                return fetchResponse;
              });
          })
          .catch(function(error) {
            console.log('Fetch failed; returning offline page instead.', error);
            // Vous pourriez retourner une page offline personnalisée ici
          });
      })
  );
});
