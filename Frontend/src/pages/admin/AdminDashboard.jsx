import { useEffect } from 'react';
import { Car, CheckCircle2, Clock, IndianRupee, Lock, ParkingSquare } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import StatCard from '../../components/StatCard';

export default function AdminDashboard() {
  const { dashboard, loading, refreshDashboard } = useAdmin();

  useEffect(() => {
    refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !dashboard) return <LoadingState label="Loading admin dashboard…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Live figures from the backend — nothing on this page is hardcoded.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Capacity" value={dashboard.totalCapacity} icon={ParkingSquare} />
        <StatCard label="Occupied" value={dashboard.currentOccupancy} tone="occupied" icon={Car} />
        <StatCard label="Available" value={dashboard.availableCapacity} tone="available" icon={CheckCircle2} />
        <StatCard label="Reserved" value={dashboard.reservedCapacity} tone="reserved" icon={Lock} />
        <StatCard label="Active Sessions" value={dashboard.activeSessions} icon={Clock} />
        <StatCard label="Today's Bookings" value={dashboard.todaysBookings} icon={Car} />
        <StatCard label="Today's Revenue" value={`₹${dashboard.todaysRevenue}`} icon={IndianRupee} />
        <StatCard label="Completed Sessions" value={dashboard.completedSessions} icon={CheckCircle2} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-4">
        <p className="text-sm text-ink-soft">
          Total lifetime revenue from completed sessions:{' '}
          <span className="font-semibold text-ink">₹{dashboard.revenue}</span>
        </p>
      </div>
    </div>
  );
}
