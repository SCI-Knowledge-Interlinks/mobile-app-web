import { API_BASE_URL } from "../constants/config";
import { getAuthHeaders, getAuthSession, saveAuthSession } from "../services/sessionService";
import { fetchWithInternetCheck } from "./network";

function getFileName(asset = {}) {
  if (asset.fileName) return asset.fileName;

  const uriName = String(asset.uri || "").split("/").pop();
  return uriName && uriName.includes(".") ? uriName : `profile-${Date.now()}.jpg`;
}

function getMimeType(asset = {}) {
  if (asset.mimeType) return asset.mimeType;

  const fileName = getFileName(asset).toLowerCase();
  if (fileName.endsWith(".png")) return "image/png";
  if (fileName.endsWith(".webp")) return "image/webp";
  return "image/jpeg";
}

async function appendImage(formData, asset) {
  const fileName = getFileName(asset);

  if (asset.file) {
    formData.append("profileImage", asset.file, fileName);
    return;
  }

  // Web image picker can return blob URLs.
  if (typeof window !== "undefined" && String(asset.uri || "").startsWith("blob:")) {
    const blob = await fetch(asset.uri).then((response) => response.blob());
    formData.append("profileImage", blob, fileName);
    return;
  }

  formData.append("profileImage", {
    uri: asset.uri,
    name: fileName,
    type: getMimeType(asset),
  });
}

export async function uploadProfilePhoto(asset) {
  const session = await getAuthSession();

  if (!session?.token) {
    throw new Error("Please login again to update profile photo.");
  }

  const formData = new FormData();
  await appendImage(formData, asset);

  const response = await fetchWithInternetCheck(`${API_BASE_URL}/auth/profile-photo`, {
    method: "POST",
    headers: getAuthHeaders(session.token),
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to upload profile photo");
  }

  if (data.user) {
    await saveAuthSession({ token: session.token, user: data.user });
  }

  return data.profileImageUrl || data.user?.profileImageUrl || "";
}
