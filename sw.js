const CACHE_NAME = 'coopec-kwilu-v5';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://i.postimg.cc/RNH2v9sC/logo-coopec-Kwilu.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  // Ne pas mettre en cache les requêtes vers Google Apps Script
  if (event.request.url.includes('/macros/')) {
    return fetch(event.request);
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retourner le cache si disponible, sinon faire une requête réseau
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(function(networkResponse) {
          // Ne mettre en cache que les requêtes réussies et de type basic
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Cloner la réponse car elle ne peut être utilisée qu'une fois
          const responseToCache = networkResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return networkResponse;
        });
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
