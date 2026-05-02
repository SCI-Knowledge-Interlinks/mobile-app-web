import { apiRequest, jsonOptions } from "./apiClient";

export function sendEmailOtp(email, purpose, password = "") {
  return apiRequest(
    "/auth/send-email-otp",
    jsonOptions("POST", { email, purpose, password })
  );
}

export function verifyEmailOtp(email, otp, purpose) {
  return apiRequest(
    "/auth/verify-email-otp",
    jsonOptions("POST", { email, otp, purpose })
  );
}

export function sendMobileOtp({ countryCode, phoneNumber, name, purpose }) {
  return apiRequest(
    "/whatsapp/send-otp",
    jsonOptions("POST", { countryCode, phoneNumber, name, purpose })
  );
}

export function verifyMobileOtp({ countryCode, phoneNumber, otp, purpose }) {
  return apiRequest(
    "/whatsapp/verify-otp",
    jsonOptions("POST", { countryCode, phoneNumber, otp, purpose })
  );
}

export function registerUser(form) {
  return apiRequest("/auth/register", jsonOptions("POST", form));
}

export function resetPassword(form) {
  return apiRequest("/auth/reset-password", jsonOptions("POST", form));
}
