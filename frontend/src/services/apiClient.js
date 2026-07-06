import { API_BASE_URL } from "../constants/config";
import { createApiError, isApiSuccess, normalizeApiEnvelope } from "../utils/apiResponse";
import { fetchWithInternetCheck } from "../utils/network";
import { getAuthHeaders, getAuthSession, getSessionUserId } from "./sessionService";

async function withUserIdQuery(path, method = "GET") {
  if (
    method.toUpperCase() !== "GET" ||
    path.startsWith("/auth") ||
    path.startsWith("/events/")
  ) {
    return path;
  }

  if (path.includes("userId=")) {
    return path;
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}userId=${encodeURIComponent(userId)}`;
}

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Calls the API and returns the full JSON body on success (code === 200).
 * On failure, throws an error with { api: { code, message, details }, httpStatus }.
 */
export async function apiRequest(path, options = {}) {
  const method = options.method || "GET";
  const requestPath = await withUserIdQuery(path, method);
  const response = await fetchWithInternetCheck(`${API_BASE_URL}${requestPath}`, options);
  const data = await parseJsonResponse(response);

  if (!data || typeof data !== "object") {
    throw createApiError(
      {
        code: response.status,
        message: "Invalid server response",
        details: {},
      },
      response.status
    );
  }

  const envelope = normalizeApiEnvelope(data);

  if (!response.ok || !isApiSuccess(data, response.status)) {
    throw createApiError(
      {
        code: envelope.code ?? response.status,
        message: envelope.message || "Request failed",
        details: envelope.details,
      },
      response.status
    );
  }

  return data;
}

/** Delegate JWT from login — required for `/events/{eventId}/me/*` routes on prod. */
export async function authenticatedApiRequest(path, options = {}) {
  const session = await getAuthSession();

  return apiRequest(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...getAuthHeaders(session?.token),
    },
  });
}

export function jsonOptions(method, body, headers = {}) {
  return {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  };
}
