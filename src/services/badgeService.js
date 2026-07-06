import { DEFAULT_EVENT_ID } from "../constants/config";
import { mapBadgeFromApi } from "../utils/contentMappers";
import { isApiError } from "../utils/apiResponse";
import { apiRequest, jsonOptions } from "./apiClient";
import { getMyBadge } from "./meService";

export function normalizeRegId(value) {
  return String(value || "").trim().toUpperCase();
}

const REG_ID_PATTERN = /^PWS-[A-Z]{3}-\d{4}$/i;

export function extractRegIdFromScan(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  if (REG_ID_PATTERN.test(value)) {
    return normalizeRegId(value);
  }

  try {
    const parsed = JSON.parse(value);
    const candidate =
      parsed?.regId || parsed?.reg_id || parsed?.registrationId || parsed?.id;

    if (candidate && REG_ID_PATTERN.test(String(candidate))) {
      return normalizeRegId(candidate);
    }
  } catch {
    // Not JSON — continue with plain-text parsing.
  }

  const upperValue = value.toUpperCase();
  const match = upperValue.match(REG_ID_PATTERN);
  return match ? match[0] : "";
}

export async function fetchBadgeByRegId(regId) {
  const normalizedRegId = normalizeRegId(regId);

  try {
    const response = await apiRequest(`/badges/${encodeURIComponent(normalizedRegId)}`);
    return response?.data?.badge || null;
  } catch (error) {
    if (isApiError(error) && (error.httpStatus === 404 || error.httpStatus === 400)) {
      return null;
    }

    throw error;
  }
}

export async function fetchLinkedBadge(userId) {
  try {
    const badge = await getMyBadge(DEFAULT_EVENT_ID);
    if (badge?.regId || badge?.fullName) {
      return badge;
    }
  } catch (error) {
    if (!isApiError(error) || (error.httpStatus !== 404 && error.httpStatus !== 401)) {
      // Fall through to legacy local endpoint.
    }
  }

  try {
    const response = await apiRequest(
      `/badges/me?userId=${encodeURIComponent(String(userId))}`
    );
    return response?.data?.badge || null;
  } catch (error) {
    if (isApiError(error) && error.httpStatus === 404) {
      return null;
    }

    throw error;
  }
}

export async function linkBadgeToUser({ regId, userId }) {
  try {
    const response = await apiRequest(
      "/badges/link",
      jsonOptions("POST", {
        regId: normalizeRegId(regId),
        userId: String(userId),
      })
    );

    return response?.data?.badge || null;
  } catch (error) {
    if (isApiError(error) && error.httpStatus === 404) {
      return null;
    }

    throw error;
  }
}

export function mapProdBadgeResponse(response = {}) {
  return mapBadgeFromApi(response);
}
