import { useEffect } from 'react';
import { Car, CheckCircle2, Lock, ParkingSquare, Radio } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import StatCard from '../../components/StatCard';

function timeAgo(dateStr) {
  if (!dateStr) return 'never';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds} seconds ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

export default function AdminParkingMonitor() {
  const { dashboard, iotStatus, loading, refreshDashboard, refreshIot } = useAdmin();

  useEffect(() => {
    refreshDashboard();
    refreshIot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !dashboard) return <LoadingState label="Loading parking monitor…" />;

  const occupancyPct = dashboard.totalCapacity
    ? Math.round((dashboard.currentOccupancy / dashboard.totalCapacity) * 100)
    : 0;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Parking Monitor</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Real-time aggregate occupancy from the Arduino (total count only — see note below).
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Capacity" value={dashboard.totalCapacity} icon={ParkingSquare} />
        <StatCard label="Occupied" value={dashboard.currentOccupancy} tone="occupied" icon={Car} />
        <StatCard label="Available" value={dashboard.availableCapacity} tone="available" icon={CheckCircle2} />
        <StatCard label="Reserved" value={dashboard.reservedCapacity} tone="reserved" icon={Lock} />
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Radio size={16} className={iotStatus?.online ? 'text-available' : 'text-occupied'} />
            Arduino Status
          </p>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              iotStatus?.online ? 'bg-available-soft text-available' : 'bg-occupied-soft text-occupied'
            }`}
          >
            {iotStatus?.online ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        <p className="text-xs text-ink-soft">Last update: {timeAgo(iotStatus?.lastArduinoUpdate)}</p>

        <div className="h-2.5 rounded-full bg-mist overflow-hidden">
          <div className="h-full bg-brand transition-all" style={{ width: `${occupancyPct}%` }} />
        </div>
        <p className="text-xs text-ink-soft">{occupancyPct}% occupancy</p>
      </div>

      <div className="rounded-2xl border border-line bg-mist/40 p-4">
        <p className="text-xs text-ink-soft leading-relaxed">
          <strong>Note:</strong> the current Arduino hardware (2 IR sensors) only reports a total occupied count.
          It cannot identify which individual bay (P01–P04) is occupied — that requires a future per-slot sensor
          upgrade. See Admin → Parking Slots for the logical slot records used for bookings today.
        </p>
      </div>
    </div>
  );
}
