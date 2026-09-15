import { useMemo, useState } from 'react';
import { CalendarClock, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookingCard from '../components/BookingCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import { useParking } from '../context/ParkingContext';
import { formatDateLong, currency } from '../utils/format';

export default function MyBookings() {
  const { bookings, loading, cancelBooking } = useParking();
  const [viewing, setViewing] = useState(null);
  const [tab, setTab] = useState('upcoming');

  const upcoming = useMemo(() => bookings.filter((b) => b.status === 'upcoming'), [bookings]);
  const past = useMemo(() => bookings.filter((b) => b.status !== 'upcoming'), [bookings]);
  const list = tab === 'upcoming' ? upcoming : past;

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold mb-1">My Bookings</h1>
        <p className="text-sm text-ink-soft">Track upcoming reservations and review past visits.</p>
      </div>

      <div className="inline-flex rounded-xl bg-mist p-1">
        {[
          ['upcoming', `Upcoming (${upcoming.length})`],
          ['past', `Past (${past.length})`],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-surface text-ink shadow-sm' : 'text-ink-soft'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title={tab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings yet'}
          description={tab === 'upcoming' ? 'Reserve a slot ahead of time so it is ready when you arrive.' : 'Your completed and cancelled bookings will show up here.'}
          action={tab === 'upcoming' && (
            <Link to="/book" className="inline-block rounded-xl bg-brand text-white text-sm font-semibold px-4 py-2.5">
              Book a Slot
            </Link>
          )}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onViewDetails={setViewing}
              onCancel={(booking) => cancelBooking(booking.id)}
            />
          ))}
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <button className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={() => setViewing(null)} />
          <div className="relative rise-in w-full sm:max-w-sm bg-surface rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl">
            <button
              onClick={() => setViewing(null)}
              className="absolute right-4 top-4 h-8 w-8 rounded-full bg-mist flex items-center justify-center text-ink-soft"
            >
              <X size={16} />
            </button>
            <p className="text-xs text-ink-soft mb-1">{viewing.id}</p>
            <h3 className="font-display text-xl font-semibold font-mono-slot mb-4">{viewing.slotId}</h3>
            <dl className="space-y-2.5 text-sm">
              {[
                ['Date', formatDateLong(viewing.date)],
                ['Time', `${viewing.startTime} – ${viewing.endTime}`],
                ['Vehicle', `${viewing.vehicleType} · ${viewing.vehicleNumber}`],
                ['Amount', currency(viewing.amount)],
                ['Status', viewing.status],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-ink-soft">{label}</dt>
                  <dd className="font-medium capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
