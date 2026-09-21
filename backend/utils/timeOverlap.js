// Parses "hh:mm AM/PM" into minutes-since-midnight. Returns null if the
// string doesn't match (caller should treat that as invalid input).
function toMinutes(t) {
  const match = /(\d+):(\d+)\s?(AM|PM)/i.exec(t || '');
  if (!match) return null;
  let [, h, m, period] = match;
  h = parseInt(h, 10) % 12;
  if (period.toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m, 10);
}

/** True if [aStart,aEnd) and [bStart,bEnd) overlap at all. */
function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

/** True if two "hh:mm AM/PM"-style time windows on the same date overlap. */
function timeWindowsOverlap(startA, endA, startB, endB) {
  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);
  if ([aStart, aEnd, bStart, bEnd].some((v) => v === null)) return false;
  return rangesOverlap(aStart, aEnd, bStart, bEnd);
}

/** True if "now" (minutes since midnight, today) falls within [start,end). */
function isWithinWindowNow(start, end) {
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (s === null || e === null) return false;
  return nowMinutes >= s && nowMinutes < e;
}

module.exports = { toMinutes, rangesOverlap, timeWindowsOverlap, isWithinWindowNow };
