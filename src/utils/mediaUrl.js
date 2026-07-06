import { API_BASE_URL } from "../constants/config";

/** Turn API media paths (/uploads/...) into absolute URLs the Image component can load. */
export function resolveMediaUrl(url) {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  const base = API_BASE_URL.replace(/\/$/, "");
  return value.startsWith("/") ? `${base}${value}` : `${base}/${value}`;
}
