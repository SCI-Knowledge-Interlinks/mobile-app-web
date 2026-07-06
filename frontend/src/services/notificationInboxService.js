import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const INBOX_KEY = "prawaas_notification_inbox";
const MAX_ITEMS = 100;

function canUseLocalStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

async function readRaw() {
  if (Platform.OS === "web" && canUseLocalStorage()) {
    return window.localStorage.getItem(INBOX_KEY);
  }

  return SecureStore.getItemAsync(INBOX_KEY);
}

async function writeRaw(value) {
  if (Platform.OS === "web" && canUseLocalStorage()) {
    window.localStorage.setItem(INBOX_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(INBOX_KEY, value);
}

export async function getNotificationInbox() {
  try {
    const value = await readRaw();
    if (!value) {
      return [];
    }

    const items = JSON.parse(value);
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

export async function getUnreadNotificationCount() {
  const items = await getNotificationInbox();
  return items.filter((item) => !item.read).length;
}

export async function hasUnreadNotifications() {
  return (await getUnreadNotificationCount()) > 0;
}

export async function addNotificationToInbox({
  title = "Prawaas",
  body = "",
  deliveryId = null,
  data = {},
} = {}) {
  const items = await getNotificationInbox();
  const id =
    deliveryId != null
      ? `delivery-${deliveryId}`
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const existingIndex = items.findIndex((item) => item.id === id);
  if (existingIndex >= 0) {
    return items[existingIndex];
  }

  const entry = {
    id,
    title: String(title || "Prawaas").trim() || "Prawaas",
    body: String(body || "").trim(),
    deliveryId: deliveryId != null ? Number(deliveryId) : null,
    data: data && typeof data === "object" ? data : {},
    read: false,
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...items].slice(0, MAX_ITEMS);
  await writeRaw(JSON.stringify(next));
  return entry;
}

export async function markAllNotificationsRead() {
  const items = await getNotificationInbox();
  if (!items.length) {
    return;
  }

  const next = items.map((item) => ({ ...item, read: true }));
  await writeRaw(JSON.stringify(next));
}

export async function markNotificationRead(id) {
  const items = await getNotificationInbox();
  const next = items.map((item) =>
    item.id === id ? { ...item, read: true } : item
  );
  await writeRaw(JSON.stringify(next));
}
