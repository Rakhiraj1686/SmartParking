const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const bookingService = require('../services/bookingService');
const parkingService = require('../services/parkingService');

async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { slotNumber, vehicleNumber, vehicleType, bookingDate, startTime, endTime } = req.body;

    const result = await bookingService.createBooking({
      userId: req.user._id,
      slotNumber,
      vehicleNumber,
      vehicleType,
      bookingDate,
      startTime,
      endTime,
    });

    if (!result.success) {
      return res.status(409).json({ success: false, message: result.message });
    }

    const io = req.app.get('io');
    io.emit('bookingCreated', { booking: result.booking });
    io.emit('parkingStatusUpdated', parkingService.toStatusPayload(result.parking));
    if (result.parking.bookableSlots() === 0) io.emit('parkingFull', { reason: 'no bookable capacity' });

    res.status(201).json({ success: true, message: 'Parking space reserved', data: { booking: result.booking } });
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Your bookings', data: bookings });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const booking = await Booking.findOne({ bookingId: req.params.id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    if (req.user.role !== 'admin' && String(booking.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.status(200).json({ success: true, message: 'Booking detail', data: booking });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const result = await bookingService.cancelBooking({
      bookingId: req.params.id,
      userId: req.user._id,
      isAdmin: req.user.role === 'admin',
    });

    if (!result.success) {
      return res.status(result.status || 400).json({ success: false, message: result.message });
    }

    const io = req.app.get('io');
    io.emit('bookingCancelled', { booking: result.booking });
    io.emit('parkingStatusUpdated', parkingService.toStatusPayload(result.parking));
    io.emit('parkingAvailable', { availableSlots: result.parking.availableSlots() });

    res.status(200).json({ success: true, message: 'Booking cancelled', data: result.booking });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, getMine, getOne, cancel };
