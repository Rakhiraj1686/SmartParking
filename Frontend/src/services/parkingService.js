// -----------------------------------------------------------------------
// parkingService.js
//
// This is the ONLY file that needed to change to connect the real
// backend (per this file's own original plan comment). Function
// names/signatures are kept identical to the mock-data version so no
// page component had to change.
//
// IMPORTANT — hardware reality:
// The current Arduino (2 IR sensors) only reports a TOTAL occupied count,
// never which individual bay (P01..P04) is occupied. The backend's
// ParkingSlot records therefore only ever carry 'available' or
// 'reserved' (booking-driven) status from the real API — never
// 'occupied'. Because this UI was built assuming per-slot sensors, we
// layer a purely VISUAL 'occupied' flag onto that many currently
// "available" slots so the on-screen counts (Available/Occupied/Reserved)
// add up to match the real Arduino aggregate. This does NOT mean the
// backend knows which physical bay is occupied — see backend/README.md.
// This simplification goes away entirely once real per-slot sensors are
// added (backend already supports that payload shape).
// -----------------------------------------------------------------------

import { io } from 'socket.io-client';
import { apiRequest, API_URL, getToken } from './api';

let socket = null;

function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: { token: getToken() },
    });
  }
  return socket;
}

/** Subscribes to live backend push events. Returns an unsubscribe function. */
export function subscribeToLiveUpdates(handlers) {
  const s = getSocket();
  if (handlers.onStatus) s.on('parkingStatusUpdated', handlers.onStatus);
  if (handlers.onBookingCreated) s.on('bookingCreated', handlers.onBookingCreated);
  if (handlers.onBookingCancelled) s.on('bookingCancelled', handlers.onBookingCancelled);
  if (handlers.onParkingFull) s.on('parkingFull', handlers.onParkingFull);
  if (handlers.onParkingAvailable) s.on('parkingAvailable', handlers.onParkingAvailable);

  return () => {
    if (handlers.onStatus) s.off('parkingStatusUpdated', handlers.onStatus);
    if (handlers.onBookingCreated) s.off('bookingCreated', handlers.onBookingCreated);
    if (handlers.onBookingCancelled) s.off('bookingCancelled', handlers.onBookingCancelled);
    if (handlers.onParkingFull) s.off('parkingFull', handlers.onParkingFull);
    if (handlers.onParkingAvailable) s.off('parkingAvailable', handlers.onParkingAvailable);
  };
}

/** Admin-only real-time feed. Server only emits this to sockets whose JWT resolved to role === 'admin' (see backend/sockets/parkingSocket.js). */
export function subscribeToAdminUpdates(onAdminIotUpdate) {
  const s = getSocket();
  s.on('adminIotUpdate', onAdminIotUpdate);
  return () => s.off('adminIotUpdate', onAdminIotUpdate);
}

function mapSlot(raw) {
  return {
    id: raw.slotNumber,
    _id: raw._id,
    zone: 'A', // only 4 physical bays today; kept as a single zone
    status: raw.status, // 'available' | 'reserved' from the real API
    price: raw.pricePerHour,
    vehicleType: null, // not known per-slot until real sensors exist
    reservedUntil: null,
    floor: 'Ground Floor',
  };
}

function mapBooking(raw) {
  return {
    id: raw.bookingId,
    slotId: raw.slotNumber,
    date: raw.bookingDate,
    startTime: raw.startTime,
    endTime: raw.endTime,
    vehicleType: raw.vehicleType,
    vehicleNumber: raw.vehicleNumber,
    amount: raw.amount,
    status: raw.status,
  };
}

function mapNotification(raw) {
  return {
    id: raw._id,
    type: raw.type,
    message: raw.message,
    timestamp: new Date(raw.createdAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }),
    read: raw.read,
  };
}

// ---- Slots ----------------------------------------------------------------

/** GET /api/parking/slots + /api/parking/status, merged for the existing per-slot UI. */
export async function getParkingSlots() {
  const [slotsRes, statusRes] = await Promise.all([
    apiRequest('/api/parking/slots'),
    apiRequest('/api/parking/status'),
  ]);

  const slots = slotsRes.data.map(mapSlot);
  const { occupiedSlots, reservedSlots } = statusRes.data;

  // Visually flag `occupiedSlots` many currently-available slots as
  // "occupied", then `reservedSlots` many of what's left as "reserved",
  // so the dashboard's per-slot-derived counts match the real backend
  // aggregate (occupied = Arduino count; reserved = bookings whose time
  // window covers right now — see backend/services/parkingService.js).
  // Individual ParkingSlot records themselves no longer carry a
  // persistent 'reserved' status once a booking is made, because a
  // booking only holds its slot during its own date/time window, not
  // forever — see backend/README.md.
  let toOccupy = occupiedSlots;
  for (const slot of slots) {
    if (toOccupy <= 0) break;
    if (slot.status === 'available') {
      slot.status = 'occupied';
      toOccupy -= 1;
    }
  }

  let toReserve = reservedSlots;
  for (const slot of slots) {
    if (toReserve <= 0) break;
    if (slot.status === 'available') {
      slot.status = 'reserved';
      toReserve -= 1;
    }
  }

  return slots;
}

export async function getSlotStatus(slotId) {
  const slots = await getParkingSlots();
  return slots.find((s) => s.id === slotId) || null;
}

// ---- Bookings ---------------------------------------------------------

export async function getBookings() {
  const res = await apiRequest('/api/bookings/my');
  return res.data.map(mapBooking);
}

/**
 * Creates a booking. `slotId` in the payload maps to the backend's
 * `slotNumber` (both are e.g. "P02").
 */
export async function createBooking({ slotId, date, startTime, endTime, vehicleType, vehicleNumber }) {
  try {
    const res = await apiRequest('/api/bookings', {
      method: 'POST',
      body: { slotNumber: slotId, bookingDate: date, startTime, endTime, vehicleType, vehicleNumber },
    });
    return { success: true, booking: mapBooking(res.data.booking) };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function cancelBooking(bookingId) {
  try {
    const res = await apiRequest(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH' });
    return { success: true, booking: mapBooking(res.data) };
  } catch (err) {
    return { success: false, message: err.message };
  }
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

// ---- History (completed/cancelled bookings) -------------------------------

export async function getParkingHistory() {
  const res = await apiRequest('/api/bookings/my');
  return res.data
    .filter((b) => b.status === 'completed' || b.status === 'cancelled')
    .map((b) => ({
      id: b.bookingId,
      date: b.bookingDate,
      slotId: b.slotNumber,
      entryTime: b.startTime,
      exitTime: b.endTime,
      duration: estimateDuration(b.startTime, b.endTime),
      amount: b.amount,
      status: b.status === 'completed' ? 'Completed' : 'Cancelled',
    }));
}

function estimateDuration(startTime, endTime) {
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
  if (start === null || end === null || end <= start) return '—';
  const mins = end - start;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ---- Notifications ---------------------------------------------------------

export async function getNotifications() {
  const res = await apiRequest('/api/notifications');
  return res.data.map(mapNotification);
}

export async function markNotificationsRead() {
  const res = await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
  return res.data.map(mapNotification);
}
