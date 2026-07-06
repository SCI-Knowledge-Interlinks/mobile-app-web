import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_API_PORT = "3000";

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

/** On Android emulator, localhost/127.0.0.1 must map to the host machine. */
function rewriteLocalhostForAndroid(url) {
  if (Platform.OS !== "android") {
    return url;
  }

  return url
    .replace(/\/\/localhost(?=[:/]|$)/i, "//10.0.2.2")
    .replace(/\/\/127\.0\.0\.1(?=[:/]|$)/i, "//10.0.2.2");
}

/**
 * Expo dev server host (e.g. 192.168.x.x from `expo start`) — same machine as the API.
 */
function getExpoDevHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (!hostUri) {
    return null;
  }

  const host = String(hostUri).split(":")[0];
  return host || null;
}

function getWebDevApiBaseUrl(port) {
  if (Platform.OS !== "web" || typeof globalThis?.location?.hostname !== "string") {
    return null;
  }

  const hostname = globalThis.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `http://localhost:${port}`;
  }

  return null;
}

function isLocalApiUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/i.test(url);
}

function resolveApiBaseUrl() {
  const port = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_API_PORT;
  const webDevApi = getWebDevApiBaseUrl(port);
  const fromEnv = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

  if (fromEnv) {
    // Web dev: route API calls through the Expo dev server proxy to avoid CORS.
    if (webDevApi && !isLocalApiUrl(fromEnv)) {
      return "";
    }

    return rewriteLocalhostForAndroid(fromEnv);
  }

  if (webDevApi) {
    return webDevApi;
  }

  const devHost = getExpoDevHost();

  if (devHost && devHost !== "localhost" && devHost !== "127.0.0.1") {
    return rewriteLocalhostForAndroid(`http://${devHost}:${port}`);
  }

  // Android emulator: localhost on the device is not the dev machine.
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${port}`;
  }

  return `http://localhost:${port}`;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const APP_NAME =
  process.env.EXPO_PUBLIC_APP_NAME || process.env.APP_NAME || "Prawaas";

export const DEFAULT_EVENT_ID = Number(process.env.EXPO_PUBLIC_EVENT_ID || 1);

export const EXHIBITOR_LIST_API_URL =
  process.env.EXPO_PUBLIC_EXHIBITOR_LIST_URL ||
  "https://prawaas.com/prawaas-2026/public/api/public/exhibitor-list";
