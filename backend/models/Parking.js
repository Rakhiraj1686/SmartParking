const mongoose = require('mongoose');

// -----------------------------------------------------------------------
// This is the ONLY model the current Arduino hardware (2 IR sensors)
// actually drives. It stores a single aggregate document — the Arduino
// cannot tell us which physical bay is occupied, only how many are.
// There should only ever be ONE document in this collection; it is
// treated as a singleton (upserted by singletonId: 'current').
// -----------------------------------------------------------------------
const parkingSchema = new mongoose.Schema(
  {
    singletonId: { type: String, default: 'current', unique: true },
    totalCapacity: { type: Number, required: true, default: 4 },
    occupiedSlots: { type: Number, required: true, default: 0, min: 0 },
    reservedSlots: { type: Number, required: true, default: 0, min: 0 },
    lastArduinoUpdate: { type: Date, default: null },
    source: { type: String, enum: ['arduino', 'seed', 'manual'], default: 'seed' },
  },
  { timestamps: true }
);

parkingSchema.methods.availableSlots = function availableSlots() {
  return Math.max(0, this.totalCapacity - this.occupiedSlots);
};

parkingSchema.methods.bookableSlots = function bookableSlots() {
  return Math.max(0, this.totalCapacity - this.occupiedSlots - this.reservedSlots);
};

module.exports = mongoose.model('Parking', parkingSchema);
