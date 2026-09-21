const parkingService = require('./parkingService');
const Notification = require('../models/Notification');
const IotLog = require('../models/IotLog');

/**
 * Handles POST /api/iot/status payloads from the Arduino/ESP gateway.
 *
 * Supports two shapes so the backend doesn't need to change when the
 * hardware is upgraded:
 *   1. CURRENT hardware: { occupiedSlots, totalSlots }
 *   2. FUTURE hardware:  { slots: [{ slotNumber, occupied }, ...] }
 */
async function handleStatusUpdate(body) {
  let parking;
  let mode;

  if (Array.isArray(body.slots) && body.slots.length > 0) {
    mode = 'per-slot (future hardware)';
    parking = await parkingService.applySlotSensorUpdate(body.slots);
  } else {
    mode = 'aggregate (current hardware)';
    const totalSlots = typeof body.totalSlots === 'number' ? body.totalSlots : parkingService.TOTAL_SLOTS;
    parking = await parkingService.applyArduinoStatus({
      occupiedSlots: body.occupiedSlots,
      totalSlots,
    });
  }

  const payload = await parkingService.toStatusPayload(parking);

  await IotLog.record(
    `Occupied = ${payload.occupiedSlots}`,
    payload.occupiedSlots,
    payload.totalCapacity
  );

  // Generate system notifications for full / newly-available states.
  if (payload.availableSlots === 0) {
    await Notification.create({ type: 'warning', message: 'Parking is now full.' });
  } else if (payload.availableSlots === 1) {
    await Notification.create({ type: 'info', message: 'Only 1 parking space remains.' });
  }

  return { mode, payload };
}

module.exports = { handleStatusUpdate };
