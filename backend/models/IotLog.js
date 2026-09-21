const mongoose = require('mongoose');

// Lightweight, bounded log of recent Arduino status pushes, purely for
// the Admin -> IoT Monitoring page ("10:32:01 -> Occupied = 2"). This is
// NOT the source of truth for parking status (Parking.js is) — it's just
// a human-readable recent-activity feed.
const iotLogSchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    occupiedSlots: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
  },
  { timestamps: true }
);

iotLogSchema.statics.record = async function record(message, occupiedSlots, totalSlots) {
  await this.create({ message, occupiedSlots, totalSlots });
  // Keep only the most recent 50 entries so this never grows unbounded.
  const count = await this.countDocuments();
  if (count > 50) {
    const stale = await this.find().sort({ createdAt: 1 }).limit(count - 50).select('_id');
    await this.deleteMany({ _id: { $in: stale.map((d) => d._id) } });
  }
};

module.exports = mongoose.model('IotLog', iotLogSchema);
