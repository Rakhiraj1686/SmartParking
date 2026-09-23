import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getParkingSlots,
  getBookings,
  getNotifications,
  getParkingHistory,
  createBooking as createBookingService,
  cancelBooking as cancelBookingService,
  markNotificationsRead as markNotificationsReadService,
  subscribeToLiveUpdates,
} from '../services/parkingService';
import { PARKING_AREA } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ParkingContext = createContext(null);

export function ParkingProvider({ children }) {
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const requests = [getParkingSlots()];
      if (user) {
        requests.push(getBookings(), getParkingHistory(), getNotifications());
      }
      const [s, b, h, n] = await Promise.all(requests);
      setSlots(s);
      if (user) {
        setBookings(b || []);
        setHistory(h || []);
        setNotifications(n || []);
      }
    } catch (err) {
      pushToast(err.message || 'Failed to load parking data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, pushToast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Real-time updates pushed by the backend (driven by the Arduino's
  // POST /api/iot/status, or by other users creating/cancelling bookings).
  useEffect(() => {
    const unsubscribe = subscribeToLiveUpdates({
      onStatus: () => {
        getParkingSlots().then(setSlots).catch(() => {});
      },
      onBookingCreated: () => {
        if (user) {
          getBookings().then(setBookings).catch(() => {});
          getNotifications().then(setNotifications).catch(() => {});
        }
      },
      onBookingCancelled: () => {
        if (user) {
          getBookings().then(setBookings).catch(() => {});
          getNotifications().then(setNotifications).catch(() => {});
        }
      },
      onParkingFull: () => pushToast('Parking is now full.', 'error'),
      onParkingAvailable: () => pushToast('A parking space just opened up.', 'info'),
    });
    return unsubscribe;
  }, [user, pushToast]);

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
    if (!user) return;
    const n = await markNotificationsReadService();
    setNotifications(n);
  }, [user]);

  const profile = user
    ? {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        vehicleNumber: user.vehicleNumber || '',
        vehicleType: user.vehicleType || 'Car',
        preferences: { preferredZone: 'A', autoExtend: false, notifyBeforeExpiry: true },
      }
    : { name: '', email: '', phone: '', vehicleNumber: '', vehicleType: 'Car', preferences: {} };

  const value = {
    slots,
    bookings,
    history,
    notifications,
    loading,
    bookSlot,
    cancelBooking,
    markAllRead,
    parkingArea: PARKING_AREA,
    profile,
    refresh: loadAll,
  };

  return <ParkingContext.Provider value={value}>{children}</ParkingContext.Provider>;
}

export function useParking() {
  const ctx = useContext(ParkingContext);
  if (!ctx) throw new Error('useParking must be used within a ParkingProvider');
  return ctx;
}
