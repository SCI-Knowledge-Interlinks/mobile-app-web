export function mapUser(user = {}, fallbackEmail = "") {
  return {
    id: user.id || "",
    name: user.name || "",
    email: user.email || fallbackEmail || "",
    countryCode: user.countryCode || "+91",
    mobileNumber: user.mobileNumber || "",
    mobile: user.mobileNumber
      ? `${user.countryCode || "+91"} ${user.mobileNumber}`
      : "",
    designation: user.designation || "",
    gender: user.gender || "",
    company: user.company || "",
    city: user.city || "",
    country: user.country || "",
    pincode: user.pincode || "",
    profileImageUrl: user.profileImageUrl || "",
  };
}

export function getSafeText(value) {
  return typeof value === "string" ? value.trim() : "";
}
