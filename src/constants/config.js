import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_API_PORT = "3000";
const DEFAULT_PRODUCTION_API_BASE_URL =
  "https://azure-cassowary-742969.hostingersite.com";

function normalizeBaseUrl(url) {
  return String(url || "").trim().replace(/\/$/, "");
}

function readAppEnv() {
  return (
    Constants.expoConfig?.extra?.appEnv ||
    Constants.manifest2?.extra?.expoClient?.extra?.appEnv ||
    Constants.manifest?.extra?.appEnv ||
    {}
  );
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

function isLocalWebHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function getWebDevApiBaseUrl(port) {
  if (Platform.OS !== "web" || typeof globalThis?.location?.hostname !== "string") {
    return null;
  }

  const hostname = globalThis.location.hostname;
  if (isLocalWebHostname(hostname)) {
    return `http://localhost:${port}`;
  }

  return null;
}

function isLocalApiUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/i.test(url);
}

function getConfiguredApiBaseUrl() {
  const appEnv = readAppEnv();
  const fromExtra = normalizeBaseUrl(appEnv.apiBaseUrl);
  const fromEnv = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

  return fromExtra || fromEnv || DEFAULT_PRODUCTION_API_BASE_URL;
}

function resolveApiBaseUrl() {
  const port = process.env.EXPO_PUBLIC_API_PORT || DEFAULT_API_PORT;
  const webDevApi = getWebDevApiBaseUrl(port);
  const configuredApi = getConfiguredApiBaseUrl();

  if (configuredApi) {
    // Web dev only: route API calls through the Expo dev server proxy to avoid CORS.
    if (typeof __DEV__ !== "undefined" && __DEV__ && webDevApi && !isLocalApiUrl(configuredApi)) {
      return "";
    }

    return rewriteLocalhostForAndroid(configuredApi);
  }

  if (webDevApi) {
    return webDevApi;
  }

  const devHost = getExpoDevHost();

  if (devHost && !isLocalWebHostname(devHost)) {
    return rewriteLocalhostForAndroid(`http://${devHost}:${port}`);
  }

  if (Platform.OS === "android") {
    return `http://10.0.2.2:${port}`;
  }

  return DEFAULT_PRODUCTION_API_BASE_URL;
}

const appEnv = readAppEnv();

export const API_BASE_URL = resolveApiBaseUrl();

export const APP_NAME =
  appEnv.appName || process.env.EXPO_PUBLIC_APP_NAME || process.env.APP_NAME || "Prawaas";

export const DEFAULT_EVENT_ID = Number(
  appEnv.eventId || process.env.EXPO_PUBLIC_EVENT_ID || 1
);

export const EXHIBITOR_LIST_API_URL =
  appEnv.exhibitorListUrl ||
  process.env.EXPO_PUBLIC_EXHIBITOR_LIST_URL ||
  "https://prawaas.com/prawaas-2026/public/api/public/exhibitor-list";

export const FIREBASE_VAPID_KEY =
  appEnv.firebaseVapidKey || process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY || "";
