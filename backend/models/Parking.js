const mongoose = require('mongoose');

// -----------------------------------------------------------------------
// This is the ONLY model the current Arduino hardware (2 IR sensors)
// actually drives. It stores a single aggregate document — the Arduino
// cannot tell us which physical bay is occupied, only how many are.
// There should only ever be ONE document in this collection; it is
// treated as a singleton (upserted by singletonId: 'current').
//
// NOTE on `reservedSlots`: this field is kept for backward compatibility
// but is no longer written to. "Reserved" capacity is now computed live
// from actual Booking time windows (see
// services/parkingService.js -> countLiveReservedSlots()), because a
// booking only holds a physical bay during its own date/time window —
// a persisted running counter can't represent that correctly once
// bookings can be made for different times on the same day. Always read
// reservedSlots from parkingService.toStatusPayload(), not this field.
// -----------------------------------------------------------------------
const parkingSchema = new mongoose.Schema(
  {
    singletonId: { type: String, default: 'current', unique: true },
    totalCapacity: { type: Number, required: true, default: 4 },
    occupiedSlots: { type: Number, required: true, default: 0, min: 0 },
    reservedSlots: { type: Number, required: true, default: 0, min: 0 }, // legacy/unused, see note above
    lastArduinoUpdate: { type: Date, default: null },
    source: { type: String, enum: ['arduino', 'seed', 'manual'], default: 'seed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parking', parkingSchema);
