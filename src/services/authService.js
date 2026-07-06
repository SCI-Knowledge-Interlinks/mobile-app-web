import { Platform } from "react-native";

import { DEFAULT_EVENT_ID } from "../constants/config";
import { apiRequest, authenticatedApiRequest, jsonOptions } from "./apiClient";

function getAuthPlatform() {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
}

function buildClientContext(page = "sign_in") {
  return {
    platform: getAuthPlatform(),
    page,
  };
}

export function sendLoginOtp({
  channel,
  email = "",
  countryCode = "",
  mobile = "",
  page = "sign_in",
}) {
  const apiChannel = channel === "mobile" ? "whatsapp" : channel;

  return apiRequest(
    "/auth/otp/send",
    jsonOptions("POST", {
      channel: apiChannel,
      eventId: DEFAULT_EVENT_ID,
      email,
      countryCode,
      mobile,
      ...buildClientContext(page),
    })
  );
}

export function verifyLoginOtp({ requestId, otp }) {
  return apiRequest(
    "/auth/otp/verify",
    jsonOptions("POST", {
      requestId,
      otp,
      eventId: DEFAULT_EVENT_ID,
    })
  ).then((data) => ({ token: data.token, user: data.user, message: data.message }));
}

export function loginWithEmail(email, password) {
  return apiRequest(
    "/auth/login",
    jsonOptions("POST", {
      eventId: DEFAULT_EVENT_ID,
      email,
      password,
      countryCode: "",
      mobile: "",
      ...buildClientContext("sign_in"),
    })
  ).then((data) => ({ token: data.token, user: data.user, message: data.message }));
}

export function loginWithMobile({ countryCode, mobileNumber, password }) {
  return apiRequest(
    "/auth/login",
    jsonOptions("POST", {
      eventId: DEFAULT_EVENT_ID,
      email: "",
      password,
      countryCode,
      mobile: mobileNumber,
      ...buildClientContext("sign_in"),
    })
  ).then((data) => ({ token: data.token, user: data.user, message: data.message }));
}

export function getPasswordResetOptions() {
  return apiRequest("/auth/password-reset/options");
}

export function requestPasswordReset({
  channel = "email",
  email = "",
  countryCode = "",
  mobile = "",
}) {
  return apiRequest(
    "/auth/password-reset/request",
    jsonOptions("POST", {
      eventId: DEFAULT_EVENT_ID,
      channel,
      email,
      countryCode,
      mobile,
    })
  );
}

export function confirmPasswordReset({
  requestId,
  code,
  password,
  token = "",
}) {
  const body = token
    ? { token, password }
    : {
        requestId,
        code,
        eventId: DEFAULT_EVENT_ID,
        password,
      };

  return apiRequest("/auth/password-reset/confirm", jsonOptions("POST", body));
}

/** @deprecated Use requestPasswordReset for production API */
export function sendEmailOtp(email, purpose, password = "") {
  return apiRequest(
    "/auth/send-email-otp",
    jsonOptions("POST", { email, purpose, password })
  );
}

/** @deprecated Use confirmPasswordReset for production API */
export function verifyEmailOtp(email, otp, purpose) {
  return apiRequest(
    "/auth/verify-email-otp",
    jsonOptions("POST", { email, otp, purpose })
  );
}

/** @deprecated Use confirmPasswordReset for production API */
export function resetPassword(form) {
  return apiRequest("/auth/reset-password", jsonOptions("POST", form));
}

export function registerDeviceToken({ fcmToken, platform }) {
  return authenticatedApiRequest(
    "/auth/device-token",
    jsonOptions("POST", {
      fcmToken,
      platform,
    })
  );
}

export function acknowledgeNotification({ deliveryId, event }) {
  return authenticatedApiRequest(
    "/auth/notification-ack",
    jsonOptions("POST", {
      deliveryId,
      event,
    })
  );
}
