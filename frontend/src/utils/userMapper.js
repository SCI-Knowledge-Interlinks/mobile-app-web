export function formatUserFullName(user = {}) {
  return [user.firstName, user.lastName].map((part) => String(part || "").trim()).filter(Boolean).join(" ");
}

export function mapUser(user = {}, fallbackEmail = "") {
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const mobileNumber = user.mobileNumber || user.mobile || "";

  return {
    id: user.id || "",
    firstName,
    lastName,
    name: formatUserFullName({ firstName, lastName }),
    email: user.email || fallbackEmail || "",
    countryCode: user.countryCode || "+91",
    mobileNumber,
    mobile: mobileNumber
      ? `${user.countryCode || "+91"} ${mobileNumber}`
      : "",
    designation: user.designation || "",
    gender: user.gender || "",
    company: user.company || "",
    city: user.city || "",
    country: user.country || "",
    pincode: user.pincode || "",
    profileImageUrl: user.profileImageUrl || user.profileImage || "",
    badgeCategory: user.badgeCategory || "",
  };
}

export function getSafeText(value) {
  return typeof value === "string" ? value.trim() : "";
}
