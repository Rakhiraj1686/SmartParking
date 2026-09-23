import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import LoadingState from '../../components/LoadingState';
import EmptyState from '../../components/EmptyState';

const STATUS_STYLE = {
  upcoming: 'bg-selected-soft text-selected',
  active: 'bg-reserved-soft text-reserved',
  completed: 'bg-available-soft text-available',
  cancelled: 'bg-occupied-soft text-occupied',
};

const FILTERS = ['all', 'upcoming', 'active', 'completed', 'cancelled'];

export default function AdminBookings() {
  const { bookings, loading, refreshBookings } = useAdmin();
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    refreshBookings(status === 'all' ? {} : { status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const filtered = search
    ? bookings.filter(
        (b) =>
          b.bookingId.toLowerCase().includes(search.toLowerCase()) ||
          b.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
          (b.userId?.email || '').toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">Bookings Management</h1>
        <p className="text-sm text-ink-soft mt-0.5">All parking-space reservations across every user.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 flex-wrap">
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
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Booking ID, email, vehicle…"
            className="input pl-8 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading bookings…" />
      ) : filtered.length === 0 ? (
        <EmptyState title="No bookings found" description="Try a different filter or search term." />
      ) : (
        <div className="rounded-2xl border border-line bg-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-xs text-ink-soft border-b border-line">
                <th className="px-4 py-3 font-medium">Booking ID</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Space</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono-slot text-xs">{b.bookingId}</td>
                  <td className="px-4 py-3 text-ink-soft">{b.userId?.email || '—'}</td>
                  <td className="px-4 py-3">{b.vehicleNumber}</td>
                  <td className="px-4 py-3">Space reserved ({b.slotNumber})</td>
                  <td className="px-4 py-3 text-ink-soft">{b.bookingDate}</td>
                  <td className="px-4 py-3 text-ink-soft">
                    {b.startTime}–{b.endTime}
                  </td>
                  <td className="px-4 py-3">₹{b.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[b.status] ?? STATUS_STYLE.upcoming}`}>
                      {b.status}
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
