import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

import { firebaseVapidKey } from "../config/firebaseConfig";
import { getFirebaseApp } from "./firebaseApp";

const SERVICE_WORKER_PATH = "/firebase-messaging-sw.js";

async function registerServiceWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  return navigator.serviceWorker.register(SERVICE_WORKER_PATH);
}

export async function getWebFcmToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const supported = await isSupported();
  if (!supported) {
    console.log("[FCM] Firebase messaging is not supported in this browser.");
    return null;
  }

  if (!firebaseVapidKey) {
    console.log(
      "[FCM] Set EXPO_PUBLIC_FIREBASE_VAPID_KEY in .env (Firebase Console → Cloud Messaging → Web Push certificate)."
    );
    return null;
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    console.log("[FCM] Notification permission was not granted.");
    return null;
  }

  const registration = await registerServiceWorker();
  if (!registration) {
    console.log("[FCM] Service worker registration failed.");
    return null;
  }

  const messaging = getMessaging(getFirebaseApp());
  const token = await getToken(messaging, {
    vapidKey: firebaseVapidKey,
    serviceWorkerRegistration: registration,
  });

  return token || null;
}

export async function subscribeToForegroundMessages(handler) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const supported = await isSupported();
  if (!supported) {
    return () => {};
  }

  const messaging = getMessaging(getFirebaseApp());
  return onMessage(messaging, handler);
}
