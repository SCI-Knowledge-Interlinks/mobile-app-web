import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "prawaas_event_journey_v1";
export const EVENT_JOURNEY_POINTS = 5;

export const EVENT_JOURNEY_ACTIVITIES = {
  login: { label: "Logged in successfully", order: 1 },
  speakers: { label: "Visited Speakers", order: 2 },
  speaker_info: { label: "Opened a Speaker profile", order: 3 },
  partners: { label: "Visited Partners", order: 4 },
  partner_info: { label: "Opened a Partner profile", order: 5 },
  dignitaries: { label: "Visited Dignitaries", order: 6 },
  exhibition: { label: "Visited Exhibition", order: 7 },
  exhibitor_info: { label: "Opened an Exhibitor profile", order: 8 },
  conference: { label: "Visited Conference", order: 9 },
  session_details: { label: "Opened a Session", order: 10 },
  awards: { label: "Visited Awards", order: 11 },
  b2b: { label: "Visited B2B Partnering", order: 12 },
  floor_plan: { label: "Visited Floor Plan", order: 13 },
  boci: { label: "Visited BOCI Partner", order: 14 },
  gallery: { label: "Visited Gallery", order: 15 },
  event_info: { label: "Visited About Event", order: 16 },
  contact_us: { label: "Visited Contact Us", order: 17 },
  my_badge: { label: "Visited My Badge", order: 18 },
  badge_scanner: { label: "Used Badge Scanner", order: 19 },
  notifications: { label: "Visited Notifications", order: 20 },
  messages: { label: "Visited Messages", order: 21 },
  messages_chat: { label: "Opened a Chat", order: 22 },
  event_journey: { label: "Viewed Event Journey", order: 23 },
};

export const ROUTE_ACTIVITY_MAP = {
  "/speakers": "speakers",
  "/speaker-info": "speaker_info",
  "/partners-new": "partners",
  "/partner-info": "partner_info",
  "/dignitaries": "dignitaries",
  "/exhibitor-new": "exhibition",
  "/exhibitor-info": "exhibitor_info",
  "/conference-list": "conference",
  "/session-details-new": "session_details",
  "/awards": "awards",
  "/b2b-partnering": "b2b",
  "/floor-plan": "floor_plan",
  "/boci-partner": "boci",
  "/gallery": "gallery",
  "/event-info": "event_info",
  "/contact-us": "contact_us",
  "/my-badge": "my_badge",
  "/badge-scanner": "badge_scanner",
  "/notifications": "notifications",
  "/messages": "messages",
  "/event-journey": "event_journey",
};

function canUseLocalStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

async function readState() {
  try {
    const raw =
      Platform.OS === "web" && canUseLocalStorage()
        ? window.localStorage.getItem(STORAGE_KEY)
        : await SecureStore.getItemAsync(STORAGE_KEY);

    if (!raw) {
      return { completed: [] };
    }

    const parsed = JSON.parse(raw);
    const completed = Array.isArray(parsed?.completed) ? parsed.completed : [];
    return { completed: [...new Set(completed)] };
  } catch {
    return { completed: [] };
  }
}

async function writeState(state) {
  const value = JSON.stringify({
    completed: [...new Set(state.completed || [])],
  });

  if (Platform.OS === "web" && canUseLocalStorage()) {
    window.localStorage.setItem(STORAGE_KEY, value);
    return;
  }

  await SecureStore.setItemAsync(STORAGE_KEY, value);
}

export function getMaxJourneyScore() {
  return Object.keys(EVENT_JOURNEY_ACTIVITIES).length * EVENT_JOURNEY_POINTS;
}

export function resolveActivityKeyFromPath(pathname = "") {
  const normalized = String(pathname).split("?")[0];
  if (ROUTE_ACTIVITY_MAP[normalized]) {
    return ROUTE_ACTIVITY_MAP[normalized];
  }

  if (normalized.startsWith("/chat/")) {
    return "messages_chat";
  }

  return null;
}

export function buildJourneySummary(completedKeys = []) {
  const completed = [...new Set(completedKeys)].filter((key) => EVENT_JOURNEY_ACTIVITIES[key]);
  const totalScore = completed.length * EVENT_JOURNEY_POINTS;
  const maxScore = getMaxJourneyScore();
  const progressPercent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const activities = Object.entries(EVENT_JOURNEY_ACTIVITIES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([key, meta]) => ({
      key,
      label: meta.label,
      points: EVENT_JOURNEY_POINTS,
      completed: completed.includes(key),
    }));

  return {
    completed,
    activities,
    totalScore,
    maxScore,
    progressPercent,
  };
}

export async function getEventJourneySummary() {
  const state = await readState();
  return buildJourneySummary(state.completed);
}

export async function trackEventJourneyActivity(activityKey) {
  if (!activityKey || !EVENT_JOURNEY_ACTIVITIES[activityKey]) {
    return getEventJourneySummary();
  }

  const state = await readState();
  const alreadyCompleted = state.completed.includes(activityKey);

  if (!alreadyCompleted) {
    state.completed.push(activityKey);
    await writeState(state);
  }

  const summary = buildJourneySummary(state.completed);

  return {
    ...summary,
    newlyCompleted: !alreadyCompleted,
    activityKey,
  };
}

export async function trackEventJourneyPath(pathname) {
  const activityKey = resolveActivityKeyFromPath(pathname);
  if (!activityKey) {
    return getEventJourneySummary();
  }

  return trackEventJourneyActivity(activityKey);
}
