import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  getParkingSlots,
  getBookings,
  getNotifications,
  getParkingHistory,
  createBooking as createBookingService,
  cancelBooking as cancelBookingService,
  markNotificationsRead as markNotificationsReadService,
  subscribeToParkingUpdates,
} from '../services/parkingService';
import { PARKING_AREA, userProfile } from '../data/mockData';

const ParkingContext = createContext(null);

let toastId = 0;

export function ParkingProvider({ children }) {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  const driftRef = useRef(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [s, b, h, n] = await Promise.all([
      getParkingSlots(),
      getBookings(),
      getParkingHistory(),
      getNotifications(),
    ]);
    setSlots(s);
    setBookings(b);
    setHistory(h);
    setNotifications(n);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    driftRef.current = subscribeToParkingUpdates(() => loadAll());
    return () => driftRef.current();
  }, [loadAll]);

  const pushToast = useCallback((message, variant = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const bookSlot = useCallback(async (payload) => {
    const result = await createBookingService(payload);
    if (result.success) {
      const [s, b, n] = await Promise.all([getParkingSlots(), getBookings(), getNotifications()]);
      setSlots(s);
      setBookings(b);
      setNotifications(n);
      pushToast(`Slot ${payload.slotId} booked successfully.`, 'success');
    } else {
      pushToast(result.message || 'Booking failed.', 'error');
    }
    return result;
  }, [pushToast]);

  const cancelBooking = useCallback(async (bookingId) => {
    const result = await cancelBookingService(bookingId);
    if (result.success) {
      const [s, b, n] = await Promise.all([getParkingSlots(), getBookings(), getNotifications()]);
      setSlots(s);
      setBookings(b);
      setNotifications(n);
      pushToast(`Booking ${bookingId} cancelled.`, 'info');
    } else {
      pushToast(result.message || 'Could not cancel booking.', 'error');
    }
    return result;
  }, [pushToast]);

  const markAllRead = useCallback(async () => {
    const n = await markNotificationsReadService();
    setNotifications(n);
  }, []);

  const value = {
    slots,
    bookings,
    history,
    notifications,
    loading,
    toasts,
    pushToast,
    dismissToast,
    bookSlot,
    cancelBooking,
    markAllRead,
    parkingArea: PARKING_AREA,
    profile: userProfile,
    refresh: loadAll,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error('useParking must be used within a ParkingProvider');
  return ctx;
}
