import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const AUTH_SESSION_KEY = "prawaas_auth_session";

function canUseLocalStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export async function saveAuthSession({ token, user }) {
  if (!token || !user) return;

  const value = JSON.stringify({ token, user });

  if (Platform.OS === "web" && canUseLocalStorage()) {
    window.localStorage.setItem(AUTH_SESSION_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(AUTH_SESSION_KEY, value);
}

export async function getAuthSession() {
  const value =
    Platform.OS === "web" && canUseLocalStorage()
      ? window.localStorage.getItem(AUTH_SESSION_KEY)
      : await SecureStore.getItemAsync(AUTH_SESSION_KEY);

  if (!value) return null;

  try {
    const session = JSON.parse(value);
    return session?.token && session?.user ? session : null;
  } catch {
    await clearAuthSession();
    return null;
  }
}

export async function clearAuthSession() {
  if (Platform.OS === "web" && canUseLocalStorage()) {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
}

export function getAuthHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getSessionUserId() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  return userId != null && userId !== "" ? String(userId) : null;
}
