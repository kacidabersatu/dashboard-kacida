importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBceAg0_W6NPMG8KPIGp0zf2qUnUE7Ypj8",
  authDomain: "kacida-bersatu.firebaseapp.com",
  databaseURL: "https://kacida-bersatu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kacida-bersatu",
  storageBucket: "kacida-bersatu.firebasestorage.app",
  messagingSenderId: "135044863376",
  appId: "1:135044863376:web:0791a1c161b80287958f15"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || "Notifikasi Kacida Bersatu";
    const options = {
        body: payload.notification?.body || "Ada pembaruan data baru!",
        icon: "https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ",
        badge: "https://lh3.googleusercontent.com/d/10-ZwZ0NXA55yPuLXfd1KlJjDU-mNPSyQ",
        sound: "https://cdn.freesound.org/previews/536/536108_11861866-lq.mp3",
        vibrate: [300, 100, 300, 100, 300]
    };
    self.registration.showNotification(title, options);
});
