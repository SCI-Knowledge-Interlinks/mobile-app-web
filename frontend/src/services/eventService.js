import { DEFAULT_EVENT_ID } from "../constants/config";
import { apiRequest } from "./apiClient";
import { getExhibitorsList } from "./exhibitorService";
import { fetchAllPaginated } from "../utils/pagination";
import {
  mapAwardItem,
  mapB2BContent,
  mapBociItem,
  mapConferenceDays,
  mapEventInfo,
  mapExhibitor,
  mapGalleryItem,
  mapDignitary,
  mapPartner,
  mapSession,
  mapSpeaker,
} from "../utils/contentMappers";

function eventPath(eventId, suffix) {
  return `/events/${eventId}${suffix}`;
}

export function getEventHome(eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, "/home"));
}

export function getEventInfo(eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, "/event-info")).then(mapEventInfo);
}

export function getExhibitors() {
  return getExhibitorsList();
}

export function getExhibitorById(id, eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, `/exhibitors/${id}`)).then(mapExhibitor);
}

export function getSpeakers(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/speakers")).then((items) =>
    items.map((item, index) => mapSpeaker(item, index))
  );
}

export function getSpeakerById(id, eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, `/speakers/${id}`)).then((item) => mapSpeaker(item, 0));
}

export function getSessions(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/sessions")).then((items) =>
    items.map(mapSession)
  );
}

export function getSessionDates(eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, "/sessions/dates")).then(mapConferenceDays);
}

export function getSessionById(id, eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, `/sessions/${id}`)).then((response) =>
    mapSession(response?.data ?? response)
  );
}

export function getPartners(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/partners")).then((items) =>
    items.map(mapPartner)
  );
}

export function getPartnerById(id, eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, `/partners/${id}`)).then(mapPartner);
}

export function getGallery(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/gallery")).then((items) =>
    items.map((item, index) => mapGalleryItem(item, index))
  );
}

export function getAwards(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/awards")).then((items) =>
    items.map(mapAwardItem)
  );
}

export function getBociContent(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/boci")).then((items) => {
    if (!items.length) {
      return null;
    }

    return mapBociItem(items[0]);
  });
}

export function getB2BPartnering(eventId = DEFAULT_EVENT_ID) {
  return apiRequest(eventPath(eventId, "/b2b-partnering")).then(mapB2BContent);
}

export async function getSpeakersPreview(limit = 5, eventId = DEFAULT_EVENT_ID) {
  const response = await apiRequest(`${eventPath(eventId, "/speakers")}?limit=${limit}`);
  return (response.data || []).map((item, index) => mapSpeaker(item, index));
}

export async function getPartnersPreview(limit = 3, eventId = DEFAULT_EVENT_ID) {
  const response = await apiRequest(`${eventPath(eventId, "/partners")}?limit=${limit}`);
  return (response.data || []).map(mapPartner);
}

export function getDignitaries(eventId = DEFAULT_EVENT_ID) {
  return fetchAllPaginated(eventPath(eventId, "/dignitaries")).then((items) =>
    items.map((item, index) => mapDignitary(item, index))
  );
}

export async function getDignitariesPreview(limit = 5, eventId = DEFAULT_EVENT_ID) {
  const response = await apiRequest(`${eventPath(eventId, "/dignitaries")}?limit=${limit}`);
  return (response.data || []).map((item, index) => mapDignitary(item, index));
}
