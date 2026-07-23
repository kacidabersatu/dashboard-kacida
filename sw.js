const CACHE_NAME = 'kacida-pro-v1';

// Daftar file statis utama yang wajib disimpan di cache HP/Browser
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// ============================================================
// 1. INSTALASI (Install Event)
// Menyimpan file-file statis penting saat Service Worker dipasang
// ============================================================
self.addEventListener('install', event => {
    // Memaksa Service Worker baru langsung mengambil alih tanpa menunggu
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.error('[Service Worker] Cache addAll error:', err))
    );
});

// ============================================================
// 2. AKTIVASI (Activate Event)
// Membersihkan cache versi lama & langsung mengontrol halaman aktif
// ============================================================
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Memastikan Service Worker baru langsung mengontrol seluruh halaman aktif
            return self.clients.claim();
        })
    );
});

// ============================================================
// 3. PENGAMBILAN DATA (Fetch Event)
// Mengelola request HTTP (Cache First untuk file statis, Network untuk API)
// ============================================================
self.addEventListener('fetch', event => {
    // HANYA proses request dengan method GET (Abaikan POST seperti kirim log/API Apps Script)
    if (event.request.method !== 'GET') {
        return;
    }

    // Abaikan request ke API Google Apps Script dari cache agar data selalu realtime
    if (event.request.url.includes('script.google.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Jika ditemukan di Cache, gunakan cache tersebut
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Jika tidak ada di cache, ambil langsung dari jaringan/internet
                return fetch(event.request).then(networkResponse => {
                    // Validasi response jaringan sebelum disimpan
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }

                    // Simpan file statis baru ke cache secara dinamis
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                    return networkResponse;
                }).catch(() => {
                    // Fallback jika pengguna benar-benar offline dan request tidak ada di cache
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

// ============================================================
// 4. MENDENGARKAN PUSH NOTIFICATION
// Menerima data notifikasi dari Push Server
// ============================================================
self.addEventListener('push', event => {
    let data = {};
    
    // Safety check parsing payload JSON / Teks
    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = { body: event.data.text() };
        }
    }

    const title = data.title || 'Kacida Bersatu';
    
    const options = {
        body: data.body || 'Anda memiliki pemberitahuan baru.',
        icon: data.icon || 'https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ',
        badge: data.badge || 'https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ',
        vibrate: [200, 100, 200, 100, 200],
        data: {
            url: data.url || './'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ============================================================
// 5. AKSI SAAT NOTIFIKASI DIKLIK OLEH USER
// Membuka atau memfokuskan aplikasi saat notifikasi diklik
// ============================================================
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    let targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : './';
    
    // Mengubah URL relatif menjadi URL absolut
    const absoluteUrl = new URL(targetUrl, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Cek apakah ada jendela/tab aplikasi yang sedang terbuka
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === absoluteUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Jika tidak ada tab yang terbuka, buka tab/jendela baru
            if (clients.openWindow) {
                return clients.openWindow(absoluteUrl);
            }
        })
    );
});
