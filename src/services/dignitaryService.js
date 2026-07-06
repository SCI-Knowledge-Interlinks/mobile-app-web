import { getDignitaries } from "./eventService";

export async function getDignitariesList() {
  return getDignitaries();
}
