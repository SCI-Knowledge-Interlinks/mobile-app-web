import { isValidEmail } from "../validations/authValidations";

export function getParamValue(value, fallback = "") {
  if (Array.isArray(value)) return value[0] || fallback;
  return value || fallback;
}

export function normalizeMobileNumber(value = "") {
  const digits = String(value).replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function getUserLookupFromParams(params = {}) {
  const rawEmail = getParamValue(params.userEmail || params.email, "");
  const email = isValidEmail(rawEmail) ? rawEmail.trim() : "";
  const mobileNumber = normalizeMobileNumber(getParamValue(params.mobileNumber, ""));

  return { email, mobileNumber };
}

export function getUserRouteParams(user = {}) {
  return {
    userEmail: user.email || "",
    countryCode: user.countryCode || "+91",
    mobileNumber: user.mobileNumber || "",
  };
}
