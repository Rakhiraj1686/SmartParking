// -----------------------------------------------------------------------
// parkingService.js
//
// This is the ONLY file that should need to change when a real backend
// is introduced. Every function below currently reads/writes the in-memory
// mock arrays and resolves like a network call (small artificial delay),
// so the rest of the app already talks to it as if it were async.
//
// Planned future architecture:
//
//   Arduino / ESP32 (ultrasonic + IR sensors per slot)
//         |  (serial / MQTT)
//         v
//   Backend API + WebSocket server (Node/Express, Firebase, etc.)
//         |  (REST for actions, WebSocket for live status)
//         v
//   React Dashboard  <-- this app
//
// To connect it for real:
//   1. Replace the mock arrays with `fetch('/api/slots')` etc.
//   2. Replace `simulateSensorDrift()` with a WebSocket subscription that
//      pushes { slotId, status } updates from the ESP32 gateway.
//   3. Keep the function names/signatures the same so no page component
//      needs to change — they already only depend on this service.
// -----------------------------------------------------------------------

import {
  initialParkingSlots,
  initialBookings,
  parkingHistory,
  initialNotifications,
} from '../data/mockData';

const NETWORK_DELAY = 350;

// In-memory "database" — swap for real API calls later.
let slots = initialParkingSlots.map((s) => ({ ...s }));
let bookings = initialBookings.map((b) => ({ ...b }));
let notifications = initialNotifications.map((n) => ({ ...n }));
let bookingCounter = 10232;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), NETWORK_DELAY));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// ---- Slots -------------------------------------------------------------

/** GET /api/slots — mirrors what an ESP32 gateway would report per bay. */
export function getParkingSlots() {
  return delay(clone(slots));
}

/** GET /api/slots/:id */
export function getSlotStatus(slotId) {
  const slot = slots.find((s) => s.id === slotId);
  return delay(slot ? clone(slot) : null);
}

// ---- Bookings ------------------------------------------------------------

export function getBookings() {
  return delay(clone(bookings));
}

/**
 * POST /api/bookings
 * Marks the slot reserved and creates a booking record.
 * In production this is the point where the backend would also notify
 * the Arduino gateway (e.g. light up the slot's reserved LED).
 */
export function createBooking({ slotId, date, startTime, endTime, vehicleType, vehicleNumber }) {
  const slot = slots.find((s) => s.id === slotId);
  if (!slot || slot.status !== 'available') {
    return delay({ success: false, message: 'Slot is no longer available.' });
  }

  slot.status = 'reserved';
  slot.vehicleType = vehicleType;
  slot.reservedUntil = endTime;

  bookingCounter += 1;
  const booking = {
    id: `BK-${bookingCounter}`,
    slotId,
    date,
    startTime,
    endTime,
    vehicleType,
    vehicleNumber,
    amount: estimatePrice(slot.price, startTime, endTime),
    status: 'upcoming',
  };
  bookings = [booking, ...bookings];

  notifications = [
    {
      id: `N-${Date.now()}`,
      type: 'success',
      message: `Slot ${slotId} has been successfully booked.`,
      timestamp: 'Just now',
      read: false,
    },
    ...notifications,
  ];

  return delay({ success: true, booking: clone(booking) });
}

/**
 * POST /api/bookings/:id/cancel
 * Frees the slot back to "available" and updates the booking record.
 */
export function cancelBooking(bookingId) {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return delay({ success: false, message: 'Booking not found.' });

  booking.status = 'cancelled';

  const slot = slots.find((s) => s.id === booking.slotId);
  if (slot) {
    slot.status = 'available';
    slot.vehicleType = null;
    slot.reservedUntil = null;
  }

  notifications = [
    {
      id: `N-${Date.now()}`,
      type: 'info',
      message: `Booking ${bookingId} was cancelled. Slot ${booking.slotId} is available again.`,
      timestamp: 'Just now',
      read: false,
    },
    ...notifications,
  ];

  return delay({ success: true, booking: clone(booking) });
}

export function estimatePrice(pricePerHour, startTime, endTime) {
  const toMinutes = (t) => {
    const match = /(\d+):(\d+)\s?(AM|PM)/i.exec(t);
    if (!match) return null;
    let [, h, m, period] = match;
    h = parseInt(h, 10) % 12;
    if (period.toUpperCase() === 'PM') h += 12;
    return h * 60 + parseInt(m, 10);
  };
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start === null || end === null || end <= start) return pricePerHour;
  const hours = Math.max(1, Math.ceil((end - start) / 60));
  return hours * pricePerHour;
}

// ---- History -------------------------------------------------------------

export function getParkingHistory() {
  return delay(clone(parkingHistory));
}

// ---- Notifications ---------------------------------------------------------

export function getNotifications() {
  return delay(clone(notifications));
}

export function markNotificationsRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  return delay(clone(notifications));
}

// ---- Live sensor simulation ------------------------------------------------

/**
 * Simulates the kind of periodic push a WebSocket connection to the
 * Arduino/ESP32 gateway would deliver: a random available slot flips to
 * occupied, or a random occupied slot frees up. Call this on an interval
 * to make the dashboard feel "live" without a backend.
 *
 * Replace with: socket.on('slot-update', ({ slotId, status }) => { ... })
 */
export function simulateSensorDrift() {
  const candidates = slots.filter((s) => s.status !== 'reserved');
  if (candidates.length === 0) return delay(null);
  const target = candidates[Math.floor(Math.random() * candidates.length)];
  target.status = target.status === 'available' ? 'occupied' : 'available';
  target.vehicleType = target.status === 'occupied'
    ? ['Car', 'Bike', 'SUV', 'EV'][Math.floor(Math.random() * 4)]
    : null;
  return delay(clone(target));
}
