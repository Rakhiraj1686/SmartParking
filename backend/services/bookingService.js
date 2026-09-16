const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const generateBookingId = require('../utils/generateBookingId');
const { calculateAmount } = require('../utils/calculateAmount');
const parkingService = require('./parkingService');

async function createBooking({ userId, slotNumber, vehicleNumber, vehicleType, bookingDate, startTime, endTime }) {
  const reservation = await parkingService.reserveCapacity(slotNumber);
  if (!reservation.ok) {
    return { success: false, message: reservation.message };
  }

  const { slot, parking } = reservation;
  const amount = calculateAmount(slot.pricePerHour, startTime, endTime);
  const bookingId = await generateBookingId();

  const booking = await Booking.create({
    bookingId,
    userId,
    slotId: slot._id,
    slotNumber: slot.slotNumber,
    vehicleNumber,
    vehicleType,
    bookingDate,
    startTime,
    endTime,
    amount,
    status: 'upcoming',
  });

  const notification = await Notification.create({
    userId,
    type: 'success',
    message: `Parking space reserved (booking ${booking.bookingId}). Slot ${slot.slotNumber} held for your vehicle.`,
  });

  return { success: true, booking, parking, notification };
}

async function cancelBooking({ bookingId, userId, isAdmin }) {
  const booking = await Booking.findOne({ bookingId });
  if (!booking) return { success: false, message: 'Booking not found.', status: 404 };

  if (!isAdmin && String(booking.userId) !== String(userId)) {
    return { success: false, message: 'You cannot cancel a booking that is not yours.', status: 403 };
  }

  if (booking.status === 'cancelled') {
    return { success: false, message: 'Booking is already cancelled.', status: 409 };
  }
  if (booking.status === 'completed') {
    return { success: false, message: 'Completed bookings cannot be cancelled.', status: 409 };
  }

  booking.status = 'cancelled';
  await booking.save();

  const { parking } = await parkingService.releaseCapacity(booking.slotId);

  const notification = await Notification.create({
    userId: booking.userId,
    type: 'info',
    message: `Booking ${booking.bookingId} was cancelled. The parking space is available again.`,
  });

  return { success: true, booking, parking, notification };
}

module.exports = { createBooking, cancelBooking };
