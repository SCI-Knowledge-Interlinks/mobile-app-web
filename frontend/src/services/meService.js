import { DEFAULT_EVENT_ID } from "../constants/config";
import { mapBadgeFromApi, mapProfileFromApi } from "../utils/contentMappers";
import { authenticatedApiRequest } from "./apiClient";

export function getMyBadge(eventId = DEFAULT_EVENT_ID) {
  return authenticatedApiRequest(`/events/${eventId}/me/badge`).then(mapBadgeFromApi);
}

export function getMyProfile(eventId = DEFAULT_EVENT_ID) {
  return authenticatedApiRequest(`/events/${eventId}/me/profile`).then(mapProfileFromApi);
}
