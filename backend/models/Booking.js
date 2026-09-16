const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // slotId/slotNumber are populated from ParkingSlot for the frontend's
    // existing per-slot UI. See ParkingSlot.js: until real per-slot sensors
    // exist, this is a capacity reservation, not a sensor-verified bay.
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
    slotNumber: { type: String, required: true },
    vehicleNumber: { type: String, required: true, uppercase: true, trim: true },
    vehicleType: { type: String, enum: ['Car', 'Bike', 'SUV', 'EV'], default: 'Car' },
    bookingDate: { type: String, required: true }, // YYYY-MM-DD
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
