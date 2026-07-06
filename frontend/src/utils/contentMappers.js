import { formatEventDateRange } from "./eventHomeMapper";
import { resolveMediaUrl } from "./mediaUrl";

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function initialsFromName(name = "") {
  return String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function mapExhibitor(item = {}) {
  return {
    id: String(item.id),
    name: pickString(item.name),
    booth: pickString(item.boothNo, item.booth),
    hall: pickString(item.hallNo, item.hall),
    title: pickString(item.title),
    description: pickString(item.details, item.description, item.title),
    logoUrl: resolveMediaUrl(pickString(item.logo, item.logoUrl, item.imageUrl, item.image)),
    logoKey: null,
  };
}

export function mapPublicExhibitor(item = {}, index = 0) {
  const name = pickString(item.display_name, item.fascia_name, item.company_name, "Exhibitor");
  const booth = pickString(item.stall_no);
  const hall = pickString(item.hall_no);
  const companyName = pickString(item.company_name);
  const logoUrl = pickString(item.logo);

  return {
    id: buildPublicExhibitorId(name, booth, hall, index),
    name,
    companyName,
    booth,
    hall,
    title: pickString(item.fascia_name, companyName),
    description: companyName,
    logoUrl,
    logoKey: null,
    website: pickString(item.website),
    websiteDisplay: pickString(item.website_display),
    isSponsor: Boolean(item.is_sponsor),
  };
}

function buildPublicExhibitorId(name, booth, hall, index) {
  const slug = [name, booth, hall]
    .filter(Boolean)
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || `exhibitor-${index}`;
}

export function mapPartner(item = {}) {
  const logoUrl = resolveMediaUrl(
    pickString(item.logo, item.logoUrl, item.imageUrl, item.image, item.image_url)
  );

  return {
    id: String(item.id),
    title: pickString(item.title, item.role, item.name, "Partner"),
    label: pickString(item.name, item.business),
    description: pickString(item.details, item.business),
    logoUrl,
    imageUrl: logoUrl,
    logoKey: null,
    socialLinks: Array.isArray(item.socialLinks) ? item.socialLinks : [],
  };
}

export function mapSpeaker(item = {}, index = 0) {
  const name = pickString(item.name);
  return {
    id: String(item.id ?? index),
    name,
    role: pickString(item.role, item.speakerType),
    company: pickString(item.company),
    speakerType: pickString(item.speakerType),
    initials: pickString(item.initials) || initialsFromName(name),
    about: pickString(item.bio, item.about),
    imageUrl: resolveMediaUrl(
      pickString(item.image, item.imageUrl, item.image_url, item.photoUrl, item.photo)
    ),
    sessions: Array.isArray(item.sessions)
      ? item.sessions.map((session) => ({
          id: String(session.id),
          title: pickString(session.title),
          date: pickString(session.sessionDate, session.date),
        }))
      : [],
    placeholderIndex: index,
  };
}

export function mapDignitary(item = {}, index = 0) {
  const name = pickString(item.name);
  return {
    id: String(item.id ?? index),
    name,
    role: pickString(item.role, item.designation, item.title),
    company: pickString(item.company, item.organization),
    imageUrl: resolveMediaUrl(
      pickString(item.image, item.imageUrl, item.image_url, item.photoUrl, item.photo)
    ),
    order: typeof item.order === "number" ? item.order : index,
    placeholderIndex: index,
  };
}

export function mapSession(item = {}) {
  const startTime = pickString(item.startTime);
  const endTime = pickString(item.endTime);
  const time =
    startTime && endTime ? `${startTime} - ${endTime}` : pickString(item.time, startTime);
  const speakers = Array.isArray(item.speakers) ? item.speakers : [];
  const speakerDetails = speakers.map((speaker, index) => mapSpeaker(speaker, index));

  return {
    id: String(item.id),
    day: pickString(item.dayLabel, item.day),
    track: pickString(item.track?.name, item.track),
    title: pickString(item.title),
    time,
    startTime,
    endTime,
    date: pickString(item.sessionDate, item.date),
    place: pickString(item.place),
    about: pickString(item.about),
    speakerDetails,
    speakers: speakerDetails.map((speaker) => speaker.initials || speaker.name),
    extraSpeakers: 0,
  };
}

export function mapGalleryItem(item = {}, index = 0) {
  return {
    id: String(item.id ?? index),
    title: pickString(item.title, "Gallery"),
    imageUrl: pickString(item.image, item.imageUrl),
  };
}

export function mapAwardItem(item = {}) {
  return {
    bannerUrl: pickString(item.image, item.bannerUrl),
    body: pickString(item.details, item.body),
  };
}

export function mapBociItem(item = {}) {
  return {
    bannerUrl: pickString(item.image, item.bannerUrl),
    heading: pickString(item.title, "Bus & Car Operators Confederation of India"),
    body: pickString(item.details, item.body),
  };
}

export function mapB2BContent(item = {}) {
  return {
    bannerUrl: pickString(item.image, item.bannerUrl),
    heading: pickString(item.title, "B2B Partnering"),
    body: pickString(item.details, item.body),
    loginUrl: pickString(item.loginUrl, item.login_url),
  };
}

function mapEventInfoBanner(banner, index) {
  return {
    id: String(banner?.id ?? index),
    imageUrl: resolveMediaUrl(
      pickString(banner?.imageUrl, banner?.image_url, banner?.image, banner?.url)
    ),
  };
}

export function mapEventInfo(response = {}) {
  const bannerImages = (Array.isArray(response.bannerImages) ? response.bannerImages : [])
    .map(mapEventInfoBanner)
    .filter((banner) => banner.imageUrl);

  const singleBanner = pickString(response.bannerImage, response.banner);
  const bannerUrl = resolveMediaUrl(bannerImages[0]?.imageUrl || singleBanner);

  return {
    title: pickString(response.title),
    heading: pickString(response.title, "About Event"),
    body: pickString(response.description, response.body),
    bannerUrl,
    bannerImages,
    eventDates: formatEventDateRange(response.startDate, response.endDate),
    socialLinks: Array.isArray(response.socialLinks) ? response.socialLinks : [],
  };
}

export function mapConferenceDays(response = {}) {
  const dates = Array.isArray(response.dates) ? response.dates : [];

  return dates.map((date, index) => ({
    label: `Day ${index + 1}`,
    date,
    sessionDate: date,
  }));
}

export function mapBadgeFromApi(response = {}) {
  const badge = response.badge || response.data?.badge || response;

  return {
    regId: pickString(badge.regId, badge.reg_id, badge.code),
    fullName: pickString(badge.fullName, badge.full_name, badge.name),
    company: pickString(badge.company),
    designation: pickString(badge.designation),
    badgeCategory: pickString(badge.badgeCategory, badge.badge_category),
    qrPayload: pickString(badge.qrPayload, badge.qr_payload, badge.regId, badge.reg_id),
    layout: badge.layout || null,
  };
}

export function mapProfileFromApi(response = {}) {
  const user = response.user || response.data?.user || {};
  const registration = response.registration || response.data?.registration || {};

  return {
    ...user,
    company: pickString(registration.company, user.company),
    designation: pickString(registration.designation, user.designation),
    profileImageUrl: pickString(user.profileImage, user.profileImageUrl, user.profile_image_url),
    mobileNumber: pickString(user.mobile, user.mobileNumber),
    badgeCategory: pickString(registration.badgeCategory, registration.badge_category),
  };
}
