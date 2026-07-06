import { Platform } from "react-native";

import {
  getApiErrorMessage as getApiErrorMessageFromEnvelope,
  getApiErrorResponse,
  isApiError,
} from "./apiResponse";

export { getApiErrorResponse, isApiError };

export const NO_INTERNET_ERROR_CODE = "NO_INTERNET";
export const CONNECTION_ERROR_CODE = "CONNECTION_FAILED";

export function createNoInternetError() {
  const error = new Error("No internet connection. Please try again.");
  error.code = NO_INTERNET_ERROR_CODE;
  return error;
}

export function createConnectionError() {
  const error = new Error("Unable to connect to the server. Please try again.");
  error.code = CONNECTION_ERROR_CODE;
  return error;
}

export function isNoInternetError(error) {
  return error?.code === NO_INTERNET_ERROR_CODE;
}

export function isConnectionError(error) {
  return error?.code === CONNECTION_ERROR_CODE;
}

export function getApiErrorMessage(error) {
  if (isNoInternetError(error) || isConnectionError(error)) return error.message;
  return getApiErrorMessageFromEnvelope(error);
}

function browserIsOffline() {
  return (
    typeof globalThis?.navigator?.onLine === "boolean" &&
    globalThis.navigator.onLine === false
  );
}

function isNetworkError(error) {
  const message = String(error?.message || "").toLowerCase();
  return (
    error instanceof TypeError ||
    message.includes("network request failed") ||
    message.includes("failed to fetch") ||
    message.includes("network error")
  );
}

export async function fetchWithInternetCheck(url, options) {
  if (browserIsOffline()) {
    throw createNoInternetError();
  }

  try {
    return await fetch(url, options);
  } catch (error) {
    if (isNetworkError(error)) {
      if (Platform.OS === "web" && !browserIsOffline()) {
        throw createConnectionError();
      }

      throw createNoInternetError();
    }

    throw error;
  }
}
