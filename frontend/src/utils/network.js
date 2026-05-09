export const NO_INTERNET_ERROR_CODE = "NO_INTERNET";

export function createNoInternetError() {
  const error = new Error("No internet connection. Please try again.");
  error.code = NO_INTERNET_ERROR_CODE;
  return error;
}

export function isNoInternetError(error) {
  return error?.code === NO_INTERNET_ERROR_CODE;
}

export function getApiErrorMessage(error) {
  if (isNoInternetError(error)) return error.message;
  return error?.message || "Something went wrong. Please try again.";
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
    message.includes("failed to fetch")
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
      throw createNoInternetError();
    }

    throw error;
  }
}
