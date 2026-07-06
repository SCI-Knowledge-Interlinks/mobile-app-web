import { DEFAULT_EVENT_ID } from "../constants/config";
import { apiRequest, jsonOptions } from "./apiClient";
import { getAuthHeaders, getAuthSession, saveAuthSession } from "./sessionService";
import { getMyProfile } from "./meService";
import { mapUser } from "../utils/userMapper";

export function bootstrapSession(token, eventId = DEFAULT_EVENT_ID) {
  return apiRequest("/auth/bootstrap", {
    ...jsonOptions("POST", { eventId }),
    headers: getAuthHeaders(token),
  }).then((data) => data.user);
}

export function getUserByEmail(email) {
  return apiRequest(`/auth/user?email=${encodeURIComponent(email)}`).then(
    (data) => data.user
  );
}

export function getUserByMobile(mobileNumber) {
  return apiRequest(
    `/auth/user?mobileNumber=${encodeURIComponent(mobileNumber)}`
  ).then((data) => data.user);
}

async function loadProdProfile() {
  const profile = await getMyProfile(DEFAULT_EVENT_ID);
  return mapUser(profile);
}

export async function loadUserFromSessionOrParams({ email, mobileNumber }) {
  const session = await getAuthSession();

  if (session?.token) {
    try {
      const user = await bootstrapSession(session.token);
      await saveAuthSession({ token: session.token, user });
      return user;
    } catch {
      try {
        const user = await loadProdProfile();
        await saveAuthSession({ token: session.token, user });
        return user;
      } catch {
        return session.user || null;
      }
    }
  }

  if (email) return getUserByEmail(email);
  if (mobileNumber) return getUserByMobile(mobileNumber);

  return null;
}

export async function saveUserProfile(profile) {
  const data = await apiRequest("/auth/profile", jsonOptions("PUT", profile));
  return data.user;
}
