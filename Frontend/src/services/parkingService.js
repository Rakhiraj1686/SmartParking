import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'smart-parking-token';
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL || 'arjun@example.com';
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD || 'Demo@123';

let tokenPromise;

async function request(path, options = {}, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (requiresAuth) {
    const token = await getToken();
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_URL}/api${path}`, { ...options, headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || `Request failed (${response.status})`);
  return body.data ?? body;
}

async function getToken() {
  const stored = localStorage.getItem(TOKEN_KEY);
  if (stored) return stored;
  if (!tokenPromise) {
    tokenPromise = request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: DEMO_EMAIL, password: DEMO_PASSWORD }),
    }).then((data) => {
      localStorage.setItem(TOKEN_KEY, data.token);
      return data.token;
    }).finally(() => { tokenPromise = null; });
  }
  return tokenPromise;
}

function normalizeSlot(slot) {
  const number = slot.slotNumber || slot.id;
  const numericId = Number(String(number).replace(/\D/g, ''));
  return { ...slot, id: number, slotId: number, price: slot.pricePerHour ?? slot.price ?? 40, zone: numericId <= 12 ? 'A' : numericId <= 24 ? 'B' : 'C', floor: 'Ground Floor', vehicleType: slot.vehicleType || null, reservedUntil: slot.reservedUntil || null };
}

function normalizeBooking(booking) {
  return { ...booking, id: booking.bookingId || booking.id, slotId: booking.slotNumber || booking.slotId, date: booking.bookingDate || booking.date };
}

function normalizeNotification(notification) {
  return { ...notification, id: notification._id || notification.id, timestamp: notification.timestamp || notification.createdAt || 'Just now' };
}

export function getParkingSlots() {
  return request('/parking/slots').then((slots) => slots.map(normalizeSlot));
}

export function getSlotStatus(slotId) {
  return getParkingSlots().then((slots) => slots.find((slot) => slot.id === slotId) || null);
}

export function getBookings() {
  return request('/bookings/my', {}, true).then((bookings) => bookings.map(normalizeBooking));
}

export async function createBooking({ slotId, date, startTime, endTime, vehicleType, vehicleNumber }) {
  try {
    const data = await request('/bookings', { method: 'POST', body: JSON.stringify({ slotNumber: slotId, bookingDate: date, startTime, endTime, vehicleType, vehicleNumber }) }, true);
    return { success: true, booking: normalizeBooking(data.booking) };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function cancelBooking(bookingId) {
  try {
    const booking = await request(`/bookings/${bookingId}/cancel`, { method: 'PATCH' }, true);
    return { success: true, booking: normalizeBooking(booking) };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export function estimatePrice(pricePerHour, startTime, endTime) {
  const toMinutes = (time) => {
    const match = /(\d+):(\d+)\s?(AM|PM)/i.exec(time);
    if (!match) return null;
    let hours = parseInt(match[1], 10) % 12;
    if (match[3].toUpperCase() === 'PM') hours += 12;
    return hours * 60 + parseInt(match[2], 10);
  };
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  if (start === null || end === null || end <= start) return pricePerHour;
  return Math.max(1, Math.ceil((end - start) / 60)) * pricePerHour;
}

export function getParkingHistory() {
  return request('/sessions/my', {}, true).then((sessions) => sessions.map((session) => ({ ...session, id: session._id || session.id, slotId: session.slotNumber || session.slotId || 'Unassigned', entryTime: session.entryTime ? new Date(session.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-', exitTime: session.exitTime ? new Date(session.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-', duration: session.duration || (session.durationMinutes ? `${Math.floor(session.durationMinutes / 60)}h ${session.durationMinutes % 60}m` : '-'), status: session.status === 'completed' ? 'Completed' : session.status })));
}

export function getNotifications() {
  return request('/notifications', {}, true).then((notifications) => notifications.map(normalizeNotification));
}

export function markNotificationsRead() {
  return request('/notifications/read-all', { method: 'PATCH' }, true).then((notifications) => notifications.map(normalizeNotification));
}

export function subscribeToParkingUpdates(onStatusUpdate) {
  const socket = io(API_URL || window.location.origin, { transports: ['websocket', 'polling'] });
  socket.on('parkingStatusUpdated', onStatusUpdate);
  return () => socket.close();
}
