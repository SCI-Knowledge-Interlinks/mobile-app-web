importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA2SL8Xm31-0ptdshYrDq1frukM65if3vI",
  authDomain: "prawaas-650d0.firebaseapp.com",
  projectId: "prawaas-650d0",
  storageBucket: "prawaas-650d0.firebasestorage.app",
  messagingSenderId: "1003791871854",
  appId: "1:1003791871854:web:60bb88daaa908e5b1fdb7f",
});

const messaging = firebase.messaging();

function postToClients(message) {
  return self.clients
    .matchAll({ type: "window", includeUncontrolled: true })
    .then((clientList) => {
      for (const client of clientList) {
        client.postMessage(message);
      }
    });
}

messaging.onBackgroundMessage((payload) => {
  const data = payload?.data || {};
  const title = payload?.notification?.title || data.title || "Prawaas";
  const body = payload?.notification?.body || data.body || "";
  const options = {
    body,
    icon: "/favicon.ico",
    data,
  };

  postToClients({
    type: "NOTIFICATION_RECEIVED",
    deliveryId: data.deliveryId,
    title,
    body,
    data,
  });

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const deliveryId = event.notification?.data?.deliveryId;
  event.waitUntil(
    postToClients({
      type: "NOTIFICATION_ACK",
      deliveryId,
      event: "read",
    }).then(() =>
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }

        return self.clients.openWindow("/");
      })
    )
  );
});
