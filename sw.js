const CACHE_NAME = 'kacida-bersatu-pwa-v3.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Poppins:wght@600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

// 1. INSTALL EVENT - PRE-CACHE UTAMA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE EVENT - HAPUS CACHE LAMA
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH EVENT - METODE NETWORK FIRST DENGAN FALLBACK CACHE
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ABAIKAN CACHE UNTUK REQUEST APPS SCRIPT API & FIREBASE REALTIME DB (AGAR DATA SALES SELALU DINAMIS)
  if (url.hostname.includes('script.google.com') || 
      url.hostname.includes('firebasedatabase.app') || 
      url.hostname.includes('firebaseio.com') ||
      req.method !== 'GET') {
    return; // Request live langsung ke server/database
  }

  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      return fetch(req).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse || caches.match('./index.html');
      });
    })
  );
});

// 4. PUSH NOTIFICATION EVENT
self.addEventListener('push', (event) => {
  let data = { title: 'KACIDA BERSATU ✦', body: 'Ada pemberitahuan baru di aplikasi!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: 'https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ',
    badge: 'https://cdn-icons-png.flaticon.com/512/3602/3602123.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './index.html' }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'KACIDA BERSATU ✦', options)
  );
});

// 5. NOTIFICATION CLICK EVENT
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || './index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
