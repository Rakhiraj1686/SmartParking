const mongoose = require('mongoose');

// A "session" is a real physical entry/exit event. It can optionally be
// linked to a booking, but also supports walk-in vehicles the Arduino
// gate let in without a prior booking (the IR sensors don't know either
// way — every entry increments occupiedSlots the same way).
const parkingSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    entryTime: { type: Date, default: Date.now },
    exitTime: { type: Date, default: null },
    durationMinutes: { type: Number, default: null },
    amount: { type: Number, default: null },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParkingSession', parkingSessionSchema);
