// Mirrors Frontend/src/services/parkingService.js -> estimatePrice(),
// so amounts computed server-side match what the existing UI already
// estimates client-side. Accepts times as "hh:mm AM/PM" strings.
function toMinutes(t) {
  const match = /(\d+):(\d+)\s?(AM|PM)/i.exec(t || '');
  if (!match) return null;
  let [, h, m, period] = match;
  h = parseInt(h, 10) % 12;
  if (period.toUpperCase() === 'PM') h += 12;
  return h * 60 + parseInt(m, 10);
}

function calculateAmount(pricePerHour, startTime, endTime) {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start === null || end === null || end <= start) return pricePerHour;
  const hours = Math.max(1, Math.ceil((end - start) / 60));
  return hours * pricePerHour;
}

module.exports = { calculateAmount, toMinutes };
