// Firebase Messaging Service Worker
// This file must be in /public and named firebase-messaging-sw.js
// It handles background push notifications when the app is closed

// These values will be replaced when Firebase is configured
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Import Firebase scripts
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw] Background message:", payload);

  const title = payload.notification?.title || "Ta'alam";
  const options = {
    body: payload.notification?.body || "",
    icon: "/taalam-icon.png",
    badge: "/taalam-icon.png",
    data: payload.data,
    vibrate: [100, 50, 100],
    tag: payload.data?.type || "default",
  };

  self.registration.showNotification(title, options);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow("/");
    })
  );
});
