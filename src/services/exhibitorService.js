import { EXHIBITOR_LIST_API_URL } from "../constants/config";
import { mapPublicExhibitor } from "../utils/contentMappers";
import { fetchWithInternetCheck } from "../utils/network";

async function parseJsonResponse(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function createExhibitorListError(message = "Failed to load exhibitors") {
  const error = new Error(message);
  error.name = "ApiError";
  return error;
}

export async function getExhibitorsList() {
  const items = [];
  let page = 1;
  let lastPage = 1;

  while (page <= lastPage) {
    const separator = EXHIBITOR_LIST_API_URL.includes("?") ? "&" : "?";
    const response = await fetchWithInternetCheck(
      `${EXHIBITOR_LIST_API_URL}${separator}page=${page}`
    );
    const payload = await parseJsonResponse(response);

    if (!response.ok || !payload?.success) {
      throw createExhibitorListError(payload?.message || "Failed to load exhibitors");
    }

    const batch = Array.isArray(payload.data) ? payload.data : [];
    items.push(...batch.map((item, index) => mapPublicExhibitor(item, items.length + index)));

    lastPage = Number(payload.last_page) || 1;
    page += 1;
  }

  return items;
}
