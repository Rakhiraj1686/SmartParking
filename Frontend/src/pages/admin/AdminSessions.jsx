import { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

const FILTERS = ['all', 'active', 'completed'];

function formatDuration(minutes) {
  if (!minutes) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AdminSessions() {
  const { sessions, loading, refreshSessions } = useAdmin();
  const [status, setStatus] = useState('all');

  useEffect(() => {
    refreshSessions(status === 'all' ? {} : { status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Parking Sessions</h1>
        <p className="text-sm text-ink-soft mt-0.5">Real entry/exit activity, independent of bookings.</p>
      </div>

      <div className="flex gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setStatus(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors ${
              status === f ? 'bg-brand text-white' : 'bg-mist text-ink-soft'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading sessions…" />
      ) : sessions.length === 0 ? (
        <EmptyState title="No sessions found" description="Vehicle entry/exit sessions will appear here." />
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-ink-soft border-b border-line">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Entry</th>
                <th className="px-4 py-3 font-medium">Exit</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink-soft">{s.userId?.email || '—'}</td>
                  <td className="px-4 py-3">{s.vehicleNumber}</td>
                  <td className="px-4 py-3 text-ink-soft">{new Date(s.entryTime).toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink-soft">{s.exitTime ? new Date(s.exitTime).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">{formatDuration(s.durationMinutes)}</td>
                  <td className="px-4 py-3">{s.amount ? `₹${s.amount}` : '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                        s.status === 'active' ? 'bg-reserved-soft text-reserved' : 'bg-available-soft text-available'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
