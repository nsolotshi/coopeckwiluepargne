// Version du cache
const CACHE_NAME = 'coopec-kwilu-v1.0';

// Fichiers à mettre en cache
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
  
  // Attendre que le cache soit rempli avant de terminer l'installation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache ouvert');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('Service Worker: Toutes les ressources ont été mises en cache');
        return self.skipWaiting();
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activation en cours');
  
  // Supprimer les anciens caches
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Suppression de l\'ancien cache', cacheName);
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
  // Ignorer les requêtes non-GET et les requêtes vers l'API Google Apps Script
  if (event.request.method !== 'GET' || event.request.url.includes('script.google.com')) {
    return;
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
          .catch(function() {
            // En cas d'échec, on peut retourner une page offline personnalisée
            // Pour l'instant, on laisse simplement échouer la requête
          });
      })
  );
});
