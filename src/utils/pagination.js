import { apiRequest } from "../services/apiClient";

export async function fetchAllPaginated(path, { limit = 50, maxPages = 20 } = {}) {
  const items = [];
  let cursor = null;
  let page = 0;

  while (page < maxPages) {
    const query = new URLSearchParams({ limit: String(limit) });
    if (cursor) {
      query.set("cursor", cursor);
    }

    const separator = path.includes("?") ? "&" : "?";
    const response = await apiRequest(`${path}${separator}${query.toString()}`);
    const batch = Array.isArray(response?.data) ? response.data : [];
    items.push(...batch);

    const pagination = response?.pagination || {};
    if (!pagination.hasMore || !pagination.nextCursor) {
      break;
    }

    cursor = pagination.nextCursor;
    page += 1;
  }

  return items;
}
