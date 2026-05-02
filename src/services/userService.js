import { apiRequest, jsonOptions } from "./apiClient";
import { getAuthHeaders, getAuthSession, saveAuthSession } from "./sessionService";

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

export function getCurrentUser(token) {
  return apiRequest("/auth/me", {
    headers: getAuthHeaders(token),
  }).then((data) => data.user);
}

export async function saveUserProfile(profile) {
  const data = await apiRequest("/auth/profile", jsonOptions("PUT", profile));
  return data.user;
}

export async function loadUserFromSessionOrParams({ email, mobileNumber }) {
  const session = await getAuthSession();

  if (session?.token) {
    const user = await getCurrentUser(session.token);
    await saveAuthSession({ token: session.token, user });
    return user;
  }

  if (email) return getUserByEmail(email);
  if (mobileNumber) return getUserByMobile(mobileNumber);

  return null;
}
