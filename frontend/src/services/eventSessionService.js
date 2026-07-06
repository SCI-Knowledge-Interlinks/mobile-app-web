import { getSessionDates, getSessions } from "./eventService";

export async function getSessionsList() {
  return getSessions();
}

export async function getConferenceDays() {
  return getSessionDates();
}
