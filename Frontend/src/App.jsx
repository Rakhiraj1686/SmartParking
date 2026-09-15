import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ParkingProvider } from './context/ParkingContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ParkingMap from './pages/ParkingMap';
import BookingFlow from './pages/BookingFlow';
import MyBookings from './pages/MyBookings';
import ParkingHistory from './pages/ParkingHistory';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

function App() {
  return (
    <ParkingProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parking" element={<ParkingMap />} />
            <Route path="/book" element={<BookingFlow />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/history" element={<ParkingHistory />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ParkingProvider>
  );
}

export default App;
