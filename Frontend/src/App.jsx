import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ParkingProvider } from './context/ParkingContext';
import { LocationProvider } from './context/LocationContext';
import { AdminProvider } from './context/AdminContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import AdminRoute from './components/routes/AdminRoute';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './components/layout/AdminLayout';
import LoadingState from './components/LoadingState';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ParkingMap from './pages/ParkingMap';
import BookingFlow from './pages/BookingFlow';
import MyBookings from './pages/MyBookings';
import ParkingHistory from './pages/ParkingHistory';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminParkingMonitor from './pages/admin/AdminParkingMonitor';
import AdminUsers from './pages/admin/AdminUsers';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSessions from './pages/admin/AdminSessions';
import AdminRevenue from './pages/admin/AdminRevenue';
import AdminIot from './pages/admin/AdminIot';
import AdminSlots from './pages/admin/AdminSlots';

// Sends a logged-in user to the right home page for their role; anyone
// else to /login. This is the only thing "/" ever does.
function RoleHome() {
  const { user, checkingSession } = useAuth();
  if (checkingSession) return <LoadingState label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleHome />} />

      {/* ---- User area ---- */}
      <Route
        element={
          <ProtectedRoute>
            <LocationProvider>
              <ParkingProvider>
                <AppLayout />
              </ParkingProvider>
            </LocationProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/parking" element={<ParkingMap />} />
        <Route path="/book" element={<BookingFlow />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/history" element={<ParkingHistory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      {/* ---- Admin area (visually and structurally separate) ---- */}
      <Route
        element={
          <AdminRoute>
            <AdminProvider>
              <AdminLayout />
            </AdminProvider>
          </AdminRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/parking" element={<AdminParkingMonitor />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/sessions" element={<AdminSessions />} />
        <Route path="/admin/revenue" element={<AdminRevenue />} />
        <Route path="/admin/iot" element={<AdminIot />} />
        <Route path="/admin/slots" element={<AdminSlots />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
