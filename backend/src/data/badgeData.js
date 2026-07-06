const DEFAULT_BADGE_REGISTRATIONS = [
  {
    regId: "PWS-OPE-0001",
    fullName: "ROHIT LAKHEDA",
    company: "SCI KNOWLEDGE INTERLINKS\nPVT LTD",
    designation: "",
    badgeCategory: "OPE",
  },
];

function getDefaultBadgeRegistrations() {
  return DEFAULT_BADGE_REGISTRATIONS.map((badge) => ({ ...badge }));
}

module.exports = {
  getDefaultBadgeRegistrations,
};
