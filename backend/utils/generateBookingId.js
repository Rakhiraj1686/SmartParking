const Booking = require('../models/Booking');

/** Generates BK-XXXXX ids continuing from the existing highest number, matching the frontend's existing mock ID format (e.g. BK-10232). */
async function generateBookingId() {
  const last = await Booking.findOne().sort({ createdAt: -1 }).lean();
  let next = 10232;
  if (last && last.bookingId) {
    const match = /BK-(\d+)/.exec(last.bookingId);
    if (match) next = parseInt(match[1], 10) + 1;
  }
  return `BK-${next}`;
}

module.exports = generateBookingId;
