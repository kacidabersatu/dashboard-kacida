const CACHE_NAME = "kacida-bersatu-v3-pwa";
const ASSETS_TO_CACHE = [
  "./",
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
  "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js",
  "https://unpkg.com/lucide@latest",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
