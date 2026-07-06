import { resolveMediaUrl } from "./mediaUrl";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SOCIAL_ICON_MAP = {
  x: { icon: "logo-x", iconSet: "ionicons" },
  twitter: { icon: "logo-x", iconSet: "ionicons" },
  linkedin: { icon: "linkedin", iconSet: "fontawesome" },
  instagram: { icon: "instagram", iconSet: "fontawesome" },
  facebook: { icon: "facebook", iconSet: "fontawesome" },
  youtube: { icon: "youtube-play", iconSet: "fontawesome" },
};

function pickString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === "object" && Array.isArray(value.items)) {
    return value.items;
  }

  return [];
}

function parseDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatEventDateRange(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (start && end) {
    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${start.getDate()}-${end.getDate()} ${MONTHS[start.getMonth()]}, ${start.getFullYear()}`;
    }

    return `${start.getDate()} ${MONTHS[start.getMonth()]} - ${end.getDate()} ${MONTHS[end.getMonth()]}, ${end.getFullYear()}`;
  }

  if (start) {
    return `${start.getDate()} ${MONTHS[start.getMonth()]}, ${start.getFullYear()}`;
  }

  if (end) {
    return `${end.getDate()} ${MONTHS[end.getMonth()]}, ${end.getFullYear()}`;
  }

  return "";
}

function parseCoordinate(value) {
  if (value == null || value === "") {
    return null;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export const DEFAULT_VENUE = {
  name: "Helipad Exhibition Centre",
  address: "Sector 17, Gandhinagar, Gujarat 382016",
  latitude: 23.22618069,
  longitude: 72.651064,
};

export function buildVenueLinks(name, address, coordinates = {}) {
  const venueName = pickString(name, DEFAULT_VENUE.name);
  const venueAddress = pickString(address, DEFAULT_VENUE.address);
  const latitude =
    parseCoordinate(coordinates.latitude ?? coordinates.lat) ?? DEFAULT_VENUE.latitude;
  const longitude =
    parseCoordinate(coordinates.longitude ?? coordinates.lng ?? coordinates.lon) ??
    DEFAULT_VENUE.longitude;
  const query = [venueName, venueAddress].filter(Boolean).join(", ");
  const mapPoint = `${latitude},${longitude}`;
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return {
    name: venueName,
    address: venueAddress,
    query: query || venueAddress || venueName,
    latitude,
    longitude,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${mapPoint}`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${mapPoint}`,
    embedUrl: `https://www.google.com/maps?q=${mapPoint}&z=16&output=embed`,
    staticMapUrl: googleMapsApiKey
      ? `https://maps.googleapis.com/maps/api/staticmap?center=${mapPoint}&zoom=16&size=720x320&scale=2&maptype=satellite&markers=color:red%7C${mapPoint}&key=${googleMapsApiKey}`
      : null,
  };
}

function mapSpeaker(speaker, index) {
  const name = pickString(
    speaker?.name,
    [speaker?.firstName, speaker?.lastName].filter(Boolean).join(" ")
  );

  return {
    id: String(speaker?.id ?? speaker?.speakerId ?? index),
    name,
    role: pickString(speaker?.role, speaker?.designation, speaker?.title),
    company: pickString(speaker?.company, speaker?.organization),
    imageUrl: resolveMediaUrl(
      pickString(speaker?.imageUrl, speaker?.image_url, speaker?.image, speaker?.photoUrl, speaker?.photo)
    ),
    placeholderIndex: index,
  };
}

function mapPartner(partner, index) {
  const imageUrl = resolveMediaUrl(
    pickString(
      partner?.imageUrl,
      partner?.image_url,
      partner?.logoUrl,
      partner?.logo_url,
      partner?.logo,
      partner?.image
    )
  );

  return {
    id: String(partner?.id ?? index),
    title: pickString(partner?.title, partner?.category, partner?.type, "Partner"),
    imageUrl,
    logoUrl: imageUrl,
  };
}

