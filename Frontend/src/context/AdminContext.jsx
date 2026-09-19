import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getAdminDashboard,
  getUsers,
  getAllBookings,
  getAllSessions,
  getRevenue,
  getIotStatus,
  getRawSlots,
  updateUserRole as updateUserRoleService,
  deleteUser as deleteUserService,
  createSlot as createSlotService,
  updateSlot as updateSlotService,
  deleteSlot as deleteSlotService,
} from '../services/adminService';
import { subscribeToLiveUpdates, subscribeToAdminUpdates } from '../services/parkingService';
import { useToast } from './ToastContext';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const { pushToast } = useToast();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [iotStatus, setIotStatus] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  const refreshDashboard = useCallback(async () => {
    try {
      setDashboard(await getAdminDashboard());
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  const refreshUsers = useCallback(async () => {
    try {
      setUsers(await getUsers());
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  const refreshBookings = useCallback(async (params) => {
    try {
      setBookings(await getAllBookings(params));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  const refreshSessions = useCallback(async (params) => {
    try {
      setSessions(await getAllSessions(params));
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  const refreshRevenue = useCallback(async () => {
    try {
      setRevenue(await getRevenue());
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  const refreshIot = useCallback(async () => {
    try {
      setIotStatus(await getIotStatus());
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  const refreshSlots = useCallback(async () => {
    try {
      // Raw (unmapped) slot records — admin manages them directly, with
      // real backend status (no visual "occupied" overlay).
      setSlots(await getRawSlots());
    } catch (err) {
      pushToast(err.message, 'error');
    }
  }, [pushToast]);

  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      await Promise.all([refreshDashboard(), refreshIot()]);
      setLoading(false);
    }
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live updates: any change in aggregate parking status refreshes the
  // dashboard overview cards; admin-only IoT log stream keeps the IoT
  // monitor page current without polling.
  useEffect(() => {
    const unsubStatus = subscribeToLiveUpdates({ onStatus: () => refreshDashboard() });
    const unsubAdmin = subscribeToAdminUpdates((payload) => setIotStatus((prev) => ({ ...prev, ...payload })));
    return () => {
      unsubStatus();
      unsubAdmin();
    };
  }, [refreshDashboard]);

  const changeUserRole = useCallback(async (id, role) => {
    try {
      await updateUserRoleService(id, role);
      pushToast('User role updated.', 'success');
      await refreshUsers();
      return { success: true };
    } catch (err) {
      pushToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [pushToast, refreshUsers]);

  const removeUser = useCallback(async (id) => {
    try {
      await deleteUserService(id);
      pushToast('User deleted.', 'success');
      await refreshUsers();
      return { success: true };
    } catch (err) {
      pushToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [pushToast, refreshUsers]);

  const addSlot = useCallback(async (payload) => {
    try {
      await createSlotService(payload);
      pushToast('Parking slot created.', 'success');
      await refreshSlots();
      return { success: true };
    } catch (err) {
      pushToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [pushToast, refreshSlots]);

  const editSlot = useCallback(async (id, payload) => {
    try {
      await updateSlotService(id, payload);
      pushToast('Parking slot updated.', 'success');
      await refreshSlots();
      return { success: true };
    } catch (err) {
      pushToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [pushToast, refreshSlots]);

  const removeSlot = useCallback(async (id) => {
    try {
      await deleteSlotService(id);
      pushToast('Parking slot deleted.', 'success');
      await refreshSlots();
      return { success: true };
    } catch (err) {
      pushToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  }, [pushToast, refreshSlots]);

  const value = {
    dashboard,
    users,
    bookings,
    sessions,
    revenue,
    iotStatus,
    slots,
    loading,
    refreshDashboard,
    refreshUsers,
    refreshBookings,
    refreshSessions,
    refreshRevenue,
    refreshIot,
    refreshSlots,
    changeUserRole,
    removeUser,
    addSlot,
    editSlot,
    removeSlot,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}
