import { countryCodes } from "../constants/countryCodes";

export function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidPassword(value = "") {
  return value.trim().length >= 6;
}

export function isValidMobile(value = "") {
  return /^\d{4,15}$/.test(value.trim());
}

export function isValidCountryCode(value = "") {
  return countryCodes.some((country) => country.dialCode === value.trim());
}

export function validateMobileWithCountryCode(countryCode = "", mobileNumber = "") {
  if (!isValidCountryCode(countryCode)) {
    return "Please select a valid country code.";
  }

  if (!isValidMobile(mobileNumber)) {
    return "Enter a valid mobile number.";
  }

  return "";
}

export function isValidName(value = "") {
  return value.trim().length >= 2;
}

export function isValidPincode(value = "") {
  return !value.trim() || /^\d{4,10}$/.test(value.trim());
}
