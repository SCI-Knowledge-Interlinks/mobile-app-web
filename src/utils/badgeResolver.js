import {
  extractRegIdFromScan,
  fetchBadgeByRegId,
  linkBadgeToUser,
} from "../services/badgeService";
import { saveBadgeSession } from "../services/badgeSessionService";

export async function resolveBadgeFromScan({ rawValue, userId }) {
  const regId = extractRegIdFromScan(rawValue);

  if (!regId) {
    throw new Error("This QR code does not contain a valid registration ID.");
  }

  const badgeDetails = await fetchBadgeByRegId(regId);

  if (!badgeDetails) {
    throw new Error("Badge details were not found for this registration ID.");
  }

  if (userId) {
    await linkBadgeToUser({ regId, userId });
  }

  await saveBadgeSession(badgeDetails);
  return badgeDetails;
}
