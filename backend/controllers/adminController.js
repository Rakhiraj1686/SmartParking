const Booking = require('../models/Booking');
const ParkingSession = require('../models/ParkingSession');
const parkingService = require('../services/parkingService');

async function dashboard(req, res, next) {
  try {
    const parking = await parkingService.getOrCreateParking();
    const status = parkingService.toStatusPayload(parking);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todaysBookings, activeSessions, completedSessions, revenueAgg] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: startOfToday } }),
      ParkingSession.countDocuments({ status: 'active' }),
      ParkingSession.countDocuments({ status: 'completed' }),
      ParkingSession.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data',
      data: {
        totalCapacity: status.totalCapacity,
        currentOccupancy: status.occupiedSlots,
        availableCapacity: status.availableSlots,
        todaysBookings,
        activeSessions,
        completedSessions,
        revenue,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard };
