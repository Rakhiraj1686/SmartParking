import { History } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useParking } from '../context/ParkingContext';
import { formatDateLong, currency } from '../utils/format';

const STATUS_STYLE = {
  Completed: 'bg-available-soft text-available',
  Cancelled: 'bg-occupied-soft text-occupied',
};

export default function ParkingHistory() {
  const { history, loading } = useParking();

  if (loading) return <LoadingState label="Loading parking history…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold mb-1">Parking History</h1>
        <p className="text-sm text-ink-soft">A record of every session at this parking area.</p>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={History}
          title="No parking history yet"
          description="Once you complete a parking session, it will appear here."
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block rounded-2xl border border-line bg-surface overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-soft border-b border-line">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Slot</th>
                  <th className="px-4 py-3 font-medium">Entry</th>
                  <th className="px-4 py-3 font-medium">Exit</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-b border-line last:border-0 hover:bg-mist/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDateLong(h.date)}</td>
                    <td className="px-4 py-3 font-mono-slot font-medium">{h.slotId}</td>
                    <td className="px-4 py-3 text-ink-soft">{h.entryTime}</td>
                    <td className="px-4 py-3 text-ink-soft">{h.exitTime}</td>
                    <td className="px-4 py-3 text-ink-soft">{h.duration}</td>
                    <td className="px-4 py-3 font-medium">{currency(h.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[h.status] ?? ''}`}>
                        {h.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {history.map((h) => (
              <div key={h.id} className="rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-display font-semibold font-mono-slot">{h.slotId}</span>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLE[h.status] ?? ''}`}>
                    {h.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm text-ink-soft">
                  <span>{formatDateLong(h.date)}</span>
                  <span className="text-right">{currency(h.amount)}</span>
                  <span>{h.entryTime} – {h.exitTime}</span>
                  <span className="text-right">{h.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
