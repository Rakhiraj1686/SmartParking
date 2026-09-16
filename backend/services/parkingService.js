const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');

const TOTAL_SLOTS = parseInt(process.env.TOTAL_SLOTS, 10) || 4;

/** Gets the singleton aggregate parking document, creating it if missing. */
async function getOrCreateParking() {
  let parking = await Parking.findOne({ singletonId: 'current' });
  if (!parking) {
    parking = await Parking.create({
      singletonId: 'current',
      totalCapacity: TOTAL_SLOTS,
      occupiedSlots: 0,
      reservedSlots: 0,
      source: 'seed',
    });
  }
  return parking;
}

/** Shapes the aggregate document into the /api/parking/status response. */
function toStatusPayload(parking) {
  return {
    totalCapacity: parking.totalCapacity,
    occupiedSlots: parking.occupiedSlots,
    availableSlots: parking.availableSlots(),
    reservedSlots: parking.reservedSlots,
    bookableSlots: parking.bookableSlots(),
    lastArduinoUpdate: parking.lastArduinoUpdate,
  };
}

/**
 * Applies a real Arduino aggregate update (current hardware: 2 IR sensors,
 * total-count only). This is the ONLY function the current hardware
 * should ever drive.
 */
async function applyArduinoStatus({ occupiedSlots, totalSlots }) {
  const parking = await getOrCreateParking();

  if (typeof totalSlots === 'number' && totalSlots > 0) {
    parking.totalCapacity = totalSlots;
  }

  parking.occupiedSlots = Math.max(0, Math.min(occupiedSlots, parking.totalCapacity));
  parking.lastArduinoUpdate = new Date();
  parking.source = 'arduino';
  await parking.save();
  return parking;
}

/**
 * FUTURE HARDWARE PATH ONLY. Applies a per-slot update once real per-slot
 * sensors exist (see iotController's /api/iot/status "slots" payload).
 * Also recomputes the aggregate occupiedSlots count from the slot
 * documents so /api/parking/status stays consistent either way.
 */
async function applySlotSensorUpdate(slotsPayload) {
  const ops = slotsPayload.map((s) => ({
    updateOne: {
      filter: { slotNumber: s.slotNumber },
      update: {
        $set: {
          status: s.occupied ? 'occupied' : 'available',
          sensorStatus: 'active',
          lastUpdated: new Date(),
        },
      },
    },
  }));
  if (ops.length) await ParkingSlot.bulkWrite(ops);

  const occupiedCount = await ParkingSlot.countDocuments({ status: 'occupied' });
  const parking = await getOrCreateParking();
  parking.occupiedSlots = occupiedCount;
  parking.lastArduinoUpdate = new Date();
  parking.source = 'arduino';
  await parking.save();
  return parking;
}

/** Reserves one unit of bookable capacity (and, if a free ParkingSlot document exists, marks one 'reserved' for the frontend's per-slot UI). */
async function reserveCapacity(preferredSlotNumber) {
  const parking = await getOrCreateParking();
  if (parking.bookableSlots() <= 0) {
    return { ok: false, message: 'No bookable parking capacity is currently available.' };
  }

  let slot = null;
  if (preferredSlotNumber) {
    slot = await ParkingSlot.findOne({ slotNumber: preferredSlotNumber, status: 'available' });
  }
  if (!slot) {
    slot = await ParkingSlot.findOne({ status: 'available' });
  }
  if (!slot) {
    return { ok: false, message: 'No parking slot record is available to reserve.' };
  }

  slot.status = 'reserved';
  slot.lastUpdated = new Date();
  await slot.save();

  parking.reservedSlots += 1;
  await parking.save();

  return { ok: true, slot, parking };
}

/** Releases a previously reserved capacity unit / slot back to available. */
async function releaseCapacity(slotId) {
  const parking = await getOrCreateParking();
  const slot = await ParkingSlot.findById(slotId);
  if (slot && slot.status === 'reserved') {
    slot.status = 'available';
    slot.lastUpdated = new Date();
    await slot.save();
  }
  parking.reservedSlots = Math.max(0, parking.reservedSlots - 1);
  await parking.save();
  return { slot, parking };
}

module.exports = {
  TOTAL_SLOTS,
  getOrCreateParking,
  toStatusPayload,
  applyArduinoStatus,
  applySlotSensorUpdate,
  reserveCapacity,
  releaseCapacity,
};
