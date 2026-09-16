const ParkingSlot = require('../models/ParkingSlot');
const parkingService = require('../services/parkingService');

async function getStatus(req, res, next) {
  try {
    const parking = await parkingService.getOrCreateParking();
    res.status(200).json({
      success: true,
      message: 'Parking status retrieved',
      data: parkingService.toStatusPayload(parking),
    });
  } catch (err) {
    next(err);
  }
}

async function getSlots(req, res, next) {
  try {
    // FUTURE individual-slot structure. `sensorStatus: 'none'` on every
    // slot today is the honest signal that no per-slot hardware exists
    // yet — `status` here reflects booking reservations only.
    const slots = await ParkingSlot.find().sort({ slotNumber: 1 });
    res.status(200).json({
      success: true,
      message: 'Parking slots retrieved (booking-driven; no per-slot sensors installed yet)',
      data: slots,
    });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const parking = await parkingService.getOrCreateParking();
    const status = parkingService.toStatusPayload(parking);
    const occupancyPercentage = parking.totalCapacity
      ? Math.round((parking.occupiedSlots / parking.totalCapacity) * 100)
      : 0;

    res.status(200).json({
      success: true,
      message: 'Parking stats retrieved',
      data: { ...status, occupancyPercentage },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStatus, getSlots, getStats };
