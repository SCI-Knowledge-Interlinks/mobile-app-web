function toMinutes(hours, minutes, period) {
  let h = hours;
  const normalizedPeriod = period?.toUpperCase();

  if (normalizedPeriod === "PM" && h !== 12) {
    h += 12;
  } else if (normalizedPeriod === "AM" && h === 12) {
    h = 0;
  }

  return h * 60 + minutes;
}

export function parseTimeToMinutes(value) {
  if (!value) {
    return null;
  }

  const raw = String(value).trim();
  if (!raw) {
    return null;
  }

  if (/[T\-]/.test(raw)) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return date.getHours() * 60 + date.getMinutes();
    }
  }

  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!match) {
    return null;
  }

  return toMinutes(
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    match[3]
  );
}

export function parseSessionTimeRangeStart(timeRange) {
  if (!timeRange) {
    return null;
  }

  const parts = String(timeRange).split(/\s*-\s*/);
  const start = parts[0]?.trim();
  const end = parts.slice(1).join("-").trim();
  const period =
    start?.match(/\b(AM|PM)\b/i)?.[0] || end?.match(/\b(AM|PM)\b/i)?.[0];

  const startOnly = start?.match(/^(\d{1,2}):(\d{2})$/);
  if (startOnly && period) {
    return toMinutes(
      parseInt(startOnly[1], 10),
      parseInt(startOnly[2], 10),
      period
    );
  }

  return parseTimeToMinutes(start);
}

export function getSessionStartSortValue(session = {}) {
  const fromStartTime = parseTimeToMinutes(session.startTime);
  if (fromStartTime !== null) {
    return fromStartTime;
  }

  const fromRange = parseSessionTimeRangeStart(session.time);
  if (fromRange !== null) {
    return fromRange;
  }

  return Number.MAX_SAFE_INTEGER;
}

export function compareSessionsByStartTime(a, b) {
  const diff = getSessionStartSortValue(a) - getSessionStartSortValue(b);
  if (diff !== 0) {
    return diff;
  }

  return String(a?.title || "").localeCompare(String(b?.title || ""));
}
