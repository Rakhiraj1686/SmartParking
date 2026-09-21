const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const { timeWindowsOverlap, isWithinWindowNow } = require('../utils/timeOverlap');

const TOTAL_SLOTS = parseInt(process.env.TOTAL_SLOTS, 10) || 4;
const ACTIVE_BOOKING_STATUSES = ['upcoming', 'active'];

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

/**
 * "Reserved right now" — how many physical bays currently have a
 * non-cancelled booking whose time window includes this exact moment,
 * today. This is a live count (not a persisted counter), because a
 * booking only actually holds a bay during its own date/time window —
 * see findAvailableSlotForWindow() for the logic that actually prevents
 * double-booking a slot.
 */
async function countLiveReservedSlots() {
  const today = new Date().toISOString().slice(0, 10);
  const todaysBookings = await Booking.find({
    bookingDate: today,
    status: { $in: ACTIVE_BOOKING_STATUSES },
  }).select('slotNumber startTime endTime');

  const reservedSlotNumbers = new Set();
  for (const b of todaysBookings) {
    if (isWithinWindowNow(b.startTime, b.endTime)) {
      reservedSlotNumbers.add(b.slotNumber);
    }
  }
  return reservedSlotNumbers.size;
}

/** Shapes the aggregate document into the /api/parking/status response. */
async function toStatusPayload(parking) {
  const reservedSlots = await countLiveReservedSlots();
  const availableSlots = Math.max(0, parking.totalCapacity - parking.occupiedSlots);
  const bookableSlots = Math.max(0, parking.totalCapacity - parking.occupiedSlots - reservedSlots);

  return {
    totalCapacity: parking.totalCapacity,
    occupiedSlots: parking.occupiedSlots,
    availableSlots,
    // "Reserved" here means "physically held by a booking right now" —
    // NOT a lifetime count of every upcoming booking (a slot booked for
    // tomorrow doesn't reduce today's bookable capacity; see
    // findAvailableSlotForWindow, which is what actually prevents
    // double-booking a slot for an overlapping time window).
    reservedSlots,
    bookableSlots,
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

/**
 * Finds a physical ParkingSlot that has NO conflicting (upcoming/active)
 * booking overlapping the requested [startTime,endTime] on bookingDate.
 * This is what actually prevents double-booking — e.g. a slot booked
 * 09:00–11:00 today is still free for 14:00–16:00 the same day.
 *
 * If preferredSlotNumber is given, only that slot is checked (so the
 * caller gets an honest "that slot is taken for that time" rejection
 * instead of silently picking a different one). Otherwise every slot is
 * checked in slotNumber order and the first free one is returned.
 */
async function findAvailableSlotForWindow({ slotNumber, bookingDate, startTime, endTime }) {
  const candidates = slotNumber
    ? await ParkingSlot.find({ slotNumber })
    : await ParkingSlot.find().sort({ slotNumber: 1 });

  if (slotNumber && candidates.length === 0) {
    return { ok: false, message: `No parking slot ${slotNumber} exists.` };
  }

  for (const slot of candidates) {
    // eslint-disable-next-line no-await-in-loop
    const conflicts = await Booking.find({
      slotNumber: slot.slotNumber,
      bookingDate,
      status: { $in: ACTIVE_BOOKING_STATUSES },
    }).select('startTime endTime');

    const hasConflict = conflicts.some((b) => timeWindowsOverlap(startTime, endTime, b.startTime, b.endTime));
    if (!hasConflict) {
      return { ok: true, slot };
    }
  }

  return {
    ok: false,
    message: slotNumber
      ? `Slot ${slotNumber} is already booked for an overlapping time on ${bookingDate}.`
      : `No parking slot is free for ${startTime}–${endTime} on ${bookingDate}.`,
  };
}

module.exports = {
  TOTAL_SLOTS,
  getOrCreateParking,
  toStatusPayload,
  applyArduinoStatus,
  applySlotSensorUpdate,
  findAvailableSlotForWindow,
  countLiveReservedSlots,
};
