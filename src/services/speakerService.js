import { getSpeakers } from "./eventService";

export async function getSpeakersList() {
  return getSpeakers();
}
