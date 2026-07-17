const DAY_INDEX = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const WEEKDAY_SHORT_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

// All restaurants are in Mumbai, so "now" must always be India Standard Time —
// regardless of the visitor's device/browser timezone — or open/closed status
// would be wrong for anyone not physically in IST.
const IST_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

function getIstParts(date) {
  const parts = IST_FORMATTER.formatToParts(date);
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  let hour = parseInt(lookup.hour, 10);
  if (hour === 24) hour = 0; // some Intl implementations emit "24" for midnight
  const minute = parseInt(lookup.minute, 10);
  return { dayIndex: WEEKDAY_SHORT_INDEX[lookup.weekday], minutes: hour * 60 + minute };
}

function parseClock(token, inheritMeridiem) {
  const m = token.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3] ? m[3].toUpperCase() : inheritMeridiem;
  if (!meridiem) return null;
  if (meridiem === 'AM') {
    if (hour === 12) hour = 0;
  } else if (hour !== 12) {
    hour += 12;
  }
  return { minutes: hour * 60 + minute, meridiem };
}

// Returns a list of [startMinute, endMinute] ranges (endMinute may exceed 1440 for overnight spans).
function parseDayRanges(hoursStr) {
  if (!hoursStr || /closed/i.test(hoursStr)) return [];
  if (/24 hours/i.test(hoursStr)) return [[0, 1440]];

  const ranges = [];
  for (const segment of hoursStr.split(',')) {
    const [rawStart, rawEnd] = segment.split(/\s+to\s+/i);
    if (!rawStart || !rawEnd) continue;
    const end = parseClock(rawEnd, null);
    if (!end) continue;
    let start = parseClock(rawStart, end.meridiem);
    if (!start) continue;

    if (start.minutes >= end.minutes) {
      // Try the opposite meridiem for the start time (unspecified AM/PM case).
      const flipped = end.meridiem === 'AM' ? 'PM' : 'AM';
      const retry = parseClock(rawStart, flipped);
      if (retry && retry.minutes < end.minutes) {
        start = retry;
      }
    }

    let endMinutes = end.minutes;
    if (endMinutes <= start.minutes) endMinutes += 1440; // crosses midnight
    ranges.push([start.minutes, endMinutes]);
  }
  return ranges;
}

// Returns true/false, or null when hours data is missing/unparseable.
export function isOpenNow(openingHours, now = new Date()) {
  if (!openingHours || openingHours.length === 0) return null;

  const { dayIndex: todayIdx, minutes: nowMinutes } = getIstParts(now);
  const byDay = new Map(openingHours.map((h) => [DAY_INDEX[h.day], h.hours]));

  for (const dayOffset of [0, -1]) {
    const idx = (todayIdx + dayOffset + 7) % 7;
    const hoursStr = byDay.get(idx);
    if (hoursStr === undefined) continue;
    const ranges = parseDayRanges(hoursStr);
    const probe = dayOffset === 0 ? nowMinutes : nowMinutes + 1440;
    if (ranges.some(([start, end]) => probe >= start && probe < end)) {
      return true;
    }
  }

  return openingHours.every((h) => !h.hours) ? null : false;
}

export function todayHoursLabel(openingHours, now = new Date()) {
  if (!openingHours || openingHours.length === 0) return null;
  const { dayIndex: todayIdx } = getIstParts(now);
  const entry = openingHours.find((h) => DAY_INDEX[h.day] === todayIdx);
  return entry ? entry.hours : null;
}
