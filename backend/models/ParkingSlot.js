const mongoose = require('mongoose');

// -----------------------------------------------------------------------
// FUTURE HARDWARE MODEL.
// The current Arduino (2 IR sensors, entry + exit) has NO way to know
// which individual bay a car is in — it only knows a running total.
// This collection exists so the app's UI/booking flow has real slot
// records to work with (matching the existing frontend, which was built
// assuming per-slot sensors), and so that a future upgrade to per-slot
// sensors (see iotController "slots" payload) can update these documents
// directly without any schema or API redesign.
//
// sensorStatus reflects whether a REAL sensor is currently wired to this
// slot ('none' today for every slot). Until per-slot hardware exists,
// `status` here is a soft/booking-driven reservation state only — it is
// NOT physically sensor-verified, and the frontend/API responses should
// be worded accordingly ("space reserved", not "P02 physically occupied").
// -----------------------------------------------------------------------
const parkingSlotSchema = new mongoose.Schema(
  {
    slotNumber: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    sensorStatus: { type: String, enum: ['none', 'active', 'offline'], default: 'none' },
    pricePerHour: { type: Number, default: 40 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
