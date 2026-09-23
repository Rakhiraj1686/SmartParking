import { useEffect } from 'react';
import { Radio } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

function timeAgo(dateStr) {
  if (!dateStr) return 'never';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function AdminIot() {
  const { iotStatus, loading, refreshIot } = useAdmin();

  useEffect(() => {
    refreshIot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !iotStatus) return <LoadingState label="Loading IoT status…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">IoT Monitoring</h1>
        <p className="text-sm text-ink-soft mt-0.5">
          Live feed from the Arduino gateway. Updates automatically via Socket.IO.
        </p>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold flex items-center gap-2">
            <Radio size={16} className={iotStatus.online ? 'text-available' : 'text-occupied'} />
            Arduino
          </p>
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              iotStatus.online ? 'bg-available-soft text-available' : 'bg-occupied-soft text-occupied'
            }`}
          >
            {iotStatus.online ? '🟢 Online' : '🔴 Offline'}
          </span>
        </div>
        <p className="text-xs text-ink-soft">Last update: {timeAgo(iotStatus.lastArduinoUpdate)}</p>
        <p className="text-sm">
          Current occupancy:{' '}
          <span className="font-semibold">
            {iotStatus.occupiedSlots} / {iotStatus.totalCapacity}
          </span>{' '}
          · Available: <span className="font-semibold">{iotStatus.availableSlots}</span>
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Recent sensor updates</h2>
        {!iotStatus.recentLogs || iotStatus.recentLogs.length === 0 ? (
          <EmptyState title="No updates yet" description="Recent Arduino status pushes will appear here." />
        ) : (
          <div className="rounded-2xl border border-line bg-surface divide-y divide-line">
            {iotStatus.recentLogs.map((log) => (
              <div key={log._id} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <span className="text-ink-soft font-mono-slot text-xs">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
                <span>{log.message}</span>
                <span className="text-ink-soft text-xs">
                  {log.occupiedSlots}/{log.totalSlots}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
