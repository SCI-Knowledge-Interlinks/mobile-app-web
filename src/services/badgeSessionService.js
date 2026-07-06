import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const BADGE_SESSION_KEY = "prawaas_badge_session";

function canUseLocalStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export async function saveBadgeSession(badge) {
  if (!badge?.regId) {
    return;
  }

  const value = JSON.stringify(badge);

  if (Platform.OS === "web" && canUseLocalStorage()) {
    window.localStorage.setItem(BADGE_SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(BADGE_SESSION_KEY, value);
}

export async function getBadgeSession() {
  const value =
    Platform.OS === "web" && canUseLocalStorage()
      ? window.localStorage.getItem(BADGE_SESSION_KEY)
      : await SecureStore.getItemAsync(BADGE_SESSION_KEY);

  if (!value) {
    return null;
  }

  try {
    const badge = JSON.parse(value);
    return badge?.regId ? badge : null;
  } catch {
    await clearBadgeSession();
    return null;
  }
}

export async function clearBadgeSession() {
  if (Platform.OS === "web" && canUseLocalStorage()) {
    window.localStorage.removeItem(BADGE_SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(BADGE_SESSION_KEY);
}
