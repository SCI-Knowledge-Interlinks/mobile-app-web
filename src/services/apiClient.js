import { API_BASE_URL } from "../constants/config";
import { fetchWithInternetCheck } from "../utils/network";

export async function apiRequest(path, options = {}) {
  const response = await fetchWithInternetCheck(`${API_BASE_URL}${path}`, options);
  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Request failed");
  }

  return data;
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
