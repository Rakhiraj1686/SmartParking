import { useEffect } from 'react';
import { CheckCircle2, IndianRupee, ListChecks } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import StatCard from '../../components/StatCard';

export default function AdminRevenue() {
  const { revenue, loading, refreshRevenue } = useAdmin();

  useEffect(() => {
    refreshRevenue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !revenue) return <LoadingState label="Loading revenue…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Revenue</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Calculated from completed parking sessions — nothing here is hardcoded.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Today's Revenue" value={`₹${revenue.todaysRevenue}`} icon={IndianRupee} tone="available" />
        <StatCard label="Total Revenue" value={`₹${revenue.totalRevenue}`} icon={IndianRupee} />
        <StatCard label="Completed Sessions" value={revenue.completedSessions} icon={CheckCircle2} />
        <StatCard label="Completed Bookings" value={revenue.completedBookings} icon={ListChecks} />
      </div>
    </div>
  );
}