function mapSocialLink(link, index) {
  const platform = pickString(link?.platform, link?.name, link?.type).toLowerCase();
  const url = pickString(link?.url, link?.href, link?.link);
  const icon = SOCIAL_ICON_MAP[platform] || {
    icon: "link",
    iconSet: "ionicons",
  };

  return {
    id: String(link?.id ?? (platform || index)),
    ...icon,
    url,
  };
}

function mapBannerImage(banner, index) {
  const imageUrl = resolveMediaUrl(
    pickString(banner?.imageUrl, banner?.image_url, banner?.image, banner?.url)
  );

  return {
    id: String(banner?.id ?? index),
    imageUrl,
    altText: pickString(banner?.altText, banner?.alt_text),
  };
}

function normalizeQuickAccessKey(value) {
  const raw = pickString(value).toLowerCase();
  const aliases = {
    "floor plan": "floor-plan",
    floor_plan: "floor-plan",
    floorplan: "floor-plan",
    "b2b partnering": "b2b",
    b2b_partnering: "b2b",
    "explore more": "hub",
    explore_more: "hub",
    "more": "hub",
  };

  return aliases[raw] || raw.replace(/\s+/g, "-");
}

function mapQuickAccessItem(item, index) {
  const title = pickString(item?.title, item?.label, item?.name);
  const routeKey = normalizeQuickAccessKey(
    pickString(item?.routeKey, item?.route, item?.key, item?.slug, item?.action, item?.type, title)
  );

  return {
    id: String(item?.id ?? routeKey ?? index),
    title,
    routeKey,
    imageUrl: pickString(item?.imageUrl, item?.image_url, item?.iconUrl, item?.icon_url, item?.icon),
  };
}

export function mapEventHomeResponse(response = {}) {
  const event = response.event || response.data?.event || {};
  const venue = response.venue || event.venue || response.data?.venue || {};
  const venueName = pickString(
    venue.name,
    venue.venueName,
    venue.venue_name,
    event.venueName,
    event.venue_name
  );
  const venueAddress = pickString(
    venue.address,
    venue.venueAddress,
    venue.venue_address,
    venue.city,
    event.venueAddress,
    event.venue_address,
    event.location
  );
  const eventDates =
    pickString(
      response.dateLabel,
      response.dates,
      response.eventDates,
      event.dateLabel,
      event.dates
    ) ||
    formatEventDateRange(
      pickString(event.startDate, event.start_date, response.startDate, response.start_date),
      pickString(event.endDate, event.end_date, response.endDate, response.end_date)
    );

  const speakers = asArray(
    response.speakers ?? response.featuredSpeakers ?? response.data?.speakers
  )
    .map(mapSpeaker)
    .filter((speaker) => speaker.name);

  const partners = asArray(response.partners ?? response.data?.partners)
    .map(mapPartner)
    .filter((partner) => partner.title || partner.imageUrl);

  const dignitaries = asArray(response.dignitaries ?? response.data?.dignitaries)
    .map(mapSpeaker)
    .filter((dignitary) => dignitary.name);

  const socialLinks = asArray(response.socialLinks ?? response.social ?? response.data?.socialLinks)
    .map(mapSocialLink)
    .filter((link) => link.url);

  const bannerImages = asArray(response.bannerImages ?? response.data?.bannerImages)
    .map(mapBannerImage)
    .filter((banner) => banner.imageUrl);

  const quickAccessItems = asArray(
    response.quickAccessItems ??
      response.quickAccess ??
      response.data?.quickAccessItems ??
      response.data?.quickAccess
  )
    .map(mapQuickAccessItem)
    .filter((item) => item.title || item.imageUrl);

  return {
    eventDates,
    venue: buildVenueLinks(venueName, venueAddress, venue),
    speakers,
    partners,
    dignitaries,
    socialLinks,
    bannerImages,
    quickAccessItems,
  };
}
