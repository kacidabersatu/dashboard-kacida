const CACHE_NAME = "kacida-bersatu-v3-pro";
const ASSETS_TO_CACHE = [
  "./",
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap",
  "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css",
  "https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js",
  "https://unpkg.com/lucide@latest",
  "https://cdn.jsdelivr.net/npm/sweetalert2@11"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => k !== CACHE_NAME && caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
