const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSession = require('../models/ParkingSession');
const ParkingSlot = require('../models/ParkingSlot');
const IotLog = require('../models/IotLog');
const parkingService = require('../services/parkingService');

// -------------------------------------------------------------------
// Overview dashboard
// -------------------------------------------------------------------
async function dashboard(req, res, next) {
  try {
    const parking = await parkingService.getOrCreateParking();
    const status = parkingService.toStatusPayload(parking);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [todaysBookings, activeSessions, completedSessions, revenueAgg, todaysRevenueAgg] = await Promise.all([
      Booking.countDocuments({ createdAt: { $gte: startOfToday } }),
      ParkingSession.countDocuments({ status: 'active' }),
      ParkingSession.countDocuments({ status: 'completed' }),
      ParkingSession.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      ParkingSession.aggregate([
        { $match: { status: 'completed', exitTime: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data',
      data: {
        totalCapacity: status.totalCapacity,
        currentOccupancy: status.occupiedSlots,
        availableCapacity: status.availableSlots,
        reservedCapacity: status.reservedSlots,
        activeSessions,
        todaysBookings,
        todaysRevenue: todaysRevenueAgg[0]?.total || 0,
        completedSessions,
        revenue: revenueAgg[0]?.total || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------------
// User management
// -------------------------------------------------------------------
async function getUsers(req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Users retrieved', data: users.map((u) => u.toSafeObject()) });
  } catch (err) {
    next(err);
  }
}

async function getUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, message: 'User retrieved', data: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "role must be 'user' or 'admin'" });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    // An admin can demote themselves accidentally-lock-out is allowed
    // (they may want to hand off), but we block removing the very last
    // admin account so the system is never left with zero admins.
    if (String(target._id) === String(req.user._id) && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(409).json({ success: false, message: 'Cannot remove the last remaining admin account.' });
      }
    }

    target.role = role;
    await target.save();

    res.status(200).json({ success: true, message: `User role updated to ${role}`, data: target.toSafeObject() });
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (String(req.params.id) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    await target.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted', data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------------
// Booking management (system-wide)
// -------------------------------------------------------------------
async function getAllBookings(req, res, next) {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;

    let bookings = await Booking.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });

    if (search) {
      const q = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.bookingId.toLowerCase().includes(q) ||
          b.vehicleNumber.toLowerCase().includes(q) ||
          (b.userId?.email || '').toLowerCase().includes(q)
      );
    }

    res.status(200).json({ success: true, message: 'All bookings retrieved', data: bookings });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------------
// Session management (system-wide)
// -------------------------------------------------------------------
async function getAllSessions(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const sessions = await ParkingSession.find(filter).populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'All parking sessions retrieved', data: sessions });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------------
// Revenue
// -------------------------------------------------------------------
async function getRevenue(req, res, next) {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [totalAgg, todayAgg, completedSessions, completedBookings] = await Promise.all([
      ParkingSession.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      ParkingSession.aggregate([
        { $match: { status: 'completed', exitTime: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      ParkingSession.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'completed' }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Revenue summary',
      data: {
        todaysRevenue: todayAgg[0]?.total || 0,
        totalRevenue: totalAgg[0]?.total || 0,
        completedSessions,
        completedBookings,
      },
    });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------------
// Parking slot management (future per-slot-sensor scaffolding)
// -------------------------------------------------------------------
async function createSlot(req, res, next) {
  try {
    const { slotNumber, pricePerHour } = req.body;
    if (!slotNumber) return res.status(400).json({ success: false, message: 'slotNumber is required' });

    const existing = await ParkingSlot.findOne({ slotNumber });
    if (existing) return res.status(409).json({ success: false, message: 'A slot with that number already exists' });

    const slot = await ParkingSlot.create({
      slotNumber,
      pricePerHour: typeof pricePerHour === 'number' ? pricePerHour : 40,
      status: 'available',
      sensorStatus: 'none',
    });

    res.status(201).json({ success: true, message: 'Parking slot created', data: slot });
  } catch (err) {
    next(err);
  }
}

async function updateSlot(req, res, next) {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    const { pricePerHour, status } = req.body;
    if (typeof pricePerHour === 'number') slot.pricePerHour = pricePerHour;
    if (status && ['available', 'occupied', 'reserved'].includes(status)) slot.status = status;
    slot.lastUpdated = new Date();
    await slot.save();

    res.status(200).json({ success: true, message: 'Parking slot updated', data: slot });
  } catch (err) {
    next(err);
  }
}

async function deleteSlot(req, res, next) {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

    if (slot.status === 'reserved') {
      return res.status(409).json({ success: false, message: 'Cannot delete a slot that is currently reserved.' });
    }

    await slot.deleteOne();
    res.status(200).json({ success: true, message: 'Parking slot deleted', data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

// -------------------------------------------------------------------
// IoT monitoring
// -------------------------------------------------------------------
const ARDUINO_ONLINE_WINDOW_MS = 60 * 1000; // consider "online" if updated in the last 60s

async function getIotStatus(req, res, next) {
  try {
    const parking = await parkingService.getOrCreateParking();
    const status = parkingService.toStatusPayload(parking);

    const isOnline =
      !!parking.lastArduinoUpdate && Date.now() - new Date(parking.lastArduinoUpdate).getTime() < ARDUINO_ONLINE_WINDOW_MS;

    const recentLogs = await IotLog.find().sort({ createdAt: -1 }).limit(20);

    res.status(200).json({
      success: true,
      message: 'IoT status retrieved',
      data: {
        online: isOnline,
        lastArduinoUpdate: parking.lastArduinoUpdate,
        source: parking.source,
        occupiedSlots: status.occupiedSlots,
        totalCapacity: status.totalCapacity,
        availableSlots: status.availableSlots,
        recentLogs,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  dashboard,
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getAllBookings,
  getAllSessions,
  getRevenue,
  createSlot,
  updateSlot,
  deleteSlot,
  getIotStatus,
};
