import { useEffect, useRef } from "react";
import Constants from "expo-constants";
import { AppState, PermissionsAndroid, Platform } from "react-native";

import { registerDeviceToken } from "../services/authService";
import { subscribeToForegroundMessages } from "../services/firebaseWebMessaging";
import {
  ackNotificationDelivered,
  ackNotificationRead,
  extractDeliveryId,
  subscribeToServiceWorkerAckMessages,
} from "../services/notificationAckService";
import { addNotificationToInbox } from "../services/notificationInboxService";
import { getAuthSession } from "../services/sessionService";
import { getApiErrorMessage } from "../utils/network";
import { navigateFromNotificationData } from "../utils/notificationNavigation";

function savePushToInbox(payload = {}) {
  const data = payload?.data || {};
  const title =
    payload?.notification?.title ||
    payload?.title ||
    data.title ||
    "Prawaas";
  const body =
    payload?.notification?.body || payload?.body || data.body || "";

  return addNotificationToInbox({
    title,
    body,
    deliveryId: extractDeliveryId(payload),
    data,
  });
}

let notificationsModulePromise = null;

function getNotificationsModule() {
  if (Platform.OS === "web") {
    return Promise.resolve(null);
  }

  if (!notificationsModulePromise) {
    notificationsModulePromise = import("expo-notifications").catch((error) => {
      notificationsModulePromise = null;
      console.log("[FCM] expo-notifications not available:", error?.message || error);
      return null;
    });
  }

  return notificationsModulePromise;
}

async function configureNotificationHandler(Notifications) {
  if (!Notifications) {
    return;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {
    // Native module may be missing until the dev client is rebuilt.
  }
}

function getNativeNotificationData(notification) {
  return notification?.request?.content?.data || {};
}

function saveNativePushToInbox(notification) {
  const content = notification?.request?.content || {};
  const data = content.data || {};

  return addNotificationToInbox({
    title: content.title || data.title || "Prawaas",
    body: content.body || data.body || "",
    deliveryId: extractDeliveryId({ data }),
    data,
  });
}

function showWebForegroundNotification(payload) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return;
  }

  const title = payload?.notification?.title || "Prawaas";
  const body = payload?.notification?.body || "";
  const data = payload?.data || {};

  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    data,
  });

  notification.onclick = () => {
    ackNotificationRead({ data });
    navigateFromNotificationData(data);
    notification.close();
    window.focus();
  };
}

/**
 * Ask for notification permission on the login / first screen.
 * Does not require auth; token is registered after login.
 */
export async function requestNotificationPermission() {
  if (Platform.OS === "web") {
    try {
      if (typeof Notification === "undefined") {
        return false;
      }
      if (Notification.permission === "granted") {
        return true;
      }
      if (Notification.permission === "denied") {
        return false;
      }
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.log("[FCM] web permission request failed:", error?.message || error);
      return false;
    }
  }

  if (!Constants.isDevice) {
    return false;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return false;
  }

  await configureNotificationHandler(Notifications);

  try {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === "granted") {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "Default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
        });
      }
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted" && Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return status === "granted";
  } catch (error) {
    console.log("[FCM] permission request failed:", error?.message || error);
    return false;
  }
}

/** Request permission and return the FCM token (native or web). */
export async function getFcmToken() {
  const granted = await requestNotificationPermission();
  if (!granted) {
    console.log("[FCM] Notification permission was not granted.");
    return null;
  }

  if (Platform.OS === "web") {
    try {
      const { getWebFcmToken } = await import("../services/firebaseWebMessaging");
      return await getWebFcmToken();
    } catch (error) {
      console.log("[FCM] web token fetch failed:", error?.message || error);
      return null;
    }
  }

  if (!Constants.isDevice) {
    console.log("[FCM] Push tokens require a physical device (not simulator).");
    return null;
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    console.log("[FCM] Rebuild the dev client after adding expo-notifications.");
    return null;
  }

  try {
    const tokenResult = await Notifications.getDevicePushTokenAsync();
    return tokenResult?.data || null;
  } catch (error) {
    console.log("[FCM] token fetch failed:", error?.message || error);
    return null;
  }
}

/**
 * Ask notification permission (system dialog) and register the FCM token.
 * Call this right after a successful login.
 */
export async function registerPushAfterLogin() {
  try {
    const token = await getFcmToken();
    if (!token) {
      console.log("[FCM] No token after permission request.");
      return null;
    }

    await registerDeviceToken({
      fcmToken: token,
      platform: Platform.OS === "ios" ? "ios" : Platform.OS === "web" ? "web" : "android",
    });

    console.log("[FCM] token saved via /auth/device-token after login");
    return token;
  } catch (error) {
    console.log("[FCM] post-login registration failed:", getApiErrorMessage(error));
    return null;
  }
}

/**
 * Registers the device FCM token with the backend after login.
 * Reports delivery/read acks via POST /auth/notification-ack.
 */
export function usePushNotifications({ enabled = true } = {}) {
  const registeredTokenRef = useRef(null);
  const listenersReadyRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let isMounted = true;
    let unsubscribeForeground = () => {};
    let unsubscribeServiceWorkerAck = () => {};
    let receivedSubscription = null;
    let responseSubscription = null;
    let sessionPollTimer = null;

    async function setupListeners() {
      if (!isMounted || listenersReadyRef.current) {
        return;
      }

      if (Platform.OS === "web") {
        unsubscribeServiceWorkerAck = subscribeToServiceWorkerAckMessages();
        unsubscribeForeground = await subscribeToForegroundMessages(async (payload) => {
          await savePushToInbox(payload);
          await ackNotificationDelivered(payload);
          showWebForegroundNotification(payload);
        });
      } else {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
          return;
        }

        await configureNotificationHandler(Notifications);

        receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
          saveNativePushToInbox(notification);
          ackNotificationDelivered({ data: getNativeNotificationData(notification) });
        });

        responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
          const data = getNativeNotificationData(response.notification);
          saveNativePushToInbox(response.notification);
          ackNotificationRead({ data });
          navigateFromNotificationData(data);
        });

        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse?.notification) {
          const data = getNativeNotificationData(lastResponse.notification);
          saveNativePushToInbox(lastResponse.notification);
          ackNotificationRead({ data });
          navigateFromNotificationData(data);
        }
      }

      listenersReadyRef.current = true;
    }

    async function registerTokenIfNeeded() {
      const session = await getAuthSession();
      if (!isMounted || !session?.token) {
        return false;
      }

      await setupListeners();

      const token = await getFcmToken();
      if (!isMounted || !token) {
        return true;
      }

      console.log("[FCM] device token:", token);

      if (registeredTokenRef.current === token) {
        return true;
      }

      registeredTokenRef.current = token;

      await registerDeviceToken({
        fcmToken: token,
        platform: Platform.OS === "ios" ? "ios" : Platform.OS === "web" ? "web" : "android",
      });

      console.log("[FCM] token saved via /auth/device-token");
      return true;
    }

    async function setupPush() {
      try {
        const done = await registerTokenIfNeeded();
        if (done && sessionPollTimer) {
          clearInterval(sessionPollTimer);
          sessionPollTimer = null;
        }
      } catch (error) {
        console.log("[FCM] registration failed:", getApiErrorMessage(error));
      }
    }

    setupPush();

    sessionPollTimer = setInterval(async () => {
      try {
        const done = await registerTokenIfNeeded();
        if (done && sessionPollTimer) {
          clearInterval(sessionPollTimer);
          sessionPollTimer = null;
        }
      } catch (error) {
        console.log("[FCM] registration failed:", getApiErrorMessage(error));
      }
    }, 2000);

    const appStateSubscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        registerTokenIfNeeded();
      }
    });

    return () => {
      isMounted = false;
      clearInterval(sessionPollTimer);
      appStateSubscription.remove();
      unsubscribeForeground();
      unsubscribeServiceWorkerAck();
      receivedSubscription?.remove();
      responseSubscription?.remove();
      listenersReadyRef.current = false;
    };
  }, [enabled]);
}
